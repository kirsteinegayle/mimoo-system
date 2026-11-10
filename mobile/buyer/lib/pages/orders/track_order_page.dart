import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:flutter_polyline_points/flutter_polyline_points.dart';
import 'driver_chat_page.dart';
import '../../theme/app_theme.dart';

// ── Design tokens ─────────────────────────────────────────────────────────────
const _kPrimary = AppColors.primary;
const _kSecondary = AppColors.accent;
const _kSurface = AppColors.surface;
const _kCard = AppColors.card;
const _kChip = AppColors.chip;
const _kBorder = AppColors.border;
const _kText = AppColors.text;
const _kSubtext = AppColors.textMuted;
const _kGreen = AppColors.success;

// Route line colour — orange-red as seen in the screenshot
const _kRoute = Color(0xFFE84B1A);

TextStyle _pjs({
  double size = 14,
  FontWeight weight = FontWeight.w400,
  Color color = _kText,
  double? height,
  TextDecoration? decoration,
}) =>
    GoogleFonts.plusJakartaSans(
      fontSize: size,
      fontWeight: weight,
      color: color,
      height: height,
      decoration: decoration,
    );

// ── Maps API key ──────────────────────────────────────────────────────────────
// Passed at build time only (never hardcoded), same define as MapsService:
//   --dart-define=GOOGLE_MAPS_API_KEY=<key>
// Without a key the map area shows a "Map unavailable" state.
const _kMapsApiKey = String.fromEnvironment('GOOGLE_MAPS_API_KEY');
const _kHasMapsKey = _kMapsApiKey != '';

// ── Data models ───────────────────────────────────────────────────────────────
enum TrackStage { shipped, outForDelivery, delivered }

class TrackingEvent {
  const TrackingEvent({
    required this.date,
    required this.time,
    required this.description,
    this.isActive = false,
  });
  final String date;
  final String time;
  final String description;
  final bool isActive;
}

class TrackingInfo {
  const TrackingInfo({
    required this.orderId,
    required this.trackingNumber,
    required this.courierName,
    required this.courierService,
    required this.estimatedDelivery,
    required this.isFastLane,
    required this.currentStage,
    required this.driverName,
    required this.driverRating,
    required this.driverAvatarSeed,
    required this.productName,
    required this.productImageSeed,
    required this.productQty,
    required this.hub,
    required this.events,
    required this.destinationLatLng,
    required this.initialRiderLatLng,
    required this.landmarks,
  });

  final String orderId;
  final String trackingNumber;
  final String courierName;
  final String courierService;
  final String estimatedDelivery;
  final bool isFastLane;
  final TrackStage currentStage;
  final String driverName;
  final double driverRating;
  final String driverAvatarSeed;
  final String productName;
  final String productImageSeed;
  final int productQty;
  final String hub;
  final List<TrackingEvent> events;

  // Map-specific fields
  final LatLng destinationLatLng;
  final LatLng initialRiderLatLng;
  final List<TrackLandmark> landmarks;
}

class TrackLandmark {
  const TrackLandmark({required this.position, required this.label});
  final LatLng position;
  final String label;
}

