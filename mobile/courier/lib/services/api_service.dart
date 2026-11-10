import 'dart:convert';
import 'package:flutter/foundation.dart' show kDebugMode, debugPrint;
import 'package:http/http.dart' as http;
import '../config/app_config.dart';

/// Central HTTP client for the Mimoo Courier app.
///
/// Usage:
///   final data = await ApiService.get('/courier-app/dashboard');
///   final res  = await ApiService.post('/courier-app/login', body: {...}, includeAuth: false);
///
/// Set [ApiService.token] after login. It is sent as a Bearer token on every
/// subsequent authenticated request. Clear it on logout.
///
/// Logs (debug only): HTTP status, method, URL, and a 300-char body excerpt.
/// The Authorization header is NEVER printed.
class ApiService {
  ApiService._();

  static String get _baseUrl => AppConfig.apiBaseUrl;

  /// Bearer token for authenticated requests.
  static String? token;

  /// Invoked once when an authenticated request returns 401 so the app can
  /// clear the saved session and return to Login.
  static void Function()? onUnauthorized;

  /// HTTP client, replaceable in tests.
  static http.Client httpClient = http.Client();

  /// Request timeout: 45 s in debug (first hit to `php artisan serve` can be slow),
  /// 30 s in release.
  static const Duration _timeout =
      kDebugMode ? Duration(seconds: 45) : Duration(seconds: 30);

  // ── Public helpers ────────────────────────────────────────────────────────

  /// Returns a user-facing error string for any exception thrown by this client.
  static String friendlyError(Object e) {
    if (e is ApiException) {
      final msg = e.message.toLowerCase();
      if (msg.contains('could not be found')) {
        return 'The server is missing the courier API routes. '
            'Update the Laravel backend and try again.';
      }
      if (e.statusCode == 401) {
        return 'Your session has expired. Please log in again.';
      }
      if (e.statusCode == 404) {
        return e.message.isNotEmpty ? e.message : 'Not found.';
      }
      if (e.statusCode >= 500) {
        return 'Server error (${e.statusCode}). Please try again.';
      }
      return e.message;
    }
    final t = e.toString();
    if (t.contains('TimeoutException')) {
      return 'The server is taking too long to respond. Please try again.';
    }
    if (t.contains('SocketException') ||
        t.contains('ClientException') ||
        t.contains('Failed to fetch') ||
        t.contains('Connection refused') ||
        t.contains('XMLHttpRequest')) {
      return 'Cannot reach the server. Check your connection and try again.';
    }
    if (t.contains('FormatException') || t.contains('is not a subtype')) {
      return 'The server returned data this app cannot read. Check that the '
          'Courier app and backend are using compatible versions, then retry.';
    }
    return 'Something went wrong. Please try again.';
  }

  // ── HTTP methods ──────────────────────────────────────────────────────────

  static Future<dynamic> get(
    String endpoint, {
    Map<String, String>? queryParameters,
    bool includeAuth = true,
  }) async {
    final uri = _uri(endpoint).replace(queryParameters: queryParameters);
    final res = await httpClient
        .get(uri, headers: _headers(includeAuth: includeAuth))
        .timeout(_timeout);
    return _handle(res, includeAuth: includeAuth);
  }

  static Future<dynamic> post(
    String endpoint, {
    Map<String, dynamic>? body,
    bool includeAuth = true,
  }) async {
    final uri = _uri(endpoint);
    final res = await httpClient
        .post(
          uri,
          headers: _headers(includeAuth: includeAuth),
          body: body != null ? jsonEncode(body) : null,
        )
        .timeout(_timeout);
    return _handle(res, includeAuth: includeAuth);
  }

  static Future<dynamic> put(
    String endpoint, {
    Map<String, dynamic>? body,
    bool includeAuth = true,
  }) async {
    final uri = _uri(endpoint);
    final res = await httpClient
        .put(
          uri,
          headers: _headers(includeAuth: includeAuth),
          body: body != null ? jsonEncode(body) : null,
        )
        .timeout(_timeout);
    return _handle(res, includeAuth: includeAuth);
  }

