/// Status values that the server returns (must match the DB enum).
enum OrderStatus {
  pending,
  paid,
  packed,
  shipped,
  completed,
  cancelled,
  failed,
  // Legacy values kept so OrderState does not break; not returned by server.
  toShip,
  inTransit,
  outForDelivery,
  delivered,
}

/// Map a raw server status string to [OrderStatus].
OrderStatus orderStatusFromString(String s) {
  switch (s) {
    case 'pending':
      return OrderStatus.pending;
    case 'paid':
      return OrderStatus.paid;
    case 'packed':
      return OrderStatus.packed;
    case 'shipped':
      return OrderStatus.shipped;
    case 'in_transit': // courier / rider leg (delivery code may be shown)
      return OrderStatus.inTransit;
    case 'completed':
      return OrderStatus.completed;
    case 'cancelled':
      return OrderStatus.cancelled;
    case 'failed':
      return OrderStatus.failed;
    default:
      return OrderStatus.pending;
  }
}

/// Client-side tab mapping (decision §6).
///
/// pending + paid + packed → To Ship
/// shipped                 → To Receive
/// completed               → Completed
/// cancelled + failed      → Cancelled
enum OrderTab { toShip, toReceive, completed, cancelled }

OrderTab orderTabFromStatus(OrderStatus s) {
  switch (s) {
    case OrderStatus.pending:
    case OrderStatus.paid:
    case OrderStatus.packed:
      return OrderTab.toShip;
    case OrderStatus.shipped:
    case OrderStatus.inTransit:
      return OrderTab.toReceive;
    case OrderStatus.completed:
      return OrderTab.completed;
    case OrderStatus.cancelled:
    case OrderStatus.failed:
    default:
      return OrderTab.cancelled;
  }
}

/// A single line-item on an order as returned by the API.
class OrderItem {
  const OrderItem({
    required this.id,
    required this.productId,
    required this.productName,
    required this.imageUrl,
    required this.quantity,
    required this.unitPrice,
    required this.subtotal,
    this.variantId,
    this.variantSnapshot,
    this.sellerId,
    this.sellerName,
    this.canReview = false,
    this.reviewId,
    this.reviewRating,
    this.reviewComment,
    this.reviewCanEdit = false,
    // Legacy fields kept for backward-compat with OrderState
    this.price = 0.0,
    this.variation,
    this.variation2,
  });

  final int id;
  final int productId;
  final String productName;
  final String? imageUrl;
  final int quantity;
  final double unitPrice;
  final double subtotal;
  final String? variantId;
  final Map<String, dynamic>? variantSnapshot;

  /// Real numeric seller id / store name (null for legacy data).
  final int? sellerId;
  final String? sellerName;

  // Reviews (Module 3)
  final bool canReview;
  final int? reviewId;
  final int? reviewRating;
  final String? reviewComment;
  final bool reviewCanEdit;

  // Legacy
  final double price;
  final String? variation;
  final String? variation2;

  factory OrderItem.fromJson(Map<String, dynamic> j) => OrderItem(
        id: (j['id'] as num).toInt(),
        productId: (j['product_id'] as num).toInt(),
        productName: j['product_name'] as String? ?? '',
        imageUrl: j['image_url'] as String?,
        quantity: (j['quantity'] as num).toInt(),
        unitPrice: (j['unit_price'] as num?)?.toDouble() ?? 0.0,
        subtotal: (j['subtotal'] as num?)?.toDouble() ?? 0.0,
        variantId: j['variant_id'] as String?,
        variantSnapshot: j['variant_snapshot'] as Map<String, dynamic>?,
        price: (j['unit_price'] as num?)?.toDouble() ?? 0.0,
        sellerId: (j['seller_id'] as num?)?.toInt(),
        sellerName: j['seller_name'] as String?,
        canReview: j['can_review'] == true,
        reviewId: ((j['review'] as Map?)?['id'] as num?)?.toInt(),
        reviewRating: ((j['review'] as Map?)?['rating'] as num?)?.toInt(),
        reviewComment: (j['review'] as Map?)?['comment'] as String?,
        reviewCanEdit: (j['review'] as Map?)?['can_edit'] == true,
      );
}

