import 'package:flutter/material.dart';
import '../../models/courier_models.dart';
import '../../services/api_service.dart';
import '../../services/courier_repository.dart';
import '../../theme/mimoo_theme.dart';
import '../../widgets/courier_shared.dart';

class HistoryPage extends StatefulWidget {
  const HistoryPage({super.key});

  @override
  State<HistoryPage> createState() => _HistoryPageState();
}

class _HistoryPageState extends State<HistoryPage> {
  final _searchCtrl = TextEditingController();
  HistorySummary? _summary;
  List<PaymentItem> _payments = [];
  List<HistoryTrip> _trips = [];
  bool _loading = true;
  String? _error;
  String _period = 'week';
  String _view = 'payments';
  DateTime? _from;
  DateTime? _to;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  String? get _dateFrom => _from == null
      ? null
      : '${_from!.year}-${_from!.month.toString().padLeft(2, '0')}-${_from!.day.toString().padLeft(2, '0')}';

  String? get _dateTo => _to == null
      ? null
      : '${_to!.year}-${_to!.month.toString().padLeft(2, '0')}-${_to!.day.toString().padLeft(2, '0')}';

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final summary = await CourierRepository.instance.historySummary(
        period: _period,
        dateFrom: _dateFrom,
        dateTo: _dateTo,
      );
      final payments = await CourierRepository.instance.payments(
        period: _period,
        dateFrom: _dateFrom,
        dateTo: _dateTo,
      );
      final trips = await CourierRepository.instance.historyTrips(
        search: _searchCtrl.text.trim(),
        dateFrom: _dateFrom,
        dateTo: _dateTo,
      );
      if (!mounted) return;
      setState(() {
        _summary = summary;
        _payments = payments.items;
        _trips = trips;
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

  Future<void> _selectPeriod(String period) async {
    if (period == 'custom') {
      final now = DateTime.now();
      final range = await showDateRangePicker(
        context: context,
        firstDate: DateTime(now.year - 2),
        lastDate: now,
        initialDateRange: _from != null && _to != null
            ? DateTimeRange(start: _from!, end: _to!)
            : null,
      );
      if (range == null || !mounted) return;
      _from = range.start;
      _to = range.end;
    }
    setState(() => _period = period);
    await _load();
  }

  Future<void> _openTrip(int id) async {
    await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => HistoryTripDetailPage(id: id)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kSurface,
      appBar: AppBar(
        backgroundColor: kCard,
        title: Text('History & Pay',
            style: pjs(size: 17, weight: FontWeight.w800)),
        actions: [
          IconButton(
            tooltip: 'Refresh',
            onPressed: _loading ? null : _load,
            icon: const Icon(Icons.refresh, size: 20),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: kPrimary))
          : _error != null
              ? CourierErrorState(message: _error!, onRetry: _load)
              : RefreshIndicator(
                  color: kPrimary,
                  onRefresh: _load,
                  child: ListView(
                    padding: const EdgeInsets.all(12),
                    children: [
                      _periodChips(),
                      const SizedBox(height: 10),
                      if (_summary != null) _summaryCard(_summary!),
                      const SizedBox(height: 12),
                      Row(children: [
                        _ViewPill(
                          label: 'Payments',
                          selected: _view == 'payments',
                          onTap: () => setState(() => _view = 'payments'),
                        ),
                        const SizedBox(width: 8),
                        _ViewPill(
                          label: 'Trip History',
                          selected: _view == 'trips',
                          onTap: () => setState(() => _view = 'trips'),
                        ),
                      ]),
                      const SizedBox(height: 10),
                      if (_view == 'trips') _searchField(),
                      if (_view == 'payments') ...[
                        if (_payments.isEmpty)
                          const Padding(
                            padding: EdgeInsets.only(top: 30),
                            child: CourierEmptyState(
                              icon: Icons.payments_outlined,
                              message:
                                  'No payments recorded for this period.',
                            ),
                          )
                        else
                          for (final p in _payments)
                            _PaymentCard(
                              payment: p,
                              onTap: () => _openTrip(p.tripId),
                            ),
                      ] else ...[
                        if (_trips.isEmpty)
                          const Padding(
                            padding: EdgeInsets.only(top: 30),
                            child: CourierEmptyState(
                              icon: Icons.history,
                              message: 'No completed trips found.',
                            ),
                          )
                        else
                          for (final t in _trips)
                            _HistoryTripCard(
                              trip: t,
                              onTap: () => _openTrip(t.id),
                            ),
                      ],
                    ],
                  ),
                ),
    );
  }

  Widget _periodChips() {
    return SizedBox(
      height: 40,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          ('week', 'This Week'),
          ('month', 'This Month'),
          ('custom', 'Custom'),
        ].map((p) {
          final selected = _period == p.$1;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: FilterChip(
              label: Text(p.$2,
                  style: pjs(
                      size: 12,
                      weight: FontWeight.w600,
                      color: selected ? Colors.white : kSubtext)),
              selected: selected,
              onSelected: (_) => _selectPeriod(p.$1),
              selectedColor: kPrimary,
              backgroundColor: kCard,
              checkmarkColor: Colors.white,
              side: BorderSide(color: selected ? kPrimary : kBorder),
              padding: const EdgeInsets.symmetric(horizontal: 4),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _summaryCard(HistorySummary s) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [kPrimary, kSecondary],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(s.periodLabel, style: pjs(size: 12, color: Colors.white70)),
        const SizedBox(height: 2),
        Text('₱${s.totalPay.toStringAsFixed(2)}',
            style: pjs(
                size: 30, weight: FontWeight.w900, color: Colors.white)),
        Text(s.payStatus,
            style: pjs(
                size: 11,
                weight: FontWeight.w700,
                color: Colors.white70)),
        const SizedBox(height: 12),
        Row(children: [
          _summaryStat('Trips', '${s.tripsCompleted}'),
          _summaryStat('Parcels', '${s.parcelsDelivered}'),
          _summaryStat('Average', '₱${s.averagePay.toStringAsFixed(0)}'),
          _summaryStat('Issues', '${s.discrepancyTrips}'),
        ]),
        const SizedBox(height: 4),
        Text('${s.from} to ${s.to}',
            style: pjs(size: 10, color: Colors.white60)),
      ]),
    );
  }

  Widget _summaryStat(String label, String value) {
    return Expanded(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(value,
            style: pjs(
                size: 14, weight: FontWeight.w900, color: Colors.white)),
        Text(label, style: pjs(size: 10, color: Colors.white60)),
      ]),
    );
  }

