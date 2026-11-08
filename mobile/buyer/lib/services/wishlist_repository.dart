import '../models/wishlist_item.dart';
import 'api_service.dart';

/// Thin repository over [ApiService] for wishlist operations.
/// All methods throw [ApiException] on non-2xx; callers handle UI state.
class WishlistRepository {
  WishlistRepository._();
  static final WishlistRepository instance = WishlistRepository._();

  /// GET /api/buyer/wishlist — returns all wishlist items (including
  /// unavailable products, which have `is_available = false`).
  Future<List<WishlistItem>> fetchWishlist() async {
    final res = await ApiService.get('/buyer/wishlist') as Map<String, dynamic>;
    final data = res['data'] as List<dynamic>? ?? [];
    return data
        .map((e) => WishlistItem.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  /// POST /api/buyer/wishlist/{productId} — add to wishlist.
  /// Idempotent (200 if already in wishlist).
  /// Returns the updated wishlist count from the server.
  Future<int> add(int productId) async {
    final res = await ApiService.post('/buyer/wishlist/$productId')
        as Map<String, dynamic>;
    return (res['wishlist_count'] as num?)?.toInt() ?? 0;
  }

  /// DELETE /api/buyer/wishlist/{productId} — remove from wishlist.
  /// Idempotent (200 even if not in wishlist).
  /// Returns the updated wishlist count from the server.
  Future<int> remove(int productId) async {
    final res = await ApiService.delete('/buyer/wishlist/$productId')
        as Map<String, dynamic>;
    return (res['wishlist_count'] as num?)?.toInt() ?? 0;
  }
}
