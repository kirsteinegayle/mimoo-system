import 'package:flutter/material.dart';
import '../core/rider_status_controller.dart';
import '../core/theme.dart';
import '../l10n/generated/app_localizations.dart';
import 'mimoo_logo.dart';
import 'motion.dart';

/// Main header: logo, Online/Offline toggle, Messages and Notifications.
class MimooAppBar extends StatelessWidget implements PreferredSizeWidget {
  final int unreadMessages;
  final int unreadNotifications;
  final VoidCallback onMessages;
  final VoidCallback onNotifications;
  const MimooAppBar({
    super.key,
    this.unreadMessages = 0,
    this.unreadNotifications = 0,
    required this.onMessages,
    required this.onNotifications,
  });
  @override
  Size get preferredSize => const Size.fromHeight(64);
  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: MC.header,
      flexibleSpace: const DecoratedBox(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [MC.violetDark, MC.violet],
          ),
        ),
      ),
      toolbarHeight: 64,
      automaticallyImplyLeading: false,
      titleSpacing: 12,
      title: Row(children: [
        const MimooLogo(size: 34, showRiderLabel: false),
        const SizedBox(width: 8),
        Flexible(
          child: Text('mimoo',
              overflow: TextOverflow.fade,
              softWrap: false,
              style: ts(20, w: FontWeight.w800, c: Colors.white)),
        ),
      ]),
      actions: [
        const _RiderStatusSwitch(),
        _HeaderIcon(
          icon: Icons.chat_bubble_outline_rounded,
          tooltip: 'Messages',
          count: unreadMessages,
          onTap: onMessages,
        ),
        _HeaderIcon(
          icon: Icons.notifications_none_rounded,
          tooltip: 'Notifications',
          count: unreadNotifications,
          onTap: onNotifications,
        ),
        const SizedBox(width: 4),
      ],
    );
  }
}

class _HeaderIcon extends StatelessWidget {
  const _HeaderIcon(
      {required this.icon,
      required this.tooltip,
      required this.count,
      required this.onTap});
  final IconData icon;
  final String tooltip;
  final int count;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) => Semantics(
        label: count > 0 ? '$tooltip, $count unread' : tooltip,
        button: true,
        excludeSemantics: true,
        child: Stack(alignment: Alignment.center, children: [
          IconButton(
            tooltip: tooltip,
            onPressed: onTap,
            icon: Icon(icon, color: Colors.white),
          ),
          Positioned(
            top: 8,
            right: 6,
            child: IgnorePointer(child: PopBadge(count: count)),
          ),
        ]),
      );
}

/// Animated Online/Offline pill. Uses the existing status controller.
class _RiderStatusSwitch extends StatelessWidget {
  const _RiderStatusSwitch();

