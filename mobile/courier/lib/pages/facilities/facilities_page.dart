import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../services/courier_repository.dart';
import '../../theme/mimoo_theme.dart';
import '../../widgets/courier_shared.dart';

/// Branches & Facilities: Main Hubs, Sorting Hubs and Branches. Scans are validated against these
/// records, so keeping them accurate (active, linked to a parent, correct coverage) matters.
class FacilitiesPage extends StatefulWidget {
  const FacilitiesPage({super.key});

  @override
  State<FacilitiesPage> createState() => _FacilitiesPageState();
}

class _FacilitiesPageState extends State<FacilitiesPage> {
  List<Map<String, dynamic>> _rows = [];
  String _type = 'all';
  String _query = '';
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _error = null);
    try {
      final r = await CourierRepository.instance.allFacilities();
      if (!mounted) return;
      setState(() {
        _rows = r;
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

  Future<void> _edit([Map<String, dynamic>? f]) async {
    final saved = await Navigator.push<bool>(
      context,
      MaterialPageRoute(builder: (_) => _FacilityForm(existing: f, all: _rows)),
    );
    if (saved == true) _load();
  }

  Future<void> _delete(Map<String, dynamic> f) async {
    final ok = await courierConfirm(context,
        title: 'Delete facility?',
        message: '${f['facility_name']} will be removed. This cannot be undone.',
        confirmLabel: 'Delete',
        destructive: true);
    if (!ok || !mounted) return;
    try {
      final msg = await CourierRepository.instance.deleteFacility(f['id'] as int);
      if (mounted) courierSnack(context, msg, kGreen);
      _load();
    } catch (e) {
      if (mounted) courierSnack(context, e is ApiException ? e.message : ApiService.friendlyError(e), kFlash);
    }
  }

  @override
  Widget build(BuildContext context) {
    final q = _query.trim().toLowerCase();
    final shown = _rows.where((f) {
      if (_type != 'all' && f['facility_type'] != _type) return false;
      return q.isEmpty || '${f['facility_name']} ${f['facility_code']} ${f['city']}'.toLowerCase().contains(q);
    }).toList();

    return Scaffold(
      backgroundColor: kSurface,
      appBar: AppBar(title: const Text('Branches & Facilities')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _edit(),
        backgroundColor: kPrimary,
        icon: const Icon(Icons.add, color: Colors.white),
        label: Text('Add facility', style: pjs(size: 13, weight: FontWeight.w700, color: Colors.white)),
      ),
      body: _loading
          ? const CourierLoadingState()
          : _error != null && _rows.isEmpty
              ? CourierErrorState(message: _error!, onRetry: _load)
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
                    children: [
                      CourierSearchField(hint: 'Search name, code or city', onChanged: (v) => setState(() => _query = v)),
                      const SizedBox(height: 8),
                      CourierFilterChips(
                        options: const {'all': 'All', 'Main Hub': 'Main hubs', 'Sorting Hub': 'Sorting hubs', 'Branch': 'Branches'},
                        value: _type,
                        onChanged: (v) => setState(() => _type = v),
                      ),
                      const SizedBox(height: 8),
                      if (shown.isEmpty)
                        SizedBox(
                          height: 280,
                          child: CourierEmptyState(
                            icon: Icons.warehouse_outlined,
                            message: _rows.isEmpty ? 'No facilities yet. Add your Main Hub first.' : 'No facilities match.',
                            actionLabel: _rows.isEmpty ? 'Add facility' : null,
                            onAction: _rows.isEmpty ? () => _edit() : null,
                          ),
                        ),
                      for (final f in shown) _card(f),
                    ],
                  ),
                ),
    );
  }

  Widget _card(Map<String, dynamic> f) {
    final active = f['status'] == 'Active';
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
          color: kCard,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: kBorder)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Expanded(child: Text('${f['facility_name']}', style: pjs(size: 14, weight: FontWeight.w800))),
          CourierStatusBadge(status: active ? 'active' : 'suspended', label: '${f['status']}'),
        ]),
        const SizedBox(height: 2),
        Text('${f['facility_code']} · ${f['facility_type']}${f['parent_facility'] != null ? ' · under ${f['parent_facility']}' : ''}',
            style: pjs(size: 12, color: kSubtext)),
        Text('${f['city'] ?? ''} · ${f['manager'] ?? ''} · ${f['contact'] ?? ''}', style: pjs(size: 12, color: kSubtext)),
        Wrap(alignment: WrapAlignment.end, children: [
          TextButton.icon(
            onPressed: () => _edit(f),
            icon: const Icon(Icons.edit_outlined, size: 18),
            label: Text('Edit', style: pjs(size: 12, weight: FontWeight.w700)),
          ),
          TextButton.icon(
            onPressed: () => _delete(f),
            icon: const Icon(Icons.delete_outline, size: 18, color: kFlash),
            label: Text('Delete', style: pjs(size: 12, weight: FontWeight.w700, color: kFlash)),
          ),
        ]),
      ]),
    );
  }
}

class _FacilityForm extends StatefulWidget {
  const _FacilityForm({this.existing, required this.all});
  final Map<String, dynamic>? existing;
  final List<Map<String, dynamic>> all;

  @override
  State<_FacilityForm> createState() => _FacilityFormState();
}

class _FacilityFormState extends State<_FacilityForm> {
  final _key = GlobalKey<FormState>();
  late final Map<String, TextEditingController> _c;
  late String _type;
  late String _status;
  int? _parent;
  bool _busy = false;
  Map<String, String> _serverErrors = {};

