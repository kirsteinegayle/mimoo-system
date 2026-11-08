import 'package:flutter/material.dart';
import '../../models/courier_models.dart';
import '../../services/courier_repository.dart';
import '../../services/api_service.dart';
import '../../theme/mimoo_theme.dart';

class ScanTab extends StatefulWidget {
  const ScanTab({super.key});

  @override
  State<ScanTab> createState() => _ScanTabState();
}

class _ScanTabState extends State<ScanTab> {
  final _waybillCtrl = TextEditingController();

  List<FacilityItem> _facilities = [];
  FacilityItem? _selectedFacility;
  ParcelInfo? _parcel;

  bool _loadingFacilities = true;
  bool _lookingUp = false;
  bool _confirming = false;
  String? _lookupError;
  String? _facilError;
  String? _confirmMsg;
  Color _confirmColor = kGreen;

  @override
  void initState() {
    super.initState();
    _loadFacilities();
  }

  @override
  void dispose() {
    _waybillCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadFacilities() async {
    setState(() {
      _loadingFacilities = true;
      _facilError = null;
    });
    try {
      final f = await CourierRepository.instance.facilities();
      if (!mounted) return;
      setState(() {
        _facilities = f;
        _loadingFacilities = false;
        if (f.isNotEmpty) _selectedFacility = f.first;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loadingFacilities = false;
        _facilError = ApiService.friendlyError(e);
      });
    }
  }

  Future<void> _lookup() async {
    final waybill = _waybillCtrl.text.trim().toUpperCase();
    if (waybill.isEmpty) return;
    setState(() {
      _lookingUp = true;
      _lookupError = null;
      _parcel = null;
      _confirmMsg = null;
    });
    try {
      final p = await CourierRepository.instance.parcelByWaybill(waybill);
      if (!mounted) return;
      setState(() {
        _parcel = p;
        _lookingUp = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _lookingUp = false;
        _lookupError = e.message;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _lookingUp = false;
        _lookupError = ApiService.friendlyError(e);
      });
    }
  }

  Future<void> _confirmScan() async {
    if (_parcel == null || _selectedFacility == null || _confirming) return;
    setState(() {
      _confirming = true;
      _confirmMsg = null;
    });
    try {
      await CourierRepository.instance.scanParcel(
        _parcel!.waybillNumber,
        _selectedFacility!.id,
      );
      if (!mounted) return;
      setState(() {
        _confirmMsg = 'Parcel received at ${_selectedFacility!.facilityName}!';
        _confirmColor = kGreen;
        _confirming = false;
        _parcel = null;
        _waybillCtrl.clear();
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _confirming = false;
        _confirmMsg = e.message;
        _confirmColor = kFlash;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _confirming = false;
        _confirmMsg = ApiService.friendlyError(e);
        _confirmColor = kFlash;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('Parcel Scanner', style: pjs(size: 18, weight: FontWeight.w800)),
        const SizedBox(height: 4),
        Text('Enter the waybill number to look up a parcel.',
            style: pjs(size: 13, color: kSubtext)),
        const SizedBox(height: 20),

        // Waybill input
        Row(children: [
          Expanded(
            child: TextField(
              controller: _waybillCtrl,
              textCapitalization: TextCapitalization.characters,
              style: pjs(size: 14, weight: FontWeight.w600),
              decoration: mimooInput(
                  hint: 'e.g. MIM00000001', icon: Icons.qr_code_scanner),
              onSubmitted: (_) => _lookup(),
            ),
          ),
          const SizedBox(width: 10),
          SizedBox(
            height: 50,
            child: FilledButton(
              onPressed: _lookingUp ? null : _lookup,
              style: FilledButton.styleFrom(
                backgroundColor: kPrimary,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              child: _lookingUp
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white))
                  : Text('Search',
                      style: pjs(
                          size: 13,
                          weight: FontWeight.w700,
                          color: Colors.white)),
            ),
          ),
        ]),

        // Error
        if (_lookupError != null) ...[
          const SizedBox(height: 10),
          _Alert(_lookupError!, kFlash),
        ],

        // Success message
        if (_confirmMsg != null) ...[
          const SizedBox(height: 10),
          _Alert(_confirmMsg!, _confirmColor),
        ],

        // Parcel info
        if (_parcel != null) ...[
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: kCard,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: kBorder),
            ),
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Parcel Info',
                  style:
                      pjs(size: 13, weight: FontWeight.w800, color: kPrimary)),
              const Divider(height: 12, color: kBorder),
              _ParcelRow('Waybill', _parcel!.waybillNumber),
              _ParcelRow('Order', _parcel!.orderNumber),
              _ParcelRow('Buyer', _parcel!.buyerName),
              _ParcelRow('Address', _parcel!.buyerAddress),
              _ParcelRow('Dest.', _parcel!.destination),
              _ParcelRow('Payment', _parcel!.paymentMethod),
              _ParcelRow(
                  'Total', '₱${_parcel!.totalAmount.toStringAsFixed(2)}'),
              _ParcelRow('Status', _parcel!.status),
              if (_parcel!.weight != null)
                _ParcelRow('Weight', '${_parcel!.weight} kg'),
            ]),
          ),
          const SizedBox(height: 16),

          // Facility selector
          if (_loadingFacilities)
            const Center(child: CircularProgressIndicator(color: kPrimary))
          else if (_facilError != null)
            // ignore: prefer_const_constructors
            _Alert(_facilError!, kFlash)
          else if (_facilities.isEmpty)
            // ignore: prefer_const_constructors
            _Alert('No active facilities found. Add a facility first.',
                Colors.orange)
          else ...[
            Text('Receiving Facility',
                style: pjs(size: 13, weight: FontWeight.w700)),
            const SizedBox(height: 8),
            // ignore: deprecated_member_use
            DropdownButtonFormField<FacilityItem>(
              initialValue: _selectedFacility,
              onChanged: (f) => setState(() => _selectedFacility = f),
              decoration: InputDecoration(
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: kBorder)),
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              ),
              items: _facilities
                  .map((f) => DropdownMenuItem(
                        value: f,
                        child: Text(f.displayLabel, style: pjs(size: 13)),
                      ))
                  .toList(),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: FilledButton.icon(
                onPressed: _confirming ? null : _confirmScan,
                style: FilledButton.styleFrom(
                  backgroundColor: kGreen,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                ),
                icon: _confirming
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white))
                    : const Icon(Icons.check_circle_outline,
                        color: Colors.white),
                label: Text(_confirming ? 'Processing…' : 'Confirm Receipt',
                    style: pjs(
                        size: 15,
                        weight: FontWeight.w800,
                        color: Colors.white)),
              ),
            ),
          ],
        ],
      ]),
    );
  }
}

class _ParcelRow extends StatelessWidget {
  const _ParcelRow(this.label, this.value);
  final String label, value;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 3),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          SizedBox(
              width: 70,
              child: Text(label, style: pjs(size: 12, color: kSubtext))),
          Expanded(
              child:
                  Text(value, style: pjs(size: 12, weight: FontWeight.w600))),
        ]),
      );
}

class _Alert extends StatelessWidget {
  const _Alert(this.message, this.color);
  final String message;
  final Color color;

  @override
  Widget build(BuildContext context) => Container(
        width: double.infinity,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: color.withValues(alpha: 0.3)),
        ),
        child: Text(message, style: pjs(size: 12, color: color, height: 1.4)),
      );
}
