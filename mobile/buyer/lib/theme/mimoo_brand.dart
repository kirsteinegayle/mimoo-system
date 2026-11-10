import 'package:flutter/material.dart';

import 'app_theme.dart';

/// Mimoo brand constants used by the splash, auth pages and logo widget.
/// All colours forward to [AppColors] (lib/theme/app_theme.dart), which is
/// the single source of truth.
class MimooBrand {
  MimooBrand._();

  static const name = 'Mimoo';
  static const tagline = 'A Little Bit of Everything, Just a Moo Away';
  static const logoAsset = 'assets/images/logo.png';

  // ── Logo background (sampled from logo.png edges) ────────────────────────
  static const logoEdgeLeft = AppColors.logoInkLeft;
  static const logoEdgeRight = AppColors.logoInkRight;
  static const logoBg = AppColors.logoInk;

  /// Header / splash background — same family as the logo.
  static const headerGradient = AppColors.headerGradient;

  // ── App theme colours ─────────────────────────────────────────────────────
  static const primary = AppColors.primary;
  static const accent = AppColors.accent;
  static const accentSoft = AppColors.accentSoft;
  static const surface = AppColors.surface;
  static const Color card = AppColors.card;
  static const inputFill = AppColors.inputFill;
  static const border = AppColors.border;
  static const text = AppColors.text;
  static const subtext = AppColors.textMuted;
  static const error = AppColors.error;
}
