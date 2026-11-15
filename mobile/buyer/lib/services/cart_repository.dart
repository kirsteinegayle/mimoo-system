import '../models/db_cart_item.dart';
import 'api_service.dart';

/// Thin repository over [ApiService] for cart operations.
/// All methods throw [ApiException] on non-2xx; callers handle UI state.
class CartRepository {
  CartRepository._();
  static final CartRepository instance = CartRepository._();

  Future<CartFetchResult> fetchCart() async {
    final res = await ApiService.get('/buyer/cart') as Map<String, dynamic>;
    return CartFetchResult.fromJson(res);
  }

  Future<CartMutationResult> addItem({
    required int productId,
    int quantity = 1,
    String? variantId,
    bool replaceQuantity = false,
  }) async {
    final res = await ApiService.post('/buyer/cart/items', body: {
      'product_id': productId,
      'quantity': quantity,
      if (variantId != null) 'variant_id': variantId,
      if (replaceQuantity) 'replace_quantity': true,
    }) as Map<String, dynamic>;
    return CartMutationResult.fromJson(res);
  }

  Future<CartMutationResult> updateItem(int itemId, int quantity) async {
    final res = await ApiService.patch(
      '/buyer/cart/items/$itemId',
      body: {'quantity': quantity},
    ) as Map<String, dynamic>;
    return CartMutationResult.fromJson(res);
  }

  Future<CartMutationResult> removeItem(int itemId) async {
    final res = await ApiService.delete('/buyer/cart/items/$itemId')
        as Map<String, dynamic>;
    return CartMutationResult.fromJson(res);
  }

  Future<void> clearCart() async {
    await ApiService.delete('/buyer/cart');
  }
}

class CartFetchResult {
  final List<DbCartItem> items;
  final double subtotal;
  final int totalItems;

  const CartFetchResult({
    required this.items,
    required this.subtotal,
    required this.totalItems,
  });

  factory CartFetchResult.fromJson(Map<String, dynamic> j) => CartFetchResult(
        items: (j['items'] as List<dynamic>)
            .map((e) => DbCartItem.fromJson(e as Map<String, dynamic>))
            .toList(),
        subtotal: (j['subtotal'] as num?)?.toDouble() ?? 0,
        totalItems: (j['total_items'] as num?)?.toInt() ?? 0,
      );
}

class CartMutationResult {
  final String message;
  final int? itemId;
  final int? itemQuantity;
  final int cartCount;

  const CartMutationResult({
    required this.message,
    this.itemId,
    this.itemQuantity,
    required this.cartCount,
  });

  factory CartMutationResult.fromJson(Map<String, dynamic> j) =>
      CartMutationResult(
        message: j['message'] as String? ?? '',
        itemId: (j['cart_item']?['id'] as num?)?.toInt(),
        itemQuantity: (j['cart_item']?['quantity'] as num?)?.toInt(),
        cartCount: (j['cart_count'] as num?)?.toInt() ?? 0,
      );
}
