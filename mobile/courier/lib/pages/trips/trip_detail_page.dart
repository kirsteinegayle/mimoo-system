import 'dart:async';
import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../models/courier_models.dart';
import '../../services/api_service.dart';
import '../../services/courier_repository.dart';
import '../../services/location_service.dart';
import '../../theme/mimoo_theme.dart';
import '../../widgets/courier_shared.dart';

class TripDetailPage extends StatefulWidget {
  const TripDetailPage({super.key, required this.id});
  final int id;

  @override
  State<TripDetailPage> createState() => _TripDetailPageState();
}

class _TripDetailPageState extends State<TripDetailPage>
    with WidgetsBindingObserver {
  CourierTrip? _trip;
  bool _loading = true;
  bool _acting = false;
  bool _showCamera = false;
  bool _torchOn = false;
  String? _error;
  final _waybillCtrl = TextEditingController();
  final _scanner = MobileScannerController(
    formats: const [BarcodeFormat.all],
  );
  String? _lastScannedCode;
  DateTime? _lastScannedAt;

  static const _delayReasons = [
    'Heavy traffic',
    'Vehicle breakdown',
    'Weather',
    'Road closure',
    'Other',
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _load();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _scanner.dispose();
    _waybillCtrl.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (!_showCamera || !_scanner.value.isInitialized) return;
    if (state == AppLifecycleState.resumed) {
      unawaited(_scanner.start());
    } else if (state == AppLifecycleState.inactive ||
        state == AppLifecycleState.paused) {
      unawaited(_scanner.stop());
    }
  }

  void _onDetect(BarcodeCapture capture) {
    if (_acting) return;
    final code = capture.barcodes.firstOrNull?.rawValue?.trim();
    if (code == null || code.isEmpty) return;
    final normalized = code.toUpperCase();
    final now = DateTime.now();
    if (_lastScannedCode == normalized &&
        _lastScannedAt != null &&
        now.difference(_lastScannedAt!) < const Duration(seconds: 3)) {
      return;
    }
    _lastScannedCode = normalized;
    _lastScannedAt = now;
    _waybillCtrl.text = normalized;
    _scanParcel();
  }

  Future<void> _load({bool silent = false}) async {
    if (!silent) {
      setState(() {
        _loading = true;
        _error = null;
      });
    }
    try {
      final trip = await CourierRepository.instance.tripDetail(widget.id);
      if (!mounted) return;
      setState(() {
        _trip = trip;
        _loading = false;
        _error = null;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = ApiService.friendlyError(e);
      });
    }
  }

  Future<void> _run(Future<void> Function() action,
      {String? success, bool pop = false}) async {
    if (_acting) return;
    setState(() => _acting = true);
    try {
      await action();
      if (!mounted) return;
      if (success != null) courierSnack(context, success, kGreen);
      if (pop) {
        Navigator.pop(context, true);
        return;
      }
      await _load(silent: true);
    } catch (e) {
      if (!mounted) return;
      courierSnack(context, ApiService.friendlyError(e), kFlash);
    } finally {
      if (mounted) setState(() => _acting = false);
    }
  }

  Future<void> _accept() async {
    final ok = await _confirm(
        'Accept trip', 'Accept this trip and start preparing for loading?');
    if (ok != true) return;
    await _run(
      () => CourierRepository.instance.acceptTrip(widget.id),
      success: 'Trip accepted.',
    );
  }

  Future<void> _decline() async {
    final reason = await _reasonDialog(
      title: 'Decline trip',
      hint: 'Why can you not take this trip? (min 10 characters)',
      actionLabel: 'Decline',
      actionColor: kFlash,
    );
    if (reason == null) return;
    await _run(
      () => CourierRepository.instance.declineTrip(widget.id, reason),
      success: 'Trip declined and returned to dispatch.',
      pop: true,
    );
  }

  Future<void> _startLoading() async {
    await _run(
      () => CourierRepository.instance.startLoading(widget.id),
      success: 'Loading started. Scan every parcel.',
    );
  }

  Future<void> _scanParcel() async {
    final waybill = _waybillCtrl.text.trim().toUpperCase();
    if (waybill.isEmpty) {
      courierSnack(context, 'Scan or type a waybill number.', kFlash);
      return;
    }
    if (_acting) return;
    setState(() => _acting = true);
    try {
      final res =
          await CourierRepository.instance.scanTripParcel(widget.id, waybill);
      if (!mounted) return;
      final data = res['data'] as Map<String, dynamic>? ?? {};
      final label = data['label']?.toString();
      final already = res['already_loaded'] == true;
      final message = res['message']?.toString() ?? 'Parcel loaded.';
      courierSnack(
        context,
        label == null ? message : '$message Loaded $label.',
        already ? Colors.orange : kGreen,
      );
      _waybillCtrl.clear();
      await _load(silent: true);
    } catch (e) {
      if (!mounted) return;
      courierSnack(context, ApiService.friendlyError(e), kFlash);
    } finally {
      if (mounted) setState(() => _acting = false);
    }
  }

  Future<void> _toggleLoadingCamera() async {
    final show = !_showCamera;
    setState(() {
      _showCamera = show;
      if (!show) _torchOn = false;
    });
    if (show) {
      await _scanner.start();
    } else {
      await _scanner.stop();
    }
  }

  Future<void> _toggleTorch() async {
    await _scanner.toggleTorch();
    if (mounted) setState(() => _torchOn = !_torchOn);
  }

  Future<void> _depart() async {
    final trip = _trip!;
    if (!trip.capabilities.canDepart) {
      courierSnack(
          context, 'Scan every parcel before departing.', Colors.orange);
      return;
    }
    final seal = await _textDialog(
      title: 'Confirm departure',
      hint: 'Seal number (e.g. BH-0004521)',
      actionLabel: 'Depart',
      actionColor: kPrimary,
      validator: (value) =>
          RegExp(r'^BH-\d{7}$').hasMatch(value.trim().toUpperCase())
              ? null
              : 'Use BH- followed by exactly 7 digits.',
    );
    if (seal == null) return;

    await _run(() async {
      final location = await LocationService.current();
      await CourierRepository.instance.departTrip(
        widget.id,
        sealNumber: seal.trim().toUpperCase(),
        latitude: location.latitude,
        longitude: location.longitude,
      );
    }, success: 'Trip departed. Parcels are now In Transit.');
  }

  Future<void> _reportDelay() async {
    final reason = await showDialog<String>(
      context: context,
      builder: (_) => SimpleDialog(
        title: const Text('Delay reason'),
        children: _delayReasons
            .map((r) => SimpleDialogOption(
                  onPressed: () => Navigator.pop(context, r),
                  child: Text(r, style: pjs(size: 13)),
                ))
            .toList(),
      ),
    );
    if (reason == null || !mounted) return;

    final now = DateTime.now();
    final date = await showDatePicker(
      context: context,
      initialDate: now.add(const Duration(days: 1)),
      firstDate: now,
      lastDate: now.add(const Duration(days: 30)),
    );
    if (date == null || !mounted) return;
    final time = await showTimePicker(
      context: context,
      initialTime: const TimeOfDay(hour: 10, minute: 0),
    );
    if (time == null || !mounted) return;

    final eta =
        DateTime(date.year, date.month, date.day, time.hour, time.minute);
    if (!eta.isAfter(DateTime.now())) {
      if (mounted) {
        courierSnack(context, 'The new ETA must be later than now.', kFlash);
      }
      return;
    }
    final iso =
        '${eta.year}-${eta.month.toString().padLeft(2, '0')}-${eta.day.toString().padLeft(2, '0')} '
        '${eta.hour.toString().padLeft(2, '0')}:${eta.minute.toString().padLeft(2, '0')}:00';

    await _run(
      () => CourierRepository.instance
          .reportDelay(widget.id, reason: reason, newEta: iso),
      success: 'Delay reported with new ETA.',
    );
  }

  Future<void> _arrive() async {
    await _run(() async {
      final location = await LocationService.current();
      await CourierRepository.instance.arriveTrip(
        widget.id,
        latitude: location.latitude,
        longitude: location.longitude,
      );
    }, success: 'Trip marked Arrived. Waiting for hub receiving.');
  }

  Future<void> _addNote() async {
    final note = await _reasonDialog(
      title: 'Add note',
      hint: 'Note for Logistics (min 10 characters)',
      actionLabel: 'Save note',
      actionColor: kPrimary,
      minLength: 10,
    );
    if (note == null) return;
    await _run(
      () => CourierRepository.instance.addTripNote(widget.id, note),
      success: 'Note saved.',
    );
  }

  Future<void> _cancel() async {
    final reason = await _reasonDialog(
      title: 'Cancel trip',
      hint: 'Reason for cancelling (min 10 characters)',
      actionLabel: 'Cancel trip',
      actionColor: kFlash,
    );
    if (reason == null) return;
    await _run(
      () => CourierRepository.instance.cancelTrip(widget.id, reason),
      success: 'Trip cancelled.',
      pop: true,
    );
  }

  Future<bool?> _confirm(String title, String body) {
    return showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: Text(title),
        content: Text(body, style: pjs(size: 13)),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Back')),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(backgroundColor: kPrimary),
            child: const Text('Confirm'),
          ),
        ],
      ),
    );
  }

  Future<String?> _reasonDialog({
    required String title,
    required String hint,
    required String actionLabel,
    required Color actionColor,
    int minLength = 10,
  }) {
    return _textDialog(
      title: title,
      hint: hint,
      actionLabel: actionLabel,
      actionColor: actionColor,
      validator: (value) => value.trim().length < minLength
          ? 'Enter at least $minLength characters.'
          : (value.trim().length > 300
              ? 'Keep it to 300 characters or fewer.'
              : null),
      maxLines: 3,
    );
  }

  Future<String?> _textDialog({
    required String title,
    required String hint,
    required String actionLabel,
    required Color actionColor,
    String? Function(String)? validator,
    int maxLines = 1,
  }) {
    final controller = TextEditingController();
    String? error;
    return showDialog<String>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: Text(title),
          content: Column(mainAxisSize: MainAxisSize.min, children: [
            TextField(
              controller: controller,
              maxLines: maxLines,
              autofocus: true,
              textCapitalization: maxLines == 1
                  ? TextCapitalization.characters
                  : TextCapitalization.sentences,
              style: pjs(size: 13),
              decoration: mimooInput(hint: hint, error: error),
            ),
          ]),
          actions: [
            TextButton(
                onPressed: () => Navigator.pop(dialogContext),
                child: const Text('Cancel')),
            FilledButton(
              onPressed: () {
                final value = controller.text.trim();
                final validation = validator?.call(value);
                if (validation != null) {
                  setDialogState(() => error = validation);
                  return;
                }
                Navigator.pop(dialogContext, value);
              },
              style: FilledButton.styleFrom(backgroundColor: actionColor),
              child: Text(actionLabel),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final trip = _trip;
    return Scaffold(
      backgroundColor: kSurface,
      appBar: AppBar(
        backgroundColor: kCard,
        title: Text(trip?.tripCode ?? 'Trip Detail',
            style: pjs(size: 16, weight: FontWeight.w800)),
        actions: [
          IconButton(
            tooltip: 'Refresh',
            onPressed: _acting ? null : () => _load(),
            icon: const Icon(Icons.refresh, size: 20),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: kPrimary))
          : _error != null
              ? CourierErrorState(message: _error!, onRetry: _load)
              : trip == null
                  ? const SizedBox.shrink()
                  : Column(children: [
                      if (_acting)
                        const LinearProgressIndicator(
                            color: kPrimary, minHeight: 2),
                      Expanded(
                        child: RefreshIndicator(
                          color: kPrimary,
                          onRefresh: () => _load(silent: true),
                          child: ListView(
                            padding: const EdgeInsets.all(16),
                            children: [
                              _header(trip),
                              const SizedBox(height: 10),
                              _summary(trip),
                              if (trip.capabilities.canScan) ...[
                                const SizedBox(height: 10),
                                _loadingCard(trip),
                              ],
                              const SizedBox(height: 10),
                              _parcelsCard(trip),
                              if (trip.events.isNotEmpty) ...[
                                const SizedBox(height: 10),
                                _eventsCard(trip),
                              ],
                              const SizedBox(height: 14),
                              _actions(trip),
                              const SizedBox(height: 20),
                            ],
                          ),
                        ),
                      ),
                    ]),
    );
  }

  Widget _header(CourierTrip trip) {
    final color = statusColor(trip.status);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [kPrimary, kSecondary],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Expanded(
            child: Text(trip.tripCode,
                style: pjs(
                    size: 20, weight: FontWeight.w900, color: Colors.white)),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.18),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(displayStatus(trip.status).toUpperCase(),
                style:
                    pjs(size: 9, weight: FontWeight.w900, color: Colors.white)),
          ),
        ]),
        const SizedBox(height: 8),
        Row(children: [
          const Icon(Icons.trip_origin, size: 13, color: Colors.white70),
          const SizedBox(width: 5),
          Text(trip.origin.code,
              style:
                  pjs(size: 12, weight: FontWeight.w700, color: Colors.white)),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 6),
            child: Icon(Icons.arrow_forward, size: 12, color: Colors.white70),
          ),
          const Icon(Icons.location_on_outlined,
              size: 13, color: Colors.white70),
          const SizedBox(width: 5),
          Text(trip.destination.code,
              style:
                  pjs(size: 12, weight: FontWeight.w700, color: Colors.white)),
        ]),
        const SizedBox(height: 4),
        Text(
          '${trip.parcelsCount} parcels · ${trip.totalWeight.toStringAsFixed(1)} kg',
          style: pjs(size: 11, color: Colors.white70),
        ),
        if (trip.delayReason != null)
          Text('Delayed: ${trip.delayReason} · ETA ${trip.delayEta ?? '—'}',
              style: pjs(size: 11, color: Colors.orange.shade100)),
        if (trip.declineReason != null)
          Text('Declined: ${trip.declineReason}',
              style: pjs(size: 11, color: Colors.orange.shade100)),
        if (trip.cancellationReason != null)
          Text('Cancelled: ${trip.cancellationReason}',
              style: pjs(size: 11, color: Colors.orange.shade100)),
        if (trip.discrepancyNote != null)
          Text('Discrepancy: ${trip.discrepancyNote}',
              style: pjs(size: 11, color: Colors.orange.shade100)),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.2),
            borderRadius: BorderRadius.circular(6),
          ),
          child: Text(displayStatus(trip.status),
              style:
                  pjs(size: 10, weight: FontWeight.w700, color: Colors.white)),
        ),
      ]),
    );
  }

  Widget _summary(CourierTrip trip) {
    return CourierInfoCard(
      title: 'Trip details',
      children: [
        CourierInfoRow('Origin', '${trip.origin.name} (${trip.origin.code})'),
        CourierInfoRow('Destination',
            '${trip.destination.name} (${trip.destination.code})'),
        if (trip.scheduledDepartureAt != null)
          CourierInfoRow('Scheduled', trip.scheduledDepartureAt!),
        if (trip.acceptedAt != null)
          CourierInfoRow('Accepted', trip.acceptedAt!),
        if (trip.departedAt != null)
          CourierInfoRow('Departed', trip.departedAt!),
        if (trip.arrivedAt != null) CourierInfoRow('Arrived', trip.arrivedAt!),
        if (trip.completedAt != null)
          CourierInfoRow('Completed', trip.completedAt!),
        if (trip.sealNumber != null)
          CourierInfoRow('Seal no.', trip.sealNumber!),
        CourierInfoRow(
          'Parcels',
          '${trip.loadedCount}/${trip.parcelsCount} loaded · '
              '${trip.receivedCount} received',
        ),
        CourierInfoRow('Trip pay', '₱${trip.payAmount.toStringAsFixed(2)}'),
      ],
    );
  }

  Widget _loadingCard(CourierTrip trip) {
    return CourierInfoCard(
      title: 'Loading progress',
      description: trip.status == 'in_transit'
          ? 'The trip was reassigned after a vehicle breakdown. Rescan every parcel before marking Arrived.'
          : 'Scan every parcel in the manifest before confirming departure.',
      children: [
        Row(children: [
          Expanded(
            child: LinearProgressIndicator(
              value: trip.parcelsCount == 0
                  ? 0
                  : trip.loadedCount / trip.parcelsCount,
              color: kPrimary,
              backgroundColor: kChip,
              minHeight: 8,
              borderRadius: BorderRadius.circular(99),
            ),
          ),
          const SizedBox(width: 10),
          Text('${trip.loadedCount}/${trip.parcelsCount}',
              style: pjs(size: 13, weight: FontWeight.w800, color: kPrimary)),
        ]),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(
            child: TextField(
              controller: _waybillCtrl,
              textCapitalization: TextCapitalization.characters,
              style: pjs(size: 13),
              onSubmitted: (_) => _scanParcel(),
              decoration: mimooInput(
                  hint: 'Waybill number', icon: Icons.qr_code_scanner),
            ),
          ),
          const SizedBox(width: 8),
          SizedBox(
            height: 48,
            child: FilledButton(
              onPressed: _acting ? null : _scanParcel,
              style: FilledButton.styleFrom(backgroundColor: kPrimary),
              child: Text('Scan',
                  style: pjs(
                      size: 12, weight: FontWeight.w800, color: Colors.white)),
            ),
          ),
        ]),
        const SizedBox(height: 8),
        OutlinedButton.icon(
          onPressed: _acting ? null : _toggleLoadingCamera,
          style: OutlinedButton.styleFrom(
            side: const BorderSide(color: kPrimary),
            minimumSize: const Size.fromHeight(44),
          ),
          icon: Icon(
              _showCamera
                  ? Icons.videocam_off_outlined
                  : Icons.camera_alt_outlined,
              color: kPrimary),
          label: Text(_showCamera ? 'Close camera scanner' : 'Scan with camera',
              style: pjs(size: 12, weight: FontWeight.w700, color: kPrimary)),
        ),
        if (_showCamera) ...[
          const SizedBox(height: 8),
          SizedBox(
            height: 190,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: Stack(fit: StackFit.expand, children: [
                MobileScanner(
                  controller: _scanner,
                  onDetect: _onDetect,
                  errorBuilder: (_, __, ___) => ColoredBox(
                    color: kSurface,
                    child: Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text('Camera access is needed to scan.',
                              style: pjs(size: 12, color: kSubtext)),
                          TextButton(
                            onPressed: () => unawaited(openAppSettings()),
                            child: const Text('Open Settings'),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                Positioned(
                  top: 4,
                  right: 4,
                  child: IconButton(
                    tooltip: 'Toggle flashlight',
                    onPressed: _toggleTorch,
                    icon: Icon(
                      _torchOn ? Icons.flashlight_on : Icons.flashlight_off,
                      color: Colors.amber,
                    ),
                  ),
                ),
              ]),
            ),
          ),
        ],
      ],
    );
  }

  Widget _parcelsCard(CourierTrip trip) {
    return CourierInfoCard(
      title: 'Parcels (${trip.parcels.length})',
      children: [
        if (trip.parcels.isEmpty)
          Text('No parcels in this trip.',
              style: pjs(size: 12, color: kSubtext))
        else
          for (final p in trip.parcels)
            Container(
              margin: const EdgeInsets.only(bottom: 7),
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: kSurface,
                borderRadius: BorderRadius.circular(9),
                border: Border.all(color: kBorder),
              ),
              child: Row(children: [
                Icon(
                  p.missing
                      ? Icons.error_outline
                      : p.received
                          ? Icons.check_circle
                          : p.loaded
                              ? Icons.inventory_2
                              : Icons.radio_button_unchecked,
                  size: 19,
                  color: p.missing
                      ? kFlash
                      : p.received
                          ? kGreen
                          : p.loaded
                              ? kPrimary
                              : kSubtext,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(p.waybillNumber,
                            style: pjs(size: 12, weight: FontWeight.w700)),
                        Text(
                          '${p.weight.toStringAsFixed(1)} kg · '
                          '${p.missing ? 'Missing in Transit' : p.received ? 'Received' : p.loaded ? 'Loaded' : 'Pending'}',
                          style: pjs(size: 10, color: kSubtext),
                        ),
                        if (p.damaged)
                          Text(
                            'Damaged${p.damageNote == null ? '' : ': ${p.damageNote}'}',
                            style: pjs(size: 10, color: kFlash),
                          ),
                      ]),
                ),
                if (p.loaded) const Icon(Icons.check, size: 17, color: kGreen),
              ]),
            ),
      ],
    );
  }

  Widget _eventsCard(CourierTrip trip) {
    return CourierInfoCard(
      title: 'Trip timeline',
      children: [
        for (var i = 0; i < trip.events.length; i++)
          Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Column(children: [
              Container(
                width: 10,
                height: 10,
                margin: const EdgeInsets.only(top: 3),
                decoration: BoxDecoration(
                  color: i == 0 ? kPrimary : kBorder,
                  shape: BoxShape.circle,
                ),
              ),
              if (i != trip.events.length - 1)
                Container(width: 2, height: 42, color: kBorder),
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
                          child: Text(trip.events[i].label,
                              style: pjs(size: 12, weight: FontWeight.w700)),
                        ),
                        Text(trip.events[i].occurredAt,
                            style: pjs(size: 10, color: kSubtext)),
                      ]),
                      if (trip.events[i].place.isNotEmpty)
                        Text(trip.events[i].place,
                            style: pjs(size: 11, color: kSubtext)),
                      if (trip.events[i].notes != null &&
                          trip.events[i].notes!.isNotEmpty)
                        Text(trip.events[i].notes!,
                            style: pjs(size: 11, color: kSubtext)),
                    ]),
              ),
            ),
          ]),
      ],
    );
  }

  Widget _actions(CourierTrip trip) {
    final c = trip.capabilities;
    final buttons = <Widget>[];
    if (c.canAccept) {
      buttons
          .add(_actionButton('Accept Trip', kPrimary, _accept, filled: true));
    }
    if (c.canDecline) {
      buttons.add(_actionButton('Decline', kFlash, _decline));
    }
    if (c.canStartLoading) {
      buttons.add(_actionButton('Start Loading', kPrimary, _startLoading,
          filled: true));
    }
    if (c.canDepart) {
      buttons.add(
          _actionButton('Confirm Departure', kGreen, _depart, filled: true));
    }
    if (c.canReportDelay) {
      buttons.add(_actionButton('Report Delay', Colors.orange, _reportDelay));
    }
    if (c.canArrive) {
      buttons.add(_actionButton('Mark Arrived', kGreen, _arrive, filled: true));
    }
    if (c.canAddNote) {
      buttons.add(_actionButton('Add Note', kPrimary, _addNote));
    }
    if (c.canCancel) {
      buttons.add(_actionButton('Cancel Trip', kFlash, _cancel));
    }
    if (buttons.isEmpty) {
      return Center(
        child: Text(
          trip.status == 'completed' ||
                  trip.status == 'completed_with_discrepancy'
              ? 'This trip is complete. See History & Pay for the receipt.'
              : 'No actions available for this trip status.',
          style: pjs(size: 12, color: kSubtext),
          textAlign: TextAlign.center,
        ),
      );
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (var i = 0; i < buttons.length; i++) ...[
          buttons[i],
          if (i != buttons.length - 1) const SizedBox(height: 8),
        ],
      ],
    );
  }

  Widget _actionButton(String label, Color color, VoidCallback onTap,
      {bool filled = false}) {
    final style = filled
        ? FilledButton.styleFrom(
            backgroundColor: color,
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          )
        : OutlinedButton.styleFrom(
            side: BorderSide(color: color),
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          );
    final child = Text(label,
        style: pjs(
            size: 14,
            weight: FontWeight.w800,
            color: filled ? Colors.white : color));
    return SizedBox(
      height: 48,
      child: filled
          ? FilledButton(
              onPressed: _acting ? null : onTap,
              style: style,
              child: child,
            )
          : OutlinedButton(
              onPressed: _acting ? null : onTap,
              style: style,
              child: child,
            ),
    );
  }
}