  @override
  void initState() {
    super.initState();
    final f = widget.existing ?? {};
    String v(String k) => f[k]?.toString() ?? '';
    _c = {
      'facility_name': TextEditingController(text: v('facility_name')),
      'region': TextEditingController(text: v('region')),
      'province': TextEditingController(text: v('province')),
      'city': TextEditingController(text: v('city')),
      'address': TextEditingController(text: v('address')),
      'manager_name': TextEditingController(text: v('manager')),
      'contact_number': TextEditingController(text: v('contact')),
      'coverage': TextEditingController(
          text: ((f['coverage_cities'] ?? f['coverage']) as List<dynamic>? ?? []).join(', ')),
    };
    _type = v('facility_type').isEmpty ? 'Branch' : v('facility_type');
    _status = v('status').isEmpty ? 'Active' : v('status');
    _parent = f['parent_facility_id'] as int?;
  }

  @override
  void dispose() {
    for (final c in _c.values) {
      c.dispose();
    }
    super.dispose();
  }

  String? _req(String? v, String label) => (v == null || v.trim().isEmpty) ? '$label is required.' : null;

  Future<void> _save() async {
    if (!_key.currentState!.validate()) return;
    setState(() {
      _busy = true;
      _serverErrors = {};
    });
    try {
      final body = {
        'facility_name': _c['facility_name']!.text.trim(),
        'facility_type': _type,
        'parent_facility_id': _type == 'Main Hub' ? null : _parent,
        'status': _status,
        'region': _c['region']!.text.trim(),
        'province': _c['province']!.text.trim().isEmpty ? null : _c['province']!.text.trim(),
        'city': _c['city']!.text.trim(),
        'address': _c['address']!.text.trim(),
        'manager_name': _c['manager_name']!.text.trim(),
        'contact_number': _c['contact_number']!.text.trim(),
        'coverage_cities': _c['coverage']!.text.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList(),
      };
      await CourierRepository.instance.saveFacility(body, id: widget.existing?['id'] as int?);
      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      if (mounted) courierSnack(context, e is ApiException ? e.message : ApiService.friendlyError(e), kFlash);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Widget _field(String k, String label, {String? Function(String?)? validator, TextInputType? type, String? hint}) => Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: TextFormField(
          controller: _c[k],
          keyboardType: type,
          style: pjs(size: 14),
          decoration: mimooInput(hint: hint ?? label, error: _serverErrors[k]).copyWith(labelText: label),
          validator: validator,
        ),
      );

  @override
  Widget build(BuildContext context) {
    final parents = widget.all.where((f) => f['id'] != widget.existing?['id']).toList();
    return Scaffold(
      backgroundColor: kSurface,
      appBar: AppBar(title: Text(widget.existing == null ? 'Add facility' : 'Edit facility')),
      body: SafeArea(
        child: Form(
          key: _key,
          child: ListView(padding: const EdgeInsets.all(16), children: [
            _field('facility_name', 'Facility name', validator: (v) => _req(v, 'Name')),
            DropdownButtonFormField<String>(
              initialValue: _type,
              decoration: mimooInput(hint: 'Type').copyWith(labelText: 'Type'),
              items: const ['Main Hub', 'Sorting Hub', 'Branch'].map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
              onChanged: (v) => setState(() => _type = v ?? 'Branch'),
            ),
            const SizedBox(height: 12),
            if (_type != 'Main Hub')
              Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: DropdownButtonFormField<int?>(
                  initialValue: _parent,
                  isExpanded: true,
                  decoration: mimooInput(hint: 'Parent facility', error: _serverErrors['parent_facility_id']).copyWith(labelText: 'Parent facility'),
                  items: [
                    const DropdownMenuItem<int?>(value: null, child: Text('None')),
                    for (final f in parents) DropdownMenuItem<int?>(value: f['id'] as int, child: Text('${f['facility_name']}', overflow: TextOverflow.ellipsis)),
                  ],
                  onChanged: (v) => setState(() => _parent = v),
                ),
              ),
            DropdownButtonFormField<String>(
              initialValue: _status,
              decoration: mimooInput(hint: 'Status').copyWith(labelText: 'Status'),
              items: const ['Active', 'Inactive'].map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
              onChanged: (v) => setState(() => _status = v ?? 'Active'),
            ),
            const SizedBox(height: 12),
            _field('region', 'Region', validator: (v) => _req(v, 'Region')),
            _field('province', 'Province (optional)'),
            _field('city', 'City', validator: (v) => _req(v, 'City')),
            _field('address', 'Address', validator: (v) => _req(v, 'Address')),
            _field('manager_name', 'Manager', validator: (v) => _req(v, 'Manager')),
            _field('contact_number', 'Contact number', type: TextInputType.phone, hint: '09XXXXXXXXX', validator: (v) {
              final r = _req(v, 'Contact number');
              if (r != null) return r;
              return RegExp(r'^(09|\+639)\d{9}$').hasMatch(v!.trim()) ? null : 'Use a valid number like 09171234567.';
            }),
            _field('coverage', 'Coverage cities (comma separated)', validator: (v) => (v == null || v.trim().isEmpty) ? 'Add at least one coverage city.' : null),
            SizedBox(
              height: 52,
              child: FilledButton(
                onPressed: _busy ? null : _save,
                style: FilledButton.styleFrom(backgroundColor: kPrimary),
                child: _busy
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : Text('Save facility', style: pjs(size: 14, weight: FontWeight.w700, color: Colors.white)),
              ),
            ),
          ]),
        ),
      ),
    );
  }
}
