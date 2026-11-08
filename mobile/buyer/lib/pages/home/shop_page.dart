import 'dart:async';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../models/product.dart';
import '../../services/product_repository.dart';
import '../../services/api_service.dart';
import '../../services/category_repository.dart';
import '../../widgets/mimoo_logo.dart';
import '../../widgets/motion.dart';
import '../../state/auth_service.dart';
import '../../state/wishlist_provider.dart';
import '../auth/login_page.dart';
import 'product_detail_page.dart';
import '../../state/cart_provider.dart';
import '../notifications/notifications_page.dart';
import '../../widgets/notification_badge.dart';
import '../search/search_page.dart';
import '../account/account_settings_page.dart';
import '../../utils/animations.dart';

// ── Mimoo Color Tokens ────────────────────────────────────────────────────────
class MimooColors {
  static const primary = Color(0xFF1E0042);
  static const primaryContainer = Color(0xFF34175B);
  static const secondary = Color(0xFF6B38D4);
  static const secondaryBright = Color(0xFF8455EF);
  static const flash = Color(0xFFFF3B5C);
  static const surface = Color(0xFFFAF8FE);
  static const surfaceCard = Color(0xFFFFFFFF);
  static const surfaceChip = Color(0xFFEFE9FD);
  static const onSurface = Color(0xFF1B1B20);
  static const onSurfaceVariant = Color(0xFF4A454F);
  static const outline = Color(0xFF7B7580);
  static const outlineVariant = Color(0xFFCCC4D1);
  static const starColor = Color(0xFF8455EF);
}

// ── Sample Data ───────────────────────────────────────────────────────────────

class _FlashProduct {
  const _FlashProduct({
    required this.name,
    required this.price,
    required this.originalPrice,
    required this.discount,
    required this.claimed,
    required this.imageUrl,
  });
  final String name;
  final double price;
  final double originalPrice;
  final int discount;
  final int claimed;
  final String imageUrl;
}

// ignore: unused_element
const _flashProducts = [
  _FlashProduct(
    name: 'ANC Wireless Headphones',
    price: 49.99,
    originalPrice: 119.00,
    discount: 58,
    claimed: 82,
    imageUrl: 'https://picsum.photos/seed/headphones/300/300',
  ),
  _FlashProduct(
    name: 'Galaxy Ultra 5G',
    price: 699.00,
    originalPrice: 899.00,
    discount: 22,
    claimed: 65,
    imageUrl: 'https://picsum.photos/seed/phone/300/300',
  ),
  _FlashProduct(
    name: 'Ceramic Desk Lamp',
    price: 24.50,
    originalPrice: 48.00,
    discount: 49,
    claimed: 91,
    imageUrl: 'https://picsum.photos/seed/lamp/300/300',
  ),
  _FlashProduct(
    name: 'Everyday Vegan Tote',
    price: 32.00,
    originalPrice: 65.00,
    discount: 50,
    claimed: 74,
    imageUrl: 'https://picsum.photos/seed/tote/300/300',
  ),
];

class _RecommendedProduct {
  const _RecommendedProduct({
    required this.name,
    required this.price,
    required this.originalPrice,
    required this.rating,
    required this.reviews,
    required this.badge,
    required this.shipping,
    required this.imageUrl,
  });
  final String name;
  final double price;
  final double originalPrice;
  final double rating;
  final String reviews;
  final String badge;
  final String shipping;
  final String imageUrl;
}

class _CategoryItem {
  const _CategoryItem({required this.icon, required this.label});
  final IconData icon;
  final String label;
}

// Same categories and labels as the website (exact products.category values,
// see services/category_repository.dart). Index 0 = All.
final _categories = [
  const _CategoryItem(icon: Icons.star_outline_rounded, label: 'All'),
  ...kWebCategories.map((c) => _CategoryItem(icon: c.icon, label: c.name)),
];

// ── Shop Page ─────────────────────────────────────────────────────────────────

class ShopPage extends StatefulWidget {
  const ShopPage({super.key});

  @override
  State<ShopPage> createState() => _ShopPageState();
}

class _ShopPageState extends State<ShopPage> {
  late PageController _bannerPageCtrl;
  // ignore: prefer_final_fields
  int _bannerIndex = 0;
  Timer? _bannerTimer;

  // ── Recommended products from API ─────────────────────────────────────────
  List<Product> _recommended = [];
  bool _recLoading = true;
  String? _recError;

  /// Selected category (exact products.category value); null = All.
  String? _category;
  int _recPage = 1;
  bool _recHasMore = false;
  bool _recLoadingMore = false;

  // ── Hero banner slides ────────────────────────────────────────────────────
  // 3 real images from assets/images/ (banner_hero_* from the design team).
  // NOTE: banner_hero_1.png is 821.5 KB — larger than ideal but kept as-is
  // per task instructions (do not modify originals >300 KB).
  static const _heroSlides = <_HeroSlide>[
    _HeroSlide(asset: 'assets/images/banner_hero_1.png'),
    _HeroSlide(asset: 'assets/images/banner_hero_2.jpg'),
    _HeroSlide(asset: 'assets/images/banner_hero_3.jpg'),
  ];

