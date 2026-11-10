import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import '../theme/app_theme.dart';

// ── Design tokens (match register_page.dart) ─────────────────────────────────
const _kPrimary = AppColors.primaryMid;
const _kBorder = AppColors.border;
const _kText = AppColors.text;
const _kSubtext = AppColors.textMuted;

// ── PSGC base URL ─────────────────────────────────────────────────────────────
const _psgcBase = 'https://psgc.gitlab.io/api';

// NCR region code from PSGC API
const _ncrCode = '130000000';

// Hardcoded NCR district list — same as the web (Register.tsx / SellerRegistration.tsx)
const _ncrDistricts = [
  '1st District (Manila)',
  '2nd District (Mandaluyong, Marikina, Pasig, Quezon City, San Juan)',
  '3rd District (Caloocan, Malabon, Navotas, Valenzuela)',
  '4th District (Las Piñas, Makati, Muntinlupa, Parañaque, Pasay, Pateros, Taguig)',
];

// ── Simple data models ────────────────────────────────────────────────────────
class _PsgcItem {
  const _PsgcItem({required this.code, required this.name});
  final String code;
  final String name;
}

bool _isNcr(_PsgcItem? region) {
  if (region == null) return false;
  return region.code == _ncrCode ||
      RegExp(r'\(NCR\)|national capital region', caseSensitive: false)
          .hasMatch(region.name);
}

/// Normalize a city name for NCR district filtering.
/// Mirrors the web's `normCity()`:
///   "City of Las Piñas" → "las pinas"
///   "Quezon City"       → "quezon"
String _normCity(String s) {
  final nfd = s
      .replaceAll('ñ', 'n')
      .replaceAll('Ñ', 'N')
      .replaceAll('é', 'e')
      .replaceAll('í', 'i')
      .replaceAll('ó', 'o')
      .replaceAll('á', 'a')
      .replaceAll('ú', 'u');
  return nfd
      .toLowerCase()
      .replaceAll(RegExp(r'^city of\s+'), '')
      .replaceAll(RegExp(r'\s+city$'), '')
      .trim();
}

/// Extract normalized city keys from an NCR district label's parentheses.
List<String> _districtCityKeys(String label) {
  final m = RegExp(r'\(([^)]*)\)').firstMatch(label);
  if (m == null) return [];
  return m.group(1)!.split(',').map((s) => _normCity(s.trim())).toList();
}

// ── In-memory cache (lives for the app session) ───────────────────────────────
final Map<String, List<_PsgcItem>> _cache = {};

Future<List<_PsgcItem>> _fetch(String url) async {
  if (_cache.containsKey(url)) return _cache[url]!;
  final res =
      await http.get(Uri.parse(url)).timeout(const Duration(seconds: 20));
  if (res.statusCode != 200) throw Exception('HTTP ${res.statusCode}');
  final list = (jsonDecode(res.body) as List)
      .map((e) => _PsgcItem(
            code: e['code'] as String,
            name: e['name'] as String,
          ))
      .toList()
    ..sort((a, b) => a.name.compareTo(b.name));
  _cache[url] = list;
  return list;
}

// ── Public callback typedef ───────────────────────────────────────────────────

/// Called whenever all required address fields are filled.
///
/// [region]          — PSGC region name (e.g. "Region IV-A (CALABARZON)")
/// [province]        — PSGC province name, or null for NCR users
/// [district]        — NCR district string, or null for non-NCR users
/// [municipalityCity]— PSGC city/municipality name
/// [barangay]        — PSGC barangay name
typedef AddressChangedCallback = void Function({
  required String region,
  String? province,
  String? district,
  required String municipalityCity,
  required String barangay,
});

// ── Widget ────────────────────────────────────────────────────────────────────

class AddressDropdown extends StatefulWidget {
  const AddressDropdown({
    super.key,
    this.onChanged,
    // Legacy positional-style optional initializers kept for API compat
    this.initialProvince,
    this.initialMunicipality,
    this.initialBarangay,
  });

  final AddressChangedCallback? onChanged;

  /// Pre-select values (used by profile/edit screens).
  final String? initialProvince;
  final String? initialMunicipality;
  final String? initialBarangay;

