import 'package:flutter/material.dart';
import '../../models/courier_models.dart';
import '../../services/api_service.dart';
import '../../services/courier_repository.dart';
import '../../theme/mimoo_theme.dart';
import '../../widgets/courier_shared.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  CourierProfile? _profile;
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
      final p = await CourierRepository.instance.profile();
      if (!mounted) return;
      setState(() {
        _profile = p;
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

  Future<void> _editVehicle() async {
    final updated = await Navigator.push<CourierProfile>(
      context,
      MaterialPageRoute(
        builder: (_) => VehicleFormPage(profile: _profile!),
      ),
    );
    if (updated != null && mounted) {
      setState(() => _profile = updated);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kSurface,
      appBar: AppBar(
        backgroundColor: kCard,
        title:
            Text('Profile & Vehicle', style: pjs(size: 17, weight: FontWeight.w800)),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: kPrimary))
          : _error != null
              ? CourierErrorState(message: _error!, onRetry: _load)
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    CourierInfoCard(
                      title: 'Courier',
                      description:
                          'Your registered courier identity and home hub.',
                      children: [
                        CourierInfoRow('Name', _profile!.name),
                        CourierInfoRow('Company', _profile!.companyName),
                        CourierInfoRow('Email', _profile!.email),
                        CourierInfoRow('Phone', _profile!.phone ?? ''),
                        CourierInfoRow(
                            'Status', displayStatus(_profile!.status)),
                        CourierInfoRow(
                            'Duty', displayStatus(_profile!.dutyStatus)),
                        if (_profile!.homeHub != null)
                          CourierInfoRow(
                            'Home hub',
                            '${_profile!.homeHub!.name} (${_profile!.homeHub!.code})',
                          ),
                      ],
                    ),
                    if (_profile!.suspendedReason != null) ...[
                      const SizedBox(height: 10),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: kFlash.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(10),
                          border:
                              Border.all(color: kFlash.withValues(alpha: 0.3)),
                        ),
                        child: Text(
                          'Suspension reason: ${_profile!.suspendedReason}',
                          style: pjs(size: 12, color: kFlash),
                        ),
                      ),
                    ],
                    const SizedBox(height: 10),
                    CourierInfoCard(
                      title: 'Vehicle & license',
                      description:
                          'Dispatch verifies these details before assigning trips.',
                      trailing: TextButton(
                        onPressed: _editVehicle,
                        child: Text('Edit',
                            style: pjs(
                                size: 12,
                                weight: FontWeight.w800,
                                color: kPrimary)),
                      ),
                      children: [
                        CourierInfoRow(
                            'Vehicle', _profile!.vehicleType ?? ''),
                        CourierInfoRow(
                            'Plate no.', _profile!.plateNumber ?? ''),
                        CourierInfoRow(
                          'Capacity',
                          _profile!.loadCapacityKg == null
                              ? ''
                              : '${_profile!.loadCapacityKg!.toStringAsFixed(1)} kg',
                        ),
                        CourierInfoRow(
                            'License no.', _profile!.licenseNumber ?? ''),
                        CourierInfoRow(
                            'License expiry', _profile!.licenseExpiry ?? ''),
                      ],
                    ),
                    const SizedBox(height: 10),
                    CourierInfoCard(
                      title: 'Documents on file',
                      children: [
                        if (_profile!.documents.isEmpty)
                          Text('No documents uploaded yet.',
                              style: pjs(size: 12, color: kSubtext))
                        else
                          for (final d in _profile!.documents)
                            Padding(
                              padding: const EdgeInsets.symmetric(vertical: 4),
                              child: Row(children: [
                                Icon(
                                  d.verified
                                      ? Icons.verified_outlined
                                      : Icons.description_outlined,
                                  size: 18,
                                  color: d.verified ? kGreen : kPrimary,
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    '${displayStatus(d.type)} · ${d.name}',
                                    style: pjs(
                                        size: 12, weight: FontWeight.w600),
                                  ),
                                ),
                                CourierStatusBadge(
                                  status: d.verified ? 'approved' : 'pending',
                                  label: d.verified ? 'Verified' : 'Pending',
                                ),
                              ]),
                            ),
                      ],
                    ),
                  ],
                ),
    );
  }
}

class VehicleFormPage extends StatefulWidget {
  const VehicleFormPage({super.key, required this.profile});
  final CourierProfile profile;

  @override
  State<VehicleFormPage> createState() => _VehicleFormPageState();
}

