import 'dart:async';

import 'package:flutter/material.dart';

import '../../core/theme.dart';
import '../../data/api/rider_api.dart' show ApiException;
import '../../data/api/team_messages_service.dart';
import '../../data/parcel_flow.dart' show clock;

String _err(Object e, String fallback) => e is ApiException ? e.message : fallback;

/// Messages with the rider's own courier company (real server data; not the buyer chat).
/// Polls every 5 s while open. Shows loading, empty and error states.
class TeamMessagesScreen extends StatefulWidget {
  const TeamMessagesScreen({super.key});

  @override
  State<TeamMessagesScreen> createState() => _TeamMessagesScreenState();
}

class _TeamMessagesScreenState extends State<TeamMessagesScreen> {
  final _svc = TeamMessagesService.instance;
  List<TeamThread> _threads = const [];
  bool _loading = true;
  bool _polling = false;
  String? _error;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _load();
    _timer = Timer.periodic(const Duration(seconds: 5), (_) => _load(silent: true));
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _load({bool silent = false}) async {
    if (_polling) return;
    _polling = true;
    if (!silent && mounted) setState(() => _error = null);
    try {
      final list = await _svc.threads();
      if (!mounted) return;
      setState(() {
        _threads = list;
        _loading = false;
        _error = null;
      });
    } catch (e) {
      if (!mounted) return;
      if (!silent || _threads.isEmpty) {
        setState(() {
          _loading = false;
          _error = _err(e, 'Could not load messages. Please try again.');
        });
      }
    } finally {
      _polling = false;
    }
  }

  Future<void> _open(int id, String name) async {
    await Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => TeamChatScreen(threadId: id, name: name)));
    if (mounted) _load(silent: true);
  }

  Future<void> _newConversation() async {
    final c = MC.of(context);
    List<TeamContact> contacts;
    try {
      contacts = await _svc.contacts();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(_err(e, 'Could not load contacts.'))));
      return;
    }
    if (!mounted) return;
    final picked = await showModalBottomSheet<TeamContact>(
      context: context,
      showDragHandle: true,
      builder: (ctx) => SafeArea(
        child: contacts.isEmpty
            ? Padding(
                padding: const EdgeInsets.all(24),
                child: Text('No one is available to message. Ask your courier company to approve your account.',
                    style: MT.bodyMd.copyWith(color: c.muted)))
            : ListView(shrinkWrap: true, children: [
                for (final t in contacts)
                  ListTile(
                    leading: Icon(Icons.business_outlined, color: c.primary),
                    title: Text(t.name, style: MT.labelLg),
                    subtitle: const Text('Courier company'),
                    onTap: () => Navigator.pop(ctx, t),
                  ),
              ]),
      ),
    );
    if (picked == null || !mounted) return;
    try {
      final id = await _svc.start(picked);
      if (mounted) await _open(id, picked.name);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(_err(e, 'Could not start the conversation.'))));
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = MC.of(context);
    return MScaffold(
      title: 'Messages',
      onBack: () => Navigator.maybePop(context),
      body: Stack(children: [
        _body(c),
        Positioned(
          right: 16,
          bottom: 16,
          child: SafeArea(
            child: FloatingActionButton.extended(
              onPressed: _newConversation,
              backgroundColor: c.primaryContainer,
              foregroundColor: Colors.white,
              icon: const Icon(Icons.edit_outlined),
              label: const Text('New message'),
            ),
          ),
        ),
      ]),
    );
  }

  Widget _body(MimooColors c) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null && _threads.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Icon(Icons.cloud_off_outlined, size: 40, color: c.muted),
            const SizedBox(height: 10),
            Text(_error!, textAlign: TextAlign.center, style: MT.bodyMd.copyWith(color: c.muted)),
            const SizedBox(height: 12),
            OutlinedButton(
              onPressed: () {
                setState(() => _loading = true);
                _load();
              },
              child: const Text('Try again'),
            ),
          ]),
        ),
      );
    }
    if (_threads.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text('No conversations yet. Tap "New message" to write to your courier company.',
              textAlign: TextAlign.center, style: MT.bodyMd.copyWith(color: c.muted)),
        ),
      );
    }
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.separated(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 96),
        itemCount: _threads.length,
        separatorBuilder: (_, __) => const SizedBox(height: 8),
        itemBuilder: (_, i) {
          final t = _threads[i];
          return InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: () => _open(t.id, t.name),
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: c.lowest,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: c.outlineVariant),
              ),
              child: Row(children: [
                CircleAvatar(backgroundColor: c.tint, child: Icon(Icons.business_outlined, color: c.primary)),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Row(children: [
                      Expanded(child: Text(t.name, style: MT.labelLg, overflow: TextOverflow.ellipsis)),
                      if (t.lastAt != null) Text(clock(t.lastAt!), style: MT.bodySm),
                    ]),
                    const SizedBox(height: 2),
                    Text(t.lastBody ?? 'No messages yet',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: MT.bodySm.copyWith(color: c.muted)),
                  ]),
                ),
                if (t.unread > 0) ...[
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(color: c.coral, borderRadius: BorderRadius.circular(99)),
                    child: Text('${t.unread}', style: ts(11, c: Colors.white, w: FontWeight.w800)),
                  ),
                ],
              ]),
            ),
          );
        },
      ),
    );
  }
}

