import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:permission_handler/permission_handler.dart';
import '../core/theme.dart';

/// ok = accepted; mismatch / alreadyPickedUp = the legacy local checks;
/// rejected = the server refused the scan (the specific reason is in [ScanResult.detail]).
enum ScanOutcome { ok, mismatch, alreadyPickedUp, rejected }

class ScanResult {
  final ScanOutcome outcome;
  final String code;
  final String? detail;
  const ScanResult(this.outcome, this.code, [this.detail]);
}

/// Builds the live camera view. Tests pass a fake; the app uses [MobileScanner].
typedef ScanCameraBuilder = Widget Function(
    BuildContext context, void Function(String code) onCode);

/// Same code seen again within this window is ignored (a camera reports a QR many times a second).
const Duration kScanCooldown = Duration(seconds: 4);

/// onValidate must call your API: ok -> the step is done; mismatch/rejected leave the job unchanged
/// (the server also writes the attempt to the scan audit log).
/// When [expectedTracking] is null the scan resolves any parcel assigned to the rider.
class ScanWaybillScreen extends StatefulWidget {
  final String? expectedTracking;
  final double pickupPay, cod;
  final Future<ScanResult> Function(String code) onValidate;
  final Future<void> Function(String) onConfirmed;
  final VoidCallback onBack;

  /// Test hooks: replace the camera view / the camera permission request.
  final ScanCameraBuilder? cameraBuilder;
  final Future<PermissionStatus> Function({required bool ask})? cameraPermission;
  const ScanWaybillScreen(
      {super.key,
      this.expectedTracking,
      required this.pickupPay,
      required this.cod,
      required this.onValidate,
      required this.onConfirmed,
      required this.onBack,
      this.cameraBuilder,
      this.cameraPermission});
  @override
  State<ScanWaybillScreen> createState() => _ScanState();
}

class _ScanState extends State<ScanWaybillScreen> with WidgetsBindingObserver {
  MobileScannerController? _scanner;
  final _manual = TextEditingController();
  ScanResult? _result;
  bool _busy = false, _torch = false;

  // Camera permission: asked up front so a denial shows a clear panel, not a black box.
  bool _checking = true;
  PermissionStatus _perm = PermissionStatus.denied;
  bool _cameraFailed = false;

  String? _lastCode;
  DateTime? _lastAt;

  bool get _granted => _perm.isGranted;
  bool get _showCamera => _granted && !_cameraFailed;

