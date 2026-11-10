import 'dart:async';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'auth/login_page.dart';
import 'auth/register_page.dart';
import '../models/product.dart';
import '../../services/product_repository.dart';
import 'home/product_detail_page.dart';
import '../state/cart_provider.dart';
import '../state/wishlist_provider.dart';
import '../utils/animations.dart';
import '../widgets/motion.dart';
import '../theme/app_theme.dart';

// ─────────────────────────────────────────────────────────────────────────────
// Shared color tokens (duplicated here so landing_page is self-contained)
// ─────────────────────────────────────────────────────────────────────────────
class _C {
  static const primaryContainer = AppColors.primary;
  static const secondary = AppColors.accent;
  static const secondaryBright = AppColors.accentLight;
  static const flash = AppColors.flash;
  static const surface = AppColors.background;
  static const card = AppColors.card;
  static const chip = AppColors.chip;
  static const onSurface = AppColors.onSurface;
  static const onVariant = AppColors.onSurfaceVariant;
  static const outline = AppColors.outline;
  static const outlineVariant = AppColors.outlineVariant;
  // star color removed — sample cards no longer show fake ratings.
}

// ─────────────────────────────────────────────────────────────────────────────
// Data models
// ─────────────────────────────────────────────────────────────────────────────
class _Banner {
  const _Banner({
    required this.tag,
    required this.title,
    required this.subtitle,
    required this.cta,
    required this.ctaIcon,
    required this.imageUrl,
    required this.gradient,
  });
  final String tag, title, subtitle, cta;
  final IconData ctaIcon;
  final String imageUrl;
  final List<Color> gradient;
}

class _Flash {
  const _Flash({
    required this.name,
    required this.price,
    required this.original,
    required this.discount,
    required this.claimed,
    required this.imageUrl,
  });
  final String name, imageUrl;
  final double price, original;
  final int discount, claimed;
}

class _Rec {
  const _Rec({
    required this.name,
    required this.price,
    required this.original,
    required this.rating,
    required this.reviews,
    required this.badge,
    required this.shipping,
    required this.imageUrl,
  });
  final String name, reviews, badge, shipping, imageUrl;
  final double price, original, rating;

  Product get asProduct => Product(
        id: name.hashCode.abs(),
        name: name,
        price: price,
        imageUrl: imageUrl,
        category: badge,
        rating: rating,
      );
}

