import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../core/theme.dart';
import '../data/parcel_flow.dart';
import '../data/repositories/app_repositories_scope.dart';
import '../data/repositories/repository_interfaces.dart';
import '../widgets/common.dart';
import '../widgets/empty_state.dart';

class ChatListScreen extends StatefulWidget {
  const ChatListScreen({super.key});
  @override
  State<ChatListScreen> createState() => _ChatListScreenState();
}

class _ChatListScreenState extends State<ChatListScreen> {
  final _search = TextEditingController();
  String _query = '';

  @override
  void initState() {
    super.initState();
    _search.addListener(() => setState(() => _query = _search.text.trim().toLowerCase()));
  }

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }
  @override
  Widget build(BuildContext context) {
    final conversations = AppRepositoriesScope.of(context).conversations;
    Widget row(String name, String role, String msg, String time, String sub,
            {int unread = 0, IconData? icon, int? conversationId}) =>
        Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: MCard(
            onTap: () => Navigator.pushNamed(context, '/chat/thread',
                arguments: conversationId),
            padding: const EdgeInsets.all(14),
            child: Row(children: [
              icon != null
                  ? IconDot(icon, size: 48)
                  : const CircleAvatar(
                      radius: 24,
                      backgroundColor: MC.highest,
                      child: Icon(Icons.person, color: MC.primary)),
              const SizedBox(width: 12),
              Expanded(
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                    Row(children: [
                      Flexible(
                          child: Text(name,
                              style: MT.labelLg,
                              overflow: TextOverflow.ellipsis)),
                      const SizedBox(width: 6),
                      MChip(role,
                          bg: MC.secondaryFixed, fg: const Color(0xFF24005B)),
                      const Spacer(),
                      Text(time, style: MT.bodySm)
                    ]),
                    Row(children: [
                      Expanded(
                          child: Text(msg,
                              style: MT.bodySm.copyWith(
                                  fontWeight: unread > 0
                                      ? FontWeight.w600
                                      : FontWeight.w400,
                                  color: unread > 0
                                      ? MC.onSurface
                                      : MC.onSurfaceVariant),
                              overflow: TextOverflow.ellipsis)),
                      if (unread > 0)
                        CircleAvatar(
                            radius: 10,
                            backgroundColor: MC.tertiaryContainer,
                            child: Text('$unread',
                                style: MT.badge.copyWith(
                                    color: Colors.white, fontSize: 12)))
                    ]),
                    Text(sub, style: MT.bodySm),
                  ])),
            ]),
          ),
        );
    return ListenableBuilder(
      listenable: conversations,
      builder: (context, _) {
        final filtered = _query.isEmpty
            ? conversations.conversations
            : conversations.conversations
                .where((c) =>
                    c.title.toLowerCase().contains(_query) ||
                    conversations
                        .messagesFor(c.id ?? 0)
                        .any((m) => m.body.toLowerCase().contains(_query)))
                .toList(growable: false);
        return Scaffold(
        appBar: MSubAppBar(
            title: Text('Messages',
                style: MT.headlineMd.copyWith(color: Colors.white))),
        body: MPageBody(
          child: ListView(padding: MS.pagePadding, children: [
            TextField(
                controller: _search,
                decoration: InputDecoration(
                    hintText: 'Search messages, orders, or contacts...',
                    prefixIcon: const Icon(Icons.search),
                    filled: true,
                    fillColor: MC.lowest,
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(99),
                        borderSide: BorderSide.none))),
            const SizedBox(height: 12),
            if (filtered.isEmpty)
              EmptyState(
                icon: Icons.chat_bubble_outline_rounded,
                title: _query.isEmpty ? 'No messages' : 'No matches',
                message: _query.isEmpty
                    ? 'Chats with sellers, buyers and your hub will show up here.'
                    : 'Try a different name or tracking number.',
              ),
            for (final conversation in filtered)
              if (conversation.id case final id?)
                Builder(builder: (context) {
                  final messages = conversations.messagesFor(id);
                  final last = messages.isEmpty ? null : messages.last;
                  final unread = messages
                      .where((message) =>
                          message.sender != 'rider' && message.readAt == null)
                      .length;
                  return row(
                    conversation.title,
                    conversation.title.contains('Hub')
                        ? 'Logistics'
                        : 'Contact',
                    last?.body ?? 'No messages yet',
                    last == null ? '—' : clock(last.createdAt),
                    'Conversation',
                    unread: unread,
                    icon: conversation.title.contains('Hub')
                        ? Icons.warehouse
                        : null,
                    conversationId: id,
                  );
                }),
          ]),
        ),
      );
    });
  }
}