  MobileScannerController get _ctrl =>
      _scanner ??= MobileScannerController(formats: const [BarcodeFormat.all]);

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    unawaited(_checkCamera(ask: true));
  }

  Future<PermissionStatus> _permission({required bool ask}) async {
    final custom = widget.cameraPermission;
    if (custom != null) return custom(ask: ask);
    var status = await Permission.camera.status;
    if (!status.isGranted && !status.isPermanentlyDenied && ask) {
      status = await Permission.camera.request();
    }
    return status;
  }

  /// Initial check, the "Allow camera" button, and returning from system Settings.
  Future<void> _checkCamera({required bool ask}) async {
    var status = PermissionStatus.denied;
    try {
      status = await _permission(ask: ask);
    } catch (_) {
      // plugin unavailable: stay in the denied state, manual entry still works
    }
    if (!mounted) return;
    setState(() {
      _perm = status;
      _checking = false;
      if (status.isGranted) _cameraFailed = false;
    });
  }

  /// Refresh the permission state without touching [_cameraFailed] (so a failing camera cannot loop).
  Future<void> _syncPermission() async {
    try {
      final status = await _permission(ask: false);
      if (mounted) setState(() => _perm = status);
    } catch (_) {}
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && !_granted) {
      unawaited(_checkCamera(ask: false)); // back from Settings
    }
    final c = _scanner;
    if (c == null || !c.value.isInitialized) return;
    if (state == AppLifecycleState.resumed && !_busy) {
      unawaited(_safe(c.start));
    } else if (state == AppLifecycleState.inactive ||
        state == AppLifecycleState.paused) {
      unawaited(_safe(c.stop));
    }
  }

  static Future<void> _safe(Future<void> Function() f) async {
    try {
      await f();
    } catch (_) {}
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _scanner?.dispose();
    _manual.dispose();
    super.dispose();
  }

  /// A code from the camera: drop repeats of the same code inside the cooldown.
  void _onCameraCode(String raw) {
    final code = raw.trim().toUpperCase();
    if (code.isEmpty || _busy) return;
    final now = DateTime.now();
    if (_lastCode == code &&
        _lastAt != null &&
        now.difference(_lastAt!) < kScanCooldown) {
      return;
    }
    _lastCode = code;
    _lastAt = now;
    HapticFeedback.selectionClick(); // a code was read
    unawaited(_submit(code));
  }

  Future<void> _submit(String raw) async {
    final code = raw.trim().toUpperCase();
    if (code.isEmpty || _busy) return;
    setState(() => _busy = true);
    await _safe(() async => _scanner?.stop());
    ScanResult r;
    try {
      r = await widget.onValidate(code);
    } catch (_) {
      r = ScanResult(ScanOutcome.rejected, code,
          'Could not check this scan. Check your connection and try again.');
    }
    if (!mounted) return;
    setState(() {
      _busy = false;
      _result = r;
    });
    if (r.outcome == ScanOutcome.ok) {
      HapticFeedback.mediumImpact(); // accepted
      await widget.onConfirmed(code);
    } else {
      HapticFeedback.heavyImpact(); // refused
      if (_showCamera) await _safe(() async => _scanner?.start());
    }
  }

  Future<void> _toggleTorch() async {
    if (!_showCamera) return;
    await _safe(_ctrl.toggleTorch);
    if (mounted) setState(() => _torch = !_torch);
  }

  @override
  Widget build(BuildContext context) => MScaffold(
      title: 'Waybill Scan',
      onBack: widget.onBack,
      body: Column(children: [
        Expanded(flex: 3, child: _cameraArea()),
        Flexible(
            flex: 3,
            child: Container(
                width: double.infinity,
                decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius:
                        BorderRadius.vertical(top: Radius.circular(24))),
                child: SingleChildScrollView(
                    padding: MS.pagePadding,
                    child: _manualPanel()))),
      ]));

  Widget _cameraArea() => Stack(fit: StackFit.expand, children: [
        Container(color: MC.deep),
        if (_checking)
          const Center(child: CircularProgressIndicator(color: Colors.white))
        else if (!_showCamera)
          _cameraDenied()
        else
          _cameraView(),
        if (_showCamera)
          IgnorePointer(
              child: Center(
                  child: LayoutBuilder(
                      builder: (context, c) => Container(
                          width: (c.maxWidth - 48).clamp(120.0, 280.0),
                          height: ((c.maxWidth - 48).clamp(120.0, 280.0) * 0.68)
                              .clamp(90.0, c.maxHeight - 24),
                          decoration: BoxDecoration(
                              border: Border.all(color: MC.violet, width: 4),
                              borderRadius: BorderRadius.circular(16)))))),
        Positioned(
            top: 4,
            right: 4,
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              if (_showCamera)
                IconButton(
                    tooltip: _torch ? 'Flash off' : 'Flash on',
                    onPressed: _toggleTorch,
                    constraints: const BoxConstraints(minWidth: 48, minHeight: 48),
                    icon: Icon(
                        _torch ? Icons.flashlight_on : Icons.flashlight_off,
                        color: Colors.amber[200],
                        size: 22)),
              IconButton(
                  tooltip: 'Close scanner',
                  onPressed: widget.onBack,
                  constraints: const BoxConstraints(minWidth: 48, minHeight: 48),
                  icon: const Icon(Icons.close, color: Colors.white, size: 22)),
            ])),
        if (_showCamera)
          Positioned(
              bottom: 12,
              left: 12,
              right: 12,
              child: Center(
                  child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                          color: Colors.black54,
                          borderRadius: BorderRadius.circular(99)),
                      child: Text('Align the waybill QR within the frame',
                          textAlign: TextAlign.center,
                          style:
                              ts(12, c: Colors.white, w: FontWeight.w500))))),
      ]);

  Widget _cameraView() {
    final custom = widget.cameraBuilder;
    if (custom != null) return custom(context, _onCameraCode);
    return MobileScanner(
        controller: _ctrl,
        onDetect: (cap) {
          final v = cap.barcodes.firstOrNull?.rawValue;
          if (v != null) _onCameraCode(v);
        },
        errorBuilder: (ctx, err, _) {
          // Denied at the OS, or no usable camera: explain once, outside the build.
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted && !_cameraFailed) {
              setState(() => _cameraFailed = true);
              unawaited(_syncPermission());
            }
          });
          return _cameraDenied();
        });
  }

  Widget _manualPanel() => Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Or type the waybill number',
                style: ts(18, w: FontWeight.w700)),
            const SizedBox(height: 2),
            Text(
                'Scan the QR on the waybill, or type the number if the QR is damaged.',
                style: ts(12, c: MC.muted)),
            const SizedBox(height: 12),
            TextField(
                controller: _manual,
                textCapitalization: TextCapitalization.characters,
                onSubmitted: _submit,
                decoration: InputDecoration(
                    hintText: 'e.g. ${widget.expectedTracking ?? 'MIM00000001'}',
                    filled: true,
                    fillColor: MC.tintLow,
                    prefixIcon:
                        const Icon(Icons.qr_code_scanner, color: MC.violetDark),
                    suffixIcon: IconButton(
                        tooltip: 'Clear',
                        icon: const Icon(Icons.close),
                        onPressed: _manual.clear),
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(99),
                        borderSide: BorderSide.none))),
            if (_result != null && _result!.outcome != ScanOutcome.ok) ...[
              const SizedBox(height: 12),
              _banner(_result!)
            ],
            const SizedBox(height: 12),
            PillButton(
                widget.expectedTracking == null ? 'Continue' : 'Confirm Scan',
                icon: Icons.arrow_forward,
                loading: _busy,
                onPressed: () => _submit(_manual.text)),
            const SizedBox(height: 8),
            if (widget.expectedTracking != null && widget.cod > 0)
              Wrap(
                  alignment: WrapAlignment.spaceBetween,
                  spacing: 12,
                  children: [
                    Text('Pickup Pay: ${peso(widget.pickupPay)}',
                        style: ts(12, w: FontWeight.w600)),
                    Text('COD ${peso(widget.cod)}',
                        style: ts(12, w: FontWeight.w800, c: MC.violetDark))
                  ])
            else if (widget.expectedTracking == null)
              Text('Scan a pickup waybill or a parcel assigned to you.',
                  style: ts(12, c: MC.muted)),
          ]);

  Widget _banner(ScanResult r) => switch (r.outcome) {
        ScanOutcome.mismatch => InfoBanner(
            Icons.error, 'Tracking number does not match this job',
            body:
                'Scanned ${r.code}. ${r.detail ?? 'This assignment remains active and unchanged.'}',
            bg: MC.coral,
            fg: Colors.white),
        ScanOutcome.rejected => InfoBanner(Icons.error, 'Scan rejected',
            body: r.detail ?? 'The server did not accept ${r.code}.',
            bg: MC.coral,
            fg: Colors.white),
        _ => InfoBanner(Icons.warning, 'This parcel is already picked up',
            body: r.detail ??
                'Duplicate scans do not generate redundant drop-offs.',
            bg: MC.amberSoft,
            fg: MC.amber),
      };

  Widget _cameraDenied() => LayoutBuilder(
      builder: (context, c) => SingleChildScrollView(
          child: ConstrainedBox(
              constraints: BoxConstraints(minHeight: c.maxHeight),
              child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 56, 20, 20),
                  child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.videocam_off,
                            color: MC.tintHi, size: 40),
                        const SizedBox(height: 8),
                        Text('Camera access is needed to scan',
                            textAlign: TextAlign.center,
                            style: ts(18, w: FontWeight.w700, c: Colors.white)),
                        const SizedBox(height: 4),
                        Text(
                            'You can still type the waybill number below.',
                            textAlign: TextAlign.center,
                            style: ts(12, c: MC.tintHi)),
                        const SizedBox(height: 8),
                        if (!_perm.isPermanentlyDenied)
                          FilledButton.icon(
                              onPressed: () =>
                                  unawaited(_checkCamera(ask: true)),
                              style: FilledButton.styleFrom(
                                  backgroundColor: MC.violet,
                                  minimumSize: const Size(48, 48)),
                              icon: const Icon(Icons.videocam, size: 18),
                              label: const Text('Allow camera')),
                        TextButton.icon(
                            onPressed: () => unawaited(openAppSettings()),
                            style: TextButton.styleFrom(
                                foregroundColor: Colors.white,
                                minimumSize: const Size(48, 48)),
                            icon: const Icon(Icons.settings, size: 18),
                            label: const Text('Open Settings')),
                      ])))));
}
