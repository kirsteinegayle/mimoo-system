import 'package:flutter/material.dart';
import '../../models/courier_models.dart';
import '../../services/api_service.dart';
import '../../services/courier_repository.dart';
import '../../theme/mimoo_theme.dart';
import '../../widgets/courier_shared.dart';

/// New Assign (bottom tab): work that still needs a rider, per branch.
///
///   GET  /api/courier-app/branch-assign                    branches + counts
///   GET  /api/courier-app/branch-assign/{branch}           pickups, deliveries, riders
///   POST /api/courier-app/branch-assign/{branch}/pickups/{id}
///   POST /api/courier-app/branch-assign/{branch}/deliveries/{orderId}
///
/// Pickups belong to the branch covering the seller's city; deliveries to the
/// hub/branch where the parcel is. Only riders of that branch are offered
/// (the server enforces it too). Branch "No branch" collects the rest.
class BranchAssignPage extends StatefulWidget {
  const BranchAssignPage({super.key});

  @override
  State<BranchAssignPage> createState() => _BranchAssignPageState();
}

class _BranchAssignPageState extends State<BranchAssignPage> {
  List<BranchSummary> _branches = [];
  int? _branchId;
  BranchQueue? _queue;
  bool _loading = true;
  bool _loadingQueue = false;
  bool _acting = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = _branches.isEmpty;
      _error = null;
    });
    try {
      final branches = await CourierRepository.instance.branchSummaries();
      if (!mounted) return;
      // Keep the current branch; otherwise open the first one with waiting work.
      var id = _branchId;
      if (id == null || !branches.any((b) => b.id == id)) {
        id = branches
            .firstWhere((b) => b.waiting > 0,
                orElse: () => branches.isNotEmpty
                    ? branches.first
                    : const BranchSummary(
                        id: -1,
                        name: '',
                        newPickups: 0,
                        pickups: 0,
                        deliveries: 0,
                        riders: 0))
            .id;
      }
      setState(() {
        _branches = branches;
        _branchId = id == -1 ? null : id;
        _loading = false;
      });
      if (_branchId != null) await _loadQueue();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = ApiService.friendlyError(e);
      });
    }
  }

  Future<void> _loadQueue() async {
    final id = _branchId;
    if (id == null) return;
    setState(() => _loadingQueue = true);
    try {
      final q = await CourierRepository.instance.branchQueue(id);
      if (!mounted || id != _branchId) return;
      setState(() {
        _queue = q;
        _loadingQueue = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _loadingQueue = false);
      courierSnack(context, ApiService.friendlyError(e), kFlash);
    }
  }

  void _selectBranch(int id) {
    if (id == _branchId) return;
    setState(() {
      _branchId = id;
      _queue = null;
    });
    _loadQueue();
  }

  /// Rider picker. Deliveries need an ONLINE rider (server rule), so offline
  /// riders are shown but disabled there.
  Future<BranchRiderItem?> _pickRider(String title,
      {required bool needsOnline}) {
    final riders = _queue?.riders ?? const <BranchRiderItem>[];
    final noBranch = _queue?.branch.isNoBranch ?? false;
    if (riders.isEmpty) {
      courierSnack(
          context,
          noBranch
              ? 'No riders available.'
              : 'This branch has no riders. Assign riders to it in Rider Management.',
          kSubtext);
      return Future.value(null);
    }
    return showModalBottomSheet<BranchRiderItem>(
      context: context,
      backgroundColor: kCard,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
      builder: (ctx) => SafeArea(
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 4),
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(title, style: pjs(size: 15, weight: FontWeight.w800)),
              Text(
                  'Riders of ${_queue?.branch.name ?? 'this branch'}'
                  '${needsOnline ? ' · must be online' : ''}',
                  style: pjs(size: 11, color: kSubtext)),
            ]),
          ),
          Flexible(
            child: ListView(
              shrinkWrap: true,
              children: riders.map((r) {
                final enabled = !needsOnline || r.isOnline;
                return ListTile(
                  enabled: enabled,
                  onTap: enabled ? () => Navigator.pop(ctx, r) : null,
                  leading: Icon(Icons.circle,
                      size: 10, color: r.isOnline ? kGreen : kBorder),
                  title: Text(r.name,
                      style: pjs(
                          size: 13,
                          weight: FontWeight.w700,
                          color: enabled ? kText : kSubtext)),
                  subtitle: Text(
                    [
                      r.isOnline ? 'Online' : 'Offline',
                      '${r.openPickups} pickup${r.openPickups == 1 ? '' : 's'}',
                      '${r.activeDeliveries} deliver${r.activeDeliveries == 1 ? 'y' : 'ies'}',
                    ].join(' · '),
                    style: pjs(size: 11, color: kSubtext),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 8),
        ]),
      ),
    );
  }

  Future<void> _run(Future<String> Function() call, String okSuffix) async {
    setState(() => _acting = true);
    try {
      final msg = await call();
      if (!mounted) return;
      courierSnack(context, '$msg $okSuffix', kGreen);
      await _load(); // counts + queue
    } on ApiException catch (e) {
      if (mounted) courierSnack(context, e.message, kFlash);
    } catch (e) {
      if (mounted) courierSnack(context, ApiService.friendlyError(e), kFlash);
    } finally {
      if (mounted) setState(() => _acting = false);
    }
  }

  Future<void> _assignPickup(BranchPickupItem p) async {
    final r = await _pickRider(
        '${p.isNew ? 'Assign' : 'Reassign'} pickup · ${p.waybillNumber}',
        needsOnline: false);
    if (r == null || !mounted) return;
    await _run(
        () => CourierRepository.instance
            .assignBranchPickup(_branchId!, p.id, r.personnelId),
        '${r.name} → ${p.waybillNumber}');
  }

  Future<void> _assignDelivery(BranchDeliveryItem d) async {
    final r = await _pickRider('Assign delivery · ${d.orderNumber}',
        needsOnline: true);
    if (r == null || !mounted) return;
    await _run(
        () => CourierRepository.instance
            .assignBranchDelivery(_branchId!, d.orderId, r.personnelId),
        '${r.name} → ${d.orderNumber}');
  }

  // ── UI ──────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator(color: kPrimary));
    }
    if (_error != null) {
      return CourierErrorState(message: _error!, onRetry: _load);
    }
    if (_branches.isEmpty) {
      return RefreshIndicator(
        color: kPrimary,
        onRefresh: _load,
        child: ListView(children: const [
          Padding(
            padding: EdgeInsets.only(top: 80),
            child: CourierEmptyState(
              icon: Icons.store_mall_directory_outlined,
              message:
                  'No active branches yet. Add a branch with its coverage cities to start assigning per branch.',
            ),
          ),
        ]),
      );
    }

    final q = _queue;
    return DefaultTabController(
      length: 2,
      child: Stack(children: [
        Column(children: [
          _branchChips(),
          if (q != null) _branchHeader(q),
          Container(
            color: kCard,
            child: TabBar(
              labelColor: kPrimary,
              unselectedLabelColor: kSubtext,
              indicatorColor: kPrimary,
              labelStyle: pjs(size: 13, weight: FontWeight.w800),
              tabs: [
                Tab(
                    text:
                        'Pickups${_count(q?.pickups.where((p) => p.isNew).length)}'),
                Tab(text: 'Deliveries${_count(q?.deliveries.length)}'),
              ],
            ),
          ),
          Expanded(
            child: _loadingQueue && q == null
                ? const Center(
                    child: CircularProgressIndicator(color: kPrimary))
                : TabBarView(children: [
                    _list(
                      q?.pickups.map(_pickupCard).toList() ?? const [],
                      Icons.inventory_2_outlined,
                      'No open pickups for this branch.',
                    ),
                    _list(
                      q?.deliveries.map(_deliveryCard).toList() ?? const [],
                      Icons.route_outlined,
                      'No parcels waiting for a delivery rider at this branch.',
                    ),
                  ]),
          ),
        ]),
        if (_acting)
          const Positioned.fill(
            child: ColoredBox(
              color: Color(0x33000000),
              child: Center(child: CircularProgressIndicator(color: kPrimary)),
            ),
          ),
      ]),
    );
  }

  String _count(int? n) => (n ?? 0) > 0 ? ' ($n)' : '';

  Widget _branchChips() => Container(
        color: kCard,
        height: 56,
        child: ListView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          children: _branches.map((b) {
            final sel = b.id == _branchId;
            return Padding(
              padding: const EdgeInsets.only(right: 8),
              child: ChoiceChip(
                selected: sel,
                onSelected: (_) => _selectBranch(b.id),
                selectedColor: kPrimary,
                backgroundColor: kChip,
                side: BorderSide(color: sel ? kPrimary : kBorder),
                showCheckmark: false,
                avatar: b.isNoBranch
                    ? Icon(Icons.help_outline,
                        size: 16, color: sel ? Colors.white : kFlash)
                    : null,
                label: Text(
                  b.waiting > 0 ? '${b.name} · ${b.waiting}' : b.name,
                  style: pjs(
                      size: 12,
                      weight: FontWeight.w700,
                      color: sel ? Colors.white : kText),
                ),
              ),
            );
          }).toList(),
        ),
      );

  Widget _branchHeader(BranchQueue q) {
    final online = q.riders.where((r) => r.isOnline).length;
    return Container(
      width: double.infinity,
      color: kSurface,
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 10),
      child: Row(children: [
        Expanded(
          child: Text(
            q.branch.isNoBranch
                ? 'Outside every branch coverage — any company rider can take these.'
                : [q.branch.type, q.branch.city]
                    .whereType<String>()
                    .join(' · '),
            style: pjs(size: 11, color: kSubtext),
          ),
        ),
        const Icon(Icons.two_wheeler, size: 15, color: kSubtext),
        const SizedBox(width: 4),
        Text(
            '${q.riders.length} rider${q.riders.length == 1 ? '' : 's'} · $online online',
            style: pjs(size: 11, weight: FontWeight.w700, color: kText)),
      ]),
    );
  }

  Widget _list(List<Widget> cards, IconData icon, String empty) =>
      RefreshIndicator(
        color: kPrimary,
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: cards.isEmpty
              ? [
                  Padding(
                    padding: const EdgeInsets.only(top: 40),
                    child: CourierEmptyState(icon: icon, message: empty),
                  ),
                ]
              : cards,
        ),
      );

  Widget _card({required List<Widget> children}) => Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: kCard,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: kBorder),
        ),
        child: Column(
            crossAxisAlignment: CrossAxisAlignment.start, children: children),
      );

  Widget _assignButton(String label, VoidCallback onTap,
          {bool outlined = false}) =>
      Align(
        alignment: Alignment.centerRight,
        child: outlined
            ? OutlinedButton.icon(
                onPressed: _acting ? null : onTap,
                style: OutlinedButton.styleFrom(
                    foregroundColor: kPrimary,
                    side: const BorderSide(color: kBorder)),
                icon: const Icon(Icons.swap_horiz, size: 16),
                label: Text(label,
                    style: pjs(
                        size: 12, weight: FontWeight.w800, color: kPrimary)),
              )
            : FilledButton.icon(
                onPressed: _acting ? null : onTap,
                style: FilledButton.styleFrom(backgroundColor: kPrimary),
                icon: const Icon(Icons.person_add_alt_1,
                    size: 16, color: Colors.white),
                label: Text(label,
                    style: pjs(
                        size: 12,
                        weight: FontWeight.w800,
                        color: Colors.white)),
              ),
      );

  Widget _pickupCard(BranchPickupItem p) => _card(children: [
        Row(children: [
          Expanded(
            child: Text(
                p.waybillNumber.isEmpty ? 'Pickup #${p.id}' : p.waybillNumber,
                style: pjs(size: 13, weight: FontWeight.w800)),
          ),
          if (p.isNew)
            Container(
              margin: const EdgeInsets.only(right: 6),
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                  color: kSecondary, borderRadius: BorderRadius.circular(20)),
              child: Text('NEW',
                  style: pjs(
                      size: 10, weight: FontWeight.w800, color: Colors.white)),
            ),
          CourierStatusBadge(status: p.pickupStatus),
        ]),
        const SizedBox(height: 6),
        Text(p.sellerName, style: pjs(size: 12, weight: FontWeight.w600)),
        if (p.pickupArea != null && p.pickupArea!.isNotEmpty)
          Text(p.pickupArea!, style: pjs(size: 12, color: kSubtext)),
        const Divider(height: 18, color: kBorder),
        if (p.isNew)
          _assignButton('Assign Rider', () => _assignPickup(p))
        else
          Row(children: [
            const Icon(Icons.two_wheeler, size: 16, color: kGreen),
            const SizedBox(width: 6),
            Expanded(
              child: Text('Rider: ${p.assignedRider ?? '-'}',
                  style: pjs(size: 12, weight: FontWeight.w700)),
            ),
            _assignButton('Reassign', () => _assignPickup(p), outlined: true),
          ]),
      ]);

  Widget _deliveryCard(BranchDeliveryItem d) => _card(children: [
        Text(d.orderNumber, style: pjs(size: 13, weight: FontWeight.w800)),
        if (d.waybillNumber.isNotEmpty)
          Text(d.waybillNumber, style: pjs(size: 11, color: kSubtext)),
        const SizedBox(height: 6),
        Text(d.buyerName, style: pjs(size: 12, weight: FontWeight.w600)),
        Text(d.destination, style: pjs(size: 12, color: kSubtext)),
        Text(
            d.codAmount > 0
                ? 'COD ₱${d.codAmount.toStringAsFixed(2)}'
                : 'Prepaid',
            style: pjs(size: 11, color: kSubtext)),
        const Divider(height: 18, color: kBorder),
        _assignButton('Assign Rider', () => _assignDelivery(d)),
      ]);
}
