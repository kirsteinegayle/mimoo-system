import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../state/auth_service.dart';
import '../../state/notification_state.dart';
import '../orders/api_order_detail_page.dart';
import '../orders/return_request_pages.dart';
import '../../theme/app_theme.dart';

// ── Color tokens ──────────────────────────────────────────────────────────────
const _kPrimary = AppColors.primary;
const _kSecondary = AppColors.accent;
const _kFlash = AppColors.flash;
const _kGreen = AppColors.success;
const _kSurface = AppColors.surface;
const _kCard = AppColors.card;
const _kChip = AppColors.chip;
const _kText = AppColors.text;
const _kSubtext = AppColors.textMuted;

TextStyle _pjs({
  double size = 14,
  FontWeight weight = FontWeight.w400,
  Color color = _kText,
  double? height,
}) =>
    GoogleFonts.plusJakartaSans(
        fontSize: size, fontWeight: weight, color: color, height: height);

/// Real in-app notifications (GET /api/buyer/notifications).
/// Unread items are bold; tapping marks read and opens the order / return.
class NotificationsPage extends StatefulWidget {
  const NotificationsPage({super.key});

  @override
  State<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends State<NotificationsPage> {
  final _state = NotificationState.instance;
  final List<BuyerNotificationItem> _items = [];
  bool _loading = true;
  bool _loadingMore = false;
  bool _hasMore = false;
  int _page = 1;
  String? _error;
  int _lastUnread = -1;

  @override
  void initState() {
    super.initState();
    _load();
    // When the 30 s poll sees a different unread count, refresh the list.
    _state.addListener(_onStateChanged);
  }

  @override
  void dispose() {
    _state.removeListener(_onStateChanged);
    super.dispose();
  }

  void _onStateChanged() {
    final n = _state.unreadCount;
    if (_lastUnread != -1 && n > _lastUnread && !_loading) _load(silent: true);
    _lastUnread = n;
  }

  Future<void> _load({bool silent = false}) async {
    if (!AuthService.instance.isLoggedIn) {
      setState(() {
        _loading = false;
        _error = 'Log in to see your notifications.';
      });
      return;
    }
    if (!silent) {
      setState(() {
        _loading = true;
        _error = null;
      });
    }
    final page = await _state.refresh(page: 1);
    if (!mounted) return;
    setState(() {
      _loading = false;
      _lastUnread = _state.unreadCount;
      if (page == null) {
        if (!silent) _error = 'Could not load notifications.';
      } else {
        _error = null;
        _items
          ..clear()
          ..addAll(page.items);
        _hasMore = page.hasMore;
        _page = 1;
      }
    });
  }

  Future<void> _loadMore() async {
    setState(() => _loadingMore = true);
    final page = await _state.refresh(page: _page + 1);
    if (!mounted) return;
    setState(() {
      _loadingMore = false;
      if (page != null) {
        _items.addAll(page.items);
        _hasMore = page.hasMore;
        _page += 1;
      }
    });
  }

  Future<void> _open(int index) async {
    final n = _items[index];
    if (!n.isRead) {
      setState(() => _items[index] = n.copyRead());
      try {
        await _state.markRead(n.id);
      } catch (_) {/* badge resyncs on next poll */}
    }
    if (!mounted) return;
    if (n.returnId != null) {
      await Navigator.push(context,
          MaterialPageRoute(builder: (_) => ReturnStatusPage(returnId: n.returnId!)));
    } else if (n.orderId != null) {
      await Navigator.push(context,
          MaterialPageRoute(builder: (_) => ApiOrderDetailPage(orderId: n.orderId!)));
    }
  }

  Future<void> _markAll() async {
    try {
      await _state.markAllRead();
      if (!mounted) return;
      setState(() {
        for (var i = 0; i < _items.length; i++) {
          _items[i] = _items[i].copyRead();
        }
      });
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Could not mark all as read. Please try again.'),
        behavior: SnackBarBehavior.floating,
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    final hasUnread = _items.any((n) => !n.isRead);
    return Scaffold(
      backgroundColor: _kSurface,
      appBar: AppBar(
        backgroundColor: _kCard,
        foregroundColor: _kPrimary,
        elevation: 0.5,
        title: Text('Notifications',
            style: _pjs(size: 17, weight: FontWeight.w800, color: _kPrimary)),
        actions: [
          if (hasUnread)
            TextButton(
              onPressed: _markAll,
              child: Text('Mark all as read',
                  style: _pjs(size: 12, weight: FontWeight.w700, color: _kSecondary)),
            ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(mainAxisSize: MainAxisSize.min, children: [
                    Text(_error!, style: _pjs(color: _kSubtext)),
                    const SizedBox(height: 8),
                    if (AuthService.instance.isLoggedIn)
                      OutlinedButton(onPressed: _load, child: const Text('Retry')),
                  ]),
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  child: _items.isEmpty
                      ? ListView(children: [
                          const SizedBox(height: 120),
                          const Icon(Icons.notifications_none_outlined,
                              size: 56, color: _kSubtext),
                          const SizedBox(height: 12),
                          Center(
                              child: Text('No notifications yet.',
                                  style: _pjs(color: _kSubtext))),
                        ])
                      : ListView.builder(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          itemCount: _items.length + (_hasMore ? 1 : 0),
                          itemBuilder: (_, i) {
                            if (i == _items.length) {
                              return Center(
                                child: TextButton(
                                  onPressed: _loadingMore ? null : _loadMore,
                                  child: Text(_loadingMore ? 'Loading…' : 'Load more'),
                                ),
                              );
                            }
                            return _NotifTile(item: _items[i], onTap: () => _open(i));
                          },
                        ),
                ),
    );
  }
}

class _NotifTile extends StatelessWidget {
  const _NotifTile({required this.item, required this.onTap});
  final BuyerNotificationItem item;
  final VoidCallback onTap;

  (IconData, Color) get _look {
    final status = item.data['status'] as String? ?? '';
    if (item.type == 'return_status') return (Icons.assignment_return_outlined, _kSecondary);
    switch (status) {
      case 'shipped':
        return (Icons.local_shipping_outlined, _kSecondary);
      case 'completed':
        return (Icons.check_circle_outline, _kGreen);
      case 'cancelled':
        return (Icons.cancel_outlined, _kFlash);
      case 'packed':
        return (Icons.inventory_2_outlined, _kPrimary);
      default:
        return (Icons.receipt_long_outlined, _kPrimary);
    }
  }

  String _ago(DateTime? t) {
    if (t == null) return '';
    final d = DateTime.now().difference(t.toLocal());
    if (d.inMinutes < 1) return 'Just now';
    if (d.inHours < 1) return '${d.inMinutes}m ago';
    if (d.inDays < 1) return '${d.inHours}h ago';
    if (d.inDays < 7) return '${d.inDays}d ago';
    final l = t.toLocal();
    return '${l.year}-${l.month.toString().padLeft(2, '0')}-${l.day.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final (icon, color) = _look;
    final unread = !item.isRead;
    return InkWell(
      onTap: onTap,
      child: Container(
        color: unread ? _kChip.withValues(alpha: 0.55) : _kCard,
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
        margin: const EdgeInsets.only(bottom: 1),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.12),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 19, color: color),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(item.title,
                      style: _pjs(
                          size: 13,
                          weight: unread ? FontWeight.w800 : FontWeight.w500)),
                  const SizedBox(height: 2),
                  Text(item.body,
                      style: _pjs(
                          size: 12,
                          color: unread ? _kText : _kSubtext,
                          weight: unread ? FontWeight.w600 : FontWeight.w400,
                          height: 1.4)),
                  const SizedBox(height: 4),
                  Text(_ago(item.createdAt), style: _pjs(size: 10, color: _kSubtext)),
                ],
              ),
            ),
            if (unread)
              Container(
                margin: const EdgeInsets.only(top: 6, left: 6),
                width: 8,
                height: 8,
                decoration: const BoxDecoration(color: _kFlash, shape: BoxShape.circle),
              ),
          ],
        ),
      ),
    );
  }
}