// ── Sample data ───────────────────────────────────────────────────────────────
final Map<String, TrackingInfo> sampleTracking = {
  'MM-89241029': TrackingInfo(
    orderId: 'MM-89241029',
    trackingNumber: 'PH2635188295101',
    courierName: 'mimoo Express',
    courierService: 'Standard',
    estimatedDelivery: 'Today, 24 Oct',
    isFastLane: true,
    currentStage: TrackStage.outForDelivery,
    driverName: 'Phillip',
    driverRating: 4.9,
    driverAvatarSeed: 'rider-phillip',
    productName: '[BUY 1 TAKE 2] Alpha Arbutin + AHA Glow Body Lotion',
    productImageSeed: 'lotion1',
    productQty: 1,
    hub: 'Metro Manila Hub',
    // Pagsanjan → Block 14 Lot 8 Orchid St (San Antonio, Parañaque)
    destinationLatLng: const LatLng(14.5012, 121.0167),
    initialRiderLatLng: const LatLng(14.2779, 121.4587),
    landmarks: const [
      TrackLandmark(
          position: LatLng(14.4400, 121.3600), label: "Janna's Place"),
      TrackLandmark(
          position: LatLng(14.3800, 121.3200), label: 'Le Maison Yelo Lane'),
      TrackLandmark(position: LatLng(14.3200, 121.4100), label: 'Pagsanjan'),
    ],
    events: [
      TrackingEvent(
        date: 'Today',
        time: '06:42',
        description:
            'Parcel is out for delivery.\nRider Phillip is on the way to your delivery address. Please keep your phone reachable.',
        isActive: true,
      ),
      TrackingEvent(
          date: 'Today',
          time: '06:42',
          description: 'Assigning a delivery driver (Rider Phillip)'),
      TrackingEvent(
          date: 'Today',
          time: '04:44',
          description:
              'Your parcel has arrived at the delivery hub : Pagsanjan Hub'),
      TrackingEvent(
          date: 'Today',
          time: '04:36',
          description:
              'Parcel has arrived and to be received by the delivery hub'),
      TrackingEvent(
          date: 'Today',
          time: '02:55',
          description: 'Parcel has departed from sorting facility'),
      TrackingEvent(
          date: 'Today',
          time: '02:55',
          description:
              'Parcel is loaded into truck, to leave sorting center soon'),
      TrackingEvent(
          date: 'Today',
          time: '00:09',
          description: 'Parcel has arrived at sorting facility : SOC 11'),
      TrackingEvent(
          date: '23 Oct',
          time: '17:34',
          description:
              'Parcel has been received at dropoff point : Service Point – DCFashion Group Inc'),
      TrackingEvent(
          date: '23 Oct',
          time: '14:39',
          description: 'Seller is preparing to ship your parcel'),
      TrackingEvent(
          date: '23 Oct', time: '14:07', description: 'Order is placed'),
    ],
  ),
};

// ═════════════════════════════════════════════════════════════════════════════
// PAGE  (StatefulWidget — needed for map + realtime subscription)
// ═════════════════════════════════════════════════════════════════════════════
class TrackOrderPage extends StatefulWidget {
  const TrackOrderPage({super.key, required this.orderId});
  final String orderId;

  @override
  State<TrackOrderPage> createState() => _TrackOrderPageState();
}

class _TrackOrderPageState extends State<TrackOrderPage> {
  late final TrackingInfo _info;

  // ── Map ──────────────────────────────────────────────────────────────────────
  GoogleMapController? _mapCtrl;
  LatLng? _riderLatLng;
  Set<Polyline> _polylines = {};
  Set<Marker> _markers = {};

  // ── Live tracking (via API polling) ──────────────────────────────────────────
  StreamSubscription? _locationPollSub;
  // ignore: prefer_final_fields
  bool _liveTrackingAvailable = true;

  @override
  void initState() {
    super.initState();
    _info = sampleTracking[widget.orderId] ?? sampleTracking['MM-89241029']!;
    _riderLatLng = _info.initialRiderLatLng;
    _buildInitialMarkersAndRoute();
    // Live rider position will be fetched from the Laravel API once wired up.
    // For now the map shows the rider's last known position from sample data.
  }

  @override
  void dispose() {
    _locationPollSub?.cancel();
    _mapCtrl?.dispose();
    super.dispose();
  }

  // ── Build markers + polyline on first load ────────────────────────────────────
  Future<void> _buildInitialMarkersAndRoute() async {
    final markers = <Marker>{};

    // Destination marker — home icon on dark purple background
    markers.add(
      Marker(
        markerId: const MarkerId('destination'),
        position: _info.destinationLatLng,
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueViolet),
        infoWindow: const InfoWindow(title: 'Delivery Address'),
      ),
    );