  @override
  Widget build(BuildContext context) {
    final status = RiderStatusScope.of(context);
    final l10n = AppLocalizations.of(context);
    final online = status.isOnline;
    final label = status.isSuspended
        ? l10n.riderStatusSuspended
        : online
            ? l10n.riderStatusTooltipOnline
            : l10n.riderStatusTooltipOffline;
    final d = motion(context, const Duration(milliseconds: 220));
    return Semantics(
      button: true,
      toggled: online,
      enabled: !status.isSuspended && !status.isUpdatingStatus,
      label: label,
      excludeSemantics: true,
      child: Tooltip(
        message: label,
        child: InkWell(
          onTap: status.isSuspended || status.isUpdatingStatus
              ? null
              : () => toggleRiderStatus(context, status, !online),
          borderRadius: BorderRadius.circular(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(minHeight: 48),
            child: Center(
              child: AnimatedContainer(
                duration: d,
                curve: Curves.easeOut,
                height: 30,
                padding: const EdgeInsets.symmetric(horizontal: 4),
                decoration: BoxDecoration(
                  color: online
                      ? MC.green.withValues(alpha: 0.9)
                      : Colors.white.withValues(alpha: 0.16),
                  borderRadius: BorderRadius.circular(99),
                ),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  if (online) ...[
                    const SizedBox(width: 6),
                    _statusText(online),
                    const SizedBox(width: 6),
                  ],
                  AnimatedContainer(
                    duration: d,
                    width: 22,
                    height: 22,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                            color: Colors.black.withValues(alpha: 0.15),
                            blurRadius: 4)
                      ],
                    ),
                    child: status.isUpdatingStatus
                        ? const Padding(
                            padding: EdgeInsets.all(5),
                            child: CircularProgressIndicator(strokeWidth: 2))
                        : Icon(
                            online
                                ? Icons.power_settings_new
                                : Icons.power_off_outlined,
                            size: 14,
                            color: online ? MC.green : MC.muted),
                  ),
                  if (!online) ...[
                    const SizedBox(width: 6),
                    _statusText(online),
                    const SizedBox(width: 6),
                  ],
                ]),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _statusText(bool online) => Text(online ? 'Online' : 'Offline',
      style: ts(12, w: FontWeight.w800, c: Colors.white));
}

Future<void> toggleRiderStatus(
    BuildContext context, RiderStatusController status, bool value) async {
  final l10n = AppLocalizations.of(context);
  final messenger = ScaffoldMessenger.of(context);

  if (value) {
    if (status.isSuspended) {
      messenger
          .showSnackBar(SnackBar(content: Text(l10n.riderStatusSuspended)));
      return;
    }
    bool ok;
    try {
      ok = await status.requestOnline(context);
    } on Exception catch (error) {
      if (!context.mounted) return;
      messenger.showSnackBar(SnackBar(content: Text('$error')));
      return;
    }
    if (!context.mounted || !ok) return;
    messenger.showSnackBar(SnackBar(
      content: Text(l10n.riderStatusOnline),
      duration: const Duration(seconds: 2),
    ));
    return;
  }

  if (status.heldParcels == 0) {
    try {
      await status.goOffline();
    } on Exception catch (error) {
      if (!context.mounted) return;
      messenger.showSnackBar(SnackBar(content: Text('$error')));
      return;
    }
    if (!context.mounted) return;
    messenger.showSnackBar(SnackBar(
      content: Text(l10n.riderStatusOffline),
      duration: const Duration(seconds: 2),
    ));
    return;
  }

  final held = status.heldParcels;
  final palette = MC.of(context);
  final stay = await showDialog<bool>(
    context: context,
    builder: (c) => Dialog(
      backgroundColor: palette.lowest,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          IconCircle(Icons.inventory_2,
              size: 64, bg: palette.tint, fg: palette.primary),
          const SizedBox(height: 12),
          Text(l10n.riderStatusHeldTitle(held),
              style: ts(18, w: FontWeight.w700, c: palette.text),
              textAlign: TextAlign.center),
          const SizedBox(height: 8),
          Text(l10n.riderStatusHeldBody(held),
              style: ts(14, c: palette.muted, h: 1.4),
              textAlign: TextAlign.center),
          const SizedBox(height: 16),
          PillButton(l10n.riderStatusStayOnline,
              onPressed: () => Navigator.pop(c, true)),
          const SizedBox(height: 8),
          TextButton.icon(
            onPressed: () => Navigator.pop(c, false),
            icon: Icon(Icons.power_settings_new, color: palette.coral),
            label: Text(l10n.riderStatusGoOffline,
                style: ts(14, w: FontWeight.w700, c: palette.coral)),
          ),
        ]),
      ),
    ),
  );
  if (!context.mounted || stay == true || stay == null) return;
  try {
    await status.goOffline();
  } on Exception catch (error) {
    if (!context.mounted) return;
    messenger.showSnackBar(SnackBar(content: Text('$error')));
    return;
  }
  if (!context.mounted) return;
  messenger.showSnackBar(SnackBar(
    content: Text(l10n.riderStatusOffline),
    duration: const Duration(seconds: 2),
  ));
}

/// Home | Jobs | Scan (raised centre button) | Wallet | Profile.
/// Tab indices: 0 Home, 1 Jobs, 2 Wallet, 3 Profile. Scan is an action.
class MimooBottomNav extends StatelessWidget {
  final int index;
  final ValueChanged<int> onTap;
  final VoidCallback onScan;
  const MimooBottomNav(
      {super.key,
      required this.index,
      required this.onTap,
      required this.onScan});

  static const _items = [
    (Icons.home_outlined, Icons.home_rounded, 'Home'),
    (Icons.assignment_outlined, Icons.assignment, 'Jobs'),
    (Icons.account_balance_wallet_outlined, Icons.account_balance_wallet,
        'Wallet'),
    (Icons.person_outline, Icons.person, 'Profile'),
  ];

