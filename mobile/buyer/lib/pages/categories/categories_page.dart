import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../models/product.dart';
import '../../services/product_repository.dart';
import '../../services/api_service.dart';
import '../../services/category_repository.dart';
import '../../state/auth_service.dart';
import '../../state/wishlist_provider.dart';
import '../auth/login_page.dart';
import '../home/product_detail_page.dart';
import '../../state/cart_provider.dart';
import '../../utils/animations.dart';
import '../search/search_page.dart';
import '../../theme/app_theme.dart';
import '../../widgets/header_actions.dart';

// ── Color tokens ──────────────────────────────────────────────────────────────
const _kPrimary = AppColors.primary;
const _kSecondary = AppColors.accent;
const _kFlash = AppColors.flash;
const _kSurface = AppColors.surface;
const _kCard = AppColors.card;
const _kChip = AppColors.chip;
const _kText = AppColors.text;
const _kSubtext = AppColors.textMuted;

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

// ── Category tile colours (cycled) ───────────────────────────────────────────
const _catColors = [
  AppColors.accent,
  AppColors.primary,
  AppColors.info,
  AppColors.flash,
  Color(0xFFE91E8C),
  AppColors.success,
  AppColors.violet,
  AppColors.orange,
];

// ── Categories Page ───────────────────────────────────────────────────────────
class CategoriesPage extends StatefulWidget {
  const CategoriesPage({super.key});

  @override
  State<CategoriesPage> createState() => _CategoriesPageState();
}

class _CategoriesPageState extends State<CategoriesPage> {
  String _selectedSort = 'Newest';
  final _sorts = ['Newest', 'Price: Low to High', 'Price: High to Low'];

  // ── API state ────────────────────────────────────────────────────────────
  List<Product> _products = [];

