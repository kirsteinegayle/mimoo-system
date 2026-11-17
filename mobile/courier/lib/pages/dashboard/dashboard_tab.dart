import 'package:flutter/material.dart';
import '../../config/features.dart';
import '../../models/courier_models.dart';
import '../../services/courier_repository.dart';
import '../../services/api_service.dart';
import '../../state/auth_service.dart';
import '../../theme/mimoo_theme.dart';
import '../../widgets/courier_shared.dart';
import '../messages/messages_page.dart';
import '../riders/rider_management_page.dart';
import '../trips/trip_detail_page.dart';
import 'recent_activity_page.dart';

/// Bottom-nav indexes in HomePage (used by Quick Actions).
class CourierTabs {
  CourierTabs._();
  static const shipments = 1;
  static const scan = 2;
  static const assign = 3;
  static const delivery = 4;
}

class DashboardTab extends StatefulWidget {
  const DashboardTab({super.key, this.onOpenTab, this.onOpenPage});

  /// Switch the HomePage bottom tab (see [CourierTabs]).
  final ValueChanged<int>? onOpenTab;

  /// Push a full page (Riders, Messages, Recent Activity).
  final ValueChanged<Widget>? onOpenPage;

  @override
  State<DashboardTab> createState() => _DashboardTabState();
}

class _DashboardTabState extends State<DashboardTab> {
  DashboardStats? _stats;
  List<TimelineEvent> _timeline = [];
  List<ActivityItem> _activity = [];
  String? _activityError;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    _activityError = null;
    try {
      // Activity failing must not hide the stats: load it separately.
      final activityF = CourierRepository.instance
          .activity(limit: 6)
          .then<List<ActivityItem>?>((v) => v)
          .catchError((Object e) {
        _activityError = ApiService.friendlyError(e);
        return null;
      });
      final s = await CourierRepository.instance.dashboard();
      List<TimelineEvent> timeline = [];
      if (CourierFeatures.timeline) {
        try {
          timeline = await CourierRepository.instance.timeline(perPage: 8);
        } catch (_) {}
      }
      final activity = await activityF;
      if (!mounted) return;
      setState(() {
        _stats = s;
        _timeline = timeline;
        _activity = activity ?? const [];
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = ApiService.friendlyError(e);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = AuthService.instance;

    return RefreshIndicator(
      color: kPrimary,
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [kPrimary, kSecondary],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Good day,', style: pjs(size: 13, color: Colors.white70)),
              const SizedBox(height: 2),
              Text(auth.companyName ?? auth.courierName ?? 'Courier',
                  style: pjs(
                      size: 20, weight: FontWeight.w800, color: Colors.white)),
              const SizedBox(height: 2),
              Text('Here\'s your operations overview.',
                  style: pjs(size: 12, color: Colors.white60)),
            ]),
          ),
          const SizedBox(height: 16),

          if (_loading) ...[
            const _SkeletonGrid(),
          ] else if (_error != null) ...[
            CourierErrorState(message: _error!, onRetry: _load),
          ] else if (_stats != null) ...[
            _QuickActions(
              stats: _stats!,
              onOpenTab: widget.onOpenTab,
              onOpenPage: widget.onOpenPage,
            ),
            const SizedBox(height: 16),
            _StatsGrid(stats: _stats!),
            const SizedBox(height: 16),
            _RecentActivity(
              items: _activity,
              error: _activityError,
              onRetry: _load,
              onSeeAll: widget.onOpenPage == null
                  ? null
                  : () => widget.onOpenPage!(const RecentActivityPage()),
            ),
            if (CourierFeatures.timeline) ...[
              const SizedBox(height: 16),
              _DispatchTimeline(events: _timeline),
            ],
          ],
        ],
      ),
    );
  }
}

// ── Quick Actions ─────────────────────────────────────────────────────────────

class _QuickActions extends StatelessWidget {
  const _QuickActions({required this.stats, this.onOpenTab, this.onOpenPage});
  final DashboardStats stats;
  final ValueChanged<int>? onOpenTab;
  final ValueChanged<Widget>? onOpenPage;

