import 'package:flutter/foundation.dart' show kIsWeb;

/// App-wide configuration.
///
/// Override [apiBaseUrl] at build time with:
///   flutter run --dart-define=API_BASE_URL=http://192.168.x.x:8000/api
///
/// Defaults:
///   Web  → http://127.0.0.1:8000/api   (browser can reach localhost directly)
///   Android emulator → http://10.0.2.2:8000/api
class AppConfig {
  AppConfig._();

  static const String _envApiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: '',
  );

  /// Base URL for the Mimoo Laravel API, without trailing slash.
  static String get apiBaseUrl {
    if (_envApiBaseUrl.isNotEmpty) return _envApiBaseUrl;
    return kIsWeb ? 'http://127.0.0.1:8000/api' : 'http://10.0.2.2:8000/api';
  }
}
