import 'package:flutter/material.dart';

import '../../core/rider_status_controller.dart';
import '../../core/theme.dart';
import '../../mock/rider_mock.dart';
import '../../widgets/card_decor.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/job_widgets.dart';
import '../../widgets/motion.dart';
import '../../widgets/shell.dart' show toggleRiderStatus;
import '../location_permission_sheet.dart' show LocationOffBanner;
import 'job_actions.dart';

/// Home: greeting, 3 stats, the COD remit banner, ONE next-job card and a
/// link to other jobs. The full job list lives in Jobs.
class HomeScreen extends StatefulWidget {
  const HomeScreen(
      {super.key,
      required this.onOpenJob,
      required this.onOpenJobs,
      required this.onOpenWallet});

  final JobOpener onOpenJob;
  final VoidCallback onOpenJobs;
  final VoidCallback onOpenWallet;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  /// Skeleton is shown once per app session (MOCK loading).
  static bool _loadedOnce = false;
  late bool _loading = !_loadedOnce;

  @override
  void initState() {
    super.initState();
    if (_loading) {
      Future<void>.delayed(kHomeSkeletonDuration, () {
        _loadedOnce = true;
        if (mounted) setState(() => _loading = false);
      });
    }
  }

  String _subGreeting() {
    final h = mockNow().hour;
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }

  @override
  Widget build(BuildContext context) {
    final mock = RiderMock.instance;
    final status = RiderStatusScope.of(context);
    return ListenableBuilder(
      listenable: mock,
      builder: (context, _) {
        final c = MC.of(context);
        final next = mock.nextJob;
        final others = mock.activeCount - (next == null ? 0 : 1);
        final children = <Widget>[
          Text(_subGreeting(), style: MT.bodyMd.copyWith(color: c.muted)),
          const SizedBox(height: 2),
          Text('Hi, ${mock.profile.firstName} · ${mock.profile.hub}',
              style: MT.headlineLg, maxLines: 2),
          const SizedBox(height: MS.lg),
          if (!status.locationOn) ...[
            LocationOffBanner(
                onFix: () => toggleRiderStatus(context, status, true)),
            const SizedBox(height: MS.md),
          ],
          Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Expanded(
              child: _Stat(
                label: 'ACTIVE',
                value: mock.activeCount.toDouble(),
                format: (v) => '${v.round()}/$kMaxActiveJobs',
                icon: Icons.assignment_outlined,
                watermark: Icons.assignment_outlined,
                tone: mock.activeCount >= kMaxActiveJobs
                    ? _StatTone.warn
                    : _StatTone.purple,
                index: 0,
                onTap: widget.onOpenJobs,
              ),
            ),
            const SizedBox(width: MS.sm),
            Expanded(
              child: _Stat(
                label: 'COD HELD',
                value: mock.codHeld,
                format: pesoWhole,
                icon: Icons.payments_outlined,
                watermark: Icons.payments_rounded,
                tone: _StatTone.purple,
                index: 1,
                onTap: widget.onOpenWallet,
              ),
            ),
            const SizedBox(width: MS.sm),
            Expanded(
              child: _Stat(
                label: "TODAY'S EARNINGS",
                value: mock.earnedToday,
                format: pesoWhole,
                icon: Icons.trending_up,
                watermark: Icons.trending_up_rounded,
                tone: _StatTone.greenPurple,
                index: 2,
                onTap: widget.onOpenWallet,
              ),
            ),
          ]),
          if (mock.codHeld > 0) ...[
            const SizedBox(height: MS.md),
            _RemitBanner(onTap: widget.onOpenWallet),
          ],
          const SizedBox(height: MS.xl),
          Row(children: [
            Expanded(
                child: Text('NEXT JOB',
                    style: MT.badge.copyWith(color: c.muted))),
            if (others > 0)
              TextButton(
                onPressed: widget.onOpenJobs,
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  Text('Other jobs ($others)'),
                  const Icon(Icons.chevron_right, size: 18),
                ]),
              ),
          ]),
          if (next == null)
            MCard(
              child: EmptyState(
                icon: Icons.inventory_2_outlined,
                title: 'No assigned jobs',
                message: "You'll get a notification when the hub assigns one.",
                action: TextButton(
                    onPressed: widget.onOpenJobs,
                    child: const Text('Open Jobs')),
              ),
            )
          else
            NextJobCard(job: next, onOpen: widget.onOpenJob),
        ];
        return Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 600),
            child: AnimatedSwitcher(
              duration: motion(context, const Duration(milliseconds: 300)),
              child: _loading
                  ? const _HomeSkeleton(key: ValueKey('skeleton'))
                  : ListView(
                      key: const ValueKey('content'),
                      padding: MS.pagePadding,
                      children: [
                        for (var i = 0; i < children.length; i++)
                          FadeSlideIn.stagger(i ~/ 2, child: children[i]),
                      ],
                    ),
            ),
          ),
        );
      },
    );
  }
}

/// Whole-peso label for stat tiles (₱1,250).
String pesoWhole(double v) {
  final s = peso(v.roundToDouble());
  return s.endsWith('.00') ? s.substring(0, s.length - 3) : s;
}

/// Per-card tint for the Home stat tiles.
enum _StatTone { purple, greenPurple, warn }

