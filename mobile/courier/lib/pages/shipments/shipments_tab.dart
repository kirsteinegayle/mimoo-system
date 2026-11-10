import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../models/courier_models.dart';
import '../../services/courier_repository.dart';
import '../../services/api_service.dart';
import '../../theme/mimoo_theme.dart';

class ShipmentsTab extends StatefulWidget {
  const ShipmentsTab({super.key});

  @override
  State<ShipmentsTab> createState() => _ShipmentsTabState();
}

class _ShipmentsTabState extends State<ShipmentsTab> {
  final List<ShipmentSummary> _items = [];
  PageMeta? _meta;
  bool _loading = true;
  bool _loadingMore = false;
  String? _error;
  String _statusFilter = 'all';

  static const _statuses = ['all', 'pending', 'accepted', 'rejected'];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load({bool refresh = true}) async {
    if (refresh) {
      setState(() {
        _loading = true;
        _error = null;
        _items.clear();
      });
    }
    try {
      final r = await CourierRepository.instance.shipments(
        status: _statusFilter,
        page: 1,
      );
      if (!mounted) return;
      setState(() {
        _items
          ..clear()
          ..addAll(r.items);
        _meta = r.meta;
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

  Future<void> _loadMore() async {
    if (_loadingMore || _meta == null || !_meta!.hasMore) return;
    setState(() => _loadingMore = true);
    try {
      final r = await CourierRepository.instance.shipments(
        status: _statusFilter,
        page: _meta!.currentPage + 1,
      );
      if (!mounted) return;
      setState(() {
        _items.addAll(r.items);
        _meta = r.meta;
        _loadingMore = false;
      });
    } catch (_) {
      if (mounted) setState(() => _loadingMore = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      // Status filter chips
      SizedBox(
        height: 44,
        child: ListView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          children: _statuses.map((s) {
            final sel = _statusFilter == s;
            return Padding(
              padding: const EdgeInsets.only(right: 8),
              child: FilterChip(
                label: Text(
                    s == 'all' ? 'All' : s[0].toUpperCase() + s.substring(1),
                    style: pjs(
                        size: 12,
                        weight: FontWeight.w600,
                        color: sel ? Colors.white : kSubtext)),
                selected: sel,
                onSelected: (_) {
                  setState(() => _statusFilter = s);
                  _load();
                },
                selectedColor: kPrimary,
                backgroundColor: kSurface,
                checkmarkColor: Colors.white,
                side: BorderSide(color: sel ? kPrimary : kBorder),
                padding: const EdgeInsets.symmetric(horizontal: 4),
              ),
            );
          }).toList(),
        ),
      ),
      const Divider(height: 1, color: kBorder),
      Expanded(
        child: _loading
            ? _buildSkeleton()
            : _error != null
                ? _buildError()
                : _items.isEmpty
                    ? _buildEmpty()
                    : RefreshIndicator(
                        color: kPrimary,
                        onRefresh: _load,
                        child: NotificationListener<ScrollNotification>(
                          onNotification: (n) {
                            if (n.metrics.pixels >=
                                n.metrics.maxScrollExtent - 200) {
                              _loadMore();
                            }
                            return false;
                          },
                          child: ListView.builder(
                            padding: const EdgeInsets.all(12),
                            itemCount: _items.length + (_loadingMore ? 1 : 0),
                            itemBuilder: (_, i) {
                              if (i == _items.length) {
                                return const Center(
                                  child: Padding(
                                    padding: EdgeInsets.all(16),
                                    child: CircularProgressIndicator(
                                        color: kPrimary),
                                  ),
                                );
                              }
                              return _ShipmentCard(
                                item: _items[i],
                                onTap: () => _openDetail(_items[i]),
                              );
                            },
                          ),
                        ),
                      ),
      ),
    ]);
  }

  void _openDetail(ShipmentSummary item) async {
    await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => ShipmentDetailPage(id: item.id)),
    );
    _load();
  }

  Widget _buildSkeleton() => ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: 5,
        itemBuilder: (_, __) => Container(
          height: 90,
          margin: const EdgeInsets.only(bottom: 10),
          decoration: BoxDecoration(
            color: kBorder,
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      );

  Widget _buildError() => Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            const Icon(Icons.wifi_off_outlined, size: 48, color: kSubtext),
            const SizedBox(height: 12),
            Text(_error!,
                style: pjs(size: 13, color: kSubtext),
                textAlign: TextAlign.center),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: _load,
              style: FilledButton.styleFrom(backgroundColor: kPrimary),
              child: Text('Try again',
                  style: pjs(
                      size: 13, weight: FontWeight.w700, color: Colors.white)),
            ),
          ]),
        ),
      );

  Widget _buildEmpty() => Center(
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          const Icon(Icons.inbox_outlined, size: 52, color: kSubtext),
          const SizedBox(height: 12),
          Text('No shipments found.', style: pjs(size: 14, color: kSubtext)),
        ]),
      );
}

