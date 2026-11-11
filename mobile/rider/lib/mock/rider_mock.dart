// MOCK — Rider UI redesign mock data.
//
// MOCK: Everything in this file is fake, in-memory data for the redesigned
// rider screens (Home, Jobs, Pickup/Delivery detail, Wallet, Profile,
// Notifications, State gallery).
// MOCK: No API calls, no database writes, no secrets. Replace with real
// repositories when the backend endpoints are ready.

import 'dart:async' show unawaited;

import 'package:flutter/foundation.dart';

import '../core/api_config.dart';
import '../data/api/rider_api.dart';
import '../data/parcel_flow.dart' show riderOnline;
import '../data/api/transport.dart' show UploadFile;

// ── MOCK constants ──────────────────────────────────────────────────────────

/// MOCK: Payout per completed pickup.
const double kPickupRate = 30;

/// MOCK: Payout per completed delivery.
const double kDeliveryRate = 50;

/// MOCK: Daily COD remittance cutoff (display label).
const String kCodDueTime = '10:00 PM';

/// MOCK: Daily COD remittance cutoff (hour/minute, 24h). Matches [kCodDueTime].
const int kCodDueHour = 22;
const int kCodDueMinute = 0;

/// MOCK: Fake "current time" used for the COD countdown so the
/// "under 2 hours left" pulse can be previewed. Set to null to use real time.
// ignore: unnecessary_nullable_for_final_variable_declarations
const ({int hour, int minute})? kMockClock = (hour: 20, minute: 35);

/// MOCK: Banner starts pulsing when less than this is left before cutoff.
const Duration kCodUrgentWindow = Duration(hours: 2);

/// MOCK: How long the Home skeleton shows on first open.
const Duration kHomeSkeletonDuration = Duration(milliseconds: 600);

/// MOCK: Fake network delay for pull-to-refresh.
const Duration kMockRefreshDelay = Duration(milliseconds: 900);

/// MOCK: Maximum active (to-do) jobs a rider may hold.
const int kMaxActiveJobs = 5;

/// MOCK: Delivery attempts before the parcel goes back to the hub.
const int kMaxDeliveryAttempts = 3;

/// MOCK: Number of digits in the buyer OTP.
const int kOtpLength = 6;

/// MOCK: Reasons a delivery attempt can fail.
const List<String> kFailReasons = [
  'Buyer not around',
  'Wrong address',
  'Refused',
  'Other',
];

/// MOCK: Completed jobs per day earlier this week (Mon..yesterday), used by
/// the Wallet "This week" view and its bar chart.
const List<({String day, int pickups, int deliveries})> kMockWeekBeforeToday = [
  (day: 'Mon', pickups: 4, deliveries: 6),
  (day: 'Tue', pickups: 6, deliveries: 5),
  (day: 'Wed', pickups: 3, deliveries: 7),
  (day: 'Thu', pickups: 5, deliveries: 4),
  (day: 'Fri', pickups: 3, deliveries: 4),
];

/// MOCK: Label for "today" in the weekly chart.
const String kMockTodayLabel = 'Sat';

/// MOCK clock helper. Real time when the app runs against the API.
DateTime mockNow() {
  final now = DateTime.now();
  if (!useMock) return now;
  final clock = kMockClock;
  if (clock == null) return now;
  return DateTime(now.year, now.month, now.day, clock.hour, clock.minute);
}

/// Time left until today's COD cutoff (never negative).
Duration codTimeLeft() {
  final now = mockNow();
  final due =
      DateTime(now.year, now.month, now.day, kCodDueHour, kCodDueMinute);
  final left = due.difference(now);
  return left.isNegative ? Duration.zero : left;
}

// ── MOCK map coordinates ────────────────────────────────────────────────────

/// MOCK: Fake rider position (near Malolos Hub, Malolos, Bulacan). No GPS
/// package is used; the map always draws the rider here.
const double kMockRiderLat = 14.8443;
const double kMockRiderLng = 120.8104;

// ── MOCK website links (login screen) ───────────────────────────────────────

/// MOCK: Forgot-password page on the Mimoo website. Null = not configured yet,
/// so the login screen shows a snackbar instead of opening a browser.
const String? kForgotPasswordUrl = null;

/// MOCK: "Apply to ride" page on the Mimoo website. Null = not configured yet.
const String? kApplyToRideUrl = null;

// ── MOCK models ─────────────────────────────────────────────────────────────

enum MockJobType { pickup, delivery }

/// MOCK: Stage of a directly-assigned job. There is no offer/accept step.
enum MockStage {
  // PICKUP (from the seller)
  readyToPickUp, // 1. assigned, go to the seller
  pickedUp, // 2. waybill scanned, take to hub
  droppedAtHub, // 3. done
  // DELIVERY (to the buyer)
  readyToDeliver, // 4. at hub, assigned to me
  outForDelivery, // 5. on the way to the buyer
  delivered, // 6. done
  failedAttempt, // 7. attempt failed (x/3): Retry, or Return to Hub at 3/3
  returnedToHub, // done (failed 3/3 and returned)
}

class MockJob {
  MockJob({
    required this.id,
    required this.type,
    required this.tracking,
    required this.stage,
    required this.sellerName,
    required this.sellerPhone,
    required this.sellerAddress,
    required this.sellerArea,
    required this.buyerName,
    required this.buyerPhone,
    required this.buyerAddress,
    required this.buyerArea,
    required this.item,
    this.weight = '0.5 kg',
    this.cod = 0,
    this.attempt = 1,
    this.assignedAt,
    this.pickedUpAt,
    this.completedAt,
    this.sellerLat,
    this.sellerLng,
    this.buyerLat,
    this.buyerLng,
    List<String>? failReasons,
    this.serverId,
  }) : failReasons = failReasons ?? [];

  final String id;
  final MockJobType type;

  /// Real id from the API (delivery_jobs.id or shipment_assignments.id).
  /// Null for in-memory mock jobs.
  final int? serverId;

  // Not final: refreshed in place from the API so open screens stay in sync.
  String tracking;
  MockStage stage;
  String sellerName, sellerPhone, sellerAddress, sellerArea;
  String buyerName, buyerPhone, buyerAddress, buyerArea;
  String item, weight;
  double cod;