  static Future<dynamic> patch(
    String endpoint, {
    Map<String, dynamic>? body,
    bool includeAuth = true,
  }) async {
    final uri = _uri(endpoint);
    final res = await httpClient
        .patch(
          uri,
          headers: _headers(includeAuth: includeAuth),
          body: body != null ? jsonEncode(body) : null,
        )
        .timeout(_timeout);
    return _handle(res, includeAuth: includeAuth);
  }

  static Future<dynamic> delete(
    String endpoint, {
    bool includeAuth = true,
  }) async {
    final uri = _uri(endpoint);
    final res = await httpClient
        .delete(
          uri,
          headers: _headers(includeAuth: includeAuth),
        )
        .timeout(_timeout);
    return _handle(res, includeAuth: includeAuth);
  }

  /// Uploads a single file with optional multipart fields.
  static Future<dynamic> postMultipart(
    String endpoint, {
    required String field,
    required List<int> bytes,
    required String filename,
    Map<String, String> fields = const {},
    bool includeAuth = true,
  }) async {
    final request = http.MultipartRequest('POST', _uri(endpoint))
      ..headers.addAll(_headers(includeAuth: includeAuth));
    request.fields.addAll(fields);
    request.files.add(http.MultipartFile.fromBytes(
      field,
      bytes,
      filename: filename,
    ));

    final streamedResponse = await httpClient.send(request).timeout(_timeout);
    final res = await http.Response.fromStream(streamedResponse);
    return _handle(res, includeAuth: includeAuth);
  }

  // ── Internals ─────────────────────────────────────────────────────────────

  static Map<String, String> _headers({bool includeAuth = true}) {
    final h = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (includeAuth && token != null) {
      h['Authorization'] = 'Bearer $token';
    }
    return h;
  }

  static Uri _uri(String endpoint) {
    final path = endpoint.startsWith('/') ? endpoint : '/$endpoint';
    return Uri.parse('$_baseUrl$path');
  }

  static dynamic _handle(http.Response res, {bool includeAuth = true}) {
    if (kDebugMode) {
      // Log status + URL; body excerpt only on errors. Token is never logged.
      final excerpt =
          res.body.length > 300 ? '${res.body.substring(0, 300)}…' : res.body;
      debugPrint('[ApiService] ${res.statusCode} ${res.request?.method} '
          '${res.request?.url}'
          '${res.statusCode >= 400 ? ' → $excerpt' : ''}');
    }

    if (res.statusCode >= 200 && res.statusCode < 300) {
      if (res.body.isEmpty) return <String, dynamic>{};
      return jsonDecode(res.body);
    }

    if (res.statusCode == 401 && includeAuth) {
      onUnauthorized?.call();
    }

    String message;
    Map<String, List<String>>? errors;
    try {
      final decoded = jsonDecode(res.body);
      if (decoded is Map<String, dynamic>) {
        message = decoded['message'] as String? ?? 'Request failed';
        final raw = decoded['errors'];
        if (raw is Map<String, dynamic>) {
          errors = raw.map((k, v) {
            final msgs = v is List
                ? v.map((e) => e.toString()).toList()
                : [v.toString()];
            return MapEntry(k, msgs);
          });
        }
      } else {
        message = decoded.toString();
      }
    } catch (_) {
      message = 'Request failed (${res.statusCode})';
    }

    throw ApiException(
      statusCode: res.statusCode,
      message: message,
      errors: errors,
      body: res.body,
    );
  }
}

/// Thrown when the API returns a non-2xx status code.
class ApiException implements Exception {
  const ApiException({
    required this.statusCode,
    required this.message,
    this.errors,
    this.body,
  });

  final int statusCode;
  final String message;

  /// Field-level validation errors from a Laravel 422 response.
  final Map<String, List<String>>? errors;

  final String? body;

  /// First error message for [field], or null.
  String? errorFor(String field) => errors?[field]?.firstOrNull;

  @override
  String toString() => 'ApiException($statusCode): $message';
}
