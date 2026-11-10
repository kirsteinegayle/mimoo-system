import 'dart:typed_data';

import 'package:flutter/material.dart';

import '../../models/order.dart' as api_order;
import '../../services/api_service.dart';
import '../../services/review_repository.dart';
import '../../utils/image_pick.dart';
import '../../theme/app_theme.dart';

const _kPrimary = AppColors.primary;
const _kSecondary = AppColors.accent;
const _kBorder = AppColors.border;
const _kSubtext = AppColors.textMuted;

/// Lists the items of a completed order with Rate / Edit buttons.
class ReviewItemsPage extends StatelessWidget {
  const ReviewItemsPage({super.key, required this.order});
  final api_order.Order order;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Rate Products'),
        backgroundColor: Colors.white,
        foregroundColor: _kPrimary,
        elevation: 0.5,
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: order.items.length,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (ctx, i) {
          final it = order.items[i];
          final reviewed = it.reviewId != null;
          return Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: _kBorder),
            ),
            child: Row(children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: (it.imageUrl ?? '').isNotEmpty
                    ? Image.network(it.imageUrl!,
                        width: 56, height: 56, fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => _ph())
                    : _ph(),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(it.productName,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 4),
                    if (reviewed)
                      Row(children: [
                        ...List.generate(
                            5,
                            (s) => Icon(
                                s < (it.reviewRating ?? 0)
                                    ? Icons.star_rounded
                                    : Icons.star_outline_rounded,
                                size: 14,
                                color: AppColors.starDeep)),
                        const SizedBox(width: 4),
                        const Text('Reviewed',
                            style: TextStyle(fontSize: 11, color: _kSubtext)),
                      ])
                    else if (!it.canReview)
                      const Text('Review period has ended',
                          style: TextStyle(fontSize: 11, color: _kSubtext)),
                  ],
                ),
              ),
              if (!reviewed && it.canReview)
                FilledButton(
                  style: FilledButton.styleFrom(backgroundColor: _kSecondary),
                  onPressed: () async {
                    final ok = await Navigator.push<bool>(
                      ctx,
                      MaterialPageRoute(
                          builder: (_) =>
                              WriteReviewPage(orderId: order.id, item: it)),
                    );
                    if (ok == true && ctx.mounted) Navigator.pop(ctx, true);
                  },
                  child: const Text('Rate'),
                )
              else if (reviewed && it.reviewCanEdit)
                OutlinedButton(
                  onPressed: () async {
                    final ok = await Navigator.push<bool>(
                      ctx,
                      MaterialPageRoute(
                          builder: (_) =>
                              WriteReviewPage(orderId: order.id, item: it)),
                    );
                    if (ok == true && ctx.mounted) Navigator.pop(ctx, true);
                  },
                  child: const Text('Edit'),
                ),
            ]),
          );
        },
      ),
    );
  }

  Widget _ph() => Container(
      width: 56,
      height: 56,
      color: AppColors.chip,
      child: const Icon(Icons.image_outlined, color: _kSubtext));
}

/// Write a new review, or edit an existing one (once, within 30 days).
class WriteReviewPage extends StatefulWidget {
  const WriteReviewPage({super.key, required this.orderId, required this.item});
  final int orderId;
  final api_order.OrderItem item;

  @override
  State<WriteReviewPage> createState() => _WriteReviewPageState();
}

class _WriteReviewPageState extends State<WriteReviewPage> {
  late int _rating;
  late final TextEditingController _comment;
  final List<PickedImage> _images = [];
  bool _sending = false;
  String? _error;

  bool get _isEdit => widget.item.reviewId != null;

  @override
  void initState() {
    super.initState();
    _rating = widget.item.reviewRating ?? 0;
    _comment = TextEditingController(text: widget.item.reviewComment ?? '');
  }

  @override
  void dispose() {
    _comment.dispose();
    super.dispose();
  }

