import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/product.dart';
import '../state/cart_provider.dart';
import '../state/wishlist_provider.dart';
import '../state/auth_service.dart';
import '../pages/home/product_detail_page.dart';
import '../pages/auth/login_page.dart';
import '../utils/animations.dart';
import '../theme/app_theme.dart';

const _kPrimary = AppColors.primary;
const _kFlash = AppColors.flash;
const _kCard = AppColors.card;
const _kChip = AppColors.chip;
const _kText = AppColors.text;
const _kSubtext = AppColors.textMuted;

class ProductCard extends StatelessWidget {
  const ProductCard({super.key, required this.product});

  final Product product;

  @override
  Widget build(BuildContext context) {
    final cart = CartProvider.of(context);
    final wishlist = WishlistProvider.of(context);

    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MimooPageRoute(
          builder: (_) => CartProvider(
            cart: cart,
            child: ProductDetailPage(product: product),
          ),
        ),
      ),
      child: Container(
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
            // Image
            Expanded(
              child: Stack(
                fit: StackFit.expand,
                children: [
                  ClipRRect(
                    borderRadius:
                        const BorderRadius.vertical(top: Radius.circular(12)),
                    child: Image.network(
                      product.imageUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(color: _kChip),
                    ),
                  ),
                  // Wishlist heart
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
                          wishlist.contains(product)
                              ? Icons.favorite
                              : Icons.favorite_border,
                          size: 15,
                          color:
                              wishlist.contains(product) ? _kFlash : _kSubtext,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            // Info
            Padding(
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
                        color: _kText,
                        height: 1.3),
                  ),
                  if (product.reviewCount > 0) ...[
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(Icons.star_rounded,
                            size: 11, color: AppColors.star),
                        const SizedBox(width: 2),
                        Text(
                          '${product.rating.toStringAsFixed(1)} (${product.reviewCount})',
                          style: GoogleFonts.plusJakartaSans(
                              fontSize: 9, color: _kSubtext),
                        ),
                      ],
                    ),
                  ],
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Text(
                        '\$${product.price.toStringAsFixed(2)}',
                        style: GoogleFonts.plusJakartaSans(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: _kPrimary,
                            letterSpacing: -0.3),
                      ),
                      ScaleTap(
                        onTap: () {
                          if (!AuthService.instance.isLoggedIn) {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => LoginPage(
                                  onLoginSuccess: () {
                                    CartProvider.of(context).add(product);
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text('Added to cart!',
                                            style: GoogleFonts.plusJakartaSans(
                                                fontSize: 13,
                                                color: Colors.white,
                                                fontWeight: FontWeight.w600)),
                                        backgroundColor: _kPrimary,
                                        duration: const Duration(seconds: 1),
                                      ),
                                    );
                                  },
                                ),
                              ),
                            );
                            return;
                          }
                          CartProvider.of(context).add(product);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Added to cart!',
                                  style: GoogleFonts.plusJakartaSans(
                                      fontSize: 13,
                                      color: Colors.white,
                                      fontWeight: FontWeight.w600)),
                              backgroundColor: _kPrimary,
                              duration: const Duration(seconds: 1),
                            ),
                          );
                        },
                        child: Container(
                          width: 28,
                          height: 28,
                          decoration: const BoxDecoration(
                            color: _kPrimary,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.add,
                              size: 16, color: Colors.white),
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
