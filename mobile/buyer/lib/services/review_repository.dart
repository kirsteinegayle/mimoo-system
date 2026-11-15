import 'api_service.dart';

/// A picked image ready for upload (bytes so it works on web too).
class PickedImage {
  const PickedImage({required this.bytes, required this.name, required this.mime});
  final List<int> bytes;
  final String name;
  final String mime;
}

class ProductReview {
  const ProductReview({
    required this.id,
    required this.rating,
    this.comment,
    required this.images,
    required this.buyerName,
    this.variantLabel,
    required this.isEdited,
    this.sellerReply,
    this.createdAt,
  });

  final int id;
  final int rating;
  final String? comment;
  final List<String> images;
  final String buyerName;
  final String? variantLabel;
  final bool isEdited;
  final String? sellerReply;
  final DateTime? createdAt;

  factory ProductReview.fromJson(Map<String, dynamic> j) {
    String? variant;
    final v = j['variant'];
    if (v is Map && v['combination'] is Map) {
      variant = (v['combination'] as Map).values.join(', ');
    }
    return ProductReview(
      id: (j['id'] as num).toInt(),
      rating: (j['rating'] as num?)?.toInt() ?? 0,
      comment: j['comment'] as String?,
      images: (j['images'] as List<dynamic>? ?? []).map((e) => '$e').toList(),
      buyerName: j['buyer_name'] as String? ?? 'Anonymous',
      variantLabel: variant,
      isEdited: j['is_edited'] == true,
      sellerReply: j['seller_reply'] as String?,
      createdAt: DateTime.tryParse(j['created_at'] as String? ?? ''),
    );
  }
}

/// One of the buyer's own reviews (GET /api/buyer/reviews/mine).
class MyReview {
  const MyReview({
    required this.id,
    required this.productId,
    required this.productName,
    required this.orderId,
    required this.rating,
    this.comment,
    required this.images,
    required this.isEdited,
    required this.canEdit,
    this.sellerReply,
    this.createdAt,
  });

  final int id;
  final int? productId;
  final String productName;
  final int? orderId;
  final int rating;
  final String? comment;
  final List<String> images;
  final bool isEdited;
  final bool canEdit;
  final String? sellerReply;
  final DateTime? createdAt;

  factory MyReview.fromJson(Map<String, dynamic> j) => MyReview(
        id: (j['id'] as num).toInt(),
        productId: (j['product_id'] as num?)?.toInt(),
        productName: j['product_name'] as String? ?? 'Product',
        orderId: (j['order_id'] as num?)?.toInt(),
        rating: (j['rating'] as num?)?.toInt() ?? 0,
        comment: j['comment'] as String?,
        images: (j['images'] as List<dynamic>? ?? []).map((e) => '$e').toList(),
        isEdited: j['is_edited'] == true,
        canEdit: j['can_edit'] == true,
        sellerReply: j['seller_reply'] as String?,
        createdAt: DateTime.tryParse(j['created_at'] as String? ?? ''),
      );
}

class ProductReviewPage {
  const ProductReviewPage({
    required this.reviews,
    required this.ratingAvg,
    required this.ratingCount,
    required this.breakdown,
    required this.hasMore,
  });
  final List<ProductReview> reviews;
  final double? ratingAvg;
  final int ratingCount;
  final Map<int, int> breakdown;
  final bool hasMore;
}

class ReviewRepository {
  ReviewRepository._();
  static final ReviewRepository instance = ReviewRepository._();

  Future<ProductReviewPage> productReviews(int productId, {int page = 1}) async {
    final res = await ApiService.get('/buyer/products/$productId/reviews',
        queryParameters: {'page': '$page', 'per_page': '10'},
        includeAuth: false) as Map<String, dynamic>;
    final meta = res['meta'] as Map<String, dynamic>? ?? {};
    final bd = <int, int>{};
    final rawBd = meta['breakdown'];
    if (rawBd is Map) {
      rawBd.forEach((k, v) => bd[int.tryParse('$k') ?? 0] = (v as num).toInt());
    }
    return ProductReviewPage(
      reviews: (res['data'] as List<dynamic>? ?? [])
          .map((e) => ProductReview.fromJson(e as Map<String, dynamic>))
          .toList(),
      ratingAvg: (meta['rating_avg'] as num?)?.toDouble(),
      ratingCount: (meta['rating_count'] as num?)?.toInt() ?? 0,
      breakdown: bd,
      hasMore: meta['has_more'] == true,
    );
  }

  List<MultipartUpload> _files(List<PickedImage> images) => images
      .map((i) => MultipartUpload(
          field: 'images[]', bytes: i.bytes, filename: i.name, contentType: i.mime))
      .toList();

  Future<void> submit({
    required int orderId,
    required int itemId,
    required int rating,
    String? comment,
    List<PickedImage> images = const [],
  }) async {
    await ApiService.postMultipartFields(
      '/buyer/orders/$orderId/items/$itemId/review',
      fields: {
        'rating': '$rating',
        if (comment != null && comment.trim().isNotEmpty) 'comment': comment.trim(),
      },
      files: _files(images),
    );
  }

  /// The buyer's own reviews (GET /api/buyer/reviews/mine) — same rows as the
  /// web "My Reviews" page.
  Future<List<MyReview>> mine() async {
    final res = await ApiService.get('/buyer/reviews/mine') as Map<String, dynamic>;
    return (res['data'] as List<dynamic>? ?? [])
        .map((e) => MyReview.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  /// Edit (allowed once within 30 days). Photos are replaced only when
  /// [images] is non-empty. Uses POST + _method=PUT so files can be sent.
  Future<void> update({
    required int reviewId,
    required int rating,
    String? comment,
    List<PickedImage> images = const [],
  }) async {
    await ApiService.postMultipartFields(
      '/buyer/reviews/$reviewId',
      fields: {
        '_method': 'PUT',
        'rating': '$rating',
        if (comment != null && comment.trim().isNotEmpty) 'comment': comment.trim(),
      },
      files: _files(images),
    );
  }
}
