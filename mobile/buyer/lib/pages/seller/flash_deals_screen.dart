import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../home/product_detail_page.dart';
import 'seller_store_page.dart';

// ── Design tokens ─────────────────────────────────────────────────────────────
const _kPrimary = Color(0xFF34175B);
const _kSecondary = Color(0xFF6B38D4);
const _kFlash = Color(0xFFFF3B5C);
const _kSurface = Color(0xFFF5F4FC);
const _kCard = Color(0xFFFFFFFF);
const _kChip = Color(0xFFEFE9FD);
const _kBorder = Color(0xFFDDD8F0);
const _kText = Color(0xFF1A1035);
const _kSubtext = Color(0xFF8A84A3);
// ignore: unused_element
const _kOrange = Color(0xFFFF6B00);

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
// FLASH DEALS SCREEN
// ═════════════════════════════════════════════════════════════════════════════
class FlashDealsScreen extends StatefulWidget {
  const FlashDealsScreen({super.key, required this.seller});
  final SellerInfo seller;

  @override
  State<FlashDealsScreen> createState() => _FlashDealsScreenState();
}

class _FlashDealsScreenState extends State<FlashDealsScreen> {
  // ignore: prefer_final_fields
  int _saleSeconds = 1 * 3600 + 26 * 60 + 45;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    // Flash sale countdown disabled — no sale_end_date column in DB.
    // _timer = Timer.periodic(const Duration(seconds: 1), (_) {
    //   if (_saleSeconds > 0) {
    //     setState(() => _saleSeconds--);
    //   } else {
    //     _timer?.cancel();
    //   }
    // });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String get _countdown {
    final h = _saleSeconds ~/ 3600;
    final m = (_saleSeconds % 3600) ~/ 60;
    final s = _saleSeconds % 60;
    return '${h.toString().padLeft(2, '0')}:${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final flashProducts =
        widget.seller.products.where((p) => p.badge == 'FLASH').toList();

    return Scaffold(
      backgroundColor: _kSurface,
      appBar: AppBar(
        backgroundColor: _kCard,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: _kText),
          onPressed: () => Navigator.pop(context),
        ),
        title:
            Text('Flash Deals', style: _pjs(size: 17, weight: FontWeight.w800)),
        actions: [
          IconButton(
            icon: const Icon(Icons.more_vert, color: _kText),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          // Countdown header hidden — no sale_end_date column in DB.
          // Container(
          //   color: _kPrimary,
          //   padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          //   child: Row(
          //     children: [
          //       const Icon(Icons.flash_on, color: _kFlash, size: 20),
          //       const SizedBox(width: 8),
          //       Text('FLASH SALE ENDS IN',
          //           style: _pjs(
          //               size: 12,
          //               weight: FontWeight.w800,
          //               color: Colors.white)),
          //       const Spacer(),
          //       _buildCountdown(),
          //     ],
          //   ),
          // ),
          // Store badge row
          Container(
            color: _kCard,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: _kChip,
                    shape: BoxShape.circle,
                    border: Border.all(color: _kBorder),
                  ),
                  child: ClipOval(
                    child: Image.network(
                      'https://picsum.photos/seed/${widget.seller.avatarSeed}/64/64',
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => const Icon(
                          Icons.storefront_outlined,
                          size: 16,
                          color: _kPrimary),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Text(widget.seller.name,
                    style: _pjs(size: 13, weight: FontWeight.w700)),
                const SizedBox(width: 6),
                if (widget.seller.badge.isNotEmpty)
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: _kChip,
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(color: _kSecondary),
                    ),
                    child: Text(widget.seller.badge,
                        style: _pjs(
                            size: 9,
                            weight: FontWeight.w700,
                            color: _kSecondary)),
                  ),
                const Spacer(),
                Text('${flashProducts.length} items',
                    style: _pjs(size: 12, color: _kSubtext)),
              ],
            ),
          ),
          const Divider(height: 1, color: _kBorder),
          // Flash product list
          Expanded(
            child: flashProducts.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.flash_off_outlined,
                            size: 48, color: _kSubtext),
                        const SizedBox(height: 12),
                        Text('No flash deals available',
                            style: _pjs(size: 14, color: _kSubtext)),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(12),
                    itemCount: flashProducts.length,
                    itemBuilder: (ctx, i) =>
                        _FlashDealCard(product: flashProducts[i]),
                  ),
          ),
        ],
      ),
    );
  }

  // ignore: unused_element
  Widget _buildCountdown() {
    final parts = _countdown.split(':');
    if (parts.length != 3) return const SizedBox.shrink();
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        _CountBlock(parts[0]),
        _ColonSep(),
        _CountBlock(parts[1]),
        _ColonSep(),
        _CountBlock(parts[2]),
      ],
    );
  }
}

