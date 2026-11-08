import 'package:flutter/material.dart';
import 'pages/splash_page.dart';
import 'theme/mimoo_theme.dart';

void main() {
  runApp(const MimooCourierApp());
}

class MimooCourierApp extends StatelessWidget {
  const MimooCourierApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: kAppName,
      debugShowCheckedModeBanner: false,
      theme: mimooTheme(),
      home: const SplashPage(),
    );
  }
}
