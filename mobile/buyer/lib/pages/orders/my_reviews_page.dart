import 'package:flutter/material.dart';

import '../../models/order.dart' as api_order;
import '../../services/api_service.dart';
import '../../services/review_repository.dart';
import '../../theme/app_theme.dart';
import 'write_review_page.dart';

/// The buyer's own reviews (GET /api/buyer/reviews/mine). Same data as the
/// web "My Reviews" page; editing reuses WriteReviewPage (PUT /reviews/{id},
/// once within 30 days).
class MyReviewsPage extends StatefulWidget {
  const MyReviewsPage({super.key});

  @override
  State<MyReviewsPage> createState() => _MyReviewsPageState();
}

class _MyReviewsPageState extends State<MyReviewsPage> {
  late Future<List<MyReview>> _future;

  @override
  void initState() {
    super.initState();
    _future = ReviewRepository.instance.mine();
  }

  Future<void> _reload() async {
    final f = ReviewRepository.instance.mine();
    setState(() => _future = f);
    await f.catchError((_) => <MyReview>[]);
  }

  Future<void> _edit(MyReview r) async {
    if (r.orderId == null) return;
    final item = api_order.OrderItem(
      id: 0,
      productId: r.productId ?? 0,
      productName: r.productName,
      imageUrl: null,
      quantity: 1,
      unitPrice: 0,
      subtotal: 0,
      reviewId: r.id,
      reviewRating: r.rating,
      reviewComment: r.comment,
      reviewCanEdit: r.canEdit,
    );
    final changed = await Navigator.push<bool>(
      context,
      MaterialPageRoute(builder: (_) => WriteReviewPage(orderId: r.orderId!, item: item)),
    );
    if (changed == true && mounted) _reload();
  }

  static String _date(DateTime? d) {
    if (d == null) return '';
    const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    final l = d.toLocal();
    return '${m[l.month - 1]} ${l.day}, ${l.year}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('My Reviews'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: RefreshIndicator(
        onRefresh: _reload,
        child: FutureBuilder<List<MyReview>>(
          future: _future,
          builder: (context, snap) {
            if (snap.connectionState != ConnectionState.done) {
              return const Center(child: CircularProgressIndicator());
            }
            if (snap.hasError) {
              final msg = snap.error is ApiException ? (snap.error as ApiException).message : 'Could not load your reviews.';
              return ListView(children: [
                const SizedBox(height: 120),
                Icon(Icons.error_outline, size: 48, color: AppColors.textMuted),
                const SizedBox(height: 12),
                Center(child: Text(msg, textAlign: TextAlign.center)),
                const SizedBox(height: 12),
                Center(child: TextButton(onPressed: _reload, child: const Text('Try again'))),
              ]);
            }
            final rows = snap.data ?? const <MyReview>[];
            if (rows.isEmpty) {
              return ListView(children: [
                const SizedBox(height: 120),
                Icon(Icons.rate_review_outlined, size: 56, color: AppColors.textMuted),
                const SizedBox(height: 12),
                const Center(
                  child: Text('No reviews yet', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                ),
                const SizedBox(height: 4),
                Center(
                  child: Text('Rate items from your completed orders.',
                      style: TextStyle(color: AppColors.textMuted)),
                ),
              ]);
            }
            return ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: rows.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (_, i) => _ReviewCard(
                review: rows[i],
                date: _date(rows[i].createdAt),
                onEdit: rows[i].canEdit && rows[i].orderId != null ? () => _edit(rows[i]) : null,
              ),
            );
          },
        ),
      ),
    );
  }
}

class _ReviewCard extends StatelessWidget {
  const _ReviewCard({required this.review, required this.date, this.onEdit});
  final MyReview review;
  final String date;
  final VoidCallback? onEdit;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Expanded(
              child: Text(review.productName,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.text)),
            ),
            if (onEdit != null)
              TextButton.icon(
                onPressed: onEdit,
                icon: const Icon(Icons.edit_outlined, size: 16),
                label: const Text('Edit'),
              ),
          ]),
          const SizedBox(height: 4),
          Row(children: [
            ...List.generate(
              5,
              (i) => Icon(i < review.rating ? Icons.star_rounded : Icons.star_outline_rounded,
                  size: 18, color: const Color(0xFFF59E0B)),
            ),
            const SizedBox(width: 8),
            Text(date, style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
            if (review.isEdited)
              Text(' · Edited', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
          ]),
          if ((review.comment ?? '').trim().isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(review.comment!, style: const TextStyle(color: AppColors.onSurface)),
          ],
          if (review.images.isNotEmpty) ...[
            const SizedBox(height: 8),
            SizedBox(
              height: 64,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: review.images.length,
                separatorBuilder: (_, __) => const SizedBox(width: 6),
                itemBuilder: (_, i) => ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.network(review.images[i],
                      width: 64,
                      height: 64,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) =>
                          Container(width: 64, height: 64, color: AppColors.surface)),
                ),
              ),
            ),
          ],
          if ((review.sellerReply ?? '').trim().isNotEmpty) ...[
            const SizedBox(height: 10),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: AppColors.chip, borderRadius: BorderRadius.circular(10)),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('Seller reply',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primary)),
                const SizedBox(height: 2),
                Text(review.sellerReply!),
              ]),
            ),
          ],
        ],
      ),
    );
  }
}
