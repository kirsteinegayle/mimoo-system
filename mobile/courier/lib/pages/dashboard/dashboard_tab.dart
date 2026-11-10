import 'package:flutter/material.dart';
import '../../models/courier_models.dart';
import '../../services/courier_repository.dart';
import '../../services/api_service.dart';
import '../../state/auth_service.dart';
import '../../theme/mimoo_theme.dart';
import '../trips/trip_detail_page.dart';

class DashboardTab extends StatefulWidget {
  const DashboardTab({super.key});

  @override
  State<DashboardTab> createState() => _DashboardTabState();
}

class _DashboardTabState extends State<DashboardTab> {
  DashboardStats? _stats;
  List<TimelineEvent> _timeline = [];
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
    try {
      final s = await CourierRepository.instance.dashboard();
      List<TimelineEvent> timeline = [];
      try {
        timeline = await CourierRepository.instance.timeline(perPage: 8);
      } catch (_) {}
      if (!mounted) return;
      setState(() {
        _stats = s;
        _timeline = timeline;
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
            _ErrorState(message: _error!, onRetry: _load),
          ] else if (_stats != null) ...[
            _StatsGrid(stats: _stats!),
            const SizedBox(height: 16),
            _DispatchTimeline(events: _timeline),
          ],
        ],
      ),
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

    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: 10,
      mainAxisSpacing: 10,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      childAspectRatio: 1.4,
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
        Text(label, style: pjs(size: 11, color: kSubtext)),
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

class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.message, required this.onRetry});
  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          const Icon(Icons.wifi_off_outlined, size: 48, color: kSubtext),
          const SizedBox(height: 12),
          Text(message,
              style: pjs(size: 13, color: kSubtext),
              textAlign: TextAlign.center),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: onRetry,
            style: FilledButton.styleFrom(backgroundColor: kPrimary),
            child: Text('Try again',
                style: pjs(
                    size: 13, weight: FontWeight.w700, color: Colors.white)),
          ),
        ]),
      ),
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
              style: pjs(size: 10, color: kSubtext)),
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
                            size: 10,
                            weight: FontWeight.w600,
                            color: kSubtext),
                      ),
                    ]),
                    if (event.place.isNotEmpty)
                      Text(event.place,
                          style:
                              pjs(size: 11, color: kSubtext, height: 1.3)),
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
                            style: pjs(size: 10, color: kSubtext)),
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
