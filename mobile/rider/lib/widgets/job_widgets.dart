import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart' show LatLng;

import '../core/theme.dart';
import '../mock/rider_mock.dart';
import 'job_map.dart';
import 'motion.dart';

/// Visual design of one job stage: badge text, colours, icon and the single
/// primary button. [stageUi] is the ONLY place this mapping lives, so a
/// card's status badge and its button can never disagree.
class StageUi {
  const StageUi({
    required this.badge,
    required this.icon,
    required this.tone,
    this.action,
    this.actionIcon = Icons.arrow_forward,
    this.pulse = false,
    this.danger = false,
  });
  final String badge;
  final IconData icon;
  final StageTone tone;

  /// Primary button label; null for finished jobs (no button).
  final String? action;
  final IconData actionIcon;

  /// Gentle pulsing dot so "ready" jobs are seen first.
  final bool pulse;
  final bool danger;

  (Color bg, Color fg) colors(MimooColors c) => switch (tone) {
        StageTone.ready => (c.tint, c.primaryContainer),
        StageTone.carrying => (c.amberSoft, c.amberText),
        StageTone.deliverReady => (c.secondaryContainer.withValues(alpha: 0.45), c.onSecondaryContainer),
        StageTone.onTheWay => (c.coralSoft, c.tertiary),
        StageTone.done => (c.greenBg, c.green),
        StageTone.failed => (c.errorContainer, MC.error),
        StageTone.muted => (c.container, c.muted),
      };
}

enum StageTone { ready, carrying, deliverReady, onTheWay, done, failed, muted }

StageUi stageUi(MockJob job) => switch (job.stage) {
      MockStage.readyToPickUp => const StageUi(
          badge: 'READY TO PICK UP',
          icon: Icons.storefront_outlined,
          tone: StageTone.ready,
          action: 'Navigate to Seller',
          actionIcon: Icons.navigation,
          pulse: true),
      MockStage.pickedUp => const StageUi(
          badge: 'PICKED UP',
          icon: Icons.inventory_2_outlined,
          tone: StageTone.carrying,
          action: 'Take to Hub',
          actionIcon: Icons.warehouse_outlined),
      MockStage.droppedAtHub => const StageUi(
          badge: 'DROPPED AT HUB',
          icon: Icons.check_circle,
          tone: StageTone.done),
      MockStage.readyToDeliver => const StageUi(
          badge: 'READY TO DELIVER',
          icon: Icons.warehouse_outlined,
          tone: StageTone.deliverReady,
          action: 'Start Delivery',
          actionIcon: Icons.local_shipping_outlined,
          pulse: true),
      MockStage.outForDelivery => const StageUi(
          badge: 'OUT FOR DELIVERY',
          icon: Icons.local_shipping_outlined,
          tone: StageTone.onTheWay,
          action: 'Deliver Now',
          actionIcon: Icons.where_to_vote_outlined),
      MockStage.delivered => const StageUi(
          badge: 'DELIVERED',
          icon: Icons.check_circle,
          tone: StageTone.done),
      MockStage.failedAttempt => StageUi(
          badge: 'FAILED ATTEMPT ${job.attempt}/$kMaxDeliveryAttempts',
          icon: Icons.report_gmailerrorred,
          tone: StageTone.failed,
          action: job.isFinalAttempt ? 'Return to Hub' : 'Retry',
          actionIcon: job.isFinalAttempt ? Icons.undo : Icons.refresh,
          danger: job.isFinalAttempt),
      MockStage.returnedToHub => const StageUi(
          badge: 'RETURNED TO HUB',
          icon: Icons.undo,
          tone: StageTone.muted),
    };

class StageBadge extends StatelessWidget {
  const StageBadge(this.job, {super.key});
  final MockJob job;
  @override
  Widget build(BuildContext context) {
    final ui = stageUi(job);
    final (bg, fg) = ui.colors(MC.of(context));
    return Container(
      padding: const EdgeInsets.fromLTRB(6, 3, 10, 3),
      decoration: BoxDecoration(
          color: bg, borderRadius: BorderRadius.circular(MRadii.pill)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        if (ui.pulse)
          PulseDot(color: fg, size: 6)
        else
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 2),
            child: Icon(ui.icon, size: 13, color: fg),
          ),
        const SizedBox(width: 4),
        Flexible(
          child: Text(ui.badge,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: ts(11, w: FontWeight.w800, c: fg)),
        ),
      ]),
    );
  }
}

class JobTypeTag extends StatelessWidget {
  const JobTypeTag(this.job, {super.key});
  final MockJob job;
  @override
  Widget build(BuildContext context) {
    final c = MC.of(context);
    final bg = job.isPickup ? c.primary : c.tertiaryContainer;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
          color: bg, borderRadius: BorderRadius.circular(MRadii.pill)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(job.isPickup ? Icons.north_east : Icons.south_west,
            size: 12, color: Colors.white),
        const SizedBox(width: 3),
        Text(job.isPickup ? 'PICKUP' : 'DELIVERY',
            style: ts(11, w: FontWeight.w800, c: Colors.white)),
      ]),
    );
  }
}

/// Money line for a job: COD to collect for deliveries, payout for pickups.
String jobMoneyLabel(MockJob job) {
  if (job.isPickup) return 'Payout ${peso(job.payout)}';
  return job.cod > 0 ? 'COD ${peso(job.cod)}' : 'Paid · ${peso(job.payout)}';
}

/// Square-ish contact/navigation action used on detail screens.
class ActionTile extends StatelessWidget {
  const ActionTile(this.icon, this.label, this.onTap, {super.key});
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) {
    final c = MC.of(context);
    return PressScale(
      child: Material(
        color: c.tint,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: onTap,
          child: ConstrainedBox(
            constraints: const BoxConstraints(minHeight: 64),
            child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              Icon(icon, color: c.primary),
              const SizedBox(height: 4),
              Text(label, style: MT.labelMd.copyWith(color: c.primary)),
            ]),
          ),
        ),
      ),
    );
  }
}


/// MOCK: map of the job's next stop (seller for pickups, buyer for
/// deliveries) from the mock rider position. Returns null when the job has no
/// coordinates; show [MapUnavailableNote] under the address instead.
Widget? jobMapFor(MockJob job, {double height = 220}) {
  if (!job.hasTargetCoords) return null;
  return JobMap(
    target: LatLng(job.targetLat!, job.targetLng!),
    riderPosition: const LatLng(kMockRiderLat, kMockRiderLng),
    mode: job.isPickup ? JobMapMode.pickup : JobMapMode.delivery,
    height: height,
  );
}

/// Small note shown under an address that has no map coordinates.
class MapUnavailableNote extends StatelessWidget {
  const MapUnavailableNote({super.key});
  @override
  Widget build(BuildContext context) {
    final c = MC.of(context);
    return Padding(
      padding: const EdgeInsets.only(left: 24, top: 4),
      child: Row(children: [
        Icon(Icons.location_off_outlined, size: 14, color: c.muted),
        const SizedBox(width: 4),
        Flexible(
          child: Text('Map unavailable for this address',
              style: MT.bodySm.copyWith(color: c.muted)),
        ),
      ]),
    );
  }
}
