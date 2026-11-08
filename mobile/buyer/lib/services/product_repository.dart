import '../models/product.dart';
import 'api_service.dart';

/// Thin repository over [ApiService] for product-related API calls.
/// All methods throw [ApiException] on non-2xx; callers handle UI state.
class ProductRepository {
  ProductRepository._();
  static final ProductRepository instance = ProductRepository._();

  // ── List products (paginated) ─────────────────────────────────────────────

  /// Returns a page of products matching the given filters.
  ///
  /// [page]     — 1-based page number (default 1)
  /// [perPage]  — items per page (default 12, max 50 enforced by API)
  /// [category] — filter by category string (pass null for all)
  /// [search]   — full-text search
  /// [sort]     — 'popular' (web homepage order) | 'newest' | 'price_asc' | 'price_desc'
  Future<ProductPage> fetchProducts({
    int page = 1,
    int perPage = 12,
    String? category,
    String? search,
    String sort = 'newest',
  }) async {
    final params = <String, String>{
      'page': '$page',
      'per_page': '$perPage',
      'sort': sort,
      if (category != null && category.isNotEmpty) 'category': category,
      if (search != null && search.isNotEmpty) 'search': search,
    };

    final res = await ApiService.get(
      '/buyer/products',
      queryParameters: params,
      includeAuth: false,
    ) as Map<String, dynamic>;

    final data = (res['data'] as List<dynamic>)
        .map((e) => Product.fromJson(e as Map<String, dynamic>))
        .toList();

    final meta = res['meta'] as Map<String, dynamic>;

    return ProductPage(
      products: data,
      currentPage: (meta['current_page'] as num).toInt(),
      lastPage: (meta['last_page'] as num).toInt(),
      total: (meta['total'] as num).toInt(),
      hasMore: meta['has_more'] as bool? ?? false,
    );
  }

  // ── Single product detail ─────────────────────────────────────────────────

  Future<Product> fetchProduct(int id) async {
    final res = await ApiService.get(
      '/buyer/products/$id',
      includeAuth: false,
    ) as Map<String, dynamic>;

    return Product.fromJson(res['data'] as Map<String, dynamic>);
  }
}

/// Value object returned by [ProductRepository.fetchProducts].
class ProductPage {
  const ProductPage({
    required this.products,
    required this.currentPage,
    required this.lastPage,
    required this.total,
    required this.hasMore,
  });

  final List<Product> products;
  final int currentPage;
  final int lastPage;
  final int total;
  final bool hasMore;
}