  /// Visual slot (0..4) for a tab index; slot 2 is Scan.
  static int _slot(int tab) => tab < 2 ? tab : tab + 1;

  @override
  Widget build(BuildContext context) {
    final c = MC.of(context);
    final d = motion(context, const Duration(milliseconds: 260));
    return Container(
      decoration: BoxDecoration(color: c.lowest, boxShadow: [
        BoxShadow(
            color: MC.header.withValues(alpha: 0.08),
            blurRadius: 16,
            offset: const Offset(0, -4))
      ]),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 68,
          child: LayoutBuilder(builder: (context, constraints) {
            final slotW = constraints.maxWidth / 5;
            const pillW = 52.0;
            return Stack(clipBehavior: Clip.none, children: [
              // Sliding selected pill.
              AnimatedPositioned(
                duration: d,
                curve: Curves.easeOutCubic,
                top: 8,
                left: _slot(index) * slotW + (slotW - pillW) / 2,
                width: pillW,
                height: 32,
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: c.primaryContainer.withValues(alpha: 0.14),
                    borderRadius: BorderRadius.circular(99),
                  ),
                ),
              ),
              Row(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                Expanded(child: _navItem(context, c, 0)),
                Expanded(child: _navItem(context, c, 1)),
                Expanded(child: _scanItem(context, c)),
                Expanded(child: _navItem(context, c, 2)),
                Expanded(child: _navItem(context, c, 3)),
              ]),
            ]);
          }),
        ),
      ),
    );
  }

  static Widget _label(String text, Color fg, bool bold) => FittedBox(
        fit: BoxFit.scaleDown,
        child: Text(text,
            maxLines: 1,
            softWrap: false,
            style: ts(12, w: bold ? FontWeight.w800 : FontWeight.w600, c: fg)),
      );

  Widget _navItem(BuildContext context, MimooColors c, int i) {
    final selected = i == index;
    final fg = selected ? c.primary : c.onSurfaceVariant;
    final icon = Icon(selected ? _items[i].$2 : _items[i].$1,
        size: 24, color: fg);
    return Semantics(
      button: true,
      selected: selected,
      label: _items[i].$3,
      excludeSemantics: true,
      child: InkWell(
        onTap: () => onTap(i),
        child: Column(children: [
          const SizedBox(height: 12),
          SizedBox(
            height: 24,
            child: selected && !reduceMotion(context)
                ? TweenAnimationBuilder<double>(
                    key: ValueKey('sel$i'),
                    tween: Tween(begin: 0.7, end: 1),
                    duration: const Duration(milliseconds: 500),
                    curve: Curves.elasticOut,
                    builder: (context, s, child) =>
                        Transform.scale(scale: s, child: child),
                    child: icon,
                  )
                : icon,
          ),
          const Spacer(),
          _label(_items[i].$3, fg, selected),
          const SizedBox(height: 8),
        ]),
      ),
    );
  }

  /// Raised circle that floats above the bar; its label shares the baseline
  /// of the other labels so it is never clipped.
  Widget _scanItem(BuildContext context, MimooColors c) => Semantics(
        button: true,
        label: 'Scan waybill',
        excludeSemantics: true,
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: onScan,
          child: Stack(
              clipBehavior: Clip.none,
              alignment: Alignment.topCenter,
              children: [
                Positioned(
                  top: -18,
                  child: PressScale(
                    child: Container(
                      width: 58,
                      height: 58,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [MC.violet, MC.coral],
                        ),
                        shape: BoxShape.circle,
                        border: Border.all(color: c.lowest, width: 4),
                        boxShadow: [
                          BoxShadow(
                              color: MC.violet.withValues(alpha: 0.35),
                              blurRadius: 12,
                              offset: const Offset(0, 4))
                        ],
                      ),
                      child: const Icon(Icons.qr_code_scanner,
                          color: Colors.white, size: 26),
                    ),
                  ),
                ),
                Positioned(
                  left: 0,
                  right: 0,
                  bottom: 8,
                  child: Center(child: _label('Scan', c.primary, true)),
                ),
              ]),
        ),
      );
}