// ── Flash deal card ───────────────────────────────────────────────────────────
class _FlashDealCard extends StatelessWidget {
  const _FlashDealCard({required this.product});
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
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: _kCard,
          borderRadius: BorderRadius.circular(14),
          boxShadow: const [
            BoxShadow(
                color: Color(0x0D34175B), blurRadius: 6, offset: Offset(0, 2)),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image with badges
            Stack(
              children: [
                ClipRRect(
                  borderRadius:
                      const BorderRadius.horizontal(left: Radius.circular(14)),
                  child: Image.network(
                    'https://picsum.photos/seed/${product.imageSeed}/200/200',
                    width: 110,
                    height: 110,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      width: 110,
                      height: 110,
                      decoration: const BoxDecoration(
                        color: _kChip,
                        borderRadius:
                            BorderRadius.horizontal(left: Radius.circular(14)),
                      ),
                    ),
                  ),
                ),
                // "3 DAYS" badge hidden — no sale end date in DB.
                // Positioned(
                //   top: 8,
                //   left: 8,
                //   child: Container(
                //     padding:
                //         const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                //     decoration: BoxDecoration(
                //       color: _kOrange,
                //       borderRadius: BorderRadius.circular(4),
                //     ),
                //     child: Text('3 DAYS',
                //         style: _pjs(
                //             size: 8,
                //             weight: FontWeight.w800,
                //             color: Colors.white)),
                //   ),
                // ),
                Positioned(
                  bottom: 8,
                  left: 8,
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                    decoration: BoxDecoration(
                      color: _kFlash,
                      borderRadius: BorderRadius.circular(5),
                    ),
                    child: Text('-${product.discount}%',
                        style: _pjs(
                            size: 10,
                            weight: FontWeight.w800,
                            color: Colors.white)),
                  ),
                ),
              ],
            ),
            // Product info
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(12, 12, 12, 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (product.isFulfilled)
                      Container(
                        margin: const EdgeInsets.only(bottom: 4),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: _kChip,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text('FULFILLED',
                            style: _pjs(
                                size: 8,
                                weight: FontWeight.w800,
                                color: _kSecondary)),
                      ),
                    Text(product.name,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: _pjs(
                            size: 13, weight: FontWeight.w600, height: 1.4)),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        // Rating hidden — StoreProduct has no real review data.
                        Text(product.sold,
                            style: _pjs(size: 11, color: _kSubtext)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text('₱${product.price.toStringAsFixed(0)}',
                            style: _pjs(
                                size: 18,
                                weight: FontWeight.w800,
                                color: _kFlash)),
                        const SizedBox(width: 6),
                        Text(
                          '₱${product.originalPrice.toStringAsFixed(0)}',
                          style: _pjs(
                            size: 12,
                            color: _kSubtext,
                            decoration: TextDecoration.lineThrough,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    // Progress bar hidden — no claimed/sold data in DB.
                    // ClipRRect(
                    //   borderRadius: BorderRadius.circular(3),
                    //   child: LinearProgressIndicator(
                    //     value: 0.75,
                    //     backgroundColor: _kBorder,
                    //     valueColor: const AlwaysStoppedAnimation(_kFlash),
                    //     minHeight: 5,
                    //   ),
                    // ),
                    // const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // "SELLING FAST" label hidden — no sold rate data in DB.
                        // Container(
                        //   padding: const EdgeInsets.symmetric(
                        //       horizontal: 5, vertical: 1),
                        //   decoration: BoxDecoration(
                        //     color: _kFlash.withValues(alpha: 0.1),
                        //     borderRadius: BorderRadius.circular(3),
                        //   ),
                        //   child: Text('SELLING FAST',
                        //       style: _pjs(
                        //           size: 8,
                        //           weight: FontWeight.w800,
                        //           color: _kFlash)),
                        // ),
                        const Spacer(),
                        GestureDetector(
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => ProductDetailPage(
                                  product: storeProductToProduct(product)),
                            ),
                          ),
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: _kPrimary,
                              borderRadius: BorderRadius.circular(9),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.flash_on,
                                    size: 12, color: Colors.white),
                                Text('Buy',
                                    style: _pjs(
                                        size: 12,
                                        weight: FontWeight.w700,
                                        color: Colors.white)),
                              ],
                            ),
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

// ── Shared countdown widgets ──────────────────────────────────────────────────
class _CountBlock extends StatelessWidget {
  const _CountBlock(this.value);
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 34,
      height: 26,
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(5),
      ),
      alignment: Alignment.center,
      child: Text(value,
          style: _pjs(size: 13, weight: FontWeight.w800, color: Colors.white)),
    );
  }
}

class _ColonSep extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 3),
      child: Text(':',
          style:
              _pjs(size: 14, weight: FontWeight.w800, color: Colors.white70)),
    );
  }
}