  // ── Old fake banner data (hidden — kept for reference) ──────────────────────
  // final List<_BannerData> _banners = const [
  //   _BannerData(tag: '✨ New Drop', ...picsum...),
  //   _BannerData(tag: '🔥 Super Payday Sale', ...picsum...),
  //   _BannerData(tag: '⚡ Flash Tech', ...picsum...),
  // ];

  @override
  void initState() {
    super.initState();
    _bannerPageCtrl = PageController(viewportFraction: 1.0);
    _startAutoScroll();
    _loadRecommended();
  }

  Future<void> _loadRecommended({bool refresh = false}) async {
    if (refresh) {
      setState(() {
        _recPage = 1;
        _recError = null;
        _recLoading = true;
        _recommended = [];
      });
    }
    try {
      final page = await ProductRepository.instance.fetchProducts(
        page: _recPage,
        perPage: 12,
        // Same ordering as the web homepage (best-selling 7 days, then newest)
        sort: 'popular',
        category: _category,
      );
      if (!mounted) return;
      setState(() {
        _recommended =
            refresh ? page.products : [..._recommended, ...page.products];
        _recHasMore = page.hasMore;
        _recLoading = false;
        _recError = null;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _recLoading = false;
        _recError = ApiService.friendlyError(e);
      });
    }
  }

  Future<void> _loadMore() async {
    if (_recLoadingMore || !_recHasMore) return;
    setState(() {
      _recLoadingMore = true;
      _recPage++;
    });
    try {
      final page = await ProductRepository.instance.fetchProducts(
        page: _recPage,
        perPage: 12,
        // Same ordering as the web homepage (best-selling 7 days, then newest)
        sort: 'popular',
        category: _category,
      );
      if (!mounted) return;
      setState(() {
        _recommended = [..._recommended, ...page.products];
        _recHasMore = page.hasMore;
        _recLoadingMore = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _recLoadingMore = false;
        _recPage--; // revert so retry works
      });
    }
  }

  void _startAutoScroll() {
    _bannerTimer?.cancel();
    _bannerTimer = Timer.periodic(const Duration(seconds: 5), (_) {
      if (!mounted || !_bannerPageCtrl.hasClients) return;
      final next = (_bannerIndex + 1) % _heroSlides.length;
      // Update index immediately so dots reflect the new slide right away.
      setState(() => _bannerIndex = next);
      _bannerPageCtrl.animateToPage(
        next,
        duration: const Duration(milliseconds: 500),
        curve: Curves.easeInOut,
      );
    });
  }