/// An order as returned by GET /api/buyer/orders or /api/buyer/orders/{id}.
class Order {
  const Order({
    required this.id,
    required this.orderNumber,
    required this.status,
    required this.paymentStatus,
    required this.paymentMethod,
    required this.total,
    required this.itemCount,
    required this.canCancel,
    required this.createdAt,
    required this.shippingName,
    required this.shippingAddress,
    required this.shippingPhone,
    required this.items,
    this.returnStatus,
    this.returnId,
    this.canReturn = false,
    this.trackingStatus,
    this.trackingMessage,
    this.trackingUpdatedAt,
    // Legacy
    this.totalAmount = 0.0,
    this.placedAt,
    this.voucherCode,
    this.discount = 0.0,
    this.rating,
    this.feedback,
  });

  final int id;
  final String orderNumber;
  final OrderStatus status;
  final String paymentStatus;
  final String paymentMethod;
  final double total;
  final int itemCount;
  final bool canCancel;
  final String createdAt;
  final String? shippingName;
  final String? shippingAddress;
  final String? shippingPhone;
  final List<OrderItem> items;

  // Returns (Module 4): latest return request status, null when none.
  final String? returnStatus;
  final int? returnId;
  final bool canReturn;

  // Delivery tracking (orders.tracking_*), display only. Null until the
  // parcel reaches logistics.
  final String? trackingStatus;
  final String? trackingMessage;
  final String? trackingUpdatedAt;

  /// Friendly label for [trackingStatus] (same labels as the web).
  String? get trackingLabel {
    final s = trackingStatus;
    if (s == null || s.isEmpty) return null;
    const labels = {
      'received_logistics': 'Received by logistics',
      'assigned_courier': 'Assigned to courier',
      'accepted_courier': 'Accepted by courier',
      'scanned_at_facility': 'At sorting facility',
      'out_for_delivery': 'Out for delivery',
      'delivered': 'Delivered',
      'delivery_failed': 'Delivery attempt failed',
      'returning_to_sender': 'Returning to sender',
    };
    final raw = s.replaceAll('_', ' ');
    return labels[s] ?? '${raw[0].toUpperCase()}${raw.substring(1)}';
  }

  bool get hasTracking =>
      (trackingLabel != null) || (trackingMessage?.isNotEmpty ?? false);

  /// One-line summary for the orders list; null when there is no tracking.
  String? get trackingSummary {
    if (!hasTracking) return null;
    final parts = <String>[
      if (trackingLabel != null) trackingLabel!,
      if (trackingMessage?.isNotEmpty ?? false) trackingMessage!,
    ];
    final updated = (trackingUpdatedAt?.isNotEmpty ?? false)
        ? ' (updated $trackingUpdatedAt)'
        : '';
    return '${parts.join(' · ')}$updated';
  }

  // Legacy fields kept for OrderState compatibility
  final double totalAmount;
  final DateTime? placedAt;
  final String? voucherCode;
  final double discount;
  final int? rating;
  final String? feedback;

  factory Order.fromJson(Map<String, dynamic> j) => Order(
        id: (j['id'] as num).toInt(),
        orderNumber: j['order_number'] as String? ?? '',
        status: orderStatusFromString(j['status'] as String? ?? ''),
        paymentStatus: j['payment_status'] as String? ?? '',
        paymentMethod: j['payment_method'] as String? ?? '',
        total: (j['total'] as num?)?.toDouble() ?? 0.0,
        itemCount: (j['item_count'] as num?)?.toInt() ?? 0,
        canCancel: j['can_cancel'] as bool? ?? false,
        createdAt: j['created_at'] as String? ?? '',
        shippingName: j['shipping_name'] as String?,
        shippingAddress: j['shipping_address'] as String?,
        shippingPhone: j['shipping_phone'] as String?,
        items: (j['items'] as List<dynamic>? ?? [])
            .map((e) => OrderItem.fromJson(e as Map<String, dynamic>))
            .toList(),
        totalAmount: (j['total'] as num?)?.toDouble() ?? 0.0,
        placedAt: DateTime.tryParse(j['created_at'] as String? ?? ''),
        returnStatus: j['return_status'] as String?,
        returnId: (j['return_id'] as num?)?.toInt(),
        canReturn: j['can_return'] == true,
        trackingStatus: j['tracking_status'] as String?,
        trackingMessage: j['tracking_message'] as String?,
        trackingUpdatedAt: j['tracking_updated_at'] as String?,
      );
}
