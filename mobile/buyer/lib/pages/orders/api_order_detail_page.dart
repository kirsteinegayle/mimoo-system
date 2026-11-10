import 'package:flutter/material.dart';

import '../../models/order.dart' as api_order;
import '../../services/api_service.dart';
import '../../services/order_repository.dart';
import 'real_order_actions.dart';
import '../../widgets/order_tracking_section.dart';
import '../../widgets/delivery_code_card.dart';
import '../../widgets/proof_of_delivery_card.dart';
import '../../theme/app_theme.dart';

const _kPrimary = AppColors.primary;
const _kBorder = AppColors.border;
const _kSubtext = AppColors.textMuted;

/// Real order detail loaded by id (used when opening an order from a
/// notification). Shows status, items, shipping snapshot and actions.
class ApiOrderDetailPage extends StatefulWidget {
  const ApiOrderDetailPage({super.key, required this.orderId});
  final int orderId;

  @override
  State<ApiOrderDetailPage> createState() => _ApiOrderDetailPageState();
}

class _ApiOrderDetailPageState extends State<ApiOrderDetailPage> {
  api_order.Order? _order;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final o = await OrderRepository.instance.fetchOrder(widget.orderId);
      if (!mounted) return;
      setState(() => _order = o);
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e is ApiException
          ? (e.statusCode == 404 ? 'Order not found.' : e.message)
          : 'Could not load order. Check your connection.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String _statusText(api_order.OrderStatus s) {
    switch (s) {
      case api_order.OrderStatus.pending:
        return 'Awaiting shipment';
      case api_order.OrderStatus.paid:
        return 'Paid — awaiting shipment';
      case api_order.OrderStatus.packed:
        return 'Packed — ready to ship';
      case api_order.OrderStatus.shipped:
      case api_order.OrderStatus.inTransit:
        return 'In Transit';
      case api_order.OrderStatus.completed:
        return 'Completed';
      case api_order.OrderStatus.cancelled:
        return 'Cancelled';
      default:
        return s.name;
    }
  }

  @override
  Widget build(BuildContext context) {
    final o = _order;
    return Scaffold(
      appBar: AppBar(
        title: Text(o?.orderNumber ?? 'Order'),
        backgroundColor: Colors.white,
        foregroundColor: _kPrimary,
        elevation: 0.5,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : (_error != null || o == null)
              ? Center(
                  child: Column(mainAxisSize: MainAxisSize.min, children: [
                    Text(_error ?? 'Order not found.'),
                    const SizedBox(height: 8),
                    OutlinedButton(onPressed: _load, child: const Text('Retry')),
                  ]),
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      _card(Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(_statusText(o.status),
                              style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w800,
                                  color: _kPrimary)),
                          const SizedBox(height: 4),
                          Text('Placed ${o.createdAt} · ${o.paymentMethod.toUpperCase()}',
                              style: const TextStyle(fontSize: 12, color: _kSubtext)),
                        ],
                      )),
                      // Status timeline + delivery-address map (map only
                      // for shipped / completed; text fallback otherwise).
                      // Rider OTP — only visible while an active code exists.
                      DeliveryCodeCard(orderId: o.id),
                      OrderTrackingSection(order: o),
                      // Proof of delivery — only once delivered; hides itself
                      // when the server has no photo (404).
                      if (o.trackingStatus == 'delivered' ||
                          o.status == api_order.OrderStatus.completed)
                        ProofOfDeliveryCard(orderId: o.id),
                      _card(Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Delivery address',
                              style: TextStyle(fontWeight: FontWeight.w700)),
                          const SizedBox(height: 6),
                          Text('${o.shippingName ?? ''}  |  ${o.shippingPhone ?? ''}'),
                          const SizedBox(height: 2),
                          Text(o.shippingAddress ?? '',
                              style: const TextStyle(color: _kSubtext, fontSize: 13)),
                        ],
                      )),
                      _card(Column(
                        children: [
                          ...o.items.map((it) => Padding(
                                padding: const EdgeInsets.symmetric(vertical: 6),
                                child: Row(children: [
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(6),
                                    child: (it.imageUrl ?? '').isNotEmpty
                                        ? Image.network(it.imageUrl!,
                                            width: 48, height: 48, fit: BoxFit.cover,
                                            errorBuilder: (_, __, ___) => _ph())
                                        : _ph(),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Text(it.productName,
                                        maxLines: 2, overflow: TextOverflow.ellipsis),
                                  ),
                                  Text('x${it.quantity}  ₱${it.subtotal.toStringAsFixed(2)}',
                                      style: const TextStyle(fontSize: 12)),
                                ]),
                              )),
                          const Divider(),
                          Row(children: [
                            const Text('Order total',
                                style: TextStyle(fontWeight: FontWeight.w700)),
                            const Spacer(),
                            Text('₱${o.total.toStringAsFixed(2)}',
                                style: const TextStyle(
                                    fontWeight: FontWeight.w800, color: _kPrimary)),
                          ]),
                        ],
                      )),
                      const SizedBox(height: 4),
                      RealOrderActions(order: o, onChanged: _load, showTrack: false),
                    ],
                  ),
                ),
    );
  }

  Widget _card(Widget child) => Container(
        width: double.infinity,
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: _kBorder),
        ),
        child: child,
      );

  Widget _ph() => Container(
      width: 48, height: 48, color: AppColors.chip,
      child: const Icon(Icons.image_outlined, color: _kSubtext, size: 18));
}
