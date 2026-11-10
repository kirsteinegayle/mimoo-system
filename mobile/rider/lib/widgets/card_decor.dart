import 'dart:math' as math;

import 'package:flutter/material.dart';

import 'motion.dart';

/// Background pattern drawn behind a [DecorCard]'s content.
enum DecorPattern { dots, wave }

/// Card with a soft gradient fill and faint decorative shapes (corner
/// circles, a dotted or wave pattern and a big icon watermark), all clipped
/// to the card radius. Enters with a light fade + scale and the shapes float
/// very slowly. Both animations are skipped when
/// [MediaQueryData.disableAnimations] is on.
class DecorCard extends StatefulWidget {
  const DecorCard({
    super.key,
    required this.child,
    required this.colors,
    required this.accent,
    this.watermark,
    this.watermarkSize = 64,
    this.pattern = DecorPattern.dots,
    this.radius = 18,
    this.padding = const EdgeInsets.all(16),
    this.onTap,
    this.delay = Duration.zero,
  });

  final Widget child;

  /// Gradient stops, top-left to bottom-right. Use light tints.
  final List<Color> colors;

  /// Colour of the decorative shapes (drawn at low opacity).
  final Color accent;
  final IconData? watermark;
  final double watermarkSize;
  final DecorPattern pattern;
  final double radius;
  final EdgeInsets padding;
  final VoidCallback? onTap;
  final Duration delay;

  @override
  State<DecorCard> createState() => _DecorCardState();
}

class _DecorCardState extends State<DecorCard> with TickerProviderStateMixin {
  late final AnimationController _enter = AnimationController(
      vsync: this, duration: const Duration(milliseconds: 520));
  late final Animation<double> _enterCurve =
      CurvedAnimation(parent: _enter, curve: Curves.easeOutCubic);

  /// One full float cycle. Very slow on purpose.
  late final AnimationController _float = AnimationController(
      vsync: this, duration: const Duration(seconds: 12));

  bool _started = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (reduceMotion(context)) {
      _enter.value = 1;
      _float.stop();
      _started = true;
      return;
    }
    if (!_float.isAnimating) _float.repeat();
    if (_started) return;
    _started = true;
    Future<void>.delayed(widget.delay, () {
      if (mounted) _enter.forward();
    });
  }

  @override
  void dispose() {
    _enter.dispose();
    _float.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final r = BorderRadius.circular(widget.radius);
    final accent = widget.accent;
    final card = DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: r,
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: widget.colors,
        ),
        border: Border.all(color: accent.withValues(alpha: 0.16)),
        boxShadow: [
          BoxShadow(
              color: accent.withValues(alpha: 0.10),
              blurRadius: 14,
              offset: const Offset(0, 4)),
        ],
      ),
      child: ClipRRect(
        borderRadius: r,
        child: Material(
          type: MaterialType.transparency,
          child: InkWell(
            onTap: widget.onTap,
            borderRadius: r,
            child: Stack(children: [
              Positioned.fill(
                child: IgnorePointer(
                  child: RepaintBoundary(
                    child: CustomPaint(
                      painter: _DecorPainter(
                          float: _float,
                          accent: accent,
                          pattern: widget.pattern),
                    ),
                  ),
                ),
              ),
              if (widget.watermark != null)
                Positioned(
                  right: -widget.watermarkSize * 0.18,
                  bottom: -widget.watermarkSize * 0.2,
                  child: IgnorePointer(
                    child: AnimatedBuilder(
                      animation: _float,
                      builder: (context, child) {
                        final a = _float.value * 2 * math.pi;
                        return Transform.translate(
                          offset: Offset(math.cos(a) * 2, math.sin(a) * 3),
                          child: Transform.rotate(
                              angle: -0.18 + math.sin(a) * 0.03,
                              child: child),
                        );
                      },
                      child: ExcludeSemantics(
                        child: Icon(widget.watermark,
                            size: widget.watermarkSize,
                            color: accent.withValues(alpha: 0.08)),
                      ),
                    ),
                  ),
                ),
              Padding(padding: widget.padding, child: widget.child),
            ]),
          ),
        ),
      ),
    );
    return AnimatedBuilder(
      animation: _enterCurve,
      child: card,
      builder: (context, child) => Opacity(
        opacity: _enterCurve.value,
        child: Transform.scale(
            scale: 0.95 + 0.05 * _enterCurve.value, child: child),
      ),
    );
  }
}

/// Faint corner circles plus a dotted grid or a soft double wave.
class _DecorPainter extends CustomPainter {
  _DecorPainter(
      {required this.float, required this.accent, required this.pattern})
      : super(repaint: float);

  final Animation<double> float;
  final Color accent;
  final DecorPattern pattern;

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width, h = size.height;
    final a = float.value * 2 * math.pi;
    final dx = math.sin(a) * 4, dy = math.cos(a) * 3;
    final fill = Paint()..style = PaintingStyle.fill;

    // Large faint circles in the top-right corner.
    final big = math.max(w, h) * 0.55;
    fill.color = accent.withValues(alpha: 0.07);
    canvas.drawCircle(Offset(w + big * 0.15 + dx, -big * 0.2 + dy), big, fill);
    fill.color = accent.withValues(alpha: 0.06);
    canvas.drawCircle(
        Offset(w - big * 0.55 - dx, -big * 0.45 - dy * 0.6), big * 0.55, fill);
    // Hollow ring for depth.
    canvas.drawCircle(
      Offset(w + big * 0.05 - dx * 0.5, -big * 0.1 + dy * 0.5),
      big * 1.25,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.2
        ..color = accent.withValues(alpha: 0.08),
    );

    switch (pattern) {
      case DecorPattern.dots:
        // Dotted grid fading out from the bottom-left corner.
        const gap = 10.0;
        final cols = (w * 0.45 / gap).floor();
        final rows = (h * 0.5 / gap).floor();
        for (var i = 0; i < cols; i++) {
          for (var j = 0; j < rows; j++) {
            final fade = 1 - (i / cols + j / rows) / 2;
            fill.color = accent.withValues(alpha: 0.16 * fade);
            canvas.drawCircle(
                Offset(8 + i * gap + dx * 0.4, h - 8 - j * gap + dy * 0.4),
                1.1,
                fill);
          }
        }
      case DecorPattern.wave:
        final stroke = Paint()
          ..style = PaintingStyle.stroke
          ..strokeWidth = 1.4;
        for (var k = 0; k < 2; k++) {
          final base = h * (0.78 + k * 0.1);
          final amp = h * 0.06;
          final path = Path()..moveTo(0, base);
          for (var x = 0.0; x <= w; x += 4) {
            path.lineTo(
                x, base + math.sin(x / w * 2 * math.pi + a + k) * amp);
          }
          stroke.color = accent.withValues(alpha: 0.12 - k * 0.04);
          canvas.drawPath(path, stroke);
        }
    }
  }

  @override
  bool shouldRepaint(_DecorPainter old) =>
      old.accent != accent || old.pattern != pattern || old.float != float;
}
