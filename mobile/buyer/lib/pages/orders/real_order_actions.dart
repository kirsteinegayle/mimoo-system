import 'package:flutter/material.dart';

import '../../models/order.dart' as api_order;
import '../../services/api_service.dart';
import '../../services/order_repository.dart';
import 'api_order_detail_page.dart';
import 'return_request_pages.dart';
import 'write_review_page.dart';

const _kPrimary = Color(0xFF34175B);
const _kSecondary = Color(0xFF6B38D4);

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
        backgroundColor: Colors.red.shade700,
        behavior: SnackBarBehavior.floating,
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    final isCompleted = order.status == api_order.OrderStatus.completed;
    final canRate = isCompleted &&
        order.items.any((i) => i.canReview || (i.reviewId != null && i.reviewCanEdit));
    final allReviewed =
        isCompleted && order.items.isNotEmpty && order.items.every((i) => i.reviewId != null);

    final isShipped = order.status == api_order.OrderStatus.shipped;
    final hasOpenReturn = const ['pending', 'approved', 'escalated']
        .contains(order.returnStatus);

    final trackable = showTrack && (isShipped || isCompleted);

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
                  builder: (_) => ApiOrderDetailPage(orderId: order.id)),
            );
            onChanged();
          },
          icon: const Icon(Icons.map_outlined, size: 16),
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
      if (canRate)
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
          label: Text(allReviewed ? 'Edit Review' : 'Rate'),
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
