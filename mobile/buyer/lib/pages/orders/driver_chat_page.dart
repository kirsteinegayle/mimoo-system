import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../theme/app_theme.dart';

// ── Design tokens ─────────────────────────────────────────────────────────────
const _kPrimary = AppColors.primary;
const _kSecondary = AppColors.accent;
const _kFlash = AppColors.flash;
const _kSurface = AppColors.surface;
const _kCard = AppColors.card;
const _kChip = AppColors.chip;
const _kBorder = AppColors.border;
const _kText = AppColors.text;
const _kSubtext = AppColors.textMuted;

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

// ── Message variants ──────────────────────────────────────────────────────────
enum _MsgType { dateSep, spxNotice, arrivalCard, text }

class _Msg {
  const _Msg(
      {required this.type, this.text = '', this.isMe = false, this.time = ''});
  final _MsgType type;
  final String text;
  final bool isMe;
  final String time;
}

// ═════════════════════════════════════════════════════════════════════════════
// PAGE
// ═════════════════════════════════════════════════════════════════════════════
class DriverChatPage extends StatefulWidget {
  const DriverChatPage({
    super.key,
    required this.orderId,
    required this.trackingNumber,
    required this.driverName,
    required this.driverAvatarSeed,
    required this.driverRating,
    required this.courierName,
    required this.productName,
    required this.productImageSeed,
    required this.codAmount,
  });

  final String orderId;
  final String trackingNumber;
  final String driverName;
  final String driverAvatarSeed;
  final double driverRating;
  final String courierName;
  final String productName;
  final String productImageSeed;
  final double codAmount;

  @override
  State<DriverChatPage> createState() => _DriverChatPageState();
}

class _DriverChatPageState extends State<DriverChatPage> {
  final _inputCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();

  late List<_Msg> _messages;

  static const _quickReplies = [
    'Hi',
    'OK',
    'Thank you',
    "I'm at home",
    "I'm not at home",
  ];

  @override
  void initState() {
    super.initState();
    _messages = const [
      _Msg(type: _MsgType.dateSep, time: 'Today • 06:42 AM'),
      _Msg(type: _MsgType.spxNotice, time: '06:42'),
      _Msg(type: _MsgType.arrivalCard, time: '06:42'),
    ];
  }

