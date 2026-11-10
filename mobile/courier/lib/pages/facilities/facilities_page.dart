import 'package:flutter/material.dart';
import '../../models/courier_models.dart';
import '../../services/api_service.dart';
import '../../services/courier_repository.dart';
import '../../theme/mimoo_theme.dart';

/// Facility management — mirrors the web courier BranchFacility page.
class FacilitiesPage extends StatefulWidget {
  const FacilitiesPage({super.key});

  @override
  State<FacilitiesPage> createState() => _FacilitiesPageState();
}

class _FacilitiesPageState extends State<FacilitiesPage> {
  final _searchCtrl = TextEditingController();

  List<FacilityItem> _items = [];
  bool _loading = true;
  String? _error;
  String _type = 'all';
  final bool _includeInactive = true;

  static const _types = ['all', 'Main Hub', 'Sorting Hub', 'Branch'];

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

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final f = await CourierRepository.instance.facilities(
        includeInactive: _includeInactive,
        search: _searchCtrl.text,
        type: _type,
      );
      if (!mounted) return;
      setState(() {
        _items = f;
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

  Future<void> _openForm([FacilityItem? facility]) async {
    final saved = await Navigator.push<bool>(
      context,
      MaterialPageRoute(
        builder: (_) => FacilityFormPage(
          facility: facility,
          facilities: _items,
        ),
      ),
    );
    if (saved == true) await _load();
  }

  Future<void> _delete(FacilityItem facility) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Delete Facility'),
        content:
            Text('Delete "${facility.facilityName}"? This cannot be undone.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancel')),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(backgroundColor: kFlash),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (ok != true || !mounted) return;

    try {
      await CourierRepository.instance.deleteFacility(facility.id);
      if (!mounted) return;
      _snack('Facility deleted.', kGreen);
      await _load();
    } on ApiException catch (e) {
      if (!mounted) return;
      _snack(e.message, kFlash);
    } catch (e) {
      if (!mounted) return;
      _snack(ApiService.friendlyError(e), kFlash);
    }
  }

  void _snack(String msg, Color color) {
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
        backgroundColor: kCard,
        title:
            Text('Facilities', style: pjs(size: 17, weight: FontWeight.w800)),
        actions: [
          IconButton(
            tooltip: 'Add facility',
            onPressed: () => _openForm(),
            icon: const Icon(Icons.add_business_outlined, color: kPrimary),
          ),
        ],
      ),
      body: Column(children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(12, 12, 12, 6),
          child: TextField(
            controller: _searchCtrl,
            textInputAction: TextInputAction.search,
            onSubmitted: (_) => _load(),
            style: pjs(size: 13),
            decoration: mimooInput(
              hint: 'Search name, code or city',
              icon: Icons.search,
            ).copyWith(
              suffixIcon: IconButton(
                icon: const Icon(Icons.arrow_forward, size: 18),
                onPressed: _load,
              ),
            ),
          ),
        ),
        SizedBox(
          height: 42,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            children: _types.map((t) {
              final sel = _type == t;
              final label = t == 'all' ? 'All Types' : t;
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: FilterChip(
                  label: Text(label,
                      style: pjs(
                          size: 11,
                          weight: FontWeight.w600,
                          color: sel ? Colors.white : kSubtext)),
                  selected: sel,
                  onSelected: (_) {
                    setState(() => _type = t);
                    _load();
                  },
                  selectedColor: kPrimary,
                  backgroundColor: kSurface,
                  checkmarkColor: Colors.white,
                  side: BorderSide(color: sel ? kPrimary : kBorder),
                  padding: const EdgeInsets.symmetric(horizontal: 2),
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
                  ? _ErrorView(message: _error!, onRetry: _load)
                  : _items.isEmpty
                      ? Center(
                          child: Text('No facilities found.',
                              style: pjs(size: 14, color: kSubtext)))
                      : RefreshIndicator(
                          color: kPrimary,
                          onRefresh: _load,
                          child: ListView.builder(
                            padding: const EdgeInsets.all(12),
                            itemCount: _items.length,
                            itemBuilder: (_, i) => _FacilityCard(
                              item: _items[i],
                              onEdit: () => _openForm(_items[i]),
                              onDelete: () => _delete(_items[i]),
                            ),
                          ),
                        ),
        ),
      ]),
    );
  }
}

