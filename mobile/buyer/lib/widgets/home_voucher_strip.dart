import 'package:flutter/material.dart';

import '../models/voucher.dart';
import '../pages/voucher/voucher_wallet_page.dart';
import '../services/api_service.dart';
import '../services/voucher_repository.dart';
import '../state/auth_service.dart';
import '../theme/app_theme.dart';

/// "Available Vouchers" strip on the home screen — same list and claim rules
/// as the web homepage (GET /api/buyer/vouchers, POST /api/buyer/vouchers/claim).
/// Hidden for guests and when no voucher is live.
class HomeVoucherStrip extends StatefulWidget {
  const HomeVoucherStrip({super.key});

  @override
  State<HomeVoucherStrip> createState() => _HomeVoucherStripState();
}

class _HomeVoucherStripState extends State<HomeVoucherStrip> {
  List<VoucherModel> _vouchers = const [];
  int? _claiming;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (!AuthService.instance.isLoggedIn || ApiService.token == null) return;
    try {
      final list = await VoucherRepository.instance.fetchAvailable();
      if (mounted) setState(() => _vouchers = list);
    } catch (_) {
      // The strip is optional: a failed load simply hides it.
    }
  }

  Future<void> _claim(VoucherModel v) async {
    setState(() => _claiming = v.id);
    try {
      await VoucherRepository.instance.claim(id: v.id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Voucher claimed! Apply it at checkout.'),
        behavior: SnackBarBehavior.floating,
      ));
      await _load();
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(e.message),
        backgroundColor: AppColors.error,
        behavior: SnackBarBehavior.floating,
      ));
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Could not claim the voucher. Please try again.'),
        behavior: SnackBarBehavior.floating,
      ));
    } finally {
      if (mounted) setState(() => _claiming = null);
    }
  }

  static String _peso(double n) =>
      n == n.roundToDouble() ? '₱${n.toStringAsFixed(0)}' : '₱${n.toStringAsFixed(2)}';

  static String _expiry(String iso) {
    final d = DateTime.tryParse(iso)?.toLocal();
    if (d == null) return '';
    const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return 'Valid until ${m[d.month - 1]} ${d.day}, ${d.year}';
  }

  @override
  Widget build(BuildContext context) {
    if (_vouchers.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(top: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(children: [
              const Icon(Icons.local_offer_outlined, size: 18, color: AppColors.accent),
              const SizedBox(width: 6),
              const Expanded(
                child: Text('Available Vouchers',
                    style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: AppColors.text)),
              ),
              TextButton(
                onPressed: () async {
                  await Navigator.push(context, MaterialPageRoute(builder: (_) => const VoucherWalletPage()));
                  _load();
                },
                child: const Text('My Vouchers'),
              ),
            ]),
          ),
          SizedBox(
            height: 132,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              scrollDirection: Axis.horizontal,
              itemCount: _vouchers.length,
              separatorBuilder: (_, __) => const SizedBox(width: 10),
              itemBuilder: (_, i) => _card(_vouchers[i]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _card(VoucherModel v) {
    final off = v.type == 'percentage' ? '${v.value.toStringAsFixed(v.value % 1 == 0 ? 0 : 2)}% OFF' : '${_peso(v.value)} OFF';
    final claimed = v.isClaimed && !v.isUsed;
    return Container(
      width: 240,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(999)),
            child: Text(off, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 11)),
          ),
          const Spacer(),
          Text(v.code, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 11, color: AppColors.accent)),
        ]),
        const SizedBox(height: 6),
        Text(v.name, maxLines: 1, overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.text)),
        Text('Min. spend ${_peso(v.minPurchase)}${v.maxDiscount != null ? ' · Cap ${_peso(v.maxDiscount!)}' : ''}',
            style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
        Text(_expiry(v.validUntil), style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
        const Spacer(),
        Align(
          alignment: Alignment.centerRight,
          child: v.isUsed
              ? const Text('Used', style: TextStyle(fontWeight: FontWeight.w700, color: AppColors.textMuted))
              : claimed
                  ? const Text('Claimed ✓', style: TextStyle(fontWeight: FontWeight.w700, color: AppColors.success))
                  : SizedBox(
                      height: 30,
                      child: FilledButton(
                        style: FilledButton.styleFrom(
                            backgroundColor: AppColors.accent,
                            padding: const EdgeInsets.symmetric(horizontal: 16)),
                        onPressed: _claiming == v.id ? null : () => _claim(v),
                        child: Text(_claiming == v.id ? '…' : 'Claim', style: const TextStyle(fontSize: 12)),
                      ),
                    ),
        ),
      ]),
    );
  }
}
