import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../models/product.dart';
import '../../services/product_repository.dart';
import '../../services/api_service.dart';
import '../../state/cart_provider.dart';
import '../../state/wishlist_provider.dart';
import '../home/product_detail_page.dart';
import '../../utils/animations.dart';
import '../../theme/app_theme.dart';

// ── Color tokens ──────────────────────────────────────────────────────────────
const _kPrimary = AppColors.primary;
const _kSecondary = AppColors.accent;
const _kSurface = AppColors.surface;
const _kCard = AppColors.card;
const _kChip = AppColors.chip;
const _kBorder = AppColors.border;
const _kText = AppColors.text;
const _kSubtext = AppColors.textMuted;

TextStyle _pjs({
  double size = 14,
  FontWeight weight = FontWeight.w400,
  Color color = _kText,
  double? height,
}) =>
    GoogleFonts.plusJakartaSans(
        fontSize: size, fontWeight: weight, color: color, height: height);

// ── Recent / suggested searches ───────────────────────────────────────────────
const _recents = [
  'hoodie purple',
  'wireless earbuds',
  'tote bag cream',
  'sneakers',
];
const _trending = [
  'Acid-Wash Hoodie',
  'ANC Headphones',
  'Canvas Tote',
  'Nordic Lamp',
  'Running Shoes',
  'Smart Watch',
];

class SearchPage extends StatefulWidget {
  const SearchPage({super.key, this.initialQuery = ''});
  final String initialQuery;

  @override
  State<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends State<SearchPage> {
  late final TextEditingController _ctrl;
  late final FocusNode _focus;
  String _query = '';
  List<Product> _results = [];
  bool _loading = false;
  String? _error;
  Timer? _debounce;

  @override
  void initState() {
    super.initState();
    _ctrl = TextEditingController(text: widget.initialQuery);
    _focus = FocusNode();
    if (widget.initialQuery.isNotEmpty) {
      _search(widget.initialQuery);
    } else {
      WidgetsBinding.instance
          .addPostFrameCallback((_) => _focus.requestFocus());
    }
  }

  @override
  void dispose() {
    _ctrl.dispose();
    _focus.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  void _search(String q) {
    final query = q.trim();
    _debounce?.cancel();
    if (query.isEmpty) {
      setState(() {
        _query = '';
        _results = [];
        _loading = false;
        _error = null;
      });
      return;
    }
    setState(() {
      _query = query;
      _loading = true;
      _error = null;
    });
    _debounce = Timer(const Duration(milliseconds: 400), () async {
      try {
        final page = await ProductRepository.instance.fetchProducts(
          search: query,
          perPage: 30,
        );
        if (!mounted) return;
        setState(() {
          _results = page.products;
          _loading = false;
        });
      } catch (e) {
        if (!mounted) return;
        setState(() {
          _loading = false;
          _error = ApiService.friendlyError(e);
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _kSurface,
      appBar: _buildAppBar(),
      body: _query.isEmpty ? _buildSuggestions() : _buildResults(),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return PreferredSize(
      preferredSize: const Size.fromHeight(64),
      child: Container(
        color: _kPrimary,
        padding: const EdgeInsets.fromLTRB(8, 0, 12, 8),
        child: SafeArea(
          bottom: false,
          child: Row(
            children: [
              IconButton(
                icon: const Icon(Icons.arrow_back, color: Colors.white),
                onPressed: () => Navigator.pop(context),
              ),
              Expanded(
                child: Container(
                  height: 40,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(9999),
                  ),
                  child: Row(
                    children: [
                      const SizedBox(width: 12),
                      const Icon(Icons.search, size: 16, color: _kSubtext),
                      const SizedBox(width: 8),
                      Expanded(
                        child: TextField(
                          controller: _ctrl,
                          focusNode: _focus,
                          textInputAction: TextInputAction.search,
                          style: _pjs(size: 13),
                          decoration: InputDecoration(
                            hintText: 'Search products, brands...',
                            hintStyle: _pjs(size: 13, color: _kSubtext),
                            border: InputBorder.none,
                            isDense: true,
                            contentPadding: EdgeInsets.zero,
                          ),
                          onChanged: _search,
                          onSubmitted: _search,
                        ),
                      ),
                      if (_ctrl.text.isNotEmpty)
                        GestureDetector(
                          onTap: () {
                            _ctrl.clear();
                            _search('');
                            _focus.requestFocus();
                          },
                          child: const Padding(
                            padding: EdgeInsets.symmetric(horizontal: 10),
                            child:
                                Icon(Icons.close, size: 16, color: _kSubtext),
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

  Widget _buildSuggestions() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        if (_recents.isNotEmpty) ...[
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Recent searches',
                  style: _pjs(size: 13, weight: FontWeight.w700)),
              GestureDetector(
                onTap: () {},
                child: Text('Clear', style: _pjs(size: 12, color: _kSecondary)),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _recents
                .map((r) => GestureDetector(
                      onTap: () {
                        _ctrl.text = r;
                        _search(r);
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 7),
                        decoration: BoxDecoration(
                          color: _kChip,
                          borderRadius: BorderRadius.circular(9999),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.history,
                                size: 14, color: _kSubtext),
                            const SizedBox(width: 6),
                            Text(r, style: _pjs(size: 12, color: _kText)),
                          ],
                        ),
                      ),
                    ))
                .toList(),
          ),
          const SizedBox(height: 20),
        ],
        Text('Trending now', style: _pjs(size: 13, weight: FontWeight.w700)),
        const SizedBox(height: 10),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: _trending
              .map((t) => GestureDetector(
                    onTap: () {
                      _ctrl.text = t;
                      _search(t);
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 7),
                      decoration: BoxDecoration(
                        color: _kSurface,
                        borderRadius: BorderRadius.circular(9999),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.trending_up,
                              size: 14, color: _kSecondary),
                          const SizedBox(width: 6),
                          Text(t, style: _pjs(size: 12)),
                        ],
                      ),
                    ),
                  ))
              .toList(),
        ),
      ],
    );
  }

  Widget _buildResults() {
    if (_loading) {
      return const Center(
          child: SizedBox(
              width: 24,
              height: 24,
              child: CircularProgressIndicator(strokeWidth: 2)));
    }
    if (_error != null) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.wifi_off_outlined, size: 48, color: _kBorder),
            const SizedBox(height: 12),
            Text(_error!,
                textAlign: TextAlign.center,
                style: _pjs(size: 13, color: _kSubtext)),
            const SizedBox(height: 12),
            FilledButton.tonal(
              onPressed: () => _search(_ctrl.text),
              child:
                  Text('Retry', style: _pjs(size: 13, weight: FontWeight.w700)),
            ),
          ],
        ),
      );
    }
    if (_results.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.search_off_outlined, size: 56, color: _kBorder),
            const SizedBox(height: 12),
            Text('No results for "$_query"',
                style:
                    _pjs(size: 15, weight: FontWeight.w700, color: _kSubtext)),
            const SizedBox(height: 6),
            Text('Try different keywords or browse categories.',
                style: _pjs(size: 12, color: _kSubtext)),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
          child: Text('${_results.length} results for "$_query"',
              style: _pjs(size: 12, color: _kSubtext)),
        ),
        Expanded(
          child: GridView.builder(
            padding: const EdgeInsets.fromLTRB(12, 4, 12, 24),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              childAspectRatio: 0.62,
            ),
            itemCount: _results.length,
            itemBuilder: (ctx, i) => StaggeredItem(
              index: i,
              child: _SearchProductCard(product: _results[i]),
            ),
          ),
        ),
      ],
    );
  }
}

