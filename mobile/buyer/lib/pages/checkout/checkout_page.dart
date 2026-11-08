import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../account/address_book_page.dart';
import '../orders/orders_page.dart';
import '../../models/buyer_address.dart';
import '../../services/address_repository.dart';
import '../voucher/voucher_wallet_page.dart';
import '../../models/voucher.dart';
import '../../state/auth_service.dart';
import '../../state/cart_provider.dart';
import '../../services/order_repository.dart';
import '../../services/voucher_repository.dart';
import '../../services/api_service.dart';

const _kPrimary = Color(0xFF34175B);
const _kSecondary = Color(0xFF6B38D4);
const _kFlash = Color(0xFFFF3B5C);
const _kSurface = Color(0xFFF5F4FC);
const _kCard = Color(0xFFFFFFFF);
const _kChip = Color(0xFFEFE9FD);
const _kBorder = Color(0xFFDDD8F0);
const _kText = Color(0xFF1A1035);
const _kSubtext = Color(0xFF8A84A3);
const _kGreen = Color(0xFF1DB966);

TextStyle _pjs({
  double size = 14,
  FontWeight weight = FontWeight.w400,
  Color color = _kText,
  double? height,
  TextDecoration? decoration,
}) =>
    GoogleFonts.plusJakartaSans(
        fontSize: size,
        fontWeight: weight,
        color: color,
        height: height,
        decoration: decoration);

class CheckoutPage extends StatefulWidget {
  const CheckoutPage({super.key});

  @override
  State<CheckoutPage> createState() => _CheckoutPageState();
}

class _CheckoutPageState extends State<CheckoutPage> {
  bool _showDetails = true;
  // 0 = GCash (placeholder), 1 = COD (default, only working method)
  int _selectedPayment = 1;
  final _noteCtrl = TextEditingController();
  bool _placing = false;

  // ── Voucher state ─────────────────────────────────────────────────────────
  VoucherModel? _selectedVoucher;
  final _voucherCodeCtrl = TextEditingController();
  bool _applyingVoucher = false;
  double _voucherDiscount = 0.0;
  String? _voucherStatus; // 'applied' | error msg | null

  // Shipping fields — pre-filled from buyer profile, editable
  late final TextEditingController _nameCtrl;
  late final TextEditingController _addressCtrl;
  late final TextEditingController _phoneCtrl;

  // One idempotency key per checkout page instance (prevents double-tap)
  late final String _idempotencyKey;

  @override
  void initState() {
    super.initState();
    final auth = AuthService.instance;
    _nameCtrl = TextEditingController(text: auth.buyerName ?? '');
    _addressCtrl = TextEditingController(text: auth.defaultShippingAddress);
    _phoneCtrl = TextEditingController(text: auth.contactNumber ?? '');
    // Unique key for this checkout attempt — reused on retry, new on fresh open
    _idempotencyKey =
        '${auth.buyerId ?? '0'}-${DateTime.now().millisecondsSinceEpoch}';
    _loadDefaultAddress();
  }

  // ── Address book ──────────────────────────────────────────────────────────
  BuyerAddress? _selectedAddress;

  void _applyAddress(BuyerAddress a) {
    setState(() {
      _selectedAddress = a;
      _nameCtrl.text = a.recipientName;
      _phoneCtrl.text = a.phone;
      _addressCtrl.text = a.fullAddress;
    });
  }

  Future<void> _loadDefaultAddress() async {
    try {
      final list = await AddressRepository.instance.fetchAll();
      if (!mounted || list.isEmpty) return;
      _applyAddress(list.firstWhere((a) => a.isDefault, orElse: () => list.first));
    } catch (_) {
      // Keep the profile-based prefill if the address book can't be loaded.
    }
  }

  Future<void> _pickAddress() async {
    final picked = await Navigator.push<BuyerAddress>(
      context,
      MaterialPageRoute(
        builder: (_) => AddressBookPage(
            selectMode: true, selectedId: _selectedAddress?.id),
      ),
    );
    if (picked != null && mounted) _applyAddress(picked);
  }