  /// MOCK map points. Null = no coordinates for that address, so the detail
  /// screen shows "Map unavailable for this address" instead of a map.
  final double? sellerLat, sellerLng, buyerLat, buyerLng;

  /// Current (or last) delivery attempt number, 1..[kMaxDeliveryAttempts].
  int attempt;
  DateTime? assignedAt, pickedUpAt, completedAt;
  List<String> failReasons;

  // Delivery stepper progress (MOCK, in-memory only).
  bool podTaken = false;
  bool otpVerified = false;

  /// API mode: the code the rider typed. Kept in memory only until the
  /// deliver call, then cleared. Never saved or printed.
  String? enteredOtp;

  bool get isPickup => type == MockJobType.pickup;
  bool get isDone =>
      stage == MockStage.droppedAtHub ||
      stage == MockStage.delivered ||
      stage == MockStage.returnedToHub;
  bool get isFinalAttempt => attempt >= kMaxDeliveryAttempts;
  double get payout => isPickup ? kPickupRate : kDeliveryRate;
  String? get lastFailReason => failReasons.isEmpty ? null : failReasons.last;

  /// Earned only when the job finished successfully.
  double get earned => stage == MockStage.droppedAtHub
      ? kPickupRate
      : stage == MockStage.delivered
          ? kDeliveryRate
          : 0;

  /// Area shown on cards.
  String get area => isPickup ? sellerArea : buyerArea;

  /// Full address of the place the rider must go next.
  String get address => isPickup ? sellerAddress : buyerAddress;
  String get contactName => isPickup ? sellerName : buyerName;
  String get contactPhone => isPickup ? sellerPhone : buyerPhone;

  /// Coordinates of the place the rider must go next (seller for pickups,
  /// buyer for deliveries). Null when the address has no coordinates.
  double? get targetLat => isPickup ? sellerLat : buyerLat;
  double? get targetLng => isPickup ? sellerLng : buyerLng;
  bool get hasTargetCoords => targetLat != null && targetLng != null;
}

class MockRemit {
  const MockRemit(this.reference, this.amount, this.at, this.parcels);
  final String reference;
  final double amount;
  final DateTime at;
  final int parcels;
}

/// One day of real earnings from GET /api/rider-app/earnings (data.days).
class ServerEarningDay {
  const ServerEarningDay({
    required this.date,
    required this.label,
    required this.total,
    required this.pickup,
    required this.pickupCount,
    required this.deliveryCount,
  });

  /// Server calendar date (no time part).
  final DateTime date;
  final String label;
  final double total, pickup;
  final int pickupCount, deliveryCount;

  static ServerEarningDay? tryParse(Map<String, dynamic> j) {
    final date = DateTime.tryParse('${j['date']}');
    if (date == null) return null;
    double n(String k) => (j[k] as num?)?.toDouble() ?? 0;
    return ServerEarningDay(
      date: DateTime(date.year, date.month, date.day),
      label: (j['label'] ?? '').toString(),
      total: n('total'),
      pickup: n('pickup'),
      pickupCount: (j['pickup_count'] as num?)?.toInt() ?? 0,
      deliveryCount: (j['delivery_count'] as num?)?.toInt() ?? 0,
    );
  }
}

class MockNotification {
  MockNotification(this.title, this.body, this.at,
      {this.jobId, this.unread = true, this.serverId});
  final String title, body;
  final DateTime at;
  final String? jobId;
  final int? serverId;
  bool unread;
}

class MockProfile {
  const MockProfile({
    required this.name,
    required this.riderId,
    required this.status,
    required this.hub,
    required this.municipality,
    required this.vehicleType,
    required this.plateNo,
    this.hubAddress,
    this.hubAssigned = true,
    this.courierCompany,
  });
  final String name, riderId, status, hub, municipality, vehicleType, plateNo;

  /// API mode: address of the rider's branch (null when unknown).
  final String? hubAddress;

  /// API mode: false when no branch is linked to the rider yet ([hub] then
  /// reads "your hub" so sentences still work).
  final bool hubAssigned;
  final String? courierCompany;
  String get firstName => name.split(' ').first;
  String get initials =>
      name.split(' ').where((p) => p.isNotEmpty).take(2).map((p) => p[0]).join();
}

// ── MOCK store ──────────────────────────────────────────────────────────────

/// MOCK: In-memory store for the redesigned screens. Single instance.
class RiderMock extends ChangeNotifier {
  RiderMock._() {
    // API mode starts empty and is filled by refresh() after login.
    if (useMock) {
      _jobs.addAll(_seedJobs());
      _seedRest();
    }
  }

  static final RiderMock instance = RiderMock._();

  RiderApi get _api => RiderApi.instance;

  // ── API-mode state ────────────────────────────────────────────────────────
  bool _loading = false;
  String? _loadError;
  double _srvCodHeld = 0;
  int _srvCodParcels = 0;
  double _srvToday = 0, _srvWeek = 0;
  int _srvTodayCount = 0, _srvWeekCount = 0;

  /// GET /earnings data.days: last 7 days, oldest first (empty = not loaded).
  List<ServerEarningDay> _srvDays = const [];


  /// True while refresh() is loading from the API.
  bool get loading => _loading;

  /// Last refresh error (friendly text), null when the last load worked.
  String? get loadError => _loadError;

  // MOCK profile — fake person. Replaced by the API rider after login.
  MockProfile profile = const MockProfile(
    name: 'Juan Dela Cruz',
    riderId: 'RDR-0000-0001',
    status: 'Approved',
    hub: 'Malolos Hub',
    municipality: 'Malolos, Bulacan',
    vehicleType: 'Motorcycle',
    plateNo: 'ABC 1234',
    hubAddress: 'Malolos, Bulacan',
  );

  /// API mode: latest rider payload from GET /me (hub can change after
  /// login). Falls back to the login payload saved in RiderApi.
  Map<String, dynamic>? _meRider;

  /// MOCK: unread chat messages (Messages header icon badge).
  int unreadMessages = 2;

  final List<MockJob> _jobs = [];
  final List<MockRemit> _remits = [];
  final List<MockNotification> _notifications = [];
  double _remitted = 0;
  int _seq = 0;

  List<MockJob> get jobs => List.unmodifiable(_jobs);
  List<MockRemit> get remits => List.unmodifiable(_remits);
  List<MockNotification> get notifications =>
      List.unmodifiable(_notifications);

