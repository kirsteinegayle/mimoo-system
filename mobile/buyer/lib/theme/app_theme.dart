import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Single source of truth for the Mimoo buyer app look:
/// colours, text styles, spacing, radius, shadows and the [ThemeData].
///
/// Palette is derived from assets/images/logo.png (sampled 2026-11-10):
///   logo tile   #181329 (left edge) → #1F1931 (centre) → #2C2442 (right edge)
///   lettering   #F3F2F4 (off-white)
/// The logo has no saturated accent, so the brand purple is kept and pulled
/// toward the logo's dark indigo; the logo's own dark tone is used for every
/// branded header so the logo tile sits on a matching background.
class AppColors {
  AppColors._();

  // ── Logo family (dark indigo) ────────────────────────────────────────────
  static const logoInkLeft = Color(0xFF181329);
  static const logoInk = Color(0xFF1F1931);
  static const logoInkRight = Color(0xFF2C2442);
  static const logoText = Color(0xFFF3F2F4);

  // ── Brand purples ────────────────────────────────────────────────────────
  /// Primary brand colour: buttons, active states, headings on light bg.
  /// White on it = 13.6:1.
  static const primary = Color(0xFF2E1A52);

  /// Deepest brand shade (gradients, pressed states).
  static const primaryDeep = Color(0xFF1E0F3A);

  /// Mid purple used in gradients (member zone, cards).
  static const primaryMid = Color(0xFF45277A);

  /// Vivid accent: links, highlights, selected chips. On white = 6.7:1.
  static const accent = Color(0xFF6B38D4);
  static const accentLight = Color(0xFF8455EF);
  static const violet = Color(0xFF8B5CF6);

  /// Soft lilac: tagline on dark, chips, active nav pill.
  static const accentSoft = Color(0xFFD7BAFF);
  static const chip = Color(0xFFEFE9FD);

  // ── Neutrals ─────────────────────────────────────────────────────────────
  static const background = Color(0xFFFAF8FE);
  static const surface = Color(0xFFF5F4FC);
  static const card = Color(0xFFFFFFFF);
  static const inputFill = Color(0xFFF5F3FA);
  static const border = Color(0xFFDDD8F0);
  static const outline = Color(0xFF7B7580);
  static const outlineVariant = Color(0xFFCCC4D1);
  static const skeletonBase = Color(0xFFE8E4F0);
  static const skeletonHighlight = Color(0xFFF5F3FC);

  /// Body text. On white = 17:1.
  static const text = Color(0xFF1A1035);
  static const onSurface = Color(0xFF1B1B20);
  static const onSurfaceVariant = Color(0xFF4A454F);

  /// Secondary text. Darkened from #8A84A3 (3.6:1) to pass WCAG AA (5.4:1).
  static const textMuted = Color(0xFF6B6585);

  /// Text on dark (logo-ink) headers.
  static const onDark = Color(0xFFFFFFFF);
  static const onDarkMuted = Color(0xFFC9C2DC);

  // ── Status ───────────────────────────────────────────────────────────────
  static const flash = Color(0xFFFF3B5C);
  static const success = Color(0xFF1DB966);
  static const orange = Color(0xFFFF6B00);
  static const warning = Color(0xFFF59E0B);
  static const warningBg = Color(0xFFFFF8E7);
  static const warningBorder = Color(0xFFFFE0A0);
  static const warningText = Color(0xFF7A4F00);
  static const error = Color(0xFFBA1A1A);
  static const errorContainer = Color(0xFFFFDAD6);
  static const info = Color(0xFF0066CC);
  static const star = Color(0xFFFFC107);
  static const starDeep = Color(0xFFFFB300);
  static const errorSoft = Color(0xFFFFEBEE);
  static const errorLight = Color(0xFFE57373);

  // ── Translucent tints (const so they work in const widgets) ──────────────
  static const primaryA05 = Color(0x0D2E1A52);
  static const primaryA10 = Color(0x1A2E1A52);
  static const primaryA12 = Color(0x202E1A52);
  static const shadowBrand = Color(0x1F2E1A52);
  static const shadowSoft = Color(0x1A000000);
  static const shadowNav = Color(0x14000000);

  /// Branded header background: same family as the logo tile.
  static const headerGradient = LinearGradient(
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
    colors: [logoInkLeft, logoInk, logoInkRight],
  );

  static const memberGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [logoInk, primaryMid],
  );
}

class AppSpacing {
  AppSpacing._();
  static const double xxs = 2;
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 20;
  static const double xxl = 24;
  static const double xxxl = 32;

  /// Horizontal page gutter.
  static const double gutter = 16;

  /// Minimum tap target.
  static const double tap = 44;
}

class AppRadius {
  AppRadius._();
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 24;
  static const double pill = 9999;

  static final card = BorderRadius.circular(lg);
  static final tile = BorderRadius.circular(md);
}

class AppShadows {
  AppShadows._();
  static const card = [
    BoxShadow(color: AppColors.shadowBrand, blurRadius: 16, offset: Offset(0, 4)),
  ];
  static const soft = [
    BoxShadow(color: AppColors.shadowSoft, blurRadius: 8, offset: Offset(0, 2)),
  ];
  static const nav = [
    BoxShadow(color: AppColors.shadowNav, blurRadius: 12, offset: Offset(0, -2)),
  ];
}

/// Durations: quick feedback stays ≤ 300 ms.
class AppDurations {
  AppDurations._();
  static const press = Duration(milliseconds: 110);
  static const fast = Duration(milliseconds: 200);
  static const medium = Duration(milliseconds: 280);
  static const page = Duration(milliseconds: 300);
}

