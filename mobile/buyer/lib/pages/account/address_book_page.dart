import 'package:flutter/material.dart';

import '../../models/buyer_address.dart';
import '../../services/address_repository.dart';
import '../../services/api_service.dart';
import '../../widgets/address_dropdown.dart';

const _kPrimary = Color(0xFF34175B);
const _kSecondary = Color(0xFF6B38D4);
const _kBorder = Color(0xFFDDD8F0);
const _kSubtext = Color(0xFF8A84A3);

/// Address book: list, add, edit, delete, set default.
///
/// When [selectMode] is true (checkout picker), tapping an address pops the
/// route with the selected [BuyerAddress].
class AddressBookPage extends StatefulWidget {
  const AddressBookPage({super.key, this.selectMode = false, this.selectedId});

  final bool selectMode;
  final int? selectedId;

  @override
  State<AddressBookPage> createState() => _AddressBookPageState();
}

class _AddressBookPageState extends State<AddressBookPage> {
  List<BuyerAddress> _items = [];
  bool _loading = true;
  String? _error;
  bool _busy = false;

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
      final list = await AddressRepository.instance.fetchAll();
      if (!mounted) return;
      setState(() {
        _items = list;
        _loading = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.message;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = 'Could not load addresses. Check your connection.';
        _loading = false;
      });
    }
  }

  void _snack(String msg, {bool error = false}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: error ? Colors.red.shade700 : _kPrimary,
      behavior: SnackBarBehavior.floating,
    ));
  }

  Future<void> _openForm([BuyerAddress? existing]) async {
    final saved = await Navigator.push<bool>(
      context,
      MaterialPageRoute(builder: (_) => AddressFormPage(existing: existing)),
    );
    if (saved == true) _load();
  }

  Future<void> _setDefault(BuyerAddress a) async {
    setState(() => _busy = true);
    try {
      final list = await AddressRepository.instance.setDefault(a.id);
      if (!mounted) return;
      setState(() => _items = list);
      _snack('Default address updated.');
    } on ApiException catch (e) {
      _snack(e.message, error: true);
    } catch (_) {
      _snack('Something went wrong. Please try again.', error: true);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _delete(BuyerAddress a) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete address?'),
        content: Text('"${a.label}" will be removed from your address book.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancel')),
          TextButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('Delete', style: TextStyle(color: Colors.red))),
        ],
      ),
    );
    if (ok != true) return;
    setState(() => _busy = true);
    try {
      await AddressRepository.instance.delete(a.id);
      if (!mounted) return;
      setState(() => _items.removeWhere((x) => x.id == a.id));
      _snack('Address deleted.');
    } on ApiException catch (e) {
      _snack(e.message, error: true);
    } catch (_) {
      _snack('Something went wrong. Please try again.', error: true);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final canAdd = _items.length < AddressRepository.maxAddresses;
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.selectMode ? 'Select Address' : 'My Addresses'),
        backgroundColor: Colors.white,
        foregroundColor: _kPrimary,
        elevation: 0.5,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? _ErrorView(message: _error!, onRetry: _load)
              : RefreshIndicator(
                  onRefresh: _load,
                  child: _items.isEmpty
                      ? ListView(children: const [
                          SizedBox(height: 120),
                          Icon(Icons.location_off_outlined,
                              size: 56, color: _kSubtext),
                          SizedBox(height: 12),
                          Center(child: Text('No saved addresses yet.')),
                        ])
                      : ListView.separated(
                          padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
                          itemCount: _items.length + 1,
                          separatorBuilder: (_, __) =>
                              const SizedBox(height: 10),
                          itemBuilder: (_, i) {
                            if (i == _items.length) {
                              return Text(
                                '${_items.length} of ${AddressRepository.maxAddresses} addresses',
                                textAlign: TextAlign.center,
                                style: const TextStyle(
                                    color: _kSubtext, fontSize: 12),
                              );
                            }
                            return _card(_items[i]);
                          },
                        ),
                ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: FilledButton.icon(
            style: FilledButton.styleFrom(
              backgroundColor: _kSecondary,
              minimumSize: const Size.fromHeight(48),
            ),
            onPressed: (!canAdd || _busy || _loading) ? null : () => _openForm(),
            icon: const Icon(Icons.add_location_alt_outlined),
            label: Text(canAdd
                ? 'Add New Address'
                : 'Maximum of ${AddressRepository.maxAddresses} addresses reached'),
          ),
        ),
      ),
    );
  }

  Widget _card(BuyerAddress a) {
    final selected = widget.selectMode && widget.selectedId == a.id;
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: widget.selectMode ? () => Navigator.pop(context, a) : null,
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
                color: selected ? _kSecondary : _kBorder,
                width: selected ? 2 : 1),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(children: [
                _chip(a.label, const Color(0xFFF0EAFB), _kSecondary),
                if (a.isDefault) ...[
                  const SizedBox(width: 6),
                  _chip('Default', const Color(0xFFFFE8EC),
                      const Color(0xFFFF3B5C)),
                ],
                const Spacer(),
                if (selected)
                  const Icon(Icons.check_circle, color: _kSecondary, size: 20),
              ]),
              const SizedBox(height: 8),
              Text('${a.recipientName}  |  ${a.phone}',
                  style: const TextStyle(fontWeight: FontWeight.w700)),
              const SizedBox(height: 4),
              Text(a.fullAddress,
                  style: const TextStyle(color: Color(0xFF4A454F), fontSize: 13)),
              const Divider(height: 20),
              Row(
                children: [
                  if (!a.isDefault)
                    TextButton(
                      onPressed: _busy ? null : () => _setDefault(a),
                      child: const Text('Set as default'),
                    ),
                  const Spacer(),
                  IconButton(
                    tooltip: 'Edit',
                    onPressed: _busy ? null : () => _openForm(a),
                    icon: const Icon(Icons.edit_outlined, size: 20),
                  ),
                  IconButton(
                    tooltip: a.isDefault
                        ? 'Set another default before deleting'
                        : 'Delete',
                    onPressed: _busy ? null : () => _delete(a),
                    icon: Icon(Icons.delete_outline,
                        size: 20,
                        color: a.isDefault ? _kSubtext : Colors.red.shade400),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _chip(String text, Color bg, Color fg) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration:
            BoxDecoration(color: bg, borderRadius: BorderRadius.circular(6)),
        child: Text(text,
            style: TextStyle(
                color: fg, fontSize: 11, fontWeight: FontWeight.w700)),
      );
}

// ─────────────────────────────────────────────────────────────────────────────
// Add / edit form
// ─────────────────────────────────────────────────────────────────────────────

class AddressFormPage extends StatefulWidget {
  const AddressFormPage({super.key, this.existing});
  final BuyerAddress? existing;

  @override
  State<AddressFormPage> createState() => _AddressFormPageState();
}

class _AddressFormPageState extends State<AddressFormPage> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _label;
  late final TextEditingController _name;
  late final TextEditingController _phone;
  late final TextEditingController _street;
  late final TextEditingController _postal;

  String? _region, _province, _district, _city, _barangay;
  bool _isDefault = false;
  bool _saving = false;
  Map<String, String> _fieldErrors = {};

  @override
  void initState() {
    super.initState();
    final e = widget.existing;
    _label = TextEditingController(text: e?.label ?? 'Home');
    _name = TextEditingController(text: e?.recipientName ?? '');
    _phone = TextEditingController(text: e?.phone ?? '');
    _street = TextEditingController(text: e?.streetAddress ?? '');
    _postal = TextEditingController(text: e?.postalCode ?? '');
    _region = e?.region;
    _province = e?.province;
    _district = e?.district;
    _city = e?.municipalityCity;
    _barangay = e?.barangay;
    _isDefault = e?.isDefault ?? false;
  }

  @override
  void dispose() {
    _label.dispose();
    _name.dispose();
    _phone.dispose();
    _street.dispose();
    _postal.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() => _fieldErrors = {});
    if (!_formKey.currentState!.validate()) return;
    if (_region == null || _city == null || _barangay == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Please select region, city/municipality and barangay.'),
        behavior: SnackBarBehavior.floating,
      ));
      return;
    }
    final body = <String, dynamic>{
      'label': _label.text.trim(),
      'recipient_name': _name.text.trim(),
      'phone': _phone.text.trim(),
      'region': _region,
      'province': _province,
      'district': _district,
      'municipality_city': _city,
      'barangay': _barangay,
      'street_address': _street.text.trim(),
      'postal_code': _postal.text.trim().isEmpty ? null : _postal.text.trim(),
      'is_default': _isDefault,
    };
    setState(() => _saving = true);
    try {
      if (widget.existing == null) {
        await AddressRepository.instance.create(body);
      } else {
        await AddressRepository.instance.update(widget.existing!.id, body);
      }
      if (!mounted) return;
      Navigator.pop(context, true);
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _fieldErrors = {
          for (final entry in (e.errors ?? {}).entries)
            entry.key: entry.value.first,
        };
      });
      _formKey.currentState!.validate();
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(e.message),
        backgroundColor: Colors.red.shade700,
        behavior: SnackBarBehavior.floating,
      ));
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: const Text('Could not save. Check your connection.'),
        backgroundColor: Colors.red.shade700,
        behavior: SnackBarBehavior.floating,
      ));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  InputDecoration _dec(String label, String field) => InputDecoration(
        labelText: label,
        errorText: _fieldErrors[field],
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
        enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: _kBorder)),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      );

  @override
  Widget build(BuildContext context) {
    final editing = widget.existing != null;
    return Scaffold(
      appBar: AppBar(
        title: Text(editing ? 'Edit Address' : 'New Address'),
        backgroundColor: Colors.white,
        foregroundColor: _kPrimary,
        elevation: 0.5,
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Wrap(
              spacing: 8,
              children: ['Home', 'Work', 'Other']
                  .map((l) => ChoiceChip(
                        label: Text(l),
                        selected: _label.text == l,
                        onSelected: (_) => setState(() => _label.text = l),
                      ))
                  .toList(),
            ),
            const SizedBox(height: 10),
            TextFormField(
              controller: _label,
              maxLength: 50,
              decoration: _dec('Label', 'label'),
              onChanged: (_) => setState(() {}),
              validator: (v) =>
                  (v == null || v.trim().isEmpty) ? 'Label is required.' : null,
            ),
            TextFormField(
              controller: _name,
              maxLength: 255,
              decoration: _dec('Recipient name', 'recipient_name'),
              validator: (v) => (v == null || v.trim().length < 2)
                  ? 'Recipient name is required.'
                  : null,
            ),
            TextFormField(
              controller: _phone,
              keyboardType: TextInputType.phone,
              decoration: _dec('Mobile number (09XXXXXXXXX)', 'phone'),
              validator: (v) {
                final s = (v ?? '').replaceAll(RegExp(r'\s'), '');
                final ok = RegExp(r'^(09\d{9}|\+639\d{9}|639\d{9})$').hasMatch(s);
                return ok ? null : 'Enter a valid PH mobile number.';
              },
            ),
            const SizedBox(height: 16),
            if (editing && _region != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Text(
                  'Current: ${[_barangay, _city, _district, _province, _region].where((s) => s != null && s.isNotEmpty).join(', ')}',
                  style: const TextStyle(color: _kSubtext, fontSize: 12),
                ),
              ),
            AddressDropdown(
              initialProvince: widget.existing?.region,
              initialMunicipality: widget.existing?.municipalityCity,
              initialBarangay: widget.existing?.barangay,
              onChanged: ({
                required String region,
                String? province,
                String? district,
                required String municipalityCity,
                required String barangay,
              }) {
                setState(() {
                  _region = region;
                  _province = province;
                  _district = district;
                  _city = municipalityCity;
                  _barangay = barangay;
                });
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _street,
              maxLength: 255,
              decoration:
                  _dec('House no., street, building', 'street_address'),
              validator: (v) => (v == null || v.trim().isEmpty)
                  ? 'Street address is required.'
                  : null,
            ),
            TextFormField(
              controller: _postal,
              keyboardType: TextInputType.number,
              maxLength: 4,
              decoration: _dec('Postal code (optional)', 'postal_code'),
              validator: (v) {
                final s = (v ?? '').trim();
                if (s.isEmpty) return null;
                return RegExp(r'^\d{4}$').hasMatch(s)
                    ? null
                    : 'Postal code must be 4 digits.';
              },
            ),
            if (!(widget.existing?.isDefault ?? false))
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Set as default address'),
                value: _isDefault,
                onChanged: (v) => setState(() => _isDefault = v),
              ),
            const SizedBox(height: 12),
            FilledButton(
              style: FilledButton.styleFrom(
                backgroundColor: _kSecondary,
                minimumSize: const Size.fromHeight(48),
              ),
              onPressed: _saving ? null : _save,
              child: _saving
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white))
                  : const Text('Save Address'),
            ),
          ],
        ),
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  const _ErrorView({required this.message, required this.onRetry});
  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) => Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            const Icon(Icons.cloud_off, size: 48, color: _kSubtext),
            const SizedBox(height: 12),
            Text(message, textAlign: TextAlign.center),
            const SizedBox(height: 12),
            OutlinedButton(onPressed: onRetry, child: const Text('Retry')),
          ]),
        ),
      );
}
