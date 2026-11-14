import 'package:flutter/foundation.dart';

import '../../core/api_config.dart';
import 'rider_api.dart';

/// A person the rider may message (GET /api/rider-app/messaging/contacts): the rider's own courier company.
class TeamContact {
  const TeamContact({required this.role, required this.id, required this.name});
  final String role;
  final int id;
  final String name;

  static TeamContact fromJson(Map<String, dynamic> j) => TeamContact(
        role: '${j['role']}',
        id: (j['id'] as num).toInt(),
        name: (j['name'] ?? 'Courier').toString(),
      );
}

/// One conversation row (GET /messaging/threads).
class TeamThread {
  const TeamThread({
    required this.id,
    required this.name,
    required this.role,
    required this.unread,
    this.lastBody,
    this.lastAt,
  });
  final int id;
  final String name;
  final String role;
  final int unread;
  final String? lastBody;
  final DateTime? lastAt;

  static TeamThread fromJson(Map<String, dynamic> j) {
    final last = j['last_message'];
    return TeamThread(
      id: (j['id'] as num).toInt(),
      name: (j['counterpart_name'] ?? 'Conversation').toString(),
      role: (j['counterpart_role'] ?? '').toString(),
      unread: (j['unread_count'] as num?)?.toInt() ?? 0,
      lastBody: last is Map ? last['body']?.toString() : null,
      lastAt: DateTime.tryParse('${j['last_message_at']}')?.toLocal(),
    );
  }
}

class TeamMessage {
  const TeamMessage({
    required this.id,
    required this.mine,
    required this.body,
    required this.createdAt,
    this.readAt,
  });
  final int id;
  final bool mine;
  final String body;
  final DateTime createdAt;
  final DateTime? readAt;

  static TeamMessage fromJson(Map<String, dynamic> j) => TeamMessage(
        id: (j['id'] as num).toInt(),
        mine: j['is_mine'] == true,
        body: (j['body'] ?? (j['image_url'] != null ? '[Photo]' : '')).toString(),
        createdAt: DateTime.tryParse('${j['created_at']}')?.toLocal() ?? DateTime.now(),
        readAt: DateTime.tryParse('${j['read_at']}')?.toLocal(),
      );
}

/// Rider <-> courier company messages (/api/rider-app/messaging/*). This is NOT the buyer chat
/// (DeliveryChatService, delivery_messages), which is untouched. Text only; the server also
/// accepts a photo but the app does not send one yet.
class TeamMessagesService {
  TeamMessagesService._();
  static final TeamMessagesService instance = TeamMessagesService._();

  static const int maxLength = 500;

  /// Unread messages across all conversations (last value seen). The profile badge listens to it.
  static final ValueNotifier<int> unread = ValueNotifier<int>(0);

  RiderApi get _api => RiderApi.instance;

  void _needServer() {
    if (useMock) {
      throw const ApiException('Messages need the server. Turn off demo mode to use them.');
    }
  }

  Future<List<TeamThread>> threads() async {
    _needServer();
    final body = await _api.get('/messaging/threads');
    final data = body['data'];
    final meta = (body['meta'] as Map?)?.cast<String, dynamic>() ?? const {};
    unread.value = (meta['unread_total'] as num?)?.toInt() ?? 0;
    return data is List
        ? data.whereType<Map>().map((m) => TeamThread.fromJson(m.cast<String, dynamic>())).toList(growable: false)
        : const [];
  }

  Future<void> refreshUnread() async {
    try {
      await threads();
    } catch (_) {
      // badge stays as it was
    }
  }

  Future<List<TeamContact>> contacts() async {
    _needServer();
    final body = await _api.get('/messaging/contacts');
    final data = body['data'];
    return data is List
        ? data.whereType<Map>().map((m) => TeamContact.fromJson(m.cast<String, dynamic>())).toList(growable: false)
        : const [];
  }

  /// Get-or-create the conversation with [c]; returns its thread id.
  Future<int> start(TeamContact c) async {
    _needServer();
    final res = await _api.post('/messaging/start', {'role': c.role, 'id': c.id});
    return ((res['data'] as Map)['id'] as num).toInt();
  }

  /// Messages after [afterId] (0 = latest page). The server marks the thread read.
  Future<({List<TeamMessage> messages, String name})> messages(int threadId, {int afterId = 0}) async {
    _needServer();
    final q = afterId > 0 ? '?after_id=$afterId' : '';
    final body = await _api.get('/messaging/threads/$threadId/messages$q');
    final data = body['data'];
    final thread = (body['thread'] as Map?)?.cast<String, dynamic>() ?? const {};
    return (
      messages: data is List
          ? data.whereType<Map>().map((m) => TeamMessage.fromJson(m.cast<String, dynamic>())).toList(growable: false)
          : const <TeamMessage>[],
      name: (thread['name'] ?? 'Conversation').toString(),
    );
  }

  Future<TeamMessage> send(int threadId, String text) async {
    _needServer();
    final body = text.trim();
    if (body.isEmpty) throw const ApiException('Please type a message.');
    if (body.length > maxLength) {
      throw const ApiException('Messages can be up to $maxLength characters.');
    }
    final res = await _api.post('/messaging/threads/$threadId/messages', {'body': body});
    return TeamMessage.fromJson((res['data'] as Map).cast<String, dynamic>());
  }
}