  @override
  State<AddressDropdown> createState() => _AddressDropdownState();
}

class _AddressDropdownState extends State<AddressDropdown> {
  // ── Lists ─────────────────────────────────────────────────────────────────
  List<_PsgcItem> _regions = [];
  List<_PsgcItem> _provinces = [];
  List<_PsgcItem> _cities = [];
  List<_PsgcItem> _barangays = [];

  // ── Selected values ───────────────────────────────────────────────────────
  _PsgcItem? _region;
  _PsgcItem? _province;
  String? _district; // NCR only — plain string, not a PSGC item
  _PsgcItem? _city;
  _PsgcItem? _barangay;

  // ── Loading / error state per tier ───────────────────────────────────────
  bool _loadingRegions = false;
  bool _loadingProvinces = false;
  bool _loadingCities = false;
  bool _loadingBarangays = false;

  String? _errorRegions;
  String? _errorProvinces;
  String? _errorCities;
  String? _errorBarangays;

  bool get _isNcrSelected => _isNcr(_region);

  @override
  void initState() {
    super.initState();
    _loadRegions();
  }

  // ── Loaders ───────────────────────────────────────────────────────────────

  Future<void> _loadRegions() async {
    setState(() {
      _loadingRegions = true;
      _errorRegions = null;
    });
    try {
      final list = await _fetch('$_psgcBase/regions/');
      if (mounted) setState(() => _regions = list);
    } catch (_) {
      if (mounted) setState(() => _errorRegions = 'Could not load regions.');
    } finally {
      if (mounted) setState(() => _loadingRegions = false);
    }
  }

  Future<void> _loadProvinces(String regionCode) async {
    setState(() {
      _loadingProvinces = true;
      _errorProvinces = null;
      _provinces = [];
    });
    try {
      final list = await _fetch('$_psgcBase/regions/$regionCode/provinces/');
      if (mounted) setState(() => _provinces = list);
    } catch (_) {
      if (mounted) {
        setState(() => _errorProvinces = 'Could not load provinces.');
      }
    } finally {
      if (mounted) setState(() => _loadingProvinces = false);
    }
  }

  Future<void> _loadCitiesForRegion(String regionCode) async {
    // NCR: fetch directly from region endpoint; fallback to per-district
    setState(() {
      _loadingCities = true;
      _errorCities = null;
      _cities = [];
    });
    try {
      List<_PsgcItem> list =
          await _fetch('$_psgcBase/regions/$regionCode/cities-municipalities/');
      if (list.isEmpty) {
        // Fallback: fetch per district (same as web)
        final districts =
            await _fetch('$_psgcBase/regions/$regionCode/districts/');
        final perDistrict = await Future.wait(
          districts.map((d) =>
              _fetch('$_psgcBase/districts/${d.code}/cities-municipalities/')),
        );
        final flat = perDistrict.expand((x) => x).toList();
        // De-duplicate by code
        final seen = <String>{};
        list = flat.where((c) => seen.add(c.code)).toList()
          ..sort((a, b) => a.name.compareTo(b.name));
      }
      if (mounted) setState(() => _cities = list);
    } catch (_) {
      if (mounted) setState(() => _errorCities = 'Could not load cities.');
    } finally {
      if (mounted) setState(() => _loadingCities = false);
    }
  }

  Future<void> _loadCitiesForProvince(String provinceCode) async {
    setState(() {
      _loadingCities = true;
      _errorCities = null;
      _cities = [];
    });
    try {
      final list = await _fetch(
          '$_psgcBase/provinces/$provinceCode/cities-municipalities/');
      if (mounted) setState(() => _cities = list);
    } catch (_) {
      if (mounted) setState(() => _errorCities = 'Could not load cities.');
    } finally {
      if (mounted) setState(() => _loadingCities = false);
    }
  }

  Future<void> _loadBarangays(String cityCode) async {
    setState(() {
      _loadingBarangays = true;
      _errorBarangays = null;
      _barangays = [];
    });
    try {
      final list =
          await _fetch('$_psgcBase/cities-municipalities/$cityCode/barangays/');
      if (mounted) setState(() => _barangays = list);
    } catch (_) {
      if (mounted) {
        setState(() => _errorBarangays = 'Could not load barangays.');
      }
    } finally {
      if (mounted) setState(() => _loadingBarangays = false);
    }
  }