  Future<void> _addPhotos() async {
    final res = await pickImages(remaining: 5 - _images.length);
    if (!mounted) return;
    setState(() => _images.addAll(res.images));
    if (res.warning != null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(res.warning!), behavior: SnackBarBehavior.floating));
    }
  }

  Future<void> _submit() async {
    if (_rating < 1) {
      setState(() => _error = 'Please select a star rating.');
      return;
    }
    setState(() {
      _sending = true;
      _error = null;
    });
    try {
      if (_isEdit) {
        await ReviewRepository.instance.update(
          reviewId: widget.item.reviewId!,
          rating: _rating,
          comment: _comment.text,
          images: _images,
        );
      } else {
        await ReviewRepository.instance.submit(
          orderId: widget.orderId,
          itemId: widget.item.id,
          rating: _rating,
          comment: _comment.text,
          images: _images,
        );
      }
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(_isEdit ? 'Review updated.' : 'Thank you for your review!'),
        backgroundColor: _kPrimary,
        behavior: SnackBarBehavior.floating,
      ));
      Navigator.pop(context, true);
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _error = e.errors?.values.first.first ?? e.message);
    } catch (_) {
      if (!mounted) return;
      setState(() => _error = 'Could not submit. Check your connection and try again.');
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    const labels = ['', 'Terrible', 'Poor', 'Fair', 'Good', 'Amazing'];
    return Scaffold(
      appBar: AppBar(
        title: Text(_isEdit ? 'Edit Review' : 'Rate Product'),
        backgroundColor: Colors.white,
        foregroundColor: _kPrimary,
        elevation: 0.5,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(widget.item.productName,
              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
          if (_isEdit)
            const Padding(
              padding: EdgeInsets.only(top: 6),
              child: Text('You can edit your review only once.',
                  style: TextStyle(color: _kSubtext, fontSize: 12)),
            ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(5, (i) {
              return IconButton(
                iconSize: 40,
                onPressed: () => setState(() => _rating = i + 1),
                icon: Icon(
                    i < _rating ? Icons.star_rounded : Icons.star_outline_rounded,
                    color: AppColors.starDeep),
              );
            }),
          ),
          Center(
            child: Text(_rating == 0 ? 'Tap a star to rate' : labels[_rating],
                style: const TextStyle(color: _kSubtext)),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _comment,
            maxLength: 500,
            maxLines: 5,
            decoration: InputDecoration(
              hintText: 'Share your experience with this product (optional)',
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
            ),
          ),
          const SizedBox(height: 8),
          Text(
              _isEdit
                  ? 'Photos (${_images.length}/5) — adding photos replaces your old ones'
                  : 'Photos (${_images.length}/5)',
              style: const TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              ..._images.asMap().entries.map((e) => Stack(children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Image.memory(Uint8List.fromList(e.value.bytes),
                          width: 72, height: 72, fit: BoxFit.cover),
                    ),
                    Positioned(
                      right: 0,
                      top: 0,
                      child: GestureDetector(
                        onTap: () => setState(() => _images.removeAt(e.key)),
                        child: const CircleAvatar(
                            radius: 10,
                            backgroundColor: Colors.black54,
                            child: Icon(Icons.close, size: 12, color: Colors.white)),
                      ),
                    ),
                  ])),
              if (_images.length < 5)
                InkWell(
                  onTap: _sending ? null : _addPhotos,
                  child: Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      border: Border.all(color: _kBorder),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.add_a_photo_outlined, color: _kSubtext),
                  ),
                ),
            ],
          ),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Text(_error!, style: const TextStyle(color: AppColors.error)),
            ),
          const SizedBox(height: 20),
          FilledButton(
            style: FilledButton.styleFrom(
                backgroundColor: _kSecondary,
                minimumSize: const Size.fromHeight(48)),
            onPressed: _sending ? null : _submit,
            child: _sending
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: Colors.white))
                : Text(_isEdit ? 'Update Review' : 'Submit Review'),
          ),
        ],
      ),
    );
  }
}
