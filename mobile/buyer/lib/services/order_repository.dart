import 'dart:typed_data';

import '../models/order.dart';
import 'api_service.dart';

/// Thin repository over [ApiService] for order operations.
class OrderRepository {
  OrderRepository._();
  static final OrderRepository instance = OrderRepository._();

  Future<CheckoutResult> checkout({
    required String paymentMethod,
    required String shippingName,
    required String shippingAddress,
    required String shippingPhone,
    String? idempotencyKey,
    List<int>? cartItemIds,
    String? voucherCode,
    int? addressId,
  }) async {
    final body = <String, dynamic>{
      'payment_method': paymentMethod,
      // With address_id the server snapshots name/address/phone from the
      // saved address; shipping_* are still sent for legacy compatibility.
      if (addressId != null) 'address_id': addressId,
      'shipping_name': shippingName,
      'shipping_address': shippingAddress,
      'shipping_phone': shippingPhone,
      if (idempotencyKey != null) 'idempotency_key': idempotencyKey,
      if (cartItemIds != null && cartItemIds.isNotEmpty)
        'cart_item_ids': cartItemIds,
      if (voucherCode != null && voucherCode.isNotEmpty)
        'voucher_code': voucherCode.trim().toUpperCase(),
    };
    final res = await ApiService.post('/buyer/checkout', body: body)
        as Map<String, dynamic>;
    return CheckoutResult.fromJson(res);
  }

  Future<OrderPage> fetchOrders({int page = 1, String? status}) async {
    final params = <String, String>{
      'page': '$page',
      if (status != null && status.isNotEmpty) 'status': status,
    };
    final res = await ApiService.get(
      '/buyer/orders',
      queryParameters: params,
    ) as Map<String, dynamic>;
    return OrderPage.fromJson(res);
  }

  Future<Order> fetchOrder(int id) async {
    final res =
        await ApiService.get('/buyer/orders/$id') as Map<String, dynamic>;
    return Order.fromJson(res['data'] as Map<String, dynamic>);
  }

  /// GET /api/buyer/orders/{id}/delivery-code — read-only. Returns null
  /// unless the rider is out for delivery and an active code exists.
  Future<DeliveryCode?> fetchDeliveryCode(int id) async {
    final res = await ApiService.get('/buyer/orders/$id/delivery-code')
        as Map<String, dynamic>;
    return DeliveryCode.tryParse(res['data']);
  }

  /// GET /api/buyer/orders/{id}/pod-photo — proof-of-delivery photo bytes.
  /// null when there is none (404: no delivery job / no photo).
  Future<Uint8List?> fetchPodPhoto(int id) =>
      ApiService.getBytes('/buyer/orders/$id/pod-photo');

  /// POST /api/buyer/orders/{id}/receive — shipped → completed.
  /// 422 when the order isn't shipped or has an open return request.
  Future<void> receiveOrder(int id) async {
    await ApiService.post('/buyer/orders/$id/receive');
  }

  Future<void> cancelOrder(int id, {String? reason}) async {
    await ApiService.post('/buyer/orders/$id/cancel', body: {
      if (reason != null && reason.isNotEmpty) 'reason': reason,
    });
  }
}

/// Active delivery code for the buyer to give the rider (memory only).
class DeliveryCode {
  const DeliveryCode({required this.code, required this.expiresAt, this.riderFirstName});

  final String code;
  final DateTime expiresAt;
  final String? riderFirstName;

  static DeliveryCode? tryParse(dynamic data) {
    if (data is! Map<String, dynamic>) return null;
    final code = data['code'];
    final exp = DateTime.tryParse(data['expires_at']?.toString() ?? '');
    if (code is! String || code.isEmpty || exp == null) return null;
    return DeliveryCode(
      code: code,
      expiresAt: exp,
      riderFirstName: data['rider_first_name'] as String?,
    );
  }
}

class CheckoutResult {
  final String message;
  final int orderId;
  final String orderNumber;
  final double total;
  final double voucherDiscount;

  const CheckoutResult({
    required this.message,
    required this.orderId,
    required this.orderNumber,
    required this.total,
    this.voucherDiscount = 0.0,
  });

  factory CheckoutResult.fromJson(Map<String, dynamic> j) => CheckoutResult(
        message: j['message'] as String? ?? '',
        orderId: (j['order_id'] as num?)?.toInt() ?? 0,
        orderNumber: j['order_number'] as String? ?? '',
        total: (j['total'] as num?)?.toDouble() ?? 0.0,
        voucherDiscount: (j['voucher_discount'] as num?)?.toDouble() ?? 0.0,
      );
}

class OrderPage {
  final List<Order> orders;
  final int currentPage;
  final int lastPage;
  final int total;
  final bool hasMore;

  const OrderPage({
    required this.orders,
    required this.currentPage,
    required this.lastPage,
    required this.total,
    required this.hasMore,
  });

  factory OrderPage.fromJson(Map<String, dynamic> j) {
    final meta = j['meta'] as Map<String, dynamic>? ?? {};
    return OrderPage(
      orders: (j['data'] as List<dynamic>? ?? [])
          .map((e) => Order.fromJson(e as Map<String, dynamic>))
          .toList(),
      currentPage: (meta['current_page'] as num?)?.toInt() ?? 1,
      lastPage: (meta['last_page'] as num?)?.toInt() ?? 1,
      total: (meta['total'] as num?)?.toInt() ?? 0,
      hasMore: meta['has_more'] as bool? ?? false,
    );
  }
}
