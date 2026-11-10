import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/api_config.dart';
import 'transport.dart';

/// Error with a message that is safe to show in a SnackBar.
class ApiException implements Exception {
  const ApiException(this.message, {this.status = 0, this.field});
  final String message;

  /// HTTP status (0 = network problem, request never reached the server).
  final int status;

  /// First validation field from a 422 response (e.g. "otp"), if any.
  final String? field;

  bool get isNetwork => status == 0;
  bool get isUnauthorized => status == 401;

  @override
  String toString() => message;
}

/// Small client for /api/rider-app/*. Holds the Sanctum token.
class RiderApi {
  RiderApi._();
  static final RiderApi instance = RiderApi._();

  static const _tokenKey = 'rider_api_token';
  static const _riderKey = 'rider_api_rider';

  String? _token;
  Map<String, dynamic>? _rider;

  /// Called once when any request returns 401 (expired / revoked token).
  /// main.dart uses it to go back to the login screen.
  VoidCallback? onUnauthorized;

  bool get hasToken => _token != null && _token!.isNotEmpty;

  /// Rider payload from login (/me shape): name, email, personnel_id, ...
  Map<String, dynamic>? get rider => _rider;

  /// Loads a saved session (call once at startup).
  Future<void> restore() async {
    try {
      final p = await SharedPreferences.getInstance();
      _token = p.getString(_tokenKey);
      final raw = p.getString(_riderKey);
      _rider = raw == null ? null : jsonDecode(raw) as Map<String, dynamic>;
    } catch (_) {
      _token = null;
      _rider = null;
    }
  }

  Future<void> _save() async {
    final p = await SharedPreferences.getInstance();
    if (hasToken) {
      await p.setString(_tokenKey, _token!);
      if (_rider != null) await p.setString(_riderKey, jsonEncode(_rider));
    } else {
      await p.remove(_tokenKey);
      await p.remove(_riderKey);
    }
  }

  Future<void> clearSession() async {
    _token = null;
    _rider = null;
    await _save();
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  Future<void> login(String email, String password) async {
    final body = await _request('POST', '/login',
        json: {'email': email, 'password': password}, auth: false);
    final data = (body['data'] as Map?)?.cast<String, dynamic>() ?? const {};
    final token = data['token'] as String?;
    if (token == null || token.isEmpty) {
      throw const ApiException('Login failed. Please try again.', status: 500);
    }
    _token = token;
    _rider = (data['rider'] as Map?)?.cast<String, dynamic>();
    await _save();
  }

  Future<void> logout() async {
    try {
      if (hasToken) await _request('POST', '/logout');
    } catch (_) {
      // Logging out locally is enough if the server is unreachable.
    }
    await clearSession();
  }

  // ── Generic calls ─────────────────────────────────────────────────────────

  Future<Map<String, dynamic>> get(String path) => _request('GET', path);

  Future<Map<String, dynamic>> post(String path, [Map<String, dynamic>? json]) =>
      _request('POST', path, json: json);

  Future<Map<String, dynamic>> upload(String path, UploadFile file) =>
      _request('POST', path, file: file);

  Future<Map<String, dynamic>> _request(
    String method,
    String path, {
    Map<String, dynamic>? json,
    UploadFile? file,
    bool auth = true,
  }) async {
    final headers = <String, String>{'Accept': 'application/json'};
    if (auth && hasToken) headers['Authorization'] = 'Bearer $_token';

    final RawResponse res;
    try {
      res = await sendHttp(method, Uri.parse('$riderApiRoot$path'),
          headers: headers,
          jsonBody: json == null ? null : jsonEncode(json),
          file: file);
    } on NetworkFailure catch (e) {
      debugPrint('RiderApi $method $path network error: ${e.detail}');
      throw ApiException(
          'Cannot reach the Mimoo server ($apiBaseUrl). '
          'Check your connection and that the server is running.');
    }

    Map<String, dynamic> body;
    try {
      final decoded = res.body.isEmpty ? null : jsonDecode(res.body);
      body = decoded is Map ? decoded.cast<String, dynamic>() : <String, dynamic>{};
    } catch (_) {
      body = <String, dynamic>{};
    }

    if (res.status >= 200 && res.status < 300) return body;

    if (res.status == 401 && auth) {
      await clearSession();
      onUnauthorized?.call();
    }
    throw _errorFrom(res.status, body);
  }

  static ApiException _errorFrom(int status, Map<String, dynamic> body) {
    String? field;
    String? message;
    final errors = body['errors'];
    if (errors is Map && errors.isNotEmpty) {
      field = errors.keys.first.toString();
      final first = errors.values.first;
      if (first is List && first.isNotEmpty) message = first.first.toString();
    }
    message ??= body['message'] as String?;
    message ??= switch (status) {
      401 => 'Your session has ended. Please log in again.',
      403 => 'You are not allowed to do that.',
      404 => 'Not found.',
      429 => 'Too many tries. Please wait a minute and try again.',
      >= 500 => 'Server error. Please try again.',
      _ => 'Something went wrong (HTTP $status).',
    };
    if (status == 429 && message == 'Too Many Attempts.') {
      message = 'Too many tries. Please wait a minute and try again.';
    }
    return ApiException(message, status: status, field: field);
  }
}