class _FacilityCard extends StatelessWidget {
  const _FacilityCard({
    required this.item,
    required this.onEdit,
    required this.onDelete,
  });
  final FacilityItem item;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    final active = item.isActive;
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
            child: Text(item.facilityName,
                style: pjs(size: 14, weight: FontWeight.w800)),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: (active ? kGreen : kSubtext).withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(active ? 'ACTIVE' : 'INACTIVE',
                style: pjs(
                    size: 9,
                    weight: FontWeight.w800,
                    color: active ? kGreen : kSubtext)),
          ),
        ]),
        const SizedBox(height: 4),
        Text('${item.facilityType} · ${item.facilityCode}',
            style: pjs(size: 12, color: kSubtext)),
        if (item.parentFacility != null)
          Text('Parent: ${item.parentFacility}',
              style: pjs(size: 12, color: kSubtext)),
        const SizedBox(height: 4),
        Text(
            [item.address, item.city, item.province]
                .whereType<String>()
                .where((s) => s.trim().isNotEmpty)
                .join(', '),
            style: pjs(size: 12, color: kSubtext)),
        if (item.manager != null && item.manager!.isNotEmpty)
          Text('Manager: ${item.manager}',
              style: pjs(size: 12, color: kSubtext)),
        if (item.contact != null && item.contact!.isNotEmpty)
          Text('Contact: ${item.contact}',
              style: pjs(size: 12, color: kSubtext)),
        if (item.coverage.isNotEmpty)
          Text('Coverage: ${item.coverage.join(', ')}',
              style: pjs(size: 12, color: kSubtext)),
        const SizedBox(height: 8),
        Row(children: [
          Expanded(
            child: OutlinedButton.icon(
              onPressed: onEdit,
              icon: const Icon(Icons.edit_outlined, size: 15),
              label: const Text('Edit'),
              style: OutlinedButton.styleFrom(
                foregroundColor: kPrimary,
                side: const BorderSide(color: kPrimary),
                minimumSize: Size.zero,
                padding: const EdgeInsets.symmetric(vertical: 8),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8)),
              ),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: OutlinedButton.icon(
              onPressed: onDelete,
              icon: const Icon(Icons.delete_outline, size: 15),
              label: const Text('Delete'),
              style: OutlinedButton.styleFrom(
                foregroundColor: kFlash,
                side: const BorderSide(color: kFlash),
                minimumSize: Size.zero,
                padding: const EdgeInsets.symmetric(vertical: 8),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8)),
              ),
            ),
          ),
        ]),
      ]),
    );
  }
}

class FacilityFormPage extends StatefulWidget {
  const FacilityFormPage({
    super.key,
    this.facility,
    required this.facilities,
  });

  final FacilityItem? facility;
  final List<FacilityItem> facilities;

  @override
  State<FacilityFormPage> createState() => _FacilityFormPageState();
}

class _FacilityFormPageState extends State<FacilityFormPage> {
  final _formKey = GlobalKey<FormState>();

  late final TextEditingController _name;
  late final TextEditingController _region;
  late final TextEditingController _province;
  late final TextEditingController _city;
  late final TextEditingController _address;
  late final TextEditingController _manager;
  late final TextEditingController _contact;
  late final TextEditingController _coverage;

  String _type = 'Main Hub';
  String _status = 'Active';
  int? _parentId;
  bool _saving = false;
  String? _error;

  static const _types = ['Main Hub', 'Sorting Hub', 'Branch'];
  static const _statuses = ['Active', 'Inactive'];

