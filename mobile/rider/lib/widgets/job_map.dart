import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart' hide Path;

import '../core/theme.dart';
import 'motion.dart';

/// Who the rider is heading to.
enum JobMapMode { pickup, delivery }

/// Small map for the Pickup / Delivery detail screens: rider position and the
/// seller (pickup) or buyer (delivery), joined by a straight dashed line.
///
/// MOCK: the rider position is a fixed mock value and the line is a straight
/// line, NOT a road route. No geocoding, routing or GPS calls are made; the
/// only network traffic is OpenStreetMap tile images.
class JobMap extends StatefulWidget {
  const JobMap({
    super.key,
    required this.target,
    required this.riderPosition,
    required this.mode,
    this.height = 220,
  });

  final LatLng target;
  final LatLng riderPosition;
  final JobMapMode mode;
  final double height;

  @override
  State<JobMap> createState() => _JobMapState();
}

class _JobMapState extends State<JobMap> {
  static const _tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

  /// Identifies this app to the OSM tile servers (Android application id).
  static const _userAgentPackage = 'com.example.mimoo_rider';
  static const _minZoom = 4.0;
  static const _maxZoom = 18.0;

  final _controller = MapController();
  bool _ready = false;
  bool _tilesFailed = false;
  int _tileGeneration = 0;

  CameraFit get _fit => CameraFit.coordinates(
        coordinates: [widget.riderPosition, widget.target],
        // Extra top/right room for the chips and the zoom buttons.
        padding: const EdgeInsets.fromLTRB(44, 84, 72, 44),
        maxZoom: 16.5,
      );

  @override
  void didUpdateWidget(JobMap old) {
    super.didUpdateWidget(old);
    if (_ready &&
        (old.target != widget.target ||
            old.riderPosition != widget.riderPosition)) {
      _controller.fitCamera(_fit);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _zoomBy(double delta) {
    if (!_ready) return;
    final cam = _controller.camera;
    _controller.move(
        cam.center, (cam.zoom + delta).clamp(_minZoom, _maxZoom).toDouble());
  }

  void _recenter() {
    if (_ready) _controller.fitCamera(_fit);
  }

  void _onTileError(TileImage tile, Object error, StackTrace? stack) {
    if (_tilesFailed) return;
    // Called during tile loading; defer the rebuild to after this frame.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted && !_tilesFailed) setState(() => _tilesFailed = true);
    });
  }

  void _retryTiles() => setState(() {
        _tilesFailed = false;
        _tileGeneration++;
      });

  String get _distanceLabel {
    final meters =
        const Distance().as(LengthUnit.Meter, widget.riderPosition, widget.target);
    if (meters < 1000) {
      final m = (meters / 10).round() * 10;
      return '~$m m away, approx';
    }
    return '~${(meters / 1000).toStringAsFixed(1)} km away, approx';
  }

  @override
  Widget build(BuildContext context) {
    final c = MC.of(context);
    final pickup = widget.mode == JobMapMode.pickup;
    final pinColor = pickup ? c.primaryContainer : MC.green;
    final r = BorderRadius.circular(18);

    return Semantics(
      label: '${pickup ? 'Seller' : 'Buyer'} location map. $_distanceLabel. '
          'Approximate line, not a road route.',
      child: Container(
        height: widget.height,
        decoration: BoxDecoration(
          borderRadius: r,
          border: Border.all(color: c.outlineVariant),
          boxShadow: [
            BoxShadow(
                color: c.text.withValues(alpha: 0.10),
                blurRadius: 16,
                offset: const Offset(0, 6)),
          ],
        ),
        child: ClipRRect(
          borderRadius: r,
          child: Stack(children: [
            FlutterMap(
              mapController: _controller,
              options: MapOptions(
                initialCameraFit: _fit,
                minZoom: _minZoom,
                maxZoom: _maxZoom,
                backgroundColor: c.tint,
                onMapReady: () => _ready = true,
                // Single-finger drags scroll the page; pinch and double-tap
                // still move/zoom the map. Taps do nothing special.
                interactionOptions: const InteractionOptions(
                  flags: InteractiveFlag.pinchZoom |
                      InteractiveFlag.pinchMove |
                      InteractiveFlag.doubleTapZoom |
                      InteractiveFlag.scrollWheelZoom,
                ),
              ),
              children: [
                // Soft placeholder under the tiles while they load.
                const _TilePlaceholder(),
                TileLayer(
                  key: ValueKey(_tileGeneration),
                  urlTemplate: _tileUrl,
                  userAgentPackageName: _userAgentPackage,
                  maxNativeZoom: 19,
                  errorTileCallback: _onTileError,
                  evictErrorTileStrategy:
                      EvictErrorTileStrategy.notVisibleRespectMargin,
                ),
                PolylineLayer(polylines: [
                  Polyline(
                    points: [widget.riderPosition, widget.target],
                    strokeWidth: 4,
                    color: c.primary.withValues(alpha: 0.85),
                    borderStrokeWidth: 2,
                    borderColor: Colors.white.withValues(alpha: 0.8),
                    pattern: StrokePattern.dashed(segments: const [10, 8]),
                  ),
                ]),
                MarkerLayer(markers: [
                  Marker(
                    point: widget.riderPosition,
                    width: 44,
                    height: 44,
                    child: const _RiderDot(),
                  ),
                  Marker(
                    point: widget.target,
                    width: 90,
                    height: 44,
                    alignment: Alignment.topCenter,
                    child: _DropPin(
                      label: pickup ? 'Seller' : 'Buyer',
                      color: pinColor,
                      icon: pickup ? Icons.storefront : Icons.person,
                    ),
                  ),
                ]),
              ],
            ),
            // Distance chip + line note (top-left).
            Positioned(
              left: 10,
              top: 10,
              right: 64,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _Chip(
                    icon: Icons.near_me_rounded,
                    text: _distanceLabel,
                    strong: true,
                  ),
                  const SizedBox(height: 6),
                  const _Chip(
                    icon: Icons.timeline,
                    text: 'Approximate line, not a road route',
                  ),
                ],
              ),
            ),
            // Recenter + zoom (top-right).
            Positioned(
              right: 10,
              top: 10,
              child: Column(children: [
                _MapButton(
                    icon: Icons.my_location,
                    tooltip: 'Recenter',
                    onTap: _recenter),
                const SizedBox(height: 8),
                _ZoomButtons(
                    onIn: () => _zoomBy(1), onOut: () => _zoomBy(-1)),
              ]),
            ),
            // Required OSM attribution (bottom-right).
            Positioned(
              right: 0,
              bottom: 0,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.85),
                  borderRadius:
                      const BorderRadius.only(topLeft: Radius.circular(8)),
                ),
                child: Text('© OpenStreetMap contributors',
                    style: ts(10, w: FontWeight.w500, c: MC.text)),
              ),
            ),
            if (_tilesFailed)
              Positioned(
                left: 10,
                right: 10,
                bottom: 24,
                child: _OfflineNote(onRetry: _retryTiles),
              ),
          ]),
        ),
      ),
    );
  }
}

