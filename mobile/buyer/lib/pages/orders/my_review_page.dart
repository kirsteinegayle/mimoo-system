import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'rate_product_page.dart';
import '../../theme/app_theme.dart';

// ── Design tokens (identical to orders_page / rate_product_page) ──────────────
const _kPrimary = AppColors.primary;
const _kSecondary = AppColors.accent;
const _kAccent = AppColors.violet;
const _kFlash = AppColors.flash;
const _kSurface = AppColors.surface;
const _kCard = AppColors.card;
const _kChip = AppColors.chip;
const _kBorder = AppColors.border;
const _kText = AppColors.text;
const _kSubtext = AppColors.textMuted;
const _kGreen = AppColors.success;
const _kOrange = AppColors.orange;
const _kGold = AppColors.warning;

TextStyle _pjs({
  double size = 14,
  FontWeight weight = FontWeight.w400,
  Color color = _kText,
  double? height,
  TextDecoration? decoration,
  double? letterSpacing,
}) =>
    GoogleFonts.plusJakartaSans(
      fontSize: size,
      fontWeight: weight,
      color: color,
      height: height,
      decoration: decoration,
      letterSpacing: letterSpacing,
    );

// ── Argument object passed from My Purchases ─────────────────────────────────
class MyReviewArgs {
  const MyReviewArgs({
    required this.orderId,
    required this.productId,
    required this.productName,
    required this.productSub,
    required this.imageUrl,
    required this.storeName,
    required this.storeBadge,
    required this.price,
  });

  final String orderId;
  final String productId;
  final String productName;
  final String productSub;
  final String imageUrl;
  final String storeName;
  final String storeBadge;
  final double price;
}

// ═════════════════════════════════════════════════════════════════════════════
// MY REVIEW PAGE  (read-only view of a submitted review)
// ═════════════════════════════════════════════════════════════════════════════
class MyReviewPage extends StatefulWidget {
  const MyReviewPage({super.key, required this.args});
  final MyReviewArgs args;

  @override
  State<MyReviewPage> createState() => _MyReviewPageState();
}

class _MyReviewPageState extends State<MyReviewPage> {
  // TODO(backend): GET /api/reviews?orderId=X&productId=Y
  // For now, read from the in-memory reviewStore populated by RateProductPage
  ReviewData? get _review => reviewStore[widget.args.orderId];

  bool get _isInvalid =>
      widget.args.orderId.isEmpty || widget.args.productId.isEmpty;

