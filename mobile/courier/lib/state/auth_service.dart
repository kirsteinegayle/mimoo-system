import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../services/api_service.dart';
import '../models/courier_models.dart';

/// Authentication service for the Mimoo Courier app.
///
/// Persists the Sanctum token in the device keychain via flutter_secure_storage
/// and keeps ApiService.token in sync.
class AuthService {
  AuthService._();
  static final AuthService instance = AuthService._();

  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  static const _keyToken = 'courier_sanctum_token';
  static const _keyName = 'courier_name';
  static const _keyId = 'courier_id';
  static const _keyEmail = 'courier_email';
  static const _keyCompanyName = 'courier_company_name';

  // ── In-memory state ───────────────────────────────────────────────────────

  bool _isLoggedIn = false;
  String? _courierName;
  String? _courierId;
  String? _courierEmail;
  String? _companyName;

  bool get isLoggedIn => _isLoggedIn;
  String? get courierName => _courierName;
  String? get courierId => _courierId;
  String? get courierEmail => _courierEmail;
  String? get companyName => _companyName;

  Future<void> Function()? onLoginCallback;
  void Function()? onLogoutCallback;

  // ── Bootstrap ─────────────────────────────────────────────────────────────

  Future<void> restoreSession() async {
    final token = await _storage.read(key: _keyToken);
    if (token == null || token.isEmpty) {
      return;
    }

    ApiService.token = token;
    _courierName = await _storage.read(key: _keyName);
    _courierId = await _storage.read(key: _keyId);
    _courierEmail = await _storage.read(key: _keyEmail);
    _companyName = await _storage.read(key: _keyCompanyName);
    _isLoggedIn = true;
    if (onLoginCallback != null) {
      await onLoginCallback!();
    }
  }

  // ── Login ─────────────────────────────────────────────────────────────────

  Future<void> persistLogin({
    required String token,
    required CourierUser courier,
  }) async {
    await _storage.write(key: _keyToken, value: token);
    await _storage.write(key: _keyName, value: courier.displayName);
    await _storage.write(key: _keyId, value: courier.id.toString());
    await _storage.write(key: _keyEmail, value: courier.email);
    await _storage.write(key: _keyCompanyName, value: courier.companyName);

    ApiService.token = token;
    _isLoggedIn = true;
    _courierName = courier.displayName;
    _courierId = courier.id.toString();
    _courierEmail = courier.email;
    _companyName = courier.companyName;

    if (onLoginCallback != null) {
      await onLoginCallback!();
    }
  }

  // ── Logout / expiry ───────────────────────────────────────────────────────

  Future<void> logout() async {
    if (_isLoggedIn && ApiService.token != null) {
      try {
        await ApiService.post('/courier-app/logout');
      } catch (_) {
        // The local session is cleared even when the server is unreachable.
      }
    }

    await clearSession();
  }

  /// Clears the local session without calling the API (used on 401).
  Future<void> clearSession() async {
    ApiService.token = null;
    _isLoggedIn = false;
    _courierName = null;
    _courierId = null;
    _courierEmail = null;
    _companyName = null;

    await _storage.delete(key: _keyToken);
    await _storage.delete(key: _keyName);
    await _storage.delete(key: _keyId);
    await _storage.delete(key: _keyEmail);
    await _storage.delete(key: _keyCompanyName);

    onLogoutCallback?.call();
  }
}
