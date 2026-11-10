import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../core/theme.dart';

/// Shared motion helpers. Built-in Flutter animation only (no packages).
/// Every helper respects [MediaQueryData.disableAnimations].

bool reduceMotion(BuildContext context) =>
    MediaQuery.maybeDisableAnimationsOf(context) ?? false;

/// Scales a duration down to (almost) nothing when reduced motion is on.
Duration motion(BuildContext context, Duration d) =>
    reduceMotion(context) ? Duration.zero : d;

/// Fade + slide-up entrance, optionally delayed (for staggered lists).
class FadeSlideIn extends StatefulWidget {
  const FadeSlideIn({
    super.key,
    required this.child,
    this.delay = Duration.zero,
    this.duration = const Duration(milliseconds: 420),
    this.offset = 18,
  });

  /// Convenience for staggered children: index × 60ms.
  FadeSlideIn.stagger(int index,
      {super.key, required this.child, this.offset = 18})
      : delay = Duration(milliseconds: 60 * math.min(index, 10)),
        duration = const Duration(milliseconds: 420);

  final Widget child;
  final Duration delay;
  final Duration duration;
  final double offset;

  @override
  State<FadeSlideIn> createState() => _FadeSlideInState();
}

class _FadeSlideInState extends State<FadeSlideIn>
    with SingleTickerProviderStateMixin {
  late final AnimationController _c =
      AnimationController(vsync: this, duration: widget.duration);
  late final Animation<double> _t =
      CurvedAnimation(parent: _c, curve: Curves.easeOutCubic);
  bool _started = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_started) return;
    _started = true;
    if (reduceMotion(context)) {
      _c.value = 1;
      return;
    }
    Future<void>.delayed(widget.delay, () {
      if (mounted) _c.forward();
    });
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => AnimatedBuilder(
        animation: _t,
        child: widget.child,
        builder: (context, child) => Opacity(
          opacity: _t.value,
          child: Transform.translate(
            offset: Offset(0, widget.offset * (1 - _t.value)),
            child: child,
          ),
        ),
      );
}

/// Scales down slightly while pressed.
class PressScale extends StatefulWidget {
  const PressScale({super.key, required this.child, this.scale = 0.96});
  final Widget child;
  final double scale;
  @override
  State<PressScale> createState() => _PressScaleState();
}

class _PressScaleState extends State<PressScale> {
  bool _down = false;
  void _set(bool v) {
    if (_down != v) setState(() => _down = v);
  }

  @override
  Widget build(BuildContext context) => Listener(
        onPointerDown: (_) => _set(true),
        onPointerUp: (_) => _set(false),
        onPointerCancel: (_) => _set(false),
        child: AnimatedScale(
          scale: _down ? widget.scale : 1,
          duration: motion(context, const Duration(milliseconds: 110)),
          curve: Curves.easeOut,
          child: widget.child,
        ),
      );
}

/// Horizontal shake. Increment [trigger] to play once.
class Shake extends StatelessWidget {
  const Shake({super.key, required this.trigger, required this.child});
  final int trigger;
  final Widget child;
  @override
  Widget build(BuildContext context) {
    if (reduceMotion(context) || trigger == 0) return child;
    return TweenAnimationBuilder<double>(
      key: ValueKey(trigger),
      tween: Tween(begin: 0, end: 1),
      duration: const Duration(milliseconds: 420),
      builder: (context, t, child) => Transform.translate(
        offset: Offset(math.sin(t * math.pi * 6) * 10 * (1 - t), 0),
        child: child,
      ),
      child: child,
    );
  }
}

/// Animated number. [format] turns the current value into text.
class CountUp extends StatelessWidget {
  const CountUp(
      {super.key,
      required this.value,
      required this.format,
      required this.style});
  final double value;
  final String Function(double v) format;
  final TextStyle style;
  @override
  Widget build(BuildContext context) => TweenAnimationBuilder<double>(
        tween: Tween(begin: 0, end: value),
        duration: motion(context, const Duration(milliseconds: 900)),
        curve: Curves.easeOutCubic,
        builder: (context, v, _) => Text(format(v),
            maxLines: 1, overflow: TextOverflow.ellipsis, style: style),
      );
}

/// Small dot that gently pulses (for "ready" badges).
class PulseDot extends StatefulWidget {
  const PulseDot({super.key, required this.color, this.size = 8});
  final Color color;
  final double size;
  @override
  State<PulseDot> createState() => _PulseDotState();
}