  /// Same categories as the website; selected = exact products.category.
  List<BuyerCategory> _categoryList = kWebCategories;
  String? _category;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
    _loadCategories();
  }

  Future<void> _loadCategories() async {
    final list = await CategoryRepository.instance.fetch();
    if (mounted) setState(() => _categoryList = list);
  }

  void _selectCategory(String? name) {
    setState(() => _category = _category == name ? null : name);
    _load();
  }

  String get _apiSort {
    switch (_selectedSort) {
      case 'Price: Low to High':
        return 'price_asc';
      case 'Price: High to Low':
        return 'price_desc';
      default:
        return 'newest';
    }
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final page = await ProductRepository.instance.fetchProducts(
        perPage: 30,
        sort: _apiSort,
        category: _category,
      );
      if (!mounted) return;
      setState(() {
        _products = page.products;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = ApiService.friendlyError(e);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _kSurface,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            await Future.wait([_load(), _loadCategories()]);
          },
          child: CustomScrollView(
            slivers: [
              SliverToBoxAdapter(child: _buildHeader()),
              SliverToBoxAdapter(child: _buildSortRow()),
              SliverToBoxAdapter(child: _buildExploreCats()),
              SliverToBoxAdapter(child: _buildTrendingHeader()),
              _buildProductGrid(),
              // Voucher banner hidden — fake "₱150 OFF" offer, no backend.
              // SliverToBoxAdapter(child: _buildVoucherBanner()),
              const SliverToBoxAdapter(child: SizedBox(height: 24)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return MimooTabHeader(
      title: 'Categories',
      bottom: HeaderSearchBar(
        hint: 'Search in All Categories, items, or brands...',
        onTap: () => Navigator.push(
            context, MaterialPageRoute(builder: (_) => const SearchPage())),
      ),
    );
  }

  // ── Sort row (Wrap-based — no overflow) ──────────────────────────────────────
  Widget _buildSortRow() {
    return Container(
      color: _kCard,
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
      child: Wrap(
        spacing: 8,
        runSpacing: 8,
        children: List.generate(_sorts.length, (i) {
          final sel = _selectedSort == _sorts[i];
          return GestureDetector(
            onTap: () {
              if (_selectedSort != _sorts[i]) {
                setState(() => _selectedSort = _sorts[i]);
                _load();
              }
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: sel ? _kPrimary : _kSurface,
                borderRadius: BorderRadius.circular(9999),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(_sorts[i],
                      style: _pjs(
                          size: 13,
                          weight: FontWeight.w600,
                          color: sel ? Colors.white : _kText)),
                  if (i == 0) ...[
                    const SizedBox(width: 4),
                    Icon(Icons.keyboard_arrow_down,
                        size: 15, color: sel ? Colors.white : _kSubtext),
                  ],
                ],
              ),
            ),
          );
        }),
      ),
    );
  }

  // ── Explore categories grid ──────────────────────────────────────────────────
  Widget _buildExploreCats() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Flexible(
                child: Row(
                  children: [
                    Flexible(
                      child: Text('Explore Categories',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: _pjs(size: 15, weight: FontWeight.w800)),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                          color: _kSecondary, shape: BoxShape.circle),
                    ),
                  ],
                ),
              ),
              GestureDetector(
                // "View All" clears the category filter
                onTap: () => _selectCategory(null),
                child: Row(
                  children: [
                    Text('View All',
                        style: _pjs(
                            size: 13,
                            weight: FontWeight.w600,
                            color: _kSecondary)),
                    Icon(Icons.chevron_right, size: 16, color: _kSecondary),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          GridView.count(
            crossAxisCount: 4,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 14,
            crossAxisSpacing: 8,
            childAspectRatio: 0.85,
            children: [
              for (var i = 0; i < _categoryList.length; i++)
                _CatChip(
                  cat: _categoryList[i],
                  color: _catColors[i % _catColors.length],
                  selected: _categoryList[i].name == _category,
                  onTap: () => _selectCategory(_categoryList[i].name),
                ),
            ],
          ),
        ],
      ),
    );
  }

  // ── Trending header ──────────────────────────────────────────────────────────
  Widget _buildTrendingHeader() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(_category ?? 'All Products',
                  style: _pjs(size: 15, weight: FontWeight.w800)),
              const SizedBox(width: 8),
              if (!_loading && _error == null)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: _kChip,
                    borderRadius: BorderRadius.circular(9999),
                  ),
                  child: Text('${_products.length} Items',
                      style: _pjs(
                          size: 11,
                          weight: FontWeight.w700,
                          color: _kSecondary)),
                ),
              const Spacer(),
              Icon(Icons.tune, size: 18, color: _kSubtext),
            ],
          ),
          const SizedBox(height: 3),
          Text('Sorted by: $_selectedSort',
              style: _pjs(size: 12, color: _kSubtext)),
        ],
      ),
    );
  }

  // ── Product grid (live from API) ─────────────────────────────────────────────
  Widget _buildProductGrid() {
    if (_loading) {
      return SliverPadding(
        padding: const EdgeInsets.symmetric(horizontal: 12),
        sliver: SliverGrid(
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            childAspectRatio: 0.60,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
          ),
          delegate: SliverChildBuilderDelegate(
            (_, i) => Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(children: [
                Expanded(
                    flex: 5,
                    child: Container(
                      decoration: const BoxDecoration(
                        color: AppColors.chip,
                        borderRadius:
                            BorderRadius.vertical(top: Radius.circular(12)),
                      ),
                    )),
                Expanded(
                    flex: 4,
                    child: Padding(
                      padding: const EdgeInsets.all(8),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                              height: 10,
                              width: double.infinity,
                              color: AppColors.chip),
                          const SizedBox(height: 6),
                          Container(
                              height: 10, width: 80, color: AppColors.chip),
                        ],
                      ),
                    )),
              ]),
            ),
            childCount: 6,
          ),
        ),
      );
    }

    if (_error != null) {
      return SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 24),
          child: Column(children: [
            const Icon(Icons.wifi_off_outlined,
                size: 40, color: AppColors.outline),
            const SizedBox(height: 10),
            Text(_error!,
                textAlign: TextAlign.center,
                style: _pjs(size: 13, color: _kSubtext)),
            const SizedBox(height: 12),
            FilledButton.tonal(
              onPressed: _load,
              child:
                  Text('Retry', style: _pjs(size: 13, weight: FontWeight.w700)),
            ),
          ]),
        ),
      );
    }

    if (_products.isEmpty) {
      return SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 24),
          child: Column(children: [
            const Icon(Icons.storefront_outlined,
                size: 40, color: AppColors.outline),
            const SizedBox(height: 10),
            Text('No products available yet.',
                style: _pjs(size: 13, color: _kSubtext)),
          ]),
        ),
      );
    }

    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      sliver: SliverGrid(
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 0.60,
          crossAxisSpacing: 10,
          mainAxisSpacing: 10,
        ),
        delegate: SliverChildBuilderDelegate(
          (ctx, i) {
            final p = _products[i];
            return StaggeredItem(
              index: i,
              child: _CatProductCard(
                product: p,
                onTap: () {
                  final cart = CartProvider.of(ctx);
                  final wish = WishlistProvider.of(ctx);
                  Navigator.push(
                      ctx,
                      MimooPageRoute(
                        builder: (_) => WishlistProvider(
                          wishlist: wish,
                          child: CartProvider(
                              cart: cart, child: ProductDetailPage(product: p)),
                        ),
                      ));
                },
                onAddToCart: () {
                  if (!AuthService.instance.isLoggedIn) {
                    Navigator.push(
                        ctx,
                        MaterialPageRoute(
                          builder: (_) => LoginPage(
                            onLoginSuccess: () => CartProvider.of(ctx).add(p),
                          ),
                        ));
                    return;
                  }
                  CartProvider.of(ctx).add(p);
                  ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(
                    content: Text('Added to cart!',
                        style: _pjs(
                            size: 13,
                            color: Colors.white,
                            weight: FontWeight.w600)),
                    backgroundColor: _kPrimary,
                    duration: const Duration(seconds: 1),
                  ));
                },
              ),
            );
          },
          childCount: _products.length,
        ),
      ),
    );
  }

  // ── Voucher banner ───────────────────────────────────────────────────────────
  // ignore: unused_element
  Widget _buildVoucherBanner() {
    return Container(
      margin: const EdgeInsets.fromLTRB(12, 12, 12, 0),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.primaryMid, AppColors.accent],
        ),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.local_offer_outlined,
                color: Colors.white, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('₱150 OFF Voucher',
                    style: _pjs(
                        size: 14,
                        weight: FontWeight.w800,
                        color: Colors.white)),
                Text('Applicable on all Fashion orders',
                    style: _pjs(size: 12, color: Colors.white70)),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: _kPrimary,
              elevation: 0,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(9999)),
              minimumSize: const Size(0, 36),
              padding: const EdgeInsets.symmetric(horizontal: 16),
            ),
            child: Text('Claim',
                style:
                    _pjs(size: 13, weight: FontWeight.w700, color: _kPrimary)),
          ),
        ],
      ),
    );
  }
}

