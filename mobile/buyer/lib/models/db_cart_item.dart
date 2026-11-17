import '../config/checkout_limits.dart';

int _capToCheckoutMax(int stock, int perCheckout) =>
    stock < perCheckout ? stock : perCheckout;

/// A cart line as returned by the server API.
/// Distinct from the local [CartItem] (which holds a full [Product] object)
/// — this model holds only the fields the server returns.
class DbCartItem {
  const DbCartItem({
    required this.id,
    required this.productId,
    required this.productName,
    required this.imageUrl,
    required this.unitPrice,
    required this.regularPrice,
    required this.isOnSale,
    required this.quantity,
    required this.lineTotal,
    required this.maxQuantity,
    required this.stockStatus,
    required this.isValid,
    this.validationIssue,
    this.variantId,
    this.variantSnapshot,
  });

  final int id;
  final int productId;
  final String productName;
  final String? imageUrl;
  final double unitPrice;
  final double regularPrice;
  final bool isOnSale;
  final int quantity;
  final double lineTotal;
  final int maxQuantity;
  final String stockStatus;
  final bool isValid;
  final String? validationIssue;
  final String? variantId;
  final Map<String, dynamic>? variantSnapshot;

  factory DbCartItem.fromJson(Map<String, dynamic> j) => DbCartItem(
        id: (j['id'] as num).toInt(),
        productId: (j['product_id'] as num).toInt(),
        productName: j['product_name'] as String? ?? '',
        imageUrl: j['image_url'] as String?,
        unitPrice: (j['unit_price'] as num?)?.toDouble() ?? 0.0,
        regularPrice: (j['regular_price'] as num?)?.toDouble() ?? 0.0,
        isOnSale: j['is_on_sale'] as bool? ?? false,
        quantity: (j['quantity'] as num).toInt(),
        lineTotal: (j['line_total'] as num?)?.toDouble() ?? 0.0,
        maxQuantity: _capToCheckoutMax(
            (j['max_quantity'] as num?)?.toInt() ?? 0,
            (j['max_per_checkout'] as num?)?.toInt() ?? kMaxQtyPerCheckout),
        stockStatus: j['stock_status'] as String? ?? '',
        isValid: j['is_valid'] as bool? ?? true,
        validationIssue: j['validation_issue'] as String?,
        variantId: j['variant_id'] as String?,
        variantSnapshot: j['variant_snapshot'] as Map<String, dynamic>?,
      );

  DbCartItem copyWith({int? quantity, double? lineTotal}) => DbCartItem(
        id: id,
        productId: productId,
        productName: productName,
        imageUrl: imageUrl,
        unitPrice: unitPrice,
        regularPrice: regularPrice,
        isOnSale: isOnSale,
        quantity: quantity ?? this.quantity,
        lineTotal: lineTotal ?? this.lineTotal,
        maxQuantity: maxQuantity,
        stockStatus: stockStatus,
        isValid: isValid,
        validationIssue: validationIssue,
        variantId: variantId,
        variantSnapshot: variantSnapshot,
      );
}
