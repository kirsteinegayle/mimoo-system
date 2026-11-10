import 'package:flutter/material.dart';
import '../../models/courier_models.dart';
import '../../services/api_service.dart';
import '../../services/courier_repository.dart';
import '../../theme/mimoo_theme.dart';
import '../../widgets/courier_shared.dart';

class MessagesPage extends StatefulWidget {
  const MessagesPage({super.key});

  @override
  State<MessagesPage> createState() => _MessagesPageState();
}

class _MessagesPageState extends State<MessagesPage> {
  List<ConversationSummary> _items = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final r = await CourierRepository.instance.conversations();
      if (!mounted) return;
      setState(() {
        _items = r;
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

  Future<void> _open(ConversationSummary c) async {
    await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => ChatPage(conversation: c)),
    );
    if (mounted) _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kSurface,
      appBar: AppBar(
        backgroundColor: kCard,
        title: Text('Messages',
            style: pjs(size: 17, weight: FontWeight.w800)),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: kPrimary))
          : _error != null
              ? CourierErrorState(message: _error!, onRetry: _load)
              : _items.isEmpty
                  ? const CourierEmptyState(
                      icon: Icons.chat_bubble_outline,
                      message: 'No conversations yet.')
                  : RefreshIndicator(
                      color: kPrimary,
                      onRefresh: _load,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(12),
                        itemCount: _items.length,
                        itemBuilder: (_, i) {
                          final c = _items[i];
                          return GestureDetector(
                            onTap: () => _open(c),
                            child: Container(
                              margin: const EdgeInsets.only(bottom: 10),
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: kCard,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: kBorder),
                              ),
                              child: Row(children: [
                                const CircleAvatar(
                                  backgroundColor: kChip,
                                  radius: 22,
                                  child: Icon(Icons.support_agent,
                                      color: kPrimary, size: 22),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Row(children: [
                                        Expanded(
                                          child: Text(c.otherName,
                                              style: pjs(
                                                  size: 14,
                                                  weight: FontWeight.w800)),
                                        ),
                                        if (c.unread > 0)
                                          Container(
                                            padding: const EdgeInsets
                                                .symmetric(
                                                horizontal: 7, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: kFlash,
                                              borderRadius:
                                                  BorderRadius.circular(99),
                                            ),
                                            child: Text('${c.unread}',
                                                style: pjs(
                                                    size: 9,
                                                    weight: FontWeight.w800,
                                                    color: Colors.white)),
                                          ),
                                      ]),
                                      if (c.otherCompany != null &&
                                          c.otherCompany!.isNotEmpty)
                                        Text(c.otherCompany!,
                                            style: pjs(
                                                size: 11, color: kSubtext)),
                                      const SizedBox(height: 3),
                                      Text(
                                        c.lastMessage ?? c.subject,
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                        style: pjs(
                                            size: 12,
                                            color: kSubtext,
                                            height: 1.35),
                                      ),
                                      if (c.lastMessageAt != null)
                                        Text(c.lastMessageAt!,
                                            style: pjs(
                                                size: 10, color: kSubtext)),
                                    ],
                                  ),
                                ),
                                const Icon(Icons.chevron_right,
                                    color: kSubtext),
                              ]),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}

