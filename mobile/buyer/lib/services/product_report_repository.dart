import 'api_service.dart';

/// One report reason; same values and labels as the web report form.
class ProductReportReason {
  const ProductReportReason(this.value, this.label);
  final String value;
  final String label;
}

/// Buyer product report: POST /api/buyer/products/{id}/report (Sanctum).
/// Same rules as the web (reason list, description 1–500, one pending
/// report per product, no reporting your own product).
class ProductReportRepository {
  ProductReportRepository._();
  static final ProductReportRepository instance = ProductReportRepository._();

  static const int maxDescription = 500;

  static const List<ProductReportReason> reasons = [
    ProductReportReason('misleading', 'Misleading or false information'),
    ProductReportReason('inappropriate', 'Inappropriate content'),
    ProductReportReason('counterfeit', 'Counterfeit or fake product'),
    ProductReportReason('spam', 'Spam or duplicate listing'),
    ProductReportReason('other', 'Other'),
  ];

  /// Returns the server's success message.
  Future<String> submit({
    required int productId,
    required String reason,
    required String description,
  }) async {
    final res = await ApiService.post('/buyer/products/$productId/report', body: {
      'reason': reason,
      'description': description,
    });
    if (res is Map && res['message'] is String) return res['message'] as String;
    return 'Thanks for your report. Our team will review it shortly.';
  }

  /// User-facing text for a failed submit (duplicate, rate limit, etc.).
  static String errorMessage(Object e) {
    if (e is ApiException) {
      switch (e.statusCode) {
        case 409:
          return e.message.isNotEmpty
              ? e.message
              : 'You already reported this product. Our team is still reviewing it.';
        case 429:
          return 'Too many reports in a short time. Please wait a minute and try again.';
        case 404:
          return 'This product is no longer available.';
        case 403:
          return e.message.isNotEmpty ? e.message : 'You cannot report this product.';
        case 422:
          return e.errorFor('description') ??
              e.errorFor('reason') ??
              (e.message.isNotEmpty ? e.message : 'Please check your report and try again.');
      }
    }
    return ApiService.friendlyError(e);
  }
}