class _Cat {
  const _Cat({required this.icon, required this.label});
  final IconData icon;
  final String label;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero banner slides — 3 real images from assets/images/
// NOTE: banner_hero_1.png is 821.5 KB — larger than ideal but kept as-is
// per task instructions (do not modify originals >300 KB).
// ─────────────────────────────────────────────────────────────────────────────
const _heroSlides = <_HeroSlide>[
  _HeroSlide(asset: 'assets/images/banner_hero_1.png'),
  _HeroSlide(asset: 'assets/images/banner_hero_2.jpg'),
  _HeroSlide(asset: 'assets/images/banner_hero_3.jpg'),
];

class _HeroSlide {
  const _HeroSlide({this.asset});
  final String? asset;
}

// ─────────────────────────────────────────────────────────────────────────────
// Old fake banner data (hidden — kept for reference)
// ─────────────────────────────────────────────────────────────────────────────
// ignore: unused_element
const _banners = [
  // _Banner(tag: '✨ New Drop', ...picsum...),
  // _Banner(tag: '🔥 Super Payday Sale', ...picsum...),
  // _Banner(tag: '⚡ Flash Tech', ...picsum...),
];

// ignore: unused_element
const _flashItems = [
  _Flash(
      name: 'ANC Wireless Headphones',
      price: 49.99,
      original: 119.00,
      discount: 58,
      claimed: 82,
      imageUrl: 'https://picsum.photos/seed/headphones/300/300'),
  _Flash(
      name: 'Galaxy Ultra 5G',
      price: 699.00,
      original: 899.00,
      discount: 22,
      claimed: 65,
      imageUrl: 'https://picsum.photos/seed/phone/300/300'),
  _Flash(
      name: 'Ceramic Desk Lamp',
      price: 24.50,
      original: 48.00,
      discount: 49,
      claimed: 91,
      imageUrl: 'https://picsum.photos/seed/lamp/300/300'),
  _Flash(
      name: 'Everyday Vegan Tote',
      price: 32.00,
      original: 65.00,
      discount: 50,
      claimed: 74,
      imageUrl: 'https://picsum.photos/seed/tote/300/300'),
];

// ignore: unused_element
const _recItems = [
  _Rec(
      name: 'Pulse Pro AMOLED Smartwatch with Heart Rate & GPS',
      price: 78.00,
      original: 110.00,
      rating: 4.9,
      reviews: '1.4k',
      badge: 'Trusted Seller',
      shipping: 'Free Shipping',
      imageUrl: 'https://picsum.photos/seed/watch2/300/300'),
  _Rec(
      name: 'Breeze Pure French Linen Vacation Resort Shirt',
      price: 39.50,
      original: 55.00,
      rating: 4.8,
      reviews: '890',
      badge: 'Local Maker',
      shipping: 'Free Shipping',
      imageUrl: 'https://picsum.photos/seed/shirt/300/300'),
  _Rec(
      name: 'Indoor Calathea & Fluted Rib Ceramic Planter Set',
      price: 18.90,
      original: 28.00,
      rating: 4.9,
      reviews: '630',
      badge: 'Trusted Seller',
      shipping: 'Next-Day Delivery',
      imageUrl: 'https://picsum.photos/seed/plant/300/300'),
  _Rec(
      name: 'Aura 360° Waterproof Portable Bass Speaker',
      price: 54.00,
      original: 79.00,
      rating: 4.9,
      reviews: '2.1k',
      badge: 'Official Store',
      shipping: 'Free Shipping',
      imageUrl: 'https://picsum.photos/seed/speaker/300/300'),
  _Rec(
      name: 'Cloud Velvet Long-Wear Tint Trio Set',
      price: 22.00,
      original: 35.00,
      rating: 4.7,
      reviews: '3.4k',
      badge: 'Best Seller',
      shipping: 'Gift Included',
      imageUrl: 'https://picsum.photos/seed/makeup/300/300'),
  _Rec(
      name: 'Slim RFID-Blocking Full Grain Cardholder',
      price: 27.00,
      original: 42.00,
      rating: 4.9,
      reviews: '512',
      badge: 'Trusted Seller',
      shipping: 'Free Shipping',
      imageUrl: 'https://picsum.photos/seed/wallet/300/300'),
];

const _cats = [
  _Cat(icon: Icons.star_outline_rounded, label: 'All'),
  _Cat(icon: Icons.pets_outlined, label: 'Pet Supplies'),
  _Cat(icon: Icons.devices_outlined, label: 'Electronics'),
  _Cat(icon: Icons.woman_outlined, label: "Women's"),
  _Cat(icon: Icons.man_outlined, label: "Men's"),
  _Cat(icon: Icons.child_friendly_outlined, label: 'Kids & Baby'),
  _Cat(icon: Icons.yard_outlined, label: 'Home & Garden'),
  _Cat(icon: Icons.directions_run_outlined, label: 'Sports'),
  _Cat(icon: Icons.health_and_safety_outlined, label: 'Health'),
  _Cat(icon: Icons.menu_book_outlined, label: 'Books'),
  _Cat(icon: Icons.restaurant_outlined, label: 'Food'),
  _Cat(icon: Icons.chair_outlined, label: 'Furniture'),
  _Cat(icon: Icons.diamond_outlined, label: 'Jewelry'),
];

// ─────────────────────────────────────────────────────────────────────────────
// Landing Page
// ─────────────────────────────────────────────────────────────────────────────
class LandingPage extends StatefulWidget {
  const LandingPage({super.key});

  @override
  State<LandingPage> createState() => _LandingPageState();
}

class _LandingPageState extends State<LandingPage> {
  final _searchCtrl = TextEditingController();
  late PageController _bannerPageCtrl;
  // ignore: prefer_final_fields
  int _bannerIdx = 0;
  Timer? _bannerTimer;

