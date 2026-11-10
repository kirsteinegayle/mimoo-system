import 'package:flutter/material.dart';

import '../core/theme.dart';
import 'motion.dart';

/// Small illustrated empty state built from shapes + icons (no image assets).
class EmptyState extends StatelessWidget {
  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    this.message,
    this.accent,
    this.action,
  });

  final IconData icon;
  final String title;
  final String? message;
  final Color? accent;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    final c = MC.of(context);
    final tone = accent ?? c.primary;
    return FadeSlideIn(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 28, horizontal: 24),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          SizedBox(
            width: 128,
            height: 104,
            child: Stack(alignment: Alignment.center, children: [
              // Soft blob background.
              Container(
                width: 104,
                height: 104,
                decoration: BoxDecoration(
                  color: tone.withValues(alpha: 0.08),
                  shape: BoxShape.circle,
                ),
              ),
              // Decorative dots.
              Positioned(left: 6, top: 18, child: _dot(tone, 10, 0.25)),
              Positioned(right: 10, top: 8, child: _dot(c.coral, 8, 0.35)),
              Positioned(right: 2, bottom: 20, child: _dot(tone, 6, 0.3)),
              // Card with the icon.
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: c.lowest,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: tone.withValues(alpha: 0.18),
                      blurRadius: 16,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: Icon(icon, size: 30, color: tone),
              ),
            ]),
          ),
          const SizedBox(height: 14),
          Text(title,
              textAlign: TextAlign.center,
              style: ts(16, w: FontWeight.w700, c: c.text)),
          if (message != null) ...[
            const SizedBox(height: 4),
            Text(message!,
                textAlign: TextAlign.center,
                style: ts(13, c: c.muted, h: 1.4)),
          ],
          if (action != null) ...[const SizedBox(height: 14), action!],
        ]),
      ),
    );
  }

  Widget _dot(Color color, double size, double alpha) => Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
            color: color.withValues(alpha: alpha), shape: BoxShape.circle),
      );
}
