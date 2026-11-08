import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../core/theme.dart';
import '../widgets/mimoo_rider_logo.dart';

/// Branded launch screen.
///
/// Shows the Mimoo Rider logo on the design's page background (#F5F4FC) with a
/// simple fade-in → hold → fade-out animation, then navigates to [nextRoute].
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key, required this.nextRoute});

  final String nextRoute;

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double> _fade;

  @override
  void initState() {
    super.initState();

    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2600),
    );

    // Fade in 0–30%, hold 30–75%, fade out 75–100%
    _fade = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween(begin: 0.0, end: 1.0)
            .chain(CurveTween(curve: Curves.easeOut)),
        weight: 30,
      ),
      TweenSequenceItem(tween: ConstantTween(1.0), weight: 45),
      TweenSequenceItem(
        tween:
            Tween(begin: 1.0, end: 0.0).chain(CurveTween(curve: Curves.easeIn)),
        weight: 25,
      ),
    ]).animate(_ctrl);

    _ctrl.forward().then((_) {
      if (!mounted) return;
      Navigator.of(context).pushReplacementNamed(widget.nextRoute);
    });
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.dark,
      child: Scaffold(
        backgroundColor: MC.bg,
        body: Center(
          child: FadeTransition(
            opacity: _fade,
            child: const MimooRiderLogo(width: 200),
          ),
        ),
      ),
    );
  }
}
