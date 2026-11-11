import '../../core/api_config.dart';
import 'rider_api.dart';

/// One chat message between the rider and the buyer of a delivery job.
class DeliveryChatMessage {
  const DeliveryChatMessage({
    required this.id,
    required this.mine,
    required this.body,
    required this.createdAt,
    this.readAt,
  });

  final int id;

  /// True when the rider (this app) sent it.
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

/// Result of one poll: new messages (after the last id) + chat state.
class DeliveryChatPage {
  const DeliveryChatPage(
      {required this.messages, required this.canSend, this.counterpartName});
  final List<DeliveryChatMessage> messages;

  /// False once the delivery is finished: the chat is read-only.
  final bool canSend;
  final String? counterpartName;
}

/// Rider <-> buyer chat for one delivery job.
///
/// API mode (useMock = false): /api/rider-app/jobs/{serverId}/messages.
/// MOCK mode: messages live in memory only (per job), nothing is sent.
class DeliveryChatService {
  DeliveryChatService({required this.jobKey, this.serverId, this.mockOpen});

  /// Mock store key (MockJob.id).
  final String jobKey;

  /// delivery_jobs.id. Null for in-memory mock jobs.
  final int? serverId;

  /// MOCK only: whether the job is still active (chat open).
  final bool Function()? mockOpen;

  static const int maxLength = 500;

  static final Map<String, List<DeliveryChatMessage>> _mockStore = {};

  bool get _mock => useMock || serverId == null;

  /// New messages after [afterId] (0 = latest page).
  Future<DeliveryChatPage> fetch({int afterId = 0}) async {
    if (_mock) {
      final all = _mockStore[jobKey] ?? const <DeliveryChatMessage>[];
      return DeliveryChatPage(
        messages: all.where((m) => m.id > afterId).toList(growable: false),
        canSend: mockOpen?.call() ?? true,
        counterpartName: null,
      );
    }
    final query = afterId > 0 ? '?after_id=$afterId' : '';
    final body = await RiderApi.instance.get('/jobs/$serverId/messages$query');
    return _page(body);
  }

  /// Sends [text] (trimmed). Throws ApiException with a readable message.
  Future<DeliveryChatMessage> send(String text) async {
    final body = text.trim();
    if (body.isEmpty) throw const ApiException('Please type a message.');
    if (body.length > maxLength) {
      throw const ApiException('Messages can be up to $maxLength characters.');
    }
    if (_mock) {
      if (!(mockOpen?.call() ?? true)) {
        throw const ApiException(
            'This chat is closed. The delivery is no longer active.');
      }
      final list = _mockStore.putIfAbsent(jobKey, () => []);
      final msg = DeliveryChatMessage(
        id: list.isEmpty ? 1 : list.last.id + 1,
        mine: true,
        body: body,
        createdAt: DateTime.now(),
      );
      list.add(msg);
      return msg;
    }
    final res =
        await RiderApi.instance.post('/jobs/$serverId/messages', {'body': body});
    return DeliveryChatMessage.fromJson(
        (res['data'] as Map).cast<String, dynamic>());
  }

  /// Marks the buyer's messages as read. Errors are ignored.
  Future<void> markRead() async {
    if (_mock) return;
    try {
      await RiderApi.instance.post('/jobs/$serverId/messages/read');
    } catch (_) {}
  }

  static DeliveryChatPage _page(Map<String, dynamic> body) {
    final data = body['data'];
    final meta = (body['meta'] as Map?)?.cast<String, dynamic>() ?? const {};
    return DeliveryChatPage(
      messages: data is List
          ? data
              .whereType<Map>()
              .map((m) => DeliveryChatMessage.fromJson(m.cast<String, dynamic>()))
              .toList(growable: false)
          : const [],
      canSend: meta['can_send'] == true,
      counterpartName: meta['counterpart_name'] as String?,
    );
  }
}