  // ── Selection handlers ────────────────────────────────────────────────────

  void _onRegionChanged(_PsgcItem? r) {
    setState(() {
      _region = r;
      _province = null;
      _district = null;
      _city = null;
      _barangay = null;
      _provinces = [];
      _cities = [];
      _barangays = [];
    });
    if (r == null) return;
    if (_isNcr(r)) {
      _loadCitiesForRegion(r.code);
    } else {
      _loadProvinces(r.code);
    }
    _notify();
  }

  void _onProvinceChanged(_PsgcItem? p) {
    setState(() {
      _province = p;
      _city = null;
      _barangay = null;
      _cities = [];
      _barangays = [];
    });
    if (p != null) _loadCitiesForProvince(p.code);
    _notify();
  }

  void _onDistrictChanged(String? d) {
    setState(() {
      _district = d;
      _city = null;
      _barangay = null;
      _barangays = [];
    });
    _notify();
  }

  void _onCityChanged(_PsgcItem? c) {
    setState(() {
      _city = c;
      _barangay = null;
      _barangays = [];
    });
    if (c != null) _loadBarangays(c.code);
    _notify();
  }

  void _onBarangayChanged(_PsgcItem? b) {
    setState(() => _barangay = b);
    _notify();
  }

  void _notify() {
    if (_region == null || _city == null || _barangay == null) return;
    if (_isNcrSelected && _district == null) return;
    if (!_isNcrSelected && _province == null) return;
    widget.onChanged?.call(
      region: _region!.name,
      province: _isNcrSelected ? null : _province?.name,
      district: _isNcrSelected ? _district : null,
      municipalityCity: _city!.name,
      barangay: _barangay!.name,
    );
  }

  // ── Filtered cities for NCR district ─────────────────────────────────────
  List<_PsgcItem> get _visibleCities {
    if (!_isNcrSelected) return _cities;
    if (_district == null) return [];
    final keys = _districtCityKeys(_district!);
    final matched =
        _cities.where((c) => keys.contains(_normCity(c.name))).toList();
    // If normalization produces no match, show all cities (safety fallback)
    return matched.isNotEmpty ? matched : _cities;
  }

  // ── Build helpers ─────────────────────────────────────────────────────────