  Widget _searchField() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: TextField(
        controller: _searchCtrl,
        style: pjs(size: 13),
        textInputAction: TextInputAction.search,
        onSubmitted: (_) => _load(),
        decoration: mimooInput(
          hint: 'Search trip code or waybill',
          icon: Icons.search,
          suffix: IconButton(
            onPressed: _load,
            icon: const Icon(Icons.arrow_forward, size: 18, color: kPrimary),
          ),
        ),
      ),
    );
  }
}

class _ViewPill extends StatelessWidget {
  const _ViewPill({
    required this.label,
    required this.selected,
    required this.onTap,
  });
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(99),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: selected ? kChip : kCard,
          borderRadius: BorderRadius.circular(99),
          border: Border.all(color: selected ? kPrimary : kBorder),
        ),
        child: Text(label,
            style: pjs(
                size: 12,
                weight: FontWeight.w700,
                color: selected ? kPrimary : kSubtext)),
      ),
    );
  }
}

class _PaymentCard extends StatelessWidget {
  const _PaymentCard({required this.payment, required this.onTap});
  final PaymentItem payment;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 9),
        padding: const EdgeInsets.all(13),
        decoration: BoxDecoration(
          color: kCard,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: kBorder),
        ),
        child: Row(children: [
          Container(
            width: 38,
            height: 38,
            decoration: const BoxDecoration(
                color: kChip, shape: BoxShape.circle),
            child: const Icon(Icons.payments_outlined,
                size: 19, color: kPrimary),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(children: [
                    Expanded(
                      child: Text(payment.tripCode,
                          style: pjs(size: 13, weight: FontWeight.w800)),
                    ),
                    Text('₱${payment.amount.toStringAsFixed(2)}',
                        style: pjs(
                            size: 13,
                            weight: FontWeight.w900,
                            color: kGreen)),
                  ]),
                  Text('${payment.reference} · ${payment.date}',
                      style: pjs(size: 10, color: kSubtext)),
                  Text(payment.route,
                      style: pjs(size: 11, color: kSubtext)),
                  if (payment.discrepancy)
                    Text('Completed with discrepancy',
                        style: pjs(size: 10, color: Colors.orange)),
                ]),
          ),
          const Icon(Icons.chevron_right, color: kSubtext, size: 19),
        ]),
      ),
    );
  }
}

class _HistoryTripCard extends StatelessWidget {
  const _HistoryTripCard({required this.trip, required this.onTap});
  final HistoryTrip trip;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 9),
        padding: const EdgeInsets.all(13),
        decoration: BoxDecoration(
          color: kCard,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: kBorder),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Expanded(
              child: Text(trip.tripCode,
                  style: pjs(size: 13, weight: FontWeight.w800)),
            ),
            CourierStatusBadge(status: trip.status),
          ]),
          const SizedBox(height: 3),
          Text(trip.route, style: pjs(size: 12, color: kSubtext)),
          Text(
            '${trip.date} · ${trip.parcelsCount} parcels · ${trip.weight.toStringAsFixed(1)} kg',
            style: pjs(size: 11, color: kSubtext),
          ),
          Row(children: [
            Text('₱${trip.amount.toStringAsFixed(2)}',
                style: pjs(
                    size: 12, weight: FontWeight.w800, color: kGreen)),
            const Spacer(),
            const Icon(Icons.chevron_right, color: kSubtext, size: 19),
          ]),
        ]),
      ),
    );
  }
}

class HistoryTripDetailPage extends StatefulWidget {
  const HistoryTripDetailPage({super.key, required this.id});
  final int id;

  @override
  State<HistoryTripDetailPage> createState() => _HistoryTripDetailPageState();
}

