import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../core/theme.dart';
import 'motion.dart';

/// Shows a short success overlay (animated check + light confetti) and
/// closes itself. Reduced motion: static check, shorter hold.
Future<void> showSuccess(BuildContext context,
    {required String title, String? subtitle}) {
  final reduced = reduceMotion(context);
  return showGeneralDialog<void>(
    context: context,
    barrierDismissible: true,
    barrierLabel: title,
    barrierColor: Colors.black.withValues(alpha: 0.35),
    transitionDuration:
        reduced ? Duration.zero : const Duration(milliseconds: 220),
    pageBuilder: (dialogContext, _, __) => _SuccessDialog(
      title: title,
      subtitle: subtitle,
      hold: reduced
          ? const Duration(milliseconds: 900)
          : const Duration(milliseconds: 1700),
      reduced: reduced,
    ),
    transitionBuilder: (context, anim, _, child) => FadeTransition(
      opacity: anim,
      child: ScaleTransition(
          scale: Tween(begin: 0.92, end: 1.0).animate(anim), child: child),
    ),
  );
}

class _SuccessDialog extends StatefulWidget {
  const _SuccessDialog(
      {required this.title,
      required this.subtitle,
      required this.hold,
      required this.reduced});
  final String title;
  final String? subtitle;
  final Duration hold;
  final bool reduced;
  @override
  State<_SuccessDialog> createState() => _SuccessDialogState();
}

class _SuccessDialogState extends State<_SuccessDialog>
    with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController(
      vsync: this, duration: const Duration(milliseconds: 1100));

  @override
  void initState() {
    super.initState();
    if (widget.reduced) {
      _c.value = 1;
    } else {
      _c.forward();
    }
    Future<void>.delayed(widget.hold, () {
      if (mounted) Navigator.of(context).maybePop();
    });
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = MC.of(context);
    return Center(
      child: Material(
        color: c.lowest,
        borderRadius: BorderRadius.circular(24),
        elevation: 8,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(28, 24, 28, 24),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            SizedBox(
              width: 140,
              height: 120,
              child: AnimatedBuilder(
                animation: _c,
                builder: (context, _) => CustomPaint(
                  painter: _CheckBurstPainter(
                    t: _c.value,
                    check: c.green,
                    confetti: [c.green, MC.coral, MC.violet, c.amberText],
                    showConfetti: !widget.reduced,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 8),
            Text(widget.title,
                textAlign: TextAlign.center,
                style: ts(18, w: FontWeight.w800, c: c.text)),
            if (widget.subtitle != null) ...[
              const SizedBox(height: 4),
              ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 240),
                child: Text(widget.subtitle!,
                    textAlign: TextAlign.center,
                    style: ts(13, c: c.muted, h: 1.4)),
              ),
            ],
          ]),
        ),
      ),
    );
  }
}

class _CheckBurstPainter extends CustomPainter {
  _CheckBurstPainter({
    required this.t,
    required this.check,
    required this.confetti,
    required this.showConfetti,
  });
  final double t;
  final Color check;
  final List<Color> confetti;
  final bool showConfetti;

  static final _rng = math.Random(7);
  static final _particles = List.generate(
    18,
    (i) => (
      angle: (i / 18) * math.pi * 2 + _rng.nextDouble() * 0.3,
      dist: 0.75 + _rng.nextDouble() * 0.35,
      size: 3.0 + _rng.nextDouble() * 3,
      rect: _rng.nextBool(),
    ),
  );

  @override
  void paint(Canvas canvas, Size size) {
    final center = size.center(Offset.zero);
    const r = 38.0;

    // Circle fill pops in (0–0.35).
    final pop = Curves.easeOutBack.transform((t / 0.35).clamp(0.0, 1.0));
    canvas.drawCircle(
        center, r * pop, Paint()..color = check.withValues(alpha: 0.14));

    // Ring draws (0.05–0.45).
    final ring = Curves.easeOut.transform(((t - 0.05) / 0.4).clamp(0.0, 1.0));
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: r),
      -math.pi / 2,
      math.pi * 2 * ring,
      false,
      Paint()
        ..color = check
        ..style = PaintingStyle.stroke
        ..strokeWidth = 4
        ..strokeCap = StrokeCap.round,
    );

    // Check mark draws (0.35–0.7).
    final k = Curves.easeOut.transform(((t - 0.35) / 0.35).clamp(0.0, 1.0));
    if (k > 0) {
      final a = center + const Offset(-15, 1);
      final b = center + const Offset(-4, 12);
      final cpt = center + const Offset(17, -11);
      final path = Path()..moveTo(a.dx, a.dy);
      if (k <= 0.4) {
        final p = Offset.lerp(a, b, k / 0.4)!;
        path.lineTo(p.dx, p.dy);
      } else {
        path.lineTo(b.dx, b.dy);
        final p = Offset.lerp(b, cpt, (k - 0.4) / 0.6)!;
        path.lineTo(p.dx, p.dy);
      }
      canvas.drawPath(
        path,
        Paint()
          ..color = check
          ..style = PaintingStyle.stroke
          ..strokeWidth = 5
          ..strokeCap = StrokeCap.round
          ..strokeJoin = StrokeJoin.round,
      );
    }

    // Confetti-lite (0.3–1.0): particles fly out and fade.
    if (!showConfetti) return;
    final f = ((t - 0.3) / 0.7).clamp(0.0, 1.0);
    if (f <= 0) return;
    final travel = Curves.easeOutCubic.transform(f);
    for (var i = 0; i < _particles.length; i++) {
      final p = _particles[i];
      final d = r + (size.width / 2 - r) * p.dist * travel;
      final pos = center +
          Offset(math.cos(p.angle) * d, math.sin(p.angle) * d + 10 * f * f);
      final paint = Paint()
        ..color = confetti[i % confetti.length].withValues(alpha: 1 - f);
      if (p.rect) {
        canvas.save();
        canvas.translate(pos.dx, pos.dy);
        canvas.rotate(p.angle + f * 4);
        canvas.drawRect(
            Rect.fromCenter(
                center: Offset.zero, width: p.size * 1.6, height: p.size),
            paint);
        canvas.restore();
      } else {
        canvas.drawCircle(pos, p.size / 2, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _CheckBurstPainter old) => old.t != t;
}
