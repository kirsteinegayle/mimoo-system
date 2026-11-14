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
    final response = await ApiService.get('$_prefix/shipments/$id');
    if (response is! Map<String, dynamic>) {
      throw const FormatException(
          'Shipment detail response must be a JSON object.');
    }
    final data = response['data'];
    if (data is! Map<String, dynamic>) {
      throw const FormatException(
          'Shipment detail response is missing its data object.');
    }
    return ShipmentDetail.fromJson(data);
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

  // ── Notifications ────────────────────────────────────────────────────────

  Future<({List<CourierNotificationItem> items, PageMeta meta})> notifications({
    String filter = 'all',
    String category = 'all',
    int page = 1,
  }) async {
    final params = <String, String>{'page': '$page'};
    if (filter != 'all') params['filter'] = filter;
    if (category != 'all') params['category'] = category;

    final res = await ApiService.get(
      '$_prefix/notifications',
      queryParameters: params,
    ) as Map<String, dynamic>;
    final items = (res['data'] as List<dynamic>)
        .map((j) => CourierNotificationItem.fromJson(j as Map<String, dynamic>))
        .toList();
    return (
      items: items,
      meta: PageMeta.fromJson(res['meta'] as Map<String, dynamic>),
    );
  }

  Future<int> unreadNotificationCount() async {
    final res = await ApiService.get('$_prefix/notifications/unread-count')
        as Map<String, dynamic>;
    return ((res['data'] as Map<String, dynamic>)['unread'] as num?)?.toInt() ??
        0;
  }

  Future<void> markNotificationRead(int id) async {
    await ApiService.post('$_prefix/notifications/$id/read');
  }

  Future<void> markAllNotificationsRead() async {
    await ApiService.post('$_prefix/notifications/read-all');
  }

  // ── Messages ─────────────────────────────────────────────────────────────

  // Role messaging: GET/POST /courier-app/messaging/* (admin, sellers with a shipment of ours, own riders).

  Future<List<ConversationSummary>> conversations() async {
    final res = await ApiService.get('$_prefix/messaging/threads')
        as Map<String, dynamic>;
    return (res['data'] as List<dynamic>)
        .map((j) => ConversationSummary.fromThreadJson(j as Map<String, dynamic>))
        .toList();
  }

  /// Messages of one conversation. [afterId] > 0 returns only newer ones (polling).
  /// The server marks the conversation read when it is fetched.
  Future<ChatThread> thread(int conversationId, {int afterId = 0}) async {
    final res = await ApiService.get(
      '$_prefix/messaging/threads/$conversationId/messages',
      queryParameters: afterId > 0 ? {'after_id': '$afterId'} : null,
    ) as Map<String, dynamic>;
    final t = (res['thread'] as Map?)?.cast<String, dynamic>() ?? const {};
    return ChatThread(
      conversation: ConversationSummary.fromThreadJson({
        'id': conversationId,
        'counterpart_name': t['name'],
      }),
      messages: (res['data'] as List<dynamic>)
          .whereType<Map>()
          .map((m) => ChatMessage.fromMessagingJson(Map<String, dynamic>.from(m)))
          .toList(),
    );
  }

  Future<ChatMessage> sendMessage(int conversationId, String body) async {
    final res = await ApiService.post(
      '$_prefix/messaging/threads/$conversationId/messages',
      body: {'body': body},
    ) as Map<String, dynamic>;
    return ChatMessage.fromMessagingJson(res['data'] as Map<String, dynamic>);
  }

  Future<int> unreadMessageCount() async {
    final res = await ApiService.get('$_prefix/messaging/threads')
        as Map<String, dynamic>;
    return ((res['meta'] as Map<String, dynamic>?)?['unread_total'] as num?)
            ?.toInt() ??
        0;
  }

  /// People the server allows this courier to message.
  Future<List<MessageContact>> messageContacts() async {
    final res = await ApiService.get('$_prefix/messaging/contacts')
        as Map<String, dynamic>;
    return (res['data'] as List<dynamic>)
        .map((j) => MessageContact.fromJson(j as Map<String, dynamic>))
        .toList();
  }

  /// Get-or-create the conversation with [contact].
  Future<ConversationSummary> startConversation(MessageContact contact) async {
    final res = await ApiService.post(
      '$_prefix/messaging/start',
      body: {'role': contact.role, 'id': contact.id},
    ) as Map<String, dynamic>;
    return ConversationSummary.fromThreadJson(res['data'] as Map<String, dynamic>);
  }

  // ── Timeline ─────────────────────────────────────────────────────────────

  Future<List<TimelineEvent>> timeline({int? tripId, int perPage = 40}) async {
    final params = <String, String>{'per_page': '$perPage'};
    if (tripId != null) params['trip_id'] = '$tripId';
    final res = await ApiService.get(
      '$_prefix/timeline',
      queryParameters: params,
    ) as Map<String, dynamic>;
    return (res['data'] as List<dynamic>)
        .map((j) => TimelineEvent.fromJson(j as Map<String, dynamic>))
        .toList();
  }

  // ── Trips ────────────────────────────────────────────────────────────────

  Future<({List<CourierTrip> items, Map<String, int> stats})> trips({
    String filter = 'active',
    String? dateFrom,
    String? dateTo,
  }) async {
    final params = <String, String>{'filter': filter};
    if (dateFrom != null) params['date_from'] = dateFrom;
    if (dateTo != null) params['date_to'] = dateTo;
    final res = await ApiService.get(
      '$_prefix/trips',
      queryParameters: params,
    ) as Map<String, dynamic>;
    final statsRaw = res['stats'] as Map<String, dynamic>? ?? {};
    return (
      items: (res['data'] as List<dynamic>)
          .map((j) => CourierTrip.fromJson(j as Map<String, dynamic>))
          .toList(),
      stats: statsRaw.map((k, v) => MapEntry(k, (v as num).toInt())),
    );
  }

  Future<CourierTrip> tripDetail(int id) async {
    final res =
        await ApiService.get('$_prefix/trips/$id') as Map<String, dynamic>;
    return CourierTrip.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<void> acceptTrip(int id) async {
    await ApiService.post('$_prefix/trips/$id/accept');
  }

  Future<void> declineTrip(int id, String reason) async {
    await ApiService.post(
      '$_prefix/trips/$id/decline',
      body: {'reason': reason},
    );
  }

  Future<void> startLoading(int id) async {
    await ApiService.post('$_prefix/trips/$id/start-loading');
  }

  Future<Map<String, dynamic>> scanTripParcel(int id, String waybill) async {
    final res = await ApiService.post(
      '$_prefix/trips/$id/scan',
      body: {'waybill_number': waybill},
    ) as Map<String, dynamic>;
    return res;
  }

  Future<void> departTrip(
    int id, {
    required String sealNumber,
    required double latitude,
    required double longitude,
  }) async {
    await ApiService.post(
      '$_prefix/trips/$id/depart',
      body: {
        'seal_number': sealNumber,
        'latitude': latitude,
        'longitude': longitude,
      },
    );
  }

  Future<void> reportDelay(
    int id, {
    required String reason,
    required String newEta,
  }) async {
    await ApiService.post(
      '$_prefix/trips/$id/delay',
      body: {'reason': reason, 'new_eta': newEta},
    );
  }

  Future<void> arriveTrip(
    int id, {
    required double latitude,
    required double longitude,
  }) async {
    await ApiService.post(
      '$_prefix/trips/$id/arrive',
      body: {'latitude': latitude, 'longitude': longitude},
    );
  }

  Future<void> addTripNote(int id, String note) async {
    await ApiService.post(
      '$_prefix/trips/$id/note',
      body: {'note': note},
    );
  }

  Future<void> cancelTrip(int id, String reason) async {
    await ApiService.post(
      '$_prefix/trips/$id/cancel',
      body: {'reason': reason},
    );
  }

  // ── Profile & duty ───────────────────────────────────────────────────────

  Future<CourierProfile> profile() async {
    final res =
        await ApiService.get('$_prefix/profile') as Map<String, dynamic>;
    return CourierProfile.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<CourierProfile> updateVehicle({
    String? vehicleType,
    String? plateNumber,
    double? loadCapacityKg,
    String? licenseNumber,
    String? licenseExpiry,
  }) async {
    final body = <String, dynamic>{};
    if (vehicleType != null) body['vehicle_type'] = vehicleType;
    if (plateNumber != null) body['plate_number'] = plateNumber;
    if (loadCapacityKg != null) body['load_capacity_kg'] = loadCapacityKg;
    if (licenseNumber != null) body['license_number'] = licenseNumber;
    if (licenseExpiry != null) body['license_expiry'] = licenseExpiry;

    final res = await ApiService.put(
      '$_prefix/profile/vehicle',
      body: body,
    ) as Map<String, dynamic>;
    return CourierProfile.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<CourierDocumentItem> uploadDocument({
    required String type,
    required List<int> bytes,
    required String filename,
  }) async {
    final res = await ApiService.postMultipart(
      '$_prefix/profile/documents',
      field: 'file',
      bytes: bytes,
      filename: filename,
      fields: {'type': type},
    ) as Map<String, dynamic>;
    return CourierDocumentItem.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<void> changePassword({
    required String currentPassword,
    required String password,
    required String passwordConfirmation,
  }) async {
    await ApiService.post(
      '$_prefix/profile/change-password',
      body: {
        'current_password': currentPassword,
        'password': password,
        'password_confirmation': passwordConfirmation,
      },
    );
  }

  Future<DutyState> duty() async {
    final res = await ApiService.get('$_prefix/duty') as Map<String, dynamic>;
    return DutyState.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<DutyState> submitChecklist({
    required Map<String, String> items,
    Map<String, String> notes = const {},
    double? latitude,
    double? longitude,
  }) async {
    final body = <String, dynamic>{'items': items, 'notes': notes};
    if (latitude != null) body['latitude'] = latitude;
    if (longitude != null) body['longitude'] = longitude;
    final res = await ApiService.post(
      '$_prefix/duty/checklist',
      body: body,
    ) as Map<String, dynamic>;
    final data = res['data'] as Map<String, dynamic>;
    return DutyState(
      dutyStatus: data['duty_status'] as String? ?? 'off_duty',
      status: 'approved',
      licenseExpired: false,
      latestChecklist:
          ChecklistRecord.fromJson(data['checklist'] as Map<String, dynamic>),
    );
  }

  Future<void> goOnDuty({
    required double latitude,
    required double longitude,
    double? accuracy,
  }) async {
    await ApiService.post(
      '$_prefix/duty/on',
      body: {
        'latitude': latitude,
        'longitude': longitude,
        if (accuracy != null) 'accuracy': accuracy,
      },
    );
  }

  Future<void> goOffDuty() async {
    await ApiService.post('$_prefix/duty/off');
  }

  Future<void> updateLocation({
    required double latitude,
    required double longitude,
  }) async {
    await ApiService.post(
      '$_prefix/duty/location',
      body: {'latitude': latitude, 'longitude': longitude},
    );
  }

  // ── History & pay ────────────────────────────────────────────────────────

  Future<HistorySummary> historySummary({
    String period = 'week',
    String? dateFrom,
    String? dateTo,
  }) async {
    final params = <String, String>{'period': period};
    if (dateFrom != null) params['date_from'] = dateFrom;
    if (dateTo != null) params['date_to'] = dateTo;
    final res = await ApiService.get(
      '$_prefix/history/summary',
      queryParameters: params,
    ) as Map<String, dynamic>;
    return HistorySummary.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<({List<PaymentItem> items, double total, int count})> payments({
    String period = 'week',
    String? dateFrom,
    String? dateTo,
  }) async {
    final params = <String, String>{'period': period};
    if (dateFrom != null) params['date_from'] = dateFrom;
    if (dateTo != null) params['date_to'] = dateTo;
    final res = await ApiService.get(
      '$_prefix/history/payments',
      queryParameters: params,
    ) as Map<String, dynamic>;
    final meta = res['meta'] as Map<String, dynamic>? ?? {};
    return (
      items: (res['data'] as List<dynamic>)
          .map((j) => PaymentItem.fromJson(j as Map<String, dynamic>))
          .toList(),
      total: (meta['total'] as num?)?.toDouble() ?? 0,
      count: (meta['count'] as num?)?.toInt() ?? 0,
    );
  }

  Future<List<HistoryTrip>> historyTrips({
    String status = 'all',
    String? search,
    String? dateFrom,
    String? dateTo,
  }) async {
    final params = <String, String>{};
    if (status != 'all') params['status'] = status;
    if (search != null && search.isNotEmpty) params['search'] = search;
    if (dateFrom != null) params['date_from'] = dateFrom;
    if (dateTo != null) params['date_to'] = dateTo;
    final res = await ApiService.get(
      '$_prefix/history/trips',
      queryParameters: params.isEmpty ? null : params,
    ) as Map<String, dynamic>;
    return (res['data'] as List<dynamic>)
        .map((j) => HistoryTrip.fromJson(j as Map<String, dynamic>))
        .toList();
  }

  Future<HistoryTripDetail> historyTripDetail(int id) async {
    final res = await ApiService.get('$_prefix/history/trips/$id')
        as Map<String, dynamic>;
    return HistoryTripDetail.fromJson(res['data'] as Map<String, dynamic>);
  }

  // ── Delivery Management (same API as the web Delivery Management) ────────

  Future<({List<DeliveryOrderItem> items, Map<String, int> meta})>
      deliveryOrders() async {
    final res = await ApiService.get('$_prefix/delivery-orders')
        as Map<String, dynamic>;
    final items = (res['data'] as List<dynamic>? ?? [])
        .map((e) => DeliveryOrderItem.fromJson(Map<String, dynamic>.from(e)))
        .toList();
    final meta = (res['meta'] as Map<String, dynamic>? ?? {})
        .map((k, v) => MapEntry(k, (v as num?)?.toInt() ?? 0));
    return (items: items, meta: meta);
  }

  /// Online riders of this courier only (server-side readyRiders()).
  Future<({List<DeliveryRiderItem> items, String? message})>
      deliveryRiders() async {
    final res = await ApiService.get('$_prefix/delivery-riders')
        as Map<String, dynamic>;
    final items = (res['data'] as List<dynamic>? ?? [])
        .map((e) => DeliveryRiderItem.fromJson(Map<String, dynamic>.from(e)))
        .toList();
    final message = (res['meta'] as Map?)?['message']?.toString();
    return (items: items, message: message);
  }

  /// POST /delivery-jobs. Returns the server message.
  Future<String> assignDeliveryRider(int orderId, int personnelId) async {
    final res = await ApiService.post(
      '$_prefix/delivery-jobs',
      body: {'order_id': orderId, 'personnel_id': personnelId},
    ) as Map<String, dynamic>;
    return res['message']?.toString() ?? 'Delivery rider assigned.';
  }

  // ── Rider Management (read-only) ─────────────────────────────────────────

  Future<({List<CourierRiderItem> items, int online, String? note})>
      riders() async {
    final res = await ApiService.get('$_prefix/riders') as Map<String, dynamic>;
    final items = (res['data'] as List<dynamic>? ?? [])
        .map((e) => CourierRiderItem.fromJson(Map<String, dynamic>.from(e)))
        .toList();
    final meta = res['meta'] as Map<String, dynamic>? ?? {};
    return (
      items: items,
      online: (meta['online'] as num?)?.toInt() ?? 0,
      note: meta['note']?.toString(),
    );
  }
}
