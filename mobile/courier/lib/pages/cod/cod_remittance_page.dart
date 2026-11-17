import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../services/api_service.dart';
import '../../services/courier_repository.dart';
import '../../theme/mimoo_theme.dart';
import '../../widgets/courier_shared.dart';

/// COD & Remittance: cash the riders handed in. Same data and rule as the web page
/// (the confirmed amount must equal the cash collected on the remitted parcels).
class CodRemittancePage extends StatefulWidget {
  const CodRemittancePage({super.key});

  @override
  State<CodRemittancePage> createState() => _CodRemittancePageState();
}

class _CodRemittancePageState extends State<CodRemittancePage> {
  List<Map<String, dynamic>> _rows = [];
  double _awaiting = 0;
  int _awaitingCount = 0;
  String _filter = '';
  bool _loading = true;
  String? _error;
  int? _busy;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _error = null);
    try {
      final r = await CourierRepository.instance.codRemittances(status: _filter);
      if (!mounted) return;
      setState(() {
        _rows = r.items;
        _awaiting = r.awaitingAmount;
        _awaitingCount = r.awaitingCount;
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

  Future<void> _confirm(Map<String, dynamic> r) async {
    final amount = courierPeso((r['amount'] as num?) ?? 0);
    final ok = await courierConfirm(
      context,
      title: 'Confirm cash received?',
      message:
          'Confirm that you received $amount from ${r['rider_name'] ?? 'the rider'} (ref ${r['reference']}). This cannot be undone.',
      confirmLabel: 'Confirm cash',
    );
    if (!ok || !mounted) return;
    setState(() => _busy = r['id'] as int);
    try {
      final msg = await CourierRepository.instance.confirmCodRemittance(r['id'] as int);
      HapticFeedback.mediumImpact();
      if (mounted) courierSnack(context, msg, kGreen);
      await _load();
    } catch (e) {
      HapticFeedback.heavyImpact();
      if (mounted) courierSnack(context, ApiService.friendlyError(e), kFlash);
    } finally {
      if (mounted) setState(() => _busy = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kSurface,
      appBar: AppBar(title: const Text('COD & Remittance')),
      body: _loading
          ? const CourierLoadingState()
          : _error != null && _rows.isEmpty
              ? CourierErrorState(message: _error!, onRetry: _load)
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    children: [
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(colors: [kPrimary, kSecondary]),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text('Waiting for your confirmation',
                              style: pjs(size: 12, color: Colors.white70)),
                          const SizedBox(height: 4),
                          Text(courierPeso(_awaiting),
                              style: pjs(size: 26, weight: FontWeight.w800, color: Colors.white)),
                          Text('$_awaitingCount remittance${_awaitingCount == 1 ? '' : 's'}',
                              style: pjs(size: 12, color: Colors.white70)),
                        ]),
                      ),
                      const SizedBox(height: 12),
                      CourierFilterChips(
                        options: const {'': 'All', 'submitted': 'To confirm', 'confirmed': 'Confirmed'},
                        value: _filter,
                        onChanged: (v) {
                          setState(() {
                            _filter = v;
                            _loading = true;
                          });
                          _load();
                        },
                      ),
                      const SizedBox(height: 8),
                      if (_error != null)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Text(_error!, style: pjs(size: 12, color: kFlash)),
                        ),
                      if (_rows.isEmpty)
                        const SizedBox(
                          height: 280,
                          child: CourierEmptyState(
                            icon: Icons.account_balance_wallet_outlined,
                            message: 'No remittances yet. Cash handed in by your riders appears here.',
                          ),
                        ),
                      for (final r in _rows) _card(r),
                    ],
                  ),
                ),
    );
  }

  Widget _card(Map<String, dynamic> r) {
    final submitted = r['status'] == 'submitted';
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: submitted ? kSecondary.withValues(alpha: 0.5) : kBorder),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Expanded(
            child: Text(courierPeso((r['amount'] as num?) ?? 0),
                style: pjs(size: 18, weight: FontWeight.w800)),
          ),
          CourierStatusBadge(
            status: submitted ? 'pending' : 'completed',
            label: submitted ? 'To confirm' : 'Confirmed',
          ),
        ]),
        const SizedBox(height: 4),
        Text('${r['rider_name'] ?? 'Rider'} · ${r['parcels_count'] ?? 0} parcel(s)',
            style: pjs(size: 12, color: kSubtext)),
        Text('Ref ${r['reference']} · ${_date(r['remitted_at'])}',
            style: pjs(size: 11, color: kSubtext)),
        if (submitted) ...[
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: FilledButton.icon(
              onPressed: _busy == r['id'] ? null : () => _confirm(r),
              style: FilledButton.styleFrom(backgroundColor: kPrimary),
              icon: _busy == r['id']
                  ? const SizedBox(
                      width: 16, height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Icon(Icons.check_circle_outline),
              label: Text('Confirm cash received',
                  style: pjs(size: 13, weight: FontWeight.w700, color: Colors.white)),
            ),
          ),
        ],
      ]),
    );
  }

  String _date(dynamic iso) {
    final d = DateTime.tryParse('${iso ?? ''}')?.toLocal();
    if (d == null) return '';
    const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return '${m[d.month - 1]} ${d.day}, ${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
  }
}