/// One conversation. Polls every 5 s; the server marks it read when fetched.
class TeamChatScreen extends StatefulWidget {
  const TeamChatScreen({super.key, required this.threadId, required this.name});
  final int threadId;
  final String name;

  @override
  State<TeamChatScreen> createState() => _TeamChatScreenState();
}

class _TeamChatScreenState extends State<TeamChatScreen> {
  final _svc = TeamMessagesService.instance;
  final _input = TextEditingController();
  final _scroll = ScrollController();
  final List<TeamMessage> _messages = [];
  Timer? _timer;
  bool _loading = true;
  bool _polling = false;
  bool _sending = false;
  String? _error;

  int get _lastId => _messages.isEmpty ? 0 : _messages.last.id;

  @override
  void initState() {
    super.initState();
    _poll();
    _timer = Timer.periodic(const Duration(seconds: 5), (_) => _poll());
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
      final r = await _svc.messages(widget.threadId, afterId: _lastId);
      if (!mounted) return;
      final added = _merge(r.messages);
      setState(() {
        _loading = false;
        _error = null;
      });
      if (added.isNotEmpty) {
        _scrollToEnd();
        _svc.refreshUnread();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _loading = false;
          _error = _err(e, 'Could not load messages.');
        });
      }
    } finally {
      _polling = false;
    }
  }

  List<TeamMessage> _merge(List<TeamMessage> incoming) {
    final known = _messages.map((m) => m.id).toSet();
    final added = incoming.where((m) => !known.contains(m.id)).toList();
    _messages
      ..addAll(added)
      ..sort((a, b) => a.id.compareTo(b.id));
    return added;
  }

  Future<void> _send() async {
    final text = _input.text.trim();
    if (text.isEmpty || _sending) return;
    setState(() => _sending = true);
    try {
      final m = await _svc.send(widget.threadId, text);
      if (!mounted) return;
      setState(() {
        _merge([m]);
        _input.clear();
      });
      _scrollToEnd();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(_err(e, 'Message not sent. Please try again.'))));
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
    return MScaffold(
      title: widget.name,
      onBack: () => Navigator.maybePop(context),
      body: Column(children: [
        if (_error != null && _messages.isNotEmpty)
          Container(
            width: double.infinity,
            color: c.coralSoft,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Text('$_error Retrying…', style: ts(12, c: c.coral, w: FontWeight.w600)),
          ),
        Expanded(child: _list(c)),
        SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
            child: Row(children: [
              Expanded(
                child: TextField(
                  controller: _input,
                  maxLength: TeamMessagesService.maxLength,
                  minLines: 1,
                  maxLines: 4,
                  textInputAction: TextInputAction.send,
                  onSubmitted: (_) => _send(),
                  decoration: InputDecoration(
                    hintText: 'Type a message...',
                    counterText: '',
                    filled: true,
                    fillColor: c.low,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              IconButton.filled(
                tooltip: 'Send',
                onPressed: _sending ? null : _send,
                style: IconButton.styleFrom(backgroundColor: c.primaryContainer),
                icon: _sending
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Icon(Icons.send),
              ),
            ]),
          ),
        ),
      ]),
    );
  }

  Widget _list(MimooColors c) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null && _messages.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Text(_error!, textAlign: TextAlign.center, style: MT.bodyMd.copyWith(color: c.muted)),
            const SizedBox(height: 12),
            OutlinedButton(
              onPressed: () {
                setState(() => _loading = true);
                _poll();
              },
              child: const Text('Try again'),
            ),
          ]),
        ),
      );
    }
    if (_messages.isEmpty) {
      return Center(child: Text('No messages yet. Say hello.', style: MT.bodyMd.copyWith(color: c.muted)));
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
                crossAxisAlignment: m.mine ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: m.mine ? c.primaryContainer : c.lowest,
                      borderRadius: BorderRadius.circular(16),
                      border: m.mine ? null : Border.all(color: c.outlineVariant),
                    ),
                    child: Text(m.body, style: MT.bodyMd.copyWith(color: m.mine ? Colors.white : c.text)),
                  ),
                  const SizedBox(height: 2),
                  Row(mainAxisSize: MainAxisSize.min, children: [
                    Text(clock(m.createdAt), style: MT.bodySm),
                    if (m.mine) ...[
                      const SizedBox(width: 4),
                      Icon(m.readAt != null ? Icons.done_all : Icons.done, size: 14, color: c.primaryContainer),
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
}
