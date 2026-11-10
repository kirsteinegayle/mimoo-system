import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../models/voucher.dart';
import '../../services/voucher_repository.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';

// ── Design tokens ─────────────────────────────────────────────────────────────
const _kPrimary = AppColors.primary;
const _kSecondary = AppColors.accent;
const _kFlash = AppColors.flash;
const _kSurface = AppColors.surface;
const _kCard = AppColors.card;
// ignore: unused_element
const _kChip = AppColors.chip;
const _kBorder = AppColors.border;
const _kText = AppColors.text;
const _kSubtext = AppColors.textMuted;
const _kGreen = AppColors.success;

TextStyle _pjs(
        {double size = 14,
        FontWeight weight = FontWeight.w400,
        Color color = _kText,
        double? height}) =>
    GoogleFonts.plusJakartaSans(
        fontSize: size, fontWeight: weight, color: color, height: height);

// ── Voucher Wallet Page ───────────────────────────────────────────────────────
class VoucherWalletPage extends StatefulWidget {
  const VoucherWalletPage({super.key});
  @override
  State<VoucherWalletPage> createState() => _VoucherWalletPageState();
}

class _VoucherWalletPageState extends State<VoucherWalletPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabCtrl;
  final _codeCtrl = TextEditingController();

  List<VoucherModel> _available = [];
  List<VoucherModel> _mine = [];
  bool _loadingAvailable = true;
  bool _loadingMine = true;
  String? _errorAvailable;
  String? _errorMine;
  bool _claiming = false;

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 2, vsync: this);
    _loadAvailable();
    _loadMine();
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    _codeCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadAvailable() async {
    setState(() {
      _loadingAvailable = true;
      _errorAvailable = null;
    });
    try {
      final v = await VoucherRepository.instance.fetchAvailable();
      if (!mounted) return;
      setState(() {
        _available = v;
        _loadingAvailable = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loadingAvailable = false;
        _errorAvailable = 'Could not load vouchers.';
      });
    }
  }

  Future<void> _loadMine() async {
    setState(() {
      _loadingMine = true;
      _errorMine = null;
    });
    try {
      final v = await VoucherRepository.instance.fetchMine();
      if (!mounted) return;
      setState(() {
        _mine = v;
        _loadingMine = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loadingMine = false;
        _errorMine = 'Could not load wallet.';
      });
    }
  }

  Future<void> _claim({int? id, String? code}) async {
    if (_claiming) return;
    setState(() => _claiming = true);
    try {
      await VoucherRepository.instance.claim(id: id, code: code);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Voucher claimed!',
              style:
                  _pjs(size: 13, color: Colors.white, weight: FontWeight.w600)),
          backgroundColor: _kGreen,
          duration: const Duration(seconds: 2)));
      _codeCtrl.clear();
      await Future.wait([_loadAvailable(), _loadMine()]);
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(e.message, style: _pjs(size: 13, color: Colors.white)),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating));
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Network error. Please try again.',
              style: _pjs(size: 13, color: Colors.white)),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating));
    } finally {
      if (mounted) setState(() => _claiming = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _kSurface,
      appBar: AppBar(
        backgroundColor: _kCard,
        elevation: 0,
        leading: IconButton(
            icon: Icon(Icons.arrow_back, color: _kText),
            onPressed: () => Navigator.pop(context)),
        title: Text('Vouchers', style: _pjs(size: 17, weight: FontWeight.w800)),
        bottom: TabBar(
          controller: _tabCtrl,
          labelColor: _kPrimary,
          unselectedLabelColor: _kSubtext,
          indicatorColor: _kPrimary,
          indicatorWeight: 2,
          labelStyle: _pjs(size: 13, weight: FontWeight.w700),
          tabs: const [Tab(text: 'Available'), Tab(text: 'My Wallet')],
        ),
      ),
      body: Column(children: [
        // ── Claim by code ────────────────────────────────────────────────────
        Container(
          color: _kCard,
          padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
          child: Row(children: [
            Expanded(
              child: TextFormField(
                controller: _codeCtrl,
                textCapitalization: TextCapitalization.characters,
                style: _pjs(size: 13),
                decoration: InputDecoration(
                  hintText: 'Enter voucher code (e.g. MIMOO2026)',
                  hintStyle: _pjs(size: 12, color: _kSubtext),
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: _kBorder)),
                  enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: _kBorder)),
                  focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: _kSecondary)),
                  isDense: true,
                ),
              ),
            ),
            const SizedBox(width: 8),
            ElevatedButton(
              onPressed:
                  _claiming ? null : () => _claim(code: _codeCtrl.text.trim()),
              style: ElevatedButton.styleFrom(
                  backgroundColor: _kPrimary,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8)),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 12)),
              child: _claiming
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white))
                  : Text('Claim',
                      style: _pjs(
                          size: 13,
                          weight: FontWeight.w700,
                          color: Colors.white)),
            ),
          ]),
        ),
        const Divider(height: 1, color: _kBorder),
        // ── Tabs ────────────────────────────────────────────────────────────
        Expanded(
          child: TabBarView(controller: _tabCtrl, children: [
            _buildAvailableTab(),
            _buildMineTab(),
          ]),
        ),
      ]),
    );
  }

  Widget _buildAvailableTab() {
    if (_loadingAvailable) {
      return const Center(child: CircularProgressIndicator(color: _kPrimary));
    }
    if (_errorAvailable != null) {
      return _buildError(_errorAvailable!, _loadAvailable);
    }
    if (_available.isEmpty) {
      return _buildEmpty('No vouchers available right now.');
    }
    return RefreshIndicator(
      color: _kPrimary,
      onRefresh: _loadAvailable,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
        itemCount: _available.length,
        itemBuilder: (_, i) => _VoucherCard(
          voucher: _available[i],
          onClaim: _available[i].isClaimed
              ? null
              : () => _claim(id: _available[i].id),
          claiming: _claiming,
        ),
      ),
    );
  }

  Widget _buildMineTab() {
    if (_loadingMine) {
      return const Center(child: CircularProgressIndicator(color: _kPrimary));
    }
    if (_errorMine != null) return _buildError(_errorMine!, _loadMine);
    final usable = _mine.where((v) => !v.isUsed).toList();
    final used = _mine.where((v) => v.isUsed).toList();
    if (_mine.isEmpty) {
      return _buildEmpty(
          'No vouchers claimed yet.\nBrowse Available tab to claim some.');
    }
    return RefreshIndicator(
      color: _kPrimary,
      onRefresh: _loadMine,
      child: ListView(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
        children: [
          if (usable.isNotEmpty) ...[
            Padding(
                padding: const EdgeInsets.symmetric(vertical: 6),
                child: Text('Available to Use',
                    style: _pjs(
                        size: 13, weight: FontWeight.w700, color: _kSubtext))),
            ...usable.map((v) => _VoucherCard(voucher: v)),
          ],
          if (used.isNotEmpty) ...[
            Padding(
                padding: const EdgeInsets.symmetric(vertical: 6),
                child: Text('Used',
                    style: _pjs(
                        size: 13, weight: FontWeight.w700, color: _kSubtext))),
            ...used.map((v) => _VoucherCard(voucher: v, dimmed: true)),
          ],
        ],
      ),
    );
  }

  Widget _buildEmpty(String msg) => Center(
      child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Icon(Icons.local_offer_outlined, size: 52, color: _kSubtext),
            const SizedBox(height: 12),
            Text(msg,
                textAlign: TextAlign.center,
                style: _pjs(size: 13, color: _kSubtext, height: 1.5)),
          ])));

  Widget _buildError(String msg, VoidCallback onRetry) => Center(
          child: Column(mainAxisSize: MainAxisSize.min, children: [
        Icon(Icons.wifi_off_outlined, size: 48, color: _kSubtext),
        const SizedBox(height: 12),
        Text(msg, style: _pjs(size: 13, color: _kSubtext)),
        const SizedBox(height: 12),
        FilledButton(
            onPressed: onRetry,
            style: FilledButton.styleFrom(backgroundColor: _kPrimary),
            child: Text('Retry',
                style: _pjs(
                    size: 13, weight: FontWeight.w700, color: Colors.white))),
      ]));
}

