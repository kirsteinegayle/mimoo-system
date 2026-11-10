import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/theme.dart';
import '../../data/parcel_flow.dart' show clock;
import '../../mock/rider_mock.dart';
import '../../widgets/job_widgets.dart';
import '../../widgets/motion.dart';
import '../pickup_detail_screen.dart' show showNavigationPicker;
import 'job_actions.dart';

/// Pickup detail (directly assigned): map to the seller (when the address has
/// coordinates), full address, seller contact, Navigate, parcel info, status timeline and Scan Waybill. MOCK data.
class PickupJobDetailScreen extends StatelessWidget {
  const PickupJobDetailScreen({super.key, required this.job});
  final MockJob job;

  @override
  Widget build(BuildContext context) {
    final mock = RiderMock.instance;
    return ListenableBuilder(
      listenable: mock,
      builder: (context, _) {
        final c = MC.of(context);
        final map = jobMapFor(job);
        final sections = <Widget>[
          Wrap(spacing: 8, runSpacing: 6, children: [
            JobTypeTag(job),
            StageBadge(job),
          ]),
          if (map != null) map else const SizedBox(height: 4),
          // Seller + address
          MCard(
            radius: 20,
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              _label(c, 'SELLER'),
              Text(job.sellerName, style: MT.headlineMd),
              const SizedBox(height: MS.md),
              _label(c, 'PICKUP ADDRESS'),
              Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Icon(Icons.place, size: 18, color: c.coral),
                const SizedBox(width: 6),
                Expanded(child: Text(job.sellerAddress, style: MT.bodyLg)),
              ]),
              if (map == null) const MapUnavailableNote(),
              const SizedBox(height: MS.lg),
              Row(children: [
                Expanded(
                    child: ActionTile(Icons.call, 'Call',
                        () => launchUrl(Uri(scheme: 'tel', path: job.sellerPhone)))),
                const SizedBox(width: 8),
                Expanded(
                    child: ActionTile(Icons.sms_outlined, 'Message',
                        () => launchUrl(Uri(scheme: 'sms', path: job.sellerPhone)))),
                const SizedBox(width: 8),
                Expanded(
                    child: ActionTile(
                        Icons.map_outlined,
                        'Navigate',
                        () => showNavigationPicker(context,
                            address: job.sellerAddress,
                            lat: job.sellerLat,
                            lng: job.sellerLng,
                            title: 'Navigate to Seller'))),
              ]),
            ]),
          ),
          // Parcel info
          MCard(
            radius: 20,
            child: Column(children: [
              _row(c, Icons.qr_code_2, 'Tracking no.', job.tracking),
              const Divider(height: 20),
              _row(c, Icons.inventory_2_outlined, 'Parcel', job.item),
              const Divider(height: 20),
              _row(c, Icons.scale_outlined, 'Weight', job.weight),
              const Divider(height: 20),
              _row(c, Icons.payments_outlined, 'Payout', peso(job.payout),
                  strong: true),
            ]),
          ),
          // Timeline
          MCard(
            radius: 20,
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              _label(c, 'STATUS'),
              const SizedBox(height: 6),
              _Timeline(steps: [
                (
                  'Assigned to you',
                  job.assignedAt == null ? null : clock(job.assignedAt!),
                  true
                ),
                (
                  'Picked up (waybill scanned)',
                  job.pickedUpAt == null ? null : clock(job.pickedUpAt!),
                  job.stage != MockStage.readyToPickUp
                ),
                (
                  'Dropped at ${mock.profile.hub}',
                  job.completedAt == null ? null : clock(job.completedAt!),
                  job.stage == MockStage.droppedAtHub
                ),
              ]),
            ]),
          ),
          if (!job.isDone)
            StageButtons(job: job, onOpen: (_, __) {})
          else
            MCard(
              color: c.greenBg,
              radius: 20,
              child: Row(children: [
                Icon(Icons.check_circle, color: c.green),
                const SizedBox(width: 10),
                Expanded(
                  child: Text('Done · Earned ${peso(job.earned)}',
                      style: MT.labelLg.copyWith(color: c.green)),
                ),
              ]),
            ),
        ];
        return MScaffold(
          title: 'Pickup · ${job.tracking}',
          onBack: () => Navigator.maybePop(context),
          body: ListView.separated(
            padding: MS.pagePadding,
            itemCount: sections.length,
            separatorBuilder: (_, __) => const SizedBox(height: MS.md),
            itemBuilder: (context, i) =>
                FadeSlideIn.stagger(i, child: sections[i]),
          ),
        );
      },
    );
  }

  static Widget _label(MimooColors c, String text) => Padding(
        padding: const EdgeInsets.only(bottom: 4),
        child: Text(text, style: MT.badge.copyWith(color: c.muted)),
      );

  static Widget _row(MimooColors c, IconData icon, String label, String value,
          {bool strong = false}) =>
      Row(children: [
        Icon(icon, size: 20, color: c.primary),
        const SizedBox(width: 10),
        Expanded(child: Text(label, style: MT.bodyMd.copyWith(color: c.muted))),
        Flexible(
          child: Text(value,
              textAlign: TextAlign.end,
              style: (strong ? MT.labelLg : MT.bodyMd)
                  .copyWith(color: strong ? c.primary : c.text)),
        ),
      ]);
}

/// Vertical status timeline: (title, time, done).
class _Timeline extends StatelessWidget {
  const _Timeline({required this.steps});
  final List<(String, String?, bool)> steps;
  @override
  Widget build(BuildContext context) {
    final c = MC.of(context);
    final currentIndex = steps.indexWhere((s) => !s.$3);
    return Column(children: [
      for (var i = 0; i < steps.length; i++)
        IntrinsicHeight(
          child: Row(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            Column(children: [
              AnimatedContainer(
                duration: motion(context, const Duration(milliseconds: 300)),
                width: 22,
                height: 22,
                decoration: BoxDecoration(
                  color: steps[i].$3 ? c.green : c.lowest,
                  shape: BoxShape.circle,
                  border: Border.all(
                      color: steps[i].$3
                          ? c.green
                          : i == currentIndex
                              ? c.primary
                              : c.outlineVariant,
                      width: 2),
                ),
                child: steps[i].$3
                    ? const Icon(Icons.check, size: 14, color: Colors.white)
                    : null,
              ),
              if (i < steps.length - 1)
                Expanded(
                  child: AnimatedContainer(
                    duration: motion(context, const Duration(milliseconds: 300)),
                    width: 2,
                    color: steps[i + 1].$3 ? c.green : c.outlineVariant,
                  ),
                ),
            ]),
            const SizedBox(width: 12),
            Expanded(
              child: Padding(
                padding: EdgeInsets.only(bottom: i < steps.length - 1 ? 16 : 0),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(steps[i].$1,
                      style: MT.labelLg.copyWith(
                          color: steps[i].$3 || i == currentIndex
                              ? c.text
                              : c.muted)),
                  if (steps[i].$2 != null && steps[i].$3)
                    Text(steps[i].$2!, style: MT.bodySm.copyWith(color: c.muted)),
                ]),
              ),
            ),
          ]),
        ),
    ]);
  }
}
