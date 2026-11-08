import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../home/product_detail_page.dart';
import 'seller_store_page.dart';

// ── Design tokens ─────────────────────────────────────────────────────────────
const _kSecondary = Color(0xFF6B38D4);
const _kFlash = Color(0xFFFF3B5C);
const _kSurface = Color(0xFFF5F4FC);
const _kCard = Color(0xFFFFFFFF);
const _kChip = Color(0xFFEFE9FD);
const _kBorder = Color(0xFFDDD8F0);
const _kText = Color(0xFF1A1035);
const _kSubtext = Color(0xFF8A84A3);

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

// ═════════════════════════════════════════════════════════════════════════════
// CATEGORY PRODUCT LIST SCREEN
// ═════════════════════════════════════════════════════════════════════════════
class CategoryProductListScreen extends StatefulWidget {
  const CategoryProductListScreen({
    super.key,
    required this.seller,
    required this.categoryId,
    required this.categoryName,
  });

  final SellerInfo seller;
  final String categoryId;
  final String categoryName;

  @override
  State<CategoryProductListScreen> createState() =>
      _CategoryProductListScreenState();
}

class _CategoryProductListScreenState extends State<CategoryProductListScreen> {
  String _sortOrder = 'Popular';

  static const _sortOptions = ['Popular', 'Latest', 'Top Sales', 'Price ↕'];

  List<StoreProduct> get _products {
    if (widget.categoryId == 'all') {
      return widget.seller.products;
    }
    // Filter by category id matching badge or return all if no specific match
    final filtered = widget.seller.products
        .where((p) =>
            p.badge.toLowerCase().contains(widget.categoryId.toLowerCase()) ||
            p.id.toLowerCase().contains(widget.categoryId.toLowerCase()))
        .toList();
    return filtered.isEmpty ? widget.seller.products : filtered;
  }

  List<StoreProduct> get _sortedProducts {
    final list = List<StoreProduct>.from(_products);
    switch (_sortOrder) {
      case 'Latest':
        return list.reversed.toList();
      case 'Top Sales':
        list.sort((a, b) => b.sold.compareTo(a.sold));
        return list;
      case 'Price ↕':
        list.sort((a, b) => a.price.compareTo(b.price));
        return list;
      default: // Popular
        list.sort((a, b) => b.rating.compareTo(a.rating));
        return list;
    }
  }

  @override
  Widget build(BuildContext context) {
    final products = _sortedProducts;

    return Scaffold(
      backgroundColor: _kSurface,
      appBar: AppBar(
        backgroundColor: _kCard,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: _kText),
          onPressed: () => Navigator.pop(context),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(widget.categoryName,
                style: _pjs(size: 15, weight: FontWeight.w800)),
            Text('${products.length} products',
                style: _pjs(size: 11, color: _kSubtext)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.search, color: _kText),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.more_vert, color: _kText),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          // Sort chips row
          Container(
            color: _kCard,
            padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
            child: Row(
              children: _sortOptions.map((opt) {
                final selected = opt == _sortOrder;
                return Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _sortOrder = opt),
                    child: Column(
                      children: [
                        Text(
                          opt,
                          style: _pjs(
                            size: 12,
                            weight:
                                selected ? FontWeight.w700 : FontWeight.w400,
                            color: selected ? _kSecondary : _kSubtext,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 4),
                        if (selected)
                          Container(
                            width: 6,
                            height: 6,
                            decoration: const BoxDecoration(
                              color: _kSecondary,
                              shape: BoxShape.circle,
                            ),
                          )
                        else
                          const SizedBox(height: 6),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          const Divider(height: 1, color: _kBorder),
          // Product grid
          Expanded(
            child: products.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.inventory_2_outlined,
                            size: 48, color: _kSubtext),
                        const SizedBox(height: 12),
                        Text('No products in this category',
                            style: _pjs(size: 14, color: _kSubtext)),
                      ],
                    ),
                  )
                : GridView.builder(
                    padding: const EdgeInsets.all(12),
                    itemCount: products.length,
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 10,
                      mainAxisSpacing: 10,
                      childAspectRatio: 0.68,
                    ),
                    itemBuilder: (ctx, i) =>
                        _CategoryProductCard(product: products[i]),
                  ),
          ),
        ],
      ),
    );
  }
}

// ── Category product card ─────────────────────────────────────────────────────
class _CategoryProductCard extends StatelessWidget {
  const _CategoryProductCard({required this.product});
  final StoreProduct product;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) =>
              ProductDetailPage(product: storeProductToProduct(product)),
        ),
      ),
      child: Container(
        decoration: BoxDecoration(
          color: _kCard,
          borderRadius: BorderRadius.circular(12),
          boxShadow: const [
            BoxShadow(
                color: Color(0x0D34175B), blurRadius: 6, offset: Offset(0, 2)),
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
                  child: AspectRatio(
                    aspectRatio: 1,
                    child: Image.network(
                      'https://picsum.photos/seed/${product.imageSeed}/300/300',
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        color: _kChip,
                        child: const Icon(Icons.image_outlined,
                            size: 36, color: _kSubtext),
                      ),
                    ),
                  ),
                ),
                if (product.discount > 0)
                  Positioned(
                    top: 6,
                    left: 6,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 5, vertical: 2),
                      decoration: BoxDecoration(
                        color: _kFlash,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text('-${product.discount}%',
                          style: _pjs(
                              size: 9,
                              weight: FontWeight.w800,
                              color: Colors.white)),
                    ),
                  ),
                Positioned(
                  top: 6,
                  right: 6,
                  child: Container(
                    width: 26,
                    height: 26,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.9),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.favorite_border,
                        size: 14, color: _kFlash),
                  ),
                ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 6, 8, 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(product.name,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style:
                          _pjs(size: 12, weight: FontWeight.w600, height: 1.3)),
                  const SizedBox(height: 4),
                  // Rating hidden — StoreProduct has no real review data.
                  const SizedBox(height: 4),
                  Text('₱${product.price.toStringAsFixed(0)}',
                      style: _pjs(
                          size: 14, weight: FontWeight.w800, color: _kText)),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      Text(product.sold,
                          style: _pjs(size: 10, color: _kSubtext)),
                      if (product.isFulfilled) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 4, vertical: 1),
                          decoration: BoxDecoration(
                            color: _kChip,
                            borderRadius: BorderRadius.circular(3),
                          ),
                          child: Text('Fulfilled',
                              style: _pjs(
                                  size: 8,
                                  weight: FontWeight.w700,
                                  color: _kSecondary)),
                        ),
                      ],
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