    // Rider marker
    markers.add(
      Marker(
        markerId: const MarkerId('rider'),
        position: _info.initialRiderLatLng,
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
        infoWindow: InfoWindow(title: 'Rider ${_info.driverName}'),
        zIndexInt: 2,
      ),
    );

    // Landmark markers
    for (final lm in _info.landmarks) {
      markers.add(
        Marker(
          markerId: MarkerId(lm.label),
          position: lm.position,
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
          infoWindow: InfoWindow(title: lm.label),
        ),
      );
    }

    // Fetch route polyline from Directions API
    final polylines = await _fetchRoute(
      _info.initialRiderLatLng,
      _info.destinationLatLng,
    );

    if (mounted) {
      setState(() {
        _markers = markers;
        _polylines = polylines;
      });
    }
  }

  // ── Fetch route via flutter_polyline_points ───────────────────────────────────
  Future<Set<Polyline>> _fetchRoute(LatLng origin, LatLng dest) async {
    if (!_kHasMapsKey) return _fallbackPolyline(origin, dest);
    try {
      final pp = PolylinePoints();
      final result = await pp.getRouteBetweenCoordinates(
        googleApiKey: _kMapsApiKey,
        request: PolylineRequest(
          origin: PointLatLng(origin.latitude, origin.longitude),
          destination: PointLatLng(dest.latitude, dest.longitude),
          mode: TravelMode.driving,
        ),
      );
      if (result.points.isEmpty) return _fallbackPolyline(origin, dest);
      return {
        Polyline(
          polylineId: const PolylineId('route'),
          color: _kRoute,
          width: 5,
          points: result.points
              .map((p) => LatLng(p.latitude, p.longitude))
              .toList(),
          startCap: Cap.roundCap,
          endCap: Cap.roundCap,
          jointType: JointType.round,
        ),
      };
    } catch (_) {
      return _fallbackPolyline(origin, dest);
    }
  }

  // Straight-line fallback when API key is not set
  Set<Polyline> _fallbackPolyline(LatLng origin, LatLng dest) {
    // Draw a simple curved approximation through the landmarks
    final points = [
      origin,
      ..._info.landmarks.map((l) => l.position),
      dest,
    ];
    return {
      Polyline(
        polylineId: const PolylineId('route_fallback'),
        color: _kRoute,
        width: 5,
        points: points,
        startCap: Cap.roundCap,
        endCap: Cap.roundCap,
        jointType: JointType.round,
      ),
    };
  }

  // ── Update rider marker position (called when API returns new coords) ─────
  // ignore: unused_element
  void _updateRiderMarker(LatLng newPos) {
    setState(() {
      _riderLatLng = newPos;
      _markers = {
        ..._markers.where((m) => m.markerId.value != 'rider'),
        Marker(
          markerId: const MarkerId('rider'),
          position: newPos,
          icon:
              BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
          infoWindow: InfoWindow(title: 'Rider ${_info.driverName}'),
          zIndexInt: 2,
        ),
      };
    });
    _mapCtrl?.animateCamera(CameraUpdate.newLatLng(newPos));
  }

  // ── Camera bounds ─────────────────────────────────────────────────────────────
  CameraPosition get _initialCamera {
    // Midpoint between rider and destination
    final midLat =
        (_info.initialRiderLatLng.latitude + _info.destinationLatLng.latitude) /
            2;
    final midLng = (_info.initialRiderLatLng.longitude +
            _info.destinationLatLng.longitude) /
        2;
    return CameraPosition(
      target: LatLng(midLat, midLng),
      zoom: 10.5,
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _kSurface,
      // Custom app bar — matches screenshot: ← | "Out for Delivery" | headset
      appBar: _buildAppBar(),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Live map ──────────────────────────────────────────────────────
            _buildMap(),
            // ── Delivery status section ────────────────────────────────────────
            _DeliveryHeaderCard(info: _info),
            const SizedBox(height: 8),
            _DriverCard(context: context, info: _info),
            const SizedBox(height: 8),
            _CourierCard(context: context, info: _info),
            const SizedBox(height: 8),
            _HistoryCard(info: _info),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  // ── App bar ──────────────────────────────────────────────────────────────────
  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: _kCard,
      elevation: 0,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back, color: _kText),
        onPressed: () => Navigator.pop(context),
      ),
      title: Text('Out for Delivery',
          style: _pjs(size: 17, weight: FontWeight.w800)),
      actions: [
        Padding(
          padding: const EdgeInsets.only(right: 14),
          child: Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: _kSecondary.withValues(alpha: 0.12),
            ),
            child: const Icon(Icons.headset_mic_outlined,
                size: 20, color: _kSecondary),
          ),
        ),
      ],
    );
  }

  // ── Map section ───────────────────────────────────────────────────────────────
  Widget _buildMap() {
    return SizedBox(
      height: 280,
      child: Stack(
        children: [
          // Google Map (or a placeholder when no API key was provided)
          if (!_kHasMapsKey)
            Positioned.fill(
              child: Container(
                color: _kChip,
                alignment: Alignment.center,
                child: const Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.map_outlined,
                        size: 36, color: _kSubtext),
                    SizedBox(height: 8),
                    Text('Map unavailable',
                        style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: _kSubtext)),
                  ],
                ),
              ),
            )
          else
            GoogleMap(
              initialCameraPosition: _initialCamera,
              onMapCreated: (ctrl) {
                _mapCtrl = ctrl;
                // Fit bounds to show full route
                if (_riderLatLng != null) {
                  ctrl.animateCamera(
                    CameraUpdate.newLatLngBounds(
                      _boundsFromLatLngs([
                        _riderLatLng!,
                        _info.destinationLatLng,
                        ..._info.landmarks.map((l) => l.position),
                      ]),
                      56,
                    ),
                  );
                }
              },
              markers: _markers,
              polylines: _polylines,
              myLocationButtonEnabled: false,
              zoomControlsEnabled: false,
              mapToolbarEnabled: false,
              compassEnabled: false,
              liteModeEnabled: false,
            ),

          // ── "On the way to destination" status banner ──────────────────────
          Positioned(
            top: 16,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(9999),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.12),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Text(
                  'On the way to destination',
                  style:
                      _pjs(size: 13, weight: FontWeight.w700, color: _kRoute),
                ),
              ),
            ),
          ),

          // ── GPS recenter button ────────────────────────────────────────────
          Positioned(
            bottom: 12,
            right: 12,
            child: GestureDetector(
              onTap: () {
                if (_riderLatLng != null) {
                  _mapCtrl?.animateCamera(
                    CameraUpdate.newCameraPosition(
                      CameraPosition(target: _riderLatLng!, zoom: 13),
                    ),
                  );
                }
              },
              child: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.12),
                      blurRadius: 6,
                    ),
                  ],
                ),
                child: const Icon(Icons.my_location, size: 20, color: _kText),
              ),
            ),
          ),

          // ── Live tracking unavailable notice ───────────────────────────────
          if (!_liveTrackingAvailable)
            Positioned(
              bottom: 12,
              left: 12,
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: Colors.black54,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  'Live tracking unavailable',
                  style: _pjs(size: 10, color: Colors.white),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

// ── Compute LatLngBounds from a list of coordinates ───────────────────────────
LatLngBounds _boundsFromLatLngs(List<LatLng> points) {
  assert(points.isNotEmpty);
  double minLat = points.first.latitude;
  double maxLat = points.first.latitude;
  double minLng = points.first.longitude;
  double maxLng = points.first.longitude;
  for (final p in points) {
    if (p.latitude < minLat) minLat = p.latitude;
    if (p.latitude > maxLat) maxLat = p.latitude;
    if (p.longitude < minLng) minLng = p.longitude;
    if (p.longitude > maxLng) maxLng = p.longitude;
  }
  return LatLngBounds(
    southwest: LatLng(minLat, minLng),
    northeast: LatLng(maxLat, maxLng),
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// DELIVERY STATUS SECTION WIDGETS (unchanged from previous iteration)
// ═════════════════════════════════════════════════════════════════════════════

// ── Estimated delivery + progress stepper + banners ──────────────────────────
class _DeliveryHeaderCard extends StatelessWidget {
  const _DeliveryHeaderCard({required this.info});
  final TrackingInfo info;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: _kCard,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildEstimatedRow(),
          _buildStepper(),
          _buildBanners(),
        ],
      ),
    );
  }

  Widget _buildEstimatedRow() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
                color: _kChip, borderRadius: BorderRadius.circular(8)),
            child: const Icon(Icons.calendar_today_outlined,
                size: 17, color: _kSecondary),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Estimated delivery date:',
                    style: _pjs(size: 12, color: _kSubtext)),
                const SizedBox(height: 1),
                RichText(
                  text: TextSpan(children: [
                    TextSpan(
                        text: 'Estimated delivery date: ',
                        style: _pjs(
                            size: 15, weight: FontWeight.w400, color: _kText)),
                    TextSpan(
                        text: '24 Oct',
                        style: _pjs(
                            size: 15, weight: FontWeight.w800, color: _kText)),
                  ]),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStepper() {
    final currentIdx = info.currentStage.index;
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _StageNode(index: 0, currentIdx: currentIdx, label: 'Shipped'),
          _Connector(filled: currentIdx >= 1),
          _StageNode(
              index: 1, currentIdx: currentIdx, label: 'Out for\nDelivery'),
          _Connector(filled: currentIdx >= 2),
          _StageNode(index: 2, currentIdx: currentIdx, label: 'Delivered'),
        ],
      ),
    );
  }

  Widget _buildBanners() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 0, 12, 14),
      child: Column(
        children: [
          _InfoBanner(
            prefix: 'COD UNBOX',
            text: 'Eligible for COD Unbox.',
            actionLabel: 'Details',
            onAction: () {},
          ),
          const SizedBox(height: 6),
          _InfoBanner(
            icon: Icons.verified_outlined,
            text: 'Guaranteed On-Time Delivery: Get a ₱40 ...',
            actionLabel: 'View More',
            onAction: () {},
          ),
        ],
      ),
    );
  }
}