class ChatPage extends StatefulWidget {
  const ChatPage({super.key, required this.conversation});
  final ConversationSummary conversation;

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();
  ChatThread? _thread;
  bool _loading = true;
  bool _sending = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final thread =
          await CourierRepository.instance.thread(widget.conversation.id);
      if (!mounted) return;
      setState(() {
        _thread = thread;
        _loading = false;
      });
      _scrollToBottom();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = ApiService.friendlyError(e);
      });
    }
  }

  Future<void> _send() async {
    final body = _controller.text.trim();
    if (body.isEmpty || _sending) return;
    setState(() => _sending = true);
    try {
      final message = await CourierRepository.instance
          .sendMessage(widget.conversation.id, body);
      if (!mounted) return;
      setState(() {
        _thread = ChatThread(
          conversation: _thread!.conversation,
          messages: [..._thread!.messages, message],
        );
        _controller.clear();
        _sending = false;
      });
      _scrollToBottom();
    } catch (e) {
      if (!mounted) return;
      setState(() => _sending = false);
      courierSnack(context, ApiService.friendlyError(e), kFlash);
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollController.hasClients) return;
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 240),
        curve: Curves.easeOut,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final messages = _thread?.messages ?? const <ChatMessage>[];
    return Scaffold(
      backgroundColor: kSurface,
      appBar: AppBar(
        backgroundColor: kCard,
        title: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(widget.conversation.otherName,
              style: pjs(size: 15, weight: FontWeight.w800)),
          Text(widget.conversation.otherCompany ?? 'Logistics support',
              style: pjs(size: 11, color: kSubtext)),
        ]),
        actions: [
          IconButton(
            tooltip: 'Refresh messages',
            onPressed: _load,
            icon: const Icon(Icons.refresh, size: 20),
          ),
        ],
      ),
      body: Column(children: [
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator(color: kPrimary))
              : _error != null
                  ? CourierErrorState(message: _error!, onRetry: _load)
                  : messages.isEmpty
                      ? const CourierEmptyState(
                          icon: Icons.chat_bubble_outline,
                          message: 'Start the conversation with Logistics.')
                      : ListView.builder(
                          controller: _scrollController,
                          padding: const EdgeInsets.all(14),
                          itemCount: messages.length,
                          itemBuilder: (_, i) {
                            final m = messages[i];
                            return Align(
                              alignment: m.mine
                                  ? Alignment.centerRight
                                  : Alignment.centerLeft,
                              child: Container(
                                constraints: BoxConstraints(
                                    maxWidth:
                                        MediaQuery.sizeOf(context).width * 0.75),
                                margin: const EdgeInsets.only(bottom: 8),
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 12, vertical: 9),
                                decoration: BoxDecoration(
                                  color: m.mine ? kPrimary : kCard,
                                  borderRadius: BorderRadius.only(
                                    topLeft: const Radius.circular(12),
                                    topRight: const Radius.circular(12),
                                    bottomLeft: Radius.circular(m.mine ? 12 : 2),
                                    bottomRight:
                                        Radius.circular(m.mine ? 2 : 12),
                                  ),
                                  border: m.mine
                                      ? null
                                      : Border.all(color: kBorder),
                                ),
                                child: Column(
                                  crossAxisAlignment: m.mine
                                      ? CrossAxisAlignment.end
                                      : CrossAxisAlignment.start,
                                  children: [
                                    if (!m.mine)
                                      Text(m.senderName,
                                          style: pjs(
                                              size: 10,
                                              weight: FontWeight.w800,
                                              color: kPrimary)),
                                    Text(m.body,
                                        style: pjs(
                                            size: 13,
                                            color: m.mine ? Colors.white : kText,
                                            height: 1.35)),
                                    const SizedBox(height: 2),
                                    Text(m.createdAt,
                                        style: pjs(
                                            size: 9,
                                            color: m.mine
                                                ? Colors.white60
                                                : kSubtext)),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
        ),
        SafeArea(
          top: false,
          child: Container(
            color: kCard,
            padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
            child: Row(children: [
              Expanded(
                child: TextField(
                  controller: _controller,
                  minLines: 1,
                  maxLines: 4,
                  textInputAction: TextInputAction.send,
                  onSubmitted: (_) => _send(),
                  style: pjs(size: 13),
                  decoration: mimooInput(
                      hint: 'Message Logistics', icon: Icons.chat_outlined),
                ),
              ),
              const SizedBox(width: 8),
              SizedBox(
                width: 46,
                height: 46,
                child: FilledButton(
                  onPressed: _sending ? null : _send,
                  style: FilledButton.styleFrom(
                    backgroundColor: kPrimary,
                    padding: EdgeInsets.zero,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                  child: _sending
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.send, color: Colors.white, size: 19),
                ),
              ),
            ]),
          ),
        ),
      ]),
    );
  }
}
