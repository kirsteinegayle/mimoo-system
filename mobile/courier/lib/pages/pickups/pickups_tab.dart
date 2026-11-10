import 'package:flutter/material.dart';
import '../../models/courier_models.dart';
import '../../services/courier_repository.dart';
import '../../services/api_service.dart';
import '../../theme/mimoo_theme.dart';

class PickupsTab extends StatefulWidget {
  const PickupsTab({super.key});

  @override
  State<PickupsTab> createState() => _PickupsTabState();
}

class _PickupsTabState extends State<PickupsTab> {
  List<PickupSummary> _items = [];
  List<PersonnelItem> _personnel = [];
  Map<String, int> _stats = {};
  bool _loading = true;
  String? _error;
  String _filter = 'all';
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
      final r = await CourierRepository.instance.pickups(status: _filter);
      if (!mounted) return;
      setState(() {
        _items = r.items;
        _personnel = r.personnel;
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

  // ── Actions ───────────────────────────────────────────────────────────────

  Future<void> _schedule(PickupSummary p) async {
    DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(days: 1)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 30)),
    );
    if (picked == null || !mounted) return;

    const windows = ['8am-12pm', '12pm-4pm', '4pm-8pm'];
    final window = await showDialog<String>(
      context: context,
      builder: (_) => SimpleDialog(
        title: const Text('Select Time Window'),
        children: windows
            .map((w) => SimpleDialogOption(
                  onPressed: () => Navigator.pop(context, w),
                  child: Text(w),
                ))
            .toList(),
      ),
    );
    if (window == null || !mounted) return;

    setState(() => _acting = true);
    try {
      final dateStr =
          '${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}';
      await CourierRepository.instance.schedulePickup(p.id, dateStr, window);
      if (!mounted) return;
      _showSnack('Pickup scheduled!', kGreen);
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

  Future<void> _assignPersonnel(PickupSummary p) async {
    if (_personnel.isEmpty) {
      _showSnack('No active personnel found.', kSubtext);
      return;
    }
    final person = await showDialog<PersonnelItem>(
      context: context,
      builder: (_) => SimpleDialog(
        title: const Text('Assign Personnel'),
        children: _personnel
            .map((pe) => SimpleDialogOption(
                  onPressed: () => Navigator.pop(context, pe),
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(pe.name,
                            style: pjs(size: 13, weight: FontWeight.w700)),
                        if (pe.role != null)
                          Text(pe.role!, style: pjs(size: 12, color: kSubtext)),
                      ]),
                ))
            .toList(),
      ),
    );
    if (person == null || !mounted) return;

    setState(() => _acting = true);
    try {
      await CourierRepository.instance.assignPersonnel(p.id, person.id);
      if (!mounted) return;
      _showSnack('${person.name} assigned.', kGreen);
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

  Future<void> _confirmPickup(PickupSummary p) async {
    final ctrl = TextEditingController();
    final waybill = await showDialog<String>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Confirm Pickup'),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          Text('Enter the waybill number to confirm pickup.',
              style: pjs(size: 13, color: kSubtext)),
          const SizedBox(height: 12),
          TextField(
            controller: ctrl,
            textCapitalization: TextCapitalization.characters,
            decoration: InputDecoration(
              hintText: 'e.g. MIM00000001',
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
              if (ctrl.text.trim().isEmpty) return;
              Navigator.pop(context, ctrl.text.trim());
            },
            style: FilledButton.styleFrom(backgroundColor: kPrimary),
            child: const Text('Confirm'),
          ),
        ],
      ),
    );
    if (waybill == null || !mounted) return;

    setState(() => _acting = true);
    try {
      await CourierRepository.instance.confirmPickup(p.id, waybill);
      if (!mounted) return;
      _showSnack('Pickup confirmed!', kGreen);
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

  Future<void> _recordFailed(PickupSummary p) async {
    final ctrl = TextEditingController();
    final reason = await showDialog<String>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Record Failed Attempt'),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          Text('Reason for failed pickup (min 10 characters).',
              style: pjs(size: 13, color: kSubtext)),
          const SizedBox(height: 12),
          TextField(
            controller: ctrl,
            maxLines: 3,
            decoration: InputDecoration(
              hintText: 'e.g. Seller was not available.',
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
              if (ctrl.text.trim().length < 10) return;
              Navigator.pop(context, ctrl.text.trim());
            },
            style: FilledButton.styleFrom(backgroundColor: kFlash),
            child: const Text('Record'),
          ),
        ],
      ),
    );
    if (reason == null || !mounted) return;

    setState(() => _acting = true);
    try {
      await CourierRepository.instance.recordFailed(p.id, reason);
      if (!mounted) return;
      _showSnack('Failed attempt recorded.', Colors.orange);
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
    return Stack(children: [
      Column(children: [
        // Filter
        SizedBox(
          height: 44,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            children: [
              'all',
              'pending_pickup',
              'scheduled',
              'picked_up',
              'failed'
            ].map((s) {
              final sel = _filter == s;
              final lbl = s == 'all'
                  ? 'All'
                  : s == 'pending_pickup'
                      ? 'Pending'
                      : s == 'picked_up'
                          ? 'Picked Up'
                          : s[0].toUpperCase() + s.substring(1);
              final count = switch (s) {
                'all' => _stats['total'],
                'pending_pickup' => _stats['pending_pickup'],
                'scheduled' => _stats['scheduled'],
                'picked_up' => _stats['picked_up'],
                'failed' => _stats['failed'],
                _ => null,
              };
              final label = count == null ? lbl : '$lbl ($count)';
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: FilterChip(
                  label: Text(label,
                      style: pjs(
                          size: 12,
                          weight: FontWeight.w600,
                          color: sel ? Colors.white : kSubtext)),
                  selected: sel,
                  onSelected: (_) {
                    setState(() => _filter = s);
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
              ? const Center(child: CircularProgressIndicator(color: kPrimary))
              : _error != null
                  ? _buildError()
                  : _items.isEmpty
                      ? _buildEmpty()
                      : RefreshIndicator(
                          color: kPrimary,
                          onRefresh: _load,
                          child: ListView.builder(
                            padding: const EdgeInsets.all(12),
                            itemCount: _items.length,
                            itemBuilder: (_, i) => _PickupCard(
                              item: _items[i],
                              onSchedule: () => _schedule(_items[i]),
                              onAssign: () => _assignPersonnel(_items[i]),
                              onConfirm: () => _confirmPickup(_items[i]),
                              onFailed: () => _recordFailed(_items[i]),
                            ),
                          ),
                        ),
        ),
      ]),
      if (_acting)
        const Positioned.fill(
          child: ColoredBox(
            color: Color(0x44000000),
            child:
                Center(child: CircularProgressIndicator(color: Colors.white)),
          ),
        ),
    ]);
  }

  Widget _buildError() => Center(
        child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
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
                            size: 13,
                            weight: FontWeight.w700,
                            color: Colors.white))),
              ],
            )),
      );

  Widget _buildEmpty() => Center(
          child: Column(mainAxisSize: MainAxisSize.min, children: [
        const Icon(Icons.local_shipping_outlined, size: 52, color: kSubtext),
        const SizedBox(height: 12),
        Text('No pickups found.', style: pjs(size: 14, color: kSubtext)),
      ]));
}

