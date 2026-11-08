import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../services/api_service.dart';

/// Authentication service — persists the Sanctum token in the device keychain
/// (iOS Keychain / Android Keystore) via flutter_secure_storage and keeps
/// ApiService in sync so every subsequent request carries the Bearer token.
///
/// Usage:
///   // Restore session on app start
///   await AuthService.instance.restoreSession();
///
///   // After a successful login API call
///   await AuthService.instance.persistLogin(token: '...', buyerName: 'Juan');
///
///   // Check whether a token is stored
///   AuthService.instance.isLoggedIn  →  bool
///
///   // Buyer name for display
///   AuthService.instance.buyerName   →  String?
///
///   // On logout
///   await AuthService.instance.logout();
class AuthService {
  AuthService._();
  static final AuthService instance = AuthService._();

  static const _storage = FlutterSecureStorage(
    // Use AES-CBC on Android (widely supported) rather than the newer AES-GCM
    // default so older devices don't have issues.
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
  );

  static const _keyToken = 'sanctum_token';
  static const _keyBuyerName = 'buyer_name';
  static const _keyBuyerId = 'buyer_id';
  static const _keyContact = 'contact_number';
  static const _keyStreet = 'street_address';
  static const _keyBarangay = 'barangay';
  static const _keyMunicipality = 'municipality_city';
  static const _keyProvince = 'province';
  static const _keyRegion = 'region';

  // ── In-memory state ───────────────────────────────────────────────────────

  bool _isLoggedIn = false;
  String? _buyerName;
  String? _buyerId;

  // ── Address fields (pre-fill checkout) ───────────────────────────────────
  String? _contactNumber;
  String? _streetAddress;
  String? _barangay;
  String? _municipalityCity;
  String? _province;
  String? _region;

  bool get isLoggedIn => _isLoggedIn;
  String? get buyerName => _buyerName;

  /// Notifies widgets (e.g. the Account header) when the display name changes.
  final ValueNotifier<String?> buyerNameListenable = ValueNotifier<String?>(null);

  /// Re-reads GET /api/buyer/profile so edits made on the website (which
  /// changes users.name / email only) show up in the app on refresh/resume.
  /// Silent on failure.
  Future<void> refreshProfile() async {
    if (!_isLoggedIn || ApiService.token == null) return;
    try {
      final res = await ApiService.get('/buyer/profile') as Map<String, dynamic>;
      final d = res['data'] as Map<String, dynamic>? ?? {};
      final webName = (d['name'] as String? ?? '').trim();
      final fullName =
          '${d['first_name'] ?? ''} ${d['last_name'] ?? ''}'.trim();
      final display = webName.isNotEmpty ? webName : fullName;
      if (display.isNotEmpty && display != _buyerName) {
        _buyerName = display;
        buyerNameListenable.value = _buyerName;
        await _storage.write(key: _keyBuyerName, value: _buyerName);
      }
    } catch (_) {
      // offline / server down — keep cached name
    }
  }
  String? get buyerId => _buyerId;
  String? get contactNumber => _contactNumber;
  String? get streetAddress => _streetAddress;
  String? get barangay => _barangay;
  String? get municipalityCity => _municipalityCity;
  String? get province => _province;
  String? get region => _region;

  /// Compose the shipping_address string in the SAME format as the website's
  /// Checkout.tsx:
  ///   NCR:     "${street}, ${barangay}, ${city}, ${region}"
  ///   non-NCR: "${street}, ${barangay}, ${city}, ${province}"
  String get defaultShippingAddress {
    final parts = <String>[];
    if (_streetAddress != null && _streetAddress!.isNotEmpty) {
      parts.add(_streetAddress!);
    }
    if (_barangay != null && _barangay!.isNotEmpty) parts.add(_barangay!);
    if (_municipalityCity != null && _municipalityCity!.isNotEmpty) {
      parts.add(_municipalityCity!);
    }
    // NCR: no province → append region; non-NCR: append province
    final isNcr = _province == null || _province!.isEmpty || _province == 'N/A';
    if (!isNcr && _province != null && _province!.isNotEmpty) {
      parts.add(_province!);
    } else if (_region != null && _region!.isNotEmpty) {
      parts.add(_region!);
    }
    return parts.join(', ');
  }

  // ── Session lifecycle callbacks ───────────────────────────────────────────

  /// Set by main.dart so CartState is synced on login/logout/restoreSession.
  Future<void> Function()? onLoginCallback;
  void Function()? onLogoutCallback;

  // ── Session bootstrap ─────────────────────────────────────────────────────

  /// Call this once in [main] (or in the first splash screen) to restore a
  /// persisted session. If a token exists it is loaded into [ApiService.token]
  /// so the very first authenticated request works without an explicit login.
  Future<void> restoreSession() async {
    final token = await _storage.read(key: _keyToken);
    if (token != null && token.isNotEmpty) {
      ApiService.token = token;
      _buyerName = await _storage.read(key: _keyBuyerName);
      buyerNameListenable.value = _buyerName;
      _buyerId = await _storage.read(key: _keyBuyerId);
      _contactNumber = await _storage.read(key: _keyContact);
      _streetAddress = await _storage.read(key: _keyStreet);
      _barangay = await _storage.read(key: _keyBarangay);
      _municipalityCity = await _storage.read(key: _keyMunicipality);
      _province = await _storage.read(key: _keyProvince);
      _region = await _storage.read(key: _keyRegion);
      _isLoggedIn = true;

      // If address fields are missing (session saved before this feature was
      // added), fetch them from GET /api/me and persist silently.
      if (_streetAddress == null || _streetAddress!.isEmpty) {
        await _refreshProfileFromServer();
      }

      // Load cart from server after session is restored
      if (onLoginCallback != null) await onLoginCallback!();
    }
  }

