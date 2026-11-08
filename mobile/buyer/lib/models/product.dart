class Product {
  const Product({
    required this.id,
    required this.name,
    required this.price,
    required this.imageUrl,
    required this.category,
    this.rating = 0.0,
    this.reviewCount = 0,
    // Extended fields from API
    this.salePrice,
    this.description,
    this.stock = 0,
    this.stockStatus = '',
    this.isInStock = true,
    this.isOnSale = false,
    this.brand,
    this.sellerId,
    this.sellerName,
    this.hasVariants = false,
    this.variantOptions,
    this.variants,
    this.images = const [],
    this.sku,
    this.weight,
    this.totalSold = 0,
    this.sellerPhotoUrl,
  });

  // ── Core fields (used by cart, wishlist, product_card — keep as-is) ────────
  final int id;
  final String name;
  final double price;

  /// Primary image URL (absolute, from /api/buyer/products/{id}/image/{index}).
  /// Falls back to empty string when the product has no image.
  final String imageUrl;
  final String category;

  /// From rating_avg / rating_count. Hide the rating row when reviewCount == 0.
  final double rating;
  final int reviewCount;

  // ── Extended fields from API ──────────────────────────────────────────────
  final double? salePrice;
  final String? description;
  final int stock;
  final String stockStatus;
  final bool isInStock;
  final bool isOnSale;
  final String? brand;
  final int? sellerId;
  final String? sellerName;
  final bool hasVariants;
  final List<dynamic>? variantOptions;
  final List<dynamic>? variants;

  /// All image URLs for the detail carousel (may be empty).
  final List<String> images;

  /// Detail-only fields (same as the web product page).
  final String? sku;
  final double? weight;

  /// Units sold in the last 7 days (same definition as the web homepage).
  final int totalSold;

  /// Store profile photo (served by /api/buyer/seller-photo/...).
  final String? sellerPhotoUrl;

  double get effectivePrice => salePrice ?? price;

  // ── Deserialise from list or detail API response ───────────────────────────
  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: (json['id'] as num).toInt(),
      name: json['name'] as String? ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      salePrice: json['sale_price'] != null
          ? (json['sale_price'] as num).toDouble()
          : null,
      imageUrl: json['image_url'] as String? ?? '',
      category: json['category'] as String? ?? '',
      description: json['description'] as String?,
      stock: (json['stock'] as num?)?.toInt() ?? 0,
      stockStatus: json['stock_status'] as String? ?? '',
      isInStock: json['is_in_stock'] as bool? ?? true,
      isOnSale: json['is_on_sale'] as bool? ?? false,
      brand: json['brand'] as String?,
      sellerId:
          json['seller_id'] != null ? (json['seller_id'] as num).toInt() : null,
      sellerName: json['seller_name'] as String?,
      hasVariants: json['has_variants'] as bool? ?? false,
      variantOptions: json['variant_options'] as List<dynamic>?,
      variants: json['variants'] as List<dynamic>?,
      images: (json['images'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      sku: json['sku'] as String?,
      weight: (json['weight'] as num?)?.toDouble(),
      totalSold: (json['total_sold'] as num?)?.toInt() ?? 0,
      sellerPhotoUrl: json['seller_profile_photo_url'] as String?,
      // Real review aggregates (rating_avg is null when there are no reviews).
      rating: (json['rating_avg'] as num?)?.toDouble() ?? 0.0,
      reviewCount: (json['rating_count'] as num?)?.toInt() ?? 0,
    );
  }
}
