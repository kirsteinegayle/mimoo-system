import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../checkout/checkout_page.dart';
import '../../state/cart_provider.dart';
import '../../state/cart_state.dart';
import '../../theme/app_theme.dart';
import '../../widgets/state_views.dart';

// ── Color tokens ────────────────────────────────────────────────────────────
const _kPrimary = AppColors.primary;
const _kSecondary = AppColors.accent;
const _kFlash = AppColors.flash;
const _kSurface = AppColors.surface;
const _kCard = AppColors.card;
const _kChip = AppColors.chip;
const _kBorder = AppColors.border;
const _kText = AppColors.text;
const _kSubtext = AppColors.textMuted;
const _kGreen = AppColors.success;

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
      decoration: decoration,
    );

class _CartItem {
  _CartItem({
    required this.dbId,
    required this.name,
    required this.variation,
    required this.badge,
    required this.price,
    required this.originalPrice,
    required this.qty,
    required this.checked,
    required this.imageUrl,
    this.isValid = true,
    this.validationIssue,
    this.maxQty = 99,
  });
  final int dbId;
  final String name;
  final String variation;
  final String badge;
  final double price;
  final double originalPrice;
  int qty;
  bool checked;
  final String imageUrl;
  final bool isValid;
  final String? validationIssue;
  final int maxQty;
}

class CartPage extends StatefulWidget {
  const CartPage({super.key});

  @override
  State<CartPage> createState() => _CartPageState();
}

class _CartPageState extends State<CartPage> {
  bool _editMode = false;

  // Selected item IDs (for checkout / bulk delete)
  final Set<int> _selected = {};

  CartState get _cart => CartProvider.defaultCart;

  /// Map server items to the existing _CartItem view model.
  List<_CartItem> get _items => _cart.dbItems
      .map((db) => _CartItem(
            dbId: db.id,
            name: db.productName,
            variation: db.variantId ?? '',
            badge: db.isValid
                ? (db.isOnSale ? 'SALE' : 'In Stock')
                : (db.validationIssue ?? 'Invalid'),
            price: db.unitPrice,
            originalPrice: db.regularPrice,
            qty: db.quantity,
            checked: _selected.contains(db.id),
            imageUrl: db.imageUrl ?? '',
            isValid: db.isValid,
            validationIssue: db.validationIssue,
            maxQty: db.maxQuantity,
          ))
      .toList();

  int get _checkedCount => _selected.length;
  bool get _allChecked =>
      _cart.dbItems.isNotEmpty &&
      _cart.dbItems.every((i) => _selected.contains(i.id));
  double get _subtotal => _cart.dbItems
      .where((i) => _selected.contains(i.id))
      .fold(0.0, (s, i) => s + i.lineTotal);
  double get _voucherSavings => 0;
  double get _shippingFee => 0;
  double get _total => _subtotal - _voucherSavings + _shippingFee;

  @override
  void initState() {
    super.initState();
    _cart.addListener(_onCartUpdated);
    // Select all valid items by default
    WidgetsBinding.instance.addPostFrameCallback((_) => _selectAllValid());
  }

  @override
  void dispose() {
    _cart.removeListener(_onCartUpdated);
    super.dispose();
  }

  void _onCartUpdated() {
    if (mounted) {
      setState(() {
        // Remove selected IDs that no longer exist
        final currentIds = _cart.dbItems.map((i) => i.id).toSet();
        _selected.removeWhere((id) => !currentIds.contains(id));
      });
    }
  }

  void _selectAllValid() {
    setState(() {
      _selected
        ..clear()
        ..addAll(_cart.dbItems.where((i) => i.isValid).map((i) => i.id));
    });
  }