  /// Manual edits detach the order from the saved address (legacy mode).
  void _onShippingEdited(String _) {
    if (_selectedAddress != null) setState(() => _selectedAddress = null);
  }

  @override
  void dispose() {
    _noteCtrl.dispose();
    _voucherCodeCtrl.dispose();
    _nameCtrl.dispose();
    _addressCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  // ── Apply voucher ─────────────────────────────────────────────────────────
  Future<void> _applyVoucher(String code) async {
    if (code.isEmpty) return;
    setState(() {
      _applyingVoucher = true;
      _voucherStatus = null;
    });
    try {
      final preview = await VoucherRepository.instance.preview(
        voucherCode: code,
        cartItemIds: _selectedCartItemIds,
      );
      if (!mounted) return;
      setState(() {
        _voucherDiscount = preview.voucherDiscount;
        _voucherStatus = preview.voucherStatus;
        _applyingVoucher = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _voucherDiscount = 0;
        _voucherStatus = e.message;
        _applyingVoucher = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _voucherDiscount = 0;
        _voucherStatus = 'Network error.';
        _applyingVoucher = false;
      });
    }
  }

  void _removeVoucher() {
    setState(() {
      _selectedVoucher = null;
      _voucherCodeCtrl.clear();
      _voucherDiscount = 0;
      _voucherStatus = null;
    });
  }

  String get _activeVoucherCode =>
      _selectedVoucher?.code ?? _voucherCodeCtrl.text.trim().toUpperCase();

  // ── Helpers ───────────────────────────────────────────────────────────────

  String get _paymentMethod => _selectedPayment == 0 ? 'gcash' : 'cod';

  /// Total from real cart items (no shipping/voucher/VAT — matches server)
  double get _merchandiseTotal {
    final cart = CartProvider.defaultCart;
    return cart.dbItems.fold(0.0, (s, i) => s + i.lineTotal);
  }

  double get _finalTotal =>
      (_merchandiseTotal - _voucherDiscount).clamp(0.0, double.infinity);

  List<int> get _selectedCartItemIds {
    // Use all valid items in the cart
    return CartProvider.defaultCart.dbItems
        .where((i) => i.isValid)
        .map((i) => i.id)
        .toList();
  }

  // ── Place order ──────────────────────────────────────────────────────────

  Future<void> _placeOrder() async {
    // Double-submit guard (the button is also disabled while placing; the
    // server dedupes retries via the per-page idempotency key).
    if (_placing) return;
    // GCash guard — server also rejects it, but we catch it early
    if (_selectedPayment == 0) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(
          'GCash is not available yet. Please choose Cash on Delivery.',
          style: _pjs(size: 13, color: Colors.white),
        ),
        backgroundColor: Colors.red.shade700,
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 4),
      ));
      return;
    }

    final name = _nameCtrl.text.trim();
    final address = _addressCtrl.text.trim();
    final phone = _phoneCtrl.text.trim();

    if (name.isEmpty || address.isEmpty || phone.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('Please fill in all shipping details.',
            style: _pjs(size: 13, color: Colors.white)),
        backgroundColor: Colors.red.shade700,
        behavior: SnackBarBehavior.floating,
      ));
      return;
    }

    setState(() => _placing = true);

    try {
      final result = await OrderRepository.instance.checkout(
        paymentMethod: _paymentMethod,
        shippingName: name,
        shippingAddress: address,
        shippingPhone: phone,
        idempotencyKey: _idempotencyKey,
        cartItemIds: _selectedCartItemIds,
        voucherCode: _activeVoucherCode.isNotEmpty ? _activeVoucherCode : null,
        addressId: _selectedAddress?.id,
      );

      if (!mounted) return;

      // Refresh cart (now empty for checked-out items)
      await CartProvider.defaultCart.refresh();

      if (!mounted) return;

      // Show success dialog
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (_) => AlertDialog(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          icon: const Icon(Icons.check_circle_outline,
              color: Color(0xFF1DB966), size: 52),
          title: Text('Order Placed! 🎉',
              style: _pjs(size: 18, weight: FontWeight.w800),
              textAlign: TextAlign.center),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Order ${result.orderNumber}',
                style:
                    _pjs(size: 15, weight: FontWeight.w700, color: _kPrimary),
              ),
              const SizedBox(height: 6),
              Text(
                'Total: ₱${result.total.toStringAsFixed(2)}',
                style: _pjs(size: 14, weight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              Text(
                'We\'ll notify you once it\'s on its way!',
                style: _pjs(size: 13, color: _kSubtext),
                textAlign: TextAlign.center,
              ),
            ],
          ),
          actions: [
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.of(context).pushAndRemoveUntil(
                    MaterialPageRoute(builder: (_) => const OrdersPage()),
                    (route) => route.isFirst,
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: _kPrimary,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10)),
                ),
                child: Text('View My Orders',
                    style: _pjs(
                        size: 14,
                        weight: FontWeight.w700,
                        color: Colors.white)),
              ),
            ),
          ],
        ),
      );
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(e.message, style: _pjs(size: 13, color: Colors.white)),
        backgroundColor: Colors.red.shade700,
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 6),
      ));
    } catch (e) {
      // Network / timeout: the request may or may not have reached the
      // server. Retrying is safe — the same idempotency key returns the
      // existing order instead of creating a second one.
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(
            '${ApiService.friendlyError(e)} Tapping Place Order again is safe — it will not create a duplicate order.',
            style: _pjs(size: 13, color: Colors.white)),
        backgroundColor: Colors.red.shade700,
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 8),
        action: SnackBarAction(
            label: 'Try again', textColor: Colors.white, onPressed: _placeOrder),
      ));
    } finally {
      if (mounted) setState(() => _placing = false);
    }
  }

  // ── Build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _kSurface,
      appBar: AppBar(
        backgroundColor: _kCard,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: _kText),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Instant Checkout',
            style: _pjs(size: 17, weight: FontWeight.w800, color: _kText)),
      ),
      body: ListView(
        padding: const EdgeInsets.only(bottom: 100),
        children: [
          _buildTopStrip(),
          const SizedBox(height: 10),
          _buildDeliveryAddress(),
          const SizedBox(height: 10),
          _buildPackageOverview(),
          const SizedBox(height: 10),
          _buildPaymentMethod(),
          const SizedBox(height: 10),
          _buildVoucherSection(),
          const SizedBox(height: 10),
          _buildOrderNotes(),
          const SizedBox(height: 10),
          _buildPaymentSummary(),
          const SizedBox(height: 10),
          _buildTrustRow(),
          const SizedBox(height: 16),
        ],
      ),
      bottomNavigationBar: _buildBottomBar(),
    );
  }

  Widget _buildTopStrip() {
    return Container(
      color: _kCard,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              const Text('🛡️', style: TextStyle(fontSize: 14)),
              const SizedBox(width: 6),
              Text('FAST & SECURE CHECKOUT',
                  style: _pjs(
                      size: 12, weight: FontWeight.w700, color: _kPrimary)),
            ],
          ),
          // 14-min countdown removed (fake) — kept as hidden comment:
          // Container(child: Text(_countdownText ...))
        ],
      ),
    );
  }

  Widget _buildDeliveryAddress() {
    return _SCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration:
                    const BoxDecoration(color: _kChip, shape: BoxShape.circle),
                child: Icon(Icons.location_on_outlined,
                    size: 18, color: _kPrimary),
              ),
              const SizedBox(width: 10),
              Text('Delivery Address',
                  style: _pjs(size: 14, weight: FontWeight.w700)),
              const Spacer(),
              TextButton.icon(
                onPressed: _placing ? null : _pickAddress,
                icon: const Icon(Icons.swap_horiz, size: 16),
                label: Text(_selectedAddress == null ? 'Choose' : 'Change',
                    style: _pjs(size: 12, weight: FontWeight.w600,
                        color: _kSecondary)),
              ),
            ],
          ),
          if (_selectedAddress != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Text(
                'Saved address: ${_selectedAddress!.label}'
                '${_selectedAddress!.isDefault ? ' (Default)' : ''}',
                style: _pjs(size: 11, color: _kSubtext),
              ),
            ),
          const SizedBox(height: 8),
          _buildTextField(_nameCtrl, 'Full Name', onChanged: _onShippingEdited),
          const SizedBox(height: 8),
          _buildTextField(_phoneCtrl, 'Phone Number',
              keyboardType: TextInputType.phone, onChanged: _onShippingEdited),
          const SizedBox(height: 8),
          _buildTextField(_addressCtrl, 'Full Address',
              maxLines: 3, onChanged: _onShippingEdited),
        ],
      ),
    );
  }

  Widget _buildTextField(
    TextEditingController ctrl,
    String label, {
    TextInputType? keyboardType,
    int maxLines = 1,
    ValueChanged<String>? onChanged,
  }) {
    return TextField(
      controller: ctrl,
      onChanged: onChanged,
      keyboardType: keyboardType,
      maxLines: maxLines,
      style: _pjs(size: 13),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: _pjs(size: 11, color: _kSubtext),
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
      ),
    );
  }

  Widget _buildPackageOverview() {
    final items = CartProvider.defaultCart.dbItems;
    return _SCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                  'Package Overview (${items.length} item${items.length == 1 ? '' : 's'})',
                  style: _pjs(size: 15, weight: FontWeight.w800)),
              TextButton.icon(
                onPressed: () => setState(() => _showDetails = !_showDetails),
                icon: Icon(
                    _showDetails
                        ? Icons.keyboard_arrow_up
                        : Icons.keyboard_arrow_down,
                    size: 16,
                    color: _kSecondary),
                label: Text(_showDetails ? 'Hide details' : 'Show details',
                    style: _pjs(
                        size: 12, weight: FontWeight.w600, color: _kSecondary)),
                style: TextButton.styleFrom(
                    padding: EdgeInsets.zero,
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap),
              ),
            ],
          ),
          if (_showDetails && items.isNotEmpty) ...[
            const SizedBox(height: 12),
            ...items.asMap().entries.map((e) {
              final item = e.value;
              final hasImg = item.imageUrl != null && item.imageUrl!.isNotEmpty;
              return Column(
                children: [
                  if (e.key > 0) const Divider(height: 16, color: _kBorder),
                  _CheckoutItemRow(
                    imageUrl: hasImg ? item.imageUrl! : '',
                    name: item.productName,
                    variation: item.variantId ?? '',
                    price: item.unitPrice,
                    originalPrice: item.unitPrice,
                    qty: item.quantity,
                  ),
                ],
              );
            }),
          ],
          if (items.isEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text('No items selected.',
                  style: _pjs(size: 13, color: _kSubtext)),
            ),
        ],
      ),
    );
  }

  Widget _buildPaymentMethod() {
    final methods = [
      (
        Icons.account_balance_wallet_outlined,
        const Color(0xFF0066CC),
        'GCash',
        'Placeholder — not available yet',
        null
      ),
      (
        Icons.money_outlined,
        _kGreen,
        'Cash on Delivery (COD)',
        'Pay in cash right upon receipt',
        null
      ),
    ];

    return _SCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Payment Method',
              style: _pjs(size: 15, weight: FontWeight.w800)),
          const SizedBox(height: 12),
          ...List.generate(methods.length, (i) {
            final m = methods[i];
            final sel = _selectedPayment == i;
            return GestureDetector(
              onTap: () => setState(() => _selectedPayment = i),
              child: Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: sel ? _kChip : _kSurface,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: sel ? _kSecondary : _kBorder),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: m.$2.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(m.$1, size: 18, color: m.$2),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(m.$3,
                              style: _pjs(size: 13, weight: FontWeight.w700)),
                          Text(m.$4, style: _pjs(size: 11, color: _kSubtext)),
                        ],
                      ),
                    ),
                    Icon(
                      sel
                          ? Icons.radio_button_checked
                          : Icons.radio_button_unchecked,
                      size: 18,
                      color: sel ? _kSecondary : _kSubtext,
                    ),
                  ],
                ),
              ),
            );
          }),
        ],
      ),
    );
  }

  // ── Voucher Section ──────────────────────────────────────────────────────────

  Widget _buildVoucherSection() {
    final hasApplied = _voucherStatus == 'applied';
    final hasError = _voucherStatus != null && _voucherStatus != 'applied';

    return _SCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Icon(Icons.local_offer_outlined, size: 18, color: _kSecondary),
            const SizedBox(width: 6),
            Text('Voucher / Promo Code',
                style: _pjs(size: 15, weight: FontWeight.w800)),
            const Spacer(),
            TextButton(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const VoucherWalletPage()),
              ).then((_) {
                // If user picked a voucher from wallet, refresh
              }),
              style: TextButton.styleFrom(
                  padding: EdgeInsets.zero,
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap),
              child: Text('Browse Vouchers',
                  style: _pjs(
                      size: 12, weight: FontWeight.w600, color: _kSecondary)),
            ),
          ]),
          const SizedBox(height: 10),
          // Applied state
          if (hasApplied) ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFFF0FBF4),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: _kGreen),
              ),
              child: Row(children: [
                Icon(Icons.check_circle, size: 18, color: _kGreen),
                const SizedBox(width: 8),
                Expanded(
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                      Text('Voucher applied: $_activeVoucherCode',
                          style: _pjs(
                              size: 13,
                              weight: FontWeight.w700,
                              color: _kGreen)),
                      Text('Discount: -₱${_voucherDiscount.toStringAsFixed(2)}',
                          style: _pjs(size: 11, color: _kGreen)),
                    ])),
                GestureDetector(
                  onTap: _removeVoucher,
                  child: Icon(Icons.close, size: 18, color: _kSubtext),
                ),
              ]),
            ),
          ] else ...[
            Row(children: [
              Expanded(
                child: TextFormField(
                  controller: _voucherCodeCtrl,
                  textCapitalization: TextCapitalization.characters,
                  style: _pjs(size: 13),
                  onFieldSubmitted: (v) => _applyVoucher(v),
                  decoration: InputDecoration(
                    hintText: 'Enter code (e.g. MIMOO2026)',
                    hintStyle: _pjs(size: 12, color: _kSubtext),
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 10),
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
                    errorText: hasError ? _voucherStatus : null,
                    errorStyle: _pjs(size: 11, color: _kFlash),
                    errorMaxLines: 2,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton(
                onPressed: _applyingVoucher
                    ? null
                    : () => _applyVoucher(_voucherCodeCtrl.text.trim()),
                style: ElevatedButton.styleFrom(
                    backgroundColor: _kPrimary,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8)),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 12)),
                child: _applyingVoucher
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white))
                    : Text('Apply',
                        style: _pjs(
                            size: 13,
                            weight: FontWeight.w700,
                            color: Colors.white)),
              ),
            ]),
          ],
        ],
      ),
    );
  }

  Widget _buildOrderNotes() {
    return _SCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Order Notes for Courier',
              style: _pjs(size: 15, weight: FontWeight.w800)),
          const SizedBox(height: 10),
          TextField(
            controller: _noteCtrl,
            minLines: 2,
            maxLines: 4,
            style: _pjs(size: 13),
            decoration: InputDecoration(
              hintText: 'e.g. Please ring the bell, leave at door...',
              hintStyle: _pjs(size: 12, color: _kSubtext),
              contentPadding: const EdgeInsets.all(12),
              border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: _kBorder)),
              enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: _kBorder)),
              focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: _kSecondary)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentSummary() {
    final merch = _merchandiseTotal;
    final discount = _voucherDiscount;
    final total = _finalTotal;
    return _SCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Payment Summary',
              style: _pjs(size: 15, weight: FontWeight.w800)),
          const SizedBox(height: 12),
          _SRow('Merchandise Subtotal', '₱${merch.toStringAsFixed(2)}'),
          if (discount > 0) ...[
            const SizedBox(height: 6),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(children: [
                  Icon(Icons.local_offer_outlined, size: 13, color: _kGreen),
                  const SizedBox(width: 4),
                  Text('Voucher Discount',
                      style: _pjs(
                          size: 13, weight: FontWeight.w500, color: _kGreen)),
                ]),
                Text('-₱${discount.toStringAsFixed(2)}',
                    style: _pjs(
                        size: 13, weight: FontWeight.w600, color: _kGreen)),
              ],
            ),
          ],
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 10),
            child: Divider(color: _kBorder),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Total Payment',
                  style: _pjs(size: 15, weight: FontWeight.w800)),
              Text('₱${total.toStringAsFixed(2)}',
                  style:
                      _pjs(size: 20, weight: FontWeight.w800, color: _kFlash)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTrustRow() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.shield_outlined, size: 14, color: _kSubtext),
          const SizedBox(width: 4),
          Text('Mimoo Buyer Guarantee · 256-Bit SSL Secured',
              style: _pjs(size: 11, color: _kSubtext)),
        ],
      ),
    );
  }

  Widget _buildBottomBar() {
    final total = _finalTotal;
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 20),
      decoration: const BoxDecoration(
        color: _kCard,
        boxShadow: [
          BoxShadow(
              color: Color(0x1A34175B), blurRadius: 12, offset: Offset(0, -4))
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Total Amount', style: _pjs(size: 12, color: _kSubtext)),
                  Text('₱${total.toStringAsFixed(2)}',
                      style: _pjs(size: 20, weight: FontWeight.w800)),
                ],
              ),
            ),
            const SizedBox(width: 12),
            ElevatedButton.icon(
              onPressed: _placing ? null : _placeOrder,
              icon: _placing
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white))
                  : const Icon(Icons.arrow_forward,
                      size: 16, color: Colors.white),
              label: Text('Place Order',
                  style: _pjs(
                      size: 15, weight: FontWeight.w700, color: Colors.white)),
              style: ElevatedButton.styleFrom(
                backgroundColor: _kPrimary,
                disabledBackgroundColor: _kPrimary.withValues(alpha: 0.5),
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
                minimumSize: const Size(0, 52),
                padding: const EdgeInsets.symmetric(horizontal: 24),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Shared card wrapper ───────────────────────────────────────────────────────
class _SCard extends StatelessWidget {
  const _SCard({required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: _kCard,
        borderRadius: BorderRadius.circular(12),
        boxShadow: const [
          BoxShadow(
              color: Color(0x0D34175B), blurRadius: 8, offset: Offset(0, 2))
        ],
      ),
      child: child,
    );
  }
}

