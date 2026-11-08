/// A wishlist entry as returned by the server API.
///
/// Mirrors the JSON shape from `GET /api/buyer/wishlist`:
/// ```
/// {
///   "product_id": 1,
///   "product_name": "Foo",
///   "image_url": "http://...",
///   "price": 99.99,
///   "sale_price": null,
///   "effective_price": 99.99,
///   "is_on_sale": false,
///   "stock": 10,
///   "stock_status": "In stock",
///   "is_in_stock": true,
///   "is_available": true,
///   "added_at": "2026-11-06T10:00:00.000000Z"
/// }
/// ```
class WishlistItem {
  const WishlistItem({
    required this.productId,
    required this.productName,
    required this.imageUrl,
    required this.price,
    this.salePrice,
    required this.effectivePrice,
    required this.isOnSale,
    required this.stock,
    required this.stockStatus,
    required this.isInStock,
    required this.isAvailable,
    required this.addedAt,
  });

  final int productId;
  final String productName;
  final String? imageUrl;
  final double price;
  final double? salePrice;
  final double effectivePrice;
  final bool isOnSale;
  final int stock;
  final String stockStatus;
  final bool isInStock;
  final bool isAvailable;
  final String addedAt;

  factory WishlistItem.fromJson(Map<String, dynamic> j) => WishlistItem(
        productId: (j['product_id'] as num).toInt(),
        productName: j['product_name'] as String? ?? '',
        imageUrl: j['image_url'] as String?,
        price: (j['price'] as num?)?.toDouble() ?? 0.0,
        salePrice: j['sale_price'] != null
            ? (j['sale_price'] as num).toDouble()
            : null,
        effectivePrice: (j['effective_price'] as num?)?.toDouble() ?? 0.0,
        isOnSale: j['is_on_sale'] as bool? ?? false,
        stock: (j['stock'] as num?)?.toInt() ?? 0,
        stockStatus: j['stock_status'] as String? ?? '',
        isInStock: j['is_in_stock'] as bool? ?? false,
        isAvailable: j['is_available'] as bool? ?? false,
        addedAt: j['added_at'] as String? ?? '',
      );
}
