import 'package:flutter/material.dart';

import '../pages/cart/cart_page.dart';
import '../pages/chat/chat_page.dart';
import '../pages/notifications/notifications_page.dart';
import '../state/cart_provider.dart';
import '../theme/app_theme.dart';
import 'motion.dart';
import 'notification_badge.dart';

/// Round 44×44 icon button used in headers (light or dark).
class HeaderIconButton extends StatelessWidget {
  const HeaderIconButton({
    super.key,
    required this.icon,
    required this.tooltip,
    required this.onTap,
    this.onDark = true,
    this.badge,
  });

  final IconData icon;
  final String tooltip;
  final VoidCallback onTap;
  final bool onDark;

  /// Optional badge; must be a [Positioned] (placed inside a Stack).
  final Widget? badge;

  @override
  Widget build(BuildContext context) {
    final fg = onDark ? AppColors.onDark : AppColors.primary;
    return Tooltip(
      message: tooltip,
      child: PressScale(
        child: Material(
          type: MaterialType.transparency,
          child: InkWell(
            customBorder: const CircleBorder(),
            onTap: onTap,
            child: SizedBox(
              width: AppSpacing.tap,
              height: AppSpacing.tap,
              child: Stack(
                alignment: Alignment.center,
                clipBehavior: Clip.none,
                children: [
                  Icon(icon, color: fg, size: 23),
                  if (badge != null)
                    Positioned.fill(
                      child: Padding(
                        padding: const EdgeInsets.all(5),
                        child: Stack(clipBehavior: Clip.none, children: [badge!]),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Cart icon with a live item-count badge (existing cart state, hidden at 0).
/// The badge bounces whenever the count changes. Opens the Cart screen.
class CartIconButton extends StatelessWidget {
  const CartIconButton({super.key, this.onDark = true});
  final bool onDark;

  static void open(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const CartPage()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final cart = CartProvider.of(context);
    return AnimatedBuilder(
      animation: cart,
      builder: (context, _) => HeaderIconButton(
        icon: Icons.shopping_cart_outlined,
        tooltip: 'Cart',
        onDark: onDark,
        onTap: () => open(context),
        badge: _CountBadge(count: cart.lineCount),
      ),
    );
  }
}

/// Bell with the real unread-notification count.
class NotificationIconButton extends StatelessWidget {
  const NotificationIconButton({super.key, this.onDark = true});
  final bool onDark;

  @override
  Widget build(BuildContext context) => HeaderIconButton(
        icon: Icons.notifications_none_outlined,
        tooltip: 'Notifications',
        onDark: onDark,
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const NotificationsPage()),
        ),
        badge: const NotificationBadge(),
      );
}

/// Messages shortcut.
class ChatIconButton extends StatelessWidget {
  const ChatIconButton({super.key, this.onDark = true});
  final bool onDark;

  @override
  Widget build(BuildContext context) => HeaderIconButton(
        icon: Icons.chat_bubble_outline,
        tooltip: 'Messages',
        onDark: onDark,
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const ChatPage()),
        ),
      );
}

/// Standard right-side header actions: [notifications] · messages · cart.
class MimooHeaderActions extends StatelessWidget {
  const MimooHeaderActions({
    super.key,
    this.onDark = true,
    this.showChat = true,
    this.showNotifications = true,
  });
  final bool onDark;
  final bool showChat;
  final bool showNotifications;

  @override
  Widget build(BuildContext context) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showNotifications) NotificationIconButton(onDark: onDark),
          if (showChat) ChatIconButton(onDark: onDark),
          CartIconButton(onDark: onDark),
        ],
      );
}

/// Red count pill that pops (scale 1 → 1.35 → 1, 300 ms) when [count]
/// changes. Builds a [Positioned]; hidden when count is 0.
class _CountBadge extends StatefulWidget {
  const _CountBadge({required this.count});
  final int count;

  @override
  State<_CountBadge> createState() => _CountBadgeState();
}

class _CountBadgeState extends State<_CountBadge>
    with SingleTickerProviderStateMixin {
  late final AnimationController _c =
      AnimationController(vsync: this, duration: AppDurations.page);
  late final Animation<double> _scale = TweenSequence<double>([
    TweenSequenceItem(tween: Tween(begin: 1.0, end: 1.35), weight: 40),
    TweenSequenceItem(tween: Tween(begin: 1.35, end: 1.0), weight: 60),
  ]).animate(CurvedAnimation(parent: _c, curve: Curves.easeOut));

  @override
  void didUpdateWidget(_CountBadge old) {
    super.didUpdateWidget(old);
    if (old.count != widget.count && !reduceMotion(context)) {
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
    final n = widget.count;
    if (n <= 0) {
      return const Positioned(right: 0, top: 0, child: SizedBox.shrink());
    }
    return Positioned(
      right: -2,
      top: -2,
      child: ScaleTransition(
        scale: _scale,
        child: Container(
          constraints: const BoxConstraints(minWidth: 17, minHeight: 17),
          padding: const EdgeInsets.symmetric(horizontal: 4),
          decoration: BoxDecoration(
            color: AppColors.flash,
            borderRadius: BorderRadius.circular(AppRadius.pill),
            border: Border.all(color: Colors.white, width: 1.4),
          ),
          alignment: Alignment.center,
          child: Text(
            n > 99 ? '99+' : '$n',
            style: AppText.style(
                size: 9.5, weight: FontWeight.w800, color: Colors.white, height: 1.1),
          ),
        ),
      ),
    );
  }
}

/// Branded top header used by the main tabs: logo tile on the logo's own
/// dark gradient, a title, and the cart/messages/notification actions.
class MimooTabHeader extends StatelessWidget {
  const MimooTabHeader({
    super.key,
    required this.title,
    this.bottom,
    this.showChat = true,
    this.showNotifications = true,
  });

  final String title;

  /// Optional content under the title row (e.g. a search bar).
  final Widget? bottom;
  final bool showChat;
  final bool showNotifications;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(gradient: AppColors.headerGradient),
      padding: const EdgeInsets.fromLTRB(
          AppSpacing.gutter, AppSpacing.sm, AppSpacing.sm, AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const _HeaderLogo(),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Text(
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppText.style(
                      size: 17, weight: FontWeight.w800, color: AppColors.onDark),
                ),
              ),
              MimooHeaderActions(
                  showChat: showChat, showNotifications: showNotifications),
            ],
          ),
          if (bottom != null) ...[
            const SizedBox(height: AppSpacing.sm),
            Padding(
              padding: const EdgeInsets.only(right: AppSpacing.sm),
              child: bottom!,
            ),
          ],
        ],
      ),
    );
  }
}