class _CheckoutItemRow extends StatelessWidget {
  const _CheckoutItemRow({
    required this.imageUrl,
    required this.name,
    required this.variation,
    required this.price,
    required this.originalPrice,
    required this.qty,
  });
  final String imageUrl, name, variation;
  final double price, originalPrice;
  final int qty;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: imageUrl.isNotEmpty
              ? Image.network(
                  imageUrl,
                  width: 60,
                  height: 60,
                  fit: BoxFit.cover,
                  headers: const {'Accept': 'image/*'},
                  errorBuilder: (_, __, ___) => Container(
                      width: 60,
                      height: 60,
                      color: _kChip,
                      child: Icon(Icons.image_outlined, color: _kSubtext)),
                )
              : Container(
                  width: 60,
                  height: 60,
                  color: _kChip,
                  child: Icon(Icons.storefront_outlined, color: _kSubtext)),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(name,
                  style: _pjs(size: 13, weight: FontWeight.w700),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis),
              if (variation.isNotEmpty)
                Text(variation, style: _pjs(size: 11, color: _kSubtext)),
              const SizedBox(height: 4),
              Text('₱${price.toStringAsFixed(0)}',
                  style: _pjs(
                      size: 14, weight: FontWeight.w800, color: _kSecondary)),
            ],
          ),
        ),
        Text('x$qty', style: _pjs(size: 13, weight: FontWeight.w600)),
      ],
    );
  }
}

class _SRow extends StatelessWidget {
  const _SRow(this.label, this.value);
  final String label, value;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: _pjs(size: 13, weight: FontWeight.w500)),
        Text(value, style: _pjs(size: 13, weight: FontWeight.w600)),
      ],
    );
  }
}
