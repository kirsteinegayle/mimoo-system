import 'dart:typed_data';

import 'transport_io.dart' if (dart.library.js_interop) 'transport_web.dart'
    as impl;

/// Raw HTTP result (status + body text).
class RawResponse {
  const RawResponse(this.status, this.body);
  final int status;
  final String body;
}

/// One file for a multipart/form-data upload.
class UploadFile {
  const UploadFile(
      {required this.field,
      required this.filename,
      required this.bytes,
      required this.contentType});
  final String field;
  final String filename;
  final Uint8List bytes;
  final String contentType;
}

/// Thrown when the request never reached the server (offline, wrong IP,
/// server stopped, CORS blocked in the browser, timeout).
class NetworkFailure implements Exception {
  const NetworkFailure(this.detail);
  final String detail;
  @override
  String toString() => 'NetworkFailure: $detail';
}

/// Sends one HTTP request. Uses dart:io on Android/desktop and the browser
/// fetch() API on web, so no extra package is needed.
Future<RawResponse> sendHttp(
  String method,
  Uri url, {
  required Map<String, String> headers,
  String? jsonBody,
  UploadFile? file,
}) =>
    impl.send(method, url, headers: headers, jsonBody: jsonBody, file: file);