  @override
  void dispose() {
    _bannerTimer?.cancel();
    _bannerPageCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: MimooColors.surface,
      body: SafeArea(
        bottom: false,
        child: MimooRefresh(
          onRefresh: () => _loadRecommended(refresh: true),
          child: CustomScrollView(
            slivers: [
              SliverToBoxAdapter(child: _buildHeader()),
              SliverToBoxAdapter(child: _buildBanner()),
              SliverToBoxAdapter(child: _buildCategoryRow()),
              SliverToBoxAdapter(child: _buildQuickChips()),
              SliverToBoxAdapter(child: _buildFlashSaleSection()),
              // Promo banner hidden — fake "FREE Shipping today only" offer,
              // not on the website and no backend.
              // SliverToBoxAdapter(child: _buildPromoBanner()),
              SliverToBoxAdapter(child: _buildRecommendedHeader()),
              _buildRecommendedGrid(),
              SliverToBoxAdapter(child: _buildLoadMoreFooter()),
              const SliverToBoxAdapter(child: SizedBox(height: 80)),
            ],
          ),
        ),
      ),
    );
  }

  // ── Header ──────────────────────────────────────────────────────────────────

  Widget _buildHeader() {
    final wishlist = WishlistProvider.of(context);
    return AnimatedBuilder(
      animation: wishlist,
      builder: (context, _) => Container(
        color: MimooColors.primaryContainer,
        padding: const EdgeInsets.fromLTRB(16, 10, 16, 10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                // Brand logo (framed tile — logo has an opaque background)
                const MimooLogo(size: 58, framed: true),
                const Spacer(),
                Text(
                  'Home',
                  style: GoogleFonts.plusJakartaSans(
                    color: Colors.white70,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const Spacer(),
                // Notification bell
                GestureDetector(
                  onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (_) => const NotificationsPage())),
                  child: Stack(
                    children: [
                      const Padding(
                        padding: EdgeInsets.all(4),
                        child: Icon(Icons.notifications_none_outlined,
                            color: Colors.white, size: 22),
                      ),
                      // Real unread count (hidden when 0)
                      const NotificationBadge(),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                // Avatar → Account Settings
                GestureDetector(
                  onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (_) => const AccountSettingsPage())),
                  child: Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      shape: BoxShape.circle,
                    ),
                    child:
                        const Icon(Icons.person, color: Colors.white, size: 18),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            // Search bar — tapping navigates to SearchPage
            GestureDetector(
              onTap: () => Navigator.push(context,
                  MaterialPageRoute(builder: (_) => const SearchPage())),
              child: Container(
                height: 40,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(9999),
                ),
                child: Row(
                  children: [
                    const SizedBox(width: 12),
                    const Icon(Icons.search, size: 16, color: Colors.white70),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Search products, brands...',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 13,
                          color: Colors.white70,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Hero Banner (pure images, 3 slides, mouse-draggable on Chrome) ──────────

  Widget _buildBanner() {
    return Column(
      children: [
        SizedBox(
          height: 210,
          // ScrollConfiguration: enable mouse drag on Flutter Web.
          // Without PointerDeviceKind.mouse, Chrome users can only swipe on
          // touch screens — mouse drag does nothing.
          child: ScrollConfiguration(
            behavior: ScrollConfiguration.of(context).copyWith(
              dragDevices: {
                PointerDeviceKind.touch,
                PointerDeviceKind.mouse,
              },
            ),
            child: PageView.builder(
              controller: _bannerPageCtrl,
              itemCount: _heroSlides.length,
              physics: const BouncingScrollPhysics(),
              onPageChanged: (i) => setState(() => _bannerIndex = i),
              itemBuilder: (_, i) {
                final slide = _heroSlides[i];
                return Padding(
                  padding: const EdgeInsets.fromLTRB(12, 12, 12, 0),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(18),
                    child: Image.asset(
                      slide.asset!,
                      fit: BoxFit.cover,
                      width: double.infinity,
                      height: 210,
                      errorBuilder: (_, __, ___) => Container(
                        color: MimooColors.surfaceChip,
                        height: 210,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ),
        const SizedBox(height: 8),
        // Dot indicators
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(_heroSlides.length, (i) {
            final isActive = i == _bannerIndex;
            return AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              margin: const EdgeInsets.symmetric(horizontal: 3),
              width: isActive ? 24 : 8,
              height: 4,
              decoration: BoxDecoration(
                color: isActive
                    ? MimooColors.primaryContainer
                    : const Color(0xFFCCC4D1),
                borderRadius: BorderRadius.circular(9999),
              ),
            );
          }),
        ),
      ],
    );
  }

  // ── Category Row ─────────────────────────────────────────────────────────────

  Widget _buildCategoryRow() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 16, 12, 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Curated Categories',
                  style: GoogleFonts.plusJakartaSans(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: MimooColors.onSurface)),
              Text('See all',
                  style: GoogleFonts.plusJakartaSans(
                      fontSize: 13,
                      color: MimooColors.secondary,
                      fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 38,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _categories.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (_, i) => _CategoryChip(
                item: _categories[i],
                isSelected: i == 0
                    ? _category == null
                    : _categories[i].label == _category,
                onTap: () {
                  final next = i == 0 ? null : _categories[i].label;
                  if (next == _category) return;
                  setState(() => _category = next);
                  _loadRecommended(refresh: true);
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Quick Chips ──────────────────────────────────────────────────────────────

  Widget _buildQuickChips() {
    // Quick chips hidden — all 4 have fake tags ("HOT", "DAILY", "-$15 OFF", "TREND").
    return const SizedBox.shrink();
  }

  // ── Flash Sale Section ───────────────────────────────────────────────────────

  Widget _buildFlashSaleSection() {
    // Flash Sale section hidden — no sale_end_date column, fake countdown timer + fake products.
    return const SizedBox.shrink();
  }

  // ── Promo Banner (below Flash Sales) ─────────────────────────────────────────

  // ignore: unused_element
  Widget _buildPromoBanner() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 12, 12, 0),
      child: GestureDetector(
        onTap: () {},
        child: Container(
          height: 90,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            gradient: const LinearGradient(
              colors: [Color(0xFF4B2E8A), Color(0xFF6B38D4)],
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
            ),
          ),
          child: Row(
            children: [
              const SizedBox(width: 16),
              // Left text block
              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFF3B5C),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        'LIMITED OFFER',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 9,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                    const SizedBox(height: 5),
                    Text(
                      'FREE Shipping',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        letterSpacing: -0.3,
                      ),
                    ),
                    Text(
                      'on all orders today only',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 11,
                        color: Colors.white70,
                      ),
                    ),
                  ],
                ),
              ),
              // Right decorative element
              Padding(
                padding: const EdgeInsets.only(right: 16),
                child: Container(
                  width: 58,
                  height: 58,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.local_shipping_outlined,
                      color: Colors.white, size: 28),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ── Recommended Header ───────────────────────────────────────────────────────

  Widget _buildRecommendedHeader() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 20, 12, 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text('Recommended For You',
              style: GoogleFonts.plusJakartaSans(
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: MimooColors.onSurface)),
          Row(
            children: [
              Text(_category ?? 'Best sellers',
                  style: GoogleFonts.plusJakartaSans(
                      fontSize: 12,
                      color: MimooColors.secondary,
                      fontWeight: FontWeight.w600)),
              const SizedBox(width: 4),
              const Icon(Icons.tune, size: 14, color: MimooColors.secondary),
            ],
          ),
        ],
      ),
    );
  }

  // ── Recommended Grid (live from API) ──────────────────────────────────────

  Widget _buildRecommendedGrid() {
    // Loading skeleton
    if (_recLoading) {
      return SliverPadding(
        padding: const EdgeInsets.symmetric(horizontal: 12),
        sliver: SliverGrid(
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            childAspectRatio: 0.54,
            crossAxisSpacing: 8,
            mainAxisSpacing: 8,
          ),
          delegate: SliverChildBuilderDelegate(
            (_, i) => _ProductSkeleton(index: i),
            childCount: 6,
          ),
        ),
      );
    }

    // Error state
    if (_recError != null) {
      return SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 24),
          child: Column(
            children: [
              const Icon(Icons.wifi_off_outlined,
                  size: 40, color: MimooColors.outline),
              const SizedBox(height: 10),
              Text(_recError!,
                  textAlign: TextAlign.center,
                  style: GoogleFonts.plusJakartaSans(
                      fontSize: 13, color: MimooColors.onSurfaceVariant)),
              const SizedBox(height: 12),
              FilledButton.tonal(
                onPressed: () => _loadRecommended(refresh: true),
                child: Text('Try again',
                    style: GoogleFonts.plusJakartaSans(
                        fontSize: 13, fontWeight: FontWeight.w700)),
              ),
            ],
          ),
        ),
      );
    }

    // Empty state
    if (_recommended.isEmpty) {
      return SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 24),
          child: Column(
            children: [
              const Icon(Icons.storefront_outlined,
                  size: 40, color: MimooColors.outline),
              const SizedBox(height: 10),
              Text('No products available yet.',
                  style: GoogleFonts.plusJakartaSans(
                      fontSize: 13, color: MimooColors.onSurfaceVariant)),
            ],
          ),
        ),
      );
    }

    // Product grid
    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      sliver: SliverGrid(
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 0.54,
          crossAxisSpacing: 8,
          mainAxisSpacing: 8,
        ),
        delegate: SliverChildBuilderDelegate(
          (ctx, i) {
            final p = _recommended[i];
            // Fade/slide in once per product (not on every rebuild/scroll),
            // plus a subtle press effect.
            return StaggeredItem(
              index: i,
              id: 'home-${p.id}',
              child: PressScale(
                child: _ApiProductCard(
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
                          cart: cart,
                          child: ProductDetailPage(product: p),
                        ),
                      ),
                    ),
                  );
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
                        style: GoogleFonts.plusJakartaSans(
                            fontSize: 13,
                            color: Colors.white,
                            fontWeight: FontWeight.w600)),
                    backgroundColor: MimooColors.primaryContainer,
                    duration: const Duration(seconds: 1),
                  ));
                },
              ),
              ),
            );
          },
          childCount: _recommended.length,
        ),
      ),
    );
  }

  // ── Load-more footer ──────────────────────────────────────────────────────

  Widget _buildLoadMoreFooter() {
    if (_recLoading || _recError != null || _recommended.isEmpty) {
      return const SizedBox.shrink();
    }
    if (_recLoadingMore) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 20),
        child: Center(
            child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2))),
      );
    }
    if (_recHasMore) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 24),
        child: SizedBox(
          width: double.infinity,
          child: OutlinedButton(
            onPressed: _loadMore,
            child: Text('Load more',
                style: GoogleFonts.plusJakartaSans(
                    fontSize: 13, fontWeight: FontWeight.w700)),
          ),
        ),
      );
    }
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 20),
      child: Center(
        child: Text('You\'ve seen all products',
            style: GoogleFonts.plusJakartaSans(
                fontSize: 12, color: MimooColors.onSurfaceVariant)),
      ),
    );
  }
}

