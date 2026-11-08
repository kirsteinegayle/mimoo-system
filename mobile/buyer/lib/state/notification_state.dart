import 'dart:async';

import 'package:flutter/widgets.dart';

import '../services/api_service.dart';

/// In-app notification model (GET /api/buyer/notifications).
class BuyerNotificationItem {
  const BuyerNotificationItem({
    required this.id,
    required this.type,
    required this.title,
    required this.body,
    required this.data,
    required this.isRead,
    this.createdAt,
  });

  final int id;
  final String type;
  final String title;
  final String body;
  final Map<String, dynamic> data;
  final bool isRead;
  final DateTime? createdAt;

  int? get orderId => (data['order_id'] as num?)?.toInt();
  int? get returnId => (data['return_id'] as num?)?.toInt();

  BuyerNotificationItem copyRead() => BuyerNotificationItem(
      id: id, type: type, title: title, body: body, data: data, isRead: true, createdAt: createdAt);

  factory BuyerNotificationItem.fromJson(Map<String, dynamic> j) => BuyerNotificationItem(
        id: (j['id'] as num).toInt(),
        type: j['type'] as String? ?? '',
        title: j['title'] as String? ?? '',
        body: j['body'] as String? ?? '',
        data: j['data'] is Map ? Map<String, dynamic>.from(j['data'] as Map) : {},
        isRead: j['is_read'] == true,
        createdAt: DateTime.tryParse(j['created_at'] as String? ?? ''),
      );
}

/// Holds the unread notification count and polls the server every 30 s
/// while the app is in the foreground and the user is logged in.
/// In-app only — no push / Firebase.
class NotificationState extends ChangeNotifier with WidgetsBindingObserver {
  NotificationState._();
  static final NotificationState instance = NotificationState._();

  static const pollInterval = Duration(seconds: 30);

  int _unread = 0;
  int get unreadCount => _unread;

  Timer? _timer;
  bool _running = false;
  bool _observing = false;

  /// Start polling (call after login / session restore).
  void start() {
    if (!_observing) {
      WidgetsBinding.instance.addObserver(this);
      _observing = true;
    }
    _running = true;
    _schedule();
    refresh();
  }

  /// Stop polling and clear the badge (call on logout).
  void stop() {
    _running = false;
    _timer?.cancel();
    _timer = null;
    if (_unread != 0) {
      _unread = 0;
      notifyListeners();
    }
  }

  void _schedule() {
    _timer?.cancel();
    _timer = Timer.periodic(pollInterval, (_) => refresh());
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (!_running) return;
    if (state == AppLifecycleState.resumed) {
      _schedule();
      refresh();
    } else if (state == AppLifecycleState.paused ||
        state == AppLifecycleState.hidden) {
      // Don't poll while the app is in the background.
      _timer?.cancel();
      _timer = null;
    }
  }

  /// Fetches the first page; updates the unread count. Returns the page
  /// (or null on error — polling failures are silent).
  Future<NotificationPage?> refresh({int page = 1}) async {
    if (ApiService.token == null) return null;
    try {
      final res = await ApiService.get('/buyer/notifications',
          queryParameters: {'page': '$page'}) as Map<String, dynamic>;
      final meta = res['meta'] as Map<String, dynamic>? ?? {};
      setUnread((meta['unread_count'] as num?)?.toInt() ?? 0);
      return NotificationPage(
        items: (res['data'] as List<dynamic>? ?? [])
            .map((e) => BuyerNotificationItem.fromJson(e as Map<String, dynamic>))
            .toList(),
        hasMore: meta['has_more'] == true,
      );
    } catch (_) {
      return null;
    }
  }

  void setUnread(int n) {
    if (n != _unread) {
      _unread = n;
      notifyListeners();
    }
  }

  Future<void> markRead(int id) async {
    final res = await ApiService.post('/buyer/notifications/$id/read')
        as Map<String, dynamic>;
    setUnread((res['unread_count'] as num?)?.toInt() ?? _unread);
  }

  Future<void> markAllRead() async {
    await ApiService.post('/buyer/notifications/read-all');
    setUnread(0);
  }
}

class NotificationPage {
  const NotificationPage({required this.items, required this.hasMore});
  final List<BuyerNotificationItem> items;
  final bool hasMore;
}
