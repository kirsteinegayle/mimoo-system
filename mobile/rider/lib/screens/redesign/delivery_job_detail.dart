import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/api_config.dart';
import '../../core/theme.dart';
import '../../data/api/transport.dart' show UploadFile;
import '../../data/parcel_flow.dart' show clock;
import '../../mock/rider_mock.dart';
import '../../widgets/job_widgets.dart';
import '../../widgets/motion.dart';
import '../../widgets/success_burst.dart';
import '../pickup_detail_screen.dart' show showNavigationPicker;
import 'job_actions.dart';

/// Delivery detail: Attempt x/3, map to the buyer (when the address has
/// coordinates), buyer card, big COD card, and the animated
/// stepper Out for Delivery → POD photo → Buyer OTP → COD collected.
/// API mode: POD photo is taken with the camera and uploaded; the OTP the
/// buyer gives is sent with the final "deliver" call (server checks it).
/// MOCK mode: POD photo is a placeholder and OTP validation is mock.
/// The code is never saved or printed.
class DeliveryJobDetailScreen extends StatefulWidget {
  const DeliveryJobDetailScreen({super.key, required this.job});
  final MockJob job;
  @override
  State<DeliveryJobDetailScreen> createState() =>
      _DeliveryJobDetailScreenState();
}

class _DeliveryJobDetailScreenState extends State<DeliveryJobDetailScreen> {
  final _otp = TextEditingController();
  final _otpFocus = FocusNode();
  String? _otpError;
  int _otpShake = 0;

  /// True while an API call for this screen is running (disables buttons).
  bool _busy = false;

  /// API mode: a code was issued for the buyer at least once.
  bool _otpSent = false;

  /// DEBUG builds only: the debug_otp returned by the server (demo hint).
  String? _debugOtp;

  MockJob get job => widget.job;
  RiderMock get mock => RiderMock.instance;

  @override
  void dispose() {
    _otp.dispose();
    _otpFocus.dispose();
    super.dispose();
  }

  void _snack(String text) => ScaffoldMessenger.of(context)
      .showSnackBar(SnackBar(content: Text(text)));

  void _verifyOtp() {
    final ok = mock.verifyOtp(job, _otp.text);
    _otp.clear();
    setState(() {
      _otpError = ok ? null : 'Wrong code. Ask the buyer to check their SMS.';
      if (!ok) _otpShake++;
    });
    if (ok) _otpFocus.unfocus();
  }

  /// Runs an API-backed action with the busy flag set.
  Future<bool> _run(Future<void> Function() action) async {
    if (_busy) return false;
    setState(() => _busy = true);
    final ok = await runGuarded(context, action);
    if (mounted) setState(() => _busy = false);
    return ok;
  }

  Future<void> _complete() async {
    var earned = kDeliveryRate;
    final ok =
        await _run(() async => earned = await mock.completeDelivery(job));
    if (!ok || !mounted) {
      // A wrong code puts the rider back on the OTP step.
      if (mounted && !job.otpVerified) {
        setState(() {
          _otpError = 'Wrong or expired code. Ask the buyer again.';
          _otpShake++;
        });
      }
      return;
    }
    if (job.stage != MockStage.delivered) return;
    await showSuccess(context,
        title: 'Delivered!',
        subtitle: job.cod > 0
            ? '${peso(job.cod)} COD collected · +${peso(earned)} earned'
            : '+${peso(earned)} earned');
  }

  /// POD photo. API mode: live camera only (no gallery), JPG/PNG, max 5 MB.
  Future<void> _takePod() async {
    if (useMock) {
      await mock.markPodTaken(job); // MOCK placeholder, no camera.
      return;
    }
    final XFile? shot;
    try {
      shot = await ImagePicker().pickImage(
          source: ImageSource.camera,
          maxWidth: 1600,
          maxHeight: 1600,
          imageQuality: 80);
    } catch (e) {
      debugPrint('POD camera error: $e');
      _snack('Could not open the camera. Check the camera permission.');
      return;
    }
    if (shot == null || !mounted) return;
    final bytes = await shot.readAsBytes();
    if (!mounted) return;
    if (bytes.length > 5 * 1024 * 1024) {
      _snack('Photo is larger than 5 MB. Please take it again.');
      return;
    }
    final isPng = bytes.length > 4 &&
        bytes[0] == 0x89 &&
        bytes[1] == 0x50 &&
        bytes[2] == 0x4E &&
        bytes[3] == 0x47;
    final photo = UploadFile(
        field: 'photo',
        filename: isPng ? 'pod.png' : 'pod.jpg',
        bytes: bytes,
        contentType: isPng ? 'image/png' : 'image/jpeg');
    if (await _run(() => mock.markPodTaken(job, photo: photo)) && mounted) {
      _snack('Proof of delivery saved.');
    }
  }

