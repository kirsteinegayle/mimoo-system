import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../services/courier_repository.dart';
import '../../theme/mimoo_theme.dart';
import '../../widgets/courier_shared.dart';

/// Company Settings: contact details, where the company delivers (these lists decide which parcels
/// Sort & Assign offers it) and service info. Same endpoint and validation as the web page.
class CompanySettingsPage extends StatefulWidget {
  const CompanySettingsPage({super.key});

  @override
  State<CompanySettingsPage> createState() => _CompanySettingsPageState();
}

class _CompanySettingsPageState extends State<CompanySettingsPage> {
  final _key = GlobalKey<FormState>();
  final Map<String, TextEditingController> _c = {
    for (final k in ['trade_name', 'business_email', 'company_contact_number', 'company_website', 'business_address', 'service_areas', 'cities_served', 'provinces_served', 'estimated_delivery_time'])
      k: TextEditingController(),
  };
  Map<String, dynamic> _data = {};
  String _pickup = '';
  bool _loading = true;
  bool _saving = false;
  String? _error;
  Map<String, String> _serverErrors = {};

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    for (final c in _c.values) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _error = null;
      _loading = true;
    });
    try {
      final d = await CourierRepository.instance.companySettings();
      if (!mounted) return;
      String s(String k) => d[k]?.toString() ?? '';
      String l(String k) => ((d[k] as List<dynamic>?) ?? []).join(', ');
      _c['trade_name']!.text = s('trade_name');
      _c['business_email']!.text = s('business_email');
      _c['company_contact_number']!.text = s('company_contact_number');
      _c['company_website']!.text = s('company_website');
      _c['business_address']!.text = s('business_address');
      _c['service_areas']!.text = l('service_areas');
      _c['cities_served']!.text = l('cities_served');
      _c['provinces_served']!.text = l('provinces_served');
      _c['estimated_delivery_time']!.text = s('estimated_delivery_time');
      setState(() {
        _data = d;
        _pickup = s('pickup_available');
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

  List<String> _list(String k) =>
      _c[k]!.text.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();

  Future<void> _save() async {
    if (!_key.currentState!.validate()) return;
    setState(() {
      _saving = true;
      _serverErrors = {};
    });
    try {
      final msg = await CourierRepository.instance.saveCompanySettings({
        'trade_name': _c['trade_name']!.text.trim(),
        'business_email': _c['business_email']!.text.trim(),
        'company_contact_number': _c['company_contact_number']!.text.trim(),
        'company_website': _c['company_website']!.text.trim().isEmpty ? null : _c['company_website']!.text.trim(),
        'business_address': _c['business_address']!.text.trim(),
        'service_areas': _list('service_areas'),
        'cities_served': _list('cities_served'),
        'provinces_served': _list('provinces_served'),
        'pickup_available': _pickup.isEmpty ? null : _pickup,
        'estimated_delivery_time': _c['estimated_delivery_time']!.text.trim(),
      });
      if (mounted) courierSnack(context, msg, kGreen);
    } catch (e) {
      if (mounted) courierSnack(context, e is ApiException ? e.message : ApiService.friendlyError(e), kFlash);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Widget _f(String k, String label, {String? Function(String?)? validator, TextInputType? type, int lines = 1, String? hint}) => Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: TextFormField(
          controller: _c[k],
          keyboardType: type,
          minLines: lines,
          maxLines: lines + 1,
          style: pjs(size: 14),
          decoration: mimooInput(hint: hint ?? label, error: _serverErrors[k]).copyWith(labelText: label),
          validator: validator,
        ),
      );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kSurface,
      appBar: AppBar(title: const Text('Company Settings')),
      body: _loading
          ? const CourierLoadingState()
          : _error != null
              ? CourierErrorState(message: _error!, onRetry: _load)
              : SafeArea(
                  child: Form(
                    key: _key,
                    child: ListView(padding: const EdgeInsets.all(16), children: [
                      CourierInfoCard(
                        title: '${_data['company_name'] ?? 'Company'}',
                        description: 'Registered name and registration number change only through review. Status: ${displayStatus('${_data['status'] ?? ''}')}',
                        children: [CourierInfoRow('SEC no.', '${_data['sec_registration_no'] ?? ''}')],
                      ),
                      const SizedBox(height: 16),
                      Text('Contact', style: pjs(size: 14, weight: FontWeight.w800)),
                      const SizedBox(height: 8),
                      _f('trade_name', 'Trade name'),
                      _f('business_email', 'Business email', type: TextInputType.emailAddress, validator: (v) => (v == null || !v.contains('@')) ? 'Enter a valid email.' : null),
                      _f('company_contact_number', 'Company contact number', type: TextInputType.phone, hint: '09XXXXXXXXX', validator: (v) => RegExp(r'^(09|\+639)\d{9}$').hasMatch((v ?? '').trim()) ? null : 'Use a valid number like 09171234567.'),
                      _f('company_website', 'Website (optional)', type: TextInputType.url, hint: 'https://'),
                      _f('business_address', 'Business address', lines: 2, validator: (v) => (v == null || v.trim().isEmpty) ? 'Address is required.' : null),
                      const SizedBox(height: 8),
                      Text('Where you deliver', style: pjs(size: 14, weight: FontWeight.w800)),
                      Text('Parcels are offered to you by barangay, then city, then province.', style: pjs(size: 12, color: kSubtext)),
                      const SizedBox(height: 8),
                      _f('service_areas', 'Barangays / areas (comma separated)', lines: 2),
                      _f('cities_served', 'Cities / municipalities', lines: 2),
                      _f('provinces_served', 'Provinces'),
                      const SizedBox(height: 8),
                      Text('Service', style: pjs(size: 14, weight: FontWeight.w800)),
                      const SizedBox(height: 8),
                      DropdownButtonFormField<String>(
                        initialValue: _pickup,
                        decoration: mimooInput(hint: 'Pickup available').copyWith(labelText: 'Pickup available'),
                        items: const [
                          DropdownMenuItem(value: '', child: Text('Not set')),
                          DropdownMenuItem(value: 'yes', child: Text('Yes')),
                          DropdownMenuItem(value: 'no', child: Text('No')),
                        ],
                        onChanged: (v) => setState(() => _pickup = v ?? ''),
                      ),
                      const SizedBox(height: 12),
                      _f('estimated_delivery_time', 'Estimated delivery time', hint: 'e.g. 2-3 business days'),
                      SizedBox(
                        height: 52,
                        child: FilledButton(
                          onPressed: _saving ? null : _save,
                          style: FilledButton.styleFrom(backgroundColor: kPrimary),
                          child: _saving
                              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                              : Text('Save changes', style: pjs(size: 14, weight: FontWeight.w700, color: Colors.white)),
                        ),
                      ),
                    ]),
                  ),
                ),
    );
  }
}