class ChatThreadScreen extends StatefulWidget {
  const ChatThreadScreen({super.key});
  @override
  State<ChatThreadScreen> createState() => _ChatThreadScreenState();
}

class _Msg {
  final String text, time;
  final bool mine;
  _Msg(this.text, this.time, {this.mine = false});
}

class _ChatThreadScreenState extends State<ChatThreadScreen> {
  final ctrl = TextEditingController();
  ConversationRepository? _conversationRepository;
  int? _conversationId;
  String? _conversationTitle;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_conversationRepository != null) return;
    final repositories = AppRepositoriesScope.of(context);
    _conversationRepository = repositories.conversations;
    final argument = ModalRoute.of(context)?.settings.arguments;
    _conversationId = argument is int
        ? argument
        : repositories.conversations.conversations.isEmpty
            ? null
            : repositories.conversations.conversations.first.id;
    // Set header title from the conversation.
    if (_conversationId != null) {
      final conv = repositories.conversations.conversations
          .where((c) => c.id == _conversationId)
          .fold<dynamic>(null, (_, c) => c);
      _conversationTitle = conv?.title;
    }
  }

  Future<void> send(String text) async {
    final body = text.trim();
    final id = _conversationId;
    final repository = _conversationRepository;
    if (body.isEmpty || id == null || repository == null) return;
    try {
      await repository.send(id, body);
      if (mounted) ctrl.clear();
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('$error')));
      }
    }
  }

  @override
  void dispose() {
    ctrl.dispose();
    super.dispose();
  }

  Future<void> _callBuyer() async {
    final messenger = ScaffoldMessenger.of(context);
    final parcels = AppRepositoriesScope.of(context).parcels;
    if (parcels.parcels.isEmpty) return;
    final uri = Uri.parse('tel:${parcels.focus.phone}');
    var opened = false;
    try {
      opened = await canLaunchUrl(uri) && await launchUrl(uri);
    } catch (_) {
      opened = false;
    }
    if (!opened && mounted) {
      messenger.showSnackBar(
          const SnackBar(content: Text("Couldn't start the call")));
    }
  }

  @override
  Widget build(BuildContext context) {
    final repository = _conversationRepository!;
    final conversationId = _conversationId;
    return ListenableBuilder(
      listenable: repository,
      builder: (context, _) {
        final msgs = conversationId == null
            ? const <_Msg>[]
            : repository
                .messagesFor(conversationId)
                .map((message) => _Msg(
                      message.body,
                      clock(message.createdAt),
                      mine: message.sender == 'rider',
                    ))
                .toList(growable: false);
        return Scaffold(
          appBar: MSubAppBar(
            title: Row(children: [
              const CircleAvatar(
                  radius: 18,
                  backgroundColor: MC.highest,
                  child: Icon(Icons.person, color: MC.primary)),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                  Text(
                    _conversationTitle ?? 'Hub Support',
                    style: MT.labelLg.copyWith(color: Colors.white),
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text('Logistics Support',
                      style: MT.bodySm.copyWith(color: Colors.white70))
                ]),
              ),
            ]),
            actions: [
              IconButton(onPressed: _callBuyer, icon: const Icon(Icons.call))
            ],
          ),
          body: MPageBody(
              child: Column(children: [
            // Parcel reference banner — only shown when the conversation is linked to a parcel.
            Builder(builder: (ctx) {
              final conv = _conversationId == null
                  ? null
                  : AppRepositoriesScope.of(ctx)
                      .conversations
                      .conversations
                      .where((c) => c.id == _conversationId)
                      .fold<dynamic>(null, (_, c) => c);
              if (conv == null) return const SizedBox.shrink();
              final tracking = AppRepositoriesScope.of(ctx)
                  .parcels
                  .byTracking(conv.title.replaceFirst('RE: ', ''));
              final label = conv.title.startsWith('RE:') ? conv.title : null;
              if (label == null) return const SizedBox.shrink();
              return Container(
                width: double.infinity,
                color: MC.container,
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(children: [
                  const Icon(Icons.inventory_2, size: 18, color: MC.primary),
                  const SizedBox(width: 8),
                  Text(label.replaceFirst('RE: ', ''),
                      style: MT.labelLg.copyWith(color: MC.primary)),
                  if (tracking != null) ...[
                    const SizedBox(width: 6),
                    Expanded(
                        child: Text('· ${tracking.address}',
                            style: MT.bodySm, overflow: TextOverflow.ellipsis)),
                    if (tracking.isCod)
                      MChip('COD ₱${tracking.codAmount.toStringAsFixed(2)}',
                          bg: MC.amberBg, fg: MC.amberText),
                  ],
                ]),
              );
            }),
            Expanded(
                child: ListView(padding: MS.pagePadding, children: [
              for (final m in msgs)
                Align(
                  alignment:
                      m.mine ? Alignment.centerRight : Alignment.centerLeft,
                  child: ConstrainedBox(
                    constraints: BoxConstraints(
                        maxWidth: MediaQuery.of(context).size.width * .78),
                    child: Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: Column(
                            crossAxisAlignment: m.mine
                                ? CrossAxisAlignment.end
                                : CrossAxisAlignment.start,
                            children: [
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                    color: m.mine
                                        ? MC.primaryContainer
                                        : MC.lowest,
                                    borderRadius: BorderRadius.circular(16)),
                                child: Text(m.text,
                                    style: MT.bodyMd.copyWith(
                                        color: m.mine
                                            ? Colors.white
                                            : MC.onSurface)),
                              ),
                              const SizedBox(height: 2),
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(m.time, style: MT.bodySm),
                                  if (m.mine)
                                    const Icon(Icons.done_all,
                                        size: 14, color: MC.primaryContainer)
                                ],
                              ),
                            ])),
                  ),
                ),
            ])),
            SizedBox(
                height: 40,
                child: ListView(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    children: [
                      for (final q in [
                        "I'm on my way po.",
                        "I've arrived at the gate po.",
                        'Please prepare the parcel po.'
                      ])
                        Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: ActionChip(
                                label: Text(q.replaceAll(' po.', '')),
                                onPressed: () => send(q),
                                backgroundColor: MC.high,
                                labelStyle:
                                    MT.labelMd.copyWith(color: MC.primary),
                                shape: const StadiumBorder(),
                                side: BorderSide.none)),
                    ])),
            SafeArea(
                child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(children: [
                      IconButton.filledTonal(
                          onPressed: () {},
                          icon: const Icon(Icons.add_a_photo)),
                      const SizedBox(width: 8),
                      Expanded(
                          child: TextField(
                              controller: ctrl,
                              onSubmitted: send,
                              decoration: InputDecoration(
                                  hintText: 'Type a message...',
                                  filled: true,
                                  fillColor: MC.low,
                                  contentPadding: const EdgeInsets.symmetric(
                                      horizontal: 16),
                                  border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(99),
                                      borderSide: BorderSide.none)))),
                      const SizedBox(width: 8),
                      IconButton.filled(
                          onPressed: () => send(ctrl.text),
                          style: IconButton.styleFrom(
                              backgroundColor: MC.primaryContainer),
                          icon: const Icon(Icons.send)),
                    ]))),
          ])),
        );
      },
    );
  }
}
