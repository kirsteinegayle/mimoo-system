import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

// ── Brand colors (duplicated here to avoid cross-import issues) ───────────────
const _kPrimary = Color(0xFF34175B);

// ─────────────────────────────────────────────────────────────────────────────
// 1. PAGE TRANSITION
// Fade + slide-up, 280 ms, Curves.easeOutCubic
// Usage: Navigator.push(context, MimooPageRoute(builder: (_) => SomePage()))
// ─────────────────────────────────────────────────────────────────────────────
class MimooPageRoute<T> extends PageRouteBuilder<T> {
  MimooPageRoute({required WidgetBuilder builder, RouteSettings? settings})
      : super(
          settings: settings,
          transitionDuration: const Duration(milliseconds: 280),
          reverseTransitionDuration: const Duration(milliseconds: 220),
          pageBuilder: (context, animation, secondaryAnimation) =>
              builder(context),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            // Reduce motion: no transition animation.
            if (MediaQuery.maybeDisableAnimationsOf(context) ?? false) return child;
            const begin = Offset(0.0, 0.04);
            const end = Offset.zero;
            final tween = Tween(begin: begin, end: end)
                .chain(CurveTween(curve: Curves.easeOutCubic));
            return FadeTransition(
              opacity: CurvedAnimation(
                  parent: animation, curve: Curves.easeOutCubic),
              child: SlideTransition(
                position: animation.drive(tween),
                child: child,
              ),
            );
          },
        );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. STAGGERED FADE + SLIDE-UP for list/grid items
// Wrap any widget with StaggeredItem(index: i, child: ...)
// 60 ms delay per index, 300 ms duration
// ─────────────────────────────────────────────────────────────────────────────
class StaggeredItem extends StatefulWidget {
  const StaggeredItem({
    super.key,
    required this.index,
    required this.child,
    this.delayPerItem = 60,
    this.id,
  });
  final int index;
  final Widget child;
  final int delayPerItem; // ms

  /// When set, the entrance plays only ONCE per id for the app session
  /// (grid cards recycled while scrolling don't re-animate).
  final Object? id;

  static final Set<Object> _played = <Object>{};

  @override
  State<StaggeredItem> createState() => _StaggeredItemState();
}

class _StaggeredItemState extends State<StaggeredItem>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double> _fade;
  late final Animation<Offset> _slide;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );

    _fade = CurvedAnimation(parent: _ctrl, curve: Curves.easeOut);
    _slide = Tween<Offset>(
      begin: const Offset(0, 0.12),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOutCubic));

    final id = widget.id;
    if (id != null && StaggeredItem._played.contains(id)) {
      _ctrl.value = 1; // already shown once
      return;
    }
    if (id != null) StaggeredItem._played.add(id);
    // Stagger delay capped at 480ms so late items don't feel sluggish
    final delay = (widget.index * widget.delayPerItem).clamp(0, 480);
    Future.delayed(Duration(milliseconds: delay), () {
      if (mounted) _ctrl.forward();
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Reduce motion: show immediately.
    if (MediaQuery.maybeDisableAnimationsOf(context) ?? false) _ctrl.value = 1;
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _fade,
      child: SlideTransition(position: _slide, child: widget.child),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. SCALE BOUNCE for Add-to-Cart / tap feedback
// Wrap any tappable widget with ScaleTap(onTap: ..., child: ...)
// ─────────────────────────────────────────────────────────────────────────────
class ScaleTap extends StatefulWidget {
  const ScaleTap({
    super.key,
    required this.onTap,
    required this.child,
    this.scaleFactor = 0.88,
  });
  final VoidCallback? onTap;
  final Widget child;
  final double scaleFactor;

  @override
  State<ScaleTap> createState() => _ScaleTapState();
}

class _ScaleTapState extends State<ScaleTap>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 120),
      reverseDuration: const Duration(milliseconds: 380),
    );
    _scale = Tween<double>(begin: 1.0, end: widget.scaleFactor).animate(
      CurvedAnimation(
          parent: _ctrl, curve: Curves.easeIn, reverseCurve: Curves.elasticOut),
    );
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  void _onTap() {
    if (!(MediaQuery.maybeDisableAnimationsOf(context) ?? false)) {
      _ctrl.forward().then((_) => _ctrl.reverse());
    }
    widget.onTap?.call();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _onTap,
      child: ScaleTransition(scale: _scale, child: widget.child),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. ANIMATED BOTTOM NAV PILL — drop-in replacement NavigationBar
// ─────────────────────────────────────────────────────────────────────────────
class MimooNavBar extends StatelessWidget {
  const MimooNavBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
    required this.items,
  });
  final int currentIndex;
  final ValueChanged<int> onTap;
  final List<MimooNavItem> items;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 64,
      decoration: const BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Color(0x14000000),
            blurRadius: 12,
            offset: Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: List.generate(items.length, (i) {
            final item = items[i];
            final selected = i == currentIndex;
            return Expanded(
              child: GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: () => onTap(i),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 280),
                      curve: Curves.easeOutCubic,
                      height: 32,
                      width: selected ? 56 : 32,
                      decoration: BoxDecoration(
                        color: selected
                            ? const Color(0xFFEFE9FD)
                            : Colors.transparent,
                        borderRadius: BorderRadius.circular(9999),
                      ),
                      child: Badge(
                        isLabelVisible: item.badgeCount > 0,
                        label: Text(item.badgeCount > 99 ? '99+' : '${item.badgeCount}'),
                        backgroundColor: const Color(0xFFFF3B5C),
                        child: Icon(
                          selected ? item.activeIcon : item.icon,
                          size: 20,
                          color: selected ? _kPrimary : const Color(0xFF8A84A3),
                        ),
                      ),
                    ),
                    const SizedBox(height: 2),
                    AnimatedDefaultTextStyle(
                      duration: const Duration(milliseconds: 200),
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight:
                            selected ? FontWeight.w700 : FontWeight.w400,
                        color: selected ? _kPrimary : const Color(0xFF8A84A3),
                      ),
                      child: Text(item.label),
                    ),
                  ],
                ),
              ),
            );
          }),
        ),
      ),
    );
  }
}

