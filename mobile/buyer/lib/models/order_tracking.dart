/// Transit log of one order — GET /api/buyer/orders/{id}/tracking.
/// Same JSON as the website's Track Order page (OrderTrackingService).
class TrackingEvent {
  const TrackingEvent({
    required this.key,
    required this.title,
    required this.at,
    this.description,
    this.location,
    this.handler,
  });

  final String key;
  final String title;
  final String? description;
  final String? location;
  final String? handler;
  final DateTime at;

  bool get isProblem => const {
        'delivery_failed',
        'cancelled',
        'returned',
        'scan_return_received',
      }.contains(key);

  bool get isDone => key == 'delivered' || key == 'completed';

  factory TrackingEvent.fromJson(Map<String, dynamic> j) => TrackingEvent(
        key: j['key'] as String? ?? '',
        title: j['title'] as String? ?? '',
        description: j['description'] as String?,
        location: j['location'] as String?,
        handler: j['handler'] as String?,
        at: DateTime.tryParse(j['at'] as String? ?? '')?.toLocal() ?? DateTime.now(),
      );
}

class OrderTracking {
  const OrderTracking({
    required this.orderId,
    required this.orderNumber,
    required this.status,
    required this.destination,
    required this.events,
    this.waybillNumber,
    this.trackingLabel,
    this.trackingMessage,
    this.courierName,
    this.currentLocation,
  });

  final int orderId;
  final String orderNumber;
  final String? waybillNumber;
  final String status;
  final String? trackingLabel;
  final String? trackingMessage;
  final String? courierName;
  final String? currentLocation;
  final String destination;

  /// Oldest first (as sent by the server).
  final List<TrackingEvent> events;

  bool get isFinished =>
      const {'completed', 'cancelled', 'failed'}.contains(status);

  factory OrderTracking.fromJson(Map<String, dynamic> j) {
    final t = j['tracking'] as Map<String, dynamic>? ?? const {};
    return OrderTracking(
      orderId: (j['order_id'] as num?)?.toInt() ?? 0,
      orderNumber: j['order_number'] as String? ?? '',
      waybillNumber: j['waybill_number'] as String?,
      status: j['status'] as String? ?? '',
      trackingLabel: t['label'] as String?,
      trackingMessage: t['message'] as String?,
      courierName: j['courier_name'] as String?,
      currentLocation: j['current_location'] as String?,
      destination: j['destination'] as String? ?? '—',
      events: (j['events'] as List<dynamic>? ?? const [])
          .map((e) => TrackingEvent.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}