// ── Banner Data & Card ────────────────────────────────────────────────────────

class _BannerData {
  const _BannerData({
    required this.tag,
    required this.title,
    required this.subtitle,
    required this.description,
    required this.cta,
    required this.ctaIcon,
    required this.imageUrl,
    required this.gradient,
  });
  final String tag;
  final String title;
  final String subtitle;
  final String description;
  final String cta;
  final IconData ctaIcon;
  final String imageUrl;
  final List<Color> gradient;
}

// ── Hero Slide (matching web Homepage HeroMainBanner) ──────────────────────────
class _HeroSlide {
  const _HeroSlide({this.asset});
  final String? asset; // null = placeholder (no image)
}

// ignore: unused_element
class _BannerCard extends StatelessWidget {
  const _BannerCard({
    required this.banner,
    required this.index,
    required this.currentIndex,
    required this.total,
  });
  final _BannerData banner;
  final int index;
  final int currentIndex;
  final int total;

  @override
  Widget build(BuildContext context) {
    final screenW = MediaQuery.of(context).size.width;

    return Container(
      height: 210,
      margin: const EdgeInsets.fromLTRB(12, 10, 12, 0),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: banner.gradient,
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
        borderRadius: BorderRadius.circular(18),
        boxShadow: const [
          BoxShadow(
            color: Color(0x2034175B),
            blurRadius: 16,
            offset: Offset(0, 6),
          ),
        ],
      ),
      child: Stack(
        clipBehavior: Clip.antiAlias,
        children: [
          // ── Right image ──────────────────────────────────────────────
          Positioned(
            right: 0,
            top: 0,
            bottom: 0,
            width: screenW * 0.42,
            child: ClipRRect(
              borderRadius:
                  const BorderRadius.horizontal(right: Radius.circular(18)),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  Image.network(
                    banner.imageUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) =>
                        Container(color: Colors.white.withValues(alpha: 0.08)),
                  ),
                  // gradient blend on left edge
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [banner.gradient.first, Colors.transparent],
                        begin: Alignment.centerLeft,
                        end: Alignment.centerRight,
                        stops: const [0.0, 0.45],
                      ),
                    ),
                  ),
                  // Discount badge
                  Positioned(
                    bottom: 12,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: MimooColors.flash,
                        borderRadius: BorderRadius.circular(9999),
                        boxShadow: const [
                          BoxShadow(
                              color: Color(0x47FF3B5C),
                              blurRadius: 8,
                              offset: Offset(0, 3)),
                        ],
                      ),
                      child: Text('-70%',
                          style: GoogleFonts.plusJakartaSans(
                              fontSize: 13,
                              fontWeight: FontWeight.w800,
                              color: Colors.white)),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Left content ─────────────────────────────────────────────
          Positioned(
            left: 0,
            top: 0,
            bottom: 0,
            width: screenW * 0.60,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 14, 8, 40),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Tag chip
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(9999),
                      border: Border.all(
                          color: Colors.white.withValues(alpha: 0.3),
                          width: 0.8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 6,
                          height: 6,
                          decoration: const BoxDecoration(
                              color: MimooColors.flash, shape: BoxShape.circle),
                        ),
                        const SizedBox(width: 4),
                        Text(banner.tag.toUpperCase(),
                            style: GoogleFonts.plusJakartaSans(
                                fontSize: 9,
                                fontWeight: FontWeight.w800,
                                color: Colors.white,
                                letterSpacing: 0.5)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Headline
                  Text(banner.title,
                      style: GoogleFonts.plusJakartaSans(
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                          height: 1.15,
                          letterSpacing: -0.5),
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 4),

                  // Subtitle
                  Text(banner.subtitle,
                      style: GoogleFonts.plusJakartaSans(
                          fontSize: 11, color: Colors.white70, height: 1.4),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis),
                  const Spacer(),

                  // CTA button
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 16, vertical: 9),
                    decoration: BoxDecoration(
                      color: MimooColors.secondary,
                      borderRadius: BorderRadius.circular(9999),
                      boxShadow: const [
                        BoxShadow(
                            color: Color(0x406B38D4),
                            blurRadius: 10,
                            offset: Offset(0, 4)),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(banner.cta,
                            style: GoogleFonts.plusJakartaSans(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: Colors.white)),
                        const SizedBox(width: 5),
                        Icon(banner.ctaIcon, size: 13, color: Colors.white),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Dot indicators + Verified chip ───────────────────────────
          Positioned(
            bottom: 10,
            left: 16,
            child: Row(
              children: [
                ...List.generate(total, (i) {
                  final active = i == currentIndex;
                  return AnimatedContainer(
                    duration: const Duration(milliseconds: 250),
                    margin: const EdgeInsets.only(right: 4),
                    width: active ? 18 : 6,
                    height: 6,
                    decoration: BoxDecoration(
                      color:
                          Colors.white.withValues(alpha: active ? 1.0 : 0.35),
                      borderRadius: BorderRadius.circular(9999),
                    ),
                  );
                }),
                const SizedBox(width: 10),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(9999),
                    border: Border.all(
                        color: Colors.white.withValues(alpha: 0.25),
                        width: 0.8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.verified_outlined,
                          size: 10, color: Colors.white70),
                      const SizedBox(width: 4),
                      Text(
                        'Verified Local Stores  ${currentIndex + 1}/$total',
                        style: GoogleFonts.plusJakartaSans(
                            fontSize: 9,
                            color: Colors.white70,
                            fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Category Chip ─────────────────────────────────────────────────────────────

class _CategoryChip extends StatelessWidget {
  const _CategoryChip(
      {required this.item, this.isSelected = false, this.onTap});
  final _CategoryItem item;
  final bool isSelected;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
        decoration: BoxDecoration(
          color: isSelected
              ? MimooColors.primaryContainer
              : MimooColors.surfaceCard,
          borderRadius: BorderRadius.circular(9999),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              item.icon,
              size: 15,
              color: isSelected ? Colors.white : MimooColors.secondary,
            ),
            const SizedBox(width: 5),
            Text(
              item.label,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: isSelected ? Colors.white : MimooColors.onSurface,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Quick Chip ────────────────────────────────────────────────────────────────

// ignore: unused_element
class _QuickChip extends StatelessWidget {
  const _QuickChip({
    required this.icon,
    required this.label,
    required this.tag,
    required this.tagColor,
  });
  final String icon;
  final String label;
  final String tag;
  final Color tagColor;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 7),
        decoration: BoxDecoration(
          color: MimooColors.surfaceCard,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(icon, style: const TextStyle(fontSize: 16)),
            const SizedBox(height: 2),
            Text(label,
                style: GoogleFonts.plusJakartaSans(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: MimooColors.onSurface)),
            Container(
              margin: const EdgeInsets.only(top: 2),
              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
              decoration: BoxDecoration(
                color: tagColor.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(tag,
                  style: GoogleFonts.plusJakartaSans(
                      fontSize: 8,
                      fontWeight: FontWeight.w800,
                      color: tagColor)),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Countdown Timer ───────────────────────────────────────────────────────────

class _CountdownTimer extends StatefulWidget {
  const _CountdownTimer();

  @override
  State<_CountdownTimer> createState() => _CountdownTimerState();
}

class _CountdownTimerState extends State<_CountdownTimer> {
  // ignore: prefer_final_fields
  int _seconds = 2 * 3600 + 45 * 60 + 18;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    // Flash sale countdown disabled — no sale_end_date column in DB.
    // _timer = Timer.periodic(const Duration(seconds: 1), (_) {
    //   if (mounted && _seconds > 0) {
    //     setState(() => _seconds--);
    //   }
    // });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final h = _seconds ~/ 3600;
    final m = (_seconds % 3600) ~/ 60;
    final s = _seconds % 60;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: MimooColors.primaryContainer,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _TimeBlock(value: h.toString().padLeft(2, '0')),
          Text(' : ',
              style: GoogleFonts.plusJakartaSans(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: MimooColors.flash)),
          _TimeBlock(value: m.toString().padLeft(2, '0')),
          Text(' : ',
              style: GoogleFonts.plusJakartaSans(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: MimooColors.flash)),
          _TimeBlock(value: s.toString().padLeft(2, '0')),
        ],
      ),
    );
  }
}

class _TimeBlock extends StatelessWidget {
  const _TimeBlock({required this.value});
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(3),
      ),
      child: Text(value,
          style: GoogleFonts.plusJakartaSans(
              fontSize: 11,
              fontWeight: FontWeight.w800,
              color: MimooColors.primaryContainer)),
    );
  }
}

// ── Flash Card ────────────────────────────────────────────────────────────────

// ignore: unused_element
class _FlashCard extends StatelessWidget {
  const _FlashCard({required this.product});
  final _FlashProduct product;

  Product get _asProduct => Product(
        id: product.name.hashCode,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        category: 'Flash Sale',
      );

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        final cart = CartProvider.of(context);
        Navigator.push(
          context,
          MimooPageRoute(
            builder: (_) => CartProvider(
              cart: cart,
              child: ProductDetailPage(product: _asProduct),
            ),
          ),
        );
      },
      child: Container(
        width: 130,
        decoration: BoxDecoration(
          color: MimooColors.surfaceCard,
          borderRadius: BorderRadius.circular(12),
          boxShadow: const [
            BoxShadow(
              color: Color(0x0D34175B),
              blurRadius: 8,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image
            Stack(
              children: [
                ClipRRect(
                  borderRadius:
                      const BorderRadius.vertical(top: Radius.circular(12)),
                  child: Image.network(
                    product.imageUrl,
                    width: 130,
                    height: 110,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      width: 130,
                      height: 110,
                      color: MimooColors.surfaceChip,
                    ),
                  ),
                ),
                // Discount badge
                Positioned(
                  top: 6,
                  left: 6,
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                    decoration: BoxDecoration(
                      color: MimooColors.flash,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text('-${product.discount}%',
                        style: GoogleFonts.plusJakartaSans(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: Colors.white)),
                  ),
                ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 6, 8, 6),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(product.name,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.plusJakartaSans(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: MimooColors.onSurface,
                          height: 1.3)),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Flexible(
                        child: Text('\$${product.price.toStringAsFixed(2)}',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.plusJakartaSans(
                                fontSize: 13,
                                fontWeight: FontWeight.w800,
                                color: MimooColors.flash)),
                      ),
                      const SizedBox(width: 4),
                      Text('\$${product.originalPrice.toStringAsFixed(0)}',
                          style: GoogleFonts.plusJakartaSans(
                              fontSize: 10,
                              color: MimooColors.outline,
                              decoration: TextDecoration.lineThrough)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  // Progress bar
                  ClipRRect(
                    borderRadius: BorderRadius.circular(9999),
                    child: LinearProgressIndicator(
                      value: product.claimed / 100,
                      backgroundColor: const Color(0xFFEFE9FD),
                      color: MimooColors.flash,
                      minHeight: 4,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text('${product.claimed}% Claimed',
                      style: GoogleFonts.plusJakartaSans(
                          fontSize: 9,
                          color: MimooColors.onSurfaceVariant,
                          fontWeight: FontWeight.w600)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Recommended Card ──────────────────────────────────────────────────────────

class _RecommendedCard extends StatefulWidget {
  const _RecommendedCard({required this.product});
  final _RecommendedProduct product;

  @override
  State<_RecommendedCard> createState() => _RecommendedCardState();
}

class _RecommendedCardState extends State<_RecommendedCard> {
  /// Maps the local _RecommendedProduct to the shared Product model
  Product get _asProduct => Product(
        id: widget.product.name.hashCode.abs(),
        name: widget.product.name,
        price: widget.product.price,
        imageUrl: widget.product.imageUrl,
        category: widget.product.badge,
      );

  void _goToDetail(BuildContext ctx) {
    final cart = CartProvider.of(ctx);
    final wishlist = WishlistProvider.of(ctx);
    Navigator.push(
      ctx,
      MaterialPageRoute(
        builder: (_) => WishlistProvider(
          wishlist: wishlist,
          child: CartProvider(
            cart: cart,
            child: ProductDetailPage(product: _asProduct),
          ),
        ),
      ),
    );
  }

  void _handleAdd(BuildContext ctx) {
    if (!AuthService.instance.isLoggedIn) {
      Navigator.push(
        ctx,
        MaterialPageRoute(
          builder: (_) => LoginPage(
            onLoginSuccess: () {
              final cart = CartProvider.of(ctx);
              cart.add(_asProduct);
              ScaffoldMessenger.of(ctx).showSnackBar(
                SnackBar(
                  content: Text('Added to cart!',
                      style: GoogleFonts.plusJakartaSans(
                          fontSize: 13,
                          color: Colors.white,
                          fontWeight: FontWeight.w600)),
                  backgroundColor: MimooColors.primaryContainer,
                  duration: const Duration(seconds: 1),
                ),
              );
            },
          ),
        ),
      );
      return;
    }
    final cart = CartProvider.of(ctx);
    cart.add(_asProduct);
    ScaffoldMessenger.of(ctx).showSnackBar(
      SnackBar(
        content: Text('Added to cart!',
            style: GoogleFonts.plusJakartaSans(
                fontSize: 13,
                color: Colors.white,
                fontWeight: FontWeight.w600)),
        backgroundColor: MimooColors.primaryContainer,
        duration: const Duration(seconds: 1),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final wishlist = WishlistProvider.of(context);
    final wished = wishlist.contains(_asProduct);
    return GestureDetector(
      onTap: () => _goToDetail(context),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Container(
          decoration: BoxDecoration(
            color: MimooColors.surfaceCard,
            borderRadius: BorderRadius.circular(12),
            boxShadow: const [
              BoxShadow(
                color: Color(0x0D34175B),
                blurRadius: 8,
                offset: Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Image + heart ──────────────────────────────────────────
              Stack(
                children: [
                  ClipRRect(
                    borderRadius:
                        const BorderRadius.vertical(top: Radius.circular(12)),
                    child: AspectRatio(
                      aspectRatio: 1.1,
                      child: Image.network(
                        widget.product.imageUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) =>
                            Container(color: MimooColors.surfaceChip),
                      ),
                    ),
                  ),
                  Positioned(
                    top: 6,
                    right: 6,
                    child: GestureDetector(
                      onTap: () {
                        if (!AuthService.instance.isLoggedIn) {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => LoginPage(
                                onLoginSuccess: () =>
                                    wishlist.toggle(_asProduct),
                              ),
                            ),
                          );
                          return;
                        }
                        wishlist.toggle(_asProduct);
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
                          color:
                              wished ? MimooColors.flash : MimooColors.outline,
                        ),
                      ),
                    ),
                  ),
                ],
              ),

              // ── Info ───────────────────────────────────────────────────
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(8, 6, 8, 8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Badge
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 5, vertical: 2),
                        decoration: BoxDecoration(
                          color: MimooColors.surfaceChip,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.verified,
                                size: 9, color: MimooColors.secondary),
                            const SizedBox(width: 2),
                            Text(widget.product.badge,
                                style: GoogleFonts.plusJakartaSans(
                                    fontSize: 8,
                                    fontWeight: FontWeight.w700,
                                    color: MimooColors.secondary)),
                          ],
                        ),
                      ),
                      const SizedBox(height: 4),
                      // Name
                      Text(widget.product.name,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.plusJakartaSans(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: MimooColors.onSurface,
                              height: 1.3)),
                      const SizedBox(height: 4),
                      // Rating hidden — sample card, no real reviews.
                      const SizedBox(height: 8),
                      // Price + add button
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                  '\$${widget.product.price.toStringAsFixed(2)}',
                                  style: GoogleFonts.plusJakartaSans(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w800,
                                      color: MimooColors.primaryContainer,
                                      letterSpacing: -0.3)),
                              Text(
                                  '\$${widget.product.originalPrice.toStringAsFixed(0)}',
                                  style: GoogleFonts.plusJakartaSans(
                                      fontSize: 10,
                                      color: MimooColors.outline,
                                      decoration: TextDecoration.lineThrough)),
                            ],
                          ),
                          GestureDetector(
                            onTap: () => _handleAdd(context),
                            child: Container(
                              width: 28,
                              height: 28,
                              decoration: const BoxDecoration(
                                color: MimooColors.primaryContainer,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.add,
                                  size: 16, color: Colors.white),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      // Shipping
                      Text(widget.product.shipping,
                          style: GoogleFonts.plusJakartaSans(
                              fontSize: 9,
                              fontWeight: FontWeight.w600,
                              color: MimooColors.secondary)),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ), // closes ClipRRect (child of GestureDetector)
    ); // closes GestureDetector return
  }
}

// ── Real-product card (used by the API-backed recommended grid) ───────────────

class _ApiProductCard extends StatelessWidget {
  const _ApiProductCard({
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
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Container(
          decoration: BoxDecoration(
            color: MimooColors.surfaceCard,
            borderRadius: BorderRadius.circular(12),
            boxShadow: const [
              BoxShadow(
                  color: Color(0x0D34175B),
                  blurRadius: 8,
                  offset: Offset(0, 2)),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Image ─────────────────────────────────────────────────
              Stack(
                children: [
                  ClipRRect(
                    borderRadius:
                        const BorderRadius.vertical(top: Radius.circular(12)),
                    child: AspectRatio(
                      aspectRatio: 1.1,
                      child: hasImage
                          ? Image.network(
                              product.imageUrl,
                              fit: BoxFit.cover,
                              headers: const {'Accept': 'image/*'},
                              errorBuilder: (_, __, ___) => Container(
                                color: MimooColors.surfaceChip,
                                child: const Icon(
                                    Icons.image_not_supported_outlined,
                                    size: 32,
                                    color: MimooColors.outline),
                              ),
                            )
                          : Container(
                              color: MimooColors.surfaceChip,
                              child: const Icon(Icons.storefront_outlined,
                                  size: 32, color: MimooColors.outline),
                            ),
                    ),
                  ),
                  // Sale badge
                  if (product.isOnSale)
                    Positioned(
                      top: 6,
                      left: 6,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: MimooColors.flash,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text('SALE',
                            style: GoogleFonts.plusJakartaSans(
                                fontSize: 8,
                                fontWeight: FontWeight.w800,
                                color: Colors.white)),
                      ),
                    ),
                  // Heart
                  Positioned(
                    top: 6,
                    right: 6,
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
                          color:
                              wished ? MimooColors.flash : MimooColors.outline,
                        ),
                      ),
                    ),
                  ),
                ],
              ),

              // ── Info ──────────────────────────────────────────────────
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(8, 6, 8, 8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Seller badge
                      if (product.sellerName != null)
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 5, vertical: 2),
                          decoration: BoxDecoration(
                            color: MimooColors.surfaceChip,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.storefront_outlined,
                                  size: 9, color: MimooColors.secondary),
                              const SizedBox(width: 2),
                              Flexible(
                                child: Text(product.sellerName!,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: GoogleFonts.plusJakartaSans(
                                        fontSize: 8,
                                        fontWeight: FontWeight.w700,
                                        color: MimooColors.secondary)),
                              ),
                            ],
                          ),
                        ),
                      const SizedBox(height: 4),
                      // Name
                      Text(product.name,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.plusJakartaSans(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: MimooColors.onSurface,
                              height: 1.3)),
                      // Real rating (hidden when there are no reviews)
                      if (product.reviewCount > 0)
                        Padding(
                          padding: const EdgeInsets.only(top: 3),
                          child: Row(children: [
                            const Icon(Icons.star_rounded,
                                size: 11, color: MimooColors.starColor),
                            const SizedBox(width: 2),
                            Text(
                                '${product.rating.toStringAsFixed(1)} (${product.reviewCount})',
                                style: GoogleFonts.plusJakartaSans(
                                    fontSize: 9,
                                    color: MimooColors.onSurfaceVariant)),
                          ]),
                        ),
                      const Spacer(),
                      // Price
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '₱${product.effectivePrice.toStringAsFixed(0)}',
                                style: GoogleFonts.plusJakartaSans(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w800,
                                    color: MimooColors.primaryContainer,
                                    letterSpacing: -0.3),
                              ),
                              if (product.isOnSale)
                                Text(
                                  '₱${product.price.toStringAsFixed(0)}',
                                  style: GoogleFonts.plusJakartaSans(
                                      fontSize: 10,
                                      color: MimooColors.outline,
                                      decoration: TextDecoration.lineThrough),
                                ),
                            ],
                          ),
                          GestureDetector(
                            onTap: onAddToCart,
                            child: Container(
                              width: 28,
                              height: 28,
                              decoration: const BoxDecoration(
                                color: MimooColors.primaryContainer,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.add,
                                  size: 16, color: Colors.white),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      // Stock status
                      Text(
                        product.isInStock
                            ? (product.stockStatus.isNotEmpty
                                ? product.stockStatus
                                : 'In stock')
                            : 'Out of stock',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 9,
                          fontWeight: FontWeight.w600,
                          color: product.isInStock
                              ? MimooColors.secondary
                              : MimooColors.flash,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Skeleton placeholder (shown while loading) ────────────────────────────────

class _ProductSkeleton extends StatelessWidget {
  const _ProductSkeleton({required this.index});
  final int index;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: Container(
        color: MimooColors.surfaceCard,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AspectRatio(
              aspectRatio: 1.1,
              child: Container(color: MimooColors.surfaceChip),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(8, 8, 8, 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                        height: 8,
                        width: 60,
                        decoration: BoxDecoration(
                            color: MimooColors.outlineVariant,
                            borderRadius: BorderRadius.circular(4))),
                    const SizedBox(height: 6),
                    Container(
                        height: 10,
                        width: double.infinity,
                        decoration: BoxDecoration(
                            color: MimooColors.outlineVariant,
                            borderRadius: BorderRadius.circular(4))),
                    const SizedBox(height: 4),
                    Container(
                        height: 10,
                        width: 80,
                        decoration: BoxDecoration(
                            color: MimooColors.outlineVariant,
                            borderRadius: BorderRadius.circular(4))),
                    const Spacer(),
                    Container(
                        height: 14,
                        width: 70,
                        decoration: BoxDecoration(
                            color: MimooColors.outlineVariant,
                            borderRadius: BorderRadius.circular(4))),
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
