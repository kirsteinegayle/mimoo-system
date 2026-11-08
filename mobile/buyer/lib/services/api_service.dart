import 'dart:convert';
import 'package:flutter/foundation.dart' show kIsWeb, kDebugMode, debugPrint;
import 'package:http/http.dart' as http;

/// Central HTTP client for all calls to the mimoo Laravel backend.
///
/// Usage:
///   final data = await ApiService.get('/products');
///   final res  = await ApiService.post('/auth/login', body: {...});
///
/// For endpoints that require authentication, set [ApiService.token]
/// after the user logs in — it will be sent as a Bearer token on every
/// subsequent request. Clear it on logout.
class ApiService {
  ApiService._();

  /// Base URL for the Laravel API.
  ///
  /// ── Development ──────────────────────────────────────────────────────────
  /// Automatically selects the correct host based on the current platform:
  ///
  ///   Flutter Web (Chrome) : 'http://127.0.0.1:8000/api'
  ///     → kIsWeb is true; the browser can reach localhost directly.
  ///
  ///   Android emulator     : 'http://10.0.2.2:8000/api'
  ///     → 10.0.2.2 is the emulator's alias for the host machine's localhost.
  ///
  ///   Physical device      : replace 10.0.2.2 with your PC's LAN IP,
  ///     e.g. 'http://192.168.x.x:8000/api'
  ///
  /// ── Production ───────────────────────────────────────────────────────────
  ///   static const String baseUrl = 'https://mimoo.bond/api';
  ///
  /// Start the Laravel dev server with:
  ///   php artisan serve --host=0.0.0.0 --port=8000
  static const String baseUrl =
      kIsWeb ? 'http://127.0.0.1:8000/api' : 'http://10.0.2.2:8000/api';

  /// Bearer token for authenticated requests.
  /// Set this after login, clear on logout.
  static String? token;

  /// Request timeout.
  /// 45 s in debug (first request to `php artisan serve` can take ~30 s);
  /// 30 s in release.
  // ignore: prefer_const_declarations
  static final Duration _timeout =
      kDebugMode ? const Duration(seconds: 45) : const Duration(seconds: 30);

  /// One user-facing message for any error thrown by this client.
  /// Screens show this with a "Try again" button instead of crashing.
  static String friendlyError(Object e) {
    if (e is ApiException) {
      if (e.statusCode == 401) return 'Your session has expired. Please log in again.';
      if (e.statusCode == 404) return e.message.isNotEmpty ? e.message : 'Not found.';
      if (e.statusCode >= 500) return 'Server error (${e.statusCode}). Please try again.';
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
      return 'Cannot reach the server. Check that the backend is running and try again.';
    }
    if (t.contains('FormatException') || t.contains('is not a subtype')) {
      return 'Unexpected response from the server.';
    }
    return 'Something went wrong. Please try again.';
  }

  // ── Headers ──────────────────────────────────────────────────────────────

