import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../core/theme.dart';
import '../widgets/mimoo_logo.dart';
import '../widgets/motion.dart';

/// Animated launch screen.
///
/// Plays the brand intro (logo scale/fade, glow ripple, name, tagline,
/// progress bar) for ~2s, then fades to [nextRoute]. [nextRoute] is decided
/// by the app's existing session check; this screen never changes it.
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key, required this.nextRoute});

  final String nextRoute;

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  late final AnimationController _intro;
  late final AnimationController _ripple;
  bool _started = false;

  @override
  void initState() {
    super.initState();
    _intro = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 2000));
    _ripple = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 1600));
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_started) return;
    _started = true;
    final reduced = reduceMotion(context);
    if (reduced) {
      // Reduced motion: no ripple, everything visible, short hold.
      _intro.duration = const Duration(milliseconds: 700);
    } else {
      _ripple.repeat();
    }
    _intro.forward().whenComplete(_finish);
  }

  void _finish() {
    if (!mounted) return;
    Navigator.of(context).pushReplacementNamed(widget.nextRoute);
  }

  @override
  void dispose() {
    _intro.dispose();
    _ripple.dispose();
    super.dispose();
  }

  Animation<double> _interval(double a, double b, [Curve curve = Curves.easeOut]) =>
      CurvedAnimation(parent: _intro, curve: Interval(a, b, curve: curve));

  @override
  Widget build(BuildContext context) {
    final reduced = reduceMotion(context);
    final logoIn = _interval(0, 0.4, Curves.easeOutBack);
    final textIn = _interval(0.3, 0.6);
    final tagIn = _interval(0.42, 0.72);
    final bar = _interval(0.05, 1, Curves.easeInOut);

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Scaffold(
        body: DecoratedBox(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [MC.violetDark, MC.violet],
            ),
          ),
          child: SafeArea(
            child: AnimatedBuilder(
              animation: Listenable.merge([_intro, _ripple]),
              builder: (context, _) {
                final logoT = reduced ? 1.0 : logoIn.value;
                final textT = reduced ? 1.0 : textIn.value;
                final tagT = reduced ? 1.0 : tagIn.value;
                return Column(children: [
                  const Spacer(flex: 3),
                  SizedBox(
                    width: 220,
                    height: 220,
                    child: Stack(alignment: Alignment.center, children: [
                      if (!reduced)
                        CustomPaint(
                          size: const Size.square(220),
                          painter: _RipplePainter(
                              _ripple.value, logoT.clamp(0.0, 1.0)),
                        ),
                      Opacity(
                        opacity: logoT.clamp(0.0, 1.0),
                        child: Transform.scale(
                          scale: 0.6 + 0.4 * logoT,
                          child: Container(
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: MC.coral.withValues(alpha: 0.35),
                                  blurRadius: 40,
                                  spreadRadius: 4,
                                ),
                              ],
                            ),
                            child: const MimooLogo(
                                size: 112, showRiderLabel: false),
                          ),
                        ),
                      ),
                    ]),
                  ),
                  const SizedBox(height: 20),
                  Opacity(
                    opacity: textT,
                    child: Transform.translate(
                      offset: Offset(0, 12 * (1 - textT)),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 24),
                        child: FittedBox(
                          fit: BoxFit.scaleDown,
                          child: Row(mainAxisSize: MainAxisSize.min, children: [
                            Text('Mimoo Rider',
                                style: ts(30,
                                    w: FontWeight.w800, c: Colors.white)),
                            Container(
                              margin:
                                  const EdgeInsets.only(left: 4, bottom: 14),
                              width: 9,
                              height: 9,
                              decoration: const BoxDecoration(
                                  color: MC.coral, shape: BoxShape.circle),
                            ),
                          ]),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Opacity(
                    opacity: tagT,
                    child: Text('Deliver fast. Deliver right.',
                        textAlign: TextAlign.center,
                        style: ts(15,
                            w: FontWeight.w500,
                            c: Colors.white.withValues(alpha: 0.8))),
                  ),
                  const Spacer(flex: 3),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(64, 0, 64, 48),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(99),
                      child: LinearProgressIndicator(
                        value: bar.value,
                        minHeight: 3,
                        backgroundColor: Colors.white.withValues(alpha: 0.18),
                        valueColor:
                            const AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    ),
                  ),
                ]);
              },
            ),
          ),
        ),
      ),
    );
  }
}

/// Expanding soft rings behind the logo.
class _RipplePainter extends CustomPainter {
  _RipplePainter(this.t, this.opacity);
  final double t;
  final double opacity;

  @override
  void paint(Canvas canvas, Size size) {
    final center = size.center(Offset.zero);
    final maxR = size.width / 2;
    for (var i = 0; i < 3; i++) {
      final p = (t + i / 3) % 1.0;
      final r = 56 + (maxR - 56) * p;
      final paint = Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2
        ..color = Colors.white
            .withValues(alpha: 0.22 * (1 - p) * opacity);
      canvas.drawCircle(center, r, paint);
    }
    final glow = Paint()
      ..shader = RadialGradient(colors: [
        Colors.white.withValues(alpha: 0.14 * opacity),
        Colors.white.withValues(alpha: 0),
      ]).createShader(Rect.fromCircle(center: center, radius: maxR));
    canvas.drawCircle(center, maxR * (0.9 + 0.05 * math.sin(t * math.pi * 2)),
        glow);
  }

  @override
  bool shouldRepaint(covariant _RipplePainter old) =>
      old.t != t || old.opacity != opacity;
}