/// Soft grid shown before tiles arrive (and behind failed tiles).
class _TilePlaceholder extends StatelessWidget {
  const _TilePlaceholder();
  @override
  Widget build(BuildContext context) {
    final c = MC.of(context);
    return Positioned.fill(
      child: CustomPaint(
        painter: _GridPainter(c.outlineVariant.withValues(alpha: 0.5)),
        child: Center(
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            Icon(Icons.map_outlined, size: 18, color: c.muted),
            const SizedBox(width: 6),
            Text('Loading map…', style: MT.bodySm.copyWith(color: c.muted)),
          ]),
        ),
      ),
    );
  }
}

class _GridPainter extends CustomPainter {
  _GridPainter(this.color);
  final Color color;
  @override
  void paint(Canvas canvas, Size size) {
    final p = Paint()
      ..color = color
      ..strokeWidth = 1;
    const gap = 28.0;
    for (var x = 0.0; x < size.width; x += gap) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), p);
    }
    for (var y = 0.0; y < size.height; y += gap) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), p);
    }
  }

  @override
  bool shouldRepaint(_GridPainter old) => old.color != color;
}

class _OfflineNote extends StatelessWidget {
  const _OfflineNote({required this.onRetry});
  final VoidCallback onRetry;
  @override
  Widget build(BuildContext context) {
    final c = MC.of(context);
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 8, 4, 8),
      decoration: BoxDecoration(
        color: c.lowest.withValues(alpha: 0.95),
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(color: c.text.withValues(alpha: 0.12), blurRadius: 10),
        ],
      ),
      child: Row(children: [
        Icon(Icons.wifi_off_rounded, size: 18, color: c.muted),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
              "Map tiles can't load right now. Check your connection. "
              'The pins and distance are still shown.',
              style: MT.bodySm.copyWith(color: c.text)),
        ),
        TextButton(onPressed: onRetry, child: const Text('Retry')),
      ]),
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip({required this.icon, required this.text, this.strong = false});
  final IconData icon;
  final String text;
  final bool strong;
  @override
  Widget build(BuildContext context) {
    final c = MC.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: strong ? c.primary : c.lowest.withValues(alpha: 0.92),
        borderRadius: BorderRadius.circular(999),
        boxShadow: [
          BoxShadow(color: c.text.withValues(alpha: 0.12), blurRadius: 8),
        ],
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, size: 14, color: strong ? c.lowest : c.muted),
        const SizedBox(width: 5),
        Flexible(
          child: Text(text,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: ts(strong ? 12 : 11,
                  w: strong ? FontWeight.w800 : FontWeight.w600,
                  c: strong ? c.lowest : c.text)),
        ),
      ]),
    );
  }
}

class _MapButton extends StatelessWidget {
  const _MapButton(
      {required this.icon, required this.tooltip, required this.onTap});
  final IconData icon;
  final String tooltip;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) {
    final c = MC.of(context);
    return Material(
      color: c.lowest,
      shape: const CircleBorder(),
      elevation: 2,
      shadowColor: c.text.withValues(alpha: 0.3),
      child: IconButton(
        tooltip: tooltip,
        onPressed: onTap,
        icon: Icon(icon, size: 20, color: c.primary),
        constraints: const BoxConstraints.tightFor(width: 44, height: 44),
        padding: EdgeInsets.zero,
      ),
    );
  }
}