  static Map<String, String> _headers({bool includeAuth = true}) {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (includeAuth && token != null) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  /// Builds the full URL for a given endpoint path.
  static Uri _uri(String endpoint) {
    final path = endpoint.startsWith('/') ? endpoint : '/$endpoint';
    return Uri.parse('$baseUrl$path');
  }

  // ── HTTP methods ──────────────────────────────────────────────────────────

  /// GET request. Returns decoded JSON (List or Map).
  static Future<dynamic> get(
    String endpoint, {
    Map<String, String>? queryParameters,
    bool includeAuth = true,
  }) async {
    final uri = _uri(endpoint).replace(queryParameters: queryParameters);
    final res = await http
        .get(uri, headers: _headers(includeAuth: includeAuth))
        .timeout(_timeout);
    return _handleResponse(res);
  }

  /// POST request. [body] is encoded as JSON. Returns decoded JSON.
  static Future<dynamic> post(
    String endpoint, {
    Map<String, dynamic>? body,
    bool includeAuth = true,
  }) async {
    final res = await http
        .post(
          _uri(endpoint),
          headers: _headers(includeAuth: includeAuth),
          body: body != null ? jsonEncode(body) : null,
        )
        .timeout(_timeout);
    return _handleResponse(res);
  }

  /// PUT request. [body] is encoded as JSON. Returns decoded JSON.
  static Future<dynamic> put(
    String endpoint, {
    Map<String, dynamic>? body,
    bool includeAuth = true,
  }) async {
    final res = await http
        .put(
          _uri(endpoint),
          headers: _headers(includeAuth: includeAuth),
          body: body != null ? jsonEncode(body) : null,
        )
        .timeout(_timeout);
    return _handleResponse(res);
  }

  /// PATCH request. [body] is encoded as JSON. Returns decoded JSON.
  static Future<dynamic> patch(
    String endpoint, {
    Map<String, dynamic>? body,
    bool includeAuth = true,
  }) async {
    final res = await http
        .patch(
          _uri(endpoint),
          headers: _headers(includeAuth: includeAuth),
          body: body != null ? jsonEncode(body) : null,
        )
        .timeout(_timeout);
    return _handleResponse(res);
  }

  /// DELETE request. Returns decoded JSON (may be empty map for 204).
  static Future<dynamic> delete(
    String endpoint, {
    bool includeAuth = true,
  }) async {
    final res = await http
        .delete(
          _uri(endpoint),
          headers: _headers(includeAuth: includeAuth),
        )
        .timeout(_timeout);
    return _handleResponse(res);
  }

  /// Multipart POST — sends [bytes] as a file field named [fieldName].
  /// Works on Flutter Web (no dart:io needed — uses bytes directly).
  static Future<dynamic> postMultipart(
    String endpoint, {
    required String fieldName,
    required List<int> bytes,
    required String filename,
    required String contentType,
    bool includeAuth = true,
  }) async {
    final uri = _uri(endpoint);
    final req = http.MultipartRequest('POST', uri);
    if (includeAuth && token != null) {
      req.headers['Authorization'] = 'Bearer $token';
    }
    req.headers['Accept'] = 'application/json';
    // Parse content type string into type/subtype parts for MultipartFile
    final parts = contentType.split('/');
    final mediaType = http.MediaType(
      parts.isNotEmpty ? parts[0] : 'application',
      parts.length > 1 ? parts[1] : 'octet-stream',
    );
    req.files.add(http.MultipartFile.fromBytes(
      fieldName,
      bytes,
      filename: filename,
      contentType: mediaType,
    ));
    final streamed = await req.send().timeout(_timeout);
    final res = await http.Response.fromStream(streamed);
    return _handleResponse(res);
  }

  /// Multipart POST with text [fields] and any number of [files].
  /// Each file entry: (field name e.g. 'images[]', bytes, filename, mime).
  static Future<dynamic> postMultipartFields(
    String endpoint, {
    Map<String, String> fields = const {},
    List<MultipartUpload> files = const [],
    bool includeAuth = true,
  }) async {
    final req = http.MultipartRequest('POST', _uri(endpoint));
    if (includeAuth && token != null) {
      req.headers['Authorization'] = 'Bearer $token';
    }
    req.headers['Accept'] = 'application/json';
    req.fields.addAll(fields);
    for (final f in files) {
      final parts = f.contentType.split('/');
      req.files.add(http.MultipartFile.fromBytes(
        f.field,
        f.bytes,
        filename: f.filename,
        contentType: http.MediaType(
          parts.isNotEmpty ? parts[0] : 'application',
          parts.length > 1 ? parts[1] : 'octet-stream',
        ),
      ));
    }
    final streamed = await req.send().timeout(_timeout);
    final res = await http.Response.fromStream(streamed);
    return _handleResponse(res);
  }

  // ── Response handling ─────────────────────────────────────────────────────

  /// Decodes the response body as JSON and throws [ApiException] on non-2xx.
  static dynamic _handleResponse(http.Response res) {
    // Debug-mode only: status, URL and a short body excerpt. Never headers
    // (no Authorization/token is ever printed).
    if (kDebugMode && res.statusCode >= 400) {
      final body = res.body.length > 300 ? '${res.body.substring(0, 300)}…' : res.body;
      debugPrint('[ApiService] ${res.statusCode} ${res.request?.method} ${res.request?.url} → $body');
    }
    if (res.statusCode >= 200 && res.statusCode < 300) {
      if (res.body.isEmpty) return {};
      return jsonDecode(res.body);
    }

    // Try to extract an error message + optional field errors map from Laravel.
    String message;
    Map<String, List<String>>? errors;
    try {
      final decoded = jsonDecode(res.body);
      if (decoded is Map<String, dynamic>) {
        // Laravel validation errors: {"message": "...", "errors": {"field": ["msg"]}}
        message = decoded['message'] as String? ?? 'Request failed';
        final raw = decoded['errors'];
        if (raw is Map<String, dynamic>) {
          errors = raw.map((key, value) {
            final msgs = value is List
                ? value.map((e) => e.toString()).toList()
                : [value.toString()];
            return MapEntry(key, msgs);
          });
        }
      } else if (decoded is List) {
        message = decoded.toString();
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

/// One file for [ApiService.postMultipartFields].
class MultipartUpload {
  const MultipartUpload({
    required this.field,
    required this.bytes,
    required this.filename,
    required this.contentType,
  });

  final String field;
  final List<int> bytes;
  final String filename;
  final String contentType;
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
  /// Map of field name → list of error messages.
  /// e.g. {"email": ["This email is already registered."]}
  /// Null when the response is not a validation error or has no `errors` key.
  final Map<String, List<String>>? errors;

  final String? body;

  /// Returns the first error message for [field], or null if none.
  String? errorFor(String field) => errors?[field]?.firstOrNull;

  @override
  String toString() => 'ApiException($statusCode): $message';
}