  @override
  Widget build(BuildContext context) {
    final loading = _cart.loading;
    final items = _items;

    return Scaffold(
      backgroundColor: _kSurface,
      appBar: _buildAppBar(),
      body: loading && items.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () => _cart.refresh(),
              child: ListView(
                padding: const EdgeInsets.only(bottom: 120),
                children: [
                  _ShippingBanner(),
                  const SizedBox(height: 8),
                  _buildSectionHeader(),
                  const SizedBox(height: 8),
                  if (items.isEmpty)
                    const EmptyStateView(
                      icon: Icons.shopping_cart_outlined,
                      title: 'Your cart is empty',
                      message: 'Add products from the Home or Categories tab.',
                    )
                  else
                    _buildStoreGroup(),
                  const SizedBox(height: 8),
                  _buildTrustBadges(),
                  // "You may also like" hidden: it only had sample products.
                  const SizedBox(height: 16),
                ],
              ),
            ),
      bottomNavigationBar: _buildBottomBar(),
    );
  }

  AppBar _buildAppBar() {
    return AppBar(
      backgroundColor: _kCard,
      elevation: 0,
      // Opened from the header cart icon → show Back.
      leading: Navigator.of(context).canPop()
          ? const BackButton(color: _kPrimary)
          : const Padding(
              padding: EdgeInsets.all(12),
              child: Icon(Icons.shopping_cart_outlined,
                  color: _kPrimary, size: 22),
            ),
      title: Text('Shopping Cart',
          style: _pjs(size: 17, weight: FontWeight.w800, color: _kText)),
      actions: [
        TextButton(
          onPressed: () => setState(() {
            _editMode = !_editMode;
            // Exit edit mode: deselect all so normal checkout flow is clean
            if (!_editMode) {
              for (final item in _items) {
                item.checked = false;
              }
            }
          }),
          child: Text(
            _editMode ? 'Done' : 'Edit',
            style: _pjs(size: 15, weight: FontWeight.w700, color: _kSecondary),
          ),
        ),
      ],
    );
  }

  Widget _buildSectionHeader() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Text('Shopping Cart (${_cart.dbItems.length} items)',
          style: _pjs(size: 15, weight: FontWeight.w800)),
    );
  }

  Widget _buildStoreGroup() {
    final items = _items;
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: _kCard,
        borderRadius: BorderRadius.circular(12),
        boxShadow: const [
          BoxShadow(
              color: AppColors.primaryA05, blurRadius: 8, offset: Offset(0, 2)),
        ],
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 12, 12, 8),
            child: Row(
              children: [
                Icon(Icons.storefront_outlined, size: 16, color: _kPrimary),
                const SizedBox(width: 6),
                Text('mimoo Market',
                    style: _pjs(size: 13, weight: FontWeight.w700)),
                const SizedBox(width: 4),
                Icon(Icons.check_circle, size: 14, color: _kGreen),
              ],
            ),
          ),
          const Divider(height: 1, color: _kBorder, indent: 12, endIndent: 12),
          ...List.generate(items.length, (i) {
            final item = items[i];
            final inFlight = _cart.isInFlight(item.dbId);
            return Column(
              children: [
                _CartItemTile(
                  item: item,
                  inFlight: inFlight,
                  onCheckChanged: (v) => setState(() {
                    if (v == true) {
                      _selected.add(item.dbId);
                    } else {
                      _selected.remove(item.dbId);
                    }
                  }),
                  onQtyChanged: (delta) {
                    if (inFlight) return;
                    if (delta > 0) {
                      _cart.incrementById(item.dbId);
                    } else {
                      _cart.decrementById(item.dbId);
                    }
                  },
                  onRemove: () => _cart.removeById(item.dbId),
                ),
                if (i < items.length - 1)
                  const Divider(
                      height: 1, color: _kBorder, indent: 12, endIndent: 12),
              ],
            );
          }),
        ],
      ),
    );
  }

  Widget _buildPaymentBreakdown() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: _kCard,
        borderRadius: BorderRadius.circular(12),
        boxShadow: const [
          BoxShadow(
              color: AppColors.primaryA05, blurRadius: 8, offset: Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Payment Breakdown',
              style: _pjs(size: 15, weight: FontWeight.w800)),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Subtotal', style: _pjs(size: 13, weight: FontWeight.w500)),
              Text('₱1,489.00', style: _pjs(size: 13, weight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Text('Voucher Savings',
                      style: _pjs(
                          size: 13,
                          weight: FontWeight.w500,
                          color: _kSecondary)),
                ],
              ),
              Text('-₱150.00',
                  style:
                      _pjs(size: 13, weight: FontWeight.w600, color: _kFlash)),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Text('Shipping Fee ',
                      style: _pjs(size: 13, weight: FontWeight.w500)),
                  Text('₱80.00',
                      style: _pjs(
                          size: 12,
                          weight: FontWeight.w400,
                          color: _kSubtext,
                          decoration: TextDecoration.lineThrough)),
                ],
              ),
              Text('₱0 FREE',
                  style:
                      _pjs(size: 13, weight: FontWeight.w700, color: _kGreen)),
            ],
          ),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 10),
            child: Divider(color: _kBorder),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Estimated Total',
                  style: _pjs(size: 15, weight: FontWeight.w800)),
              Text('₱1,339.00',
                  style: _pjs(
                      size: 18, weight: FontWeight.w800, color: _kPrimary)),
            ],
          ),
        ],
      ),
    );
  }

  // Hidden for now (sample products only); kept for when real
  // recommendations exist.
  // ignore: unused_element
  Widget _buildYouMayAlsoLike() {
    // Re-use the same sample products used elsewhere in the app
    const seeds = [
      ('hoodie2', 'Acid-Wash Hoodie Vol. 2', 699.0),
      ('sneakers2', 'Cloud Step Runners', 1299.0),
      ('lamp3', 'Nordic Desk Lamp', 349.0),
      ('bag1', 'Minimalist Tote Bag', 499.0),
    ];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 10),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.auto_awesome, size: 14, color: _kSecondary),
              const SizedBox(width: 6),
              Text('YOU MAY ALSO LIKE',
                  style: _pjs(
                      size: 12, weight: FontWeight.w800, color: _kSubtext)),
              const SizedBox(width: 6),
              const Icon(Icons.auto_awesome, size: 14, color: _kSecondary),
            ],
          ),
        ),
        SizedBox(
          height: 200,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: seeds.length,
            separatorBuilder: (_, __) => const SizedBox(width: 10),
            itemBuilder: (ctx, i) {
              final s = seeds[i];
              return Container(
                width: 130,
                decoration: BoxDecoration(
                  color: _kCard,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: const [
                    BoxShadow(
                        color: AppColors.primaryA05,
                        blurRadius: 6,
                        offset: Offset(0, 2)),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ClipRRect(
                      borderRadius:
                          const BorderRadius.vertical(top: Radius.circular(12)),
                      child: Image.network(
                        'https://picsum.photos/seed/${s.$1}/200/200',
                        height: 110,
                        width: 130,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) =>
                            Container(height: 110, color: _kChip),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(8, 6, 8, 6),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(s.$2,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: _pjs(
                                  size: 11,
                                  weight: FontWeight.w600,
                                  height: 1.3)),
                          const SizedBox(height: 4),
                          Text('₱${s.$3.toStringAsFixed(0)}',
                              style: _pjs(
                                  size: 13,
                                  weight: FontWeight.w800,
                                  color: _kPrimary)),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildTrustBadges() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: const [
          Expanded(child: _TrustBadge(icon: Icons.verified_outlined, label: '100% Authentic')),
          Expanded(child: _TrustBadge(icon: Icons.replay_outlined, label: '15-Day Free Return')),
          Expanded(child: _TrustBadge(icon: Icons.shield_outlined, label: 'Buyer Protection')),
        ],
      ),
    );
  }

  Widget _buildBottomBar() {
    if (_editMode) {
      return Container(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 20),
        decoration: const BoxDecoration(
          color: _kCard,
          boxShadow: [
            BoxShadow(
                color: AppColors.primaryA10,
                blurRadius: 12,
                offset: Offset(0, -4)),
          ],
        ),
        child: SafeArea(
          child: Row(
            children: [
              // All / select-all toggle
              GestureDetector(
                onTap: () => setState(() {
                  if (_allChecked) {
                    _selected.clear();
                  } else {
                    _selected.addAll(_cart.dbItems.map((i) => i.id));
                  }
                }),
                child: Row(
                  children: [
                    SizedBox(
                      width: 20,
                      height: 20,
                      child: Checkbox(
                        value: _allChecked,
                        onChanged: (v) => setState(() {
                          if (v == true) {
                            _selected.addAll(_cart.dbItems.map((i) => i.id));
                          } else {
                            _selected.clear();
                          }
                        }),
                        activeColor: _kPrimary,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(4)),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text('All', style: _pjs(size: 13, weight: FontWeight.w600)),
                  ],
                ),
              ),
              const Spacer(),
              // Move to Wishlist
              TextButton.icon(
                onPressed: _checkedCount > 0
                    ? () {
                        for (final id in Set<int>.from(_selected)) {
                          _cart.removeById(id);
                        }
                        _selected.clear();
                        setState(() => _editMode = false);
                      }
                    : null,
                icon: Icon(Icons.favorite_border,
                    size: 16,
                    color: _checkedCount > 0 ? _kSecondary : _kSubtext),
                label: Text('Move to Wishlist',
                    style: _pjs(
                        size: 13,
                        weight: FontWeight.w600,
                        color: _checkedCount > 0 ? _kSecondary : _kSubtext)),
                style: TextButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
              ),
              const SizedBox(width: 8),
              // Delete
              TextButton.icon(
                onPressed: _checkedCount > 0
                    ? () {
                        for (final id in Set<int>.from(_selected)) {
                          _cart.removeById(id);
                        }
                        _selected.clear();
                        setState(() => _editMode = false);
                      }
                    : null,
                icon: Icon(Icons.delete_outline,
                    size: 16, color: _checkedCount > 0 ? _kFlash : _kSubtext),
                label: Text('Delete',
                    style: _pjs(
                        size: 13,
                        weight: FontWeight.w600,
                        color: _checkedCount > 0 ? _kFlash : _kSubtext)),
                style: TextButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
              ),
            ],
          ),
        ),
      );
    }

    // Normal checkout bar
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 20),
      decoration: const BoxDecoration(
        color: _kCard,
        boxShadow: [
          BoxShadow(
              color: AppColors.primaryA10, blurRadius: 12, offset: Offset(0, -4)),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            Row(
              children: [
                SizedBox(
                  width: 20,
                  height: 20,
                  child: Checkbox(
                    value: _allChecked,
                    onChanged: (v) => setState(() {
                      if (v == true) {
                        _selected.addAll(_cart.dbItems.map((i) => i.id));
                      } else {
                        _selected.clear();
                      }
                    }),
                    activeColor: _kPrimary,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(4)),
                  ),
                ),
                const SizedBox(width: 4),
                Text('All (${_cart.dbItems.length})',
                    style: _pjs(size: 12, weight: FontWeight.w600)),
              ],
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (_checkedCount > 0) ...[
                    Text('Total: ₱${_total.toStringAsFixed(2)}',
                        style: _pjs(size: 15, weight: FontWeight.w800)),
                    Text('Saved ₱${_voucherSavings.toStringAsFixed(0)}',
                        style: _pjs(
                            size: 11, color: _kGreen, weight: FontWeight.w600)),
                  ] else
                    Text('Select items to checkout',
                        style: _pjs(size: 12, color: _kSubtext)),
                ],
              ),
            ),
            const SizedBox(width: 8),
            ElevatedButton(
              onPressed: _checkedCount > 0
                  ? () => Navigator.push(context,
                      MaterialPageRoute(builder: (_) => const CheckoutPage()))
                  : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: _kPrimary,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
                minimumSize: const Size(0, 48),
                padding: const EdgeInsets.symmetric(horizontal: 18),
              ),
              child: FittedBox(
                fit: BoxFit.scaleDown,
                child: Text('Place Order ($_checkedCount)',
                    style: _pjs(
                        size: 14, weight: FontWeight.w700, color: Colors.white)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Cart Item Tile ───────────────────────────────────────────────────────────
class _CartItemTile extends StatelessWidget {
  const _CartItemTile({
    required this.item,
    required this.onCheckChanged,
    required this.onQtyChanged,
    required this.onRemove,
    this.inFlight = false,
  });

  final _CartItem item;
  final ValueChanged<bool?> onCheckChanged;
  final ValueChanged<int> onQtyChanged;
  final VoidCallback onRemove;
  final bool inFlight;

  Color get _badgeColor {
    if (!item.isValid) return _kFlash;
    if (item.badge == 'HOT') return _kFlash;
    if (item.badge == 'Bestseller') return _kGreen;
    if (item.badge == 'SALE') return _kFlash;
    return _kSecondary;
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(top: 6),
            child: SizedBox(
              width: 20,
              height: 20,
              child: Checkbox(
                value: item.checked,
                onChanged: onCheckChanged,
                activeColor: _kPrimary,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(4)),
              ),
            ),
          ),
          const SizedBox(width: 10),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: item.imageUrl.isNotEmpty
                ? Image.network(
                    item.imageUrl,
                    width: 72,
                    height: 72,
                    fit: BoxFit.cover,
                    headers: const {'Accept': 'image/*'},
                    errorBuilder: (_, __, ___) => Container(
                        width: 72,
                        height: 72,
                        color: _kChip,
                        child: Icon(Icons.image_outlined, color: _kSubtext)),
                  )
                : Container(
                    width: 72,
                    height: 72,
                    color: _kChip,
                    child: Icon(Icons.storefront_outlined, color: _kSubtext)),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item.name,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: _pjs(size: 13, weight: FontWeight.w700)),
                const SizedBox(height: 4),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: _kChip,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: _kBorder),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(item.variation,
                          style: _pjs(size: 11, color: _kSubtext)),
                      const SizedBox(width: 2),
                      Icon(Icons.keyboard_arrow_down,
                          size: 13, color: _kSubtext),
                    ],
                  ),
                ),
                const SizedBox(height: 4),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: _badgeColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(item.badge,
                      style: _pjs(
                          size: 10,
                          weight: FontWeight.w700,
                          color: _badgeColor)),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Text('₱${item.price.toStringAsFixed(0)}',
                        style: _pjs(
                            size: 15,
                            weight: FontWeight.w800,
                            color: _kSecondary)),
                    const SizedBox(width: 6),
                    Text('₱${item.originalPrice.toStringAsFixed(0)}',
                        style: _pjs(
                            size: 12,
                            weight: FontWeight.w400,
                            color: _kSubtext,
                            decoration: TextDecoration.lineThrough)),
                  ],
                ),
                const SizedBox(height: 8),
                // Validation issue (shown when item is invalid)
                if (!item.isValid && item.validationIssue != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: Row(
                      children: [
                        Icon(Icons.warning_amber_rounded,
                            size: 13, color: _kFlash),
                        const SizedBox(width: 4),
                        Flexible(
                          child: Text(item.validationIssue!,
                              style: _pjs(
                                  size: 10,
                                  color: _kFlash,
                                  weight: FontWeight.w600)),
                        ),
                      ],
                    ),
                  ),
                Row(
                  children: [
                    if (inFlight)
                      const SizedBox(
                        width: 28,
                        height: 28,
                        child: Center(
                            child: SizedBox(
                                width: 14,
                                height: 14,
                                child:
                                    CircularProgressIndicator(strokeWidth: 2))),
                      )
                    else
                      _QtyButton(
                          icon: Icons.remove, onTap: () => onQtyChanged(-1)),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 14),
                      child: Text('${item.qty}',
                          style: _pjs(size: 14, weight: FontWeight.w700)),
                    ),
                    _QtyButton(
                        icon: Icons.add,
                        onTap: inFlight ? () {} : () => onQtyChanged(1)),
                  ],
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: () async {
              final confirmed = await showDialog<bool>(
                context: context,
                builder: (ctx) => AlertDialog(
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                  title: const Text('Remove item?',
                      style:
                          TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
                  content: const Text('Remove this item from your cart?',
                      style: TextStyle(fontSize: 14)),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(ctx, false),
                      child: const Text('Cancel'),
                    ),
                    TextButton(
                      onPressed: () => Navigator.pop(ctx, true),
                      child: const Text('Remove',
                          style: TextStyle(color: AppColors.error)),
                    ),
                  ],
                ),
              );
              if (confirmed == true) onRemove();
            },
            icon: Icon(Icons.close, size: 16, color: _kSubtext),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
          ),
        ],
      ),
    );
  }
}

