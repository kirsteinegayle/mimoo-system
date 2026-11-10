import 'package:flutter/material.dart';
import '../../models/courier_models.dart';
import '../../services/api_service.dart';
import '../../services/courier_repository.dart';
import '../../theme/mimoo_theme.dart';
import '../../widgets/courier_shared.dart';
import 'trip_detail_page.dart';

class TripsPage extends StatefulWidget {
  const TripsPage({super.key, this.embedded = false});

  final bool embedded;

  @override
  State<TripsPage> createState() => _TripsPageState();
}

class _TripsPageState extends State<TripsPage> {
  List<CourierTrip> _items = [];
  Map<String, int> _stats = {};
  bool _loading = true;
  String? _error;
  String _filter = 'active';

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
      final r = await CourierRepository.instance.trips(filter: _filter);
      if (!mounted) return;
      setState(() {
        _items = r.items;
        _stats = r.stats;
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

  Future<void> _open(CourierTrip trip) async {
    await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => TripDetailPage(id: trip.id)),
    );
    if (mounted) _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kSurface,
      appBar: widget.embedded
          ? null
          : AppBar(
              backgroundColor: kCard,
              title: Text('My Trips',
                  style: pjs(size: 17, weight: FontWeight.w800)),
              actions: [
                IconButton(
                  tooltip: 'Refresh',
                  onPressed: _load,
                  icon: const Icon(Icons.refresh, size: 20),
                ),
              ],
            ),
      body: Column(children: [
        SizedBox(
          height: 44,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            children: [
              ('active', 'Active', _stats['active']),
              ('history', 'History', _stats['completed']),
              ('all', 'All', null),
            ].map((f) {
              final selected = _filter == f.$1;
              final label = f.$3 == null ? f.$2 : '${f.$2} (${f.$3})';
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: FilterChip(
                  label: Text(label,
                      style: pjs(
                          size: 12,
                          weight: FontWeight.w600,
                          color: selected ? Colors.white : kSubtext)),
                  selected: selected,
                  onSelected: (_) {
                    setState(() => _filter = f.$1);
                    _load();
                  },
                  selectedColor: kPrimary,
                  backgroundColor: kSurface,
                  checkmarkColor: Colors.white,
                  side: BorderSide(color: selected ? kPrimary : kBorder),
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                ),
              );
            }).toList(),
          ),
        ),
        const Divider(height: 1, color: kBorder),
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator(color: kPrimary))
              : _error != null
                  ? CourierErrorState(message: _error!, onRetry: _load)
                  : _items.isEmpty
                      ? CourierEmptyState(
                          icon: Icons.local_shipping_outlined,
                          message: _filter == 'active'
                              ? 'No active trips. Dispatch will assign one when available.'
                              : 'No trips found.',
                        )
                      : RefreshIndicator(
                          color: kPrimary,
                          onRefresh: _load,
                          child: ListView.builder(
                            padding: const EdgeInsets.all(12),
                            itemCount: _items.length,
                            itemBuilder: (_, i) => _TripCard(
                              trip: _items[i],
                              onTap: () => _open(_items[i]),
                            ),
                          ),
                        ),
        ),
      ]),
    );
  }
}

class _TripCard extends StatelessWidget {
  const _TripCard({required this.trip, required this.onTap});
  final CourierTrip trip;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
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
              child: Text(trip.tripCode,
                  style: pjs(size: 14, weight: FontWeight.w800)),
            ),
            CourierStatusBadge(status: trip.status),
          ]),
          const SizedBox(height: 5),
          Row(children: [
            const Icon(Icons.route_outlined, size: 14, color: kSubtext),
            const SizedBox(width: 4),
            Expanded(
              child: Text(trip.route, style: pjs(size: 12, color: kSubtext)),
            ),
          ]),
          const SizedBox(height: 2),
          Row(children: [
            const Icon(Icons.inventory_2_outlined, size: 14, color: kSubtext),
            const SizedBox(width: 4),
            Text(
              '${trip.parcelsCount} parcels · ${trip.totalWeight.toStringAsFixed(1)} kg',
              style: pjs(size: 12, color: kSubtext),
            ),
          ]),
          if (trip.payAmount > 0) ...[
            const SizedBox(height: 2),
            Text('Trip pay ₱${trip.payAmount.toStringAsFixed(2)}',
                style: pjs(
                    size: 12, weight: FontWeight.w800, color: kGreen)),
          ],
          if (trip.status == 'loading') ...[
            const SizedBox(height: 8),
            LinearProgressIndicator(
              value: trip.parcelsCount == 0
                  ? 0
                  : trip.loadedCount / trip.parcelsCount,
              color: kPrimary,
              backgroundColor: kChip,
              minHeight: 6,
              borderRadius: BorderRadius.circular(99),
            ),
            const SizedBox(height: 3),
            Text(
              'Loaded ${trip.loadedCount}/${trip.parcelsCount}',
              style: pjs(size: 10, color: kSubtext),
            ),
          ],
          if (trip.declineReason != null || trip.cancellationReason != null)
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Text(
                trip.declineReason ?? trip.cancellationReason!,
                style: pjs(size: 11, color: kFlash),
              ),
            ),
        ]),
      ),
    );
  }
}
