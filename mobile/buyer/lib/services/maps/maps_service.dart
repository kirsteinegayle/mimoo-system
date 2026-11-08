import 'maps_platform_io.dart'
    if (dart.library.js_interop) 'maps_platform_web.dart' as platform;

/// Google Maps helpers for the order tracker.
///
/// The key comes ONLY from --dart-define=GOOGLE_MAPS_API_KEY (never hardcoded,
/// never committed). Without a key everything degrades to "no map" — callers
/// show the address as text and the status timeline keeps working.
class MapsService {
  MapsService._();
  static final MapsService instance = MapsService._();

  static const apiKey = String.fromEnvironment('GOOGLE_MAPS_API_KEY');
  bool get hasKey => apiKey.isNotEmpty;

  /// In-memory geocode cache (address → coordinates, or null for "not found")
  /// so each address is requested at most once per app session.
  final Map<String, (double, double)?> _cache = {};
  final Map<String, Future<(double, double)?>> _inFlight = {};

  Future<bool> ensureLoaded() => platform.ensureMapsLoaded(apiKey);

  Future<(double, double)?> geocode(String address) {
    final key = address.trim().toLowerCase();
    if (!hasKey || key.isEmpty) return Future.value(null);
    if (_cache.containsKey(key)) return Future.value(_cache[key]);
    return _inFlight[key] ??= platform.geocodeAddress(address, apiKey).then((r) {
      _cache[key] = r;
      _inFlight.remove(key);
      return r;
    });
  }
}
