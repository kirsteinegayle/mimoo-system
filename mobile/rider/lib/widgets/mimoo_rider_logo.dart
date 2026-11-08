import 'package:flutter/material.dart';

/// Mimoo Rider logo widget for use on the login and splash screens.
///
/// Uses `mimoo_rider_logo.png` — a transparent PNG where the ink is #111111
/// and the original light background has been removed. This lets the logo
/// sit naturally on any coloured background without the white box visible
/// in the old ClipOval approach.
///
/// [width] sets the rendered width; height scales proportionally (310×240 px).
class MimooRiderLogo extends StatelessWidget {
  const MimooRiderLogo({
    super.key,
    this.width = 182,
    this.onLongPress,
  });

  final double width;
  final VoidCallback? onLongPress;

  @override
  Widget build(BuildContext context) {
    // Original PNG is 310×240. Keep that aspect ratio.
    final height = width * 240 / 310;

    final img = Image.asset(
      'assets/images/mimoo_rider_logo.png',
      width: width,
      height: height,
      fit: BoxFit.contain,
      semanticLabel: 'Mimoo Rider',
    );

    if (onLongPress == null) return img;
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onLongPress: onLongPress,
      child: img,
    );
  }
}
