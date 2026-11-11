import 'package:flutter/material.dart';

import '../../core/api_config.dart';
import '../../core/theme.dart';
import '../../data/api/rider_api.dart';
import '../../mock/rider_mock.dart';
import '../../widgets/job_widgets.dart';
import '../../widgets/success_burst.dart';
import '../pickup_detail_screen.dart' show showNavigationPicker;
import '../scan_waybill_screen.dart';

/// Opens the detail screen for a job. Supplied by the caller so this file
/// stays free of screen imports.
typedef JobOpener = void Function(BuildContext context, MockJob job);

/// Runs [action] and shows any API error (server message) in a SnackBar.
/// Returns true when the action succeeded.
Future<bool> runGuarded(
    BuildContext context, Future<void> Function() action) async {
  final messenger = ScaffoldMessenger.maybeOf(context);
  try {
    await action();
    return true;
  } on ApiException catch (e) {
    messenger
      ?..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(e.message)));
    return false;
  } catch (e) {
    debugPrint('Job action failed: $e');
    messenger
      ?..hideCurrentSnackBar()
      ..showSnackBar(const SnackBar(
          content: Text('Something went wrong. Please try again.')));
    return false;
  }
}

/// Runs the primary action shown by [stageUi] for the job's current stage.
Future<void> runJobAction(
    BuildContext context, MockJob job, JobOpener openDetail) async {
  final mock = RiderMock.instance;
  switch (job.stage) {
    case MockStage.readyToPickUp:
      await showNavigationPicker(context,
          address: job.sellerAddress,
          lat: job.sellerLat,
          lng: job.sellerLng,
          title: 'Navigate to Seller');
    case MockStage.pickedUp:
      final ok = await confirmSheet(context,
          icon: Icons.warehouse_outlined,
          title: 'Drop off at the hub?',
          body: 'Confirm that ${job.tracking} was handed over at '
              '${mock.profile.hub}.',
          action: 'Dropped at Hub');
      if (ok && context.mounted) {
        final done = await runGuarded(context, () => mock.dropAtHub(job));
        if (done && context.mounted) {
          await showSuccess(context,
              title: 'Dropped at hub',
              subtitle: useMock
                  ? '+${peso(kPickupRate)} pickup payout'
                  : 'Handed over at ${mock.profile.hub}.');
        }
      }
    case MockStage.readyToDeliver:
      final ok = await runGuarded(context, () => mock.startDelivery(job));
      if (ok && context.mounted) openDetail(context, job);
    case MockStage.outForDelivery:
      openDetail(context, job);
    case MockStage.failedAttempt:
      if (job.isFinalAttempt) {
        final ok = await confirmSheet(context,
            icon: Icons.undo,
            title: 'Return to hub?',
            body: '${job.tracking} failed $kMaxDeliveryAttempts attempts. '
                'Confirm it was returned to ${mock.profile.hub}.',
            action: 'Returned to Hub',
            danger: true);
        if (ok && context.mounted) {
          await runGuarded(context, () => mock.returnToHub(job));
        }
      } else {
        final ok = await runGuarded(context, () => mock.retryDelivery(job));
        if (ok && context.mounted) openDetail(context, job);
      }
    case MockStage.droppedAtHub:
    case MockStage.delivered:
    case MockStage.returnedToHub:
      openDetail(context, job);
  }
}

/// Opens the existing chat route and clears the MOCK unread count.
void openMessages(BuildContext context) {
  RiderMock.instance.markMessagesRead();
  Navigator.pushNamed(context, '/chat');
}

