import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../theme/app_theme.dart';

// ── Brand colors (duplicated here to avoid cross-import issues) ───────────────
const _kPrimary = AppColors.primary;

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
    final reduce = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final d = reduce ? Duration.zero : AppDurations.medium;
    final n = items.length;
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.card,
        boxShadow: AppShadows.nav,
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 64,
          child: Stack(
            children: [
              // Sliding top indicator under the active tab.
              AnimatedAlign(
                duration: d,
                curve: Curves.easeOutCubic,
                alignment: Alignment(
                    n <= 1 ? 0 : -1 + 2 * currentIndex / (n - 1), -1),
                child: FractionallySizedBox(
                  widthFactor: 1 / n,
                  child: Center(
                    child: Container(
                      width: 28,
                      height: 3,
                      decoration: BoxDecoration(
                        color: AppColors.accent,
                        borderRadius: BorderRadius.circular(AppRadius.pill),
                      ),
                    ),
                  ),
                ),
              ),
              Row(
                children: List.generate(n, (i) {
                  final item = items[i];
                  final selected = i == currentIndex;
                  return Expanded(
                    child: Semantics(
                      selected: selected,
                      button: true,
                      label: item.label,
                      child: InkResponse(
                        onTap: () => onTap(i),
                        radius: 36,
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            AnimatedContainer(
                              duration: d,
                              curve: Curves.easeOutCubic,
                              height: 30,
                              width: selected ? 56 : 36,
                              decoration: BoxDecoration(
                                color: selected
                                    ? AppColors.chip
                                    : Colors.transparent,
                                borderRadius:
                                    BorderRadius.circular(AppRadius.pill),
                              ),
                              child: Badge(
                                isLabelVisible: item.badgeCount > 0,
                                label: Text(item.badgeCount > 99
                                    ? '99+'
                                    : '${item.badgeCount}'),
                                backgroundColor: AppColors.flash,
                                child: AnimatedScale(
                                  duration: d,
                                  scale: selected ? 1.08 : 1,
                                  child: Icon(
                                    selected ? item.activeIcon : item.icon,
                                    size: 22,
                                    color: selected
                                        ? _kPrimary
                                        : AppColors.textMuted,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 3),
                            AnimatedDefaultTextStyle(
                              duration: reduce
                                  ? Duration.zero
                                  : AppDurations.fast,
                              style: AppText.style(
                                size: 11,
                                weight: selected
                                    ? FontWeight.w700
                                    : FontWeight.w500,
                                color: selected
                                    ? _kPrimary
                                    : AppColors.textMuted,
                              ),
                              child: Text(item.label),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }),
              ),
            ],
          ),
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
      baseColor: AppColors.skeletonBase,
      highlightColor: AppColors.skeletonHighlight,
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
              color: AppColors.primaryA05, blurRadius: 8, offset: Offset(0, 2)),
        ],
      ),
      child: Shimmer.fromColors(
        baseColor: AppColors.skeletonBase,
        highlightColor: AppColors.skeletonHighlight,
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