// ── Stage node ────────────────────────────────────────────────────────────────
class _StageNode extends StatelessWidget {
  const _StageNode(
      {required this.index, required this.currentIdx, required this.label});
  final int index, currentIdx;
  final String label;

  @override
  Widget build(BuildContext context) {
    final isDone = currentIdx > index;
    final isCurrent = currentIdx == index;

    final circleColor = (isDone || isCurrent) ? _kSecondary : Colors.white;
    final borderColor = (isDone || isCurrent) ? _kSecondary : _kBorder;

    Widget icon;
    if (isDone) {
      icon = const Icon(Icons.check, size: 16, color: Colors.white);
    } else if (isCurrent) {
      icon = const Icon(Icons.local_shipping, size: 16, color: Colors.white);
    } else {
      icon = Icon(Icons.check, size: 16, color: _kBorder);
    }

    return Column(
      children: [
        Container(
          width: 34,
          height: 34,
          decoration: BoxDecoration(
            color: circleColor,
            shape: BoxShape.circle,
            border: Border.all(color: borderColor, width: 2),
          ),
          child: Center(child: icon),
        ),
        const SizedBox(height: 5),
        Text(
          label,
          textAlign: TextAlign.center,
          style: _pjs(
            size: 10,
            weight: isCurrent ? FontWeight.w700 : FontWeight.w400,
            color: isCurrent ? _kText : _kSubtext,
            height: 1.3,
          ),
        ),
      ],
    );
  }
}