/// Scan waybill using the existing scanner screen, validated against MOCK jobs.
/// [expected] = scan for one specific job; null = scan any assigned job.
Future<void> openMockScan(BuildContext context, {MockJob? expected}) async {
  final mock = RiderMock.instance;
  MockJob? scanned;
  await Navigator.of(context).push(MaterialPageRoute<void>(
    builder: (scanContext) => ScanWaybillScreen(
      expectedTracking: expected?.tracking,
      pickupPay: kPickupRate,
      cod: expected?.cod ?? 0,
      onValidate: (code) async {
        final job = mock.byTracking(code) ??
            (expected != null && code == expected.tracking ? expected : null);
        if (expected != null && job?.id != expected.id) {
          return ScanResult(ScanOutcome.mismatch, code,
              'This does not match ${expected.tracking}.');
        }
        if (job == null) {
          return ScanResult(ScanOutcome.mismatch, code,
              'This parcel is not assigned to you.');
        }
        if (job.stage == MockStage.readyToPickUp ||
            job.stage == MockStage.readyToDeliver) {
          return ScanResult(ScanOutcome.ok, code);
        }
        return ScanResult(ScanOutcome.alreadyPickedUp, code,
            'This parcel is already ${stageUi(job).badge.toLowerCase()}.');
      },
      onConfirmed: (code) async {
        final job = mock.byTracking(code) ??
            (expected?.tracking == code ? expected : null);
        if (job == null) return;
        var ok = false;
        if (job.stage == MockStage.readyToPickUp) {
          ok = await runGuarded(
              scanContext, () => mock.markPickedUp(job, waybill: code));
        } else if (job.stage == MockStage.readyToDeliver) {
          ok = await runGuarded(scanContext, () => mock.startDelivery(job));
        }
        if (!ok) return; // Stay on the scanner; the SnackBar shows why.
        scanned = job;
        if (scanContext.mounted) Navigator.of(scanContext).pop();
      },
      onBack: () => Navigator.of(scanContext).pop(),
    ),
  ));
  final job = scanned;
  if (job == null || !context.mounted) return;
  await showSuccess(context,
      title: job.isPickup ? 'Parcel picked up' : 'Out for delivery',
      subtitle: job.isPickup
          ? '${job.tracking} scanned. Next: take it to the hub.'
          : '${job.tracking} scanned. Head to the buyer.');
}

/// Bottom-sheet confirmation used by stage actions.
Future<bool> confirmSheet(
  BuildContext context, {
  required IconData icon,
  required String title,
  required String body,
  required String action,
  bool danger = false,
}) async {
  final ok = await showModalBottomSheet<bool>(
    context: context,
    showDragHandle: true,
    shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
    builder: (c) {
      final p = MC.of(c);
      return SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                  color: danger ? p.coralSoft : p.tint,
                  borderRadius: BorderRadius.circular(18)),
              child: Icon(icon, color: danger ? p.coral : p.primary),
            ),
            const SizedBox(height: 12),
            Text(title,
                textAlign: TextAlign.center,
                style: ts(18, w: FontWeight.w800, c: p.text)),
            const SizedBox(height: 6),
            Text(body,
                textAlign: TextAlign.center,
                style: ts(14, c: p.muted, h: 1.4)),
            const SizedBox(height: 20),
            PillButton(action,
                style: danger ? BtnStyle.danger : BtnStyle.primary,
                trailing: null,
                onPressed: () => Navigator.pop(c, true)),
            const SizedBox(height: 4),
            TextButton(
                onPressed: () => Navigator.pop(c, false),
                child: const Text('Cancel')),
          ]),
        ),
      );
    },
  );
  return ok == true;
}

/// The single primary stage button (+ "Scan Waybill" for pickups that are
/// ready). Label/icon always come from [stageUi], so they match the badge.
class StageButtons extends StatelessWidget {
  const StageButtons(
      {super.key,
      required this.job,
      required this.onOpen,
      this.showSecondary = true,
      this.height = 52});
  final MockJob job;
  final JobOpener onOpen;
  final bool showSecondary;
  final double height;
  @override
  Widget build(BuildContext context) {
    final ui = stageUi(job);
    if (ui.action == null) return const SizedBox.shrink();
    return Column(mainAxisSize: MainAxisSize.min, children: [
      PillButton(ui.action!,
          icon: ui.actionIcon,
          height: height,
          style: ui.danger ? BtnStyle.danger : BtnStyle.primary,
          onPressed: () => runJobAction(context, job, onOpen)),
      if (showSecondary && job.stage == MockStage.readyToPickUp) ...[
        const SizedBox(height: 8),
        PillButton('Scan Waybill',
            icon: Icons.qr_code_scanner,
            height: height,
            style: BtnStyle.tonal,
            onPressed: () => openMockScan(context, expected: job)),
      ],
    ]);
  }
}
