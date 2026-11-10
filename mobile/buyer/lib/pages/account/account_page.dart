
import 'package:flutter/material.dart';

import '../../models/order.dart' as api_order;
import '../../services/follow_repository.dart';
import '../../services/order_repository.dart';
import '../../services/voucher_repository.dart';
import '../../state/auth_service.dart';
import '../../state/cart_provider.dart';
import '../../state/wishlist_provider.dart';
import '../../theme/app_theme.dart';
import '../../utils/animations.dart';
import '../../widgets/header_actions.dart';
import '../../widgets/motion.dart';
import '../chat/chat_page.dart';
import '../notifications/notifications_page.dart';
import '../orders/orders_page.dart';
import '../orders/return_request_pages.dart';
import '../voucher/voucher_wallet_page.dart';
import '../wishlist/wishlist_page.dart';
import 'account_settings_page.dart';
import 'address_book_page.dart';
import 'following_page.dart';

// ── Account Page ──────────────────────────────────────────────────────────────
//
// Layout: header (cart/messages) → profile card → stats row → My Purchases →
// My Services (Shopping / Account / Support groups) → Mimoo Guarantee.
//
// Counts come only from existing read-only data:
//   * To Ship / To Receive  — GET /buyer/orders (same call as My Purchases),
//     grouped with the existing orderTabFromStatus().
//   * Vouchers              — VoucherRepository.fetchMine()
//   * Wishlist              — WishlistState.count
//   * Following             — FollowRepository.following()
// Items with no backing data (To Pay, To Review, Returns) show no badge.
class AccountPage extends StatefulWidget {
  const AccountPage({super.key});

  @override
  State<AccountPage> createState() => _AccountPageState();
}

