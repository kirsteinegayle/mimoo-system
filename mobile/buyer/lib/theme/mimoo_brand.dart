import 'package:flutter/material.dart';

/// Mimoo brand constants shared by the splash, auth pages and logo widget.
/// Purples follow the existing app theme (main.dart ColorScheme / shop
/// MimooColors); the logo* colours are sampled from the edges of
/// assets/images/logo.png so the (non-transparent) logo blends in.
class MimooBrand {
  MimooBrand._();

  static const name = 'Mimoo';
  static const tagline = 'A Little Bit of Everything, Just a Moo Away';
  static const logoAsset = 'assets/images/logo.png';

  // ── Logo background (sampled from logo.png edges) ────────────────────────
  static const logoEdgeLeft = Color(0xFF181329);
  static const logoEdgeRight = Color(0xFF2B2340);
  static const logoBg = Color(0xFF1F1931); // centre-edge average

  /// Header / splash background — same family as the logo so it doesn't
  /// look like a box.
  static const headerGradient = LinearGradient(
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
    colors: [logoEdgeLeft, logoBg, logoEdgeRight],
  );

  // ── App theme colours (existing) ──────────────────────────────────────────
  static const primary = Color(0xFF34175B);
  static const accent = Color(0xFF6B38D4);
  static const accentSoft = Color(0xFFD7BAFF); // inversePrimary in main.dart
  static const surface = Color(0xFFF5F4FC);
  static const card = Colors.white;
  static const inputFill = Color(0xFFF5F3FA);
  static const border = Color(0xFFDDD8F0);
  static const text = Color(0xFF1A1035);
  static const subtext = Color(0xFF8A84A3);
  static const error = Color(0xFFBA1A1A);
}