  @override
  Widget build(BuildContext context) {
    // (icon, label, badge, colour, action)
    final actions = <(IconData, String, String?, Color, VoidCallback?)>[
      (
        Icons.inbox_outlined,
        'Accept Shipments',
        stats.incomingShipments > 0 ? '${stats.incomingShipments}' : null,
        kSecondary,
        onOpenTab == null ? null : () => onOpenTab!(CourierTabs.shipments),
      ),
      (
        Icons.qr_code_scanner,
        'Scan Parcel',
        null,
        kPrimary,
        onOpenTab == null ? null : () => onOpenTab!(CourierTabs.scan),
      ),
      (
        Icons.assignment_ind_outlined,
        'New Assign',
        stats.awaitingRider > 0 ? '${stats.awaitingRider}' : null,
        kFlash,
        onOpenTab == null ? null : () => onOpenTab!(CourierTabs.assign),
      ),
      (
        Icons.route_outlined,
        'Deliveries',
        stats.deliveriesWaiting > 0 ? '${stats.deliveriesWaiting}' : null,
        kGreen,
        onOpenTab == null ? null : () => onOpenTab!(CourierTabs.delivery),
      ),
      if (CourierFeatures.riderManagement)
        (
          Icons.two_wheeler,
          'Riders',
          '${stats.onlineRiders} online',
          Colors.orange,
          onOpenPage == null
              ? null
              : () => onOpenPage!(const RiderManagementPage()),
        ),
      if (CourierFeatures.messages)
        (
          Icons.chat_bubble_outline,
          'Messages',
          null,
          kSecondary,
          onOpenPage == null ? null : () => onOpenPage!(const MessagesPage()),
        ),
    ];

    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Quick Actions', style: pjs(size: 15, weight: FontWeight.w800)),
      const SizedBox(height: 10),
      GridView(
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 3,
          crossAxisSpacing: 10,
          mainAxisSpacing: 10,
          mainAxisExtent: _gridExtent(context, 104),
        ),
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        children: actions
            .map((a) => _QuickActionTile(
                icon: a.$1, label: a.$2, badge: a.$3, color: a.$4, onTap: a.$5))
            .toList(),
      ),
    ]);
  }
}

class _QuickActionTile extends StatelessWidget {
  const _QuickActionTile({
    required this.icon,
    required this.label,
    required this.color,
    this.badge,
    this.onTap,
  });
  final IconData icon;
  final String label;
  final String? badge;
  final Color color;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: kCard,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: kBorder),
          ),
          child: Stack(children: [
            Center(
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(icon, color: color, size: 22),
                ),
                const SizedBox(height: 6),
                Text(label,
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: pjs(size: 11, weight: FontWeight.w700)),
              ]),
            ),
            if (badge != null)
              Positioned(
                top: 0,
                right: 0,
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                  decoration: BoxDecoration(
                    color: badge!.contains('online') ? kGreen : kFlash,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(badge!,
                      style: pjs(
                          size: 9,
                          weight: FontWeight.w800,
                          color: Colors.white)),
                ),
              ),
          ]),
        ),
      ),
    );
  }
}

// ── Recent Activity ───────────────────────────────────────────────────────────

class _RecentActivity extends StatelessWidget {
  const _RecentActivity({
    required this.items,
    required this.onRetry,
    this.error,
    this.onSeeAll,
  });
  final List<ActivityItem> items;
  final String? error;
  final VoidCallback onRetry;
  final VoidCallback? onSeeAll;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(14, 12, 14, 6),
      decoration: BoxDecoration(
        color: kCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorder),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          const Icon(Icons.history, size: 18, color: kPrimary),
          const SizedBox(width: 6),
          Expanded(
            child: Text('Recent Activity',
                style: pjs(size: 15, weight: FontWeight.w800)),
          ),
          if (onSeeAll != null && items.isNotEmpty)
            TextButton(
              onPressed: onSeeAll,
              child: Text('See all',
                  style: pjs(
                      size: 12, weight: FontWeight.w700, color: kSecondary)),
            ),
        ]),
        if (error != null)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 10),
            child: Row(children: [
              Expanded(
                  child: Text('Could not load activity. $error',
                      style: pjs(size: 12, color: kSubtext))),
              TextButton(onPressed: onRetry, child: const Text('Retry')),
            ]),
          )
        else if (items.isEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 16),
            child: Text(
                'No activity yet. Accepted shipments, scans and deliveries will show up here.',
                style: pjs(size: 12, color: kSubtext)),
          )
        else
          for (var i = 0; i < items.length; i++)
            ActivityRow(item: items[i], showDivider: i < items.length - 1),
      ]),
    );
  }
}

class _StatsGrid extends StatelessWidget {
  const _StatsGrid({required this.stats});
  final DashboardStats stats;

