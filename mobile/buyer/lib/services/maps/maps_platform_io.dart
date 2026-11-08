import 'dart:convert';

import 'package:http/http.dart' as http;

/// Android/iOS: the Maps SDK is native (key from AndroidManifest / AppDelegate),
/// so "loaded" just means a key was provided; geocoding uses the REST API.

Future<bool> ensureMapsLoaded(String apiKey) async => apiKey.isNotEmpty;

Future<(double, double)?> geocodeAddress(String address, String apiKey) async {
  if (apiKey.isEmpty) return null;
  try {
    final uri = Uri.https('maps.googleapis.com', '/maps/api/geocode/json', {
      'address': address,
      'region': 'ph',
      'key': apiKey,
    });
    final res = await http.get(uri).timeout(const Duration(seconds: 10));
    if (res.statusCode != 200) return null;
    final j = jsonDecode(res.body) as Map<String, dynamic>;
    if (j['status'] != 'OK') return null;
    final loc = (((j['results'] as List).first as Map)['geometry'] as Map)['location'] as Map;
    return ((loc['lat'] as num).toDouble(), (loc['lng'] as num).toDouble());
  } catch (_) {
    return null;
  }
}