class _QtyButton extends StatelessWidget {
  const _QtyButton({required this.icon, required this.onTap});
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 28,
        height: 28,
        decoration: BoxDecoration(
          border: Border.all(color: _kBorder),
          borderRadius: BorderRadius.circular(8),
          color: _kChip,
        ),
        child: Icon(icon, size: 14, color: _kPrimary),
      ),
    );
  }
}

class _TrustBadge extends StatelessWidget {
  const _TrustBadge({required this.icon, required this.label});
  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration:
              const BoxDecoration(color: _kChip, shape: BoxShape.circle),
          child: Icon(icon, size: 18, color: _kPrimary),
        ),
        const SizedBox(height: 4),
        Text(label,
            style: _pjs(size: 10, weight: FontWeight.w600),
            textAlign: TextAlign.center),
      ],
    );
  }
}

class _ShippingBanner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.primaryMid, AppColors.accent],
        ),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text('🚚', style: TextStyle(fontSize: 14)),
              const SizedBox(width: 6),
              Expanded(
                child: Text('Free Express Shipping Unlocked! Tier 1 Hit',
                    maxLines: 2,
                    style: _pjs(
                        size: 13, weight: FontWeight.w700, color: Colors.white)),
              ),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: const LinearProgressIndicator(
              value: 1.0,
              backgroundColor: Colors.white30,
              valueColor: AlwaysStoppedAnimation(Colors.white),
              minHeight: 4,
            ),
          ),
          const SizedBox(height: 4),
          Text('You saved ₱80 shipping fee on orders over ₱500',
              style: _pjs(
                  size: 11, color: Colors.white70, weight: FontWeight.w500)),
        ],
      ),
    );
  }
}