class _AccountPageState extends State<AccountPage> {
  int? _toShip;
  int? _toReceive;
  int? _vouchers;
  int? _following;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadCounts();
  }

  Future<void> _loadCounts() async {
    if (!AuthService.instance.isLoggedIn) {
      if (mounted) setState(() => _loading = false);
      return;
    }
    setState(() => _loading = true);
    // Each count fails silently → that badge/stat just shows "–".
    final results = await Future.wait<Object?>([
      OrderRepository.instance.fetchOrders().then<Object?>((p) => p).catchError((_) => null),
      VoucherRepository.instance.fetchMine().then<Object?>((v) => v.length).catchError((_) => null),
      FollowRepository.instance.following().then<Object?>((f) => f.length).catchError((_) => null),
    ]);
    if (!mounted) return;
    final page = results[0] as OrderPage?;
    setState(() {
      if (page != null) {
        var ship = 0, receive = 0;
        for (final o in page.orders) {
          switch (api_order.orderTabFromStatus(o.status)) {
            case api_order.OrderTab.toShip:
              ship++;
            case api_order.OrderTab.toReceive:
              receive++;
            default:
              break;
          }
        }
        _toShip = ship;
        _toReceive = receive;
      }
      _vouchers = results[1] as int?;
      _following = results[2] as int?;
      _loading = false;
    });
  }

  void _push(Widget page) =>
      Navigator.push(context, MaterialPageRoute(builder: (_) => page));

  void _openWishlist() {
    final wishlist = WishlistProvider.of(context);
    final cart = CartProvider.of(context);
    _push(WishlistProvider(
      wishlist: wishlist,
      child: CartProvider(cart: cart, child: const WishlistPage()),
    ));
  }

  @override
  Widget build(BuildContext context) {
    final wishlist = WishlistProvider.of(context);
    return Scaffold(
      backgroundColor: AppColors.surface,
      body: SafeArea(
        child: Column(
          children: [
            const MimooTabHeader(title: 'Account', showChat: false),
            Expanded(
              child: MimooRefresh(
                onRefresh: _loadCounts,
                child: ListView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.fromLTRB(
                      AppSpacing.gutter, AppSpacing.lg, AppSpacing.gutter, AppSpacing.xxl),
                  children: [
                    StaggeredItem(
                      index: 0,
                      child: _ProfileCard(
                        onEdit: () => _push(const AccountSettingsPage()),
                        stats: AnimatedBuilder(
                          animation: wishlist,
                          builder: (_, __) => _StatsRow(
                            loading: _loading,
                            stats: [
                              _Stat('Vouchers', _vouchers,
                                  () => _push(const VoucherWalletPage())),
                              _Stat('Wishlist', wishlist.count, _openWishlist),
                              _Stat('Following', _following,
                                  () => _push(const FollowingPage())),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    StaggeredItem(
                      index: 1,
                      child: _PurchasesCard(
                        toShip: _toShip,
                        toReceive: _toReceive,
                        onViewAll: () => _push(const OrdersPage()),
                        onTab: (tab) => _push(OrdersPage(initialTab: tab)),
                        // Same ReturnsListPage as "Returns & Refunds" below.
                        onReturns: () => _push(const ReturnsListPage()),
                      ),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    StaggeredItem(
                      index: 2,
                      child: _ServiceGroup(title: 'Shopping', items: [
                        _Service(Icons.local_offer_outlined, 'Vouchers',
                            AppColors.flash, () => _push(const VoucherWalletPage())),
                        _Service(Icons.favorite_outline, 'Wishlist',
                            AppColors.flash, _openWishlist),
                        _Service(Icons.storefront_outlined, 'Following Stores',
                            AppColors.success, () => _push(const FollowingPage())),
                        // Single Returns entry → same ReturnsListPage as My Purchases.
                        _Service(Icons.assignment_return_outlined, 'Returns & Refunds',
                            AppColors.orange, () => _push(const ReturnsListPage())),
                      ]),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    StaggeredItem(
                      index: 3,
                      child: _ServiceGroup(title: 'Account', items: [
                        _Service(Icons.location_on_outlined, 'Addresses',
                            AppColors.accent, () => _push(const AddressBookPage())),
                        _Service(Icons.notifications_none_outlined, 'Notifications',
                            AppColors.accent, () => _push(const NotificationsPage())),
                        _Service(Icons.chat_bubble_outline, 'Messages',
                            AppColors.accent, () => _push(const ChatPage())),
                        _Service(Icons.shield_outlined, 'Settings & Security',
                            AppColors.primary, () => _push(const AccountSettingsPage())),
                      ]),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    const StaggeredItem(index: 4, child: _GuaranteeBanner()),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Profile card ──────────────────────────────────────────────────────────────

class _ProfileCard extends StatelessWidget {
  const _ProfileCard({required this.onEdit, required this.stats});
  final VoidCallback onEdit;
  final Widget stats;

  static String _initials(String name) {
    final parts = name.trim().split(RegExp(r'\s+')).where((p) => p.isNotEmpty).toList();
    if (parts.isEmpty) return 'B';
    final first = parts.first[0];
    final last = parts.length > 1 ? parts.last[0] : '';
    return (first + last).toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: AppColors.memberGradient,
        borderRadius: AppRadius.card,
        boxShadow: AppShadows.card,
      ),
      padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.lg, AppSpacing.sm, AppSpacing.md),
      child: Column(
        children: [
          ValueListenableBuilder<String?>(
            valueListenable: AuthService.instance.buyerNameListenable,
            builder: (_, name, __) {
              final display = name ?? AuthService.instance.buyerName ?? 'Buyer';
              return Row(
                children: [
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      color: AppColors.chip,
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white.withValues(alpha: 0.6), width: 2),
                    ),
                    alignment: Alignment.center,
                    child: Text(_initials(display),
                        style: AppText.style(
                            size: 21, weight: FontWeight.w800, color: AppColors.primary)),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(display,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppText.style(
                                size: 18, weight: FontWeight.w800, color: AppColors.onDark)),
                        const SizedBox(height: AppSpacing.xs),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(AppRadius.pill),
                          ),
                          child: Row(mainAxisSize: MainAxisSize.min, children: [
                            const Icon(Icons.verified, size: 13, color: AppColors.success),
                            const SizedBox(width: 4),
                            Flexible(
                              child: Text('Verified buyer',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: AppText.style(
                                      size: 11, weight: FontWeight.w700, color: AppColors.onDark)),
                            ),
                          ]),
                        ),
                      ],
                    ),
                  ),
                  Tooltip(
                    message: 'Edit profile',
                    child: IconButton(
                      onPressed: onEdit,
                      constraints: const BoxConstraints(
                          minWidth: AppSpacing.tap, minHeight: AppSpacing.tap),
                      icon: const Icon(Icons.edit_outlined, color: AppColors.onDark, size: 20),
                    ),
                  ),
                ],
              );
            },
          ),
          const SizedBox(height: AppSpacing.md),
          Divider(color: Colors.white.withValues(alpha: 0.12), height: 1),
          const SizedBox(height: AppSpacing.xs),
          stats,
        ],
      ),
    );
  }
}

class _Stat {
  const _Stat(this.label, this.value, this.onTap);
  final String label;
  final int? value;
  final VoidCallback onTap;
}

class _StatsRow extends StatelessWidget {
  const _StatsRow({required this.stats, required this.loading});
  final List<_Stat> stats;
  final bool loading;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: stats.map((s) {
        final text = s.value?.toString() ?? (loading ? '' : '–');
        return Expanded(
          child: InkWell(
            borderRadius: BorderRadius.circular(AppRadius.md),
            onTap: s.onTap,
            child: ConstrainedBox(
              constraints: const BoxConstraints(minHeight: 52),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  AnimatedSwitcher(
                    duration: AppDurations.fast,
                    child: text.isEmpty
                        ? Container(
                            key: const ValueKey('sk'),
                            width: 22,
                            height: 14,
                            margin: const EdgeInsets.symmetric(vertical: 3),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.18),
                              borderRadius: BorderRadius.circular(4),
                            ),
                          )
                        : Text(text,
                            key: ValueKey(text),
                            style: AppText.style(
                                size: 16, weight: FontWeight.w800, color: AppColors.onDark)),
                  ),
                  const SizedBox(height: 2),
                  Text(s.label,
                      style: AppText.style(
                          size: 11.5, weight: FontWeight.w500, color: AppColors.onDarkMuted)),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}

// ── My Purchases ──────────────────────────────────────────────────────────────

class _PurchasesCard extends StatelessWidget {
  const _PurchasesCard({
    required this.toShip,
    required this.toReceive,
    required this.onViewAll,
    required this.onTab,
    required this.onReturns,
  });
  final int? toShip;
  final int? toReceive;
  final VoidCallback onViewAll;
  final ValueChanged<int> onTab;
  final VoidCallback onReturns;

  @override
  Widget build(BuildContext context) {
    // OrdersPage tabs: 0 All · 1 To Ship · 2 To Receive · 3 Completed.
    final items = [
      _Shortcut('To Pay', Icons.account_balance_wallet_outlined, null, () => onTab(0)),
      _Shortcut('To Ship', Icons.inventory_2_outlined, toShip, () => onTab(1)),
      _Shortcut('To Receive', Icons.local_shipping_outlined, toReceive, () => onTab(2)),
      _Shortcut('To Review', Icons.star_outline_rounded, null, () => onTab(3)),
      _Shortcut('Returns', Icons.assignment_return_outlined, null, onReturns),
    ];
    return _Card(
      child: Column(
        children: [
          _SectionHeader(
            title: 'My Purchases',
            action: 'View all orders',
            onAction: onViewAll,
          ),
          const SizedBox(height: AppSpacing.sm),
          Row(
            children: items.map((i) => Expanded(child: _ShortcutTile(item: i))).toList(),
          ),
        ],
      ),
    );
  }
}

class _Shortcut {
  const _Shortcut(this.label, this.icon, this.count, this.onTap);
  final String label;
  final IconData icon;
  final int? count;
  final VoidCallback onTap;
}

class _ShortcutTile extends StatelessWidget {
  const _ShortcutTile({required this.item});
  final _Shortcut item;

  @override
  Widget build(BuildContext context) {
    final n = item.count ?? 0;
    return PressScale(
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadius.md),
        onTap: item.onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
          child: Column(
            children: [
              Badge(
                isLabelVisible: n > 0,
                label: Text(n > 99 ? '99+' : '$n'),
                backgroundColor: AppColors.flash,
                offset: const Offset(6, -4),
                child: Container(
                  width: AppSpacing.tap,
                  height: AppSpacing.tap,
                  decoration: const BoxDecoration(color: AppColors.chip, shape: BoxShape.circle),
                  child: Icon(item.icon, size: 22, color: AppColors.primary),
                ),
              ),
              const SizedBox(height: 6),
              Text(item.label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                  style: AppText.style(size: 11, weight: FontWeight.w600)),
            ],
          ),
        ),
      ),
    );
  }
}

// ── My Services groups ───────────────────────────────────────────────────────

class _Service {
  const _Service(this.icon, this.label, this.color, this.onTap);
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
}

class _ServiceGroup extends StatelessWidget {
  const _ServiceGroup({required this.title, required this.items});
  final String title;
  final List<_Service> items;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: AppSpacing.xs, bottom: AppSpacing.sm),
          child: Text(title.toUpperCase(),
              style: AppText.style(
                  size: 11.5,
                  weight: FontWeight.w800,
                  color: AppColors.textMuted,
                  letterSpacing: 0.8)),
        ),
        _Card(
          padding: EdgeInsets.zero,
          child: Column(
            children: [
              for (var i = 0; i < items.length; i++) ...[
                _ServiceRow(item: items[i]),
                if (i < items.length - 1)
                  const Divider(indent: 64, endIndent: AppSpacing.lg),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class _ServiceRow extends StatelessWidget {
  const _ServiceRow({required this.item});
  final _Service item;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: item.onTap,
      child: ConstrainedBox(
        constraints: const BoxConstraints(minHeight: 56),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.sm),
          child: Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: item.color.withValues(alpha: 0.10),
                  borderRadius: BorderRadius.circular(AppRadius.sm + 2),
                ),
                child: Icon(item.icon, size: 20, color: item.color),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Text(item.label,
                    style: AppText.style(size: 14, weight: FontWeight.w600)),
              ),
              const Icon(Icons.chevron_right, size: 20, color: AppColors.textMuted),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Shared bits ───────────────────────────────────────────────────────────────

class _Card extends StatelessWidget {
  const _Card({required this.child, this.padding = const EdgeInsets.all(AppSpacing.lg)});
  final Widget child;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: padding,
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: AppRadius.card,
        border: Border.all(color: AppColors.border),
      ),
      clipBehavior: Clip.antiAlias,
      child: child,
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title, this.action, this.onAction});
  final String title;
  final String? action;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: Text(title, style: AppText.section)),
        if (action != null)
          TextButton(
            onPressed: onAction,
            style: TextButton.styleFrom(
              minimumSize: const Size(0, AppSpacing.tap),
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
            ),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              Text(action!,
                  style: AppText.style(size: 12.5, weight: FontWeight.w700, color: AppColors.accent)),
              const Icon(Icons.chevron_right, size: 18, color: AppColors.accent),
            ]),
          ),
      ],
    );
  }
}

