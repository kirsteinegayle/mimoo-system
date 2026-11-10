import 'dart:async';

import 'package:flutter/material.dart';
import 'pages/auth/login_page.dart';
import 'pages/splash_page.dart';
import 'services/api_service.dart';
import 'state/auth_service.dart';
import 'theme/mimoo_theme.dart';

final GlobalKey<NavigatorState> mimooNavigatorKey = GlobalKey<NavigatorState>();

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Restore the saved session before the splash animation starts, exactly
  // like the buyer app does, so the splash timing is not extended by I/O.
  try {
    await AuthService.instance.restoreSession();
  } catch (_) {
    await AuthService.instance.clearSession();
  }

  // Any authenticated request that comes back 401 means the Sanctum token is
  // gone: clear the saved session and return to Login.
  var handlingUnauthorized = false;
  ApiService.onUnauthorized = () {
    if (handlingUnauthorized) return;
    handlingUnauthorized = true;
    unawaited(() async {
      await AuthService.instance.clearSession();
      mimooNavigatorKey.currentState?.pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const LoginPage()),
        (route) => false,
      );
      handlingUnauthorized = false;
    }());
  };

  runApp(const MimooCourierApp());
}

class MimooCourierApp extends StatelessWidget {
  const MimooCourierApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: kAppName,
      debugShowCheckedModeBanner: false,
      navigatorKey: mimooNavigatorKey,
      theme: mimooTheme(),
      home: const SplashPage(),
    );
  }
}