  // ── Recommended products from API ─────────────────────────────────────────
  List<Product> _recommended = [];
  bool _recLoading = true;
  String? _recError;

  @override
  void initState() {
    super.initState();
    _bannerPageCtrl = PageController(viewportFraction: 1.0);
    _startAutoScroll();
    _loadRecommended();
  }

  Future<void> _loadRecommended() async {
    try {
      final page = await ProductRepository.instance.fetchProducts(
        page: 1,
        perPage: 6,
        sort: 'newest',
      );
      if (!mounted) return;
      setState(() {
        _recommended = page.products;
        _recLoading = false;
        _recError = null;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _recLoading = false;
        _recError = 'Could not load products. Tap to retry.';
      });
    }
  }

  void _startAutoScroll() {
    _bannerTimer?.cancel();
    _bannerTimer = Timer.periodic(const Duration(seconds: 5), (_) {
      if (!mounted || !_bannerPageCtrl.hasClients) return;
      final next = (_bannerIdx + 1) % _heroSlides.length;
      // Update index immediately so dots reflect the new slide right away.
      setState(() => _bannerIdx = next);
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
    _searchCtrl.dispose();
    _bannerPageCtrl.dispose();
    super.dispose();
  }

  // Shows modal bottom sheet prompting login/signup for gated actions
  void _showAuthPrompt(BuildContext context, String action) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => _AuthPromptSheet(action: action),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _C.surface,
      body: SafeArea(
        bottom: false,
        child: CustomScrollView(
          slivers: [
            // ── Guest Header (search + Log In + Sign Up) ──────────────────
            SliverToBoxAdapter(child: _buildGuestHeader()),

            // ── Hero Banner (hidden — no CMS/banners table yet) ──────────
            SliverToBoxAdapter(child: _buildBannerSection()),

            // ── Categories ────────────────────────────────────────────────
            SliverToBoxAdapter(child: _buildCategories()),

            // ── Quick Chips (hidden — fake tags) ─────────────────────────
            SliverToBoxAdapter(child: _buildQuickChips()),

            // ── Flash Sale (hidden — no sale_end_date, fake products) ─────
            SliverToBoxAdapter(child: _buildFlashSale()),

            // ── Recommended ───────────────────────────────────────────────
            SliverToBoxAdapter(child: _buildRecommendedHeader()),
            _buildRecommendedGrid(),

            // ── Footer ────────────────────────────────────────────────────
            const SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.symmetric(vertical: 24),
                child: Center(
                  child: Text(
                    'Loading more discovery gems...',
                    style: TextStyle(color: _C.onVariant, fontSize: 12),
                  ),
                ),
              ),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 32)),
          ],
        ),
      ),
    );
  }

  // ── Guest Header (ONE search bar + Log In + Sign Up + Avatar) ─────────────

  Widget _buildGuestHeader() {
    return Container(
      color: _C.surface,
      padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
      child: Row(
        children: [
          // ── Functional search bar ──────────────────────────────────────
          Expanded(
            child: Container(
              height: 42,
              decoration: BoxDecoration(
                color: _C.chip,
                borderRadius: BorderRadius.circular(9999),
              ),
              child: Row(
                children: [
                  const SizedBox(width: 12),
                  const Icon(Icons.search, size: 16, color: _C.outline),
                  const SizedBox(width: 6),
                  Expanded(
                    child: TextField(
                      controller: _searchCtrl,
                      style: GoogleFonts.plusJakartaSans(
                          fontSize: 13, color: _C.onSurface),
                      decoration: InputDecoration(
                        hintText: 'Search mimoo catalog & deals...',
                        hintStyle: GoogleFonts.plusJakartaSans(
                            fontSize: 12, color: _C.outline),
                        border: InputBorder.none,
                        isDense: true,
                        contentPadding: EdgeInsets.zero,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                ],
              ),
            ),
          ),
          const SizedBox(width: 10),

          // ── Log In ─────────────────────────────────────────────────────
          GestureDetector(
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const LoginPage()),
            ),
            child: Text(
              'Log In',
              style: GoogleFonts.plusJakartaSans(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: _C.secondary),
            ),
          ),
          const SizedBox(width: 10),

          // ── Sign Up pill ───────────────────────────────────────────────
          GestureDetector(
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const RegisterPage()),
            ),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: _C.primaryContainer,
                borderRadius: BorderRadius.circular(9999),
              ),
              child: Text(
                'Sign Up',
                style: GoogleFonts.plusJakartaSans(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: Colors.white),
              ),
            ),
          ),
          const SizedBox(width: 8),

          // ── Avatar ─────────────────────────────────────────────────────
          Container(
            width: 36,
            height: 36,
            decoration: const BoxDecoration(
              color: _C.primaryContainer,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.person, color: Colors.white, size: 18),
          ),
        ],
      ),
    );
  }

  // ── Hero Banner (pure images, 3 slides, mouse-draggable on Chrome) ──────────

  Widget _buildBannerSection() {
    return Column(
      children: [
        SizedBox(
          height: 210,
          // ScrollConfiguration: enable mouse drag on Flutter Web.
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
              onPageChanged: (i) => setState(() => _bannerIdx = i),
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
                        color: _C.chip,
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
            final isActive = i == _bannerIdx;
            return AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              margin: const EdgeInsets.symmetric(horizontal: 3),
              width: isActive ? 24 : 8,
              height: 4,
              decoration: BoxDecoration(
                color: isActive ? _C.primaryContainer : _C.outlineVariant,
                borderRadius: BorderRadius.circular(9999),
              ),
            );
          }),
        ),
      ],
    );
  }

  // ── Categories ───────────────────────────────────────────────────────────────

  Widget _buildCategories() {
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
                      color: _C.onSurface)),
              Text('See all',
                  style: GoogleFonts.plusJakartaSans(
                      fontSize: 13,
                      color: _C.secondary,
                      fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 38,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _cats.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (_, i) => _CatChip(
                cat: _cats[i],
                isSelected: i == 0,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Quick Chips (hidden — all 4 have fake tags) ──────────────────────────────

  Widget _buildQuickChips() {
    return const SizedBox.shrink();
  }

  // ── Flash Sale (hidden — no sale_end_date, fake products) ──────────────────────

  Widget _buildFlashSale() {
    return const SizedBox.shrink();
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
                  color: _C.onSurface)),
          Row(
            children: [
              Text('Popular',
                  style: GoogleFonts.plusJakartaSans(
                      fontSize: 12,
                      color: _C.secondary,
                      fontWeight: FontWeight.w600)),
              const SizedBox(width: 4),
              const Icon(Icons.tune, size: 14, color: _C.secondary),
            ],
          ),
        ],
      ),
    );
  }

  // ── Recommended Grid (live from API) ────────────────────────────────────────

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
            (_, i) => Container(
              decoration: BoxDecoration(
                color: _C.chip,
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            childCount: 4,
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
              const Icon(Icons.wifi_off_outlined, size: 40, color: _C.outline),
              const SizedBox(height: 10),
              Text(_recError!,
                  textAlign: TextAlign.center,
                  style: GoogleFonts.plusJakartaSans(
                      fontSize: 13, color: _C.onVariant)),
              const SizedBox(height: 12),
              FilledButton.tonal(
                onPressed: _loadRecommended,
                child: Text('Retry',
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
                  size: 40, color: _C.outline),
              const SizedBox(height: 10),
              Text('No products available yet.',
                  style: GoogleFonts.plusJakartaSans(
                      fontSize: 13, color: _C.onVariant)),
            ],
          ),
        ),
      );
    }

    // Product grid — real data from API
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
            final product = _recommended[i];
            // Fade/slide in once per product + subtle press effect.
            return StaggeredItem(
              index: i,
              id: 'landing-${product.id}',
              child: PressScale(
                child: _LandingProductCard(
                  product: product,
                  onAddToCart: () => _showAuthPrompt(ctx, 'add items to cart'),
                  onWishlist: () {
                    final wishlist = WishlistProvider.of(ctx);
                    wishlist.toggle(product);
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
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth Prompt Bottom Sheet
// ─────────────────────────────────────────────────────────────────────────────
class _AuthPromptSheet extends StatelessWidget {
  const _AuthPromptSheet({required this.action});
  final String action;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(12, 0, 12, 24),
      decoration: BoxDecoration(
        color: _C.card,
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [
          BoxShadow(
              color: AppColors.primaryA12, blurRadius: 24, offset: Offset(0, -4)),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(24, 28, 24, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Handle
            Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.only(bottom: 20),
              decoration: BoxDecoration(
                color: _C.outlineVariant,
                borderRadius: BorderRadius.circular(9999),
              ),
            ),
            // Icon
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                color: _C.chip,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.lock_outline,
                  color: _C.secondaryBright, size: 28),
            ),
            const SizedBox(height: 16),
            Text(
              'Sign in to continue',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: _C.onSurface,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'You need an account to $action.\nJoin mimoo — it\'s free!',
              textAlign: TextAlign.center,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 13,
                color: _C.onVariant,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 24),
            // Log In button
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const LoginPage()),
                  );
                },
                style: FilledButton.styleFrom(
                  backgroundColor: _C.primaryContainer,
                  minimumSize: const Size.fromHeight(48),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(9999)),
                ),
                child: Text('Log In',
                    style: GoogleFonts.plusJakartaSans(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: Colors.white)),
              ),
            ),
            const SizedBox(height: 10),
            // Sign Up button
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const RegisterPage()),
                  );
                },
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size.fromHeight(48),
                  side: const BorderSide(color: _C.secondaryBright, width: 1.5),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(9999)),
                ),
                child: Text('Create an Account',
                    style: GoogleFonts.plusJakartaSans(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: _C.secondaryBright)),
              ),
            ),
            const SizedBox(height: 10),
            // Continue browsing
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Continue Browsing',
                  style: GoogleFonts.plusJakartaSans(
                      fontSize: 13, color: _C.onVariant)),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Banner Card — wide rectangular, left text / right image