class _ZoomButtons extends StatelessWidget {
  const _ZoomButtons({required this.onIn, required this.onOut});
  final VoidCallback onIn, onOut;
  @override
  Widget build(BuildContext context) {
    final c = MC.of(context);
    Widget btn(IconData i, String tip, VoidCallback f) => IconButton(
          tooltip: tip,
          onPressed: f,
          icon: Icon(i, size: 20, color: c.primary),
          constraints: const BoxConstraints.tightFor(width: 44, height: 40),
          padding: EdgeInsets.zero,
        );
    return Material(
      color: c.lowest,
      elevation: 2,
      shadowColor: c.text.withValues(alpha: 0.3),
      borderRadius: BorderRadius.circular(22),
      clipBehavior: Clip.antiAlias,
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        btn(Icons.add, 'Zoom in', onIn),
        Container(width: 24, height: 1, color: c.outlineVariant),
        btn(Icons.remove, 'Zoom out', onOut),
      ]),
    );
  }
}

/// Blue pulsing dot for the (mock) rider position.
class _RiderDot extends StatefulWidget {
  const _RiderDot();
  @override
  State<_RiderDot> createState() => _RiderDotState();
}

class _RiderDotState extends State<_RiderDot>
    with SingleTickerProviderStateMixin {
  static const _blue = Color(0xFF2563EB);
  late final AnimationController _c = AnimationController(
      vsync: this, duration: const Duration(milliseconds: 1800));

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (reduceMotion(context)) {
      _c.stop();
      _c.value = 0.35;
    } else if (!_c.isAnimating) {
      _c.repeat();
    }
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Semantics(
        label: 'You (approximate)',
        child: AnimatedBuilder(
          animation: _c,
          builder: (context, _) =>
              Stack(alignment: Alignment.center, children: [
            Container(
              width: 16 + 28 * _c.value,
              height: 16 + 28 * _c.value,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: _blue.withValues(alpha: 0.30 * (1 - _c.value)),
              ),
            ),
            Container(
              width: 18,
              height: 18,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: _blue,
                border: Border.all(color: Colors.white, width: 3),
                boxShadow: [
                  BoxShadow(
                      color: _blue.withValues(alpha: 0.4), blurRadius: 6),
                ],
              ),
            ),
          ]),
        ),
      );
}

/// Labelled pin (built-in widgets only) that drops in with a small bounce.
/// The pin tip sits at the bottom-centre of the marker box.
class _DropPin extends StatefulWidget {
  const _DropPin(
      {required this.label, required this.color, required this.icon});
  final String label;
  final Color color;
  final IconData icon;
  @override
  State<_DropPin> createState() => _DropPinState();
}

class _DropPinState extends State<_DropPin>
    with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController(
      vsync: this, duration: const Duration(milliseconds: 650));
  late final Animation<double> _t =
      CurvedAnimation(parent: _c, curve: Curves.bounceOut);
  bool _started = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_started) return;
    _started = true;
    if (reduceMotion(context)) {
      _c.value = 1;
    } else {
      unawaited(Future<void>.delayed(const Duration(milliseconds: 250), () {
        if (mounted) _c.forward();
      }));
    }
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final color = widget.color;
    final pin = Column(mainAxisSize: MainAxisSize.min, children: [
      Container(
        padding: const EdgeInsets.fromLTRB(6, 4, 8, 4),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: Colors.white, width: 2),
          boxShadow: [
            BoxShadow(
                color: Colors.black.withValues(alpha: 0.25),
                blurRadius: 6,
                offset: const Offset(0, 2)),
          ],
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(widget.icon, size: 14, color: Colors.white),
          const SizedBox(width: 4),
          Text(widget.label,
              style: ts(12, w: FontWeight.w800, c: Colors.white)),
        ]),
      ),
      CustomPaint(size: const Size(14, 10), painter: _PinTipPainter(color)),
    ]);
    return Semantics(
      label: '${widget.label} location',
      child: AnimatedBuilder(
        animation: _t,
        child: pin,
        builder: (context, child) => Opacity(
          opacity: _c.value == 0 ? 0 : 1,
          // Bottom-centre of the box is the pin tip (the map point).
          child: Transform.translate(
            offset: Offset(0, -28 * (1 - _t.value)),
            child: Align(alignment: Alignment.bottomCenter, child: child),
          ),
        ),
      ),
    );
  }
}

class _PinTipPainter extends CustomPainter {
  _PinTipPainter(this.color);
  final Color color;
  @override
  void paint(Canvas canvas, Size size) {
    final path = Path()
      ..moveTo(0, 0)
      ..lineTo(size.width, 0)
      ..lineTo(size.width / 2, size.height)
      ..close();
    canvas.drawPath(path, Paint()..color = color);
  }

  @override
  bool shouldRepaint(_PinTipPainter old) => old.color != color;
}