  @override
  void initState() {
    super.initState();
    final f = widget.facility;
    _name = TextEditingController(text: f?.facilityName ?? '');
    _region = TextEditingController(text: f?.region ?? '');
    _province = TextEditingController(text: f?.province ?? '');
    _city = TextEditingController(text: f?.city ?? '');
    _address = TextEditingController(text: f?.address ?? '');
    _manager = TextEditingController(text: f?.manager ?? '');
    _contact = TextEditingController(text: f?.contact ?? '');
    _coverage = TextEditingController(text: f?.coverage.join(', ') ?? '');
    _type = f?.facilityType ?? 'Main Hub';
    _status = f?.status ?? 'Active';
    _parentId = f?.parentFacilityId;
  }

  @override
  void dispose() {
    _name.dispose();
    _region.dispose();
    _province.dispose();
    _city.dispose();
    _address.dispose();
    _manager.dispose();
    _contact.dispose();
    _coverage.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_saving || !_formKey.currentState!.validate()) return;

    final coverage = _coverage.text
        .split(',')
        .map((c) => c.trim())
        .where((c) => c.isNotEmpty)
        .toList();

    final payload = <String, dynamic>{
      'facility_name': _name.text.trim(),
      'facility_type': _type,
      'parent_facility_id': _type == 'Main Hub' ? null : _parentId,
      'status': _status,
      'region': _region.text.trim(),
      'province': _province.text.trim().isEmpty ? null : _province.text.trim(),
      'city': _city.text.trim(),
      'address': _address.text.trim(),
      'manager_name': _manager.text.trim(),
      'contact_number': _contact.text.trim(),
      'coverage_cities': coverage,
    };

    setState(() {
      _saving = true;
      _error = null;
    });

