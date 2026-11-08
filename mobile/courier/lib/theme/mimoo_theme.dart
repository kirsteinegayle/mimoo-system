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
const kSubtext = Color(0xFF8A84A3);

/// Success green.
const kGreen = Color(0xFF1DB966);

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
      color: color,
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