class _Stat extends StatelessWidget {
  const _Stat({
    required this.label,
    required this.value,
    required this.format,
    required this.icon,
    required this.watermark,
    this.tone = _StatTone.purple,
    this.index = 0,
    this.onTap,
  });
  final String label;
  final double value;
  final String Function(double) format;
  final IconData icon;
  final IconData watermark;
  final _StatTone tone;
  final int index;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final c = MC.of(context);
    final (colors, accent, valueColor) = switch (tone) {
      _StatTone.warn => (
          [Color.lerp(c.lowest, c.coralSoft, 0.55)!, c.coralSoft],
          c.coral,
          c.coral,
        ),
      _StatTone.purple => (
          [c.lowest, c.tint, Color.lerp(c.tint, c.primaryFixed, 0.6)!],
          c.primary,
          c.primary,
        ),
      _StatTone.greenPurple => (
          [Color.lerp(c.lowest, c.greenSoft, 0.7)!, c.tint],
          c.green,
          c.primary,
        ),
    };
    // Slightly darker than muted so the small label keeps >= 4.5:1 contrast
    // on the tinted fills.
    final labelColor = Color.lerp(c.muted, c.text, 0.35)!;
    return DecorCard(
      onTap: onTap,
      radius: 18,
      colors: colors,
      accent: accent,
      watermark: watermark,
      watermarkSize: 58,
      pattern: index == 1 ? DecorPattern.wave : DecorPattern.dots,
      delay: Duration(milliseconds: 80 * index),
      padding: const EdgeInsets.fromLTRB(12, 12, 12, 14),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Icon(icon, size: 18, color: tone == _StatTone.warn ? c.coral : accent),
        const SizedBox(height: 8),
        FittedBox(
          fit: BoxFit.scaleDown,
          alignment: Alignment.centerLeft,
          child: CountUp(
            value: value,
            format: format,
            style: ts(20, w: FontWeight.w800, c: valueColor),
          ),
        ),
        const SizedBox(height: 2),
        SizedBox(
          height: 30,
          child: Text(label,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: ts(11, w: FontWeight.w800, c: labelColor, h: 1.3)),
        ),
      ]),
    );
  }
}

class _RemitBanner extends StatelessWidget {
  const _RemitBanner({required this.onTap});
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) {
    final c = MC.of(context);
    final left = codTimeLeft();
    final urgent = left <= kCodUrgentWindow;
    final h = left.inHours;
    final m = left.inMinutes % 60;
    final leftLabel = left == Duration.zero
        ? 'Cutoff passed'
        : h > 0
            ? '${h}h ${m}m left'
            : '${m}m left';
    return Pulse(
      enabled: urgent,
      child: MCard(
        color: urgent ? c.coralSoft : c.amberSoft,
        radius: 18,
        onTap: onTap,
        child: Row(children: [
          Icon(Icons.schedule, color: urgent ? c.coral : c.amberText),
          const SizedBox(width: 10),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Remit your COD before $kCodDueTime',
                  style: MT.labelLg
                      .copyWith(color: urgent ? c.coral : c.amberText)),
              Text(leftLabel,
                  style: MT.bodySm
                      .copyWith(color: urgent ? c.coral : c.amberText)),
            ]),
          ),
          Icon(Icons.chevron_right, color: urgent ? c.coral : c.amberText),
        ]),
      ),
    );
  }
}

/// The single "next job" card. Badge and button both come from [stageUi].
class NextJobCard extends StatelessWidget {
  const NextJobCard({super.key, required this.job, required this.onOpen});
  final MockJob job;
  final JobOpener onOpen;

  @override
  Widget build(BuildContext context) {
    final c = MC.of(context);
    return DecorCard(
      radius: 20,
      onTap: () => onOpen(context, job),
      colors: [c.lowest, c.tintLow, c.tint],
      accent: c.primary,
      watermark: job.isPickup
          ? Icons.storefront_outlined
          : Icons.local_shipping_outlined,
      watermarkSize: 120,
      pattern: DecorPattern.wave,
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Wrap(
          spacing: 8,
          runSpacing: 6,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [JobTypeTag(job), StageBadge(job)],
        ),
        const SizedBox(height: 12),
        Text(job.tracking, style: MT.labelMd.copyWith(color: c.muted)),
        const SizedBox(height: 2),
        Text(job.contactName, style: MT.headlineMd),
        const SizedBox(height: 2),
        Text(job.address, style: MT.bodyMd.copyWith(color: c.muted)),
        const SizedBox(height: 8),
        Text(jobMoneyLabel(job),
            style: MT.labelLg.copyWith(
                color: !job.isPickup && job.cod > 0 ? c.coral : c.primary)),
        const SizedBox(height: 14),
        StageButtons(job: job, onOpen: onOpen),
      ]),
    );
  }
}

class _HomeSkeleton extends StatelessWidget {
  const _HomeSkeleton({super.key});
  @override
  Widget build(BuildContext context) => Shimmer(
        child: ListView(
          padding: MS.pagePadding,
          physics: const NeverScrollableScrollPhysics(),
          children: [
            const SkeletonBox(width: 110, height: 14),
            const SizedBox(height: 8),
            const SkeletonBox(width: 220, height: 26),
            const SizedBox(height: MS.lg),
            Row(children: const [
              Expanded(child: SkeletonBox(height: 96, radius: 18)),
              SizedBox(width: MS.sm),
              Expanded(child: SkeletonBox(height: 96, radius: 18)),
              SizedBox(width: MS.sm),
              Expanded(child: SkeletonBox(height: 96, radius: 18)),
            ]),
            const SizedBox(height: MS.xl),
            const SkeletonBox(width: 80, height: 12),
            const SizedBox(height: MS.sm),
            const SkeletonBox(height: 210, radius: 20),
          ],
        ),
      );
}
