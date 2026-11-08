import 'package:flutter/material.dart';
import '../../models/courier_models.dart';
import '../../services/courier_repository.dart';
import '../../services/api_service.dart';
import '../../state/auth_service.dart';
import '../../theme/mimoo_theme.dart';

class DashboardTab extends StatefulWidget {
  const DashboardTab({super.key});

  @override
  State<DashboardTab> createState() => _DashboardTabState();
}

class _DashboardTabState extends State<DashboardTab> {
  DashboardStats? _stats;
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
      if (!mounted) return;
      setState(() {
        _stats = s;
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