class MimooNavItem {
  const MimooNavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    this.badgeCount = 0,
  });
  final IconData icon;
  final IconData activeIcon;
  final String label;

  /// Count badge on the icon (hidden when 0).
  final int badgeCount;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. ANIMATED BANNER DOTS
// Standalone animated dot row. Pass current index + total.
// ─────────────────────────────────────────────────────────────────────────────
class BannerDots extends StatelessWidget {
  const BannerDots({
    super.key,
    required this.currentIndex,
    required this.total,
    this.activeColor = Colors.white,
    this.inactiveColor,
  });
  final int currentIndex;
  final int total;
  final Color activeColor;
  final Color? inactiveColor;

  @override
  Widget build(BuildContext context) {
    final inactive = inactiveColor ?? Colors.white.withValues(alpha: 0.35);
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(total, (i) {
        final active = i == currentIndex;
        return AnimatedContainer(
          duration: const Duration(milliseconds: 280),
          curve: Curves.easeOutCubic,
          margin: const EdgeInsets.symmetric(horizontal: 3),
          width: active ? 18 : 6,
          height: 6,
          decoration: BoxDecoration(
            color: active ? activeColor : inactive,
            borderRadius: BorderRadius.circular(9999),
          ),
        );
      }),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. SHIMMER SKELETON placeholders
// Usage: ShimmerBox(width: double.infinity, height: 120)
//        ShimmerCard() — standard product card skeleton
// ─────────────────────────────────────────────────────────────────────────────
class ShimmerBox extends StatelessWidget {
  const ShimmerBox({
    super.key,
    required this.width,
    required this.height,
    this.radius = 8,
  });
  final double width;
  final double height;
  final double radius;

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: const Color(0xFFE8E4F0),
      highlightColor: const Color(0xFFF5F3FC),
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(radius),
        ),
      ),
    );
  }
}

class ShimmerProductCard extends StatelessWidget {
  const ShimmerProductCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: const [
          BoxShadow(
              color: Color(0x0D34175B), blurRadius: 8, offset: Offset(0, 2)),
        ],
      ),
      child: Shimmer.fromColors(
        baseColor: const Color(0xFFE8E4F0),
        highlightColor: const Color(0xFFF5F3FC),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image placeholder
            Container(
              height: 140,
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 8, 8, 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                      height: 10, width: double.infinity, color: Colors.white),
                  const SizedBox(height: 6),
                  Container(height: 10, width: 80, color: Colors.white),
                  const SizedBox(height: 10),
                  Container(height: 14, width: 60, color: Colors.white),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class ShimmerBannerPlaceholder extends StatelessWidget {
  const ShimmerBannerPlaceholder({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 10, 12, 0),
      child: ShimmerBox(
        width: double.infinity,
        height: 210,
        radius: 18,
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. BRANDED RefreshIndicator wrapper
// Usage: MimooRefresh(onRefresh: _load, child: scrollable)
// ─────────────────────────────────────────────────────────────────────────────
class MimooRefresh extends StatelessWidget {
  const MimooRefresh({
    super.key,
    required this.onRefresh,
    required this.child,
  });
  final Future<void> Function() onRefresh;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: onRefresh,
      color: Colors.white,
      backgroundColor: _kPrimary,
      strokeWidth: 2.5,
      displacement: 60,
      child: child,
    );
  }
}
