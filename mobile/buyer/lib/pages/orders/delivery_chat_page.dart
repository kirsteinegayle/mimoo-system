import 'dart:async';

import 'package:flutter/material.dart';

import '../../services/api_service.dart';
import '../../services/delivery_chat_repository.dart';
import '../../theme/app_theme.dart';

/// Text chat with the delivery rider of one order.
/// Polls every 5 s while the page is open (no websocket). Read-only once the
/// delivery is finished ("Chat closed").
class DeliveryChatPage extends StatefulWidget {
  const DeliveryChatPage(
      {super.key, required this.orderId, required this.orderNumber});
  final int orderId;
  final String orderNumber;

  @override
  State<DeliveryChatPage> createState() => _DeliveryChatPageState();
}

class _DeliveryChatPageState extends State<DeliveryChatPage> {
  static const _pollEvery = Duration(seconds: 5);
  final _repo = DeliveryChatRepository.instance;

  final _input = TextEditingController();
  final _scroll = ScrollController();
  final List<DeliveryChatMessage> _messages = [];
  Timer? _timer;

  bool _loading = true;
  bool _polling = false;
  bool _sending = false;
  bool _canSend = false;

  /// No delivery job yet (404 from the server).
  bool _noRider = false;
  String? _error;
  String? _riderName;

  int get _lastId => _messages.isEmpty ? 0 : _messages.last.id;

  @override
  void initState() {
    super.initState();
    _poll();
    _timer = Timer.periodic(_pollEvery, (_) => _poll());
  }

  @override
  void dispose() {
    _timer?.cancel();
    _input.dispose();
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _poll() async {
    if (_polling) return;
    _polling = true;
    try {
      final page = await _repo.fetch(widget.orderId, afterId: _lastId);
      if (!mounted) return;
      final added = _merge(page.messages);
      setState(() {
        _loading = false;
        _noRider = false;
        _error = null;
        _canSend = page.canSend;
        _riderName = page.riderName ?? _riderName;
      });
      if (added.any((m) => !m.mine)) _repo.markRead(widget.orderId);
      if (added.isNotEmpty) _scrollToEnd();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        if (e is ApiException && e.statusCode == 404) {
          _noRider = true;
          _canSend = false;
          _error = null;
        } else {
          _error = ApiService.friendlyError(e);
        }
      });
    } finally {
      _polling = false;
    }
  }

  List<DeliveryChatMessage> _merge(List<DeliveryChatMessage> incoming) {
    final known = _messages.map((m) => m.id).toSet();
    final added = incoming.where((m) => !known.contains(m.id)).toList();
    _messages
      ..addAll(added)
      ..sort((a, b) => a.id.compareTo(b.id));
    return added;
  }

  Future<void> _send() async {
    final text = _input.text.trim();
    if (_sending || !_canSend) return;
    if (text.isEmpty) {
      _snack('Please type a message.');
      return;
    }
    setState(() => _sending = true);
    try {
      final msg = await _repo.send(widget.orderId, text);
      if (!mounted) return;
      setState(() {
        _merge([msg]);
        _input.clear();
      });
      _scrollToEnd();
    } catch (e) {
      if (!mounted) return;
      final message = ApiService.friendlyError(e);
      if (message.contains('closed')) setState(() => _canSend = false);
      _snack(message);
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  void _snack(String text) => ScaffoldMessenger.of(context)
      .showSnackBar(SnackBar(content: Text(text)));

  void _scrollToEnd() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) {
        _scroll.animateTo(_scroll.position.maxScrollExtent,
            duration: const Duration(milliseconds: 250), curve: Curves.easeOut);
      }
    });
  }

  String _time(DateTime t) {
    final h = t.hour % 12 == 0 ? 12 : t.hour % 12;
    final m = t.minute.toString().padLeft(2, '0');
    return '$h:$m ${t.hour < 12 ? 'AM' : 'PM'}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(_riderName != null ? 'Chat with $_riderName' : 'Chat with Rider',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
          Text(widget.orderNumber,
              style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
        ]),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.primary,
        elevation: 0.5,
      ),
      body: Column(children: [
        if (_error != null)
          Container(
            width: double.infinity,
            color: AppColors.warningBg,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Text('$_error Retrying…',
                style: const TextStyle(fontSize: 12, color: AppColors.warningText)),
          ),
        Expanded(child: _list()),
        if (_canSend) _composer() else if (!_loading) _closed(),
      ]),
    );
  }

  Widget _list() {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_messages.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(
            _noRider
                ? 'No rider is assigned to this order yet.'
                : _canSend
                    ? 'No messages yet. Say hi to your rider.'
                    : 'No messages in this chat.',
            textAlign: TextAlign.center,
            style: const TextStyle(color: AppColors.textMuted),
          ),
        ),
      );
    }
    final maxW = MediaQuery.of(context).size.width * .78;
    return ListView.builder(
      controller: _scroll,
      padding: const EdgeInsets.all(16),
      itemCount: _messages.length,
      itemBuilder: (context, i) {
        final m = _messages[i];
        return Align(
          alignment: m.mine ? Alignment.centerRight : Alignment.centerLeft,
          child: ConstrainedBox(
            constraints: BoxConstraints(maxWidth: maxW),
            child: Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Column(
                crossAxisAlignment:
                    m.mine ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: m.mine ? AppColors.accent : Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: m.mine ? null : Border.all(color: AppColors.border),
                    ),
                    child: Text(m.body,
                        style: TextStyle(
                            color: m.mine ? Colors.white : AppColors.text)),
                  ),
                  const SizedBox(height: 2),
                  Row(mainAxisSize: MainAxisSize.min, children: [
                    Text(_time(m.createdAt),
                        style: const TextStyle(
                            fontSize: 11, color: AppColors.textMuted)),
                    if (m.mine) ...[
                      const SizedBox(width: 4),
                      Icon(m.readAt != null ? Icons.done_all : Icons.done,
                          size: 14, color: AppColors.accent),
                    ],
                  ]),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _composer() => SafeArea(
        top: false,
        child: Container(
          color: Colors.white,
          padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
          child: Row(children: [
            Expanded(
              child: TextField(
                controller: _input,
                maxLength: DeliveryChatRepository.maxLength,
                minLines: 1,
                maxLines: 4,
                textInputAction: TextInputAction.send,
                onSubmitted: (_) => _send(),
                decoration: InputDecoration(
                  hintText: 'Type a message...',
                  counterText: '',
                  filled: true,
                  fillColor: AppColors.inputFill,
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(24),
                      borderSide: BorderSide.none),
                ),
              ),
            ),
            const SizedBox(width: 8),
            IconButton.filled(
              tooltip: 'Send',
              onPressed: _sending ? null : _send,
              style: IconButton.styleFrom(backgroundColor: AppColors.accent),
              icon: _sending
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white))
                  : const Icon(Icons.send, color: Colors.white),
            ),
          ]),
        ),
      );

  Widget _closed() => SafeArea(
        top: false,
        child: Container(
          width: double.infinity,
          margin: const EdgeInsets.all(12),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border)),
          child: Row(children: [
            const Icon(Icons.lock_outline, color: AppColors.textMuted),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                _noRider
                    ? 'You can chat once a rider is assigned to your parcel.'
                    : 'Chat closed. This delivery is no longer active, so you can only read past messages.',
                style: const TextStyle(fontSize: 13, color: AppColors.textMuted),
              ),
            ),
          ]),
        ),
      );
}