// ── Product card for search results ─────────────────────────────────────────
class _SearchProductCard extends StatelessWidget {
  const _SearchProductCard({required this.product});
  final Product product;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MimooPageRoute(
          builder: (_) => CartProvider(
            cart: CartProvider.of(context),
            child: WishlistProvider(
              wishlist: WishlistProvider.of(context),
              child: ProductDetailPage(product: product),
            ),
          ),
        ),
      ),
      child: Container(
        decoration: BoxDecoration(
          color: _kCard,
          borderRadius: BorderRadius.circular(12),
          boxShadow: const [
            BoxShadow(
                color: Color(0x0A34175B), blurRadius: 6, offset: Offset(0, 2)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image
            ClipRRect(
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(12)),
              child: AspectRatio(
                aspectRatio: 1,
                child: product.imageUrl.isNotEmpty
                    ? Image.network(
                        product.imageUrl,
                        fit: BoxFit.cover,
                        headers: const {'Accept': 'image/*'},
                        errorBuilder: (_, __, ___) => Container(color: _kChip),
                      )
                    : Container(color: _kChip),
              ),
            ),
            // Info
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 6, 8, 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(product.name,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style:
                          _pjs(size: 11, weight: FontWeight.w600, height: 1.3)),
                  const SizedBox(height: 4),
                  Text('₱${product.price.toStringAsFixed(0)}',
                      style: _pjs(
                          size: 14, weight: FontWeight.w800, color: _kPrimary)),
                  const SizedBox(height: 2),
                  if (product.reviewCount > 0) ...[
                    Row(
                      children: [
                        Icon(Icons.star_rounded,
                            size: 12, color: AppColors.accentLight),
                        const SizedBox(width: 2),
                        Text(product.rating.toStringAsFixed(1),
                            style: _pjs(size: 10, color: _kSubtext)),
                        const SizedBox(width: 4),
                        Text('(${product.reviewCount})',
                            style: _pjs(size: 10, color: _kSubtext)),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