class _PulseDotState extends State<PulseDot>
    with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController(
      vsync: this, duration: const Duration(milliseconds: 1400));

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (reduceMotion(context)) {
      _c.stop();
    } else if (!_c.isAnimating) {
      _c.repeat();
    }
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final s = widget.size;
    return SizedBox(
      width: s * 2,
      height: s * 2,
      child: AnimatedBuilder(
        animation: _c,
        builder: (context, _) => Stack(alignment: Alignment.center, children: [
          if (_c.isAnimating)
            Container(
              width: s + s * _c.value,
              height: s + s * _c.value,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: widget.color.withValues(alpha: 0.35 * (1 - _c.value)),
              ),
            ),
          Container(
            width: s,
            height: s,
            decoration:
                BoxDecoration(shape: BoxShape.circle, color: widget.color),
          ),
        ]),
      ),
    );
  }
}

/// Repeating soft scale/opacity pulse for any child.
class Pulse extends StatefulWidget {
  const Pulse({super.key, required this.child, this.enabled = true});
  final Widget child;
  final bool enabled;
  @override
  State<Pulse> createState() => _PulseState();
}

class _PulseState extends State<Pulse> with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController(
      vsync: this, duration: const Duration(milliseconds: 1200));

  void _sync() {
    if (widget.enabled && !reduceMotion(context)) {
      if (!_c.isAnimating) _c.repeat(reverse: true);
    } else {
      _c
        ..stop()
        ..value = 0;
    }
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _sync();
  }

  @override
  void didUpdateWidget(covariant Pulse oldWidget) {
    super.didUpdateWidget(oldWidget);
    _sync();
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => AnimatedBuilder(
        animation: _c,
        child: widget.child,
        builder: (context, child) => Transform.scale(
            scale: 1 + 0.02 * Curves.easeInOut.transform(_c.value),
            child: child),
      );
}

/// Count badge that pops when its value changes. Hidden at 0.
class PopBadge extends StatelessWidget {
  const PopBadge({super.key, required this.count, this.borderColor});
  final int count;
  final Color? borderColor;
  @override
  Widget build(BuildContext context) {
    if (count <= 0) return const SizedBox.shrink();
    final badge = Container(
      constraints: const BoxConstraints(minWidth: 18, minHeight: 18),
      padding: const EdgeInsets.symmetric(horizontal: 4),
      decoration: BoxDecoration(
        color: MC.coral,
        borderRadius: BorderRadius.circular(99),
        border: Border.all(color: borderColor ?? MC.header, width: 1.5),
      ),
      child: Center(
        child: Text(count > 9 ? '9+' : '$count',
            style: ts(11, w: FontWeight.w800, c: Colors.white)),
      ),
    );
    if (reduceMotion(context)) return badge;
    return TweenAnimationBuilder<double>(
      key: ValueKey(count),
      tween: Tween(begin: 0.4, end: 1),
      duration: const Duration(milliseconds: 420),
      curve: Curves.elasticOut,
      builder: (context, s, child) => Transform.scale(scale: s, child: child),
      child: badge,
    );
  }
}

/// Custom shimmer for skeleton loaders (no package).
class Shimmer extends StatefulWidget {
  const Shimmer({super.key, required this.child});
  final Widget child;
  @override
  State<Shimmer> createState() => _ShimmerState();
}

class _ShimmerState extends State<Shimmer> with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController(
      vsync: this, duration: const Duration(milliseconds: 1200));

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!reduceMotion(context) && !_c.isAnimating) _c.repeat();
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = MC.of(context);
    return AnimatedBuilder(
      animation: _c,
      child: widget.child,
      builder: (context, child) => ShaderMask(
        blendMode: BlendMode.srcATop,
        shaderCallback: (rect) => LinearGradient(
          begin: Alignment(-1 - 2 + 4 * _c.value, 0),
          end: Alignment(1 - 2 + 4 * _c.value, 0),
          colors: [c.container, c.lowest, c.container],
          stops: const [0.25, 0.5, 0.75],
        ).createShader(rect),
        child: child,
      ),
    );
  }
}

/// Grey rounded block used inside a [Shimmer].
class SkeletonBox extends StatelessWidget {
  const SkeletonBox({super.key, this.width, required this.height, this.radius = 12});
  final double? width;
  final double height;
  final double radius;
  @override
  Widget build(BuildContext context) => Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: MC.of(context).container,
          borderRadius: BorderRadius.circular(radius),
        ),
      );
}
