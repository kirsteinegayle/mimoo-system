import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

import '../models/order.dart' as api_order;
import '../services/maps/maps_service.dart';

const _kPrimary = Color(0xFF34175B);
const _kSecondary = Color(0xFF6B38D4);
const _kBorder = Color(0xFFDDD8F0);
const _kSubtext = Color(0xFF8A84A3);
const _kGreen = Color(0xFF1DB966);

/// Live rider position is NOT available (no deliveries table / rider
/// location endpoint). When the rider side exists, render its marker in
/// [_DeliveryMap] and flip this flag off.
const bool kShowRiderComingSoon = true;

/// Order tracker: status timeline (always) + delivery-address map
/// (shipped / completed only, never cancelled). Mobile-only; the web has no
/// map equivalent.
class OrderTrackingSection extends StatelessWidget {
  const OrderTrackingSection({super.key, required this.order});
  final api_order.Order order;

  static const _steps = [
    ('Order placed', Icons.receipt_long_outlined),
    ('Packed', Icons.inventory_2_outlined),
    ('Shipped', Icons.local_shipping_outlined),
    ('Completed', Icons.check_circle_outline),
  ];

  int get _reached {
    switch (order.status) {
      case api_order.OrderStatus.packed:
        return 1;
      case api_order.OrderStatus.shipped:
        return 2;
      case api_order.OrderStatus.completed:
        return 3;
      default:
        return 0; // pending / paid
    }
  }

  bool get _showMap =>
      order.status == api_order.OrderStatus.shipped ||
      order.status == api_order.OrderStatus.completed;

  @override
  Widget build(BuildContext context) {
    final cancelled = order.status == api_order.OrderStatus.cancelled ||
        order.status == api_order.OrderStatus.failed;
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Order status',
              style: TextStyle(fontWeight: FontWeight.w700)),
          const SizedBox(height: 10),
          if (cancelled)
            Row(children: [
              Icon(Icons.cancel_outlined, color: Colors.red.shade600, size: 20),
              const SizedBox(width: 8),
              Text(order.status == api_order.OrderStatus.failed ? 'Failed' : 'Cancelled',
                  style: TextStyle(
                      color: Colors.red.shade600, fontWeight: FontWeight.w700)),
            ])
          else
            ...List.generate(_steps.length, (i) {
              final done = i <= _reached;
              final last = i == _steps.length - 1;
              return Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Column(children: [
                    Icon(done ? Icons.check_circle : _steps[i].$2,
                        size: 20, color: done ? _kGreen : _kSubtext),
                    if (!last)
                      Container(
                          width: 2,
                          height: 22,
                          color: i < _reached ? _kGreen : _kBorder),
                  ]),
                  const SizedBox(width: 10),
                  Padding(
                    padding: const EdgeInsets.only(top: 1),
                    child: Text(_steps[i].$1,
                        style: TextStyle(
                            fontWeight: i == _reached ? FontWeight.w800 : FontWeight.w500,
                            color: done ? _kPrimary : _kSubtext)),
                  ),
                ],
              );
            }),
          if (!cancelled && _showMap) ...[
            const SizedBox(height: 12),
            _DeliveryMap(address: order.shippingAddress ?? ''),
          ],
        ],
      ),
    );
  }
}

/// Map pin for the delivery address. Falls back to text when there is no
/// key, the Maps script fails to load, or geocoding fails — never throws.
class _DeliveryMap extends StatefulWidget {
  const _DeliveryMap({required this.address});
  final String address;

  @override
  State<_DeliveryMap> createState() => _DeliveryMapState();
}

class _DeliveryMapState extends State<_DeliveryMap> {
  late final Future<(double, double)?> _coords = _resolve();

  Future<(double, double)?> _resolve() async {
    final maps = MapsService.instance;
    if (!maps.hasKey || widget.address.trim().isEmpty) return null;
    if (!await maps.ensureLoaded()) return null;
    return maps.geocode(widget.address);
  }

  Widget _textFallback(String note) => Container(
        width: double.infinity,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFFF5F4FC),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Icon(Icons.location_on_outlined, color: _kSecondary, size: 20),
          const SizedBox(width: 8),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('Delivery address',
                  style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12)),
              const SizedBox(height: 2),
              Text(widget.address.isEmpty ? '—' : widget.address,
                  style: const TextStyle(fontSize: 12)),
              const SizedBox(height: 4),
              Text(note, style: const TextStyle(fontSize: 10, color: _kSubtext)),
            ]),
          ),
        ]),
      );

  @override
  Widget build(BuildContext context) {
    if (!MapsService.instance.hasKey) {
      return _textFallback('Map unavailable (no Maps API key configured).');
    }
    return FutureBuilder<(double, double)?>(
      future: _coords,
      builder: (context, snap) {
        if (snap.connectionState != ConnectionState.done) {
          return Container(
            height: 180,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: const Color(0xFFF5F4FC),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const CircularProgressIndicator(strokeWidth: 2),
          );
        }
        final c = snap.data;
        if (c == null) {
          return _textFallback('Could not find this address on the map.');
        }
        final pos = LatLng(c.$1, c.$2);
        return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: SizedBox(
              height: 200,
              child: GoogleMap(
                initialCameraPosition: CameraPosition(target: pos, zoom: 15),
                markers: {
                  Marker(
                    markerId: const MarkerId('delivery'),
                    position: pos,
                    infoWindow: const InfoWindow(title: 'Delivery address'),
                  ),
                  // Rider marker goes here once a rider location endpoint exists.
                },
                zoomControlsEnabled: false,
                myLocationButtonEnabled: false,
                mapToolbarEnabled: false,
              ),
            ),
          ),
          const SizedBox(height: 6),
          Text(widget.address, style: const TextStyle(fontSize: 12, color: _kSubtext)),
          if (kShowRiderComingSoon)
            const Padding(
              padding: EdgeInsets.only(top: 4),
              child: Text('Rider location coming soon',
                  style: TextStyle(fontSize: 10, color: _kSubtext)),
            ),
        ]);
      },
    );
  }
}