class _GuaranteeBanner extends StatelessWidget {
  const _GuaranteeBanner();

  @override
  Widget build(BuildContext context) {
    Widget point(IconData icon, String text) => Expanded(
          child: Column(children: [
            Icon(icon, size: 20, color: AppColors.accent),
            const SizedBox(height: 4),
            Text(text,
                textAlign: TextAlign.center,
                style: AppText.style(size: 11, weight: FontWeight.w600, color: AppColors.text)),
          ]),
        );
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.chip,
        borderRadius: AppRadius.card,
        border: Border.all(color: AppColors.accentSoft),
      ),
      child: Column(
        children: [
          Row(children: [
            Container(
              width: 36,
              height: 36,
              decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle),
              child: const Icon(Icons.verified_user_outlined, size: 19, color: Colors.white),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('Mimoo Guarantee', style: AppText.style(size: 14, weight: FontWeight.w800)),
                Text('Shop with confidence on every order.',
                    style: AppText.style(size: 12, color: AppColors.textMuted)),
              ]),
            ),
          ]),
          const SizedBox(height: AppSpacing.md),
          Row(children: [
            point(Icons.workspace_premium_outlined, '100% Authentic'),
            point(Icons.currency_exchange, 'Fast refunds'),
            point(Icons.lock_outline, 'Secure escrow'),
          ]),
        ],
      ),
    );
  }
}
