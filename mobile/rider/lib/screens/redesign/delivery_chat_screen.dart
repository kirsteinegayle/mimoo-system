import 'dart:async';

import 'package:flutter/material.dart';

import '../../core/theme.dart';
import '../../data/api/delivery_chat_service.dart';
import '../../data/api/rider_api.dart' show ApiException;
import '../../data/parcel_flow.dart' show clock;
import '../../mock/rider_mock.dart';

/// Text chat with the buyer of one delivery job.
/// Polls every 5 s while the screen is open (no websocket). Read-only once
/// the delivery is finished ("Chat closed").
class DeliveryChatScreen extends StatefulWidget {
  const DeliveryChatScreen({super.key, required this.job});
  final MockJob job;

  @override
  State<DeliveryChatScreen> createState() => _DeliveryChatScreenState();
}

class _DeliveryChatScreenState extends State<DeliveryChatScreen> {
  static const _pollEvery = Duration(seconds: 5);

  late final DeliveryChatService _chat = DeliveryChatService(
    jobKey: widget.job.id,
    serverId: widget.job.serverId,
    mockOpen: () =>
        widget.job.stage == MockStage.readyToDeliver ||
        widget.job.stage == MockStage.outForDelivery,
  );

  final _input = TextEditingController();
  final _scroll = ScrollController();
  final List<DeliveryChatMessage> _messages = [];
  Timer? _timer;

  bool _loading = true;
  bool _polling = false;
  bool _sending = false;
  bool _canSend = true;
  String? _error;
  String? _buyerName;

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
      final page = await _chat.fetch(afterId: _lastId);
      if (!mounted) return;
      final added = _merge(page.messages);
      setState(() {
        _loading = false;
        _error = null;
        _canSend = page.canSend;
        _buyerName = page.counterpartName ?? _buyerName;
      });
      if (added.any((m) => !m.mine)) _chat.markRead();
      if (added.isNotEmpty) _scrollToEnd();
    } catch (e) {
      if (mounted) {
        setState(() {
          _loading = false;
          _error = e is ApiException ? e.message : 'Could not load messages.';
        });
      }
    } finally {
      _polling = false;
    }
  }

  /// Adds messages not seen yet (by id). Returns the new ones.
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
    if (text.isEmpty || _sending || !_canSend) return;
    setState(() => _sending = true);
    try {
      final msg = await _chat.send(text);
      if (!mounted) return;
      setState(() {
        _merge([msg]);
        _input.clear();
      });
      _scrollToEnd();
    } catch (e) {
      if (!mounted) return;
      final message = e is ApiException ? e.message : 'Message not sent. Please try again.';
      if (message.contains('closed')) setState(() => _canSend = false);
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(message)));
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  void _scrollToEnd() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) {
        _scroll.animateTo(_scroll.position.maxScrollExtent,
            duration: const Duration(milliseconds: 250), curve: Curves.easeOut);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final c = MC.of(context);
    final name = _buyerName ?? widget.job.buyerName;
    return MScaffold(
      title: 'Chat with buyer',
      onBack: () => Navigator.maybePop(context),
      body: Column(children: [
        Container(
          width: double.infinity,
          color: c.tint,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: Row(children: [
            Icon(Icons.person, size: 18, color: c.primary),
            const SizedBox(width: 8),
            Expanded(
              child: Text('$name · ${widget.job.tracking}',
                  style: MT.labelLg.copyWith(color: c.primary),
                  overflow: TextOverflow.ellipsis),
            ),
          ]),
        ),
        if (_error != null)
          Container(
            width: double.infinity,
            color: c.coralSoft,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Text('$_error Retrying…',
                style: ts(12, c: c.coral, w: FontWeight.w600)),
          ),
        Expanded(child: _list(c)),
        _canSend ? _composer(c) : _closed(c),
      ]),
    );
  }

  Widget _list(MimooColors c) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_messages.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(
            _canSend
                ? 'No messages yet. Say hi to the buyer.'
                : 'No messages in this chat.',
            textAlign: TextAlign.center,
            style: MT.bodyMd.copyWith(color: c.muted),
          ),
        ),
      );
    }
    final maxW = MediaQuery.of(context).size.width * .78;
    return ListView.builder(
      controller: _scroll,
      padding: MS.pagePadding,
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
                      color: m.mine ? c.primaryContainer : c.lowest,
                      borderRadius: BorderRadius.circular(16),
                      border: m.mine ? null : Border.all(color: c.outlineVariant),
                    ),
                    child: Text(m.body,
                        style: MT.bodyMd
                            .copyWith(color: m.mine ? Colors.white : c.text)),
                  ),
                  const SizedBox(height: 2),
                  Row(mainAxisSize: MainAxisSize.min, children: [
                    Text(clock(m.createdAt), style: MT.bodySm),
                    if (m.mine) ...[
                      const SizedBox(width: 4),
                      Icon(m.readAt != null ? Icons.done_all : Icons.done,
                          size: 14, color: c.primaryContainer),
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

  Widget _composer(MimooColors c) => SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
          child: Row(children: [
            Expanded(
              child: TextField(
                controller: _input,
                maxLength: DeliveryChatService.maxLength,
                minLines: 1,
                maxLines: 4,
                textInputAction: TextInputAction.send,
                onSubmitted: (_) => _send(),
                decoration: InputDecoration(
                  hintText: 'Type a message...',
                  counterText: '',
                  filled: true,
                  fillColor: c.low,
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
              style: IconButton.styleFrom(backgroundColor: c.primaryContainer),
              icon: _sending
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white))
                  : const Icon(Icons.send),
            ),
          ]),
        ),
      );

  Widget _closed(MimooColors c) => SafeArea(
        top: false,
        child: Container(
          width: double.infinity,
          margin: const EdgeInsets.all(12),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
              color: c.container, borderRadius: BorderRadius.circular(14)),
          child: Row(children: [
            Icon(Icons.lock_outline, color: c.muted),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                'Chat closed. This delivery is no longer active, so you can only read past messages.',
                style: MT.bodySm.copyWith(color: c.muted),
              ),
            ),
          ]),
        ),
      );
}
