import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import '../theme/mimoo_brand.dart';

/// Reusable Mimoo logo (assets/images/logo.png, 310×240).
///
/// The current logo has an opaque dark-purple gradient background, so:
///  * on matching dark surfaces (splash, auth headers) use the default —
///    edges are feathered so it melts into a [background] of the same colour;
///  * on light surfaces use [framed] — a rounded (r=12) tile with a soft
///    shadow so the dark box looks intentional.
/// [background] is a parameter so it can be changed (or set transparent)
/// once a transparent logo exists.
class MimooLogo extends StatelessWidget {
  const MimooLogo({
    super.key,
    this.size = 120,
    this.background = MimooBrand.logoBg,
    this.framed = false,
    this.feather = true,
    this.heroTag,
  });

  /// Width in logical pixels (height follows the 310:240 aspect ratio).
  final double size;
  final Color background;
  final bool framed;
  final bool feather;

  /// Set to share the logo across routes (splash → login).
  final Object? heroTag;

  static const _aspect = 310 / 240;

  /// Decode the logo ahead of time (splash) so it never flickers.
  static Future<void> precache(BuildContext context) =>
      precacheImage(const AssetImage(MimooBrand.logoAsset), context);

  @override
  Widget build(BuildContext context) {
    final h = size / _aspect;
    Widget img = Image.asset(
      MimooBrand.logoAsset,
      width: size,
      height: h,
      fit: BoxFit.cover,
      gaplessPlayback: true,
      filterQuality: FilterQuality.medium,
      errorBuilder: (_, __, ___) => SizedBox(
        width: size,
        height: h,
        child: Center(
          child: Text(
            'mimoo',
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w800,
              fontSize: size / 5,
              letterSpacing: 1,
            ),
          ),
        ),
      ),
    );

    if (framed) {
      // Tile in the logo's own ink colour, radius 12, hairline light border
      // and a soft brand shadow: reads as an intentional badge on light
      // surfaces and blends with the dark headers.
      img = Container(
        width: size,
        height: h,
        decoration: BoxDecoration(
          color: background,
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(color: Colors.white.withValues(alpha: 0.10)),
          boxShadow: AppShadows.soft,
        ),
        clipBehavior: Clip.antiAlias,
        child: img,
      );
    } else if (feather) {
      // Soft elliptical fade of the logo's own dark background, so it melts
      // into whatever same-coloured surface is behind it (header / splash
      // gradient) instead of showing a hard-edged box.
      img = ShaderMask(
        blendMode: BlendMode.dstIn,
        shaderCallback: (r) => const RadialGradient(
          radius: 0.72,
          colors: [Colors.white, Colors.white, Colors.transparent],
          stops: [0.0, 0.62, 1.0],
        ).createShader(r),
        child: img,
      );
    } else {
      img = ColoredBox(color: background, child: img);
    }

    if (heroTag != null) {
      img = Hero(tag: heroTag!, child: img);
    }
    return Semantics(label: 'Mimoo logo', image: true, child: img);
  }
}