// ── Voucher Card ──────────────────────────────────────────────────────────────
class _VoucherCard extends StatelessWidget {
  const _VoucherCard(
      {required this.voucher,
      this.onClaim,
      this.claiming = false,
      this.dimmed = false});
  final VoucherModel voucher;
  final VoidCallback? onClaim;
  final bool claiming;
  final bool dimmed;

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: dimmed ? 0.5 : 1.0,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        decoration: BoxDecoration(
          color: _kCard,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
              color: voucher.isClaimed && !voucher.isUsed
                  ? _kSecondary
                  : _kBorder),
          boxShadow: const [
            BoxShadow(
                color: AppColors.primaryA05, blurRadius: 6, offset: Offset(0, 2))
          ],
        ),
        child: Row(children: [
          // Left accent band
          Container(
            width: 6,
            height: 90,
            decoration: BoxDecoration(
              color: voucher.isUsed ? _kSubtext : _kPrimary,
              borderRadius:
                  const BorderRadius.horizontal(left: Radius.circular(12)),
            ),
          ),
          // Content
          Expanded(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(children: [
                      Expanded(
                          child: Text(voucher.name,
                              style: _pjs(size: 13, weight: FontWeight.w800),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis)),
                      if (voucher.isUsed)
                        Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                                color: _kSubtext.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(4)),
                            child: Text('Used',
                                style: _pjs(
                                    size: 9,
                                    weight: FontWeight.w700,
                                    color: _kSubtext))),
                      if (voucher.isClaimed && !voucher.isUsed)
                        Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                                color: _kSecondary.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(4)),
                            child: Text('Claimed',
                                style: _pjs(
                                    size: 9,
                                    weight: FontWeight.w700,
                                    color: _kSecondary))),
                    ]),
                    const SizedBox(height: 3),
                    Text(voucher.discountLabel,
                        style: _pjs(
                            size: 16, weight: FontWeight.w800, color: _kFlash)),
                    const SizedBox(height: 2),
                    Text(voucher.minSpendLabel,
                        style: _pjs(size: 11, color: _kSubtext)),
                  ]),
            ),
          ),
          // Claim button
          if (onClaim != null)
            Padding(
              padding: const EdgeInsets.only(right: 12),
              child: ElevatedButton(
                onPressed: claiming ? null : onClaim,
                style: ElevatedButton.styleFrom(
                    backgroundColor: _kPrimary,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8)),
                    minimumSize: const Size(0, 36),
                    padding: const EdgeInsets.symmetric(horizontal: 14)),
                child: claiming
                    ? const SizedBox(
                        width: 14,
                        height: 14,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white))
                    : Text('Claim',
                        style: _pjs(
                            size: 12,
                            weight: FontWeight.w700,
                            color: Colors.white)),
              ),
            ),
        ]),
      ),
    );
  }
}