// ── Connector ─────────────────────────────────────────────────────────────────
class _Connector extends StatelessWidget {
  const _Connector({required this.filled});
  final bool filled;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        height: 3,
        margin: const EdgeInsets.only(bottom: 28),
        decoration: BoxDecoration(
          color: filled ? _kSecondary : _kBorder,
          borderRadius: BorderRadius.circular(2),
        ),
      ),
    );
  }
}

// ── Info banner ───────────────────────────────────────────────────────────────
class _InfoBanner extends StatelessWidget {
  const _InfoBanner({
    this.prefix,
    this.icon,
    required this.text,
    required this.actionLabel,
    required this.onAction,
  });
  final String? prefix;
  final IconData? icon;
  final String text;
  final String actionLabel;
  final VoidCallback onAction;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
      decoration: BoxDecoration(
        color: _kCard,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: _kBorder),
      ),
      child: Row(
        children: [
          if (prefix != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
              decoration: BoxDecoration(
                border: Border.all(color: _kSecondary),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(prefix!,
                  style: _pjs(
                      size: 9, weight: FontWeight.w800, color: _kSecondary)),
            ),
          if (icon != null) Icon(icon!, size: 15, color: _kSecondary),
          const SizedBox(width: 8),
          Expanded(
            child: Text(text,
                overflow: TextOverflow.ellipsis,
                style: _pjs(size: 12, color: _kText)),
          ),
          const SizedBox(width: 6),
          GestureDetector(
            onTap: onAction,
            child: Text(actionLabel,
                style: _pjs(
                    size: 12, weight: FontWeight.w700, color: _kSecondary)),
          ),
        ],
      ),
    );
  }
}

