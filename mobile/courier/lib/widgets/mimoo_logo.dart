import 'package:flutter/material.dart';
import '../theme/mimoo_theme.dart';

/// Mimoo logo displayed against a dark-purple background.
///
/// Use on SplashPage and LoginPage headers.
/// The background colour [kPrimary] matches the buyer app's auth header
/// so the white logo contrasts correctly.
class MimooLogo extends StatelessWidget {
  const MimooLogo({
    super.key,
    this.size = 72,
    this.showTagline = false,
  });

  final double size;
  final bool showTagline;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Image.asset(
          'assets/images/logo.png',
          width: size,
          height: size,
          fit: BoxFit.contain,
          semanticLabel: 'Mimoo logo',
        ),
        if (showTagline) ...[
          const SizedBox(height: 10),
          Text(
            kTagline,
            style: pjs(
              size: 11,
              color: Colors.white.withValues(alpha: 0.75),
              height: 1.4,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ],
    );
  }
}