// ─────────────────────────────────────────────────────────────────────────────
// ignore: unused_element
class _BannerCard extends StatelessWidget {
  const _BannerCard({
    required this.banner,
    required this.index,
    required this.currentIndex,
    required this.total,
  });
  final _Banner banner;
  final int index;
  final int currentIndex;
  final int total;

  @override
  Widget build(BuildContext context) {
    final screenW = MediaQuery.of(context).size.width;

    return Container(
      height: 210,
      width: screenW,
      margin: const EdgeInsets.fromLTRB(12, 12, 12, 0),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: banner.gradient,
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
        borderRadius: BorderRadius.circular(18),
        boxShadow: const [
          BoxShadow(
              color: AppColors.primaryA12, blurRadius: 16, offset: Offset(0, 6)),
        ],
      ),
      child: Stack(
        clipBehavior: Clip.antiAlias,
        children: [
          // ── Right image panel ──────────────────────────────────────────
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
                  // subtle dark overlay on left edge of image for blending
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          banner.gradient.first,
                          Colors.transparent,
                        ],
                        begin: Alignment.centerLeft,
                        end: Alignment.centerRight,
                        stops: const [0.0, 0.45],
                      ),
                    ),
                  ),
                  // Discount badge bottom-right
                  Positioned(
                    bottom: 12,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: _C.flash,
                        borderRadius: BorderRadius.circular(9999),
                        boxShadow: const [
                          BoxShadow(
                              color: Color(0x47FF3B5C),
                              blurRadius: 8,
                              offset: Offset(0, 3)),
                        ],
                      ),
                      child: Text(
                        '-70%',
                        style: GoogleFonts.plusJakartaSans(
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                            color: Colors.white),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Left content ───────────────────────────────────────────────
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
                  // Top row: tag chip + "Up to X Off" label
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 3),
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
                                  color: _C.flash, shape: BoxShape.circle),
                            ),
                            const SizedBox(width: 4),
                            Text(
                              banner.tag.toUpperCase(),
                              style: GoogleFonts.plusJakartaSans(
                                  fontSize: 9,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                  letterSpacing: 0.5),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Big headline
                  Text(
                    banner.title,
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                      height: 1.15,
                      letterSpacing: -0.5,
                    ),
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),

                  // Subtitle
                  Text(
                    banner.subtitle,
                    style: GoogleFonts.plusJakartaSans(
                        fontSize: 11, color: Colors.white70, height: 1.4),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const Spacer(),

                  // CTA button
                  GestureDetector(
                    onTap: () {},
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 9),
                      decoration: BoxDecoration(
                        color: _C.secondary,
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
                          Text(
                            banner.cta,
                            style: GoogleFonts.plusJakartaSans(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: Colors.white),
                          ),
                          const SizedBox(width: 5),
                          Icon(banner.ctaIcon, size: 13, color: Colors.white),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Bottom: dot indicators + Verified chip ─────────────────────
          Positioned(
            bottom: 10,
            left: 16,
            child: Row(
              children: [
                // Dot indicators
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
                // Verified local stores chip
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

// ─────────────────────────────────────────────────────────────────────────────
// Category Chip
// ─────────────────────────────────────────────────────────────────────────────
class _CatChip extends StatelessWidget {
  const _CatChip({required this.cat, this.isSelected = false});
  final _Cat cat;
  final bool isSelected;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {},
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 12),
        decoration: BoxDecoration(
          color: isSelected ? _C.primaryContainer : _C.card,
          borderRadius: BorderRadius.circular(9999),
          border: Border.all(
            color: isSelected ? _C.primaryContainer : _C.outlineVariant,
            width: 1.2,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              cat.icon,
              size: 15,
              color: isSelected ? Colors.white : _C.secondary,
            ),
            const SizedBox(width: 5),
            Text(
              cat.label,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: isSelected ? Colors.white : _C.onSurface,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Quick Chip
// ─────────────────────────────────────────────────────────────────────────────
// ignore: unused_element
class _QuickChip extends StatelessWidget {
  const _QuickChip({
    required this.icon,
    required this.label,
    required this.tag,
    required this.tagColor,
  });
  final String icon, label, tag;
  final Color tagColor;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 7),
        decoration: BoxDecoration(
          color: _C.card,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: _C.outlineVariant),
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
                    color: _C.onSurface)),
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

// ─────────────────────────────────────────────────────────────────────────────
// Countdown Timer
// ─────────────────────────────────────────────────────────────────────────────
class _CountdownTimer extends StatefulWidget {
  const _CountdownTimer();

  @override
  State<_CountdownTimer> createState() => _CountdownTimerState();
}

class _CountdownTimerState extends State<_CountdownTimer> {
  // ignore: prefer_final_fields
  int _secs = 2 * 3600 + 45 * 60 + 18;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    // Flash sale countdown disabled — no sale_end_date column in DB.
    // _timer = Timer.periodic(const Duration(seconds: 1), (_) {
    //   if (mounted && _secs > 0) {
    //     setState(() => _secs--);
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
    final h = _secs ~/ 3600;
    final m = (_secs % 3600) ~/ 60;
    final s = _secs % 60;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: _C.primaryContainer,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _TB(h.toString().padLeft(2, '0')),
          _sep,
          _TB(m.toString().padLeft(2, '0')),
          _sep,
          _TB(s.toString().padLeft(2, '0')),
        ],
      ),
    );
  }

  static final _sep = Text(' : ',
      style: GoogleFonts.plusJakartaSans(
          fontSize: 11, fontWeight: FontWeight.w800, color: _C.flash));
}

class _TB extends StatelessWidget {
  const _TB(this.value);
  final String value;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
        decoration: BoxDecoration(
            color: Colors.white, borderRadius: BorderRadius.circular(3)),
        child: Text(value,
            style: GoogleFonts.plusJakartaSans(
                fontSize: 11,
                fontWeight: FontWeight.w800,
                color: _C.primaryContainer)),
      );
}