class _VehicleFormPageState extends State<VehicleFormPage> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _typeCtrl;
  late final TextEditingController _plateCtrl;
  late final TextEditingController _capacityCtrl;
  late final TextEditingController _licenseCtrl;
  DateTime? _licenseExpiry;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _typeCtrl =
        TextEditingController(text: widget.profile.vehicleType ?? '');
    _plateCtrl =
        TextEditingController(text: widget.profile.plateNumber ?? '');
    _capacityCtrl = TextEditingController(
      text: widget.profile.loadCapacityKg == null
          ? ''
          : '${widget.profile.loadCapacityKg}',
    );
    _licenseCtrl =
        TextEditingController(text: widget.profile.licenseNumber ?? '');
    _licenseExpiry = DateTime.tryParse(widget.profile.licenseExpiry ?? '');
  }

  @override
  void dispose() {
    _typeCtrl.dispose();
    _plateCtrl.dispose();
    _capacityCtrl.dispose();
    _licenseCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickExpiry() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _licenseExpiry ?? now.add(const Duration(days: 365)),
      firstDate: now,
      lastDate: now.add(const Duration(days: 3650)),
    );
    if (picked != null && mounted) {
      setState(() => _licenseExpiry = picked);
    }
  }

  Future<void> _save() async {
    if (!(_formKey.currentState?.validate() ?? false) || _saving) return;
    final capacity = double.tryParse(_capacityCtrl.text.trim());
    if (_capacityCtrl.text.trim().isNotEmpty && capacity == null) {
      courierSnack(context, 'Enter a valid load capacity.', kFlash);
      return;
    }

    setState(() => _saving = true);
    try {
      final updated = await CourierRepository.instance.updateVehicle(
        vehicleType: _typeCtrl.text.trim(),
        plateNumber: _plateCtrl.text.trim(),
        loadCapacityKg: capacity,
        licenseNumber: _licenseCtrl.text.trim(),
        licenseExpiry: _licenseExpiry == null
            ? null
            : '${_licenseExpiry!.year}-${_licenseExpiry!.month.toString().padLeft(2, '0')}-${_licenseExpiry!.day.toString().padLeft(2, '0')}',
      );
      if (!mounted) return;
      courierSnack(context, 'Vehicle and license details saved.', kGreen);
      Navigator.pop(context, updated);
    } catch (e) {
      if (!mounted) return;
      courierSnack(context, ApiService.friendlyError(e), kFlash);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  String get _expiryLabel => _licenseExpiry == null
      ? 'Select expiry date'
      : '${_licenseExpiry!.year}-${_licenseExpiry!.month.toString().padLeft(2, '0')}-${_licenseExpiry!.day.toString().padLeft(2, '0')}';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kSurface,
      appBar: AppBar(
        backgroundColor: kCard,
        title: Text('Edit Vehicle',
            style: pjs(size: 17, weight: FontWeight.w800)),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextFormField(
              controller: _typeCtrl,
              style: pjs(size: 13),
              decoration: mimooInput(
                  hint: 'Vehicle type (e.g. Motorcycle)',
                  icon: Icons.two_wheeler_outlined),
              validator: (v) => (v == null || v.trim().isEmpty)
                  ? 'Enter your vehicle type'
                  : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _plateCtrl,
              textCapitalization: TextCapitalization.characters,
              style: pjs(size: 13),
              decoration: mimooInput(
                  hint: 'Plate number', icon: Icons.pin_outlined),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _capacityCtrl,
              keyboardType:
                  const TextInputType.numberWithOptions(decimal: true),
              style: pjs(size: 13),
              decoration: mimooInput(
                  hint: 'Load capacity in kg',
                  icon: Icons.scale_outlined),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _licenseCtrl,
              textCapitalization: TextCapitalization.characters,
              style: pjs(size: 13),
              decoration: mimooInput(
                  hint: 'License number', icon: Icons.badge_outlined),
            ),
            const SizedBox(height: 12),
            InkWell(
              borderRadius: BorderRadius.circular(12),
              onTap: _pickExpiry,
              child: InputDecorator(
                decoration: mimooInput(
                    hint: 'License expiry', icon: Icons.event_outlined),
                child: Text(_expiryLabel,
                    style: pjs(
                        size: 13,
                        color: _licenseExpiry == null ? kSubtext : kText)),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'License expiry cannot be in the past.',
              style: pjs(size: 11, color: kSubtext),
            ),
            const SizedBox(height: 20),
            SizedBox(
              height: 50,
              child: FilledButton.icon(
                onPressed: _saving ? null : _save,
                style: FilledButton.styleFrom(
                  backgroundColor: kPrimary,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                ),
                icon: _saving
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white))
                    : const Icon(Icons.save_outlined, color: Colors.white),
                label: Text(_saving ? 'Saving...' : 'Save Details',
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
}
