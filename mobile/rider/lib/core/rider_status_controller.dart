import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';

import '../data/repositories/repository_interfaces.dart';
import '../data/models/entities.dart';
import '../data/parcel_flow.dart' show riderOnline;
import '../mock/rider_mock.dart' show RiderMock;
import '../screens/location_permission_sheet.dart';

/// Owns the rider's shift state so the switch can live in the shell app bar.
class RiderStatusController extends ChangeNotifier {
  RiderStatusController({
    required ParcelRepository parcelRepository,
    required RiderProfileRepository riderProfileRepository,
    bool online = true,
    bool suspended = false,
  })  : _parcels = parcelRepository,
        _profile = riderProfileRepository,
        _online = online && !suspended,
        _suspended = suspended {
    _parcels.addListener(_notifyParcelChange);
    _profile.addListener(_notifyProfileChange);
    riderOnline.value = _online;
  }

  final ParcelRepository _parcels;
  final RiderProfileRepository _profile;
  bool _online;
  bool _suspended;
  bool _updatingStatus = false;
  bool _locationOn = true;
  bool _pendingGoOnline = false;

  bool get isOnline => _online;
  bool get isSuspended => _suspended;
  bool get isUpdatingStatus => _updatingStatus;
  bool get locationOn => _locationOn;

  int get heldParcels => _parcels.parcels
      .where((p) =>
          p.status == ParcelStatus.pickedUp ||
          p.status == ParcelStatus.outForDelivery)
      .length;

  void _notifyParcelChange() => notifyListeners();

  void _notifyProfileChange() {
    final profile = _profile.profile;
    if (profile != null) {
      _suspended = profile.kycStatus == 'suspended';
      if (_suspended) {
        _online = false;
      } else if (!_updatingStatus) {
        _online = profile.checkedInAt != null;
      }
      riderOnline.value = _online;
    }
    notifyListeners();
  }

  /// Refreshes the cached location permission; called when the shell opens.
  Future<void> refreshLocation() async {
    final status = await Permission.location.status;
    _setLocation(status.isGranted);
    if (!status.isGranted && _online) await goOffline();
  }

  /// Called when the app resumes. Keeps the old behaviour where granting
  /// location from Settings completes a pending "go online" request.
  Future<void> syncLocationOnResume() async {
    final status = await Permission.location.status;
    final granted = status.isGranted;
    _setLocation(granted);
    if (granted && _pendingGoOnline) {
      _pendingGoOnline = false;
      await goOnline();
    } else if (!granted && _online) {
      await goOffline();
    }
  }

  /// Requests location access if needed, then finishes the online request.
  Future<bool> requestOnline(BuildContext context) async {
    if (_suspended) return false;
    _pendingGoOnline = true;

    var status = await Permission.location.status;
    if (status.isGranted) {
      _setLocation(true);
      _pendingGoOnline = false;
      await goOnline();
      return true;
    }

    if (status.isDenied) {
      status = await Permission.location.request();
      if (status.isGranted) {
        _setLocation(true);
        _pendingGoOnline = false;
        await goOnline();
        return true;
      }
    }

    if (!context.mounted) return false;
    await showLocationPermissionSheet(context,
        permanentlyDenied: status.isPermanentlyDenied);
    status = await Permission.location.status;
    final granted = status.isGranted;
    _setLocation(granted);
    if (granted) {
      _pendingGoOnline = false;
      await goOnline();
      return true;
    }
    if (_online) await goOffline();
    return false;
  }

  Future<void> goOnline() async {
    if (_suspended || _online || _updatingStatus) return;
    _updatingStatus = true;
    _online = true;
    riderOnline.value = true;
    notifyListeners();
    try {
      // API mode: POST /check-in first (no-op in mock mode), then local state.
      await RiderMock.instance.setOnline(true);
      await _profile.setCheckedIn(true);
    } catch (error) {
      _online = false;
      riderOnline.value = false;
      rethrow;
    } finally {
      _updatingStatus = false;
      notifyListeners();
    }
  }

  Future<void> goOffline() async {
    _pendingGoOnline = false;
    if (!_online || _updatingStatus) return;
    _updatingStatus = true;
    _online = false;
    riderOnline.value = false;
    notifyListeners();
    try {
      // API mode: POST /check-out first (no-op in mock mode), then local state.
      await RiderMock.instance.setOnline(false);
      await _profile.setCheckedIn(false);
    } catch (error) {
      _online = !_suspended;
      riderOnline.value = _online;
      rethrow;
    } finally {
      _updatingStatus = false;
      notifyListeners();
    }
  }

  void _setLocation(bool value) {
    if (_locationOn == value) return;
    _locationOn = value;
    notifyListeners();
  }

  @override
  void dispose() {
    _parcels.removeListener(_notifyParcelChange);
    _profile.removeListener(_notifyProfileChange);
    super.dispose();
  }
}

/// Provides the controller to the shell and tabs without a state package.
class RiderStatusScope extends InheritedNotifier<RiderStatusController> {
  const RiderStatusScope({
    super.key,
    required RiderStatusController controller,
    required super.child,
  }) : super(notifier: controller);

  static RiderStatusController of(BuildContext context) {
    final scope =
        context.dependOnInheritedWidgetOfExactType<RiderStatusScope>();
    assert(scope != null, 'RiderStatusScope is missing above this widget');
    return scope!.notifier!;
  }
}
