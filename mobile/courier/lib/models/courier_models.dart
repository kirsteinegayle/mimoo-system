// Domain models for the Mimoo Courier app.

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
        id: j['id'] as int,
        waybillNumber: j['waybill_number'] as String? ?? '',
        orderNumber: j['order_number'] as String? ?? '',
        sellerName: j['seller_name'] as String? ?? 'N/A',
        destination: j['destination'] as String? ?? 'Not provided',
        assignmentStatus: j['assignment_status'] as String? ?? '',
        pickupStatus: j['pickup_status'] as String? ?? '',
        assignedAt: j['assigned_at'] as String? ?? '',
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
        id: j['id'] as int,
        waybillNumber: j['waybill_number'] as String? ?? '',
        orderNumber: j['order_number'] as String? ?? '',
        assignmentStatus: j['assignment_status'] as String? ?? '',
        pickupStatus: j['pickup_status'] as String? ?? '',
        assignedAt: j['assigned_at'] as String? ?? '',
        acceptanceDeadline: j['acceptance_deadline'] as String? ?? '',
        totalAmount: (j['total_amount'] as num?)?.toDouble() ?? 0,
        paymentMethod: j['payment_method'] as String? ?? '',
        itemsCount: j['items_count'] as int? ?? 0,
        shippingAddress: j['shipping_address'] as String? ?? '',
        history: (j['history'] as List<dynamic>?)
                ?.map((h) => HistoryEntry.fromJson(h as Map<String, dynamic>))
                .toList() ??
            [],
        acceptedAt: j['accepted_at'] as String?,
        rejectedAt: j['rejected_at'] as String?,
        rejectionReason: j['rejection_reason'] as String?,
        weight: j['weight'],
        dimensions: j['dimensions'],
        pickupInstructions: j['pickup_instructions'] as String?,
        seller: j['seller'] as Map<String, dynamic>?,
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
        action: j['action'] as String? ?? '',
        performedBy: j['performed_by'] as String? ?? 'System',
        createdAt: j['created_at'] as String? ?? '',
        notes: j['notes'] as String?,
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
