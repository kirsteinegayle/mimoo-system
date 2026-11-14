import 'package:flutter/material.dart';
import '../../models/courier_models.dart';
import '../../services/api_service.dart';
import '../../services/courier_repository.dart';
import '../../theme/mimoo_theme.dart';
import '../../widgets/courier_shared.dart';
import '../trips/trip_detail_page.dart';

class NotificationsPage extends StatefulWidget {
  const NotificationsPage({super.key});

  @override
  State<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends State<NotificationsPage> {
  final List<CourierNotificationItem> _items = [];
  PageMeta? _meta;
  bool _loading = true;
  bool _loadingMore = false;
  bool _markingAll = false;
  String? _error;
  String _filter = 'all';
  String _category = 'all';

  static const _categories = [
    ('all', 'All'),
    ('pickups', 'Pickups'),
    ('deliveries', 'Deliveries'),
    ('messages', 'Messages'),
  ];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
      _items.clear();
    });
    try {
      final r = await CourierRepository.instance.notifications(
        filter: _filter,
        category: _category,
      );
      if (!mounted) return;
      setState(() {
        _items.addAll(r.items);
        _meta = r.meta;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = ApiService.friendlyError(e);
      });
    }
  }

  Future<void> _loadMore() async {
    if (_loadingMore || _meta == null || !_meta!.hasMore) return;
    setState(() => _loadingMore = true);
    try {
      final r = await CourierRepository.instance.notifications(
        filter: _filter,
        category: _category,
        page: _meta!.currentPage + 1,
      );
      if (!mounted) return;
      setState(() {
        _items.addAll(r.items);
        _meta = r.meta;
        _loadingMore = false;
      });
    } catch (_) {
      if (mounted) setState(() => _loadingMore = false);
    }
  }

  Future<void> _open(CourierNotificationItem n) async {
    if (!n.isRead) {
      try {
        await CourierRepository.instance.markNotificationRead(n.id);
        if (mounted) {
          setState(() {
            final i = _items.indexWhere((x) => x.id == n.id);
            if (i >= 0) {
              _items[i] = CourierNotificationItem(
                id: n.id,
                category: n.category,
                type: n.type,
                title: n.title,
                body: n.body,
                isRead: true,
                createdAt: n.createdAt,
                timeAgo: n.timeAgo,
                relatedType: n.relatedType,
                relatedId: n.relatedId,
              );
            }
          });
        }
      } catch (_) {}
    }

    if (n.relatedType == 'trip' && n.relatedId != null && mounted) {
      await Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => TripDetailPage(id: n.relatedId!),
        ),
      );
      if (mounted) _load();
    }
  }

  Future<void> _markAll() async {
    if (_markingAll) return;
    setState(() => _markingAll = true);
    try {
      await CourierRepository.instance.markAllNotificationsRead();
      if (!mounted) return;
      await _load();
      if (mounted) courierSnack(context, 'All caught up.', kGreen);
    } catch (e) {
      if (mounted) {
        courierSnack(context, ApiService.friendlyError(e), kFlash);
      }
    } finally {
      if (mounted) setState(() => _markingAll = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final hasUnread = _items.any((n) => !n.isRead);
    return Scaffold(
      backgroundColor: kSurface,
      appBar: AppBar(
        backgroundColor: kCard,
        title: Text('Notifications',
            style: pjs(size: 17, weight: FontWeight.w800)),
        actions: [
          TextButton(
            onPressed: _markingAll || !hasUnread ? null : _markAll,
            child: Text('Mark all read',
                style: pjs(
                    size: 12,
                    weight: FontWeight.w700,
                    color: hasUnread ? kPrimary : kSubtext)),
          ),
        ],
      ),
      body: Column(children: [
        Container(
          color: kCard,
          padding: const EdgeInsets.fromLTRB(12, 4, 12, 2),
          child: Row(children: [
            _TabPill(
              label: 'All',
              selected: _filter == 'all',
              onTap: () {
                setState(() => _filter = 'all');
                _load();
              },
            ),
            const SizedBox(width: 8),
            _TabPill(
              label: 'Unread',
              selected: _filter == 'unread',
              onTap: () {
                setState(() => _filter = 'unread');
                _load();
              },
            ),
          ]),
        ),
        SizedBox(
          height: 44,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            children: _categories.map((c) {
              final selected = _category == c.$1;
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: FilterChip(
                  label: Text(c.$2,
                      style: pjs(
                          size: 12,
                          weight: FontWeight.w600,
                          color: selected ? Colors.white : kSubtext)),
                  selected: selected,
                  onSelected: (_) {
                    setState(() => _category = c.$1);
                    _load();
                  },
                  selectedColor: kPrimary,
                  backgroundColor: kSurface,
                  checkmarkColor: Colors.white,
                  side: BorderSide(color: selected ? kPrimary : kBorder),
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                ),
              );
            }).toList(),
          ),
        ),
        const Divider(height: 1, color: kBorder),
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator(color: kPrimary))
              : _error != null
                  ? CourierErrorState(message: _error!, onRetry: _load)
                  : _items.isEmpty
                      ? const CourierEmptyState(
                          icon: Icons.notifications_none,
                          message: 'No notifications here yet.')
                      : RefreshIndicator(
                          color: kPrimary,
                          onRefresh: _load,
                          child: NotificationListener<ScrollNotification>(
                            onNotification: (n) {
                              if (n.metrics.pixels >=
                                  n.metrics.maxScrollExtent - 200) {
                                _loadMore();
                              }
                              return false;
                            },
                            child: ListView.builder(
                              padding: const EdgeInsets.all(12),
                              itemCount:
                                  _items.length + (_loadingMore ? 1 : 0),
                              itemBuilder: (_, i) {
                                if (i == _items.length) {
                                  return const Center(
                                    child: Padding(
                                      padding: EdgeInsets.all(16),
                                      child: CircularProgressIndicator(
                                          color: kPrimary),
                                    ),
                                  );
                                }
                                final n = _items[i];
                                return _NotificationCard(
                                  item: n,
                                  onTap: () => _open(n),
                                );
                              },
                            ),
                          ),
                        ),
        ),
      ]),
    );
  }
}