    try {
      final id = widget.facility?.id;
      if (id == null) {
        await CourierRepository.instance.createFacility(payload);
      } else {
        await CourierRepository.instance.updateFacility(id, payload);
      }
      if (!mounted) return;
      Navigator.pop(context, true);
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _saving = false;
        _error = e.errors?.values.firstOrNull?.firstOrNull ?? e.message;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _saving = false;
        _error = ApiService.friendlyError(e);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final others =
        widget.facilities.where((f) => f.id != widget.facility?.id).toList();

    return Scaffold(
      backgroundColor: kSurface,
      appBar: AppBar(
        backgroundColor: kCard,
        title: Text(widget.facility == null ? 'Add Facility' : 'Edit Facility',
            style: pjs(size: 17, weight: FontWeight.w800)),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _label('Facility name'),
            TextFormField(
              controller: _name,
              style: pjs(size: 14),
              decoration: mimooInput(hint: 'e.g. Quezon City Main Hub'),
              validator: (v) =>
                  (v == null || v.trim().isEmpty) ? 'Required' : null,
            ),
            _label('Facility type'),
            DropdownButtonFormField<String>(
              initialValue: _type,
              items: _types
                  .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                  .toList(),
              onChanged: (v) {
                if (v == null) return;
                setState(() {
                  _type = v;
                  if (v == 'Main Hub') _parentId = null;
                });
              },
              decoration: mimooInput(hint: 'Select type'),
            ),
            if (_type != 'Main Hub') ...[
              _label('Parent facility'),
              DropdownButtonFormField<int?>(
                initialValue: _parentId,
                items: [
                  const DropdownMenuItem<int?>(
                      value: null, child: Text('No parent')),
                  ...others.map((f) => DropdownMenuItem<int?>(
                        value: f.id,
                        child: Text(f.facilityName,
                            overflow: TextOverflow.ellipsis),
                      )),
                ],
                onChanged: (v) => setState(() => _parentId = v),
                decoration: mimooInput(hint: 'Select parent'),
              ),
            ],
            _label('Status'),
            DropdownButtonFormField<String>(
              initialValue: _status,
              items: _statuses
                  .map((s) => DropdownMenuItem(value: s, child: Text(s)))
                  .toList(),
              onChanged: (v) => setState(() => _status = v ?? 'Active'),
              decoration: mimooInput(hint: 'Select status'),
            ),
            _label('Region'),
            TextFormField(
              controller: _region,
              style: pjs(size: 14),
              decoration: mimooInput(hint: 'e.g. NCR'),
              validator: (v) =>
                  (v == null || v.trim().isEmpty) ? 'Required' : null,
            ),
            _label('Province (optional)'),
            TextFormField(
              controller: _province,
              style: pjs(size: 14),
              decoration: mimooInput(hint: 'e.g. Metro Manila'),
            ),
            _label('City'),
            TextFormField(
              controller: _city,
              style: pjs(size: 14),
              decoration: mimooInput(hint: 'e.g. Quezon City'),
              validator: (v) =>
                  (v == null || v.trim().isEmpty) ? 'Required' : null,
            ),
            _label('Address'),
            TextFormField(
              controller: _address,
              maxLines: 2,
              style: pjs(size: 14),
              decoration: mimooInput(hint: 'Complete street address'),
              validator: (v) =>
                  (v == null || v.trim().isEmpty) ? 'Required' : null,
            ),
            _label('Manager name'),
            TextFormField(
              controller: _manager,
              style: pjs(size: 14),
              decoration: mimooInput(hint: 'Full name'),
              validator: (v) =>
                  (v == null || v.trim().isEmpty) ? 'Required' : null,
            ),
            _label('Contact number'),
            TextFormField(
              controller: _contact,
              keyboardType: TextInputType.phone,
              style: pjs(size: 14),
              decoration: mimooInput(hint: '09XXXXXXXXX'),
              validator: (v) {
                final value = v?.trim() ?? '';
                if (value.isEmpty) return 'Required';
                if (!RegExp(r'^(09|\+639)\d{9}$').hasMatch(value)) {
                  return 'Use 09XXXXXXXXX or +639XXXXXXXXX';
                }
                return null;
              },
            ),
            _label('Coverage cities (comma separated)'),
            TextFormField(
              controller: _coverage,
              maxLines: 2,
              style: pjs(size: 14),
              decoration: mimooInput(hint: 'e.g. Quezon City, Makati, Pasig'),
              validator: (v) {
                final cities = (v ?? '')
                    .split(',')
                    .map((c) => c.trim())
                    .where((c) => c.isNotEmpty)
                    .toList();
                return cities.isEmpty ? 'Enter at least one city' : null;
              },
            ),
            if (_error != null) ...[
              const SizedBox(height: 14),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: kFlash.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: kFlash.withValues(alpha: 0.3)),
                ),
                child: Text(_error!,
                    style: pjs(size: 12, color: kFlash, height: 1.4)),
              ),
            ],
            const SizedBox(height: 20),
            SizedBox(
              height: 50,
              child: FilledButton(
                onPressed: _saving ? null : _save,
                style: FilledButton.styleFrom(
                  backgroundColor: kPrimary,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
                child: _saving
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white))
                    : Text('Save Facility',
                        style: pjs(
                            size: 15,
                            weight: FontWeight.w800,
                            color: Colors.white)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _label(String text) => Padding(
        padding: const EdgeInsets.only(top: 14, bottom: 6),
        child: Text(text,
            style: pjs(size: 12, weight: FontWeight.w600, color: kSubtext)),
      );
}

class _ErrorView extends StatelessWidget {
  const _ErrorView({required this.message, required this.onRetry});
  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) => Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            const Icon(Icons.wifi_off_outlined, size: 48, color: kSubtext),
            const SizedBox(height: 12),
            Text(message,
                style: pjs(size: 13, color: kSubtext),
                textAlign: TextAlign.center),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: onRetry,
              style: FilledButton.styleFrom(backgroundColor: kPrimary),
              child: Text('Try again',
                  style: pjs(
                      size: 13, weight: FontWeight.w700, color: Colors.white)),
            ),
          ]),
        ),
      );
}