  /// API mode: issue a new code for the buyer.
  Future<void> _sendOtp() async {
    String? debugCode;
    final ok = await _run(() async => debugCode = await mock.requestOtp(job));
    if (!ok || !mounted) return;
    setState(() {
      _otpSent = true;
      _otpError = null;
      _debugOtp = kDebugMode ? debugCode : null;
    });
    _snack('A new code was issued. Ask the buyer for it.');
  }

  Future<void> _deliveryFailed() async {
    final reason = await showModalBottomSheet<String>(
      context: context,
      showDragHandle: true,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (c) {
        final p = MC.of(c);
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              Text('Why did the delivery fail?',
                  style: ts(18, w: FontWeight.w800, c: p.text)),
              const SizedBox(height: 4),
              Text(
                  'Attempt ${job.attempt}/$kMaxDeliveryAttempts'
                  '${job.isFinalAttempt ? ' · last attempt' : ''}',
                  style: ts(13, c: p.muted)),
              const SizedBox(height: 8),
              for (final r in kFailReasons)
                ListTile(
                  minTileHeight: 52,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                  leading: Icon(_reasonIcon(r), color: p.coral),
                  title: Text(r, style: MT.labelLg),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => Navigator.pop(c, r),
                ),
            ]),
          ),
        );
      },
    );
    if (reason == null || !mounted) return;
    _otp.clear();
    _otpError = null;
    _debugOtp = null;
    _otpSent = false;
    if (!await _run(() => mock.failAttempt(job, reason)) || !mounted) return;
    _snack(job.isFinalAttempt
        ? 'Third failed attempt. Return the parcel to the hub.'
        : 'Attempt ${job.attempt}/$kMaxDeliveryAttempts recorded.');
  }

  static IconData _reasonIcon(String r) => switch (r) {
        'Buyer not around' => Icons.person_off_outlined,
        'Wrong address' => Icons.wrong_location_outlined,
        'Refused' => Icons.block,
        _ => Icons.more_horiz,
      };

  /// 0..4 = how many stepper steps are complete.
  int get _progress {
    if (job.stage == MockStage.delivered) return 4;
    if (job.stage != MockStage.outForDelivery) return 0;
    if (job.otpVerified) return 3;
    if (job.podTaken) return 2;
    return 1;
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: mock,
      builder: (context, _) {
        final c = MC.of(context);
        final showStepper = job.stage == MockStage.readyToDeliver ||
            job.stage == MockStage.outForDelivery ||
            job.stage == MockStage.delivered;
        final map = jobMapFor(job);
        final sections = <Widget>[
          _header(c),
          if (map != null) map,
          _buyerCard(c, hasMap: map != null),
          _CodCard(job: job),
          if (job.stage == MockStage.failedAttempt ||
              job.stage == MockStage.returnedToHub)
            _failedCard(c),
          if (showStepper) _stepperCard(c),
          if (job.stage == MockStage.outForDelivery)
            Center(
              child: TextButton.icon(
                onPressed: _busy ? null : _deliveryFailed,
                icon: Icon(Icons.report_gmailerrorred, color: c.coral),
                label: Text('Delivery failed?',
                    style: MT.labelLg.copyWith(color: c.coral)),
              ),
            ),
        ];
        return MScaffold(
          title: 'Delivery',
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

  Widget _header(MimooColors c) => Row(children: [
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(job.tracking, style: MT.headlineMd),
            const SizedBox(height: 6),
            Wrap(spacing: 6, runSpacing: 6, children: [
              JobTypeTag(job),
              StageBadge(job),
            ]),
          ]),
        ),
        const SizedBox(width: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: job.attempt > 1 ? c.coralSoft : c.tint,
            borderRadius: BorderRadius.circular(14),
          ),
          child: Column(children: [
            Text('ATTEMPT',
                style: ts(10,
                    w: FontWeight.w800,
                    c: job.attempt > 1 ? c.coral : c.primary)),
            Text('${job.attempt}/$kMaxDeliveryAttempts',
                style: ts(18,
                    w: FontWeight.w800,
                    c: job.attempt > 1 ? c.coral : c.primary)),
          ]),
        ),
      ]);

  Widget _buyerCard(MimooColors c, {required bool hasMap}) => MCard(
        radius: 20,
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            CircleAvatar(
              radius: 22,
              backgroundColor: c.tint,
              child: Icon(Icons.person, color: c.primary),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('BUYER', style: MT.badge.copyWith(color: c.muted)),
                Text(job.buyerName, style: MT.headlineMd),
              ]),
            ),
          ]),
          const SizedBox(height: MS.md),
          Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Icon(Icons.place, size: 18, color: c.coral),
            const SizedBox(width: 6),
            Expanded(child: Text(job.buyerAddress, style: MT.bodyLg)),
          ]),
          if (!hasMap) const MapUnavailableNote(),
          const SizedBox(height: 4),
          Padding(
            padding: const EdgeInsets.only(left: 24),
            child: Text(job.item, style: MT.bodySm.copyWith(color: c.muted)),
          ),
          const SizedBox(height: MS.lg),
          Row(children: [
            Expanded(
                child: ActionTile(Icons.call, 'Call',
                    () => launchUrl(Uri(scheme: 'tel', path: job.buyerPhone)))),
            const SizedBox(width: 8),
            Expanded(
                child: ActionTile(Icons.sms_outlined, 'Message',
                    () => launchUrl(Uri(scheme: 'sms', path: job.buyerPhone)))),
            const SizedBox(width: 8),
            Expanded(
                child: ActionTile(
                    Icons.navigation,
                    'Navigate',
                    () => showNavigationPicker(context,
                        address: job.buyerAddress,
                        lat: job.buyerLat,
                        lng: job.buyerLng,
                        title: 'Navigate to Buyer'))),
          ]),
        ]),
      );

  Widget _failedCard(MimooColors c) {
    final returned = job.stage == MockStage.returnedToHub;
    return MCard(
      radius: 20,
      color: returned ? c.container : c.errorContainer,
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Icon(returned ? Icons.undo : Icons.report_gmailerrorred,
              color: returned ? c.muted : MC.error),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
                returned
                    ? 'Returned to hub${job.completedAt == null ? '' : ' · ${clock(job.completedAt!)}'}'
                    : 'Attempt ${job.attempt}/$kMaxDeliveryAttempts failed',
                style: MT.labelLg
                    .copyWith(color: returned ? c.text : MC.error)),
          ),
        ]),
        const SizedBox(height: 8),
        for (var i = 0; i < job.failReasons.length; i++)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 2),
            child: Text('Attempt ${i + 1}: ${job.failReasons[i]}',
                style: MT.bodyMd),
          ),
        if (!returned) ...[
          const SizedBox(height: 12),
          StageButtons(job: job, onOpen: (_, __) {}),
        ],
      ]),
    );
  }

  Widget _stepperCard(MimooColors c) {
    final p = _progress;
    return MCard(
      radius: 20,
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('DELIVERY STEPS', style: MT.badge.copyWith(color: c.muted)),
        const SizedBox(height: 12),
        _Step(
          index: 0,
          progress: p,
          title: 'Out for Delivery',
          doneText: 'On the way to the buyer',
          child: StageButtons(job: job, onOpen: (_, __) {}),
        ),
        _Step(
          index: 1,
          progress: p,
          title: 'POD photo',
          doneText: useMock ? 'Photo saved (placeholder)' : 'Photo uploaded',
          child: PillButton('Take POD photo',
              icon: Icons.photo_camera_outlined,
              style: BtnStyle.tonal,
              onPressed: _busy ? null : _takePod),
        ),
        _Step(
          index: 2,
          progress: p,
          title: 'Buyer OTP',
          doneText: useMock ? 'Code verified' : 'Code entered',
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            if (!useMock) ...[
              PillButton(_otpSent ? 'Send a new code' : 'Send code to buyer',
                  icon: Icons.sms_outlined,
                  style: BtnStyle.tonal,
                  onPressed: _busy ? null : _sendOtp),
              const SizedBox(height: 10),
            ],
            Text('Ask the buyer for the $kOtpLength-digit code.',
                style: MT.bodySm.copyWith(color: c.muted)),
            // DEBUG ONLY demo hint. Never shown in release builds.
            if (kDebugMode && _debugOtp != null) ...[
              const SizedBox(height: 4),
              Text('DEBUG code: $_debugOtp',
                  style: MT.bodySm.copyWith(color: c.coral)),
            ],
            const SizedBox(height: 10),
            Shake(
              trigger: _otpShake,
              child: OtpBoxes(
                controller: _otp,
                focusNode: _otpFocus,
                hasError: _otpError != null,
                onChanged: (_) => setState(() => _otpError = null),
                onCompleted: (_) => _verifyOtp(),
              ),
            ),
            if (_otpError != null) ...[
              const SizedBox(height: 6),
              Text(_otpError!, style: MT.bodySm.copyWith(color: c.coral)),
            ],
            const SizedBox(height: 10),
            PillButton(useMock ? 'Verify code' : 'Use this code',
                icon: Icons.verified_outlined,
                onPressed:
                    _otp.text.length == kOtpLength ? _verifyOtp : null),
          ]),
        ),
        _Step(
          index: 3,
          progress: p,
          last: true,
          title: job.cod > 0 ? 'COD collected' : 'Confirm delivered',
          doneText: job.cod > 0
              ? '${peso(job.cod)} collected · Earned ${peso(kDeliveryRate)}'
              : 'Delivered · Earned ${peso(kDeliveryRate)}',
          child: PillButton(
              job.cod > 0
                  ? 'I collected ${peso(job.cod)}'
                  : 'Confirm delivered',
              icon: Icons.check_circle_outline,
              bg: c.green,
              onPressed: _busy ? null : _complete),
        ),
      ]),
    );
  }
}