// ── Mini stat ─────────────────────────────────────────────────────────────────

// ── Pickup card ───────────────────────────────────────────────────────────────

class _PickupCard extends StatelessWidget {
  const _PickupCard({
    required this.item,
    required this.onSchedule,
    required this.onAssign,
    required this.onConfirm,
    required this.onFailed,
  });
  final PickupSummary item;
  final VoidCallback onSchedule;
  final VoidCallback onAssign;
  final VoidCallback onConfirm;
  final VoidCallback onFailed;

  @override
  Widget build(BuildContext context) {
    final status = item.pickupStatus;
    final statusColor = status == 'picked_up'
        ? kGreen
        : status == 'failed'
            ? kFlash
            : status == 'scheduled'
                ? kSecondary
                : kSubtext;

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
              child: Text(item.orderNumber,
                  style: pjs(size: 14, weight: FontWeight.w800))),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: statusColor.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(status.replaceAll('_', ' ').toUpperCase(),
                style:
                    pjs(size: 9, weight: FontWeight.w800, color: statusColor)),
          ),
        ]),
        const SizedBox(height: 4),
        Text(item.waybillNumber, style: pjs(size: 12, color: kSubtext)),
        if (item.scheduledDate != null) ...[
          const SizedBox(height: 4),
          Row(children: [
            const Icon(Icons.calendar_today_outlined,
                size: 13, color: kSubtext),
            const SizedBox(width: 4),
            Text('${item.scheduledDate}  ${item.scheduledTimeWindow ?? ''}',
                style: pjs(size: 12, color: kSubtext)),
          ]),
        ],
        if (item.assignedPersonnel != null &&
            item.assignedPersonnel != 'Not assigned') ...[
          const SizedBox(height: 2),
          Row(children: [
            const Icon(Icons.person_outline, size: 13, color: kSubtext),
            const SizedBox(width: 4),
            Text(item.assignedPersonnel!,
                style: pjs(size: 12, color: kSubtext)),
          ]),
        ],
        if (item.attemptCount > 0) ...[
          const SizedBox(height: 2),
          Text('Attempts: ${item.attemptCount}',
              style: pjs(size: 11, color: kFlash)),
        ],
        if (status != 'picked_up') ...[
          const SizedBox(height: 10),
          Wrap(spacing: 6, runSpacing: 6, children: [
            if (status == 'pending_pickup' || status == 'failed')
              _ActionBtn('Schedule', kSecondary, onSchedule),
            if (status == 'pending_pickup' || status == 'scheduled')
              _ActionBtn('Assign', kPrimary, onAssign),
            if (status == 'scheduled')
              _ActionBtn('Confirm Pickup', kGreen, onConfirm),
            if (status == 'scheduled' || status == 'pending_pickup')
              _ActionBtn('Record Failed', kFlash, onFailed),
          ]),
        ],
      ]),
    );
  }
}

class _ActionBtn extends StatelessWidget {
  const _ActionBtn(this.label, this.color, this.onTap);
  final String label;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => OutlinedButton(
        onPressed: onTap,
        style: OutlinedButton.styleFrom(
          side: BorderSide(color: color),
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          minimumSize: Size.zero,
          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
        child: Text(label,
            style: pjs(size: 11, weight: FontWeight.w700, color: color)),
      );
}
