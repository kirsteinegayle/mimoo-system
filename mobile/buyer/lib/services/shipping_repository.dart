import 'api_service.dart';

/// Shipping fee shown before ordering. Same calculation as the web checkout
/// (GET /api/buyer/shipping/quote: buyer zone + parcel weight, standard fallback fee, never 0).
class ShippingQuote {
  const ShippingQuote({
    required this.fee,
    required this.weight,
    this.zone,
    this.logistics,
    this.standardRate = false,
  });

  final double fee;
  final double weight;
  final String? zone;
  final String? logistics;

  /// True when no zone / weight bracket matched and the platform standard rate applies.
  final bool standardRate;

  String get label => zone != null ? '$zone zone · ${weight.toStringAsFixed(1)} kg' : 'Standard rate · ${weight.toStringAsFixed(1)} kg';

  factory ShippingQuote.fromJson(Map<String, dynamic> j) => ShippingQuote(
        fee: (j['shipping_fee'] as num?)?.toDouble() ?? 0,
        weight: (j['weight'] as num?)?.toDouble() ?? 0,
        zone: j['zone'] as String?,
        logistics: j['logistics'] as String?,
        standardRate: j['standard_rate'] as bool? ?? false,
      );
}

class ShippingRepository {
  ShippingRepository._();
  static final ShippingRepository instance = ShippingRepository._();

  /// Quote for the selected cart lines to a saved address ([addressId]) or a typed one ([shippingAddress]).
  Future<ShippingQuote> quote({
    required List<int> cartItemIds,
    int? addressId,
    String? shippingAddress,
  }) async {
    final res = await ApiService.get('/buyer/shipping/quote', queryParameters: {
      'cart_item_ids': cartItemIds.join(','),
      if (addressId != null) 'address_id': '$addressId',
      if (addressId == null && shippingAddress != null) 'shipping_address': shippingAddress,
    }) as Map<String, dynamic>;
    return ShippingQuote.fromJson(res['data'] as Map<String, dynamic>);
  }
}