// ── Shipment card ─────────────────────────────────────────────────────────────

class _ShipmentCard extends StatelessWidget {
  const _ShipmentCard({required this.item, required this.onTap});
  final ShipmentSummary item;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final isPending = item.assignmentStatus == 'pending';
    final isAccepted = item.assignmentStatus == 'accepted';
    final badgeColor = isPending
        ? (item.isOverdue
            ? kFlash
            : item.isExpiringSoon
                ? Colors.orange
                : kSecondary)
        : isAccepted
            ? kGreen
            : kSubtext;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: kCard,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
              color: isPending ? badgeColor.withValues(alpha: 0.4) : kBorder),
        ),
        child: Row(children: [
          Expanded(
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Text(item.orderNumber,
                    style: pjs(size: 13, weight: FontWeight.w800)),
                const SizedBox(width: 8),
                _Badge(label: item.assignmentStatus, color: badgeColor),
                if (item.isOverdue)
                  const Padding(
                    padding: EdgeInsets.only(left: 4),
                    child: _Badge(label: 'OVERDUE', color: kFlash),
                  ),
              ]),
              const SizedBox(height: 4),
              Text(item.sellerName, style: pjs(size: 12, color: kSubtext)),
              const SizedBox(height: 2),
              Row(children: [
                const Icon(Icons.location_on_outlined,
                    size: 13, color: kSubtext),
                const SizedBox(width: 2),
                Text(item.destination, style: pjs(size: 12, color: kSubtext)),
              ]),
              const SizedBox(height: 2),
              Text(item.assignedAt, style: pjs(size: 11, color: kSubtext)),
            ]),
          ),
          const Icon(Icons.chevron_right, color: kSubtext),
        ]),
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  const _Badge({required this.label, required this.color});
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(label.toUpperCase(),
          style: pjs(size: 9, weight: FontWeight.w800, color: color)),
    );
  }
}

// ── Shipment Detail Page ──────────────────────────────────────────────────────

class ShipmentDetailPage extends StatefulWidget {
  const ShipmentDetailPage({super.key, required this.id});
  final int id;

  @override
  State<ShipmentDetailPage> createState() => _ShipmentDetailPageState();
}

class _ShipmentDetailPageState extends State<ShipmentDetailPage> {
  ShipmentDetail? _detail;
  bool _loading = true;
  String? _error;
  bool _acting = false;

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
      final d = await CourierRepository.instance.shipmentDetail(widget.id);
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