  Widget _dropdown<T>({
    required String label,
    required bool loading,
    required String? error,
    required VoidCallback? onRetry,
    required List<T> items,
    required T? value,
    required String Function(T) itemLabel,
    required ValueChanged<T?> onChanged,
    required String hint,
    required bool enabled,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Label
        Text(
          label,
          style: GoogleFonts.plusJakartaSans(
            fontSize: 10,
            fontWeight: FontWeight.w700,
            color: _kSubtext,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 4),

        if (error != null) ...[
          // Error + retry row
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: AppColors.errorSoft,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.errorSoft),
            ),
            child: Row(
              children: [
                Icon(Icons.error_outline, color: AppColors.error, size: 16),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(error,
                      style: GoogleFonts.plusJakartaSans(
                          fontSize: 12, color: AppColors.error)),
                ),
                if (onRetry != null)
                  TextButton(
                    onPressed: onRetry,
                    style: TextButton.styleFrom(
                        padding: EdgeInsets.zero,
                        minimumSize: const Size(48, 28)),
                    child: Text('Retry',
                        style: GoogleFonts.plusJakartaSans(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: _kPrimary)),
                  ),
              ],
            ),
          ),
        ] else ...[
          // Normal dropdown
          DropdownButtonFormField<T>(
            initialValue: value,
            isExpanded: true,
            decoration: InputDecoration(
              filled: true,
              fillColor: enabled ? Colors.white : const Color(0xFFF0EEF8),
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: _kBorder),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: _kPrimary, width: 1.5),
              ),
              disabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: _kBorder),
              ),
              errorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: AppColors.error),
              ),
            ),
            hint: loading
                ? Row(children: [
                    const SizedBox(
                      width: 14,
                      height: 14,
                      child: CircularProgressIndicator(
                          strokeWidth: 1.5, color: _kSubtext),
                    ),
                    const SizedBox(width: 8),
                    Text('Loading…',
                        style: GoogleFonts.plusJakartaSans(
                            fontSize: 13, color: _kSubtext)),
                  ])
                : Text(hint,
                    style: GoogleFonts.plusJakartaSans(
                        fontSize: 13, color: _kSubtext)),
            items: items
                .map((item) => DropdownMenuItem<T>(
                      value: item,
                      child: Text(
                        itemLabel(item),
                        style: GoogleFonts.plusJakartaSans(
                            fontSize: 13,
                            color: _kText,
                            fontWeight: FontWeight.w500),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ))
                .toList(),
            onChanged: enabled && !loading ? onChanged : null,
            style: GoogleFonts.plusJakartaSans(
                fontSize: 13, color: _kText, fontWeight: FontWeight.w500),
            dropdownColor: Colors.white,
            icon: loading
                ? const SizedBox.shrink()
                : const Icon(Icons.keyboard_arrow_down_rounded,
                    color: _kSubtext),
          ),
        ],
        const SizedBox(height: 12),
      ],
    );
  }

  // ── Build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // ── Region ────────────────────────────────────────────────────────
        _dropdown<_PsgcItem>(
          label: 'REGION',
          loading: _loadingRegions,
          error: _errorRegions,
          onRetry: _loadRegions,
          items: _regions,
          value: _region,
          itemLabel: (r) => r.name,
          onChanged: _onRegionChanged,
          hint: 'Select region',
          enabled: true,
        ),

        // ── Province (non-NCR) OR District (NCR) ──────────────────────────
        if (_region != null) ...[
          if (_isNcrSelected)
            // District dropdown — hardcoded list, same as web
            _dropdown<String>(
              label: 'DISTRICT',
              loading: false,
              error: null,
              onRetry: null,
              items: _ncrDistricts,
              value: _district,
              itemLabel: (d) => d,
              onChanged: _onDistrictChanged,
              hint: 'Select district',
              enabled: true,
            )
          else
            _dropdown<_PsgcItem>(
              label: 'PROVINCE',
              loading: _loadingProvinces,
              error: _errorProvinces,
              onRetry: _province == null
                  ? () => _loadProvinces(_region!.code)
                  : null,
              items: _provinces,
              value: _province,
              itemLabel: (p) => p.name,
              onChanged: _onProvinceChanged,
              hint: 'Select province',
              enabled: !_loadingProvinces,
            ),
        ],

        // ── Municipality / City ───────────────────────────────────────────
        _dropdown<_PsgcItem>(
          label: 'MUNICIPALITY / CITY',
          loading: _loadingCities,
          error: _errorCities,
          onRetry: _errorCities != null
              ? () {
                  if (_isNcrSelected) {
                    _loadCitiesForRegion(_region!.code);
                  } else if (_province != null) {
                    _loadCitiesForProvince(_province!.code);
                  }
                }
              : null,
          items: _visibleCities,
          value: _city,
          itemLabel: (c) => c.name,
          onChanged: _onCityChanged,
          hint: _region == null
              ? 'Select region first'
              : (_isNcrSelected && _district == null)
                  ? 'Select district first'
                  : (!_isNcrSelected && _province == null)
                      ? 'Select province first'
                      : 'Select municipality / city',
          enabled: _region != null &&
              (!_isNcrSelected ? _province != null : _district != null) &&
              !_loadingCities,
        ),

        // ── Barangay ──────────────────────────────────────────────────────
        _dropdown<_PsgcItem>(
          label: 'BARANGAY',
          loading: _loadingBarangays,
          error: _errorBarangays,
          onRetry: _errorBarangays != null && _city != null
              ? () => _loadBarangays(_city!.code)
              : null,
          items: _barangays,
          value: _barangay,
          itemLabel: (b) => b.name,
          onChanged: _onBarangayChanged,
          hint: _city == null ? 'Select city first' : 'Select barangay',
          enabled: _city != null && !_loadingBarangays,
        ),
      ],
    );
  }
}