  @override
  void dispose() {
    _inputCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  void _send(String raw) {
    final text = raw.trim();
    if (text.isEmpty) return;
    setState(() {
      _messages = [
        ..._messages,
        _Msg(type: _MsgType.text, text: text, isMe: true, time: 'Just now'),
      ];
    });
    _inputCtrl.clear();
    Future.delayed(const Duration(milliseconds: 80), () {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent + 120,
          duration: const Duration(milliseconds: 260),
          curve: Curves.easeOut,
        );
      }
    });
  }

  // ── Build ──────────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _kSurface,
      appBar: _buildAppBar(context),
      body: Column(
        children: [
          _buildShippingSummary(context),
          _buildDriverBanner(),
          Expanded(child: _buildMessages()),
          _buildQuickReplies(),
          _buildInputBar(),
        ],
      ),
    );
  }

  // ── App bar ──────────────────────────────────────────────────────────────────
  // Header: ← | Driver Chat | ? | 👤
  PreferredSizeWidget _buildAppBar(BuildContext context) {
    return AppBar(
      backgroundColor: _kCard,
      elevation: 0,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back, color: _kText),
        onPressed: () => Navigator.pop(context),
      ),
      title:
          Text('Driver Chat', style: _pjs(size: 17, weight: FontWeight.w800)),
      actions: [
        // Question-mark circle (outlined)
        Container(
          margin: const EdgeInsets.only(right: 4),
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: _kBorder, width: 1.5),
          ),
          child:
              const Icon(Icons.question_mark_rounded, size: 18, color: _kText),
        ),
        // Filled purple avatar
        Padding(
          padding: const EdgeInsets.only(right: 12),
          child: CircleAvatar(
            radius: 17,
            backgroundColor: _kPrimary,
            child: const Icon(Icons.person, size: 18, color: Colors.white),
          ),
        ),
      ],
    );
  }

  // ── Shipping summary card ─────────────────────────────────────────────────────
  // Row: [product image] | [Shipping badge · 1 Item · ₱194 / Trk: ... 📋] | [Details]
  Widget _buildShippingSummary(BuildContext context) {
    return Container(
      color: _kCard,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      child: Row(
        children: [
          // Product image
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: Image.network(
              'https://picsum.photos/seed/${widget.productImageSeed}/120/120',
              width: 52,
              height: 52,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) =>
                  Container(width: 52, height: 52, color: _kChip),
            ),
          ),
          const SizedBox(width: 10),
          // Middle column
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Shipping badge + item count
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: _kChip,
                        borderRadius: BorderRadius.circular(5),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.local_shipping_outlined,
                              size: 10, color: _kSecondary),
                          const SizedBox(width: 3),
                          Text('Shipping',
                              style: _pjs(
                                  size: 10,
                                  weight: FontWeight.w700,
                                  color: _kSecondary)),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '1 Item • ₱${widget.codAmount.toStringAsFixed(0)}',
                      style: _pjs(size: 13, weight: FontWeight.w700),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                // Tracking number with copy
                GestureDetector(
                  onTap: () {
                    Clipboard.setData(
                        ClipboardData(text: widget.trackingNumber));
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Tracking number copied!',
                            style: _pjs(
                                size: 13,
                                color: Colors.white,
                                weight: FontWeight.w600)),
                        backgroundColor: _kPrimary,
                        duration: const Duration(seconds: 2),
                      ),
                    );
                  },
                  child: Row(
                    children: [
                      Text('Trk: ${widget.trackingNumber}',
                          style: _pjs(size: 11, color: _kSubtext)),
                      const SizedBox(width: 4),
                      const Icon(Icons.copy_outlined,
                          size: 12, color: _kSubtext),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          // Details button
          OutlinedButton(
            onPressed: () {},
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: _kBorder, width: 1.5),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10)),
              minimumSize: const Size(0, 34),
              padding: const EdgeInsets.symmetric(horizontal: 14),
            ),
            child: Text('Details',
                style: _pjs(size: 13, weight: FontWeight.w600, color: _kText)),
          ),
        ],
      ),
    );
  }

  // ── Driver status banner ──────────────────────────────────────────────────────
  // Full-width gradient purple bar: [moped icon] | [name + eta] | [phone circle]
  Widget _buildDriverBanner() {
    return Container(
      margin: EdgeInsets.zero,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.primary, Color(0xFF7C3AED)],
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
      ),
      child: Row(
        children: [
          // Moped icon in semi-transparent circle
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.18),
              shape: BoxShape.circle,
            ),
            child:
                const Icon(Icons.electric_moped, color: Colors.white, size: 22),
          ),
          const SizedBox(width: 12),
          // Name + ETA
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text('${widget.driverName} is on his way!',
                        style: _pjs(
                            size: 14,
                            weight: FontWeight.w800,
                            color: Colors.white)),
                    const SizedBox(width: 6),
                    // Live dot
                    Container(
                      width: 7,
                      height: 7,
                      decoration: const BoxDecoration(
                          color: Colors.white, shape: BoxShape.circle),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text('Estimated arrival in 12–18 mins',
                    style: _pjs(size: 12, color: Colors.white70)),
              ],
            ),
          ),
          // Phone circle button
          GestureDetector(
            onTap: () {},
            child: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.15),
                    blurRadius: 6,
                  ),
                ],
              ),
              child:
                  const Icon(Icons.phone_outlined, size: 20, color: _kPrimary),
            ),
          ),
        ],
      ),
    );
  }

  // ── Message list ──────────────────────────────────────────────────────────────
  Widget _buildMessages() {
    return ListView.builder(
      controller: _scrollCtrl,
      padding: const EdgeInsets.fromLTRB(12, 12, 12, 8),
      itemCount: _messages.length,
      itemBuilder: (_, i) => _buildItem(_messages[i]),
    );
  }

  Widget _buildItem(_Msg msg) {
    switch (msg.type) {
      case _MsgType.dateSep:
        return _DateSeparator(label: msg.time);

      case _MsgType.spxNotice:
        return _SpxNoticeCard(
          codAmount: widget.codAmount,
          time: msg.time,
        );

      case _MsgType.arrivalCard:
        return _ArrivalCard(
          productName: widget.productName,
          productImageSeed: widget.productImageSeed,
          time: msg.time,
        );

      case _MsgType.text:
        return _TextBubble(msg: msg);
    }
  }

  // ── Quick reply chips ─────────────────────────────────────────────────────────
  Widget _buildQuickReplies() {
    return Container(
      color: _kCard,
      padding: const EdgeInsets.fromLTRB(12, 10, 12, 6),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: _quickReplies.map((r) {
            return Padding(
              padding: const EdgeInsets.only(right: 8),
              child: GestureDetector(
                onTap: () => _send(r),
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: _kSurface,
                    borderRadius: BorderRadius.circular(9999),
                    border: Border.all(color: _kBorder),
                  ),
                  child:
                      Text(r, style: _pjs(size: 13, weight: FontWeight.w500)),
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  // ── Input bar ─────────────────────────────────────────────────────────────────
  Widget _buildInputBar() {
    return Container(
      color: _kCard,
      padding: const EdgeInsets.fromLTRB(8, 6, 8, 16),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            // + attachment icon
            IconButton(
              icon: const Icon(Icons.add, color: _kSubtext, size: 24),
              onPressed: () {},
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
            ),
            const SizedBox(width: 4),
            // Pill text input
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
                  textInputAction: TextInputAction.send,
                  onSubmitted: _send,
                  decoration: InputDecoration(
                    hintText: 'Type a message...',
                    hintStyle: _pjs(size: 13, color: _kSubtext),
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 11),
                    isDense: true,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            // Send button — filled purple circle
            GestureDetector(
              onTap: () => _send(_inputCtrl.text),
              child: Container(
                width: 44,
                height: 44,
                decoration: const BoxDecoration(
                    color: _kPrimary, shape: BoxShape.circle),
                child: const Icon(Icons.send, color: Colors.white, size: 20),
              ),
            ),
            // Mic icon
            IconButton(
              icon: Icon(Icons.mic_outlined, color: _kSecondary, size: 24),
              onPressed: () {},
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
            ),
          ],
        ),
      ),
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// WIDGETS
// ═════════════════════════════════════════════════════════════════════════════

// ── Date separator ────────────────────────────────────────────────────────────
class _DateSeparator extends StatelessWidget {
  const _DateSeparator({required this.label});
  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 14),
      child: Center(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
          decoration: BoxDecoration(
            color: _kSurface,
            borderRadius: BorderRadius.circular(9999),
            border: Border.all(color: _kBorder),
          ),
          child: Text(label, style: _pjs(size: 12, color: _kSubtext)),
        ),
      ),
    );
  }
}

