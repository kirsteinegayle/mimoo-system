import 'dart:async';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../services/api_service.dart';
import '../../services/chat_repository.dart';
import '../../state/auth_service.dart';
import 'chat_screen.dart';

const _kPrimary = Color(0xFF34175B);
const _kSecondary = Color(0xFF6B38D4);
const _kFlash = Color(0xFFFF3B5C);
const _kSurface = Color(0xFFF5F4FC);
const _kCard = Color(0xFFFFFFFF);
const _kChip = Color(0xFFEFE9FD);
const _kBorder = Color(0xFFDDD8F0);
const _kText = Color(0xFF1A1035);
const _kSubtext = Color(0xFF8A84A3);

TextStyle _pjs({double size = 14, FontWeight weight = FontWeight.w400, Color color = _kText}) =>
    GoogleFonts.plusJakartaSans(fontSize: size, fontWeight: weight, color: color);

/// Messages tab — real buyer ↔ seller threads (GET /api/buyer/chat) with the
/// last message and unread count. Refreshes every 15 s while visible.
class ChatPage extends StatefulWidget {
  const ChatPage({super.key});

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  List<ChatThreadItem> _threads = [];
  bool _loading = true;
  String? _error;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _load();
    _timer = Timer.periodic(const Duration(seconds: 15), (_) {
      if (mounted && TickerMode.valuesOf(context).enabled) _load(silent: true);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _load({bool silent = false}) async {
    if (!AuthService.instance.isLoggedIn || ApiService.token == null) {
      if (mounted) {
        setState(() {
          _loading = false;
          _threads = [];
          _error = null;
        });
      }
      return;
    }
    if (!silent) {
      setState(() {
        _loading = true;
        _error = null;
      });
    }
    try {
      final list = await ChatRepository.instance.threads();
      if (!mounted) return;
      setState(() {
        _threads = list;
        _error = null;
      });
    } catch (e) {
      if (!mounted || silent) return;
      setState(() =>
          _error = e is ApiException ? e.message : 'Could not load chats. Check your connection.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String _ago(DateTime? t) {
    if (t == null) return '';
    final l = t.toLocal();
    final d = DateTime.now().difference(l);
    if (d.inDays < 1) {
      return '${l.hour.toString().padLeft(2, '0')}:${l.minute.toString().padLeft(2, '0')}';
    }
    if (d.inDays < 7) return '${d.inDays}d';
    return '${l.month}/${l.day}';
  }

  @override
  Widget build(BuildContext context) {
    final loggedIn = AuthService.instance.isLoggedIn;
    return Scaffold(
      backgroundColor: _kSurface,
      appBar: AppBar(
        automaticallyImplyLeading: Navigator.of(context).canPop(),
        backgroundColor: _kCard,
        foregroundColor: _kPrimary,
        elevation: 0.5,
        title: Text('Messages', style: _pjs(size: 18, weight: FontWeight.w800, color: _kPrimary)),
      ),
      body: !loggedIn
          ? Center(
              child: Text('Log in to chat with sellers.', style: _pjs(color: _kSubtext)))
          : _loading
              ? const Center(child: CircularProgressIndicator())
              : _error != null
                  ? Center(
                      child: Column(mainAxisSize: MainAxisSize.min, children: [
                        Text(_error!, style: _pjs(color: _kSubtext)),
                        const SizedBox(height: 8),
                        OutlinedButton(onPressed: _load, child: const Text('Retry')),
                      ]),
                    )
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: _threads.isEmpty
                          ? ListView(children: [
                              const SizedBox(height: 120),
                              const Icon(Icons.chat_bubble_outline, size: 56, color: _kSubtext),
                              const SizedBox(height: 12),
                              Center(
                                child: Text(
                                    'No conversations yet.\nTap "Chat" on a product or store to start.',
                                    textAlign: TextAlign.center,
                                    style: _pjs(color: _kSubtext, size: 13)),
                              ),
                            ])
                          : ListView.separated(
                              itemCount: _threads.length,
                              separatorBuilder: (_, __) =>
                                  const Divider(height: 1, color: _kBorder),
                              itemBuilder: (_, i) => _tile(_threads[i]),
                            ),
                    ),
    );
  }

  Widget _tile(ChatThreadItem t) {
    final last = t.lastMessage;
    final preview = last == null
        ? (t.product != null ? 'About: ${t.product!.name}' : 'No messages yet')
        : (last.imageUrl != null ? '📷 Photo' : (last.body ?? ''));
    final unread = t.unreadCount > 0;
    return ListTile(
      tileColor: _kCard,
      leading: CircleAvatar(
        backgroundColor: _kChip,
        backgroundImage: t.sellerPhotoUrl != null ? NetworkImage(t.sellerPhotoUrl!) : null,
        child: t.sellerPhotoUrl == null
            ? const Icon(Icons.storefront_outlined, color: _kSecondary)
            : null,
      ),
      title: Text(t.sellerName,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: _pjs(size: 14, weight: unread ? FontWeight.w800 : FontWeight.w600)),
      subtitle: Text(
        '${last?.isMine == true ? 'You: ' : ''}$preview',
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: _pjs(
            size: 12,
            color: unread ? _kText : _kSubtext,
            weight: unread ? FontWeight.w700 : FontWeight.w400),
      ),
      trailing: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Text(_ago(t.lastMessageAt), style: _pjs(size: 10, color: _kSubtext)),
          const SizedBox(height: 4),
          if (unread)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
              decoration: BoxDecoration(
                  color: _kFlash, borderRadius: BorderRadius.circular(9999)),
              child: Text('${t.unreadCount}',
                  style: _pjs(size: 10, weight: FontWeight.w800, color: Colors.white)),
            ),
        ],
      ),
      onTap: () async {
        await Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => ChatScreen(threadId: t.id, title: t.sellerName)),
        );
        _load(silent: true);
      },
    );
  }
}