class _TabPill extends StatelessWidget {
  const _TabPill({
    required this.label,
    required this.selected,
    required this.onTap,
  });
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(99),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
        decoration: BoxDecoration(
          color: selected ? kChip : Colors.transparent,
          borderRadius: BorderRadius.circular(99),
        ),
        child: Text(label,
            style: pjs(
                size: 12,
                weight: FontWeight.w700,
                color: selected ? kPrimary : kSubtext)),
      ),
    );
  }
}

class _NotificationCard extends StatelessWidget {
  const _NotificationCard({required this.item, required this.onTap});
  final CourierNotificationItem item;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final icon = switch (item.category) {
      'shipments' || 'deliveries' => Icons.local_shipping_outlined,
      'messages' => Icons.chat_bubble_outline,
      'pickups' => Icons.inventory_2_outlined,
      'payments' => Icons.payments_outlined,
      _ => Icons.info_outline,
    };
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: item.isRead ? kCard : kChip.withValues(alpha: 0.45),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
              color: item.isRead ? kBorder : kPrimary.withValues(alpha: 0.25)),
        ),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Container(
            width: 38,
            height: 38,
            decoration: const BoxDecoration(
                color: kChip, shape: BoxShape.circle),
            child: Icon(icon, size: 19, color: kPrimary),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(children: [
                    Expanded(
                      child: Text(item.title,
                          style: pjs(size: 13, weight: FontWeight.w800)),
                    ),
                    if (!item.isRead)
                      Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                            color: kFlash, shape: BoxShape.circle),
                      ),
                  ]),
                  const SizedBox(height: 3),
                  Text(item.body,
                      style: pjs(size: 12, color: kSubtext, height: 1.35)),
                  const SizedBox(height: 5),
                  Text(item.timeAgo.isEmpty ? item.createdAt : item.timeAgo,
                      style: pjs(size: 10, color: kSubtext)),
                ]),
          ),
        ]),
      ),
    );
  }
}