// ── Category chip ─────────────────────────────────────────────────────────────
class _CatChip extends StatelessWidget {
  const _CatChip(
      {required this.cat,
      required this.color,
      required this.selected,
      required this.onTap});
  final BuyerCategory cat;
  final Color color;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: color.withValues(alpha: selected ? 0.25 : 0.1),
              borderRadius: BorderRadius.circular(14),
              border: selected ? Border.all(color: color, width: 2) : null,
            ),
            child: Icon(cat.icon, size: 26, color: color),
          ),
          const SizedBox(height: 5),
          Text(
            cat.name,
            style: _pjs(
                size: 10, weight: FontWeight.w600, color: _kText, height: 1.3),
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

// ── Real-product card for API-backed grid ─────────────────────────────────────
class _CatProductCard extends StatelessWidget {
  const _CatProductCard({
    required this.product,
    required this.onTap,
    required this.onAddToCart,
  });
  final Product product;
  final VoidCallback onTap;
  final VoidCallback onAddToCart;

  @override
  Widget build(BuildContext context) {
    final wishlist = WishlistProvider.of(context);
    final wished = wishlist.contains(product);
    final hasImage = product.imageUrl.isNotEmpty;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: _kCard,
          borderRadius: BorderRadius.circular(12),
          boxShadow: const [
            BoxShadow(
                color: AppColors.primaryA05,
                blurRadius: 8,
                offset: Offset(0, 2)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              flex: 5,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  ClipRRect(
                    borderRadius:
                        const BorderRadius.vertical(top: Radius.circular(12)),
                    child: hasImage
                        ? Image.network(
                            product.imageUrl,
                            fit: BoxFit.cover,
                            headers: const {'Accept': 'image/*'},
                            errorBuilder: (_, __, ___) =>
                                Container(color: _kChip),
                          )
                        : Container(color: _kChip),
                  ),
                  if (product.isOnSale)
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 7, vertical: 3),
                        decoration: BoxDecoration(
                          color: _kFlash,
                          borderRadius: BorderRadius.circular(5),
                        ),
                        child: Text('SALE',
                            style: _pjs(
                                size: 9,
                                weight: FontWeight.w800,
                                color: Colors.white)),
                      ),
                    ),
                  Positioned(
                    top: 8,
                    right: 8,
                    child: GestureDetector(
                      onTap: () {
                        if (!AuthService.instance.isLoggedIn) {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => LoginPage(
                                onLoginSuccess: () => wishlist.toggle(product),
                              ),
                            ),
                          );
                          return;
                        }
                        wishlist.toggle(product);
                      },
                      child: Container(
                        width: 28,
                        height: 28,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.9),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          wished ? Icons.favorite : Icons.favorite_border,
                          size: 15,
                          color: wished ? _kFlash : _kSubtext,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              flex: 4,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(8, 6, 8, 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(product.name,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: _pjs(
                            size: 12, weight: FontWeight.w600, height: 1.3)),
                    const SizedBox(height: 3),
                    if (product.sellerName != null)
                      Text(product.sellerName!,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: _pjs(size: 10, color: _kSubtext)),
                    const Spacer(),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '₱${product.effectivePrice.toStringAsFixed(0)}',
                              style: _pjs(
                                  size: 16,
                                  weight: FontWeight.w800,
                                  color: _kPrimary),
                            ),
                            if (product.isOnSale)
                              Text(
                                '₱${product.price.toStringAsFixed(0)}',
                                style: _pjs(
                                    size: 10,
                                    color: _kSubtext,
                                    decoration: TextDecoration.lineThrough),
                              ),
                          ],
                        ),
                        GestureDetector(
                          onTap: onAddToCart,
                          child: Container(
                            width: 30,
                            height: 30,
                            decoration: const BoxDecoration(
                                color: _kPrimary, shape: BoxShape.circle),
                            child: const Icon(Icons.add,
                                size: 18, color: Colors.white),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
