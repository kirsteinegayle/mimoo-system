import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:math';

import 'transport.dart';

const _timeout = Duration(seconds: 20);

/// dart:io implementation (Android, iOS, Windows, macOS, Linux).
Future<RawResponse> send(
  String method,
  Uri url, {
  required Map<String, String> headers,
  String? jsonBody,
  UploadFile? file,
}) async {
  final client = HttpClient()..connectionTimeout = _timeout;
  try {
    final req = await client.openUrl(method, url).timeout(_timeout);
    headers.forEach(req.headers.set);

    if (file != null) {
      final boundary = '----mimoo${Random().nextInt(1 << 32)}';
      req.headers.set(
          HttpHeaders.contentTypeHeader, 'multipart/form-data; boundary=$boundary');
      final head = utf8.encode('--$boundary\r\n'
          'Content-Disposition: form-data; name="${file.field}"; filename="${file.filename}"\r\n'
          'Content-Type: ${file.contentType}\r\n\r\n');
      final tail = utf8.encode('\r\n--$boundary--\r\n');
      req.contentLength = head.length + file.bytes.length + tail.length;
      req
        ..add(head)
        ..add(file.bytes)
        ..add(tail);
    } else if (jsonBody != null) {
      final bytes = utf8.encode(jsonBody);
      req.headers.set(HttpHeaders.contentTypeHeader, 'application/json');
      req.contentLength = bytes.length;
      req.add(bytes);
    }

    final res = await req.close().timeout(_timeout);
    final body = await res.transform(utf8.decoder).join().timeout(_timeout);
    return RawResponse(res.statusCode, body);
  } on SocketException catch (e) {
    throw NetworkFailure(e.message);
  } on HttpException catch (e) {
    throw NetworkFailure(e.message);
  } on TimeoutException {
    throw const NetworkFailure('timeout');
  } finally {
    client.close();
  }
}
