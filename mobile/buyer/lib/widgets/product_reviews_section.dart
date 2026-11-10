import 'package:flutter/material.dart';

import '../services/review_repository.dart';
import '../theme/app_theme.dart';

const _kPrimary = AppColors.primary;
const _kSecondary = AppColors.accent;
const _kBorder = AppColors.border;
const _kSubtext = AppColors.textMuted;

/// Real product reviews (GET /api/buyer/products/{id}/reviews):
/// average, count, star breakdown, review list with photos and "load more".
class ProductReviewsSection extends StatefulWidget {
  const ProductReviewsSection({super.key, required this.productId});
  final int productId;

  @override
  State<ProductReviewsSection> createState() => _ProductReviewsSectionState();
}

class _ProductReviewsSectionState extends State<ProductReviewsSection> {
  final List<ProductReview> _reviews = [];
  double? _avg;
  int _count = 0;
  Map<int, int> _breakdown = {};
  bool _loading = true;
  bool _loadingMore = false;
  bool _hasMore = false;
  int _page = 1;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load({bool more = false}) async {
    setState(() {
      if (more) {
        _loadingMore = true;
      } else {
        _loading = true;
        _error = null;
      }
    });
    try {
      final page = more ? _page + 1 : 1;
      final res =
          await ReviewRepository.instance.productReviews(widget.productId, page: page);
      if (!mounted) return;
      setState(() {
        if (!more) _reviews.clear();
        _reviews.addAll(res.reviews);
        _avg = res.ratingAvg;
        _count = res.ratingCount;
        _breakdown = res.breakdown;
        _hasMore = res.hasMore;
        _page = page;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _error = 'Could not load reviews.');
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
          _loadingMore = false;
        });
      }
    }
  }

  Widget _stars(double value, {double size = 14}) => Row(
        mainAxisSize: MainAxisSize.min,
        children: List.generate(5, (i) {
          final icon = value >= i + 1
              ? Icons.star_rounded
              : value > i
                  ? Icons.star_half_rounded
                  : Icons.star_outline_rounded;
          return Icon(icon, size: size, color: AppColors.starDeep);
        }),
      );

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Customer Reviews',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800)),
          const SizedBox(height: 10),
          if (_loading)
            const Padding(
              padding: EdgeInsets.all(16),
              child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
            )
          else if (_error != null)
            Row(children: [
              Text(_error!, style: const TextStyle(color: _kSubtext)),
              TextButton(onPressed: _load, child: const Text('Retry')),
            ])
          else if (_count == 0)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border.all(color: _kBorder),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Text('No reviews yet.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: _kSubtext)),
            )
          else ...[
            _summary(),
            const SizedBox(height: 12),
            ..._reviews.map(_reviewTile),
            if (_hasMore)
              Center(
                child: TextButton(
                  onPressed: _loadingMore ? null : () => _load(more: true),
                  child: Text(_loadingMore ? 'Loading…' : 'Load more reviews',
                      style: const TextStyle(color: _kSecondary)),
                ),
              ),
          ],
        ],
      ),
    );
  }

  Widget _summary() {
    final avg = _avg ?? 0;
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(children: [
          Text(avg.toStringAsFixed(1),
              style: const TextStyle(
                  fontSize: 30, fontWeight: FontWeight.w800, color: _kPrimary)),
          _stars(avg),
          const SizedBox(height: 2),
          Text('$_count rating${_count == 1 ? '' : 's'}',
              style: const TextStyle(fontSize: 11, color: _kSubtext)),
        ]),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            children: [5, 4, 3, 2, 1].map((s) {
              final n = _breakdown[s] ?? 0;
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 1.5),
                child: Row(children: [
                  SizedBox(
                      width: 12,
                      child: Text('$s', style: const TextStyle(fontSize: 11))),
                  const Icon(Icons.star_rounded, size: 11, color: AppColors.star),
                  const SizedBox(width: 4),
                  Expanded(
                    child: LinearProgressIndicator(
                      value: _count == 0 ? 0 : n / _count,
                      minHeight: 6,
                      backgroundColor: AppColors.chip,
                      color: AppColors.starDeep,
                      borderRadius: BorderRadius.circular(3),
                    ),
                  ),
                  const SizedBox(width: 6),
                  SizedBox(
                      width: 22,
                      child: Text('$n',
                          style:
                              const TextStyle(fontSize: 11, color: _kSubtext))),
                ]),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  Widget _reviewTile(ProductReview r) {
    final date = r.createdAt;
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: _kBorder),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            CircleAvatar(
              radius: 14,
              backgroundColor: AppColors.chip,
              child: Text(r.buyerName.isNotEmpty ? r.buyerName[0] : '?',
                  style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: _kSecondary)),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(r.buyerName,
                  style: const TextStyle(
                      fontSize: 12, fontWeight: FontWeight.w700)),
            ),
            if (date != null)
              Text(
                  '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}',
                  style: const TextStyle(fontSize: 10, color: _kSubtext)),
          ]),
          const SizedBox(height: 6),
          Row(children: [
            _stars(r.rating.toDouble(), size: 13),
            if (r.isEdited)
              const Padding(
                padding: EdgeInsets.only(left: 6),
                child: Text('(edited)',
                    style: TextStyle(fontSize: 10, color: _kSubtext)),
              ),
          ]),
          if (r.variantLabel != null && r.variantLabel!.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Text('Variation: ${r.variantLabel}',
                  style: const TextStyle(fontSize: 11, color: _kSubtext)),
            ),
          if (r.comment != null && r.comment!.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 6),
              // Plain text — never rendered as HTML.
              child: Text(r.comment!,
                  style: const TextStyle(fontSize: 12, height: 1.45)),
            ),
          if (r.images.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: SizedBox(
                height: 64,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: r.images.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 6),
                  itemBuilder: (ctx, i) => GestureDetector(
                    onTap: () => showDialog(
                      context: ctx,
                      builder: (_) => Dialog(
                        child: InteractiveViewer(
                            child: Image.network(r.images[i])),
                      ),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(6),
                      child: Image.network(r.images[i],
                          width: 64,
                          height: 64,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(
                              width: 64,
                              height: 64,
                              color: AppColors.chip,
                              child: const Icon(Icons.broken_image_outlined))),
                    ),
                  ),
                ),
              ),
            ),
          if (r.sellerReply != null && r.sellerReply!.isNotEmpty)
            Container(
              margin: const EdgeInsets.only(top: 8),
              padding: const EdgeInsets.all(8),
              width: double.infinity,
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text("Seller's reply: ${r.sellerReply}",
                  style: const TextStyle(fontSize: 11, height: 1.4)),
            ),
        ],
      ),
    );
  }
}
