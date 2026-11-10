import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

/// App-wide configuration.
///
/// Override [apiBaseUrl] at build time with:
///   flutter run --dart-define=API_BASE_URL=http://192.168.x.x:8000/api
///
/// Defaults:
///   Web / iOS simulator / desktop → http://localhost:8000/api
///   Android emulator              → http://10.0.2.2:8000/api
///
/// A real phone must use the PC's LAN IP via `--dart-define` (for example
/// `--dart-define=API_BASE_URL=http://192.168.1.20:8000/api`).
class AppConfig {
  AppConfig._();

  static const String _envApiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: '',
  );

  /// Base URL for the Mimoo Laravel API, without trailing slash.
  ///
  /// Always ends in `/api`, even if `API_BASE_URL` was supplied without it.
  static String get apiBaseUrl {
    final raw = _envApiBaseUrl.isNotEmpty
        ? _envApiBaseUrl
        : (!kIsWeb && defaultTargetPlatform == TargetPlatform.android
            ? 'http://10.0.2.2:8000/api'
            : 'http://localhost:8000/api');

    var url = raw.trim().replaceAll(RegExp(r'/+$'), '');
    if (!url.endsWith('/api')) url = '$url/api';
    return url;
  }
}
