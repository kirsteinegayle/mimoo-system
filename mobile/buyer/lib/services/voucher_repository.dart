import '../models/voucher.dart';
import 'api_service.dart';

class VoucherRepository {
  VoucherRepository._();
  static final VoucherRepository instance = VoucherRepository._();

  /// GET /api/buyer/vouchers — all claimable vouchers with claim status.
  Future<List<VoucherModel>> fetchAvailable() async {
    final res = await ApiService.get('/buyer/vouchers') as Map<String, dynamic>;
    return (res['data'] as List<dynamic>)
        .map((e) => VoucherModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  /// GET /api/buyer/vouchers/mine — wallet (claimed by this buyer).
  Future<List<VoucherModel>> fetchMine() async {
    final res =
        await ApiService.get('/buyer/vouchers/mine') as Map<String, dynamic>;
    return (res['data'] as List<dynamic>)
        .map((e) => VoucherModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  /// POST /api/buyer/vouchers/claim — claim by id or code.
  Future<VoucherModel> claim({int? id, String? code}) async {
    assert(id != null || (code != null && code.isNotEmpty));
    final body = <String, dynamic>{
      if (id != null) 'id': id,
      if (code != null && code.isNotEmpty) 'code': code.trim().toUpperCase(),
    };
    final res = await ApiService.post('/buyer/vouchers/claim', body: body)
        as Map<String, dynamic>;
    return VoucherModel.fromJson(res['data'] as Map<String, dynamic>);
  }

  /// POST /api/buyer/checkout/preview — returns discount breakdown.
  Future<PreviewResult> preview({
    String? voucherCode,
    List<int>? cartItemIds,
  }) async {
    final body = <String, dynamic>{
      if (voucherCode != null && voucherCode.isNotEmpty)
        'voucher_code': voucherCode.trim().toUpperCase(),
      if (cartItemIds != null && cartItemIds.isNotEmpty)
        'cart_item_ids': cartItemIds,
    };
    final res = await ApiService.post('/buyer/checkout/preview', body: body)
        as Map<String, dynamic>;
    return PreviewResult.fromJson(res['data'] as Map<String, dynamic>);
  }
}

class PreviewResult {
  const PreviewResult({
    required this.merchandiseTotal,
    required this.voucherDiscount,
    required this.total,
    this.voucherStatus,
  });

  final double merchandiseTotal;
  final double voucherDiscount;
  final double total;

  /// null = no voucher provided; 'applied' = success; otherwise = reason not applicable.
  final String? voucherStatus;

  bool get isApplied => voucherStatus == 'applied';
  bool get hasVoucher => voucherStatus != null;

  factory PreviewResult.fromJson(Map<String, dynamic> j) => PreviewResult(
        merchandiseTotal: (j['merchandise_total'] as num?)?.toDouble() ?? 0.0,
        voucherDiscount: (j['voucher_discount'] as num?)?.toDouble() ?? 0.0,
        total: (j['total'] as num?)?.toDouble() ?? 0.0,
        voucherStatus: j['voucher_status'] as String?,
      );
}