  @override
  Widget build(BuildContext context) {
    if (_isInvalid) return _buildErrorPage('Invalid order or product ID.');
    final review = _review;
    if (review == null) return _buildErrorPage('Review not found.');

    return Scaffold(
      backgroundColor: _kSurface,
      appBar: _buildAppBar(review),
      body: ListView(
        padding: const EdgeInsets.only(bottom: 100),
        children: [
          // ── Published / editable status bar ──────────────────────────────
          Container(
            color: _kCard,
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 10),
            child: Row(
              children: [
                Icon(Icons.check_circle_outline, size: 14, color: _kGreen),
                const SizedBox(width: 6),
                Text(
                  review.editedDate != null
                      ? 'Published  •  Edited ${review.editedDate}'
                      : 'Published',
                  style:
                      _pjs(size: 12, weight: FontWeight.w600, color: _kGreen),
                ),
                const Spacer(),
                GestureDetector(
                  onTap: () => _goEdit(context, review),
                  child: Row(
                    children: [
                      Icon(Icons.edit_outlined, size: 13, color: _kSecondary),
                      const SizedBox(width: 4),
                      Text('Edit',
                          style: _pjs(
                              size: 13,
                              weight: FontWeight.w700,
                              color: _kSecondary)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: _kBorder),

          // ── Coins earned banner ───────────────────────────────────────────
          Container(
            margin: const EdgeInsets.fromLTRB(12, 10, 12, 0),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                  colors: [AppColors.primaryDeep, AppColors.primaryMid]),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                  ),
                  child: const Center(
                    child: Text('🪙', style: TextStyle(fontSize: 18)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('+1.3 mimoo Coins Earned',
                          style: _pjs(
                              size: 14,
                              weight: FontWeight.w800,
                              color: Colors.white)),
                      Text(
                        review.reviewDate != null
                            ? 'Credited to your coin balance on ${review.reviewDate}'
                            : 'Credited to your coin balance',
                        style: _pjs(size: 11, color: Colors.white60),
                      ),
                    ],
                  ),
                ),
                Icon(Icons.check_circle, color: _kGreen, size: 18),
              ],
            ),
          ),

          // ── Product summary ───────────────────────────────────────────────
          Container(
            margin: const EdgeInsets.fromLTRB(12, 10, 12, 0),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: _kCard,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: _kBorder),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.network(
                    widget.args.imageUrl,
                    width: 56,
                    height: 56,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      width: 56,
                      height: 56,
                      color: _kChip,
                      child: Icon(Icons.image_outlined, color: _kSubtext),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (widget.args.storeBadge.isNotEmpty)
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: _kSecondary,
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(widget.args.storeBadge,
                                  style: _pjs(
                                      size: 8,
                                      weight: FontWeight.w800,
                                      color: Colors.white)),
                            ),
                            const SizedBox(width: 6),
                            Text(widget.args.storeName,
                                style: _pjs(
                                    size: 11,
                                    weight: FontWeight.w700,
                                    color: _kSecondary)),
                          ],
                        ),
                      if (widget.args.storeBadge.isEmpty)
                        Text(widget.args.storeName,
                            style: _pjs(
                                size: 11,
                                weight: FontWeight.w700,
                                color: _kSecondary)),
                      const SizedBox(height: 2),
                      Text(widget.args.productName,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: _pjs(size: 13, weight: FontWeight.w700)),
                      const SizedBox(height: 2),
                      Text('Variation: ${widget.args.productSub}',
                          style: _pjs(size: 11, color: _kSubtext)),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // ── Star rating + date ────────────────────────────────────────────
          Container(
            margin: const EdgeInsets.fromLTRB(12, 10, 12, 0),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: _kCard,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: _kBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Stars + score
                Row(
                  children: [
                    ...List.generate(
                        5,
                        (i) => Padding(
                              padding: const EdgeInsets.only(right: 3),
                              child: Icon(
                                i < review.productRating
                                    ? Icons.star_rounded
                                    : Icons.star_outline_rounded,
                                size: 28,
                                color: i < review.productRating
                                    ? _kGold
                                    : _kBorder,
                              ),
                            )),
                    const SizedBox(width: 6),
                    Text(review.productRating.toStringAsFixed(1),
                        style: _pjs(
                            size: 22, weight: FontWeight.w800, color: _kGold)),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  _ratingLabel(review.productRating),
                  style: _pjs(
                      size: 13, weight: FontWeight.w700, color: _kSecondary),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Text(
                      review.reviewDate != null
                          ? 'Reviewed on ${review.reviewDate}'
                          : 'Review submitted',
                      style: _pjs(size: 11, color: _kSubtext),
                    ),
                    if (review.editedDate != null) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 7, vertical: 2),
                        decoration: BoxDecoration(
                          color: _kOrange.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          'Edited ${review.editedDate}',
                          style: _pjs(
                              size: 10,
                              weight: FontWeight.w700,
                              color: _kOrange),
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),

          // ── Reviewer identity ─────────────────────────────────────────────
          Container(
            margin: const EdgeInsets.fromLTRB(12, 10, 12, 0),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: _kCard,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: _kBorder),
            ),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: const BoxDecoration(
                      color: _kChip, shape: BoxShape.circle),
                  alignment: Alignment.center,
                  child: Text(
                    review.anonymous ? 'm' : 'Y',
                    style: _pjs(
                        size: 16, weight: FontWeight.w800, color: _kSecondary),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            review.anonymous ? 'm***o' : 'You',
                            style: _pjs(size: 13, weight: FontWeight.w700),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 7, vertical: 2),
                            decoration: BoxDecoration(
                              color: _kGreen.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.verified_outlined,
                                    size: 10, color: _kGreen),
                                const SizedBox(width: 3),
                                Text('Verified Buyer',
                                    style: _pjs(
                                        size: 9,
                                        weight: FontWeight.w700,
                                        color: _kGreen)),
                              ],
                            ),
                          ),
                        ],
                      ),
                      if (review.anonymous)
                        Row(
                          children: [
                            Icon(Icons.visibility_off_outlined,
                                size: 11, color: _kSubtext),
                            const SizedBox(width: 4),
                            Text('Anonymous Review (Username masked)',
                                style: _pjs(size: 11, color: _kSubtext)),
                          ],
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // ── Review text ───────────────────────────────────────────────────
          if (review.reviewText.isNotEmpty)
            Container(
              margin: const EdgeInsets.fromLTRB(12, 10, 12, 0),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: _kCard,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: _kBorder),
              ),
              child: Text(
                review.reviewText,
                style: _pjs(size: 13, height: 1.65, color: _kText),
              ),
            ),

          // ── Uploaded media ────────────────────────────────────────────────
          if (review.photoCount > 0)
            Container(
              margin: const EdgeInsets.fromLTRB(12, 10, 12, 0),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: _kCard,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: _kBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Uploaded Media (${review.photoCount})',
                    style: _pjs(size: 14, weight: FontWeight.w800),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 140,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: review.photoCount,
                      itemBuilder: (_, i) => Padding(
                        padding: const EdgeInsets.only(right: 10),
                        child: Stack(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(10),
                              child: Image.network(
                                'https://picsum.photos/seed/review_photo_$i/140/140',
                                width: 130,
                                height: 140,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => Container(
                                  width: 130,
                                  height: 140,
                                  color: _kChip,
                                  child: Icon(Icons.image_outlined,
                                      color: _kSubtext, size: 32),
                                ),
                              ),
                            ),
                            Positioned(
                              bottom: 6,
                              left: 6,
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: Colors.black.withValues(alpha: 0.55),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(Icons.photo_outlined,
                                        size: 10, color: Colors.white),
                                    const SizedBox(width: 3),
                                    Text('Photo',
                                        style: _pjs(
                                            size: 9,
                                            color: Colors.white,
                                            weight: FontWeight.w600)),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

          // ── Size & Fit ────────────────────────────────────────────────────
          Container(
            margin: const EdgeInsets.fromLTRB(12, 10, 12, 0),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: _kCard,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: _kBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text('Size & Fit Feedback',
                        style: _pjs(size: 14, weight: FontWeight.w800)),
                    const Spacer(),
                    Text('Selected by buyer',
                        style: _pjs(size: 11, color: _kSubtext)),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children:
                      ['Runs Small', 'True to Size', 'Runs Large'].map((opt) {
                    final sel = review.fitSelection == opt ||
                        (opt == 'True to Size' &&
                            review.fitSelection == 'True to size');
                    return Expanded(
                      child: Container(
                        margin: const EdgeInsets.only(right: 8),
                        padding: const EdgeInsets.symmetric(vertical: 9),
                        decoration: BoxDecoration(
                          color: sel ? _kPrimary : _kSurface,
                          borderRadius: BorderRadius.circular(9999),
                          border: Border.all(color: sel ? _kPrimary : _kBorder),
                        ),
                        alignment: Alignment.center,
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (sel)
                              Padding(
                                padding: const EdgeInsets.only(right: 4),
                                child: Icon(Icons.check,
                                    size: 12, color: Colors.white),
                              ),
                            Text(opt,
                                style: _pjs(
                                    size: 12,
                                    weight: FontWeight.w700,
                                    color: sel ? Colors.white : _kText)),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
          ),

          // ── Service & Delivery ratings ────────────────────────────────────
          Container(
            margin: const EdgeInsets.fromLTRB(12, 10, 12, 0),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: _kCard,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: _kBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Service & Delivery Ratings',
                    style: _pjs(size: 14, weight: FontWeight.w800)),
                const Divider(color: _kBorder, height: 20),
                _ServiceReadRow(
                  label: 'Seller Service',
                  rating: review.sellerRating,
                  badge: 'Highly Responsive',
                  badgeColor: _kSecondary,
                  icon: Icons.storefront_outlined,
                ),
                const SizedBox(height: 12),
                _ServiceReadRow(
                  label: 'Delivery Speed',
                  rating: review.deliveryRating,
                  badge: 'Delivered in 2 days',
                  badgeColor: _kGreen,
                  icon: Icons.local_shipping_outlined,
                ),
              ],
            ),
          ),

          // ── Seller response ───────────────────────────────────────────────
          if (review.sellerReply != null)
            Container(
              margin: const EdgeInsets.fromLTRB(12, 10, 12, 0),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: _kCard,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: _kBorder),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                        color: _kChip, borderRadius: BorderRadius.circular(8)),
                    child: Icon(Icons.storefront_outlined,
                        color: _kSecondary, size: 18),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                'Seller Response — ${widget.args.storeName}',
                                style: _pjs(size: 13, weight: FontWeight.w800),
                              ),
                            ),
                            Text(
                              review.reviewDate != null
                                  ? review.reviewDate!.split(',')[0]
                                  : '',
                              style: _pjs(size: 11, color: _kSubtext),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          review.sellerReply!,
                          style: _pjs(size: 12, color: _kSubtext, height: 1.55),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

          const SizedBox(height: 24),
        ],
      ),
      bottomNavigationBar: _buildBottomBar(context, review),
    );
  }

  // ── AppBar ─────────────────────────────────────────────────────────────────
  PreferredSizeWidget _buildAppBar(ReviewData review) {
    return AppBar(
      backgroundColor: _kCard,
      elevation: 0,
      centerTitle: true,
      leading: IconButton(
        icon: Icon(Icons.arrow_back, color: _kText),
        onPressed: () => Navigator.pop(context),
        tooltip: 'Back to My Purchases',
      ),
      title:
          Text('Rate Product', style: _pjs(size: 17, weight: FontWeight.w800)),
      actions: [
        Padding(
          padding: const EdgeInsets.only(right: 12),
          child: CircleAvatar(
            radius: 17,
            backgroundColor: _kChip,
            child: Icon(Icons.person, size: 18, color: _kPrimary),
          ),
        ),
      ],
    );
  }

  // ── Bottom bar ─────────────────────────────────────────────────────────────
  Widget _buildBottomBar(BuildContext context, ReviewData review) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 24),
      decoration: const BoxDecoration(
        color: _kCard,
        boxShadow: [
          BoxShadow(
              color: AppColors.primaryA10, blurRadius: 12, offset: Offset(0, -4))
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            // Share
            OutlinedButton.icon(
              onPressed: () => ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Review link copied!',
                      style: _pjs(
                          size: 13,
                          color: Colors.white,
                          weight: FontWeight.w600)),
                  backgroundColor: _kPrimary,
                  duration: const Duration(seconds: 2),
                ),
              ),
              icon:
                  const Icon(Icons.share_outlined, size: 16, color: _kPrimary),
              label: Text('Share Review',
                  style: _pjs(
                      size: 13, weight: FontWeight.w700, color: _kPrimary)),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: _kBorder),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
                minimumSize: const Size(0, 50),
                padding: const EdgeInsets.symmetric(horizontal: 16),
              ),
            ),
            const SizedBox(width: 10),
            // Buy Again
            Expanded(
              child: ElevatedButton.icon(
                onPressed: () => ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Opening cart...',
                        style: _pjs(
                            size: 13,
                            color: Colors.white,
                            weight: FontWeight.w600)),
                    backgroundColor: _kPrimary,
                    duration: const Duration(seconds: 2),
                  ),
                ),
                icon: const Icon(Icons.shopping_bag_outlined,
                    size: 16, color: Colors.white),
                label: Text('Buy Again',
                    style: _pjs(
                        size: 14,
                        weight: FontWeight.w700,
                        color: Colors.white)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _kPrimary,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                  minimumSize: const Size(0, 50),
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Navigate to Edit Review ────────────────────────────────────────────────
  Future<void> _goEdit(BuildContext context, ReviewData review) async {
    final updated = await Navigator.push<bool>(
      context,
      MaterialPageRoute(
        builder: (_) => EditReviewPage(args: widget.args),
      ),
    );
    if (updated == true && mounted) setState(() {});
  }

  // ── Error page ─────────────────────────────────────────────────────────────
  Widget _buildErrorPage(String message) {
    return Scaffold(
      backgroundColor: _kSurface,
      appBar: AppBar(
        backgroundColor: _kCard,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: _kText),
          onPressed: () => Navigator.pop(context),
        ),
        title:
            Text('My Review', style: _pjs(size: 17, weight: FontWeight.w800)),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                    color: _kFlash.withValues(alpha: 0.1),
                    shape: BoxShape.circle),
                child:
                    const Icon(Icons.error_outline, size: 36, color: _kFlash),
              ),
              const SizedBox(height: 20),
              Text('Review Not Found',
                  style: _pjs(size: 18, weight: FontWeight.w800)),
              const SizedBox(height: 8),
              Text(
                message,
                textAlign: TextAlign.center,
                style: _pjs(size: 13, color: _kSubtext, height: 1.5),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: () => Navigator.pop(context),
                icon:
                    const Icon(Icons.arrow_back, size: 16, color: Colors.white),
                label: Text('Back to My Purchases',
                    style: _pjs(
                        size: 14,
                        weight: FontWeight.w700,
                        color: Colors.white)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _kPrimary,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                  minimumSize: const Size(0, 50),
                  padding: const EdgeInsets.symmetric(horizontal: 28),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _ratingLabel(int r) {
    switch (r) {
      case 1:
        return 'Poor';
      case 2:
        return 'Fair';
      case 3:
        return 'Okay';
      case 4:
        return 'Good';
      case 5:
        return 'Excellent & Loved it!';
      default:
        return '';
    }
  }
}

// ── Service rating read row ───────────────────────────────────────────────────
class _ServiceReadRow extends StatelessWidget {
  const _ServiceReadRow({
    required this.label,
    required this.rating,
    required this.badge,
    required this.badgeColor,
    required this.icon,
  });
  final String label, badge;
  final int rating;
  final Color badgeColor;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 16, color: _kSubtext),
        const SizedBox(width: 8),
        Expanded(
            child: Text(label, style: _pjs(size: 13, weight: FontWeight.w600))),
        Row(
          children: List.generate(
              5,
              (i) => Padding(
                    padding: const EdgeInsets.only(left: 2),
                    child: Icon(
                      i < rating
                          ? Icons.star_rounded
                          : Icons.star_outline_rounded,
                      size: 18,
                      color: i < rating ? _kGold : _kBorder,
                    ),
                  )),
        ),
        const SizedBox(width: 8),
        Text(badge,
            style: _pjs(size: 11, weight: FontWeight.w700, color: badgeColor)),
      ],
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// EDIT REVIEW PAGE
// ═════════════════════════════════════════════════════════════════════════════
class EditReviewPage extends StatefulWidget {
  const EditReviewPage({super.key, required this.args});
  final MyReviewArgs args;

