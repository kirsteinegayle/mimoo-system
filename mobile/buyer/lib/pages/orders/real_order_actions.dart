import 'package:flutter/material.dart';

import '../../models/order.dart' as api_order;
import '../../services/api_service.dart';
import '../../services/order_repository.dart';
import 'order_transit_page.dart';
import 'return_request_pages.dart';
import 'write_review_page.dart';
import '../../theme/app_theme.dart';

const _kPrimary = AppColors.primary;
const _kSecondary = AppColors.accent;

/// Action buttons for REAL (API) orders beyond cancel:
///   - Rate (completed orders with an item that can still be reviewed / edited)
///   - Return status (when the order has a return request)
///   - Request Return (shipped / completed, within 7 days, no open request)
class RealOrderActions extends StatelessWidget {
  const RealOrderActions(
      {super.key, required this.order, required this.onChanged, this.showTrack = true});

  final api_order.Order order;
  final VoidCallback onChanged;

  /// False on the order detail page itself (it already shows the tracker).
  final bool showTrack;

  Future<void> _receive(BuildContext context) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Confirm receipt?'),
        content: const Text(
            'Only confirm if you have received your items in good condition.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Not yet')),
          TextButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('Yes, received')),
        ],
      ),
    );
    if (ok != true || !context.mounted) return;
    final messenger = ScaffoldMessenger.of(context);
    try {
      await OrderRepository.instance.receiveOrder(order.id);
      messenger.showSnackBar(const SnackBar(
        content: Text('Order received. Thank you!'),
        backgroundColor: _kPrimary,
        behavior: SnackBarBehavior.floating,
      ));
      onChanged();
    } catch (e) {
      messenger.showSnackBar(SnackBar(
        content: Text(e is ApiException
            ? e.message
            : 'Could not confirm receipt. Please try again.'),
        backgroundColor: AppColors.error,
        behavior: SnackBarBehavior.floating,
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    // Reviews: completed (delivered) orders only, same rule as the web.
    // Write while an item can still be reviewed, otherwise Edit (within the
    // edit window) or View. Any other status shows no review button.
    final isCompleted = order.status == api_order.OrderStatus.completed;
    final canWrite = isCompleted && order.items.any((i) => i.reviewId == null && i.canReview);
    final anyReviewed = isCompleted && order.items.any((i) => i.reviewId != null);
    final canEdit = anyReviewed && order.items.any((i) => i.reviewId != null && i.reviewCanEdit);
    final showReview = canWrite || anyReviewed;
    final reviewLabel = canWrite ? 'Write a Review' : (canEdit ? 'Edit Review' : 'View Review');

    final isShipped = order.status == api_order.OrderStatus.shipped;
    final hasOpenReturn = const ['pending', 'approved', 'escalated']
        .contains(order.returnStatus);

    // in_transit: Track Order opens Order details (delivery code card).
    // "Order Received" stays shipped-only (server rejects receive otherwise).
    final isInTransit = order.status == api_order.OrderStatus.inTransit;
    final trackable = showTrack && (isShipped || isCompleted || isInTransit);

    final buttons = <Widget>[
      // Order tracker (timeline + delivery map) — opened on demand so the
      // orders list never loads maps.
      if (trackable)
        OutlinedButton.icon(
          style: OutlinedButton.styleFrom(
            minimumSize: const Size(0, 40),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
          onPressed: () async {
            await Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (_) => OrderTransitPage(orderId: order.id)),
            );
            onChanged();
          },
          icon: const Icon(Icons.timeline, size: 16),
          label: const Text('Track Order'),
        ),
      if (isShipped && !hasOpenReturn)
        ElevatedButton.icon(
          style: ElevatedButton.styleFrom(
            backgroundColor: _kPrimary,
            foregroundColor: Colors.white,
            elevation: 0,
            minimumSize: const Size(0, 40),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
          onPressed: () => _receive(context),
          icon: const Icon(Icons.inventory_outlined, size: 16),
          label: const Text('Order Received'),
        ),
      if (showReview)
        ElevatedButton.icon(
          style: ElevatedButton.styleFrom(
            backgroundColor: _kPrimary,
            foregroundColor: Colors.white,
            elevation: 0,
            minimumSize: const Size(0, 40),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
          onPressed: () async {
            final changed = await Navigator.push<bool>(
              context,
              MaterialPageRoute(builder: (_) => ReviewItemsPage(order: order)),
            );
            if (changed == true) onChanged();
          },
          icon: const Icon(Icons.star_outline_rounded, size: 16),
          label: Text(reviewLabel),
        ),
      if (order.returnId != null)
        OutlinedButton.icon(
          style: OutlinedButton.styleFrom(
            minimumSize: const Size(0, 40),
            side: BorderSide(color: returnStatusColor(order.returnStatus ?? '')),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
          onPressed: () async {
            await Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (_) => ReturnStatusPage(returnId: order.returnId!)),
            );
            onChanged();
          },
          icon: Icon(Icons.assignment_return_outlined,
              size: 16, color: returnStatusColor(order.returnStatus ?? '')),
          label: Text('Return: ${returnStatusLabel(order.returnStatus ?? '')}',
              style: TextStyle(color: returnStatusColor(order.returnStatus ?? ''))),
        ),
      if (order.canReturn)
        OutlinedButton.icon(
          style: OutlinedButton.styleFrom(
            minimumSize: const Size(0, 40),
            side: const BorderSide(color: _kSecondary),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
          onPressed: () async {
            await Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => ReturnRequestFormPage(
                    orderId: order.id, orderNumber: order.orderNumber),
              ),
            );
            onChanged();
          },
          icon: const Icon(Icons.assignment_return_outlined,
              size: 16, color: _kSecondary),
          label: const Text('Request Return',
              style: TextStyle(color: _kSecondary)),
        ),
    ];

    if (buttons.isEmpty) return const SizedBox.shrink();
    return Wrap(
      alignment: WrapAlignment.end,
      spacing: 8,
      runSpacing: 8,
      children: buttons,
    );
  }
}
