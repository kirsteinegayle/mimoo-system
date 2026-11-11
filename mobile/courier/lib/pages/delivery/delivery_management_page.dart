import 'package:flutter/material.dart';
import '../../models/courier_models.dart';
import '../../services/api_service.dart';
import '../../services/courier_repository.dart';
import '../../theme/mimoo_theme.dart';
import '../../widgets/courier_shared.dart';

/// Delivery Management (bottom tab): same data and rules as the web page.
///
///   GET  /api/courier-app/delivery-orders   orders handled by this courier
///   GET  /api/courier-app/delivery-riders   ONLINE riders of this courier
///   POST /api/courier-app/delivery-jobs     assign (server re-checks everything)
///
/// Not yet picked up from the seller → "Awaiting pickup", no Assign button.
class DeliveryManagementPage extends StatefulWidget {
  const DeliveryManagementPage({super.key});

  @override
  State<DeliveryManagementPage> createState() => _DeliveryManagementPageState();
}

class _DeliveryManagementPageState extends State<DeliveryManagementPage> {
  List<DeliveryOrderItem> _orders = [];
  List<DeliveryRiderItem> _riders = [];
  String? _ridersMessage;
  bool _loading = true;
  bool _acting = false;
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
      final results = await Future.wait([
        CourierRepository.instance.deliveryOrders(),
        CourierRepository.instance.deliveryRiders(),
      ]);
      if (!mounted) return;
      final orders = results[0]
          as ({List<DeliveryOrderItem> items, Map<String, int> meta});
      final riders =
          results[1] as ({List<DeliveryRiderItem> items, String? message});
      setState(() {
        _orders = orders.items;
        _riders = riders.items;
        _ridersMessage = riders.message;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = ApiService.friendlyError(e);
      });
    }
  }

  Future<void> _assign(DeliveryOrderItem order) async {
    // Fresh list so a rider who just went offline is not offered.
    try {
      final r = await CourierRepository.instance.deliveryRiders();
      if (!mounted) return;
      setState(() {
        _riders = r.items;
        _ridersMessage = r.message;
      });
    } catch (_) {}
    if (!mounted) return;
    if (_riders.isEmpty) {
      courierSnack(
          context,
          _ridersMessage ??
              'No riders are online right now. A rider must go online in the rider app.',
          kSubtext);
      return;
    }

    final rider = await showDialog<DeliveryRiderItem>(
      context: context,
      builder: (_) => SimpleDialog(
        title: Text('Assign rider · ${order.orderNumber}',
            style: pjs(size: 15, weight: FontWeight.w800)),
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 0, 24, 8),
            child: Text('Online riders of your company',
                style: pjs(size: 11, color: kSubtext)),
          ),
          ..._riders.map((r) => SimpleDialogOption(
                onPressed: () => Navigator.pop(context, r),
                child: Row(children: [
                  const Icon(Icons.circle, size: 9, color: kGreen),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(r.name,
                              style: pjs(size: 13, weight: FontWeight.w700)),
                          Text(
                            [
                              if (r.vehicleType != null)
                                displayStatus(r.vehicleType!),
                              '${r.activeJobs} active job${r.activeJobs == 1 ? '' : 's'}',
                            ].join(' · '),
                            style: pjs(size: 11, color: kSubtext),
                          ),
                        ]),
                  ),
                ]),
              )),
        ],
      ),
    );
    if (rider == null || !mounted) return;

    setState(() => _acting = true);
    try {
      final msg = await CourierRepository.instance
          .assignDeliveryRider(order.id, rider.personnelId);
      if (!mounted) return;
      courierSnack(context, '$msg ${rider.name} → ${order.orderNumber}', kGreen);
      await _load();
    } on ApiException catch (e) {
      if (mounted) courierSnack(context, e.message, kFlash);
    } catch (e) {
      if (mounted) courierSnack(context, ApiService.friendlyError(e), kFlash);
    } finally {
      if (mounted) setState(() => _acting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator(color: kPrimary));
    }
    if (_error != null) {
      return CourierErrorState(message: _error!, onRetry: _load);
    }

    final ready = _orders.where((o) => o.assignable).length;
    final waiting = _orders.where((o) => !o.pickedUp && !o.hasJob).length;

    return Stack(children: [
      RefreshIndicator(
        color: kPrimary,
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Row(children: [
              _stat('Ready to assign', '$ready', kPrimary),
              const SizedBox(width: 8),
              _stat('Awaiting pickup', '$waiting', Colors.orange),
              const SizedBox(width: 8),
              _stat('Online riders', '${_riders.length}', kGreen),
            ]),
            if (_riders.isEmpty) ...[
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(11),
                decoration: BoxDecoration(
                  color: Colors.orange.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.orange.withValues(alpha: 0.3)),
                ),
                child: Text(
                  _ridersMessage ??
                      'No riders are online right now. Riders must be approved and go online in the rider app.',
                  style: pjs(size: 11, color: Colors.orange.shade800),
                ),
              ),
            ],
            const SizedBox(height: 12),
            if (_orders.isEmpty)
              const Padding(
                padding: EdgeInsets.only(top: 40),
                child: CourierEmptyState(
                  icon: Icons.route_outlined,
                  message:
                      'No orders for delivery yet. Orders appear here after your company accepts the shipment.',
                ),
              )
            else
              ..._orders.map(_orderCard),
          ],
        ),
      ),
      if (_acting)
        const Positioned.fill(
          child: ColoredBox(
            color: Color(0x33000000),
            child: Center(child: CircularProgressIndicator(color: kPrimary)),
          ),
        ),
    ]);
  }

  Widget _stat(String label, String value, Color color) => Expanded(
        child: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: kCard,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: kBorder),
          ),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(value, style: pjs(size: 18, weight: FontWeight.w900, color: color)),
            Text(label, style: pjs(size: 10, color: kSubtext)),
          ]),
        ),
      );

  Widget _orderCard(DeliveryOrderItem o) {
    final Widget action;
    if (o.hasJob) {
      action = Row(children: [
        const Icon(Icons.two_wheeler, size: 16, color: kGreen),
        const SizedBox(width: 6),
        Expanded(
          child: Text('Rider: ${o.jobRiderName ?? '-'}',
              style: pjs(size: 12, weight: FontWeight.w700)),
        ),
        CourierStatusBadge(status: o.jobStatus!),
      ]);
    } else if (!o.pickedUp) {
      action = Row(children: [
        const Icon(Icons.hourglass_empty, size: 16, color: Colors.orange),
        const SizedBox(width: 6),
        Text('Awaiting pickup',
            style: pjs(size: 12, weight: FontWeight.w700, color: Colors.orange)),
        if (o.pickupStatus != null) ...[
          const SizedBox(width: 6),
          CourierStatusBadge(status: o.pickupStatus!),
        ],
      ]);
    } else if (o.assignable) {
      action = Align(
        alignment: Alignment.centerRight,
        child: FilledButton.icon(
          onPressed: _acting ? null : () => _assign(o),
          style: FilledButton.styleFrom(backgroundColor: kPrimary),
          icon: const Icon(Icons.person_add_alt_1, size: 16, color: Colors.white),
          label: Text('Assign Rider',
              style: pjs(size: 12, weight: FontWeight.w800, color: Colors.white)),
        ),
      );
    } else {
      action = Text('Not assignable (order is ${displayStatus(o.status)})',
          style: pjs(size: 12, color: kSubtext));
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: kBorder),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Expanded(
            child: Text(o.orderNumber,
                style: pjs(size: 14, weight: FontWeight.w800)),
          ),
          CourierStatusBadge(status: o.status),
        ]),
        if (o.waybillNumber.isNotEmpty)
          Text(o.waybillNumber, style: pjs(size: 11, color: kSubtext)),
        const SizedBox(height: 6),
        Text(o.shippingName, style: pjs(size: 12, weight: FontWeight.w600)),
        Text(o.shippingAddress, style: pjs(size: 12, color: kSubtext)),
        Text(
          o.codAmount > 0
              ? 'COD ₱${o.codAmount.toStringAsFixed(2)}'
              : displayStatus(o.paymentMethod),
          style: pjs(size: 11, color: kSubtext),
        ),
        const Divider(height: 18, color: kBorder),
        action,
      ]),
    );
  }
}
