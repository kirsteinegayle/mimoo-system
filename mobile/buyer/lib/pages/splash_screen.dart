import 'dart:async';

import 'package:flutter/material.dart';

import '../main.dart';
import '../state/auth_service.dart';
import '../theme/mimoo_brand.dart';
import '../widgets/auth_layout.dart';
import '../widgets/mimoo_logo.dart';
import '../widgets/motion.dart';
import 'auth/login_page.dart';

/// First screen of the app.
///
///  1. Logo fades in + scales up (≈700 ms), then the tagline fades in (≈500 ms).
///  2. Meanwhile the saved session is restored from secure storage and the
///     logo is precached.
///  3. After ≈2.2 s: session → Home; no session → Login with a 600 ms
///     easeOutCubic transition (logo Hero-flies into the Login header and
///     the white card slides up). pushReplacement, so Back never returns here.
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  static const _total = Duration(milliseconds: 2200);

  late final AnimationController _ctrl =
      AnimationController(vsync: this, duration: const Duration(milliseconds: 1200));

  // 0–700 ms: logo fade + scale; 700–1200 ms: tagline fade.
  late final Animation<double> _logoFade = CurvedAnimation(
      parent: _ctrl, curve: const Interval(0, 0.58, curve: Curves.easeOut));
  late final Animation<double> _logoScale = Tween(begin: 0.86, end: 1.0).animate(
      CurvedAnimation(parent: _ctrl, curve: const Interval(0, 0.58, curve: Curves.easeOutBack)));
  late final Animation<double> _taglineFade = CurvedAnimation(
      parent: _ctrl, curve: const Interval(0.58, 1, curve: Curves.easeOut));

  // Gentle float + pulse of the logo while the session loads.
  late final AnimationController _float =
      AnimationController(vsync: this, duration: const Duration(milliseconds: 1400));

  bool _started = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_started) return;
    _started = true;
    _run();
  }

  Future<void> _run() async {
    // Precache the logo first so the animation starts on a decoded image.
    // Capped so a slow/failed asset decode never holds the splash.
    await MimooLogo.precache(context)
        .timeout(const Duration(milliseconds: 800), onTimeout: () {})
        .catchError((_) {});
    if (!mounted) return;
    if (reduceMotion(context)) {
      _ctrl.value = 1; // reduce motion: show everything, no movement
    } else {
      _ctrl.forward().then((_) {
        if (mounted) _float.repeat(reverse: true);
      });
    }

    // restoreSession() reads the token from secure storage (fast) and then
    // loads cart/wishlist/profile over the network. Only the token read is
    // needed to decide where to go, so never wait on the network here.
    // Never let a storage/network error keep the user on the splash.
    final restore =
        AuthService.instance.restoreSession().catchError((Object _) {});
    await Future.wait([
      Future.delayed(_total),
      restore.timeout(_total, onTimeout: () {}),
    ]);
    if (!mounted) return;

    _float.stop();
    final nav = Navigator.of(context);
    if (AuthService.instance.isLoggedIn) {
      nav.pushReplacement(PageRouteBuilder(
        transitionDuration: const Duration(milliseconds: 450),
        pageBuilder: (_, __, ___) => const HomePage(),
        transitionsBuilder: (_, a, __, child) => FadeTransition(opacity: a, child: child),
      ));
    } else {
      nav.pushReplacement(PageRouteBuilder(
        transitionDuration: const Duration(milliseconds: 600),
        reverseTransitionDuration: const Duration(milliseconds: 300),
        pageBuilder: (_, __, ___) => const LoginPage(),
        transitionsBuilder: (_, a, __, child) => FadeTransition(
          opacity: CurvedAnimation(parent: a, curve: Curves.easeOutCubic),
          child: child,
        ),
      ));
    }
  }

  @override
  void dispose() {
    _ctrl.dispose();
    _float.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(gradient: MimooBrand.headerGradient),
        child: SafeArea(
          child: Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                FadeTransition(
                  opacity: _logoFade,
                  child: ScaleTransition(
                    scale: _logoScale,
                    child: AnimatedBuilder(
                      animation: _float,
                      child: const MimooLogo(size: 220, heroTag: kMimooLogoHeroTag),
                      builder: (_, child) {
                        final v = Curves.easeInOut.transform(_float.value);
                        return Transform.translate(
                          offset: Offset(0, -5 * v),
                          child: Transform.scale(scale: 1 + 0.025 * v, child: child),
                        );
                      },
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                FadeTransition(
                  opacity: _taglineFade,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 32),
                    child: Text(
                      MimooBrand.tagline,
                      textAlign: TextAlign.center,
                      style: mimooText(
                        size: 15,
                        weight: FontWeight.w500,
                        color: MimooBrand.accentSoft,
                        style: FontStyle.italic,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