// ── Driver card ───────────────────────────────────────────────────────────────
class _DriverCard extends StatelessWidget {
  const _DriverCard({required this.context, required this.info});
  final BuildContext context;
  final TrackingInfo info;

  @override
  Widget build(BuildContext _) {
    return Container(
      color: _kCard,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        children: [
          Stack(
            clipBehavior: Clip.none,
            children: [
              CircleAvatar(
                radius: 27,
                backgroundColor: _kChip,
                backgroundImage: NetworkImage(
                    'https://picsum.photos/seed/${info.driverAvatarSeed}/100/100'),
                onBackgroundImageError: (_, __) {},
                child: const Icon(Icons.person, size: 28, color: _kPrimary),
              ),
              Positioned(
                bottom: 1,
                right: 1,
                child: Container(
                  width: 13,
                  height: 13,
                  decoration: BoxDecoration(
                    color: _kGreen,
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 1.5),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Delivery Driver',
                    style: _pjs(size: 15, weight: FontWeight.w800)),
                Row(
                  children: [
                    Text('${info.courierName} Elite Courier  •  ',
                        style: _pjs(size: 11, color: _kSubtext)),
                    Icon(Icons.star_rounded, size: 12, color: AppColors.star),
                    Text(' ${info.driverRating}★',
                        style: _pjs(
                            size: 11,
                            weight: FontWeight.w600,
                            color: _kSubtext)),
                  ],
                ),
              ],
            ),
          ),
          // Chat icon button
          GestureDetector(
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => DriverChatPage(
                  orderId: info.orderId,
                  trackingNumber: info.trackingNumber,
                  driverName: info.driverName,
                  driverAvatarSeed: info.driverAvatarSeed,
                  driverRating: info.driverRating,
                  courierName: info.courierName,
                  productName: info.productName,
                  productImageSeed: info.productImageSeed,
                  codAmount: 194.0,
                ),
              ),
            ),
            child: Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: _kSecondary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child:
                  const Icon(Icons.chat_outlined, size: 20, color: _kSecondary),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Courier / tracking card ───────────────────────────────────────────────────
class _CourierCard extends StatelessWidget {
  const _CourierCard({required this.context, required this.info});
  final BuildContext context;
  final TrackingInfo info;

  @override
  Widget build(BuildContext _) {
    return Container(
      color: _kCard,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Image.network(
              'https://picsum.photos/seed/${info.productImageSeed}/100/100',
              width: 50,
              height: 50,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) =>
                  Container(width: 50, height: 50, color: _kChip),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(info.courierName,
                    style: _pjs(size: 13, weight: FontWeight.w800)),
                const SizedBox(height: 3),
                GestureDetector(
                  onTap: () {
                    Clipboard.setData(ClipboardData(text: info.trackingNumber));
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                      content: Text('Tracking number copied!',
                          style: _pjs(
                              size: 13,
                              color: Colors.white,
                              weight: FontWeight.w600)),
                      backgroundColor: _kPrimary,
                      duration: const Duration(seconds: 2),
                    ));
                  },
                  child: Row(
                    children: [
                      Text(info.trackingNumber,
                          style: _pjs(size: 11, weight: FontWeight.w600)),
                      const SizedBox(width: 4),
                      const Icon(Icons.copy_outlined,
                          size: 13, color: _kSubtext),
                    ],
                  ),
                ),
              ],
            ),
          ),
          OutlinedButton(
            onPressed: () {},
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: _kBorder),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(9)),
              minimumSize: const Size(0, 34),
              padding: const EdgeInsets.symmetric(horizontal: 12),
            ),
            child: Text('Order Details',
                style: _pjs(size: 12, weight: FontWeight.w600, color: _kText)),
          ),
        ],
      ),
    );
  }
}

