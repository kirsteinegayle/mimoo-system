import 'dart:async';
import 'dart:js_interop';
import 'dart:js_interop_unsafe';

import 'transport.dart';

const _timeout = Duration(seconds: 20);

@JS('fetch')
external JSPromise<_FetchResponse> _fetch(JSString url, JSObject init);

extension type _FetchResponse._(JSObject _) implements JSObject {
  external int get status;
  external JSPromise<JSString> text();
}

@JS('FormData')
extension type _FormData._(JSObject _) implements JSObject {
  external _FormData();
  external void append(JSString name, JSAny value, JSString filename);
}

@JS('Blob')
extension type _Blob._(JSObject _) implements JSObject {
  external _Blob(JSArray<JSAny> parts, JSObject options);
}

/// Browser implementation using fetch(). A CORS block or a stopped server
/// both surface as a NetworkFailure ("Failed to fetch").
Future<RawResponse> send(
  String method,
  Uri url, {
  required Map<String, String> headers,
  String? jsonBody,
  UploadFile? file,
}) async {
  final h = Map<String, String>.of(headers);
  final init = JSObject()..setProperty('method'.toJS, method.toJS);

  if (file != null) {
    // Let the browser set the multipart boundary header itself.
    h.remove('Content-Type');
    final blobOpts = JSObject()
      ..setProperty('type'.toJS, file.contentType.toJS);
    final blob = _Blob(<JSAny>[file.bytes.toJS].toJS, blobOpts);
    final form = _FormData()..append(file.field.toJS, blob, file.filename.toJS);
    init.setProperty('body'.toJS, form);
  } else if (jsonBody != null) {
    h['Content-Type'] = 'application/json';
    init.setProperty('body'.toJS, jsonBody.toJS);
  }
  init.setProperty('headers'.toJS, h.jsify());

  try {
    final res = await _fetch(url.toString().toJS, init).toDart.timeout(_timeout);
    final body = await res.text().toDart.timeout(_timeout);
    return RawResponse(res.status, body.toDart);
  } on TimeoutException {
    throw const NetworkFailure('timeout');
  } catch (e) {
    // TypeError: Failed to fetch (offline, server down, or CORS).
    throw NetworkFailure(e.toString());
  }
}
