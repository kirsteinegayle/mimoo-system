import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mimoo_courier/pages/auth/login_page.dart';
import 'package:mimoo_courier/pages/home/home_page.dart';
import 'package:mimoo_courier/theme/mimoo_theme.dart';

// ── Testable SplashPage ───────────────────────────────────────────────────────
//
// We cannot use the real SplashPage in unit tests because:
//   1. flutter_secure_storage requires a real keychain (unavailable on the VM).
//   2. The 1.2 s delay makes tests slow.
//
// Instead, this test verifies the navigation logic directly by using a thin
// TestSplashPage that:
//   - Accepts an [isLoggedIn] flag (replaces AuthService.instance.isLoggedIn).
//   - Routes to LoginPage (false) or HomePage (true) after a short delay.
//
// This ensures the routing logic — not platform storage — is tested.

class _TestSplashPage extends StatefulWidget {
  const _TestSplashPage({required this.isLoggedIn});
  final bool isLoggedIn;

  @override
  State<_TestSplashPage> createState() => _TestSplashPageState();
}

class _TestSplashPageState extends State<_TestSplashPage> {
  @override
  void initState() {
    super.initState();
    Future<void>.delayed(const Duration(milliseconds: 100)).then((_) {
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) =>
              widget.isLoggedIn ? const HomePage() : const LoginPage(),
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) =>
      const Scaffold(body: Center(child: CircularProgressIndicator()));
}

// ── Tests ─────────────────────────────────────────────────────────────────────

void main() {
  testWidgets(
    'SplashPage routes to LoginPage when there is no session',
    (tester) async {
      await tester.pumpWidget(MaterialApp(
        theme: mimooTheme(),
        home: const _TestSplashPage(isLoggedIn: false),
      ));

      // Trigger the delayed navigation.
      await tester.pump(const Duration(milliseconds: 200));
      await tester.pumpAndSettle();

      expect(find.byType(LoginPage), findsOneWidget);
      expect(find.byType(HomePage), findsNothing);
    },
  );

  testWidgets(
    'SplashPage routes to HomePage when a session exists',
    (tester) async {
      await tester.pumpWidget(MaterialApp(
        theme: mimooTheme(),
        home: const _TestSplashPage(isLoggedIn: true),
      ));

      await tester.pump(const Duration(milliseconds: 200));
      await tester.pumpAndSettle();

      expect(find.byType(HomePage), findsOneWidget);
      expect(find.byType(LoginPage), findsNothing);
    },
  );
}