class _CodCard extends StatelessWidget {
  const _CodCard({required this.job});
  final MockJob job;
  @override
  Widget build(BuildContext context) {
    final c = MC.of(context);
    final hasCod = job.cod > 0;
    final collected = job.stage == MockStage.delivered;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
      decoration: BoxDecoration(
        gradient: hasCod
            ? const LinearGradient(colors: [MC.coralDark, MC.coral])
            : null,
        color: hasCod ? null : c.greenBg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(children: [
        Text(
            hasCod
                ? (collected ? 'COD COLLECTED' : 'COLLECT COD')
                : 'PAID, NO CASH TO COLLECT',
            textAlign: TextAlign.center,
            style: ts(12,
                w: FontWeight.w800,
                c: hasCod ? Colors.white.withValues(alpha: 0.8) : c.green)),
        const SizedBox(height: 4),
        FittedBox(
          fit: BoxFit.scaleDown,
          child: hasCod
              ? CountUp(
                  value: job.cod,
                  format: peso,
                  style: ts(40, w: FontWeight.w800, c: Colors.white))
              : Icon(Icons.verified, size: 40, color: c.green),
        ),
      ]),
    );
  }
}

/// One stepper row. Circle, check mark and connecting line animate as
/// [progress] passes [index].
class _Step extends StatelessWidget {
  const _Step({
    required this.index,
    required this.progress,
    required this.title,
    required this.doneText,
    required this.child,
    this.last = false,
  });
  final int index, progress;
  final String title, doneText;
  final Widget child;
  final bool last;

