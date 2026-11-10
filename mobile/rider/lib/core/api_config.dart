import 'package:flutter/foundation.dart';

/// ONE switch for the whole app.
///
/// false (default) = real Laravel backend at [apiBaseUrl] (/api/rider-app/*).
/// true            = the old in-memory demo data in lib/mock/rider_mock.dart
///                   (use this if the server is down during a demo).
const bool useMock = false;

/// Optional override: flutter run --dart-define=API_BASE_URL=http://192.168.1.10:8000
const String _baseUrlOverride = String.fromEnvironment('API_BASE_URL');

/// Laravel server root (no trailing slash, no /api).
///
/// - Chrome / Windows / iOS simulator: http://127.0.0.1:8000
/// - Android emulator: http://10.0.2.2:8000 (the emulator's alias for the PC)
/// - Real phone: pass API_BASE_URL with the PC's LAN IP via --dart-define
///   and start Laravel with: php artisan serve --host=0.0.0.0
///   (example: `--dart-define=API_BASE_URL=http://192.168.1.10:8000`)
String get apiBaseUrl {
  if (_baseUrlOverride.isNotEmpty) return _baseUrlOverride;
  if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
    return 'http://10.0.2.2:8000';
  }
  return 'http://127.0.0.1:8000';
}

/// All rider endpoints live under this prefix.
String get riderApiRoot => '$apiBaseUrl/api/rider-app';

/// DEBUG ONLY: demo account from `php artisan rider:demo-seed`.
/// Used to prefill the login form only inside `if (kDebugMode)`. kDebugMode is
/// a compile-time false in release, so that code (and these strings) are
/// tree-shaken out of release builds.
const String kDebugDemoEmail = 'demo.rider@mimoo-demo.test';
const String kDebugDemoPassword = 'Demo@1234!';