class _HistoryTripDetailPageState extends State<HistoryTripDetailPage> {
  HistoryTripDetail? _detail;
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
      final d = await CourierRepository.instance.historyTripDetail(widget.id);
      if (!mounted) return;
      setState(() {
        _detail = d;
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

  @override
  Widget build(BuildContext context) {
    final d = _detail;
    return Scaffold(
      backgroundColor: kSurface,
      appBar: AppBar(
        backgroundColor: kCard,
        title: Text(d?.tripCode ?? 'Trip Receipt',
            style: pjs(size: 16, weight: FontWeight.w800)),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: kPrimary))
          : _error != null
              ? CourierErrorState(message: _error!, onRetry: _load)
              : d == null
                  ? const SizedBox.shrink()
                  : ListView(
                      padding: const EdgeInsets.all(16),
                      children: [
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: kCard,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: kBorder),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(children: [
                                Expanded(
                                  child: Text(
                                    '₱${d.payTotal.toStringAsFixed(2)}',
                                    style: pjs(
                                        size: 28,
                                        weight: FontWeight.w900,
                                        color: kGreen),
                                  ),
                                ),
                                CourierStatusBadge(status: d.status),
                              ]),
                              Text(d.payReference,
                                  style: pjs(size: 11, color: kSubtext)),
                              Text('${d.date} · ${d.route}',
                                  style: pjs(size: 12, color: kSubtext)),
                            ],
                          ),
                        ),
                        const SizedBox(height: 10),
                        CourierInfoCard(
                          title: 'Pay breakdown',
                          children: [
                            CourierInfoRow('Base pay',
                                '₱${d.basePay.toStringAsFixed(2)}'),
                            CourierInfoRow('Other earnings',
                                '₱${d.otherEarnings.toStringAsFixed(2)}'),
                            CourierInfoRow(
                                'Total', '₱${d.payTotal.toStringAsFixed(2)}'),
                            CourierInfoRow('Status', d.payStatus),
                          ],
                        ),
                        const SizedBox(height: 10),
                        CourierInfoCard(
                          title: 'Trip',
                          children: [
                            CourierInfoRow('Route', d.route),
                            CourierInfoRow(
                                'Weight', '${d.weight.toStringAsFixed(1)} kg'),
                            CourierInfoRow(
                                'Seal no.', d.sealNumber ?? ''),
                            CourierInfoRow('Destination seal',
                                d.destinationSeal ?? ''),
                            if (d.discrepancyNote != null)
                              CourierInfoRow(
                                  'Discrepancy', d.discrepancyNote!),
                          ],
                        ),
                        const SizedBox(height: 10),
                        CourierInfoCard(
                          title: 'Proof of delivery',
                          children: [
                            CourierInfoRow(
                                'Received', d.receivedAt ?? ''),
                            CourierInfoRow('Receiver', d.receiver ?? ''),
                            CourierInfoRow('Facility', d.facility ?? ''),
                          ],
                        ),
                        const SizedBox(height: 10),
                        CourierInfoCard(
                          title: 'Parcels (${d.parcels.length})',
                          children: [
                            for (final p in d.parcels)
                              Padding(
                                padding:
                                    const EdgeInsets.symmetric(vertical: 4),
                                child: Row(children: [
                                  Icon(
                                    p.damaged
                                        ? Icons.warning_amber_rounded
                                        : Icons.check_circle_outline,
                                    size: 17,
                                    color: p.damaged ? kFlash : kGreen,
                                  ),
                                  const SizedBox(width: 7),
                                  Expanded(
                                    child: Text(p.waybillNumber,
                                        style: pjs(
                                            size: 12,
                                            weight: FontWeight.w600)),
                                  ),
                                  Text(
                                    '${p.weight.toStringAsFixed(1)} kg',
                                    style: pjs(size: 11, color: kSubtext),
                                  ),
                                ]),
                              ),
                          ],
                        ),
                        if (d.events.isNotEmpty) ...[
                          const SizedBox(height: 10),
                          CourierInfoCard(
                            title: 'Timeline',
                            children: [
                              for (final e in d.events)
                                Padding(
                                  padding:
                                      const EdgeInsets.symmetric(vertical: 4),
                                  child: Row(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        const Padding(
                                          padding: EdgeInsets.only(top: 4),
                                          child: Icon(Icons.circle,
                                              size: 8, color: kSecondary),
                                        ),
                                        const SizedBox(width: 8),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Text(e.label,
                                                  style: pjs(
                                                      size: 12,
                                                      weight:
                                                          FontWeight.w700)),
                                              Text(
                                                  '${e.place} · ${e.occurredAt}',
                                                  style: pjs(
                                                      size: 10,
                                                      color: kSubtext)),
                                              if (e.notes != null &&
                                                  e.notes!.isNotEmpty)
                                                Text(e.notes!,
                                                    style: pjs(
                                                        size: 11,
                                                        color: kSubtext)),
                                            ],
                                          ),
                                        ),
                                      ]),
                                ),
                            ],
                          ),
                        ],
                        const SizedBox(height: 20),
                      ],
                    ),
    );
  }
}