  Future<void> _accept() async {
    if (_acting) return;
    final ok = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Accept Shipment'),
        content: const Text('Accept this shipment assignment?'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancel')),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(backgroundColor: kPrimary),
            child: const Text('Accept'),
          ),
        ],
      ),
    );
    if (ok != true || !mounted) return;

    setState(() => _acting = true);
    try {
      await CourierRepository.instance.acceptShipment(widget.id);
      if (!mounted) return;
      _showSnack('Shipment accepted!', kGreen);
      await _load();
    } on ApiException catch (e) {
      if (!mounted) return;
      _showSnack(e.message, kFlash);
    } catch (e) {
      if (!mounted) return;
      _showSnack(ApiService.friendlyError(e), kFlash);
    } finally {
      if (mounted) setState(() => _acting = false);
    }
  }

  Future<void> _reject() async {
    if (_acting) return;
    final reasonCtrl = TextEditingController();
    final reason = await showDialog<String>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Reject Shipment'),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          Text('Please provide a reason (min 10 characters).',
              style: pjs(size: 13, color: kSubtext)),
          const SizedBox(height: 12),
          TextField(
            controller: reasonCtrl,
            maxLines: 3,
            decoration: InputDecoration(
              hintText: 'e.g. Pickup location is outside our service area.',
              hintStyle: pjs(size: 12, color: kSubtext),
              border:
                  OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
            ),
          ),
        ]),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel')),
          FilledButton(
            onPressed: () {
              if (reasonCtrl.text.trim().length < 10) return;
              Navigator.pop(context, reasonCtrl.text.trim());
            },
            style: FilledButton.styleFrom(backgroundColor: kFlash),
            child: const Text('Reject'),
          ),
        ],
      ),
    );
    if (reason == null || !mounted) return;

    setState(() => _acting = true);
    try {
      await CourierRepository.instance.rejectShipment(widget.id, reason);
      if (!mounted) return;
      _showSnack('Shipment rejected.', kSubtext);
      await _load();
    } on ApiException catch (e) {
      if (!mounted) return;
      _showSnack(e.message, kFlash);
    } catch (e) {
      if (!mounted) return;
      _showSnack(ApiService.friendlyError(e), kFlash);
    } finally {
      if (mounted) setState(() => _acting = false);
    }
  }

  void _showSnack(String msg, Color color) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg, style: pjs(size: 13, color: Colors.white)),
      backgroundColor: color,
      behavior: SnackBarBehavior.floating,
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kSurface,
      appBar: AppBar(
        title: Text(_detail?.orderNumber ?? 'Shipment Detail',
            style: pjs(size: 16, weight: FontWeight.w800)),
        backgroundColor: kCard,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: kPrimary))
          : _error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.cloud_off_outlined,
                            size: 42, color: kSubtext),
                        const SizedBox(height: 12),
                        Text(
                          'Couldn’t load shipment details',
                          style: pjs(size: 16, weight: FontWeight.w800),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _error!,
                          style: pjs(size: 13, color: kSubtext),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 16),
                        Wrap(
                          alignment: WrapAlignment.center,
                          spacing: 10,
                          runSpacing: 8,
                          children: [
                            OutlinedButton.icon(
                              onPressed: () => Navigator.pop(context),
                              icon: const Icon(Icons.arrow_back),
                              label: const Text('Back to shipments'),
                            ),
                            FilledButton.icon(
                              onPressed: _load,
                              style: FilledButton.styleFrom(
                                  backgroundColor: kPrimary),
                              icon: const Icon(Icons.refresh),
                              label: const Text('Try again'),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                )
              : _buildDetail(),
    );
  }

  Widget _buildDetail() {
    final d = _detail!;
    final isPending = d.assignmentStatus == 'pending';
    final statusLabel = d.assignmentStatus.isEmpty
        ? 'Not provided'
        : d.assignmentStatus
            .split('_')
            .map((word) => word.isEmpty
                ? word
                : '${word[0].toUpperCase()}${word.substring(1)}')
            .join(' ');

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        if (d.isOverdue || d.isExpiringSoon)
          Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: d.isOverdue
                  ? kFlash.withValues(alpha: 0.08)
                  : Colors.orange.withValues(alpha: 0.10),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: d.isOverdue
                    ? kFlash.withValues(alpha: 0.3)
                    : Colors.orange.withValues(alpha: 0.35),
              ),
            ),
            child: Row(children: [
              Icon(
                d.isOverdue
                    ? Icons.warning_amber_rounded
                    : Icons.timer_outlined,
                color: d.isOverdue ? kFlash : Colors.orange.shade800,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  d.isOverdue
                      ? 'The acceptance deadline has passed.'
                      : 'This shipment is nearing its acceptance deadline.',
                  style: pjs(size: 12, weight: FontWeight.w600),
                ),
              ),
            ]),
          ),
        _InfoCard(
            title: 'Shipment',
            description:
                'Use these identifiers to confirm you opened the correct assignment. Pending shipments still need a decision.',
            children: [
              _Row(
                'Waybill',
                d.waybillNumber.isEmpty ? 'Not provided' : d.waybillNumber,
                trailing: d.waybillNumber.isEmpty
                    ? null
                    : IconButton(
                        tooltip: 'Copy waybill number',
                        visualDensity: VisualDensity.compact,
                        icon: const Icon(Icons.copy_outlined, size: 18),
                        onPressed: () async {
                          await Clipboard.setData(
                              ClipboardData(text: d.waybillNumber));
                          if (mounted) {
                            _showSnack('Waybill copied.', kPrimary);
                          }
                        },
                      ),
              ),
              _Row('Order', d.orderNumber),
              _Row('Assignment status', statusLabel),
              _Row('Assigned', d.assignedAt),
              _Row('Accept by', d.acceptanceDeadline),
              _Row('Pickup status', _displayStatus(d.pickupStatus)),
              if (d.acceptedAt != null) _Row('Accepted', d.acceptedAt!),
              if (d.rejectedAt != null) ...[
                _Row('Rejected', d.rejectedAt!),
                if (d.rejectionReason != null)
                  _Row('Reason', d.rejectionReason!),
              ],
            ]),
        const SizedBox(height: 10),
        if (d.seller != null) ...[
          _InfoCard(
              title: 'Seller / Pickup',
              description:
                  'Where the parcel originates. Verify the seller and pickup address before collection.',
              children: [
                _Row('Name', d.seller!['name']?.toString() ?? ''),
                _Row('Phone', d.seller!['phone']?.toString() ?? ''),
                _Row('Address', d.seller!['address']?.toString() ?? ''),
              ]),
          const SizedBox(height: 10),
        ],
        _InfoCard(
          title: 'Delivery',
          description:
              'Destination and parcel summary for planning the handoff. Total is the order amount, not a courier payout.',
          children: [
            _Row('Destination', d.shippingAddress),
            _Row('Payment method', _displayStatus(d.paymentMethod)),
            _Row('Order total', '₱${d.totalAmount.toStringAsFixed(2)}'),
            _Row('Item count', '${d.itemsCount}'),
            if (d.weight != null) _Row('Weight', '${d.weight} kg'),
            if (d.dimensions != null)
              _Row('Dimensions', d.dimensions.toString()),
            if (d.pickupInstructions != null &&
                d.pickupInstructions!.isNotEmpty)
              _Row('Instructions', d.pickupInstructions!),
          ],
        ),
        const SizedBox(height: 10),
        if (d.history.isNotEmpty) ...[
          _InfoCard(
              title: 'Assignment history',
              description:
                  'A record of assignment changes, who made them, and when.',
              children: d.history
                  .map(
                    (h) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Row(children: [
                        const Icon(Icons.circle, size: 8, color: kSecondary),
                        const SizedBox(width: 8),
                        Expanded(
                            child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                              Text(
                                  '${h.action.toUpperCase()} — ${h.performedBy}',
                                  style:
                                      pjs(size: 12, weight: FontWeight.w700)),
                              if (h.notes != null && h.notes!.isNotEmpty)
                                Text(h.notes!,
                                    style: pjs(size: 11, color: kSubtext)),
                              Text(h.createdAt,
                                  style: pjs(size: 11, color: kSubtext)),
                            ])),
                      ]),
                    ),
                  )
                  .toList()),
          const SizedBox(height: 10),
        ],
        if (isPending) ...[
          Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Text(
              'Choose Accept to take this assignment, or Reject and provide a reason (at least 10 characters).',
              style: pjs(size: 12, color: kSubtext),
              textAlign: TextAlign.center,
            ),
          ),
          Row(children: [
            Expanded(
              child: OutlinedButton(
                onPressed: _acting ? null : _reject,
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: kFlash),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                child: _acting
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: kFlash))
                    : Text('Reject',
                        style: pjs(
                            size: 14, weight: FontWeight.w700, color: kFlash)),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: FilledButton(
                onPressed: _acting ? null : _accept,
                style: FilledButton.styleFrom(
                  backgroundColor: kPrimary,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                child: _acting
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white))
                    : Text('Accept',
                        style: pjs(
                            size: 14,
                            weight: FontWeight.w800,
                            color: Colors.white)),
              ),
            ),
          ]),
          const SizedBox(height: 16),
        ],
      ],
    );
  }

  String _displayStatus(String value) {
    if (value.isEmpty) return 'Not provided';
    return value
        .split(RegExp(r'[_\s]+'))
        .map((word) => word.isEmpty
            ? word
            : '${word[0].toUpperCase()}${word.substring(1)}')
        .join(' ');
  }
}

// ── Shared widgets ────────────────────────────────────────────────────────────

class _InfoCard extends StatelessWidget {
  const _InfoCard({
    required this.title,
    required this.children,
    this.description,
  });
  final String title;
  final List<Widget> children;
  final String? description;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: kBorder),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(title,
            style: pjs(size: 13, weight: FontWeight.w800, color: kPrimary)),
        if (description != null) ...[
          const SizedBox(height: 4),
          Text(description!, style: pjs(size: 11, color: kSubtext)),
        ],
        const Divider(height: 12, color: kBorder),
        ...children,
      ]),
    );
  }
}

class _Row extends StatelessWidget {
  const _Row(this.label, this.value, {this.trailing});
  final String label;
  final String value;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        SizedBox(
          width: 96,
          child: Text(label, style: pjs(size: 12, color: kSubtext)),
        ),
        Expanded(
          child: Text(value, style: pjs(size: 12, weight: FontWeight.w600)),
        ),
        if (trailing != null) trailing!,
      ]),
    );
  }
}
