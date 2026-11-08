import 'api_service.dart';
import 'review_repository.dart' show PickedImage;

class ReturnRequestInfo {
  const ReturnRequestInfo({
    required this.id,
    required this.orderId,
    required this.orderNumber,
    required this.reason,
    required this.description,
    required this.images,
    required this.status,
    this.sellerResponse,
    this.respondedAt,
    this.escalatedAt,
    required this.canEscalate,
    this.createdAt,
  });

  final int id;
  final int orderId;
  final String orderNumber;
  final String reason;
  final String description;
  final List<String> images;
  final String status;
  final String? sellerResponse;
  final DateTime? respondedAt;
  final DateTime? escalatedAt;
  final bool canEscalate;
  final DateTime? createdAt;

  factory ReturnRequestInfo.fromJson(Map<String, dynamic> j) => ReturnRequestInfo(
        id: (j['id'] as num).toInt(),
        orderId: (j['order_id'] as num).toInt(),
        orderNumber: j['order_number'] as String? ?? '',
        reason: j['reason'] as String? ?? '',
        description: j['description'] as String? ?? '',
        images: (j['images'] as List<dynamic>? ?? []).map((e) => '$e').toList(),
        status: j['status'] as String? ?? 'pending',
        sellerResponse: j['seller_response'] as String?,
        respondedAt: DateTime.tryParse(j['responded_at'] as String? ?? ''),
        escalatedAt: DateTime.tryParse(j['escalated_at'] as String? ?? ''),
        canEscalate: j['can_escalate'] == true,
        createdAt: DateTime.tryParse(j['created_at'] as String? ?? ''),
      );
}

class ReturnRepository {
  ReturnRepository._();
  static final ReturnRepository instance = ReturnRepository._();

  static const reasons = [
    'Damaged',
    'Wrong item',
    'Not as described',
    'Missing item',
    'Other',
  ];

  Future<ReturnRequestInfo> submit({
    required int orderId,
    required String reason,
    required String description,
    required List<PickedImage> images,
  }) async {
    final res = await ApiService.postMultipartFields(
      '/buyer/orders/$orderId/return',
      fields: {'reason': reason, 'description': description.trim()},
      files: images
          .map((i) => MultipartUpload(
              field: 'images[]', bytes: i.bytes, filename: i.name, contentType: i.mime))
          .toList(),
    ) as Map<String, dynamic>;
    return ReturnRequestInfo.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<List<ReturnRequestInfo>> list() async {
    final res = await ApiService.get('/buyer/returns') as Map<String, dynamic>;
    return (res['data'] as List<dynamic>? ?? [])
        .map((e) => ReturnRequestInfo.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<ReturnRequestInfo> show(int id) async {
    final res = await ApiService.get('/buyer/returns/$id') as Map<String, dynamic>;
    return ReturnRequestInfo.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<ReturnRequestInfo> escalate(int id) async {
    final res = await ApiService.post('/buyer/returns/$id/escalate')
        as Map<String, dynamic>;
    return ReturnRequestInfo.fromJson(res['data'] as Map<String, dynamic>);
  }
}