  List<MockJob> get todo => _jobs.where((j) => !j.isDone).toList();
  List<MockJob> get done => _jobs.where((j) => j.isDone).toList()
    ..sort((a, b) => (b.completedAt ?? DateTime(0))
        .compareTo(a.completedAt ?? DateTime(0)));

  /// The single job surfaced on Home.
  MockJob? get nextJob => todo.isEmpty ? null : todo.first;

  int get activeCount => todo.length;
  int get unreadNotifications => _notifications.where((n) => n.unread).length;

  /// COD collected from delivered parcels and not yet remitted.
  double get codHeld {
    if (!useMock) return _srvCodHeld;
    final collected = _jobs
        .where((j) => j.stage == MockStage.delivered)
        .fold<double>(0, (sum, j) => sum + j.cod);
    final held = collected - _remitted;
    return held < 0 ? 0 : held;
  }

  int get codHeldParcels => !useMock
      ? _srvCodParcels
      : codHeld <= 0
          ? 0
          : _jobs.where((j) => j.stage == MockStage.delivered && j.cod > 0).length;

  bool _isToday(DateTime? at) {
    if (at == null) return false;
    final now = DateTime.now();
    return at.year == now.year && at.month == now.month && at.day == now.day;
  }

  // API mode: earnings come from GET /earnings. data.days holds the per-day
  // split for the last 7 days (server clock, today last). An older server
  // without data.days falls back to the today/week totals.
  ServerEarningDay? get _srvTodayDay => _srvDays.isEmpty ? null : _srvDays.last;

  /// Server days in the current week (Monday .. today). Uses the server's own
  /// "today" date, so the sum matches the server `week` total.
  Iterable<ServerEarningDay> get _srvThisWeek {
    final today = _srvTodayDay?.date;
    if (today == null) return const [];
    final monday = today.subtract(Duration(days: today.weekday - 1));
    return _srvDays.where((d) => !d.date.isBefore(monday));
  }

  Iterable<ServerEarningDay> _srvRange(bool week) =>
      week ? _srvThisWeek : [if (_srvTodayDay != null) _srvTodayDay!];

  int get pickupsToday => !useMock
      ? (_srvTodayDay?.pickupCount ?? 0)
      : _jobs
          .where((j) =>
              j.stage == MockStage.droppedAtHub && _isToday(j.completedAt))
          .length;
  int get deliveriesToday => !useMock
      ? (_srvTodayDay?.deliveryCount ?? _srvTodayCount)
      : _jobs
          .where((j) => j.stage == MockStage.delivered && _isToday(j.completedAt))
          .length;
  double get earnedToday => !useMock
      ? _srvToday
      : pickupsToday * kPickupRate + deliveriesToday * kDeliveryRate;

  /// Per-day job counts, today last. Mock: Mon..today. API: the last 7 days
  /// from data.days ("Earlier" / "Today" only if the server has no split).
  List<({String day, int pickups, int deliveries})> get weekDays => !useMock
      ? _srvDays.isNotEmpty
          ? [
              for (final d in _srvDays)
                (day: d.label, pickups: d.pickupCount, deliveries: d.deliveryCount)
            ]
          : [
          (
            day: 'Earlier',
            pickups: 0,
            deliveries: (_srvWeekCount - _srvTodayCount).clamp(0, 1 << 30)
          ),
          (day: 'Today', pickups: 0, deliveries: _srvTodayCount),
        ]
      : [
          ...kMockWeekBeforeToday,
          (
            day: kMockTodayLabel,
            pickups: pickupsToday,
            deliveries: deliveriesToday
          ),
        ];
  int get pickupsWeek => !useMock
      ? _srvThisWeek.fold(0, (s, d) => s + d.pickupCount)
      : weekDays.fold(0, (s, d) => s + d.pickups);
  int get deliveriesWeek => !useMock
      ? (_srvDays.isEmpty
          ? _srvWeekCount
          : _srvThisWeek.fold(0, (s, d) => s + d.deliveryCount))
      : weekDays.fold(0, (s, d) => s + d.deliveries);
  double get earnedWeek => !useMock
      ? _srvWeek
      : pickupsWeek * kPickupRate + deliveriesWeek * kDeliveryRate;

  /// Peso amounts for the Wallet breakdown. Mock: count × rate.
  /// API: what the server recorded ("delivery" also holds any other type,
  /// so pickup + delivery always equals the total).
  double pickupAmount({required bool week}) => !useMock
      ? _srvRange(week).fold(0.0, (s, d) => s + d.pickup)
      : (week ? pickupsWeek : pickupsToday) * kPickupRate;
  double deliveryAmount({required bool week}) => !useMock
      ? (_srvDays.isEmpty
          ? (week ? _srvWeek : _srvToday)
          : _srvRange(week).fold(0.0, (s, d) => s + d.total - d.pickup))
      : (week ? deliveriesWeek : deliveriesToday) * kDeliveryRate;

  /// Weekly chart bars in pesos, today last. API: real per-day earnings for
  /// the last 7 days (0.00 days included). Mock: counts × mock rates.
  List<({String day, double pickup, double delivery})> get weekBars =>
      !useMock && _srvDays.isNotEmpty
          ? [
              for (final d in _srvDays)
                (day: d.label, pickup: d.pickup, delivery: d.total - d.pickup)
            ]
          : [
              for (final d in weekDays)
                (
                  day: d.day,
                  pickup: d.pickups * kPickupRate,
                  delivery: d.deliveries * kDeliveryRate
                )
            ];

  MockJob? byId(String id) {
    for (final j in _jobs) {
      if (j.id == id) return j;
    }
    return null;
  }

