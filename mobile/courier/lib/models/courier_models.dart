// Domain models for the Mimoo Courier app.

String _readString(Object? value, {String fallback = ''}) =>
    value == null ? fallback : value.toString();

int _readInt(Object? value, {int fallback = 0}) {
  if (value is int) return value;
  if (value is num) return value.toInt();
  return int.tryParse(value?.toString() ?? '') ?? fallback;
}

double _readDouble(Object? value, {double fallback = 0}) {
  if (value is num) return value.toDouble();
  return double.tryParse(value?.toString() ?? '') ?? fallback;
}

Map<String, dynamic>? _readMap(Object? value) {
  if (value is Map<String, dynamic>) return value;
  if (value is Map) return Map<String, dynamic>.from(value);
  return null;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

class CourierUser {
  const CourierUser({
    required this.id,
    required this.email,
    required this.companyName,
    required this.contactFirstName,
    required this.contactLastName,
  });

  final int id;
  final String email;
  final String companyName;
  final String contactFirstName;
  final String contactLastName;

  String get displayName => '$contactFirstName $contactLastName'.trim();

  factory CourierUser.fromJson(Map<String, dynamic> j) => CourierUser(
        id: j['id'] as int,
        email: j['email'] as String,
        companyName: j['company_name'] as String? ?? '',
        contactFirstName: j['contact_first_name'] as String? ?? '',
        contactLastName: j['contact_last_name'] as String? ?? '',
      );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

class DashboardStats {
  const DashboardStats({
    required this.incomingShipments,
    required this.pendingPickups,
    required this.scheduledToday,
    required this.pickedUpToday,
    required this.failed,
    required this.expiringSoon,
  });

  final int incomingShipments;
  final int pendingPickups;
  final int scheduledToday;
  final int pickedUpToday;
  final int failed;
  final int expiringSoon;

  factory DashboardStats.fromJson(Map<String, dynamic> j) => DashboardStats(
        incomingShipments: j['incoming_shipments'] as int? ?? 0,
        pendingPickups: j['pending_pickups'] as int? ?? 0,
        scheduledToday: j['scheduled_today'] as int? ?? 0,
        pickedUpToday: j['picked_up_today'] as int? ?? 0,
        failed: j['failed'] as int? ?? 0,
        expiringSoon: j['expiring_soon'] as int? ?? 0,
      );
}

// ── Shipments ─────────────────────────────────────────────────────────────────

class ShipmentSummary {
  const ShipmentSummary({
    required this.id,
    required this.waybillNumber,
    required this.orderNumber,
    required this.sellerName,
    required this.destination,
    required this.assignmentStatus,
    required this.pickupStatus,
    required this.assignedAt,
    this.isOverdue = false,
    this.isExpiringSoon = false,
  });

  final int id;
  final String waybillNumber;
  final String orderNumber;
  final String sellerName;
  final String destination;
  final String assignmentStatus;
  final String pickupStatus;
  final String assignedAt;
  final bool isOverdue;
  final bool isExpiringSoon;

  factory ShipmentSummary.fromJson(Map<String, dynamic> j) => ShipmentSummary(
        id: _readInt(j['id']),
        waybillNumber: _readString(j['waybill_number']),
        orderNumber: _readString(j['order_number']),
        sellerName: _readString(j['seller_name'], fallback: 'N/A'),
        destination: _readString(j['destination'], fallback: 'Not provided'),
        assignmentStatus: _readString(j['assignment_status']),
        pickupStatus: _readString(j['pickup_status']),
        assignedAt: _readString(j['assigned_at']),
        isOverdue: j['is_overdue'] as bool? ?? false,
        isExpiringSoon: j['is_expiring_soon'] as bool? ?? false,
      );
}

class ShipmentDetail {
  const ShipmentDetail({
    required this.id,
    required this.waybillNumber,
    required this.orderNumber,
    required this.assignmentStatus,
    required this.pickupStatus,
    required this.assignedAt,
    required this.acceptanceDeadline,
    required this.totalAmount,
    required this.paymentMethod,
    required this.itemsCount,
    required this.shippingAddress,
    required this.history,
    this.acceptedAt,
    this.rejectedAt,
    this.rejectionReason,
    this.weight,
    this.dimensions,
    this.pickupInstructions,
    this.seller,
    this.isOverdue = false,
    this.isExpiringSoon = false,
  });

  final int id;
  final String waybillNumber;
  final String orderNumber;
  final String assignmentStatus;
  final String pickupStatus;
  final String assignedAt;
  final String acceptanceDeadline;
  final double totalAmount;
  final String paymentMethod;
  final int itemsCount;
  final String shippingAddress;
  final List<HistoryEntry> history;
  final String? acceptedAt;
  final String? rejectedAt;
  final String? rejectionReason;
  final dynamic weight;
  final dynamic dimensions;
  final String? pickupInstructions;
  final Map<String, dynamic>? seller;
  final bool isOverdue;
  final bool isExpiringSoon;

  factory ShipmentDetail.fromJson(Map<String, dynamic> j) => ShipmentDetail(
        id: _readInt(j['id']),
        waybillNumber: _readString(j['waybill_number']),
        orderNumber: _readString(j['order_number']),
        assignmentStatus: _readString(j['assignment_status']),
        pickupStatus: _readString(j['pickup_status']),
        assignedAt: _readString(j['assigned_at']),
        acceptanceDeadline: _readString(j['acceptance_deadline']),
        totalAmount: _readDouble(j['total_amount']),
        paymentMethod: _readString(j['payment_method']),
        itemsCount: _readInt(j['items_count']),
        shippingAddress:
            _readString(j['shipping_address'], fallback: 'Not provided'),
        history: (j['history'] is List ? j['history'] as List : const [])
            .whereType<Map>()
            .map((h) => HistoryEntry.fromJson(Map<String, dynamic>.from(h)))
            .toList(),
        acceptedAt: j['accepted_at']?.toString(),
        rejectedAt: j['rejected_at']?.toString(),
        rejectionReason: j['rejection_reason']?.toString(),
        weight: j['weight'],
        dimensions: j['dimensions'],
        pickupInstructions: j['pickup_instructions']?.toString(),
        seller: _readMap(j['seller']),
        isOverdue: j['is_overdue'] as bool? ?? false,
        isExpiringSoon: j['is_expiring_soon'] as bool? ?? false,
      );
}

class HistoryEntry {
  const HistoryEntry({
    required this.action,
    required this.performedBy,
    required this.createdAt,
    this.notes,
  });
  final String action;
  final String performedBy;
  final String createdAt;
  final String? notes;

  factory HistoryEntry.fromJson(Map<String, dynamic> j) => HistoryEntry(
        action: _readString(j['action']),
        performedBy: _readString(j['performed_by'], fallback: 'System'),
        createdAt: _readString(j['created_at']),
        notes: j['notes']?.toString(),
      );
}

// ── Pickups ───────────────────────────────────────────────────────────────────

class PickupSummary {
  const PickupSummary({
    required this.id,
    required this.waybillNumber,
    required this.orderNumber,
    required this.pickupStatus,
    required this.attemptCount,
    this.scheduledDate,
    this.scheduledTimeWindow,
    this.assignedPersonnel,
  });

  final int id;
  final String waybillNumber;
  final String orderNumber;
  final String pickupStatus;
  final int attemptCount;
  final String? scheduledDate;
  final String? scheduledTimeWindow;
  final String? assignedPersonnel;

  factory PickupSummary.fromJson(Map<String, dynamic> j) => PickupSummary(
        id: j['id'] as int,
        waybillNumber: j['waybill_number'] as String? ?? '',
        orderNumber: j['order_number'] as String? ?? '',
        pickupStatus: j['pickup_status'] as String? ?? '',
        attemptCount: j['attempt_count'] as int? ?? 0,
        scheduledDate: j['scheduled_date'] as String?,
        scheduledTimeWindow: j['scheduled_time_window'] as String?,
        assignedPersonnel: j['assigned_personnel'] as String?,
      );
}

class PersonnelItem {
  const PersonnelItem({
    required this.id,
    required this.name,
    this.role,
    this.contactNumber,
  });
  final int id;
  final String name;
  final String? role;
  final String? contactNumber;

  factory PersonnelItem.fromJson(Map<String, dynamic> j) => PersonnelItem(
        id: j['id'] as int,
        name: j['name'] as String? ?? '',
        role: j['role'] as String?,
        contactNumber: j['contact_number'] as String?,
      );
}

// ── Facilities ────────────────────────────────────────────────────────────────

class FacilityItem {
  const FacilityItem({
    required this.id,
    required this.facilityName,
    required this.facilityCode,
    required this.facilityType,
    this.city,
    this.region,
  });
  final int id;
  final String facilityName;
  final String facilityCode;
  final String facilityType;
  final String? city;
  final String? region;

  String get displayLabel => '$facilityName ($facilityCode)';

  factory FacilityItem.fromJson(Map<String, dynamic> j) => FacilityItem(
        id: j['id'] as int,
        facilityName: j['facility_name'] as String? ?? '',
        facilityCode: j['facility_code'] as String? ?? '',
        facilityType: j['facility_type'] as String? ?? '',
        city: j['city'] as String?,
        region: j['region'] as String?,
      );
}

// ── Parcel ────────────────────────────────────────────────────────────────────

class ParcelInfo {
  const ParcelInfo({
    required this.waybillNumber,
    required this.orderNumber,
    required this.buyerName,
    required this.buyerAddress,
    required this.destination,
    required this.paymentMethod,
    required this.totalAmount,
    required this.status,
    this.buyerPhone,
    this.weight,
  });

  final String waybillNumber;
  final String orderNumber;
  final String buyerName;
  final String buyerAddress;
  final String destination;
  final String paymentMethod;
  final double totalAmount;
  final String status;
  final String? buyerPhone;
  final dynamic weight;

  factory ParcelInfo.fromJson(Map<String, dynamic> j) => ParcelInfo(
        waybillNumber: j['waybill_number'] as String? ?? '',
        orderNumber: j['order_number'] as String? ?? '',
        buyerName: j['buyer_name'] as String? ?? '',
        buyerAddress: j['buyer_address'] as String? ?? '',
        destination: j['destination'] as String? ?? '',
        paymentMethod: j['payment_method'] as String? ?? '',
        totalAmount: (j['total_amount'] as num?)?.toDouble() ?? 0,
        status: j['status'] as String? ?? '',
        buyerPhone: j['buyer_phone'] as String?,
        weight: j['weight'],
      );
}

// ── Pagination meta ───────────────────────────────────────────────────────────

class PageMeta {
  const PageMeta({
    required this.currentPage,
    required this.lastPage,
    required this.total,
  });
  final int currentPage;
  final int lastPage;
  final int total;

  bool get hasMore => currentPage < lastPage;

  factory PageMeta.fromJson(Map<String, dynamic> j) => PageMeta(
        currentPage: j['current_page'] as int? ?? 1,
        lastPage: j['last_page'] as int? ?? 1,
        total: j['total'] as int? ?? 0,
      );
}

// -- Notifications ----------------------------------------------------------

class CourierNotificationItem {
  const CourierNotificationItem({
    required this.id,
    required this.category,
    required this.type,
    required this.title,
    required this.body,
    required this.isRead,
    required this.createdAt,
    required this.timeAgo,
    this.relatedType,
    this.relatedId,
  });

  final int id;
  final String category;
  final String type;
  final String title;
  final String body;
  final bool isRead;
  final String createdAt;
  final String timeAgo;
  final String? relatedType;
  final int? relatedId;

  factory CourierNotificationItem.fromJson(Map<String, dynamic> j) =>
      CourierNotificationItem(
        id: _readInt(j['id']),
        category: _readString(j['category'], fallback: 'system'),
        type: _readString(j['type']),
        title: _readString(j['title']),
        body: _readString(j['body']),
        isRead: j['is_read'] as bool? ?? false,
        createdAt: _readString(j['created_at']),
        timeAgo: _readString(j['time_ago']),
        relatedType: j['related_type']?.toString(),
        relatedId: j['related_id'] == null ? null : _readInt(j['related_id']),
      );
}

// -- Messaging --------------------------------------------------------------

class ConversationSummary {
  const ConversationSummary({
    required this.id,
    required this.subject,
    required this.otherName,
    required this.unread,
    this.otherCompany,
    this.lastMessage,
    this.lastMessageAt,
  });

  final int id;
  final String subject;
  final String otherName;
  final String? otherCompany;
  final String? lastMessage;
  final String? lastMessageAt;
  final int unread;

  factory ConversationSummary.fromJson(Map<String, dynamic> j) {
    final other = _readMap(j['other_party']) ?? const {};
    return ConversationSummary(
      id: _readInt(j['id']),
      subject: _readString(j['subject'], fallback: 'Logistics support'),
      otherName: _readString(other['name'], fallback: 'Logistics'),
      otherCompany: other['company_name']?.toString(),
      lastMessage: j['last_message']?.toString(),
      lastMessageAt: j['last_message_at']?.toString(),
      unread: _readInt(j['unread']),
    );
  }
}

class ChatMessage {
  const ChatMessage({
    required this.id,
    required this.body,
    required this.mine,
    required this.senderName,
    required this.createdAt,
  });

  final int id;
  final String body;
  final bool mine;
  final String senderName;
  final String createdAt;

  factory ChatMessage.fromJson(Map<String, dynamic> j) => ChatMessage(
        id: _readInt(j['id']),
        body: _readString(j['body']),
        mine: j['mine'] as bool? ?? false,
        senderName: _readString(j['sender_name'], fallback: 'System'),
        createdAt: _readString(j['created_at']),
      );
}

class ChatThread {
  const ChatThread({required this.conversation, required this.messages});
  final ConversationSummary conversation;
  final List<ChatMessage> messages;

  factory ChatThread.fromJson(Map<String, dynamic> j) => ChatThread(
        conversation: ConversationSummary.fromJson(
            _readMap(j['conversation']) ?? const {}),
        messages: (j['messages'] is List ? j['messages'] as List : const [])
            .whereType<Map>()
            .map((m) => ChatMessage.fromJson(Map<String, dynamic>.from(m)))
            .toList(),
      );
}

// -- Timeline ---------------------------------------------------------------

class TimelineEvent {
  const TimelineEvent({
    required this.id,
    required this.tripId,
    required this.eventType,
    required this.label,
    required this.place,
    required this.occurredAt,
    required this.date,
    required this.time,
    required this.isToday,
    required this.isCurrent,
    this.tripCode,
    this.tripStatus,
    this.orderId,
    this.waybillNumber,
    this.notes,
  });

  final int id;
  final int tripId;
  final int? orderId;
  final String? tripCode;
  final String? tripStatus;
  final String? waybillNumber;
  final String eventType;
  final String label;
  final String place;
  final String? notes;
  final String occurredAt;
  final String date;
  final String time;
  final bool isToday;
  final bool isCurrent;

  factory TimelineEvent.fromJson(Map<String, dynamic> j) => TimelineEvent(
        id: _readInt(j['id']),
        tripId: _readInt(j['trip_id']),
        orderId: j['order_id'] == null ? null : _readInt(j['order_id']),
        tripCode: j['trip_code']?.toString(),
        tripStatus: j['trip_status']?.toString(),
        waybillNumber: j['waybill_number']?.toString(),
        eventType: _readString(j['event_type']),
        label: _readString(j['label']),
        place: _readString(j['place']),
        notes: j['notes']?.toString(),
        occurredAt: _readString(j['occurred_at']),
        date: _readString(j['date']),
        time: _readString(j['time']),
        isToday: j['is_today'] as bool? ?? false,
        isCurrent: j['is_current'] as bool? ?? false,
      );
}

// -- Trips ------------------------------------------------------------------

class TripFacility {
  const TripFacility({
    required this.id,
    required this.code,
    required this.name,
    this.address,
    this.city,
    this.latitude,
    this.longitude,
  });

  final int id;
  final String code;
  final String name;
  final String? address;
  final String? city;
  final double? latitude;
  final double? longitude;

  factory TripFacility.fromJson(Map<String, dynamic>? j) {
    if (j == null) {
      return const TripFacility(id: 0, code: '-', name: 'Not provided');
    }
    return TripFacility(
      id: _readInt(j['id']),
      code: _readString(j['code'], fallback: '-'),
      name: _readString(j['name'], fallback: 'Not provided'),
      address: j['address']?.toString(),
      city: j['city']?.toString(),
      latitude: j['latitude'] == null ? null : _readDouble(j['latitude']),
      longitude: j['longitude'] == null ? null : _readDouble(j['longitude']),
    );
  }
}

class TripParcel {
  const TripParcel({
    required this.id,
    required this.waybillNumber,
    required this.weight,
    required this.loaded,
    required this.received,
    required this.missing,
    required this.damaged,
    this.loadedAt,
    this.receivedAt,
    this.damageNote,
    this.damagePhotoUrl,
  });

  final int id;
  final String waybillNumber;
  final double weight;
  final bool loaded;
  final bool received;
  final bool missing;
  final bool damaged;
  final String? loadedAt;
  final String? receivedAt;
  final String? damageNote;
  final String? damagePhotoUrl;

  factory TripParcel.fromJson(Map<String, dynamic> j) => TripParcel(
        id: _readInt(j['id']),
        waybillNumber: _readString(j['waybill_number']),
        weight: _readDouble(j['weight']),
        loaded: j['loaded'] as bool? ?? false,
        received: j['received'] as bool? ?? false,
        missing: j['missing'] as bool? ?? false,
        damaged: j['damaged'] as bool? ?? false,
        loadedAt: j['loaded_at']?.toString(),
        receivedAt: j['received_at']?.toString(),
        damageNote: j['damage_note']?.toString(),
        damagePhotoUrl: j['damage_photo_url']?.toString(),
      );
}

class TripEventItem {
  const TripEventItem({
    required this.id,
    required this.eventType,
    required this.label,
    required this.place,
    required this.occurredAt,
    this.waybillNumber,
    this.notes,
  });

  final int id;
  final String eventType;
  final String label;
  final String place;
  final String? notes;
  final String occurredAt;
  final String? waybillNumber;

  factory TripEventItem.fromJson(Map<String, dynamic> j) => TripEventItem(
        id: _readInt(j['id']),
        eventType: _readString(j['event_type']),
        label: _readString(j['label']),
        place: _readString(j['place']),
        notes: j['notes']?.toString(),
        occurredAt: _readString(j['occurred_at']),
        waybillNumber: j['waybill_number']?.toString(),
      );
}

class TripCapabilities {
  const TripCapabilities({
    required this.canAccept,
    required this.canDecline,
    required this.canStartLoading,
    required this.canScan,
    required this.canDepart,
    required this.canReportDelay,
    required this.canArrive,
    required this.canCancel,
    required this.canAddNote,
  });

  final bool canAccept;
  final bool canDecline;
  final bool canStartLoading;
  final bool canScan;
  final bool canDepart;
  final bool canReportDelay;
  final bool canArrive;
  final bool canCancel;
  final bool canAddNote;

  factory TripCapabilities.fromJson(Map<String, dynamic>? j) {
    final m = j ?? const <String, dynamic>{};
    return TripCapabilities(
      canAccept: m['can_accept'] as bool? ?? false,
      canDecline: m['can_decline'] as bool? ?? false,
      canStartLoading: m['can_start_loading'] as bool? ?? false,
      canScan: m['can_scan'] as bool? ?? false,
      canDepart: m['can_depart'] as bool? ?? false,
      canReportDelay: m['can_report_delay'] as bool? ?? false,
      canArrive: m['can_arrive'] as bool? ?? false,
      canCancel: m['can_cancel'] as bool? ?? false,
      canAddNote: m['can_add_note'] as bool? ?? false,
    );
  }
}

class CourierTrip {
  const CourierTrip({
    required this.id,
    required this.tripCode,
    required this.status,
    required this.origin,
    required this.destination,
    required this.parcelsCount,
    required this.loadedCount,
    required this.receivedCount,
    required this.totalWeight,
    required this.payAmount,
    required this.parcels,
    required this.events,
    required this.capabilities,
    this.scheduledDepartureAt,
    this.acceptedAt,
    this.departedAt,
    this.arrivedAt,
    this.completedAt,
    this.sealNumber,
    this.delayReason,
    this.delayEta,
    this.declineReason,
    this.cancellationReason,
    this.discrepancyNote,
  });

  final int id;
  final String tripCode;
  final String status;
  final TripFacility origin;
  final TripFacility destination;
  final int parcelsCount;
  final int loadedCount;
  final int receivedCount;
  final double totalWeight;
  final double payAmount;
  final List<TripParcel> parcels;
  final List<TripEventItem> events;
  final TripCapabilities capabilities;
  final String? scheduledDepartureAt;
  final String? acceptedAt;
  final String? departedAt;
  final String? arrivedAt;
  final String? completedAt;
  final String? sealNumber;
  final String? delayReason;
  final String? delayEta;
  final String? declineReason;
  final String? cancellationReason;
  final String? discrepancyNote;

  String get route => '${origin.code} ? ${destination.code}';

  factory CourierTrip.fromJson(Map<String, dynamic> j) => CourierTrip(
        id: _readInt(j['id']),
        tripCode: _readString(j['trip_code']),
        status: _readString(j['status']),
        origin: TripFacility.fromJson(_readMap(j['origin'])),
        destination: TripFacility.fromJson(_readMap(j['destination'])),
        parcelsCount: _readInt(j['parcels_count']),
        loadedCount: _readInt(j['loaded_count']),
        receivedCount: _readInt(j['received_count']),
        totalWeight: _readDouble(j['total_weight']),
        payAmount: _readDouble(j['pay_amount']),
        scheduledDepartureAt: j['scheduled_departure_at']?.toString(),
        acceptedAt: j['accepted_at']?.toString(),
        departedAt: j['departed_at']?.toString(),
        arrivedAt: j['arrived_at']?.toString(),
        completedAt: j['completed_at']?.toString(),
        sealNumber: j['seal_number']?.toString(),
        delayReason: j['delay_reason']?.toString(),
        delayEta: j['delay_eta']?.toString(),
        declineReason: j['decline_reason']?.toString(),
        cancellationReason: j['cancellation_reason']?.toString(),
        discrepancyNote: j['discrepancy_note']?.toString(),
        parcels: (j['parcels'] is List ? j['parcels'] as List : const [])
            .whereType<Map>()
            .map((p) => TripParcel.fromJson(Map<String, dynamic>.from(p)))
            .toList(),
        events: (j['events'] is List ? j['events'] as List : const [])
            .whereType<Map>()
            .map((e) => TripEventItem.fromJson(Map<String, dynamic>.from(e)))
            .toList(),
        capabilities: TripCapabilities.fromJson(_readMap(j['capabilities'])),
      );
}

// -- Profile & duty ---------------------------------------------------------

class CourierDocumentItem {
  const CourierDocumentItem({
    required this.id,
    required this.type,
    required this.name,
    required this.url,
    required this.verified,
    required this.flagged,
    this.uploadedAt,
  });

  final int id;
  final String type;
  final String name;
  final String url;
  final bool verified;
  final bool flagged;
  final String? uploadedAt;

  factory CourierDocumentItem.fromJson(Map<String, dynamic> j) =>
      CourierDocumentItem(
        id: _readInt(j['id']),
        type: _readString(j['type']),
        name: _readString(j['name']),
        url: _readString(j['url']),
        verified: j['verified'] as bool? ?? false,
        flagged: j['flagged'] as bool? ?? false,
        uploadedAt: j['uploaded_at']?.toString(),
      );
}

class CourierProfile {
  const CourierProfile({
    required this.id,
    required this.name,
    required this.email,
    required this.companyName,
    required this.status,
    required this.dutyStatus,
    required this.documents,
    this.phone,
    this.suspendedReason,
    this.homeHub,
    this.vehicleType,
    this.plateNumber,
    this.loadCapacityKg,
    this.licenseNumber,
    this.licenseExpiry,
  });

  final int id;
  final String name;
  final String email;
  final String companyName;
  final String status;
  final String dutyStatus;
  final String? phone;
  final String? suspendedReason;
  final TripFacility? homeHub;
  final String? vehicleType;
  final String? plateNumber;
  final double? loadCapacityKg;
  final String? licenseNumber;
  final String? licenseExpiry;
  final List<CourierDocumentItem> documents;

  factory CourierProfile.fromJson(Map<String, dynamic> j) {
    final vehicle = _readMap(j['vehicle']) ?? const {};
    final hub = _readMap(j['home_hub']);
    return CourierProfile(
      id: _readInt(j['id']),
      name: _readString(j['name']),
      email: _readString(j['email']),
      companyName: _readString(j['company_name']),
      status: _readString(j['status']),
      dutyStatus: _readString(j['duty_status'], fallback: 'off_duty'),
      phone: j['phone']?.toString(),
      suspendedReason: j['suspended_reason']?.toString(),
      homeHub: hub == null
          ? null
          : TripFacility(
              id: _readInt(hub['id']),
              code: _readString(hub['code']),
              name: _readString(hub['name']),
              address: hub['address']?.toString(),
              latitude:
                  hub['latitude'] == null ? null : _readDouble(hub['latitude']),
              longitude: hub['longitude'] == null
                  ? null
                  : _readDouble(hub['longitude']),
            ),
      vehicleType: vehicle['vehicle_type']?.toString(),
      plateNumber: vehicle['plate_number']?.toString(),
      loadCapacityKg: vehicle['load_capacity_kg'] == null
          ? null
          : _readDouble(vehicle['load_capacity_kg']),
      licenseNumber: vehicle['license_number']?.toString(),
      licenseExpiry: vehicle['license_expiry']?.toString(),
      documents: (j['documents'] is List ? j['documents'] as List : const [])
          .whereType<Map>()
          .map(
              (d) => CourierDocumentItem.fromJson(Map<String, dynamic>.from(d)))
          .toList(),
    );
  }
}

class ChecklistRecord {
  const ChecklistRecord({
    required this.id,
    required this.passed,
    required this.answers,
    required this.notes,
    this.submittedAt,
  });

  final int id;
  final bool passed;
  final Map<String, String> answers;
  final Map<String, String> notes;
  final String? submittedAt;

  factory ChecklistRecord.fromJson(Map<String, dynamic> j) {
    const keys = ['tires', 'lights', 'brakes', 'fuel', 'cargo_door_lock'];
    final notesRaw = _readMap(j['notes']) ?? const {};
    return ChecklistRecord(
      id: _readInt(j['id']),
      passed: j['passed'] as bool? ?? false,
      answers: {
        for (final k in keys) k: _readString(j[k], fallback: 'ok'),
      },
      notes: notesRaw.map((k, v) => MapEntry(k, v?.toString() ?? '')),
      submittedAt: j['submitted_at']?.toString(),
    );
  }
}

class DutyState {
  const DutyState({
    required this.dutyStatus,
    required this.status,
    required this.licenseExpired,
    this.suspendedReason,
    this.licenseExpiry,
    this.activeTripCode,
    this.latestChecklist,
  });

  final String dutyStatus;
  final String status;
  final bool licenseExpired;
  final String? suspendedReason;
  final String? licenseExpiry;
  final String? activeTripCode;
  final ChecklistRecord? latestChecklist;

  factory DutyState.fromJson(Map<String, dynamic> j) {
    final active = _readMap(j['active_trip']);
    final checklist = _readMap(j['latest_checklist']);
    return DutyState(
      dutyStatus: _readString(j['duty_status'], fallback: 'off_duty'),
      status: _readString(j['status']),
      licenseExpired: j['license_expired'] as bool? ?? false,
      suspendedReason: j['suspended_reason']?.toString(),
      licenseExpiry: j['license_expiry']?.toString(),
      activeTripCode: active?['trip_code']?.toString(),
      latestChecklist:
          checklist == null ? null : ChecklistRecord.fromJson(checklist),
    );
  }
}

// -- History & pay ----------------------------------------------------------

class HistorySummary {
  const HistorySummary({
    required this.periodLabel,
    required this.tripsCompleted,
    required this.parcelsDelivered,
    required this.totalPay,
    required this.averagePay,
    required this.discrepancyTrips,
    required this.payStatus,
    required this.from,
    required this.to,
  });

  final String periodLabel;
  final int tripsCompleted;
  final int parcelsDelivered;
  final double totalPay;
  final double averagePay;
  final int discrepancyTrips;
  final String payStatus;
  final String from;
  final String to;

  factory HistorySummary.fromJson(Map<String, dynamic> j) {
    final period = _readMap(j['period']) ?? const {};
    return HistorySummary(
      periodLabel: _readString(period['label'], fallback: 'This week'),
      from: _readString(period['from']),
      to: _readString(period['to']),
      tripsCompleted: _readInt(j['trips_completed']),
      parcelsDelivered: _readInt(j['parcels_delivered']),
      totalPay: _readDouble(j['total_pay']),
      averagePay: _readDouble(j['average_pay']),
      discrepancyTrips: _readInt(j['discrepancy_trips']),
      payStatus: _readString(j['pay_status']),
    );
  }
}

class PaymentItem {
  const PaymentItem({
    required this.id,
    required this.reference,
    required this.tripId,
    required this.tripCode,
    required this.date,
    required this.route,
    required this.amount,
    required this.status,
    required this.discrepancy,
  });

  final int id;
  final String reference;
  final int tripId;
  final String tripCode;
  final String date;
  final String route;
  final double amount;
  final String status;
  final bool discrepancy;

  factory PaymentItem.fromJson(Map<String, dynamic> j) => PaymentItem(
        id: _readInt(j['id']),
        reference: _readString(j['reference']),
        tripId: _readInt(j['trip_id']),
        tripCode: _readString(j['trip_code']),
        date: _readString(j['date']),
        route: _readString(j['route']),
        amount: _readDouble(j['amount']),
        status: _readString(j['status']),
        discrepancy: j['discrepancy'] as bool? ?? false,
      );
}

class HistoryTrip {
  const HistoryTrip({
    required this.id,
    required this.tripCode,
    required this.date,
    required this.route,
    required this.waybills,
    required this.parcelsCount,
    required this.weight,
    required this.amount,
    required this.status,
    this.sealNumber,
  });

  final int id;
  final String tripCode;
  final String date;
  final String route;
  final List<String> waybills;
  final int parcelsCount;
  final double weight;
  final double amount;
  final String status;
  final String? sealNumber;

  factory HistoryTrip.fromJson(Map<String, dynamic> j) => HistoryTrip(
        id: _readInt(j['id']),
        tripCode: _readString(j['trip_code']),
        date: _readString(j['date']),
        route: _readString(j['route']),
        waybills: (j['waybills'] is List ? j['waybills'] as List : const [])
            .map((w) => w.toString())
            .toList(),
        parcelsCount: _readInt(j['parcels_count']),
        weight: _readDouble(j['weight']),
        amount: _readDouble(j['amount']),
        status: _readString(j['status']),
        sealNumber: j['seal_number']?.toString(),
      );
}

class HistoryTripDetail {
  const HistoryTripDetail({
    required this.id,
    required this.tripCode,
    required this.date,
    required this.route,
    required this.status,
    required this.weight,
    required this.payTotal,
    required this.payReference,
    required this.payStatus,
    required this.basePay,
    required this.otherEarnings,
    required this.parcels,
    required this.events,
    this.sealNumber,
    this.destinationSeal,
    this.discrepancyNote,
    this.receivedAt,
    this.receiver,
    this.facility,
  });

  final int id;
  final String tripCode;
  final String date;
  final String route;
  final String status;
  final double weight;
  final String? sealNumber;
  final String? destinationSeal;
  final String? discrepancyNote;
  final double basePay;
  final double otherEarnings;
  final double payTotal;
  final String payReference;
  final String payStatus;
  final String? receivedAt;
  final String? receiver;
  final String? facility;
  final List<TripParcel> parcels;
  final List<TripEventItem> events;

  factory HistoryTripDetail.fromJson(Map<String, dynamic> j) {
    final pod = _readMap(j['pod']) ?? const {};
    final pay = _readMap(j['pay']) ?? const {};
    return HistoryTripDetail(
      id: _readInt(j['id']),
      tripCode: _readString(j['trip_code']),
      date: _readString(j['date']),
      route: _readString(j['route']),
      status: _readString(j['status']),
      weight: _readDouble(j['weight']),
      sealNumber: j['seal_number']?.toString(),
      destinationSeal: j['destination_seal']?.toString(),
      discrepancyNote: j['discrepancy_note']?.toString(),
      basePay: _readDouble(pay['base_pay']),
      otherEarnings: _readDouble(pay['other_earnings']),
      payTotal: _readDouble(pay['total']),
      payReference: _readString(pay['reference']),
      payStatus: _readString(pay['status']),
      receivedAt: pod['received_at']?.toString(),
      receiver: pod['receiver']?.toString(),
      facility: pod['facility']?.toString(),
      parcels: (j['parcels'] is List ? j['parcels'] as List : const [])
          .whereType<Map>()
          .map((p) => TripParcel.fromJson(Map<String, dynamic>.from(p)))
          .toList(),
      events: (j['events'] is List ? j['events'] as List : const [])
          .whereType<Map>()
          .map((e) => TripEventItem.fromJson(Map<String, dynamic>.from(e)))
          .toList(),
    );
  }
}

// ── Delivery Management (GET /delivery-orders, /delivery-riders) ─────────────

class DeliveryOrderItem {
  const DeliveryOrderItem({
    required this.id,
    required this.orderNumber,
    required this.waybillNumber,
    required this.status,
    required this.shippingName,
    required this.shippingAddress,
    required this.paymentMethod,
    required this.codAmount,
    required this.pickedUp,
    required this.assignable,
    this.pickupStatus,
    this.jobStatus,
    this.jobRiderName,
  });

  final int id;
  final String orderNumber;
  final String waybillNumber;
  final String status;
  final String shippingName;
  final String shippingAddress;
  final String paymentMethod;
  final double codAmount;
  final bool pickedUp;
  final bool assignable;
  final String? pickupStatus;
  final String? jobStatus;
  final String? jobRiderName;

  bool get hasJob => jobStatus != null;

  factory DeliveryOrderItem.fromJson(Map<String, dynamic> j) {
    final job = _readMap(j['job']);
    return DeliveryOrderItem(
      id: _readInt(j['id']),
      orderNumber: _readString(j['order_number']),
      waybillNumber: _readString(j['waybill_number']),
      status: _readString(j['status']),
      shippingName: _readString(j['shipping_name']),
      shippingAddress: _readString(j['shipping_address']),
      paymentMethod: _readString(j['payment_method']),
      codAmount: _readDouble(j['cod_amount']),
      pickedUp: j['picked_up'] == true,
      assignable: j['assignable'] == true,
      pickupStatus: j['pickup_status']?.toString(),
      jobStatus: job == null ? null : _readString(job['status']),
      jobRiderName: job?['rider_name']?.toString(),
    );
  }
}

class DeliveryRiderItem {
  const DeliveryRiderItem({
    required this.personnelId,
    required this.name,
    required this.activeJobs,
    this.vehicleType,
  });

  final int personnelId;
  final String name;
  final int activeJobs;
  final String? vehicleType;

  factory DeliveryRiderItem.fromJson(Map<String, dynamic> j) =>
      DeliveryRiderItem(
        personnelId: _readInt(j['personnel_id']),
        name: _readString(j['name']),
        activeJobs: _readInt(j['active_delivery_jobs']),
        vehicleType: j['vehicle_type']?.toString(),
      );
}

// ── Rider Management, read-only (GET /riders) ────────────────────────────────

class CourierRiderItem {
  const CourierRiderItem({
    required this.personnelId,
    required this.name,
    required this.status,
    required this.approved,
    required this.isOnline,
    required this.activeJobs,
    this.contactNumber,
    this.vehicleType,
    this.plateNumber,
    this.lastCheckedInAt,
  });

  final int personnelId;
  final String name;
  final String status;
  final bool approved;
  final bool isOnline;
  final int activeJobs;
  final String? contactNumber;
  final String? vehicleType;
  final String? plateNumber;
  final String? lastCheckedInAt;

  factory CourierRiderItem.fromJson(Map<String, dynamic> j) => CourierRiderItem(
        personnelId: _readInt(j['personnel_id']),
        name: _readString(j['name']),
        status: _readString(j['status']),
        approved: j['approved'] == true,
        isOnline: j['is_online'] == true,
        activeJobs: _readInt(j['active_delivery_jobs']),
        contactNumber: j['contact_number']?.toString(),
        vehicleType: j['vehicle_type']?.toString(),
        plateNumber: j['plate_number']?.toString(),
        lastCheckedInAt: j['last_checked_in_at']?.toString(),
      );
}
