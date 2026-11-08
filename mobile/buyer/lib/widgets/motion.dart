import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../theme/mimoo_brand.dart';

/// Shared, lightweight animations (built-in Flutter only).
/// Every widget here respects MediaQuery.disableAnimations (reduce motion):
/// when it is on, children render immediately with no motion.

bool reduceMotion(BuildContext context) =>
    MediaQuery.maybeDisableAnimationsOf(context) ?? false;

// ── Press effect ────────────────────────────────────────────────────────────

/// Scales the child down slightly while pressed. Uses a Listener, so the
/// child's own onTap / InkWell keep working unchanged.
class PressScale extends StatefulWidget {
  const PressScale({super.key, required this.child, this.scale = 0.96, this.enabled = true});
  final Widget child;
  final double scale;
  final bool enabled;

  @override
  State<PressScale> createState() => _PressScaleState();
}

class _PressScaleState extends State<PressScale> {
  bool _down = false;

  void _set(bool v) {
    if (_down != v && mounted) setState(() => _down = v);
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.enabled || reduceMotion(context)) return widget.child;
    return Listener(
      onPointerDown: (_) => _set(true),
      onPointerUp: (_) => _set(false),
      onPointerCancel: (_) => _set(false),
      child: AnimatedScale(
        scale: _down ? widget.scale : 1,
        duration: const Duration(milliseconds: 110),
        curve: Curves.easeOut,
        child: widget.child,
      ),
    );
  }
}

// ── Shake ───────────────────────────────────────────────────────────────────

/// Shakes horizontally whenever [trigger] changes (e.g. increment on error).
class ShakeOnChange extends StatefulWidget {
  const ShakeOnChange({super.key, required this.trigger, required this.child});
  final int trigger;
  final Widget child;

  @override
  State<ShakeOnChange> createState() => _ShakeOnChangeState();
}

class _ShakeOnChangeState extends State<ShakeOnChange> with SingleTickerProviderStateMixin {
  late final AnimationController _c =
      AnimationController(vsync: this, duration: const Duration(milliseconds: 420));

  @override
  void didUpdateWidget(ShakeOnChange old) {
    super.didUpdateWidget(old);
    if (old.trigger != widget.trigger && !reduceMotion(context)) {
      _c.forward(from: 0);
    }
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _c,
      child: widget.child,
      builder: (_, child) {
        final t = _c.value;
        final dx = math.sin(t * math.pi * 6) * 8 * (1 - t);
        return Transform.translate(offset: Offset(dx, 0), child: child);
      },
    );
  }
}

// ── Animated focus wrapper for inputs ───────────────────────────────────────

/// Adds a soft accent glow around a text field while it has focus.
class FocusGlow extends StatefulWidget {
  const FocusGlow({super.key, required this.child, this.radius = 14});
  final Widget child;
  final double radius;

  @override
  State<FocusGlow> createState() => _FocusGlowState();
}

class _FocusGlowState extends State<FocusGlow> {
  bool _focused = false;

  @override
  Widget build(BuildContext context) {
    final reduce = reduceMotion(context);
    return Focus(
      canRequestFocus: false,
      skipTraversal: true,
      onFocusChange: (f) => setState(() => _focused = f),
      child: AnimatedContainer(
        duration: reduce ? Duration.zero : const Duration(milliseconds: 200),
        curve: Curves.easeOut,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(widget.radius),
          boxShadow: _focused
              ? [
                  BoxShadow(
                    color: MimooBrand.accent.withValues(alpha: 0.18),
                    blurRadius: 12,
                    spreadRadius: 1,
                  ),
                ]
              : const [],
        ),
        child: widget.child,
      ),
    );
  }
}

/// Smoothly shows/hides an optional child (e.g. an inline error).
class AnimatedReveal extends StatelessWidget {
  const AnimatedReveal({super.key, required this.child});
  final Widget? child;

  @override
  Widget build(BuildContext context) {
    final d = reduceMotion(context) ? Duration.zero : const Duration(milliseconds: 220);
    return AnimatedSize(
      duration: d,
      curve: Curves.easeOutCubic,
      alignment: Alignment.topCenter,
      child: AnimatedSwitcher(
        duration: d,
        transitionBuilder: (c, a) => FadeTransition(opacity: a, child: c),
        child: child ?? const SizedBox(width: double.infinity),
      ),
    );
  }
}

// ── Success check ───────────────────────────────────────────────────────────

/// Shows an animated success check (circle pops in, tick draws itself) in a
/// small dialog, then closes by itself. Used after a correct OTP.
Future<void> showSuccessCheck(BuildContext context, String message) {
  final reduce = reduceMotion(context);
  return showGeneralDialog<void>(
    context: context,
    barrierDismissible: false,
    barrierColor: Colors.black38,
    transitionDuration: reduce ? Duration.zero : const Duration(milliseconds: 180),
    pageBuilder: (ctx, _, __) => _SuccessCheckDialog(message: message, reduce: reduce),
  );
}

class _SuccessCheckDialog extends StatefulWidget {
  const _SuccessCheckDialog({required this.message, required this.reduce});
  final String message;
  final bool reduce;

  @override
  State<_SuccessCheckDialog> createState() => _SuccessCheckDialogState();
}

class _SuccessCheckDialogState extends State<_SuccessCheckDialog>
    with SingleTickerProviderStateMixin {
  late final AnimationController _c =
      AnimationController(vsync: this, duration: const Duration(milliseconds: 750));

  @override
  void initState() {
    super.initState();
    if (widget.reduce) {
      _c.value = 1;
    } else {
      _c.forward();
    }
    Future.delayed(Duration(milliseconds: widget.reduce ? 700 : 1300), () {
      if (mounted) Navigator.of(context).pop();
    });
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final pop = CurvedAnimation(parent: _c, curve: const Interval(0, 0.5, curve: Curves.easeOutBack));
    final tick = CurvedAnimation(parent: _c, curve: const Interval(0.4, 1, curve: Curves.easeOut));
    return Center(
      child: Material(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(32, 28, 32, 24),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            ScaleTransition(
              scale: pop,
              child: Container(
                width: 72,
                height: 72,
                decoration: const BoxDecoration(color: Color(0xFF1DB966), shape: BoxShape.circle),
                child: AnimatedBuilder(
                  animation: tick,
                  builder: (_, __) => CustomPaint(painter: _TickPainter(tick.value)),
                ),
              ),
            ),
            const SizedBox(height: 14),
            Text(widget.message,
                style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: MimooBrand.text)),
          ]),
        ),
      ),
    );
  }
}

class _TickPainter extends CustomPainter {
  _TickPainter(this.t);
  final double t;

  @override
  void paint(Canvas canvas, Size size) {
    final p = Path()
      ..moveTo(size.width * 0.28, size.height * 0.52)
      ..lineTo(size.width * 0.44, size.height * 0.67)
      ..lineTo(size.width * 0.73, size.height * 0.37);
    final metric = p.computeMetrics().first;
    canvas.drawPath(
      metric.extractPath(0, metric.length * t),
      Paint()
        ..color = Colors.white
        ..style = PaintingStyle.stroke
        ..strokeWidth = 6
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round,
    );
  }

  @override
  bool shouldRepaint(_TickPainter old) => old.t != t;
}
