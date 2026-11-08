import 'package:flutter/material.dart';
import '../state/auth_service.dart';
import '../theme/mimoo_theme.dart';
import '../widgets/mimoo_logo.dart';
import 'auth/login_page.dart';
import 'home/home_page.dart';

/// Splash screen shown at app startup.
///
/// Restores the session then navigates to:
///   - [HomePage]  if a valid session exists
///   - [LoginPage] otherwise
///
/// The logo fades + scales in. Total on-screen time ≈ 1.4 s
/// (longer if session restore takes more time).
class SplashPage extends StatefulWidget {
  const SplashPage({super.key});

  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double> _fade;
  late final Animation<double> _scale;

  @override
  void initState() {
    super.initState();

    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );

    _fade = CurvedAnimation(parent: _ctrl, curve: Curves.easeIn);
    _scale = Tween<double>(begin: 0.82, end: 1.0).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.easeOutBack),
    );

    _ctrl.forward();
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    // Restore session and allow the animation to play (at least 1.2 s).
    await Future.wait([
      AuthService.instance.restoreSession(),
      Future<void>.delayed(const Duration(milliseconds: 1200)),
    ]);

    if (!mounted) return;

    final destination =
        AuthService.instance.isLoggedIn ? const HomePage() : const LoginPage();

    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (_, __, ___) => destination,
        transitionsBuilder: (_, anim, __, child) =>
            FadeTransition(opacity: anim, child: child),
        transitionDuration: const Duration(milliseconds: 300),
      ),
    );
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Respect the system's reduce-motion preference.
    final reduceMotion = MediaQuery.of(context).disableAnimations;

    return Scaffold(
      backgroundColor: kPrimary,
      body: Center(
        child: reduceMotion
            ? const MimooLogo(size: 88, showTagline: true)
            : AnimatedBuilder(
                animation: _ctrl,
                builder: (_, child) => FadeTransition(
                  opacity: _fade,
                  child: ScaleTransition(
                    scale: _scale,
                    child: child,
                  ),
                ),
                child: const MimooLogo(size: 88, showTagline: true),
              ),
      ),
    );
  }
}