  @override
  State<EditReviewPage> createState() => _EditReviewPageState();
}

class _EditReviewPageState extends State<EditReviewPage> {
  // TODO(backend): GET /api/reviews?orderId=X to pre-fill, PATCH to save

  late int _productRating;
  late int _sellerRating;
  late int _deliveryRating;
  late String _fitSelection;
  late bool _anonymous;
  late final TextEditingController _reviewCtrl;
  late final List<_EPhotoSlot> _photos;

  // Snapshot of original values to detect changes
  late final int _origRating;
  late final int _origSellerRating;
  late final int _origDeliveryRating;
  late final String _origFit;
  late final bool _origAnon;
  late final String _origText;
  late final int _origPhotoCount;

  bool _saving = false;
  bool _saved = false;

  static const int _maxPhotos = 5;
  static const int _maxChars = 500;

  static const _fitOptions = ['Small', 'True to size', 'Large'];
  static const _ratingLabels = {
    0: '',
    1: 'Poor',
    2: 'Fair',
    3: 'Okay',
    4: 'Good',
    5: 'Excellent & Loved it!'
  };

  int get _charCount => _reviewCtrl.text.length;

  bool get _hasChanged {
    return _productRating != _origRating ||
        _sellerRating != _origSellerRating ||
        _deliveryRating != _origDeliveryRating ||
        _fitSelection != _origFit ||
        _anonymous != _origAnon ||
        _reviewCtrl.text.trim() != _origText ||
        _photos.length != _origPhotoCount;
  }

