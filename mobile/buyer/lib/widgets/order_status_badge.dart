import 'package:flutter/material.dart';
import '../models/order.dart';
import '../theme/app_theme.dart';

class OrderStatusBadge extends StatelessWidget {
  const OrderStatusBadge({super.key, required this.status});
  final OrderStatus status;

  @override
  Widget build(BuildContext context) {
    final (label, color) = switch (status) {
      OrderStatus.pending => ('Pending', AppColors.textMuted),
      OrderStatus.paid => ('Paid', Colors.blue),
      OrderStatus.packed => ('Packed', Colors.indigo),
      // shipped and in_transit both read "In Transit" (no backwards step).
      OrderStatus.shipped => ('In Transit', AppColors.orange),
      OrderStatus.completed => ('Completed', AppColors.success),
      OrderStatus.cancelled => ('Cancelled', AppColors.error),
      OrderStatus.failed => ('Failed', AppColors.error),
      // Legacy values — kept for compat, not returned by server
      OrderStatus.toShip => ('To Ship', Colors.blue),
      OrderStatus.inTransit => ('In Transit', AppColors.orange),
      OrderStatus.outForDelivery => ('Out for Delivery', AppColors.accent),
      OrderStatus.delivered => ('Delivered', AppColors.success),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.4)),
      ),
      child: Text(label,
          style: TextStyle(
              color: color, fontSize: 12, fontWeight: FontWeight.w600)),
    );
  }
}
