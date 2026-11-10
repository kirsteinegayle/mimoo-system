import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../theme/app_theme.dart';

// ── Design tokens ─────────────────────────────────────────────────────────────
const _kPrimary = AppColors.primary;
const _kSecondary = AppColors.accent;
const _kSurface = AppColors.surface;
const _kCard = AppColors.card;
const _kChip = AppColors.chip;
const _kBorder = AppColors.border;
const _kText = AppColors.text;
const _kSubtext = AppColors.textMuted;
const _kGreen = AppColors.success;

TextStyle _pjs({
  double size = 14,
  FontWeight weight = FontWeight.w400,
  Color color = _kText,
  double? height,
}) =>
    GoogleFonts.plusJakartaSans(
      fontSize: size,
      fontWeight: weight,
      color: color,
      height: height,
    );

// Thin order context passed from My Purchases
class _OrderRef {
  const _OrderRef({
    required this.orderId,
    required this.storeName,
    required this.storeBadge,
    required this.productName,
    required this.imageUrl,
    required this.price,
    required this.qty,
    required this.statusLabel,
  });
  final String orderId;
  final String storeName;
  final String storeBadge;
  final String productName;
  final String imageUrl;
  final double price;
  final int qty;
  final String statusLabel;
}

class _ChatMsg {
  _ChatMsg({
    required this.text,
    required this.isMe,
    required this.time,
    this.isDate = false,
    this.isSystem = false,
  });
  final String text;
  final bool isMe;
  final String time;
  final bool isDate;
  final bool isSystem;
}

// ── Page ──────────────────────────────────────────────────────────────────────
// The order parameter is a dynamic map so orders_page doesn't need to import
// a shared class — we just read the fields we need.
class OrderChatPage extends StatefulWidget {
  const OrderChatPage({super.key, required this.order});

  // Pass the _OrderItem from orders_page as a dynamic object via a typed helper
  final dynamic order;

  @override
  State<OrderChatPage> createState() => _OrderChatPageState();
}

class _OrderChatPageState extends State<OrderChatPage> {
  final _inputCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();

  late _OrderRef _ref;
  late List<_ChatMsg> _messages;

  static const _quickReplies = [
    'Hi',
    'When will it ship?',
    'Thank you',
    'Is it available?',
    'Can I cancel?',
  ];

  @override
  void initState() {
    super.initState();
    final o = widget.order;
    _ref = _OrderRef(
      orderId: o.orderId as String? ?? '',
      storeName: o.storeName as String? ?? 'Seller',
      storeBadge: o.storeBadge as String? ?? '',
      productName: o.productName as String? ?? '',
      imageUrl: o.imageUrl as String? ?? '',
      price: (o.price as num?)?.toDouble() ?? 0,
      qty: o.qty as int? ?? 1,
      statusLabel: o.statusLabel as String? ?? '',
    );

    _messages = [
      _ChatMsg(
        text: 'Today',
        isMe: false,
        time: '',
        isDate: true,
      ),
      _ChatMsg(
        text:
            'Messages are encrypted & monitored for safety. This chat is pre-filled with your order context.',
        isMe: false,
        time: '',
        isSystem: true,
      ),
      _ChatMsg(
        text:
            'Hello! Welcome to ${_ref.storeName}. How can I help you with your order today?',
        isMe: false,
        time: '10:01 AM',
      ),
    ];
  }

