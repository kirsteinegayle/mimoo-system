import 'api_service.dart';
import '../models/courier_models.dart';

/// Single repository for all /api/courier-app/* calls.
class CourierRepository {
  CourierRepository._();
  static final CourierRepository instance = CourierRepository._();

  static const String _prefix = '/courier-app';

  // ── Auth ──────────────────────────────────────────────────────────────────

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final res = await ApiService.post(
      '$_prefix/login',
      body: {'email': email, 'password': password},
      includeAuth: false,
    ) as Map<String, dynamic>;
    final data = res['data'] as Map<String, dynamic>;
    return {
      'token': data['token'] as String,
      'courier': CourierUser.fromJson(data['courier'] as Map<String, dynamic>),
    };
  }

  Future<void> logout() async {
    await ApiService.post('$_prefix/logout');
  }

  Future<CourierUser> me() async {
    final res = await ApiService.get('$_prefix/me') as Map<String, dynamic>;
    return CourierUser.fromJson((res['data'] as Map<String, dynamic>)['courier']
        as Map<String, dynamic>);
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────

  Future<DashboardStats> dashboard() async {
    final res =
        await ApiService.get('$_prefix/dashboard') as Map<String, dynamic>;
    return DashboardStats.fromJson(res['data'] as Map<String, dynamic>);
  }

  // ── Shipments ─────────────────────────────────────────────────────────────

  Future<({List<ShipmentSummary> items, PageMeta meta})> shipments({
    String? status,
    String? dateFrom,
    String? dateTo,
    int page = 1,
  }) async {
    final params = <String, String>{'page': '$page'};
    if (status != null && status != 'all') params['status'] = status;
    if (dateFrom != null) params['date_from'] = dateFrom;
    if (dateTo != null) params['date_to'] = dateTo;

    final res = await ApiService.get(
      '$_prefix/shipments',
      queryParameters: params,
    ) as Map<String, dynamic>;

    final items = (res['data'] as List<dynamic>)
        .map((j) => ShipmentSummary.fromJson(j as Map<String, dynamic>))
        .toList();
    final meta = PageMeta.fromJson(res['meta'] as Map<String, dynamic>);
    return (items: items, meta: meta);
  }

  Future<ShipmentDetail> shipmentDetail(int id) async {
    final res =
        await ApiService.get('$_prefix/shipments/$id') as Map<String, dynamic>;
    return ShipmentDetail.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<void> acceptShipment(int id) async {
    await ApiService.post('$_prefix/shipments/$id/accept');
  }

  Future<void> rejectShipment(int id, String reason) async {
    await ApiService.post(
      '$_prefix/shipments/$id/reject',
      body: {'reason': reason},
    );
  }

  // ── Pickups ───────────────────────────────────────────────────────────────

  Future<
      ({
        List<PickupSummary> items,
        Map<String, int> stats,
        List<PersonnelItem> personnel,
        PageMeta meta
      })> pickups({String? status, int page = 1}) async {
    final params = <String, String>{'page': '$page'};
    if (status != null && status != 'all') params['status'] = status;

    final res = await ApiService.get(
      '$_prefix/pickups',
      queryParameters: params,
    ) as Map<String, dynamic>;

    final items = (res['data'] as List<dynamic>)
        .map((j) => PickupSummary.fromJson(j as Map<String, dynamic>))
        .toList();
    final statsRaw = res['stats'] as Map<String, dynamic>? ?? {};
    final stats = statsRaw.map((k, v) => MapEntry(k, (v as num).toInt()));
    final personnel = (res['personnel'] as List<dynamic>? ?? [])
        .map((j) => PersonnelItem.fromJson(j as Map<String, dynamic>))
        .toList();
    final meta = PageMeta.fromJson(res['meta'] as Map<String, dynamic>);
    return (items: items, stats: stats, personnel: personnel, meta: meta);
  }

  Future<void> schedulePickup(int id, String date, String timeWindow) async {
    await ApiService.post(
      '$_prefix/pickups/$id/schedule',
      body: {'scheduled_date': date, 'scheduled_time_window': timeWindow},
    );
  }

  Future<void> assignPersonnel(int pickupId, int personnelId) async {
    await ApiService.post(
      '$_prefix/pickups/$pickupId/assign-personnel',
      body: {'personnel_id': personnelId},
    );
  }

  Future<void> confirmPickup(int id, String waybill) async {
    await ApiService.post(
      '$_prefix/pickups/$id/confirm',
      body: {'scanned_waybill': waybill},
    );
  }

  Future<void> recordFailed(int id, String reason) async {
    await ApiService.post(
      '$_prefix/pickups/$id/record-failed',
      body: {'reason': reason},
    );
  }

  // ── Scanning ──────────────────────────────────────────────────────────────

  Future<List<FacilityItem>> facilities() async {
    final res =
        await ApiService.get('$_prefix/facilities') as Map<String, dynamic>;
    return (res['data'] as List<dynamic>)
        .map((j) => FacilityItem.fromJson(j as Map<String, dynamic>))
        .toList();
  }

  Future<ParcelInfo> parcelByWaybill(String waybill) async {
    final res = await ApiService.get('$_prefix/parcel/$waybill')
        as Map<String, dynamic>;
    return ParcelInfo.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<void> scanParcel(String waybill, int facilityId) async {
    await ApiService.post(
      '$_prefix/scan-parcel',
      body: {'waybill_number': waybill, 'facility_id': facilityId},
    );
  }
}