  @override
  Widget build(BuildContext context) {
    final tiles = [
      (Icons.inbox_outlined, kSecondary, 'Incoming', stats.incomingShipments),
      (
        Icons.schedule_outlined,
        kPrimary,
        'Pending Pickup',
        stats.pendingPickups
      ),
      (Icons.today_outlined, kGreen, 'Today\'s Sched', stats.scheduledToday),
      (
        Icons.check_circle_outline,
        kGreen,
        'Picked Up Today',
        stats.pickedUpToday
      ),
      (Icons.warning_amber_rounded, kFlash, 'Failed', stats.failed),
      (
        Icons.timer_outlined,
        Colors.orange,
        'Expiring Soon',
        stats.expiringSoon
      ),
    ];

    return GridView(
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        mainAxisExtent: _gridExtent(context, 124),
      ),
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      children: tiles
          .map((t) => _StatCard(
                icon: t.$1,
                color: t.$2,
                label: t.$3,
                count: t.$4,
              ))
          .toList(),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard(
      {required this.icon,
      required this.color,
      required this.label,
      required this.count});
  final IconData icon;
  final Color color;
  final String label;
  final int count;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorder),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Icon(icon, color: color, size: 22),
        const Spacer(),
        Text('$count',
            style: pjs(size: 26, weight: FontWeight.w900, color: kText)),
        Text(label,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: pjs(size: 11, color: kSubtext)),
      ]),
    );
  }
}

class _SkeletonGrid extends StatelessWidget {
  const _SkeletonGrid();

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: 10,
      mainAxisSpacing: 10,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      childAspectRatio: 1.4,
      children: List.generate(
          6,
          (_) => Container(
                decoration: BoxDecoration(
                  color: kBorder,
                  borderRadius: BorderRadius.circular(14),
                ),
              )),
    );
  }
}

class _DispatchTimeline extends StatelessWidget {
  const _DispatchTimeline({required this.events});
  final List<TimelineEvent> events;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorder),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          const Icon(Icons.timeline, size: 18, color: kPrimary),
          const SizedBox(width: 7),
          Text('Dispatch Timeline',
              style: pjs(size: 14, weight: FontWeight.w800)),
          const Spacer(),
          Text('Latest ${events.length}',
              style: pjs(size: 11, color: kSubtext)),
        ]),
        const Divider(height: 16, color: kBorder),
        if (events.isEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 10),
            child: Text('No dispatch updates yet.',
                style: pjs(size: 12, color: kSubtext)),
          )
        else
          for (var i = 0; i < events.length; i++)
            _TimelineRow(
              event: events[i],
              isLast: i == events.length - 1,
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => TripDetailPage(id: events[i].tripId),
                ),
              ),
            ),
      ]),
    );
  }
}

class _TimelineRow extends StatelessWidget {
  const _TimelineRow({
    required this.event,
    required this.isLast,
    required this.onTap,
  });
  final TimelineEvent event;
  final bool isLast;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final color = event.isCurrent ? kSecondary : kPrimary;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.only(bottom: 2),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Column(children: [
            Container(
              width: 11,
              height: 11,
              margin: const EdgeInsets.only(top: 3),
              decoration: BoxDecoration(
                color: event.isCurrent ? color : kChip,
                shape: BoxShape.circle,
                border: Border.all(
                    color: event.isCurrent ? color : kBorder, width: 1.5),
              ),
            ),
            if (!isLast) Container(width: 2, height: 48, color: kBorder),
          ]),
          const SizedBox(width: 10),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(children: [
                      Expanded(
                        child: Text(
                          event.label,
                          style: pjs(
                            size: 12,
                            weight: event.isCurrent
                                ? FontWeight.w800
                                : FontWeight.w700,
                            color: event.isCurrent ? kSecondary : kText,
                          ),
                        ),
                      ),
                      Text(
                        event.isToday ? event.time : event.date,
                        style: pjs(
                            size: 10, weight: FontWeight.w600, color: kSubtext),
                      ),
                    ]),
                    if (event.place.isNotEmpty)
                      Text(event.place,
                          style: pjs(size: 11, color: kSubtext, height: 1.3)),
                    Row(children: [
                      if (event.tripCode != null)
                        Text(event.tripCode!,
                            style: pjs(
                                size: 10,
                                weight: FontWeight.w700,
                                color: kPrimary)),
                      if (event.waybillNumber != null) ...[
                        const SizedBox(width: 6),
                        Text('· ${event.waybillNumber}',
                            style: pjs(size: 11, color: kSubtext)),
                      ],
                      if (event.isCurrent) ...[
                        const Spacer(),
                        Text('CURRENT',
                            style: pjs(
                                size: 8,
                                weight: FontWeight.w900,
                                color: kSecondary)),
                      ],
                    ]),
                  ]),
            ),
          ),
          const Icon(Icons.chevron_right, size: 17, color: kSubtext),
        ]),
      ),
    );
  }
}

/// Tile height that grows with the user's font size, so labels never overflow on small phones.
double _gridExtent(BuildContext context, double base) =>
    base * MediaQuery.textScalerOf(context).scale(1).clamp(1.0, 2.0);