  @override
  Widget build(BuildContext context) {
    final c = MC.of(context);
    final done = progress > index;
    final current = progress == index;
    final d = motion(context, const Duration(milliseconds: 350));
    final circle = AnimatedContainer(
      duration: d,
      curve: Curves.easeOut,
      width: 30,
      height: 30,
      decoration: BoxDecoration(
        color: done ? c.green : (current ? c.primary : c.lowest),
        shape: BoxShape.circle,
        border: Border.all(
            color: done
                ? c.green
                : current
                    ? c.primary
                    : c.outlineVariant,
            width: 2),
      ),
      child: AnimatedSwitcher(
        duration: d,
        transitionBuilder: (child, a) =>
            ScaleTransition(scale: a, child: child),
        child: done
            ? const Icon(Icons.check,
                key: ValueKey('done'), size: 16, color: Colors.white)
            : Text('${index + 1}',
                key: const ValueKey('num'),
                style: ts(13,
                    w: FontWeight.w800, c: current ? Colors.white : c.muted)),
      ),
    );
    // Stack instead of IntrinsicHeight: the content decides the height and
    // the connector line is positioned to fill it.
    return Stack(children: [
      if (!last)
        Positioned(
          left: 13.5,
          top: 34,
          bottom: 2,
          child: Container(
            width: 3,
            decoration: BoxDecoration(
                color: c.outlineVariant,
                borderRadius: BorderRadius.circular(2)),
            alignment: Alignment.topCenter,
            child: TweenAnimationBuilder<double>(
              tween: Tween(end: done ? 1 : 0),
              duration: d,
              curve: Curves.easeInOut,
              builder: (context, t, _) => FractionallySizedBox(
                heightFactor: t,
                child: Container(
                  decoration: BoxDecoration(
                      color: c.green, borderRadius: BorderRadius.circular(2)),
                ),
              ),
            ),
          ),
        ),
      Positioned(left: 0, top: 0, child: circle),
      Padding(
        padding: EdgeInsets.only(left: 42, bottom: last ? 0 : 18),
        child: ConstrainedBox(
          constraints: const BoxConstraints(minHeight: 30),
          child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.only(top: 5),
                  child: Text(title,
                      style: MT.labelLg.copyWith(
                          color: done || current ? c.text : c.muted)),
                ),
                AnimatedSize(
                  duration: d,
                  curve: Curves.easeOut,
                  alignment: Alignment.topCenter,
                  child: done
                      ? Padding(
                          padding: const EdgeInsets.only(top: 2),
                          child: Text(doneText,
                              style: MT.bodySm.copyWith(color: c.green)),
                        )
                      : current
                          ? Padding(
                              padding: const EdgeInsets.only(top: 10),
                              child: child,
                            )
                          : const SizedBox(width: double.infinity),
                ),
              ]),
        ),
      ),
    ]);
  }
}

