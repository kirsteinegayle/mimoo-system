import 'package:flutter/material.dart';

import '../core/app_info.dart';
import '../core/theme.dart';

/// Shared Mimoo wordmark used by the login and splash screens.
///
/// The logo image is presented inside a filled sphere (circle) using the brand
/// deep-violet colour, matching the Mimoo visual identity used across apps.
/// Change [kRiderLabel] to rename or blank the rider qualifier below it.
class MimooLogo extends StatelessWidget {
  const MimooLogo({
    super.key,
    this.size = 120,
    this.showRiderLabel = true,
    this.onLongPress,
  });

  /// Diameter of the sphere / overall width of the wordmark.
  final double size;
  final bool showRiderLabel;
  final VoidCallback? onLongPress;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    // Use the auth palette so the sphere colour stays consistent on the
    // always-light login/splash screens.
    final auth = MimooAuthColors.of(context);

    final content = Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // ── Sphere ─────────────────────────────────────────────────────────
        // The logo PNG has a solid (non-transparent) dark background, so we
        // use ClipOval to physically cut it into a circle, then place it over
        // the violet sphere so the corners of the PNG are hidden.
        SizedBox(
          width: size,
          height: size,
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Violet circle background (visible as the outer ring).
              Container(
                width: size,
                height: size,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: auth.primary, // deep violet — #4B2E8A
                ),
              ),
              // Logo clipped to a circle, slightly smaller so the violet
              // ring shows as a border around it.
              ClipOval(
                child: SizedBox(
                  width: size * 0.82,
                  height: size * 0.82,
                  child: Image.asset(
                    'assets/images/logo.png',
                    fit: BoxFit.cover,
                    semanticLabel: 'Mimoo',
                  ),
                ),
              ),
            ],
          ),
        ),
        // ── Rider label ────────────────────────────────────────────────────
        if (showRiderLabel && kRiderLabel.trim().isNotEmpty) ...[
          const SizedBox(height: 10),
          Text(
            kRiderLabel,
            style: theme.textTheme.labelMedium?.copyWith(
              color: theme.colorScheme.primary,
              fontWeight: FontWeight.w800,
              letterSpacing: 2.4,
            ),
          ),
        ],
      ],
    );
    if (onLongPress == null) return content;
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onLongPress: onLongPress,
      child: content,
    );
  }
}