// ── SPX Official Notice card ──────────────────────────────────────────────────
// Displayed as a full-width chat bubble from the system/courier
class _SpxNoticeCard extends StatelessWidget {
  const _SpxNoticeCard({
    required this.codAmount,
    required this.time,
  });
  final double codAmount;
  final String time;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Container(
        decoration: BoxDecoration(
          color: _kCard,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Header label ──────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 14, 14, 0),
              child: Row(
                children: [
                  const Icon(Icons.verified_outlined,
                      size: 15, color: _kSecondary),
                  const SizedBox(width: 6),
                  Text('SPX Express Official Notice',
                      style: _pjs(
                          size: 12,
                          weight: FontWeight.w700,
                          color: _kSecondary)),
                ],
              ),
            ),
            // ── Body text ─────────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 10, 14, 0),
              child: Text.rich(
                TextSpan(
                  text: 'Hi ',
                  style: _pjs(size: 14, height: 1.55),
                  children: [
                    TextSpan(
                      text: 'Abegail De Luna',
                      style:
                          _pjs(size: 14, weight: FontWeight.w700, height: 1.55),
                    ),
                    const TextSpan(
                        text: ', SPX Delivery rider here!\n\n'
                            'With your consent, we will take a clear photo of '
                            'the parcel as Proof of Delivery upon handoff.'),
                  ],
                ),
              ),
            ),
            // ── COD amount row ────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 14, 14, 0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('COD Amount Due',
                      style: _pjs(size: 13, color: _kSubtext)),
                  Text(
                    '₱${codAmount.toStringAsFixed(2)}',
                    style:
                        _pjs(size: 16, weight: FontWeight.w800, color: _kFlash),
                  ),
                ],
              ),
            ),
            // ── COD Unbox Inspection box ─────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 10, 14, 0),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: _kSurface,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: _kBorder),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.inventory_2_outlined,
                        size: 14, color: _kSubtext),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('[COD Unbox Inspection]',
                              style: _pjs(size: 13, weight: FontWeight.w700)),
                          const SizedBox(height: 4),
                          Text(
                            'You may check your item packaging and return on '
                            'the spot if there are exterior defects. Check '
                            'your order details for full coverage.',
                            style:
                                _pjs(size: 12, color: _kSubtext, height: 1.5),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            // ── Footer note + timestamp ───────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 10, 14, 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'For urgent route inquiries or gate gatepass, reply '
                    'below or contact Customer Support.',
                    style: _pjs(size: 12, color: _kSubtext, height: 1.5),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Text(time, style: _pjs(size: 11, color: _kSubtext)),
                      const SizedBox(width: 4),
                      const Icon(Icons.done_all, size: 13, color: _kSecondary),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Arrival card ──────────────────────────────────────────────────────────────
class _ArrivalCard extends StatelessWidget {
  const _ArrivalCard({
    required this.productName,
    required this.productImageSeed,
    required this.time,
  });
  final String productName;
  final String productImageSeed;
  final String time;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Container(
        decoration: BoxDecoration(
          color: _kCard,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Header ────────────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 14, 14, 0),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      'Your Parcel will be Arriving Soon!',
                      style: _pjs(size: 15, weight: FontWeight.w800),
                    ),
                  ),
                  const SizedBox(width: 8),
                  // Live purple dot
                  Container(
                    width: 9,
                    height: 9,
                    decoration: const BoxDecoration(
                        color: _kSecondary, shape: BoxShape.circle),
                  ),
                ],
              ),
            ),
            // ── Product row ───────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 12, 14, 0),
              child: Row(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.network(
                      'https://picsum.photos/seed/$productImageSeed/120/120',
                      width: 54,
                      height: 54,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) =>
                          Container(width: 54, height: 54, color: _kChip),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          productName,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: _pjs(
                              size: 13, weight: FontWeight.w600, height: 1.4),
                        ),
                        const SizedBox(height: 2),
                        Text('1 item bundle',
                            style: _pjs(size: 11, color: _kSubtext)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 14),
              child: Divider(height: 20, color: _kBorder),
            ),
            // ── Delivery address ──────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 0, 14, 0),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.location_on_outlined,
                      size: 14, color: _kSecondary),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Delivery Address',
                            style: _pjs(size: 12, weight: FontWeight.w700)),
                        const SizedBox(height: 2),
                        Text(
                          'Block 14 Lot 8 Orchid St, San Antonio, Parañaque',
                          style: _pjs(size: 12, color: _kSubtext, height: 1.4),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            // ── Footer: Sent by + timestamp ───────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 10, 14, 14),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.shield_outlined,
                          size: 13, color: _kSecondary),
                      const SizedBox(width: 4),
                      Text('Sent by SPX Logistics',
                          style: _pjs(
                              size: 12,
                              weight: FontWeight.w600,
                              color: _kSecondary)),
                    ],
                  ),
                  Text(time, style: _pjs(size: 11, color: _kSubtext)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Plain text bubble ─────────────────────────────────────────────────────────
class _TextBubble extends StatelessWidget {
  const _TextBubble({required this.msg});
  final _Msg msg;

  @override
  Widget build(BuildContext context) {
    final isMe = msg.isMe;
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        mainAxisAlignment:
            isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
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
}