  MockJob? byTracking(String tracking) {
    final code = tracking.trim().toUpperCase();
    for (final j in _jobs) {
      if (j.tracking.toUpperCase() == code) return j;
    }
    return null;
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  //
  // Each action has two paths:
  //  - useMock == true : the original in-memory MOCK behaviour.
  //  - useMock == false: calls /api/rider-app/* and updates the job from the
  //    server response. API errors are thrown as ApiException (its message
  //    is safe to show in a SnackBar).

  /// Pull-to-refresh / first load. Never throws; see [loadError].
  Future<void> refresh() async {
    if (useMock) {
      await Future<void>.delayed(kMockRefreshDelay);
      notifyListeners();
      return;
    }
    if (!_api.hasToken || _loading) return;
    _loading = true;
    notifyListeners();
    try {
      await _loadAll();
      _loadError = null;
    } on ApiException catch (e) {
      _loadError = e.message;
    } catch (e) {
      debugPrint('RiderMock.refresh failed: $e');
      _loadError = 'Could not load your jobs. Pull down to try again.';
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  /// API mode: after a successful login, use the server rider and load data.
  Future<void> onLoggedIn() async {
    _applyProfile();
    await refresh();
  }

  /// API mode: forget everything from the previous rider.
  void clearSession() {
    _jobs.clear();
    _remits.clear();
    _notifications.clear();
    _meRider = null;
    _srvCodHeld = 0;
    _srvCodParcels = 0;
    _srvToday = _srvWeek = 0;
    _srvTodayCount = _srvWeekCount = 0;
    _srvDays = const [];
    _loadError = null;
    notifyListeners();
  }

  /// Logs out on the server (best effort) and clears local state.
  Future<void> signOut() async {
    if (useMock) return;
    await _api.logout();
    clearSession();
  }

  /// 1 → 2: waybill scanned at the seller.
  Future<void> markPickedUp(MockJob job, {String? waybill}) async {
    if (job.stage != MockStage.readyToPickUp) return;
    if (!useMock && job.serverId != null) {
      await _api.post('/pickups/${job.serverId}/scan',
          {'waybill_number': (waybill ?? job.tracking).trim()});
      job.stage = MockStage.pickedUp;
      job.pickedUpAt = DateTime.now();
      notifyListeners();
      return;
    }
    job.stage = MockStage.pickedUp;
    job.pickedUpAt = DateTime.now();
    notifyListeners();
  }

  /// 2 → 3: pickup handed over at the hub.
  /// API mode: POST /pickups/{id}/drop-at-hub (server records it once; a
  /// repeat is a no-op). MOCK mode: in memory only.
  Future<void> dropAtHub(MockJob job) async {
    if (job.stage != MockStage.pickedUp) return;
    DateTime? at;
    if (!useMock && job.serverId != null) {
      final body = await _api.post('/pickups/${job.serverId}/drop-at-hub');
      final data = (body['data'] as Map?)?.cast<String, dynamic>();
      at = DateTime.tryParse('${data?['dropped_at']}')?.toLocal();
    }
    job.stage = MockStage.droppedAtHub;
    job.completedAt = at ?? DateTime.now();
    notifyListeners();
  }

  /// 4 → 5: rider leaves the hub with the parcel.
  Future<void> startDelivery(MockJob job) async {
    if (job.stage != MockStage.readyToDeliver) return;
    if (!useMock && job.serverId != null) {
      await _deliveryAction(job, 'out-for-delivery');
      return;
    }
    job.stage = MockStage.outForDelivery;
    notifyListeners();
  }

  /// POD photo. API mode uploads [photo] (JPG/PNG, max 5 MB).
  Future<void> markPodTaken(MockJob job, {UploadFile? photo}) async {
    if (!useMock && job.serverId != null) {
      if (photo == null) throw const ApiException('Take the photo first.');
      final body = await _api.upload('/deliveries/${job.serverId}/pod', photo);
      _applyDeliveryBody(job, body);
      return;
    }
    job.podTaken = true;
    notifyListeners();
  }

  /// API mode: asks the server to issue a new buyer OTP. Returns the
  /// debug_otp ONLY in debug builds (for the demo hint), otherwise null.
  Future<String?> requestOtp(MockJob job) async {
    if (useMock || job.serverId == null) return null;
    final body = await _api.post('/deliveries/${job.serverId}/otp');
    return kDebugMode ? body['debug_otp'] as String? : null;
  }

  /// MOCK: any 6 digits are accepted except all-same digits.
  /// API mode: only checks the format here and keeps the code in memory;
  /// the server checks it when the delivery is completed.
  bool verifyOtp(MockJob job, String otp) {
    if (!useMock && job.serverId != null) {
      final ok = RegExp('^\\d{$kOtpLength}\$').hasMatch(otp);
      if (ok) {
        job.enteredOtp = otp;
        job.otpVerified = true;
        notifyListeners();
      }
      return ok;
    }
    final ok = RegExp('^\\d{$kOtpLength}\$').hasMatch(otp) &&
        !RegExp('^(\\d)\\1+\$').hasMatch(otp);
    if (ok) {
      job.otpVerified = true;
      notifyListeners();
    }
    return ok;
  }

  /// 5 → 6: COD collected (or prepaid confirmed). Returns the payout earned.
  /// API mode: POST deliver {otp, cod_collected}. A wrong/expired code sends
  /// the rider back to the OTP step.
  Future<double> completeDelivery(MockJob job) async {
    if (job.stage != MockStage.outForDelivery ||
        !job.podTaken ||
        !job.otpVerified) {
      return 0;
    }
    if (!useMock && job.serverId != null) {
      final otp = job.enteredOtp;
      try {
        final body = await _api.post('/deliveries/${job.serverId}/deliver', {
          'otp': otp,
          if (job.cod > 0) 'cod_collected': job.cod,
        });
        job.enteredOtp = null;
        _applyDeliveryBody(job, body);
        unawaitedSafe(_reloadWallet());
        return (body['earned'] as num?)?.toDouble() ?? kDeliveryRate;
      } on ApiException catch (e) {
        if (e.field == 'otp') {
          job.enteredOtp = null;
          job.otpVerified = false;
          notifyListeners();
        } else if (e.field == 'photo') {
          job.podTaken = false;
          notifyListeners();
        }
        rethrow;
      }
    }
    job.stage = MockStage.delivered;
    job.completedAt = DateTime.now();
    notifyListeners();
    return kDeliveryRate;
  }

  /// UI reason label → API reason key (DeliveryJob::FAIL_REASONS).
  static String _reasonKey(String label) => switch (label) {
        'Buyer not around' => 'buyer_not_around',
        'Wrong address' => 'wrong_address',
        'Refused' => 'refused',
        _ => 'other',
      };

  /// 5 → 7: records a failed attempt with its reason.
  Future<void> failAttempt(MockJob job, String reason) async {
    if (job.stage != MockStage.outForDelivery) return;
    if (!useMock && job.serverId != null) {
      final key = _reasonKey(reason);
      await _deliveryAction(job, 'fail', {
        'reason': key,
        // The API requires a note for "other".
        if (key == 'other') 'note': 'Other (reported in the rider app)',
      });
      job.enteredOtp = null;
      job.otpVerified = false;
      return;
    }
    job.failReasons.add(reason);
    job.podTaken = false;
    job.otpVerified = false;
    job.stage = MockStage.failedAttempt;
    notifyListeners();
  }

  /// 7 → 5: next attempt (only below 3/3).
  Future<void> retryDelivery(MockJob job) async {
    if (job.stage != MockStage.failedAttempt || job.isFinalAttempt) return;
    if (!useMock && job.serverId != null) {
      await _deliveryAction(job, 'out-for-delivery');
      return;
    }
    job.attempt += 1;
    job.stage = MockStage.outForDelivery;
    notifyListeners();
  }

  /// 7 (3/3) → returned to hub (API: return to sender).
  Future<void> returnToHub(MockJob job) async {
    if (job.stage != MockStage.failedAttempt || !job.isFinalAttempt) return;
    if (!useMock && job.serverId != null) {
      await _deliveryAction(job, 'return');
      unawaitedSafe(_reloadNotifications());
      return;
    }
    job.stage = MockStage.returnedToHub;
    job.completedAt = DateTime.now();
    notifyListeners();
  }

  /// Remits all held COD. API mode returns the server reference.
  Future<String?> remitCod() async {
    if (!useMock) {
      final body = await _api.post('/cod/remit');
      final ref = (body['data'] as Map?)?['reference'] as String?;
      await Future.wait([_reloadWallet(), _reloadNotifications()]);
      return ref;
    }
    final amount = codHeld;
    if (amount <= 0) return null;
    final ref = 'RMT-${10300 + _remits.length}';
    _remits.insert(0, MockRemit(ref, amount, DateTime.now(), codHeldParcels));
    _remitted += amount;
    notifyListeners();
    return ref;
  }

  void markAllNotificationsRead() {
    for (final n in _notifications) {
      n.unread = false;
    }
    notifyListeners();
    if (!useMock) unawaitedSafe(_api.post('/notifications/all/read'));
  }

  void markNotificationRead(MockNotification n) {
    if (!n.unread) return;
    n.unread = false;
    notifyListeners();
    if (!useMock && n.serverId != null) {
      unawaitedSafe(_api.post('/notifications/${n.serverId}/read'));
    }
  }

  // ── API helpers ───────────────────────────────────────────────────────────

  /// Runs a fire-and-forget call; errors are only logged.
  static void unawaitedSafe(Future<Object?> f) {
    f.catchError((Object e) {
      debugPrint('RiderMock background call failed: $e');
      return null;
    });
  }

  Future<void> _deliveryAction(MockJob job, String action,
      [Map<String, dynamic>? json]) async {
    final body =
        await _api.post('/deliveries/${job.serverId}/$action', json);
    _applyDeliveryBody(job, body);
  }

  void _applyDeliveryBody(MockJob job, Map<String, dynamic> body) {
    final data = body['data'];
    if (data is Map) _applyDelivery(job, data.cast<String, dynamic>());
    notifyListeners();
  }

  void _applyProfile() {
    final r = _meRider ?? _api.rider;
    if (r == null) return;
    final status = (r['status'] as String? ?? 'active');
    final hub = (r['hub'] as Map?)?.cast<String, dynamic>();
    final hubName = _str(hub?['name']);
    final company = _str(r['courier_company']);
    profile = MockProfile(
      name: (r['name'] as String?)?.trim().isNotEmpty == true
          ? (r['name'] as String).trim()
          : 'Rider',
      riderId: 'RDR-${r['personnel_id'] ?? r['user_id'] ?? '-'}',
      status: status.isEmpty
          ? 'Active'
          : '${status[0].toUpperCase()}${status.substring(1)}',
      // Hub = branch from the approved rider application (GET /me "hub").
      hub: hubName.isNotEmpty ? hubName : 'your hub',
      hubAddress: _str(hub?['address']).isEmpty ? null : _str(hub?['address']),
      hubAssigned: hubName.isNotEmpty,
      courierCompany: company.isEmpty ? null : company,
      // TODO(api): municipality is not in the rider API yet.
      municipality: '-',
      // Vehicle from the approved rider application (GET /me); '-' if none.
      vehicleType: _vehicleLabel(_str(r['vehicle_type'])),
      plateNo: _str(r['plate_number']).trim().isEmpty
          ? '-'
          : _str(r['plate_number']).trim(),
    );
  }

  static String _vehicleLabel(String v) {
    final s = v.trim();
    if (s.isEmpty) return '-';
    return '${s[0].toUpperCase()}${s.substring(1).toLowerCase()}';
  }

  /// API mode: POST /check-in or /check-out (idempotent on the server).
  /// Throws ApiException on failure so the shift switch can roll back.
  /// Mock mode: no-op (the local repository keeps the shift state).
  Future<void> setOnline(bool online) async {
    if (useMock || !_api.hasToken) return;
    final body = await _api.post(online ? '/check-in' : '/check-out');
    final data = (body['data'] as Map?)?.cast<String, dynamic>();
    if (_meRider != null && data != null) {
      _meRider = {..._meRider!, ...data};
    }
  }

  Future<void> _loadAll() async {
    try {
      final me = await _api.get('/me');
      _meRider = ((me['data'] as Map?)?['rider'] as Map?)?.cast<String, dynamic>();
      // Keep the server shift status in line with the app's switch (e.g.
      // the rider went online before this build, or the server was reset).
      final serverOnline = _meRider?['is_online'];
      if (serverOnline is bool && serverOnline != riderOnline.value) {
        unawaited(setOnline(riderOnline.value).catchError((Object e) {
          debugPrint('RiderMock shift sync failed: $e');
        }));
      }
    } on ApiException catch (e) {
      if (e.isUnauthorized) rethrow;
      // Keep the saved login payload if /me fails.
    }
    _applyProfile();
    final lists = await Future.wait([
      _api.get('/deliveries?status=all&per_page=50'),
      _api.get('/pickups?per_page=50'),
    ]);
    final deliveryIds = _ids(lists[0]);
    final pickupIds = _ids(lists[1]);

    // Detail calls carry buyer/seller contact info that the lists do not.
    final details = await Future.wait([
      for (final id in deliveryIds) _api.get('/deliveries/$id'),
      for (final id in pickupIds) _api.get('/pickups/$id'),
    ]);

    final fresh = <MockJob>[];
    for (var i = 0; i < details.length; i++) {
      final data = details[i]['data'];
      if (data is! Map) continue;
      final d = data.cast<String, dynamic>();
      final isDelivery = i < deliveryIds.length;
      final id = isDelivery ? deliveryIds[i] : pickupIds[i - deliveryIds.length];
      final key = '${isDelivery ? 'D' : 'P'}$id';
      final job = byId(key) ??
          MockJob(
            id: key,
            serverId: id,
            type: isDelivery ? MockJobType.delivery : MockJobType.pickup,
            tracking: '',
            stage: isDelivery ? MockStage.readyToDeliver : MockStage.readyToPickUp,
            sellerName: '',
            sellerPhone: '',
            sellerAddress: '',
            sellerArea: '',
            buyerName: '',
            buyerPhone: '',
            buyerAddress: '',
            buyerArea: '',
            item: '',
          );
      final keep = isDelivery ? _applyDelivery(job, d) : _applyPickup(job, d);
      if (keep) fresh.add(job);
    }
    _jobs
      ..clear()
      ..addAll(fresh);

    await Future.wait([_reloadWallet(), _reloadNotifications()]);
  }

  static List<int> _ids(Map<String, dynamic> listBody) => [
        for (final row in (listBody['data'] as List? ?? const []))
          if (row is Map && row['id'] is num) (row['id'] as num).toInt(),
      ];

  Future<void> _reloadWallet() async {
    final res = await Future.wait([_api.get('/cod'), _api.get('/earnings')]);
    final cod = (res[0]['data'] as Map?)?.cast<String, dynamic>() ?? const {};
    final earn = (res[1]['data'] as Map?)?.cast<String, dynamic>() ?? const {};
    _srvCodHeld = (cod['held_amount'] as num?)?.toDouble() ?? 0;
    _srvCodParcels = (cod['held_parcels'] as num?)?.toInt() ?? 0;
    _remits
      ..clear()
      ..addAll([
        for (final r in (cod['remittances'] as List? ?? const []))
          if (r is Map)
            MockRemit(
              r['reference'] as String? ?? '-',
              (r['amount'] as num?)?.toDouble() ?? 0,
              DateTime.tryParse(r['remitted_at'] as String? ?? '')?.toLocal() ??
                  DateTime.now(),
              (r['parcels_count'] as num?)?.toInt() ?? 0,
            ),
      ]);
    _srvToday = (earn['today'] as num?)?.toDouble() ?? 0;
    _srvTodayCount = (earn['today_count'] as num?)?.toInt() ?? 0;
    _srvWeek = (earn['week'] as num?)?.toDouble() ?? 0;
    _srvWeekCount = (earn['week_count'] as num?)?.toInt() ?? 0;
    _srvDays = (earn['days'] as List? ?? const [])
        .whereType<Map>()
        .map((d) => ServerEarningDay.tryParse(d.cast<String, dynamic>()))
        .whereType<ServerEarningDay>()
        .toList(growable: false);
    notifyListeners();
  }

  Future<void> _reloadNotifications() async {
    final body = await _api.get('/notifications');
    _notifications
      ..clear()
      ..addAll([
        for (final n in (body['data'] as List? ?? const []))
          if (n is Map)
            MockNotification(
              n['title'] as String? ?? '',
              n['body'] as String? ?? '',
              DateTime.tryParse(n['created_at'] as String? ?? '')?.toLocal() ??
                  DateTime.now(),
              jobId: n['delivery_job_id'] is num
                  ? 'D${(n['delivery_job_id'] as num).toInt()}'
                  : null,
              unread: n['unread'] == true,
              serverId: (n['id'] as num?)?.toInt(),
            ),
      ]);
    notifyListeners();
  }

  static String _str(Object? v) => v == null ? '' : v.toString();

  /// "Street, Barangay, City, Province" → "Barangay" (best effort).
  static String _areaOf(String address) {
    final parts = address
        .split(',')
        .map((p) => p.trim())
        .where((p) => p.isNotEmpty)
        .toList();
    if (parts.length >= 3) return parts[1];
    return parts.isEmpty ? '-' : parts.first;
  }

  static MockStage _deliveryStage(String s) => switch (s) {
        'out_for_delivery' => MockStage.outForDelivery,
        'delivered' => MockStage.delivered,
        'failed' => MockStage.failedAttempt,
        'return_to_sender' => MockStage.returnedToHub,
        _ => MockStage.readyToDeliver, // assigned
      };

  /// Copies a /deliveries/{id} payload into [job]. Always kept.
  bool _applyDelivery(MockJob job, Map<String, dynamic> d) {
    final stage = _deliveryStage(_str(d['status']));
    final count = (d['attempt_count'] as num?)?.toInt() ?? 0;
    final max = (d['max_attempts'] as num?)?.toInt() ?? kMaxDeliveryAttempts;
    final buyer = (d['buyer'] as Map?)?.cast<String, dynamic>() ?? const {};
    final seller = (d['seller'] as Map?)?.cast<String, dynamic>() ?? const {};
    final hub = (d['hub'] as Map?)?.cast<String, dynamic>();
    final items = (d['items'] as List? ?? const [])
        .whereType<Map>()
        .map((i) => '${_str(i['name'])} (x${_str(i['quantity'])})')
        .toList();

    if (stage != MockStage.outForDelivery) {
      job.otpVerified = false;
      job.enteredOtp = null;
    }
    job
      ..tracking = _str(d['waybill_number']).isNotEmpty
          ? _str(d['waybill_number'])
          : _str(d['order_number'])
      ..stage = stage
      ..attempt = (stage == MockStage.outForDelivery ||
                  stage == MockStage.readyToDeliver
              ? count + 1
              : (count < 1 ? 1 : count))
          .clamp(1, max)
      ..failReasons = [
        for (final f in (d['failure_reasons'] as List? ?? const []))
          if (f is Map) _str(f['label'] ?? f['reason']),
      ]
      ..podTaken = d['pod_uploaded'] == true
      ..cod = (d['cod_amount'] as num?)?.toDouble() ?? 0
      ..buyerName = _str(buyer['name'] ?? d['buyer_name'])
      ..buyerPhone = _str(buyer['phone'])
      ..buyerAddress = _str(buyer['address'] ?? d['address'])
      ..sellerName = _str(seller['name'])
      ..sellerPhone = _str(seller['phone'])
      ..sellerAddress = hub != null ? _str(hub['name']) : _str(seller['address'])
      ..sellerArea = hub != null ? _str(hub['city']) : '-'
      ..item = items.isEmpty ? 'Parcel' : items.join(', ')
      ..assignedAt = DateTime.tryParse(_str(d['assigned_at']))?.toLocal()
      ..completedAt = DateTime.tryParse(
              _str(d['delivered_at'] ?? d['returned_at']))
          ?.toLocal();
    job.buyerArea = _areaOf(job.buyerAddress);
    return true;
  }

  /// Copies a /pickups/{id} payload into [job]. Failed/cancelled pickups have
  /// no rider stage in the redesign, so they are left out (returns false).
  bool _applyPickup(MockJob job, Map<String, dynamic> d) {
    final status = _str(d['pickup_status']);
    final MockStage stage;
    switch (status) {
      case 'pending_pickup':
      case 'scheduled':
        stage = MockStage.readyToPickUp;
      case 'picked_up':
        stage = d['dropped_at_hub'] is Map
            ? MockStage.droppedAtHub
            : MockStage.pickedUp;
      default:
        return false;
    }
    final seller = (d['seller'] as Map?)?.cast<String, dynamic>() ?? const {};
    final count = (d['items_count'] as num?)?.toInt() ?? 0;
    job
      ..tracking = _str(d['waybill_number']).isNotEmpty
          ? _str(d['waybill_number'])
          : _str(d['order_number'])
      ..stage = stage
      ..sellerName = _str(seller['name']).isEmpty ? 'Seller' : _str(seller['name'])
      ..sellerPhone = _str(seller['phone'])
      ..sellerAddress = _str(seller['address'])
      ..item = count > 0 ? '$count item${count == 1 ? '' : 's'}' : 'Parcel'
      ..weight = d['weight'] == null ? '-' : '${_str(d['weight'])} kg';
    job.sellerArea = _areaOf(job.sellerAddress);
    if (stage == MockStage.droppedAtHub) {
      final drop = (d['dropped_at_hub'] as Map?)?.cast<String, dynamic>();
      job.completedAt ??=
          DateTime.tryParse('${drop?['dropped_at']}')?.toLocal() ?? DateTime.now();
    }
    return true;
  }

  void markMessagesRead() {
    if (unreadMessages == 0) return;
    unreadMessages = 0;
    notifyListeners();
  }

  /// MOCK: simulates the hub directly assigning a new job. The full address
  /// is available immediately; a notification lands in the bell.
  void simulateAssignment() {
    _seq++;
    final isPickup = _seq.isOdd;
    final job = isPickup
        ? _pickup('MM-2611-${9100 + _seq}', 'Aling Rosa Store',
            'Blk 4 Lot 12, Sto. Rosario, Malolos, Bulacan', 'Sto. Rosario',
            'Bag (1 pc)',
            lat: 14.8471, lng: 120.8036)
        : _delivery('MM-2611-${9100 + _seq}', 'Carlo Mendoza',
            '23 Mabini St., Bulihan, Malolos, Bulacan', 'Bulihan', 780,
            'Phone case (2 pcs)',
            lat: 14.8652, lng: 120.8247);
    _jobs.add(job);
    _notifications.insert(
      0,
      MockNotification(
        'New ${isPickup ? 'pickup' : 'delivery'} assigned',
        '${job.tracking} · ${job.address}',
        DateTime.now(),
        jobId: job.id,
      ),
    );
    notifyListeners();
  }

  // ── MOCK seed ─────────────────────────────────────────────────────────────

  static int _idSeq = 0;

  static MockJob _pickup(String tracking, String seller, String address,
          String area, String item,
          {MockStage stage = MockStage.readyToPickUp,
          double? lat,
          double? lng}) =>
      MockJob(
        id: 'J${++_idSeq}',
        type: MockJobType.pickup,
        tracking: tracking,
        stage: stage,
        sellerName: seller,
        sellerPhone: '0917000${(1000 + _idSeq)}',
        sellerAddress: address,
        sellerArea: area,
        buyerName: '-',
        buyerPhone: '',
        buyerAddress: '-',
        buyerArea: '-',
        item: item,
        sellerLat: lat,
        sellerLng: lng,
        assignedAt: DateTime.now().subtract(const Duration(minutes: 25)),
      );

  static MockJob _delivery(String tracking, String buyer, String address,
          String area, double cod, String item,
          {MockStage stage = MockStage.readyToDeliver,
          int attempt = 1,
          List<String>? failReasons,
          double? lat,
          double? lng}) =>
      MockJob(
        id: 'J${++_idSeq}',
        type: MockJobType.delivery,
        tracking: tracking,
        stage: stage,
        sellerName: 'Mimoo Seller',
        sellerPhone: '',
        sellerAddress: 'Malolos Hub',
        sellerArea: 'Malolos Hub',
        buyerName: buyer,
        buyerPhone: '0918000${(1000 + _idSeq)}',
        buyerAddress: address,
        buyerArea: area,
        item: item,
        cod: cod,
        attempt: attempt,
        failReasons: failReasons,
        buyerLat: lat,
        buyerLng: lng,
        assignedAt: DateTime.now().subtract(const Duration(minutes: 40)),
      );

  static List<MockJob> _seedJobs() {
    final now = DateTime.now();
    return [
      // To do (5 = max active)
      _pickup('MM-2611-0001', 'Bulacan Crafts PH',
          '118 Paseo del Congreso, Catmon, Malolos, Bulacan', 'Catmon',
          'Rattan basket (1 pc)',
          lat: 14.8612, lng: 120.8158),
      _delivery('MM-2611-0002', 'Maria Santos',
          '45 Rizal Ave., Brgy. Sumapang Matanda, Malolos, Bulacan',
          'Sumapang Matanda', 1250, 'Sneakers (1 pair)',
          stage: MockStage.outForDelivery, lat: 14.8561, lng: 120.8242),
      _pickup('MM-2611-0003', "Nanay's Kitchen",
          '7 Purok 3, Longos, Malolos, Bulacan', 'Longos', 'Ube jam (6 jars)',
          stage: MockStage.pickedUp, lat: 14.8318, lng: 120.8112)
        ..pickedUpAt = now.subtract(const Duration(minutes: 15)),
      _delivery('MM-2611-0004', 'Jose Ramos',
          '89 MacArthur Hwy., Dakila, Malolos, Bulacan', 'Dakila', 499,
          'Wireless earbuds (1 pc)',
          lat: 14.8372, lng: 120.8263),
      _delivery('MM-2611-0005', 'Liza Cruz',
          '12 Sampaguita St., Tikay, Malolos, Bulacan', 'Tikay', 0,
          'Book (prepaid)',
          stage: MockStage.failedAttempt,
          failReasons: ['Buyer not around'],
          lat: 14.8641, lng: 120.8368),
      // Done today
      _pickup('MM-2611-0006', 'Mang Ben Hardware',
          '3 Plaridel Rd., Guinhawa, Malolos, Bulacan', 'Guinhawa',
          'Tool set (1 box)',
          stage: MockStage.droppedAtHub, lat: 14.8462, lng: 120.8183)
        ..completedAt = now.subtract(const Duration(hours: 3)),
      _delivery('MM-2611-0007', 'Ana Villanueva',
          '56 Del Pilar St., San Vicente, Malolos, Bulacan', 'San Vicente',
          650, 'Dress (1 pc)',
          stage: MockStage.delivered, lat: 14.8438, lng: 120.8121)
        ..completedAt = now.subtract(const Duration(hours: 2)),
      _delivery('MM-2611-0008', 'Ramon Garcia',
          '201 Bagong Bayan, Malolos, Bulacan', 'Bagong Bayan', 320,
          'Phone charger (1 pc)',
          stage: MockStage.delivered, lat: 14.8506, lng: 120.8129)
        ..completedAt = now.subtract(const Duration(minutes: 70)),
      _delivery('MM-2611-0009', 'Pia Lopez',
          '9 Luna St., Mojon, Malolos, Bulacan', 'Mojon', 899, 'Shoes (1 pair)',
          stage: MockStage.returnedToHub,
          attempt: 3,
          failReasons: ['Buyer not around', 'Buyer not around', 'Refused'],
          lat: 14.8579, lng: 120.8133)
        ..completedAt = now.subtract(const Duration(minutes: 40)),
    ];
  }

  void _seedRest() {
    final now = DateTime.now();
    _remits.addAll([
      MockRemit('RMT-10233', 2140, now.subtract(const Duration(days: 1)), 5),
      MockRemit('RMT-10198', 1785, now.subtract(const Duration(days: 2)), 4),
    ]);
    _notifications.addAll([
      MockNotification(
        'New pickup assigned',
        'MM-2611-0001 · 118 Paseo del Congreso, Catmon, Malolos, Bulacan',
        now.subtract(const Duration(minutes: 12)),
        jobId: 'J1',
      ),
      MockNotification(
        'COD reminder',
        'Remit your COD before $kCodDueTime to avoid account holds.',
        now.subtract(const Duration(hours: 1)),
        unread: false,
      ),
    ]);
  }

  /// MOCK (debug State gallery): one standalone job per design state.
  /// These are NOT in the store; actions on them only change the sample.
  static List<MockJob> galleryJobs() => [
        _pickup('GAL-0001', 'Sample Seller', '1 Sample St., Malolos, Bulacan',
            'Catmon', 'Sample parcel'),
        _pickup('GAL-0002', 'Sample Seller', '1 Sample St., Malolos, Bulacan',
            'Longos', 'Sample parcel',
            stage: MockStage.pickedUp),
        _pickup('GAL-0003', 'Sample Seller', '1 Sample St., Malolos, Bulacan',
            'Guinhawa', 'Sample parcel',
            stage: MockStage.droppedAtHub)
          ..completedAt = DateTime.now(),
        _delivery('GAL-0004', 'Sample Buyer', '2 Sample Ave., Malolos, Bulacan',
            'Dakila', 499, 'Sample parcel'),
        _delivery('GAL-0005', 'Sample Buyer', '2 Sample Ave., Malolos, Bulacan',
            'Sumapang Matanda', 1250, 'Sample parcel',
            stage: MockStage.outForDelivery),
        _delivery('GAL-0006', 'Sample Buyer', '2 Sample Ave., Malolos, Bulacan',
            'San Vicente', 650, 'Sample parcel',
            stage: MockStage.delivered)
          ..completedAt = DateTime.now(),
        _delivery('GAL-0007', 'Sample Buyer', '2 Sample Ave., Malolos, Bulacan',
            'Tikay', 0, 'Sample parcel',
            stage: MockStage.failedAttempt,
            failReasons: ['Buyer not around']),
        _delivery('GAL-0008', 'Sample Buyer', '2 Sample Ave., Malolos, Bulacan',
            'Mojon', 899, 'Sample parcel',
            stage: MockStage.failedAttempt,
            attempt: 3,
            failReasons: ['Buyer not around', 'Wrong address', 'Refused']),
        _delivery('GAL-0009', 'Sample Buyer', '2 Sample Ave., Malolos, Bulacan',
            'Mojon', 899, 'Sample parcel',
            stage: MockStage.returnedToHub,
            attempt: 3,
            failReasons: ['Buyer not around', 'Wrong address', 'Refused'])
          ..completedAt = DateTime.now(),
        // MAP samples: open the card to see the detail screen.
        _pickup('GAL-0010', 'Sample Seller (with map)',
            '118 Paseo del Congreso, Catmon, Malolos, Bulacan', 'Catmon',
            'Sample parcel',
            lat: 14.8612, lng: 120.8158),
        _delivery('GAL-0011', 'Sample Buyer (no map)',
            '2 Sample Ave., Malolos, Bulacan', 'Dakila', 499, 'Sample parcel',
            stage: MockStage.outForDelivery),
      ];
}
