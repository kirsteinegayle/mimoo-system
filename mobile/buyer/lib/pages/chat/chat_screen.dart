import 'dart:async';
import 'dart:typed_data';

import 'package:flutter/material.dart';

import '../../services/api_service.dart';
import '../../services/chat_repository.dart';
import '../../services/review_repository.dart' show PickedImage;
import '../../state/auth_service.dart';
import '../../utils/image_pick.dart';
import '../../theme/app_theme.dart';

const _kPrimary = AppColors.primary;
const _kSecondary = AppColors.accent;
const _kBorder = AppColors.border;
const _kSubtext = AppColors.textMuted;

/// Starts (or reuses) the thread with [sellerId] and opens the chat screen.
/// When [productId] is given, that product is shown as the thread's product card.
Future<void> openSellerChat(BuildContext context,
    {required int sellerId, int? productId}) async {
  if (!AuthService.instance.isLoggedIn || ApiService.token == null) {
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
      content: Text('Please log in to chat with the seller.'),
      behavior: SnackBarBehavior.floating,
    ));
    return;
  }
  final messenger = ScaffoldMessenger.of(context);
  final nav = Navigator.of(context);
  try {
    final t = await ChatRepository.instance.start(sellerId: sellerId, productId: productId);
    await nav.push(MaterialPageRoute(
      builder: (_) => ChatScreen(threadId: t.id, title: t.sellerName),
    ));
  } catch (e) {
    messenger.showSnackBar(SnackBar(
      content: Text(e is ApiException ? e.message : 'Could not open chat. Check your connection.'),
      backgroundColor: AppColors.error,
      behavior: SnackBarBehavior.floating,
    ));
  }
}

enum _SendState { sent, sending, failed }

class _UiMsg {
  _UiMsg.server(ChatMessageItem m)
      : server = m,
        localKey = 'S${m.id}',
        text = m.body,
        image = null,
        state = _SendState.sent;

  _UiMsg.pending(this.localKey, {this.text, this.image})
      : server = null,
        state = _SendState.sending;

  ChatMessageItem? server;
  final String localKey;
  final String? text;
  final PickedImage? image;
  _SendState state;

  bool get isMine => server?.isMine ?? true;
}

