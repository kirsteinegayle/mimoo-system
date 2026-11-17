import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

// ── Brand colours ──────────────────────────────────────────────────────────
/// Deep purple — primary brand, headers, buttons.
const kPrimary = Color(0xFF34175B);

/// Medium purple — accents, links, highlights.
const kSecondary = Color(0xFF6B38D4);

/// Flash red — sale prices, alerts, errors.
const kFlash = Color(0xFFFF3B5C);

/// Light purple surface — page backgrounds, cards.
const kSurface = Color(0xFFF5F4FC);

/// White — card backgrounds.
const kCard = Color(0xFFFFFFFF);

/// Chip / selection background — very light purple.
const kChip = Color(0xFFEFE9FD);

/// Divider / border colour.
const kBorder = Color(0xFFDDD8F0);

/// Primary text — near black.
const kText = Color(0xFF1A1035);

/// Secondary text — muted purple-grey.
// Secondary text. Was 0xFF8A84A3 (3.6:1 on white, below WCAG AA); now 5.6:1.
const kSubtext = Color(0xFF6B6585);

/// Success green.
const kGreen = Color(0xFF1DB966);

// ── AA-safe TEXT colours ───────────────────────────────────────────────────
// kFlash (3.5:1), kGreen (2.6:1) and orange (2.2:1) fail WCAG AA as small text on white.
// Fills, icons and borders keep the brand colours; TEXT in those colours uses these darker
// shades (all >= 5.5:1 on white and on the tinted badge backgrounds). pjs() and the status
// badges apply [aaText] automatically.
const kFlashText = Color(0xFFA8102F);
const kGreenText = Color(0xFF0B6B3A);
const kWarnText = Color(0xFF8A4B00);

/// Darker text shade for the brand red / green / orange; any other colour is returned unchanged.
Color aaText(Color c) {
  final v = c.toARGB32();
  if (v == kFlash.toARGB32()) return kFlashText;
  if (v == kGreen.toARGB32()) return kGreenText;
  // Material orange family (orange, shade600/700/800) -> warn text
  if (v == 0xFFFF9800 || v == 0xFFFB8C00 || v == 0xFFF57C00 || v == 0xFFEF6C00) return kWarnText;
  return c;
}

// ── Brand name & tagline ───────────────────────────────────────────────────
const kAppName = 'Mimoo Courier';
const kTagline = 'A Little Bit of Everything, Just a Moo Away';

// ── Text style helper ──────────────────────────────────────────────────────
TextStyle pjs({
  double size = 14,
  FontWeight weight = FontWeight.w400,
  Color color = kText,
  double? height,
  TextDecoration? decoration,
}) =>
    GoogleFonts.plusJakartaSans(
      fontSize: size,
      fontWeight: weight,
      color: aaText(color),
      height: height,
      decoration: decoration,
    );

// ── Input decoration helper ────────────────────────────────────────────────
InputDecoration mimooInput({
  required String hint,
  IconData? icon,
  Widget? suffix,
  String? error,
}) {
  return InputDecoration(
    hintText: hint,
    hintStyle: pjs(size: 13, color: kSubtext),
    prefixIcon: icon != null ? Icon(icon, size: 19, color: kSubtext) : null,
    suffixIcon: suffix,
    errorText: error,
    errorStyle: pjs(size: 11, color: kFlash),
    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    filled: true,
    fillColor: kSurface,
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: kBorder),
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: kBorder),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: kSecondary, width: 1.5),
    ),
    errorBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: kFlash),
    ),
    focusedErrorBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: kFlash, width: 1.5),
    ),
  );
}

// ── ThemeData ──────────────────────────────────────────────────────────────
ThemeData mimooTheme() {
  return ThemeData(
    colorScheme: ColorScheme.fromSeed(
      seedColor: kPrimary,
      primary: kPrimary,
      secondary: kSecondary,
    ),
    scaffoldBackgroundColor: kSurface,
    appBarTheme: AppBarTheme(
      backgroundColor: kCard,
      elevation: 0,
      iconTheme: const IconThemeData(color: kText),
      titleTextStyle: pjs(size: 17, weight: FontWeight.w800, color: kText),
    ),
    textTheme: GoogleFonts.plusJakartaSansTextTheme(),
    useMaterial3: true,
  );
}
