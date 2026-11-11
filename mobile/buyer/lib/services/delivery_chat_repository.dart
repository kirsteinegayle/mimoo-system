import 'api_service.dart';

/// One message between the buyer and the delivery rider of an order.
class DeliveryChatMessage {
  const DeliveryChatMessage({
    required this.id,
    required this.mine,
    required this.body,
    required this.createdAt,
    this.readAt,
  });

  final int id;

  /// True when the buyer (this app) sent it.
  final bool mine;
  final String body;
  final DateTime createdAt;
  final DateTime? readAt;

  static DeliveryChatMessage fromJson(Map<String, dynamic> j) =>
      DeliveryChatMessage(
        id: (j['id'] as num).toInt(),
        mine: j['mine'] == true,
        body: (j['body'] ?? '').toString(),
        createdAt:
            DateTime.tryParse('${j['created_at']}')?.toLocal() ?? DateTime.now(),
        readAt: DateTime.tryParse('${j['read_at']}')?.toLocal(),
      );
}

/// Result of one poll: new messages + chat state.
class DeliveryChatPage {
  const DeliveryChatPage(
      {required this.messages, required this.canSend, this.riderName});
  final List<DeliveryChatMessage> messages;

  /// False once the delivery is finished: the chat is read-only.
  final bool canSend;
  final String? riderName;
}

/// Rider chat for one order: /api/buyer/orders/{id}/chat (polling).
class DeliveryChatRepository {
  DeliveryChatRepository._();
  static final DeliveryChatRepository instance = DeliveryChatRepository._();

  static const int maxLength = 500;

  /// New messages after [afterId] (0 = latest page). A 404 with
  /// "No rider is assigned..." is thrown as ApiException.
  Future<DeliveryChatPage> fetch(int orderId, {int afterId = 0}) async {
    final res = await ApiService.get('/buyer/orders/$orderId/chat',
        queryParameters: afterId > 0 ? {'after_id': '$afterId'} : null);
    final body = res is Map ? res.cast<String, dynamic>() : <String, dynamic>{};
    final data = body['data'];
    final meta = (body['meta'] as Map?)?.cast<String, dynamic>() ?? const {};
    return DeliveryChatPage(
      messages: data is List
          ? data
              .whereType<Map>()
              .map((m) =>
                  DeliveryChatMessage.fromJson(m.cast<String, dynamic>()))
              .toList(growable: false)
          : const [],
      canSend: meta['can_send'] == true,
      riderName: meta['counterpart_name'] as String?,
    );
  }

  Future<DeliveryChatMessage> send(int orderId, String text) async {
    final res = await ApiService.post('/buyer/orders/$orderId/chat',
        body: {'body': text.trim()});
    final body = res is Map ? res.cast<String, dynamic>() : <String, dynamic>{};
    return DeliveryChatMessage.fromJson(
        (body['data'] as Map).cast<String, dynamic>());
  }

  /// Marks the rider's messages as read. Errors are ignored.
  Future<void> markRead(int orderId) async {
    try {
      await ApiService.post('/buyer/orders/$orderId/chat/read');
    } catch (_) {}
  }
}