/// Text styles (Plus Jakarta Sans).
class AppText {
  AppText._();

  static TextStyle style({
    double size = 14,
    FontWeight weight = FontWeight.w400,
    Color color = AppColors.text,
    double? height,
    FontStyle? fontStyle,
    double? letterSpacing,
    TextDecoration? decoration,
  }) =>
      GoogleFonts.plusJakartaSans(
        fontSize: size,
        fontWeight: weight,
        color: color,
        height: height,
        fontStyle: fontStyle,
        letterSpacing: letterSpacing,
        decoration: decoration,
      );

  static TextStyle get h1 => style(size: 24, weight: FontWeight.w800);
  static TextStyle get h2 => style(size: 20, weight: FontWeight.w800);
  static TextStyle get title => style(size: 16, weight: FontWeight.w800);
  static TextStyle get section => style(size: 15, weight: FontWeight.w800);
  static TextStyle get body => style(size: 14);
  static TextStyle get bodyMuted => style(size: 13, color: AppColors.textMuted);
  static TextStyle get label => style(size: 13, weight: FontWeight.w600);
  static TextStyle get caption =>
      style(size: 11.5, weight: FontWeight.w600, color: AppColors.textMuted);
}

/// App-wide [ThemeData].
ThemeData buildAppTheme() {
  const scheme = ColorScheme(
    brightness: Brightness.light,
    primary: AppColors.primary,
    onPrimary: Colors.white,
    primaryContainer: AppColors.primary,
    onPrimaryContainer: AppColors.accentSoft,
    secondary: AppColors.accent,
    onSecondary: Colors.white,
    secondaryContainer: AppColors.accentLight,
    onSecondaryContainer: Colors.white,
    tertiary: AppColors.flash,
    onTertiary: Colors.white,
    tertiaryContainer: Color(0xFF570014),
    onTertiaryContainer: Color(0xFFFF4B65),
    error: AppColors.error,
    onError: Colors.white,
    errorContainer: AppColors.errorContainer,
    onErrorContainer: Color(0xFF93000A),
    surface: AppColors.background,
    onSurface: AppColors.onSurface,
    onSurfaceVariant: AppColors.onSurfaceVariant,
    outline: AppColors.outline,
    outlineVariant: AppColors.outlineVariant,
    shadow: Colors.black,
    scrim: Colors.black,
    inverseSurface: Color(0xFF303035),
    onInverseSurface: Color(0xFFF2F0F6),
    inversePrimary: AppColors.accentSoft,
  );

  // Fade + slight upward slide for every MaterialPageRoute (built-in only).
  const transitions = PageTransitionsTheme(builders: {
    TargetPlatform.android: _MimooPageTransitionsBuilder(),
    TargetPlatform.iOS: _MimooPageTransitionsBuilder(),
    TargetPlatform.windows: _MimooPageTransitionsBuilder(),
    TargetPlatform.macOS: _MimooPageTransitionsBuilder(),
    TargetPlatform.linux: _MimooPageTransitionsBuilder(),
    TargetPlatform.fuchsia: _MimooPageTransitionsBuilder(),
  });

  return ThemeData(
    colorScheme: scheme,
    useMaterial3: true,
    textTheme: GoogleFonts.plusJakartaSansTextTheme(),
    scaffoldBackgroundColor: AppColors.background,
    pageTransitionsTheme: transitions,
    appBarTheme: AppBarTheme(
      backgroundColor: AppColors.card,
      foregroundColor: AppColors.primary,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      scrolledUnderElevation: 0.5,
      titleTextStyle: AppText.style(size: 18, weight: FontWeight.w800),
    ),
    cardTheme: CardThemeData(
      color: AppColors.card,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: AppRadius.card),
    ),
    dividerTheme: const DividerThemeData(color: AppColors.border, thickness: 1, space: 1),
    snackBarTheme: SnackBarThemeData(
      behavior: SnackBarBehavior.floating,
      backgroundColor: AppColors.primary,
      contentTextStyle: AppText.style(size: 13, weight: FontWeight.w600, color: Colors.white),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.md)),
    ),
    dialogTheme: DialogThemeData(
      backgroundColor: AppColors.card,
      surfaceTintColor: Colors.transparent,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.xl)),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: AppColors.primary,
        minimumSize: const Size(64, AppSpacing.tap),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.pill)),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.primary,
        minimumSize: const Size(64, AppSpacing.tap),
        side: const BorderSide(color: AppColors.border),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.pill)),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(foregroundColor: AppColors.accent),
    ),
    progressIndicatorTheme: const ProgressIndicatorThemeData(color: AppColors.accent),
    checkboxTheme: CheckboxThemeData(
      fillColor: WidgetStateProperty.resolveWith(
          (s) => s.contains(WidgetState.selected) ? AppColors.primary : null),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
    ),
  );
}

class _MimooPageTransitionsBuilder extends PageTransitionsBuilder {
  const _MimooPageTransitionsBuilder();

  @override
  Widget buildTransitions<T>(
    PageRoute<T> route,
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    if (MediaQuery.maybeDisableAnimationsOf(context) ?? false) return child;
    final curved = CurvedAnimation(parent: animation, curve: Curves.easeOutCubic);
    return FadeTransition(
      opacity: curved,
      child: SlideTransition(
        position: Tween(begin: const Offset(0, 0.04), end: Offset.zero).animate(curved),
        child: child,
      ),
    );
  }
}