  @override
  void dispose() {
    _inputCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  void _send(String text) {
    if (text.trim().isEmpty) return;
    setState(() {
      _messages.add(_ChatMsg(
        text: text.trim(),
        isMe: true,
        time: 'Just now',
      ));
    });
    _inputCtrl.clear();
    Future.delayed(const Duration(milliseconds: 80), () {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent + 100,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _kSurface,
      appBar: _buildAppBar(),
      body: Column(
        children: [
          _buildOrderContextCard(),
          Expanded(child: _buildMessageList()),
          _buildQuickReplies(),
          _buildInputBar(),
        ],
      ),
    );
  }

  // ── App bar ──────────────────────────────────────────────────────────────────
  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: _kCard,
      elevation: 0,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back, color: _kText),
        onPressed: () => Navigator.pop(context),
      ),
      title: Row(
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: _kChip,
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.storefront_outlined,
                size: 18, color: _kPrimary),
          ),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(_ref.storeName,
                  style: _pjs(size: 14, weight: FontWeight.w800)),
              Row(
                children: [
                  Container(
                    width: 6,
                    height: 6,
                    decoration: const BoxDecoration(
                        color: _kGreen, shape: BoxShape.circle),
                  ),
                  const SizedBox(width: 4),
                  Text('Online', style: _pjs(size: 10, color: _kSubtext)),
                ],
              ),
            ],
          ),
        ],
      ),
      actions: [
        IconButton(
            icon: const Icon(Icons.more_vert, color: _kText), onPressed: () {}),
        Padding(
          padding: const EdgeInsets.only(right: 12),
          child: CircleAvatar(
            radius: 17,
            backgroundColor: _kChip,
            child: const Icon(Icons.person, size: 18, color: _kPrimary),
          ),
        ),
      ],
    );
  }

  // ── Order context card ────────────────────────────────────────────────────────
  Widget _buildOrderContextCard() {
    return Container(
      color: _kCard,
      padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: Image.network(
              _ref.imageUrl,
              width: 44,
              height: 44,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) =>
                  Container(width: 44, height: 44, color: _kChip),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(_ref.productName,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: _pjs(size: 12, weight: FontWeight.w700)),
                const SizedBox(height: 2),
                Row(
                  children: [
                    Text('${_ref.qty} item  •  ',
                        style: _pjs(size: 11, color: _kSubtext)),
                    Text('₱${_ref.price.toStringAsFixed(2)}',
                        style: _pjs(
                            size: 11,
                            weight: FontWeight.w700,
                            color: _kPrimary)),
                  ],
                ),
                if (_ref.statusLabel.isNotEmpty)
                  Text(_ref.statusLabel,
                      style: _pjs(
                          size: 10,
                          color: _kSecondary,
                          weight: FontWeight.w600)),
              ],
            ),
          ),
          Text('Order #${_ref.orderId}',
              style: _pjs(size: 10, color: _kSubtext)),
        ],
      ),
    );
  }

  // ── Message list ─────────────────────────────────────────────────────────────
  Widget _buildMessageList() {
    return ListView.builder(
      controller: _scrollCtrl,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      itemCount: _messages.length,
      itemBuilder: (_, i) => _buildItem(_messages[i]),
    );
  }

  Widget _buildItem(_ChatMsg msg) {
    if (msg.isDate) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Center(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
            decoration: BoxDecoration(
              color: _kSurface,
              borderRadius: BorderRadius.circular(9999),
              border: Border.all(color: _kBorder),
            ),
            child: Text(msg.text, style: _pjs(size: 11, color: _kSubtext)),
          ),
        ),
      );
    }

    if (msg.isSystem) {
      return Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Center(
          child: Text(msg.text,
              textAlign: TextAlign.center,
              style: _pjs(size: 11, color: _kSubtext, height: 1.5)),
        ),
      );
    }

    final isMe = msg.isMe;
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        mainAxisAlignment:
            isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isMe) ...[
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                  color: _kChip, borderRadius: BorderRadius.circular(8)),
              child: const Icon(Icons.storefront_outlined,
                  size: 16, color: _kPrimary),
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Column(
              crossAxisAlignment:
                  isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: isMe ? _kPrimary : _kCard,
                    borderRadius: BorderRadius.only(
                      topLeft: const Radius.circular(16),
                      topRight: const Radius.circular(16),
                      bottomLeft: Radius.circular(isMe ? 16 : 4),
                      bottomRight: Radius.circular(isMe ? 4 : 16),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.05),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Text(
                    msg.text,
                    style: _pjs(
                      size: 13,
                      color: isMe ? Colors.white : _kText,
                      height: 1.5,
                    ),
                  ),
                ),
                const SizedBox(height: 3),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(msg.time, style: _pjs(size: 10, color: _kSubtext)),
                    if (isMe) ...[
                      const SizedBox(width: 3),
                      const Icon(Icons.done_all, size: 12, color: _kSecondary),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── Quick replies ─────────────────────────────────────────────────────────────
  Widget _buildQuickReplies() {
    return Container(
      color: _kCard,
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 4),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: _quickReplies
              .map((r) => Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: GestureDetector(
                      onTap: () => _send(r),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 7),
                        decoration: BoxDecoration(
                          color: _kSurface,
                          borderRadius: BorderRadius.circular(9999),
                          border: Border.all(color: _kBorder),
                        ),
                        child: Text(r,
                            style: _pjs(size: 12, weight: FontWeight.w600)),
                      ),
                    ),
                  ))
              .toList(),
        ),
      ),
    );
  }

  // ── Input bar ─────────────────────────────────────────────────────────────────
  Widget _buildInputBar() {
    return Container(
      color: _kCard,
      padding: const EdgeInsets.fromLTRB(8, 6, 8, 12),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.add, color: _kSubtext),
            onPressed: () {},
          ),
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: _kSurface,
                borderRadius: BorderRadius.circular(9999),
                border: Border.all(color: _kBorder),
              ),
              child: TextField(
                controller: _inputCtrl,
                style: _pjs(size: 13),
                decoration: InputDecoration(
                  hintText: 'Type a message...',
                  hintStyle: _pjs(size: 13, color: _kSubtext),
                  border: InputBorder.none,
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                ),
                onSubmitted: _send,
              ),
            ),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: () => _send(_inputCtrl.text),
            child: Container(
              width: 42,
              height: 42,
              decoration:
                  const BoxDecoration(color: _kPrimary, shape: BoxShape.circle),
              child: const Icon(Icons.send, color: Colors.white, size: 18),
            ),
          ),
          const SizedBox(width: 4),
          IconButton(
            icon: const Icon(Icons.mic_outlined, color: _kSubtext),
            onPressed: () {},
          ),
        ],
      ),
    );
  }
}