  bool get _canSave => _hasChanged && _productRating > 0 && !_saving;

  @override
  void initState() {
    super.initState();
    final existing = reviewStore[widget.args.orderId];

    _productRating = existing?.productRating ?? 5;
    _sellerRating = existing?.sellerRating ?? 4;
    _deliveryRating = existing?.deliveryRating ?? 4;
    _fitSelection = existing?.fitSelection ?? 'True to size';
    _anonymous = existing?.anonymous ?? false;
    _reviewCtrl = TextEditingController(text: existing?.reviewText ?? '');
    _photos = List.generate(
        existing?.photoCount ?? 0, (i) => _EPhotoSlot(seed: 'review_photo_$i'));

    // Snapshot
    _origRating = _productRating;
    _origSellerRating = _sellerRating;
    _origDeliveryRating = _deliveryRating;
    _origFit = _fitSelection;
    _origAnon = _anonymous;
    _origText = _reviewCtrl.text;
    _origPhotoCount = _photos.length;

    _reviewCtrl.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _reviewCtrl.dispose();
    super.dispose();
  }

  void _save() async {
    if (!_canSave) return;
    if (_reviewCtrl.text.trim().length < 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Please write at least 10 characters.',
              style:
                  _pjs(size: 13, color: Colors.white, weight: FontWeight.w600)),
          backgroundColor: _kFlash,
          duration: const Duration(seconds: 2),
        ),
      );
      return;
    }

    setState(() => _saving = true);

    // TODO(backend): PATCH /api/reviews/:orderId with updated fields
    await Future.delayed(const Duration(milliseconds: 600));

    final existing = reviewStore[widget.args.orderId];
    final now = DateTime.now();
    final editedDate = _fmtDate(now);

    reviewStore[widget.args.orderId] = ReviewData(
      productRating: _productRating,
      reviewText: _reviewCtrl.text.trim(),
      sellerRating: _sellerRating,
      deliveryRating: _deliveryRating,
      fitSelection: _fitSelection,
      anonymous: _anonymous,
      photoCount: _photos.length,
      reviewDate: existing?.reviewDate,
      editedDate: editedDate,
      sellerReply: existing?.sellerReply,
    );

    setState(() {
      _saving = false;
      _saved = true;
    });

    // Show success then pop back to My Review
    await Future.delayed(const Duration(seconds: 2));
    if (!mounted) return;
    Navigator.pop(context, true); // true = changes saved
  }

  String _fmtDate(DateTime dt) {
    const m = [
      '',
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];
    return '${m[dt.month]} ${dt.day}';
  }

  void _addPhoto() {
    if (_photos.length >= _maxPhotos) return;
    setState(() {
      _photos.add(_EPhotoSlot(
          seed: 'edit_photo_${_photos.length}_'
              '${DateTime.now().millisecondsSinceEpoch}'));
    });
  }

  void _removePhoto(int idx) => setState(() => _photos.removeAt(idx));

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _kSurface,
      appBar: AppBar(
        backgroundColor: _kCard,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: _kText),
          onPressed: () => Navigator.pop(context),
          tooltip: 'Cancel',
        ),
        title:
            Text('Edit Review', style: _pjs(size: 17, weight: FontWeight.w800)),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: CircleAvatar(
              radius: 17,
              backgroundColor: _kChip,
              child: Icon(Icons.person, size: 18, color: _kPrimary),
            ),
          ),
        ],
      ),
      body: _saved ? _buildSavedState() : _buildForm(),
      bottomNavigationBar: _saved ? null : _buildBottomBar(),
    );
  }

  // ── Saved success state ────────────────────────────────────────────────────
  Widget _buildSavedState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                  color: _kGreen.withValues(alpha: 0.12),
                  shape: BoxShape.circle),
              child: const Icon(Icons.check_circle_outline,
                  size: 42, color: _kGreen),
            ),
            const SizedBox(height: 20),
            Text('Review Updated!',
                style: _pjs(size: 20, weight: FontWeight.w800)),
            const SizedBox(height: 8),
            Text(
              'Your changes have been saved successfully.',
              textAlign: TextAlign.center,
              style: _pjs(size: 13, color: _kSubtext, height: 1.5),
            ),
            const SizedBox(height: 8),
            Text('Returning to your review…',
                style: _pjs(size: 12, color: _kSubtext)),
          ],
        ),
      ),
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  Widget _buildForm() {
    return ListView(
      padding: const EdgeInsets.only(bottom: 100),
      children: [
        // ── Product summary ─────────────────────────────────────────────────
        Container(
          margin: const EdgeInsets.fromLTRB(12, 12, 12, 0),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: _kCard,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: _kBorder),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.network(
                  widget.args.imageUrl,
                  width: 52,
                  height: 52,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    width: 52,
                    height: 52,
                    color: _kChip,
                    child: Icon(Icons.image_outlined, color: _kSubtext),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(widget.args.productName,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: _pjs(size: 13, weight: FontWeight.w700)),
                    Text(widget.args.productSub,
                        style: _pjs(size: 11, color: _kSubtext)),
                    Text('Order #${widget.args.orderId}',
                        style: _pjs(
                            size: 11,
                            color: _kSecondary,
                            weight: FontWeight.w600)),
                  ],
                ),
              ),
            ],
          ),
        ),

        // ── Stars ────────────────────────────────────────────────────────────
        Container(
          margin: const EdgeInsets.fromLTRB(12, 10, 12, 0),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: _kCard,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: _kBorder),
          ),
          child: Column(
            children: [
              Text('RATE PRODUCT',
                  style: _pjs(
                      size: 11,
                      weight: FontWeight.w800,
                      color: _kSubtext,
                      letterSpacing: 0.8)),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                    5,
                    (i) => GestureDetector(
                          onTap: () => setState(() => _productRating = i + 1),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 5),
                            child: Icon(
                              i < _productRating
                                  ? Icons.star_rounded
                                  : Icons.star_outline_rounded,
                              size: 44,
                              color: i < _productRating ? _kGold : _kBorder,
                            ),
                          ),
                        )),
              ),
              const SizedBox(height: 6),
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 200),
                child: Text(
                  _ratingLabels[_productRating] ?? '',
                  key: ValueKey(_productRating),
                  style: _pjs(
                      size: 14,
                      weight: FontWeight.w700,
                      color: _productRating > 0 ? _kSecondary : _kSubtext),
                ),
              ),
              if (_productRating == 0) ...[
                const SizedBox(height: 4),
                Text('Tap a star to rate (required)',
                    style: _pjs(size: 11, color: _kFlash)),
              ],
            ],
          ),
        ),

        // ── Photos ───────────────────────────────────────────────────────────
        Container(
          margin: const EdgeInsets.fromLTRB(12, 10, 12, 0),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: _kCard,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: _kBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text('Photos',
                      style: _pjs(size: 14, weight: FontWeight.w800)),
                  const Spacer(),
                  Text('${_photos.length}/$_maxPhotos',
                      style: _pjs(size: 12, color: _kSubtext)),
                ],
              ),
              const SizedBox(height: 12),
              SizedBox(
                height: 88,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: [
                    ..._photos.asMap().entries.map((e) => Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: Stack(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(10),
                                child: Image.network(
                                  'https://picsum.photos/seed/${e.value.seed}/88/88',
                                  width: 88,
                                  height: 88,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => Container(
                                    width: 88,
                                    height: 88,
                                    color: _kChip,
                                    child: Icon(Icons.image_outlined,
                                        color: _kSubtext),
                                  ),
                                ),
                              ),
                              Positioned(
                                top: 4,
                                right: 4,
                                child: GestureDetector(
                                  onTap: () => _removePhoto(e.key),
                                  child: Container(
                                    width: 20,
                                    height: 20,
                                    decoration: BoxDecoration(
                                      color:
                                          Colors.black.withValues(alpha: 0.6),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(Icons.close,
                                        size: 13, color: Colors.white),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        )),
                    if (_photos.length < _maxPhotos)
                      GestureDetector(
                        onTap: _addPhoto,
                        child: Container(
                          width: 88,
                          height: 88,
                          decoration: BoxDecoration(
                            color: _kSurface,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                                color: _kBorder, style: BorderStyle.solid),
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.add_photo_alternate_outlined,
                                  size: 26, color: _kAccent),
                              const SizedBox(height: 4),
                              Text('Add',
                                  style: _pjs(
                                      size: 11,
                                      weight: FontWeight.w600,
                                      color: _kAccent)),
                            ],
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),

        // ── Review text ───────────────────────────────────────────────────────
        Container(
          margin: const EdgeInsets.fromLTRB(12, 10, 12, 0),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: _kCard,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: _kBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text('Review',
                      style: _pjs(size: 14, weight: FontWeight.w800)),
                  const Spacer(),
                  Text('Min. 10 characters',
                      style: _pjs(size: 11, color: _kSubtext)),
                ],
              ),
              const SizedBox(height: 10),
              TextField(
                controller: _reviewCtrl,
                minLines: 4,
                maxLines: 8,
                maxLength: _maxChars,
                inputFormatters: [LengthLimitingTextInputFormatter(_maxChars)],
                style: _pjs(size: 13, height: 1.55),
                decoration: InputDecoration(
                  hintText: 'Share your experience with this product...',
                  hintStyle: _pjs(size: 12, color: _kSubtext),
                  contentPadding: const EdgeInsets.all(12),
                  counterText: '',
                  filled: true,
                  fillColor: _kSurface,
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
              const SizedBox(height: 6),
              Row(
                children: [
                  const Spacer(),
                  Text(
                    '$_charCount/$_maxChars',
                    style: _pjs(
                        size: 11,
                        color:
                            _charCount > _maxChars * 0.9 ? _kFlash : _kSubtext),
                  ),
                ],
              ),
            ],
          ),
        ),

        // ── Fit ──────────────────────────────────────────────────────────────
        Container(
          margin: const EdgeInsets.fromLTRB(12, 10, 12, 0),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: _kCard,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: _kBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('How does it fit?',
                  style: _pjs(size: 14, weight: FontWeight.w800)),
              const SizedBox(height: 12),
              Row(
                children: _fitOptions.map((opt) {
                  final sel = _fitSelection == opt;
                  return Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _fitSelection = opt),
                      child: Container(
                        margin: const EdgeInsets.only(right: 8),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: sel ? _kPrimary : _kSurface,
                          borderRadius: BorderRadius.circular(9999),
                          border: Border.all(color: sel ? _kPrimary : _kBorder),
                        ),
                        alignment: Alignment.center,
                        child: Text(opt,
                            style: _pjs(
                                size: 12,
                                weight: FontWeight.w700,
                                color: sel ? Colors.white : _kText)),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
        ),

        // ── Anonymous ────────────────────────────────────────────────────────
        Container(
          margin: const EdgeInsets.fromLTRB(12, 10, 12, 0),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: _kCard,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: _kBorder),
          ),
          child: Row(
            children: [
              Transform.scale(
                scale: 0.9,
                child: Switch(
                  value: _anonymous,
                  onChanged: (v) => setState(() => _anonymous = v),
                  activeColor: _kPrimary,
                  activeTrackColor: _kChip,
                  inactiveThumbColor: _kSubtext,
                  inactiveTrackColor: _kBorder,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Review Anonymously',
                        style: _pjs(size: 13, weight: FontWeight.w700)),
                    Text('Your username will be masked as m***o',
                        style: _pjs(size: 11, color: _kSubtext)),
                  ],
                ),
              ),
            ],
          ),
        ),

        // ── Service & Delivery ────────────────────────────────────────────────
        Container(
          margin: const EdgeInsets.fromLTRB(12, 10, 12, 0),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: _kCard,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: _kBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(Icons.storefront_outlined, size: 16, color: _kSecondary),
                  const SizedBox(width: 6),
                  Text('Service & Delivery',
                      style: _pjs(
                          size: 14,
                          weight: FontWeight.w800,
                          color: _kSecondary)),
                ],
              ),
              const Divider(color: _kBorder, height: 20),
              _EditServiceRow(
                label: 'Seller Service',
                rating: _sellerRating,
                onChanged: (v) => setState(() => _sellerRating = v),
              ),
              const SizedBox(height: 12),
              _EditServiceRow(
                label: 'Delivery Speed',
                rating: _deliveryRating,
                onChanged: (v) => setState(() => _deliveryRating = v),
              ),
            ],
          ),
        ),

        const SizedBox(height: 20),
      ],
    );
  }

  // ── Bottom bar ─────────────────────────────────────────────────────────────
  Widget _buildBottomBar() {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 24),
      decoration: const BoxDecoration(
        color: _kCard,
        boxShadow: [
          BoxShadow(
              color: AppColors.primaryA10, blurRadius: 12, offset: Offset(0, -4))
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            // Cancel
            OutlinedButton(
              onPressed: () => Navigator.pop(context),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: _kBorder),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
                minimumSize: const Size(0, 52),
                padding: const EdgeInsets.symmetric(horizontal: 24),
              ),
              child: Text('Cancel',
                  style:
                      _pjs(size: 14, weight: FontWeight.w700, color: _kText)),
            ),
            const SizedBox(width: 10),
            // Save Changes
            Expanded(
              child: ElevatedButton.icon(
                onPressed: _canSave ? _save : null,
                icon: _saving
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white))
                    : const Icon(Icons.check, size: 16, color: Colors.white),
                label: Text(
                  _saving ? 'Saving…' : 'Save Changes',
                  style: _pjs(
                      size: 14, weight: FontWeight.w700, color: Colors.white),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _canSave ? _kPrimary : _kBorder,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                  minimumSize: const Size(0, 52),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Edit service rating row ───────────────────────────────────────────────────
class _EditServiceRow extends StatelessWidget {
  const _EditServiceRow({
    required this.label,
    required this.rating,
    required this.onChanged,
  });
  final String label;
  final int rating;
  final void Function(int) onChanged;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
            child: Text(label, style: _pjs(size: 13, weight: FontWeight.w600))),
        Row(
          children: List.generate(
              5,
              (i) => GestureDetector(
                    onTap: () => onChanged(i + 1),
                    child: Padding(
                      padding: const EdgeInsets.only(left: 4),
                      child: Icon(
                        i < rating
                            ? Icons.star_rounded
                            : Icons.star_outline_rounded,
                        size: 26,
                        color: i < rating ? _kGold : _kBorder,
                      ),
                    ),
                  )),
        ),
      ],
    );
  }
}

// ── Photo slot model ──────────────────────────────────────────────────────────
class _EPhotoSlot {
  _EPhotoSlot({required this.seed});
  final String seed;
}
