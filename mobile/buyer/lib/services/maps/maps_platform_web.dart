import 'dart:async';
import 'dart:js_interop';
import 'dart:js_interop_unsafe';

/// Flutter Web: injects the Google Maps JavaScript API at runtime with the key
/// from --dart-define (so no key lives in web/index.html), and geocodes with
/// google.maps.Geocoder (the Geocoding REST endpoint has no browser CORS).

Future<bool>? _loading;

bool _mapsPresent() {
  final google = globalContext['google'];
  if (google == null || google.isUndefinedOrNull) return false;
  final maps = (google as JSObject)['maps'];
  return maps != null && !maps.isUndefinedOrNull;
}

Future<bool> ensureMapsLoaded(String apiKey) {
  if (apiKey.isEmpty) return Future.value(false);
  if (_mapsPresent()) return Future.value(true);
  return _loading ??= _inject(apiKey);
}

Future<bool> _inject(String apiKey) {
  final c = Completer<bool>();
  try {
    final doc = globalContext['document'] as JSObject;
    final script = doc.callMethod<JSObject>('createElement'.toJS, 'script'.toJS);
    script['src'] =
        'https://maps.googleapis.com/maps/api/js?key=${Uri.encodeComponent(apiKey)}&callback=__mimooMapsReady'
            .toJS;
    script['async'] = true.toJS;
    globalContext['__mimooMapsReady'] = (() {
      if (!c.isCompleted) c.complete(_mapsPresent());
    }).toJS;
    script['onerror'] = ((JSAny? _) {
      if (!c.isCompleted) c.complete(false);
    }).toJS;
    (doc['head'] as JSObject).callMethod<JSAny?>('appendChild'.toJS, script);
  } catch (_) {
    if (!c.isCompleted) c.complete(false);
  }
  // Never hang the UI: give up after 15 s.
  return c.future.timeout(const Duration(seconds: 15), onTimeout: () => false);
}

/// Returns (lat, lng) or null.
Future<(double, double)?> geocodeAddress(String address, String apiKey) async {
  if (!await ensureMapsLoaded(apiKey)) return null;
  try {
    final maps = (globalContext['google'] as JSObject)['maps'] as JSObject;
    final geocoder = (maps['Geocoder'] as JSFunction).callAsConstructor<JSObject>();
    final req = JSObject()
      ..['address'] = address.toJS
      ..['region'] = 'ph'.toJS;
    final res = await geocoder
        .callMethod<JSPromise<JSObject>>('geocode'.toJS, req)
        .toDart
        .timeout(const Duration(seconds: 10));
    final results = (res['results'] as JSArray<JSObject>).toDart;
    if (results.isEmpty) return null;
    final loc = (results.first['geometry'] as JSObject)['location'] as JSObject;
    final lat = (loc.callMethod<JSNumber>('lat'.toJS)).toDartDouble;
    final lng = (loc.callMethod<JSNumber>('lng'.toJS)).toDartDouble;
    return (lat, lng);
  } catch (_) {
    return null; // ZERO_RESULTS, REQUEST_DENIED, quota, etc.
  }
}