/// Logo tile for dark headers: same colour as the header, hairline border,
/// radius 12 — reads as part of the header instead of a pasted box.
class _HeaderLogo extends StatelessWidget {
  const _HeaderLogo();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 62,
      height: 48,
      decoration: BoxDecoration(
        color: AppColors.logoInk,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: Colors.white.withValues(alpha: 0.10)),
      ),
      clipBehavior: Clip.antiAlias,
      child: Image.asset(
        'assets/images/logo.png',
        fit: BoxFit.cover,
        filterQuality: FilterQuality.medium,
        gaplessPlayback: true,
        errorBuilder: (_, __, ___) => Center(
          child: Text('mimoo',
              style: AppText.style(
                  size: 13, weight: FontWeight.w800, color: AppColors.logoText)),
        ),
      ),
    );
  }
}

/// Search pill used inside dark headers.
class HeaderSearchBar extends StatelessWidget {
  const HeaderSearchBar({
    super.key,
    required this.hint,
    required this.onTap,
    this.trailing,
  });
  final String hint;
  final VoidCallback onTap;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return PressScale(
      scale: 0.98,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          height: AppSpacing.tap,
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(AppRadius.pill),
            border: Border.all(color: Colors.white.withValues(alpha: 0.10)),
          ),
          child: Row(
            children: [
              const SizedBox(width: 14),
              const Icon(Icons.search, size: 18, color: AppColors.onDarkMuted),
              const SizedBox(width: 8),
              Expanded(
                child: Text(hint,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppText.style(size: 13, color: AppColors.onDarkMuted)),
              ),
              if (trailing != null) trailing!,
              const SizedBox(width: 14),
            ],
          ),
        ),
      ),
    );
  }
}
