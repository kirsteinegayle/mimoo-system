/// A voucher as returned by GET /api/buyer/vouchers and /api/buyer/vouchers/mine.
class VoucherModel {
  const VoucherModel({
    required this.id,
    required this.code,
    required this.name,
    this.description,
    required this.type,
    required this.value,
    required this.minPurchase,
    this.maxDiscount,
    this.usageLimit,
    required this.usagePerUser,
    required this.usageCount,
    required this.validFrom,
    required this.validUntil,
    required this.isClaimed,
    required this.isUsed,
    this.claimedAt,
  });

  final int id;
  final String code;
  final String name;
  final String? description;
  final String type; // 'percentage' | 'fixed'
  final double value;
  final double minPurchase;
  final double? maxDiscount;
  final int? usageLimit;
  final int usagePerUser;
  final int usageCount;
  final String validFrom;
  final String validUntil;
  final bool isClaimed;
  final bool isUsed;
  final String? claimedAt;

  bool get isPercentage => type == 'percentage';

  /// Human-readable discount label: e.g. "₱50 off" or "10% off"
  String get discountLabel {
    if (isPercentage) {
      final pct = value.toStringAsFixed(value == value.roundToDouble() ? 0 : 1);
      final cap = maxDiscount != null
          ? ' (max ₱${maxDiscount!.toStringAsFixed(0)})'
          : '';
      return '$pct% off$cap';
    }
    return '₱${value.toStringAsFixed(0)} off';
  }

  /// Min spend label: empty string if none required.
  String get minSpendLabel => minPurchase > 0
      ? 'Min. spend ₱${minPurchase.toStringAsFixed(0)}'
      : 'No minimum spend';

  /// Calculate discount for a given merchandise total (matches server logic).
  double calculateDiscount(double total) {
    if (total < minPurchase) return 0;
    if (isPercentage) {
      final d = total * (value / 100);
      return maxDiscount != null ? d.clamp(0, maxDiscount!) : d;
    }
    return value.clamp(0, total);
  }

  factory VoucherModel.fromJson(Map<String, dynamic> j) => VoucherModel(
        id: (j['id'] as num).toInt(),
        code: j['code'] as String? ?? '',
        name: j['name'] as String? ?? '',
        description: j['description'] as String?,
        type: j['type'] as String? ?? 'fixed',
        value: (j['value'] as num?)?.toDouble() ?? 0.0,
        minPurchase: (j['min_purchase'] as num?)?.toDouble() ?? 0.0,
        maxDiscount: j['max_discount'] != null
            ? (j['max_discount'] as num).toDouble()
            : null,
        usageLimit:
            j['usage_limit'] != null ? (j['usage_limit'] as num).toInt() : null,
        usagePerUser: (j['usage_per_user'] as num?)?.toInt() ?? 1,
        usageCount: (j['usage_count'] as num?)?.toInt() ?? 0,
        validFrom: j['valid_from'] as String? ?? '',
        validUntil: j['valid_until'] as String? ?? '',
        isClaimed: j['is_claimed'] as bool? ?? false,
        isUsed: j['is_used'] as bool? ?? false,
        claimedAt: j['claimed_at'] as String?,
      );
}