/// Six masked boxes backed by one hidden text field. The code is never
/// shown, stored or printed.
class OtpBoxes extends StatelessWidget {
  const OtpBoxes({
    super.key,
    required this.controller,
    required this.focusNode,
    this.hasError = false,
    this.onChanged,
    this.onCompleted,
  });
  final TextEditingController controller;
  final FocusNode focusNode;
  final bool hasError;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onCompleted;

  @override
  Widget build(BuildContext context) {
    final c = MC.of(context);
    return Semantics(
      label: 'One-time code, $kOtpLength digits',
      textField: true,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: focusNode.requestFocus,
        child: Stack(children: [
          // Hidden input that actually receives the digits.
          Positioned.fill(
            child: Opacity(
              opacity: 0,
              child: TextField(
                controller: controller,
                focusNode: focusNode,
                keyboardType: TextInputType.number,
                autofillHints: const [AutofillHints.oneTimeCode],
                enableSuggestions: false,
                autocorrect: false,
                showCursor: false,
                maxLength: kOtpLength,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                decoration: const InputDecoration(counterText: ''),
                onChanged: (v) {
                  onChanged?.call(v);
                  if (v.length == kOtpLength) onCompleted?.call(v);
                },
              ),
            ),
          ),
          ListenableBuilder(
            listenable: Listenable.merge([controller, focusNode]),
            builder: (context, _) {
              final len = controller.text.length;
              return Row(children: [
                for (var i = 0; i < kOtpLength; i++) ...[
                  if (i > 0) const SizedBox(width: 6),
                  Expanded(
                    child: AnimatedContainer(
                      duration: motion(context, const Duration(milliseconds: 150)),
                      height: 52,
                      decoration: BoxDecoration(
                        color: c.low,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: hasError
                              ? c.coral
                              : focusNode.hasFocus && i == len
                                  ? c.primary
                                  : i < len
                                      ? c.primaryContainer
                                      : c.outlineVariant,
                          width: focusNode.hasFocus && i == len ? 2 : 1.2,
                        ),
                      ),
                      alignment: Alignment.center,
                      child: AnimatedScale(
                        scale: i < len ? 1 : 0,
                        duration:
                            motion(context, const Duration(milliseconds: 150)),
                        child: Container(
                          width: 12,
                          height: 12,
                          decoration: BoxDecoration(
                              color: c.text, shape: BoxShape.circle),
                        ),
                      ),
                    ),
                  ),
                ],
              ]);
            },
          ),
        ]),
      ),
    );
  }
}