  /// Fetches the buyer profile from GET /api/me and persists address fields.
  /// Errors are swallowed — app still works if offline.
  Future<void> _refreshProfileFromServer() async {
    try {
      final res = await ApiService.get('/me') as Map<String, dynamic>;
      final user = res['user'] as Map<String, dynamic>?;
      if (user == null) return;

      _contactNumber = user['contact_number'] as String?;
      _streetAddress = user['street_address'] as String?;
      _barangay = user['barangay'] as String?;
      _municipalityCity = user['municipality_city'] as String?;
      _province = user['province'] as String?;
      _region = user['region'] as String?;

      final fn = user['first_name'] as String? ?? '';
      final ln = user['last_name'] as String? ?? '';
      if (fn.isNotEmpty || ln.isNotEmpty) {
        _buyerName = '$fn $ln'.trim();
        buyerNameListenable.value = _buyerName;
      }
      if (user['id'] != null) {
        _buyerId = user['id'].toString();
      }

      await _storage.write(key: _keyBuyerName, value: _buyerName);
      await _storage.write(key: _keyBuyerId, value: _buyerId);
      if (_contactNumber != null) {
        await _storage.write(key: _keyContact, value: _contactNumber);
      }
      if (_streetAddress != null) {
        await _storage.write(key: _keyStreet, value: _streetAddress);
      }
      if (_barangay != null) {
        await _storage.write(key: _keyBarangay, value: _barangay);
      }
      if (_municipalityCity != null) {
        await _storage.write(key: _keyMunicipality, value: _municipalityCity);
      }
      if (_province != null) {
        await _storage.write(key: _keyProvince, value: _province);
      }
      if (_region != null) {
        await _storage.write(key: _keyRegion, value: _region);
      }
    } catch (_) {
      // Silently ignore — checkout will show empty fields the buyer can fill
    }
  }

  // ── Login / persist ───────────────────────────────────────────────────────

  /// Persist the Sanctum token returned by the login or verify-email endpoint.
  /// Also stores the buyer's display name and id for quick access.
  Future<void> persistLogin({
    required String token,
    String? buyerName,
    String? buyerId,
    String? contactNumber,
    String? streetAddress,
    String? barangay,
    String? municipalityCity,
    String? province,
    String? region,
  }) async {
    await _storage.write(key: _keyToken, value: token);
    if (buyerName != null) {
      await _storage.write(key: _keyBuyerName, value: buyerName);
    }
    if (buyerId != null) {
      await _storage.write(key: _keyBuyerId, value: buyerId);
    }
    if (contactNumber != null) {
      await _storage.write(key: _keyContact, value: contactNumber);
    }
    if (streetAddress != null) {
      await _storage.write(key: _keyStreet, value: streetAddress);
    }
    if (barangay != null) {
      await _storage.write(key: _keyBarangay, value: barangay);
    }
    if (municipalityCity != null) {
      await _storage.write(key: _keyMunicipality, value: municipalityCity);
    }
    if (province != null) {
      await _storage.write(key: _keyProvince, value: province);
    }
    if (region != null) {
      await _storage.write(key: _keyRegion, value: region);
    }

    ApiService.token = token;
    _isLoggedIn = true;
    _buyerName = buyerName;
    buyerNameListenable.value = _buyerName;
    _buyerId = buyerId;
    _contactNumber = contactNumber;
    _streetAddress = streetAddress;
    _barangay = barangay;
    _municipalityCity = municipalityCity;
    _province = province;
    _region = region;
    // Notify CartState to load server cart
    if (onLoginCallback != null) await onLoginCallback!();
  }

  /// Convenience method used by tests and the mock login flow that only needs
  /// to mark the session as authenticated without a real token.
  /// Remove this once all screens use the real API.
  void login() => _isLoggedIn = true;

  /// Update the cached email after a successful change-email verify.
  /// Used by AccountSettingsPage to keep the displayed email in sync.
  Future<void> updateEmail(String newEmail) async {
    // Email is not cached in secure storage as a separate key, but buyerName
    // doesn't include it. No-op for now — profile is reloaded after email change.
    // If a separate _keyEmail were added we'd persist here.
  }

  // ── Logout ────────────────────────────────────────────────────────────────

  /// Revoke the token on the server (best-effort — network errors are swallowed)
  /// then clear local storage and reset in-memory state.
  Future<void> logout() async {
    // Best-effort API call — don't block the UI if the server is unreachable.
    if (_isLoggedIn && ApiService.token != null) {
      try {
        await ApiService.post('/buyer/logout');
      } catch (_) {
        // Token is already gone or server unreachable — proceed with local logout.
      }
    }

    ApiService.token = null;
    _isLoggedIn = false;
    _buyerName = null;
    buyerNameListenable.value = _buyerName;
    _buyerId = null;
    _contactNumber = null;
    _streetAddress = null;
    _barangay = null;
    _municipalityCity = null;
    _province = null;
    _region = null;

    await _storage.delete(key: _keyToken);
    await _storage.delete(key: _keyBuyerName);
    await _storage.delete(key: _keyBuyerId);
    await _storage.delete(key: _keyContact);
    await _storage.delete(key: _keyStreet);
    await _storage.delete(key: _keyBarangay);
    await _storage.delete(key: _keyMunicipality);
    await _storage.delete(key: _keyProvince);
    await _storage.delete(key: _keyRegion);

    // Notify CartState to wipe local cache
    onLogoutCallback?.call();
  }
}
