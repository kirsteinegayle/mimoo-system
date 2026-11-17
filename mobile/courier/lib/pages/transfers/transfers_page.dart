import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../services/api_service.dart';
import '../../services/courier_repository.dart';
import '../../theme/mimoo_theme.dart';
import '../../widgets/courier_shared.dart';

/// Sorting & Transfers: parcels sitting at each facility and moving them to the next checkpoint.
/// Same endpoint and scan validation as the web page; a refused transfer shows the exact reason
/// and is recorded in the scan audit log without changing the parcel.
class TransfersPage extends StatefulWidget {
  const TransfersPage({super.key});

  @override
  State<TransfersPage> createState() => _TransfersPageState();
}

class _TransfersPageState extends State<TransfersPage> {
  List<Map<String, dynamic>> _facilities = [];
  List<Map<String, dynamic>> _parcels = [];
  List<Map<String, dynamic>> _recent = [];
  int? _at;
  String _query = '';
  bool _loading = true;
  String? _error;
  String? _busy;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _error = null);
    try {
      final r = await CourierRepository.instance.transfersData(facilityId: _at);
      if (!mounted) return;
      List<Map<String, dynamic>> list(String k) => (r[k] as List<dynamic>? ?? [])
          .map((e) => Map<String, dynamic>.from(e as Map))
          .toList();
      setState(() {
        _facilities = list('facilities');
        _parcels = list('parcels');
        _recent = list('recent');
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

  String _name(dynamic id) => _facilities
      .firstWhere((f) => f['id'] == id, orElse: () => {'facility_name': '#$id'})['facility_name']
      .toString();

  Future<void> _transfer(Map<String, dynamic> p) async {
    final targets = _facilities
        .where((f) => f['id'] != p['facility_id'] && f['status'] == 'Active')
        .toList();
    if (targets.isEmpty) {
      courierSnack(context, 'No other active facility to transfer to.', kFlash);
      return;
    }
    final to = await showModalBottomSheet<Map<String, dynamic>>(
      context: context,
      showDragHandle: true,
      builder: (ctx) => SafeArea(
        child: ListView(shrinkWrap: true, children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 8),
            child: Text('Transfer ${p['waybill']} to…',
                style: pjs(size: 15, weight: FontWeight.w800)),
          ),
          for (final f in targets)
            ListTile(
              minVerticalPadding: 12,
              leading: const Icon(Icons.warehouse_outlined, color: kPrimary),
              title: Text('${f['facility_name']}', style: pjs(size: 14, weight: FontWeight.w600)),
              subtitle: Text('${f['facility_type']} · ${f['city'] ?? ''}', style: pjs(size: 12, color: kSubtext)),
              onTap: () => Navigator.pop(ctx, f),
            ),
        ]),
      ),
    );
    if (to == null || !mounted) return;
    final ok = await courierConfirm(context,
        title: 'Transfer parcel?',
        message: '${p['waybill']} will move from ${_name(p['facility_id'])} to ${to['facility_name']}.',
        confirmLabel: 'Transfer');
    if (!ok || !mounted) return;
    setState(() => _busy = '${p['waybill']}');
    try {
      final msg = await CourierRepository.instance.transferParcel('${p['waybill']}', to['id'] as int);
      HapticFeedback.mediumImpact();
      if (mounted) courierSnack(context, msg, kGreen);
      await _load();
    } catch (e) {
      HapticFeedback.heavyImpact();
      // The server's reason, not a generic error.
      if (mounted) courierSnack(context, e is ApiException ? e.message : ApiService.friendlyError(e), kFlash);
    } finally {
      if (mounted) setState(() => _busy = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final q = _query.trim().toLowerCase();
    final shown = _parcels.where((p) {
      if (q.isEmpty) return true;
      return '${p['waybill']} ${p['destination']}'.toLowerCase().contains(q);
    }).toList();

    return Scaffold(
      backgroundColor: kSurface,
      appBar: AppBar(title: const Text('Sorting & Transfers')),
      body: _loading
          ? const CourierLoadingState()
          : _error != null && _parcels.isEmpty && _facilities.isEmpty
              ? CourierErrorState(message: _error!, onRetry: _load)
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    children: [
                      DropdownButtonFormField<int?>(
                        initialValue: _at,
                        isExpanded: true,
                        decoration: mimooInput(hint: 'Facility', icon: Icons.warehouse_outlined),
                        items: [
                          const DropdownMenuItem<int?>(value: null, child: Text('All facilities')),
                          for (final f in _facilities)
                            DropdownMenuItem<int?>(
                                value: f['id'] as int,
                                child: Text('${f['facility_name']} (${f['facility_type']})',
                                    overflow: TextOverflow.ellipsis)),
                        ],
                        onChanged: (v) {
                          setState(() {
                            _at = v;
                            _loading = true;
                          });
                          _load();
                        },
                      ),
                      const SizedBox(height: 10),
                      CourierSearchField(
                          hint: 'Search waybill or destination',
                          onChanged: (v) => setState(() => _query = v)),
                      const SizedBox(height: 12),
                      if (shown.isEmpty)
                        SizedBox(
                          height: 260,
                          child: CourierEmptyState(
                            icon: Icons.swap_horiz,
                            message: _parcels.isEmpty
                                ? 'No parcels are waiting at a facility. Scan parcels in first.'
                                : 'No parcels match your search.',
                          ),
                        ),
                      for (final p in shown) _parcelCard(p),
                      if (_recent.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        Text('Recent transfers', style: pjs(size: 14, weight: FontWeight.w800)),
                        const SizedBox(height: 8),
                        for (final r in _recent)
                          Container(
                            margin: const EdgeInsets.only(bottom: 6),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                                color: kCard,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: kBorder)),
                            child: Text('${r['waybill']} → ${r['to']}\n${r['notes'] ?? ''}',
                                style: pjs(size: 12, color: kSubtext)),
                          ),
                      ],
                    ],
                  ),
                ),
    );
  }

  Widget _parcelCard(Map<String, dynamic> p) => Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
            color: kCard,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: kBorder)),
        child: Row(children: [
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('${p['waybill']}', style: pjs(size: 14, weight: FontWeight.w800)),
              const SizedBox(height: 2),
              Text('At ${_name(p['facility_id'])}', style: pjs(size: 12, color: kSubtext)),
              Text('To ${p['destination'] ?? 'N/A'} · ${p['status']}',
                  style: pjs(size: 11, color: kSubtext)),
            ]),
          ),
          FilledButton(
            onPressed: _busy == '${p['waybill']}' ? null : () => _transfer(p),
            style: FilledButton.styleFrom(
                backgroundColor: kPrimary, minimumSize: const Size(48, 48)),
            child: Text('Transfer',
                style: pjs(size: 12, weight: FontWeight.w700, color: Colors.white)),
          ),
        ]),
      );
}