// ── Delivery history card ─────────────────────────────────────────────────────
class _HistoryCard extends StatelessWidget {
  const _HistoryCard({required this.info});
  final TrackingInfo info;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: _kCard,
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Delivery History',
                  style: _pjs(size: 15, weight: FontWeight.w800)),
              Text(info.hub, style: _pjs(size: 12, color: _kSubtext)),
            ],
          ),
          const SizedBox(height: 16),
          ...info.events.asMap().entries.map((e) => _TimelineRow(
                event: e.value,
                isLast: e.key == info.events.length - 1,
              )),
        ],
      ),
    );
  }
}

// ── Timeline row ─────────────────────────────────────────────────────────────
class _TimelineRow extends StatelessWidget {
  const _TimelineRow({required this.event, required this.isLast});
  final TrackingEvent event;
  final bool isLast;

  @override
  Widget build(BuildContext context) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 52,
            child: Padding(
              padding: const EdgeInsets.only(top: 1),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(event.date, style: _pjs(size: 10, color: _kSubtext)),
                  Text(event.time, style: _pjs(size: 10, color: _kSubtext)),
                ],
              ),
            ),
          ),
          const SizedBox(width: 14),
          Column(
            children: [
              _TimelineDot(isActive: event.isActive),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 1.5,
                    margin: const EdgeInsets.symmetric(vertical: 3),
                    color: _kBorder,
                  ),
                ),
            ],
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 18),
              child: Text(
                event.description,
                style: _pjs(
                  size: 12,
                  weight: event.isActive ? FontWeight.w700 : FontWeight.w400,
                  color: event.isActive ? _kSecondary : _kSubtext,
                  height: 1.5,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Timeline dot ─────────────────────────────────────────────────────────────
class _TimelineDot extends StatelessWidget {
  const _TimelineDot({required this.isActive});
  final bool isActive;

  @override
  Widget build(BuildContext context) {
    if (isActive) {
      return Container(
        width: 12,
        height: 12,
        margin: const EdgeInsets.only(top: 2),
        decoration:
            const BoxDecoration(color: _kSecondary, shape: BoxShape.circle),
        child: Center(
          child: Container(
            width: 5,
            height: 5,
            decoration: const BoxDecoration(
                color: Colors.white, shape: BoxShape.circle),
          ),
        ),
      );
    }
    return Container(
      width: 10,
      height: 10,
      margin: const EdgeInsets.only(top: 3),
      decoration: BoxDecoration(
        color: _kSurface,
        shape: BoxShape.circle,
        border: Border.all(color: _kBorder, width: 1.5),
      ),
    );
  }
}