/// One buyer ↔ seller thread. Polls for new messages every 5 seconds.
class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key, required this.threadId, required this.title});
  final int threadId;
  final String title;

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> with WidgetsBindingObserver {
  static const _pollEvery = Duration(seconds: 5);

  final List<_UiMsg> _msgs = [];
  final _input = TextEditingController();
  final _scroll = ScrollController();
  ChatProductCard? _product;
  late String _title = widget.title;
  bool _loading = true;
  String? _error;
  Timer? _timer;
  bool _polling = false;
  int _localSeq = 0;

  int get _lastServerId => _msgs
      .where((m) => m.server != null)
      .fold(0, (mx, m) => m.server!.id > mx ? m.server!.id : mx);

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _initialLoad();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _timer?.cancel();
    _input.dispose();
    _scroll.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _startPolling();
      _poll();
    } else if (state == AppLifecycleState.paused || state == AppLifecycleState.hidden) {
      _timer?.cancel();
    }
  }

  void _startPolling() {
    _timer?.cancel();
    _timer = Timer.periodic(_pollEvery, (_) => _poll());
  }

  Future<void> _initialLoad() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final r = await ChatRepository.instance.messages(widget.threadId);
      if (!mounted) return;
      setState(() {
        _msgs
          ..clear()
          ..addAll(r.messages.map(_UiMsg.server));
        _product = r.product;
        _title = r.sellerName;
        _loading = false;
      });
      _scrollToEnd();
      _startPolling();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = e is ApiException ? e.message : 'Could not load messages.';
      });
    }
  }

  Future<void> _poll() async {
    if (_polling || _loading || _error != null) return;
    _polling = true;
    try {
      final r = await ChatRepository.instance.messages(widget.threadId, afterId: _lastServerId);
      if (!mounted || r.messages.isEmpty) return;
      final known = _msgs.where((m) => m.server != null).map((m) => m.server!.id).toSet();
      final fresh = r.messages.where((m) => !known.contains(m.id)).toList();
      if (fresh.isEmpty) return;
      setState(() {
        // Insert before any still-pending local messages.
        final firstPending = _msgs.indexWhere((m) => m.server == null);
        final at = firstPending == -1 ? _msgs.length : firstPending;
        _msgs.insertAll(at, fresh.map(_UiMsg.server));
      });
      _scrollToEnd();
    } catch (_) {
      // Silent: next poll retries.
    } finally {
      _polling = false;
    }
  }

  void _scrollToEnd() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) {
        _scroll.animateTo(_scroll.position.maxScrollExtent,
            duration: const Duration(milliseconds: 200), curve: Curves.easeOut);
      }
    });
  }

  Future<void> _deliver(_UiMsg m) async {
    setState(() => m.state = _SendState.sending);
    try {
      final saved = m.image != null
          ? await ChatRepository.instance.sendImage(widget.threadId, m.image!)
          : await ChatRepository.instance.sendText(widget.threadId, m.text!);
      if (!mounted) return;
      setState(() {
        // A poll may already have added it; then just drop the pending copy.
        final dup = _msgs.any((x) => x.server?.id == saved.id);
        if (dup) {
          _msgs.remove(m);
        } else {
          m.server = saved;
          m.state = _SendState.sent;
        }
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => m.state = _SendState.failed);
      if (e.statusCode == 422) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(e.message),
          behavior: SnackBarBehavior.floating,
        ));
      }
    } catch (_) {
      if (!mounted) return;
      setState(() => m.state = _SendState.failed);
    }
  }

  void _sendText() {
    final text = _input.text.trim();
    if (text.isEmpty) return;
    if (text.length > 1000) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Message must not exceed 1000 characters.'),
        behavior: SnackBarBehavior.floating,
      ));
      return;
    }
    _input.clear();
    final m = _UiMsg.pending('L${_localSeq++}', text: text);
    setState(() => _msgs.add(m));
    _scrollToEnd();
    _deliver(m);
  }

  Future<void> _sendImage() async {
    final res = await pickSingleImage();
    if (!mounted) return;
    if (res.warning != null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(res.warning!),
        behavior: SnackBarBehavior.floating,
      ));
    }
    if (res.images.isEmpty) return;
    final m = _UiMsg.pending('L${_localSeq++}', image: res.images.first);
    setState(() => _msgs.add(m));
    _scrollToEnd();
    _deliver(m);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        title: Text(_title),
        backgroundColor: Colors.white,
        foregroundColor: _kPrimary,
        elevation: 0.5,
      ),
      body: Column(children: [
        if (_product != null) _productCard(_product!),
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : _error != null
                  ? Center(
                      child: Column(mainAxisSize: MainAxisSize.min, children: [
                        Text(_error!),
                        const SizedBox(height: 8),
                        OutlinedButton(onPressed: _initialLoad, child: const Text('Retry')),
                      ]),
                    )
                  : _msgs.isEmpty
                      ? const Center(
                          child: Text('Say hi to the seller 👋',
                              style: TextStyle(color: _kSubtext)))
                      : ListView.builder(
                          controller: _scroll,
                          padding: const EdgeInsets.all(12),
                          itemCount: _msgs.length,
                          itemBuilder: (_, i) => _bubble(_msgs[i]),
                        ),
        ),
        _composer(),
      ]),
    );
  }

  Widget _productCard(ChatProductCard p) => Container(
        margin: const EdgeInsets.fromLTRB(12, 10, 12, 0),
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: _kBorder),
        ),
        child: Row(children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: p.imageUrl != null
                ? Image.network(p.imageUrl!,
                    width: 44, height: 44, fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => _ph(44))
                : _ph(44),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(p.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
              Text('₱${p.price.toStringAsFixed(2)}',
                  style: const TextStyle(color: _kSecondary, fontSize: 12)),
            ]),
          ),
          const Text('Asking about', style: TextStyle(fontSize: 10, color: _kSubtext)),
        ]),
      );

  Widget _ph(double s) => Container(
      width: s, height: s, color: AppColors.chip,
      child: const Icon(Icons.image_outlined, size: 18, color: _kSubtext));

  Widget _bubble(_UiMsg m) {
    final mine = m.isMine;
    final failed = m.state == _SendState.failed;
    final sending = m.state == _SendState.sending;
    final imgUrl = m.server?.imageUrl;
    Widget content;
    if (m.image != null && m.server == null) {
      content = ClipRRect(
        borderRadius: BorderRadius.circular(8),
        child: Image.memory(Uint8List.fromList(m.image!.bytes),
            width: 180, fit: BoxFit.cover),
      );
    } else if (imgUrl != null) {
      content = ClipRRect(
        borderRadius: BorderRadius.circular(8),
        child: Image.network(imgUrl,
            width: 180, fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => _ph(120)),
      );
    } else {
      // Plain text — never interpreted as HTML.
      content = Text(m.server?.body ?? m.text ?? '',
          style: TextStyle(color: mine ? Colors.white : Colors.black87, fontSize: 14));
    }
    final t = m.server?.createdAt?.toLocal();
    return Align(
      alignment: mine ? Alignment.centerRight : Alignment.centerLeft,
      child: Column(
        crossAxisAlignment: mine ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          Container(
            margin: const EdgeInsets.symmetric(vertical: 3),
            padding: imgUrl != null || m.image != null
                ? const EdgeInsets.all(4)
                : const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            constraints: const BoxConstraints(maxWidth: 280),
            decoration: BoxDecoration(
              color: mine
                  ? (failed ? AppColors.errorLight : _kSecondary)
                  : Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: mine ? null : Border.all(color: _kBorder),
            ),
            child: Opacity(opacity: sending ? 0.6 : 1, child: content),
          ),
          if (failed)
            GestureDetector(
              onTap: () => _deliver(m),
              child: Row(mainAxisSize: MainAxisSize.min, children: [
                Icon(Icons.error_outline, size: 13, color: AppColors.error),
                const SizedBox(width: 3),
                Text('Not sent. Tap to retry',
                    style: TextStyle(fontSize: 11, color: AppColors.error)),
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: () => setState(() => _msgs.remove(m)),
                  child: const Text('Delete',
                      style: TextStyle(fontSize: 11, color: _kSubtext)),
                ),
              ]),
            )
          else if (sending)
            const Text('Sending…', style: TextStyle(fontSize: 10, color: _kSubtext))
          else if (t != null)
            Text(
                '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}'
                '${mine && m.server?.readAt != null ? ' · Seen' : ''}',
                style: const TextStyle(fontSize: 10, color: _kSubtext)),
        ],
      ),
    );
  }

  Widget _composer() => SafeArea(
        top: false,
        child: Container(
          padding: const EdgeInsets.fromLTRB(8, 6, 8, 6),
          color: Colors.white,
          child: Row(children: [
            IconButton(
              tooltip: 'Send photo',
              onPressed: _loading ? null : _sendImage,
              icon: const Icon(Icons.image_outlined, color: _kSecondary),
            ),
            Expanded(
              child: TextField(
                controller: _input,
                maxLength: 1000,
                minLines: 1,
                maxLines: 4,
                textInputAction: TextInputAction.send,
                onSubmitted: (_) => _sendText(),
                decoration: InputDecoration(
                  hintText: 'Type a message…',
                  counterText: '',
                  isDense: true,
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(20),
                      borderSide: const BorderSide(color: _kBorder)),
                ),
              ),
            ),
            IconButton(
              tooltip: 'Send',
              onPressed: _loading ? null : _sendText,
              icon: const Icon(Icons.send_rounded, color: _kPrimary),
            ),
          ]),
        ),
      );
}
