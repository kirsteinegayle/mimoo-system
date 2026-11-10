import 'package:flutter/material.dart';
import '../state/auth_service.dart';
import 'auth/login_page.dart';
import 'home/home_page.dart';

/// Splash screen shown at app startup.
///
/// This intentionally mirrors the buyer app's splash exactly: same black
/// background, same `assets/images/splash.png` cover image, same 2600 ms
/// fade sequence (30% in / 45% hold / 25% out) and the same zero-duration
/// replacement route. The only difference is the destination:
///   - [HomePage]  if a saved session exists
///   - [LoginPage] otherwise
class SplashPage extends StatefulWidget {
  const SplashPage({super.key});

  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage>
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

    // Fade in 0–30%, hold, fade out 75–100%.
    _fade = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween(begin: 0.0, end: 1.0)
            .chain(CurveTween(curve: Curves.easeOut)),
        weight: 30,
      ),
      TweenSequenceItem(
        tween: ConstantTween(1.0),
        weight: 45,
      ),
      TweenSequenceItem(
        tween:
            Tween(begin: 1.0, end: 0.0).chain(CurveTween(curve: Curves.easeIn)),
        weight: 25,
      ),
    ]).animate(_ctrl);

    _ctrl.forward().then((_) {
      if (!mounted) return;
      final destination = AuthService.instance.isLoggedIn
          ? const HomePage()
          : const LoginPage();
      Navigator.of(context).pushReplacement(
        PageRouteBuilder(
          transitionDuration: Duration.zero,
          pageBuilder: (_, __, ___) => destination,
        ),
      );
    });
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: FadeTransition(
        opacity: _fade,
        child: SizedBox.expand(
          child: Image.asset(
            'assets/images/splash.png',
            fit: BoxFit.cover,
          ),
        ),
      ),
    );
  }
}