// ─────────────────────────────────────────────────────────────────────────────
// Flash Card
// ─────────────────────────────────────────────────────────────────────────────
// ignore: unused_element
class _FlashCard extends StatelessWidget {
  const _FlashCard({required this.product, required this.onAddToCart});
  final _Flash product;
  final VoidCallback onAddToCart;

  Product get _asProduct => Product(
        id: product.name.hashCode,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        category: 'Flash Sale',
        rating: 4.8,
        reviewCount: product.claimed * 10,
      );

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        final cart = CartProvider.of(context);
        final wishlist = WishlistProvider.of(context);
        Navigator.push(
          context,
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
      },
      child: Container(
        width: 130,
        decoration: BoxDecoration(
          color: _C.card,
          borderRadius: BorderRadius.circular(12),
          boxShadow: const [
            BoxShadow(
                color: AppColors.primaryA05, blurRadius: 8, offset: Offset(0, 2)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
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
                    errorBuilder: (_, __, ___) =>
                        Container(width: 130, height: 110, color: _C.chip),
                  ),
                ),
                Positioned(
                  top: 6,
                  left: 6,
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                    decoration: BoxDecoration(
                        color: _C.flash,
                        borderRadius: BorderRadius.circular(4)),
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
                          color: _C.onSurface,
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
                                color: _C.flash)),
                      ),
                      const SizedBox(width: 4),
                      Text('\$${product.original.toStringAsFixed(0)}',
                          style: GoogleFonts.plusJakartaSans(
                              fontSize: 10,
                              color: _C.outline,
                              decoration: TextDecoration.lineThrough)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(9999),
                    child: LinearProgressIndicator(
                      value: product.claimed / 100,
                      backgroundColor: _C.chip,
                      color: _C.flash,
                      minHeight: 4,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Flexible(
                        child: Text('${product.claimed}% Claimed',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.plusJakartaSans(
                                fontSize: 9,
                                color: _C.onVariant,
                                fontWeight: FontWeight.w600)),
                      ),
                      GestureDetector(
                        onTap: onAddToCart,
                        child: Container(
                          width: 22,
                          height: 22,
                          decoration: BoxDecoration(
                              color: _C.primaryContainer,
                              shape: BoxShape.circle),
                          child: const Icon(Icons.add,
                              size: 13, color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Recommended Card
// ─────────────────────────────────────────────────────────────────────────────
// ignore: unused_element
class _RecCard extends StatelessWidget {
  const _RecCard({
    required this.product,
    required this.onAddToCart,
    required this.onWishlist,
  });
  final _Rec product;
  final VoidCallback onAddToCart;
  final VoidCallback onWishlist;

  @override
  Widget build(BuildContext context) {
    final wishlist = WishlistProvider.of(context);
    final wished = wishlist.contains(product.asProduct);
    final p = Product(
      id: product.name.hashCode,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.badge,
    );

    return GestureDetector(
      onTap: () {
        final cart = CartProvider.of(context);
        final wishlist = WishlistProvider.of(context);
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => WishlistProvider(
              wishlist: wishlist,
              child: CartProvider(
                cart: cart,
                child: ProductDetailPage(product: p),
              ),
            ),
          ),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: _C.card,
          borderRadius: BorderRadius.circular(12),
          boxShadow: const [
            BoxShadow(
                color: AppColors.primaryA05, blurRadius: 8, offset: Offset(0, 2)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                ClipRRect(
                  borderRadius:
                      const BorderRadius.vertical(top: Radius.circular(12)),
                  child: AspectRatio(
                    aspectRatio: 1,
                    child: Image.network(
                      product.imageUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(color: _C.chip),
                    ),
                  ),
                ),
                Positioned(
                  top: 6,
                  right: 6,
                  child: GestureDetector(
                    onTap: onWishlist,
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
                          color: wished ? AppColors.flash : _C.outline),
                    ),
                  ),
                ),
              ],
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(8, 6, 8, 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 5, vertical: 2),
                      decoration: BoxDecoration(
                          color: _C.chip,
                          borderRadius: BorderRadius.circular(4)),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.verified,
                              size: 9, color: _C.secondary),
                          const SizedBox(width: 2),
                          Text(product.badge,
                              style: GoogleFonts.plusJakartaSans(
                                  fontSize: 8,
                                  fontWeight: FontWeight.w700,
                                  color: _C.secondary)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(product.name,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.plusJakartaSans(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: _C.onSurface,
                            height: 1.3)),
                    const SizedBox(height: 4),
                    // Rating hidden — sample card, no real reviews.
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('\$${product.price.toStringAsFixed(2)}',
                                style: GoogleFonts.plusJakartaSans(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w800,
                                    color: _C.primaryContainer,
                                    letterSpacing: -0.3)),
                            Text('\$${product.original.toStringAsFixed(0)}',
                                style: GoogleFonts.plusJakartaSans(
                                    fontSize: 10,
                                    color: _C.outline,
                                    decoration: TextDecoration.lineThrough)),
                          ],
                        ),
                        GestureDetector(
                          onTap: onAddToCart,
                          child: Container(
                            width: 28,
                            height: 28,
                            decoration: const BoxDecoration(
                                color: _C.primaryContainer,
                                shape: BoxShape.circle),
                            child: const Icon(Icons.add,
                                size: 16, color: Colors.white),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(product.shipping,
                        style: GoogleFonts.plusJakartaSans(
                            fontSize: 9,
                            fontWeight: FontWeight.w600,
                            color: _C.secondary)),
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

// ─────────────────────────────────────────────────────────────────────────────
// Landing Product Card (real API data — no fake ratings/badges/shipping)
// ─────────────────────────────────────────────────────────────────────────────
class _LandingProductCard extends StatelessWidget {
  const _LandingProductCard({
    required this.product,
    required this.onAddToCart,
    required this.onWishlist,
  });
  final Product product;
  final VoidCallback onAddToCart;
  final VoidCallback onWishlist;

  @override
  Widget build(BuildContext context) {
    final wishlist = WishlistProvider.of(context);
    final wished = wishlist.contains(product);
    final hasImage = product.imageUrl.isNotEmpty;

    return GestureDetector(
      onTap: () {
        final cart = CartProvider.of(context);
        final wl = WishlistProvider.of(context);
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => WishlistProvider(
              wishlist: wl,
              child: CartProvider(
                cart: cart,
                child: ProductDetailPage(product: product),
              ),
            ),
          ),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: _C.card,
          borderRadius: BorderRadius.circular(12),
          boxShadow: const [
            BoxShadow(
                color: AppColors.primaryA05, blurRadius: 8, offset: Offset(0, 2)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image + wishlist heart
            Stack(
              children: [
                ClipRRect(
                  borderRadius:
                      const BorderRadius.vertical(top: Radius.circular(12)),
                  child: AspectRatio(
                    aspectRatio: 1,
                    child: hasImage
                        ? Image.network(
                            product.imageUrl,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) =>
                                Container(color: _C.chip),
                          )
                        : Container(
                            color: _C.chip,
                            child: const Icon(Icons.image_outlined,
                                size: 36, color: _C.outline),
                          ),
                  ),
                ),
                Positioned(
                  top: 6,
                  right: 6,
                  child: GestureDetector(
                    onTap: onWishlist,
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
                          color: wished ? AppColors.flash : _C.outline),
                    ),
                  ),
                ),
              ],
            ),
            // Info
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(8, 6, 8, 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product.name,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.plusJakartaSans(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: _C.onSurface,
                          height: 1.3),
                    ),
                    const SizedBox(height: 4),
                    // Sale price strikethrough if on sale
                    if (product.isOnSale) ...[
                      Text(
                        '₱${product.price.toStringAsFixed(0)}',
                        style: GoogleFonts.plusJakartaSans(
                            fontSize: 10,
                            color: _C.outline,
                            decoration: TextDecoration.lineThrough),
                      ),
                    ],
                    Text(
                      '₱${product.effectivePrice.toStringAsFixed(0)}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.plusJakartaSans(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          color: _C.primaryContainer),
                    ),
                    const Spacer(),
                    // Add to cart button
                    Align(
                      alignment: Alignment.centerRight,
                      child: GestureDetector(
                        onTap: onAddToCart,
                        child: Container(
                          width: 28,
                          height: 28,
                          decoration: const BoxDecoration(
                              color: _C.primaryContainer,
                              shape: BoxShape.circle),
                          child: const Icon(Icons.add,
                              size: 16, color: Colors.white),
                        ),
                      ),
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
