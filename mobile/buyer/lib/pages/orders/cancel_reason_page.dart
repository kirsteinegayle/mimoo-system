import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'cancel_confirmation_page.dart';
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

TextStyle _pjs({
  double size = 14,
  FontWeight weight = FontWeight.w400,
  Color color = _kText,
  double? height,
}) =>
    GoogleFonts.plusJakartaSans(
        fontSize: size, fontWeight: weight, color: color, height: height);

// ── Cancellation reasons ──────────────────────────────────────────────────────
const _kReasons = [
  'Changed my mind',
  'Found a better price elsewhere',
  'Ordered by mistake / duplicate order',
  'Shipping takes too long',
  'Need to modify order / address',
  'Other',
];

// ─────────────────────────────────────────────────────────────────────────────
// ORDER SUMMARY DATA passed in from My Purchases
// ─────────────────────────────────────────────────────────────────────────────
class CancelOrderSummary {
  const CancelOrderSummary({
    required this.orderId,
    required this.storeName,
    required this.productName,
    required this.productSub,
    required this.imageUrl,
    required this.price,
    required this.qty,
    required this.paymentMethod,
    required this.isPaid,
    this.dbOrderId,
  });

  final String orderId;

  /// Real DB order id (null for hardcoded sample orders).
  final int? dbOrderId;

  final String storeName;
  final String productName;
  final String productSub;
  final String imageUrl;
  final double price;
  final int qty;
  final String paymentMethod;

  /// true = payment already collected → refund timeline should be shown
  final bool isPaid;
}

// ═════════════════════════════════════════════════════════════════════════════
// CANCEL REASON SCREEN
// ═════════════════════════════════════════════════════════════════════════════
class CancelReasonPage extends StatefulWidget {
  const CancelReasonPage({
    super.key,
    required this.summary,
    required this.onCancelled,
    this.onCancelledWithReason,
  });

  final CancelOrderSummary summary;
  final VoidCallback onCancelled;

  /// Called with the selected reason string when cancellation is confirmed.
  /// Use this to update local state in the parent immediately.
  final void Function(String reason)? onCancelledWithReason;

  @override
  State<CancelReasonPage> createState() => _CancelReasonPageState();
}

class _CancelReasonPageState extends State<CancelReasonPage> {
  String? _selected;
  final _commentCtrl = TextEditingController();
  static const int _maxComment = 200;

  @override
  void dispose() {
    _commentCtrl.dispose();
    super.dispose();
  }

  void _proceed() {
    if (_selected == null) return;
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => CancelConfirmationPage(
          summary: widget.summary,
          reason: _selected!,
          comment: _commentCtrl.text.trim(),
          onCancelled: widget.onCancelled,
          onCancelledWithReason: widget.onCancelledWithReason,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final canProceed = _selected != null;

    return Scaffold(
      backgroundColor: _kSurface,
      appBar: _buildAppBar(context),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildOrderCard(),
                  const SizedBox(height: 12),
                  _buildReasonCard(),
                  const SizedBox(height: 12),
                  _buildCommentCard(),
                  if (widget.summary.isPaid) ...[
                    const SizedBox(height: 12),
                    _buildRefundTimeline(),
                  ],
                ],
              ),
            ),
          ),
          _buildBottomBar(canProceed),
        ],
      ),
    );
  }

  // ── App bar ──────────────────────────────────────────────────────────────────
  PreferredSizeWidget _buildAppBar(BuildContext context) {
    return AppBar(
      backgroundColor: _kCard,
      elevation: 0,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back, color: _kText),
        onPressed: () => Navigator.pop(context),
      ),
      title: Text('Why are you cancelling?',
          style: _pjs(size: 16, weight: FontWeight.w800)),
      actions: [
        Padding(
          padding: const EdgeInsets.only(right: 14),
          child: TextButton(
            onPressed: () {},
            child: Text('Order Help',
                style: _pjs(
                    size: 13, weight: FontWeight.w600, color: _kSecondary)),
          ),
        ),
      ],
    );
  }

  // ── Order summary card ────────────────────────────────────────────────────────
  Widget _buildOrderCard() {
    final s = widget.summary;
    return Container(
      decoration: BoxDecoration(
        color: _kCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Store row
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 10, 12, 8),
            child: Row(
              children: [
                Text(s.storeName,
                    style: _pjs(size: 13, weight: FontWeight.w700)),
                const SizedBox(width: 6),
                Text('|', style: _pjs(size: 12, color: _kBorder)),
                const SizedBox(width: 6),
                Text('#${s.orderId}', style: _pjs(size: 12, color: _kSubtext)),
                const Spacer(),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: _kChip,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text('Cancellation\nRequest',
                      textAlign: TextAlign.center,
                      style: _pjs(
                          size: 9,
                          weight: FontWeight.w700,
                          color: _kSecondary,
                          height: 1.4)),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: _kBorder),
          // Product row
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.network(
                    s.imageUrl,
                    width: 56,
                    height: 56,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) =>
                        Container(width: 56, height: 56, color: _kChip),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(s.productName,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: _pjs(
                              size: 12, weight: FontWeight.w600, height: 1.4)),
                      const SizedBox(height: 2),
                      Text(s.productSub,
                          style: _pjs(size: 11, color: _kSubtext)),
                      const SizedBox(height: 2),
                      Text('${s.qty} Pc',
                          style: _pjs(size: 11, color: _kSubtext)),
                    ],
                  ),
                ),
                // Right column: x1 + price + delivery
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text('x${s.qty}', style: _pjs(size: 11, color: _kSubtext)),
                    const SizedBox(height: 4),
                    Text('₱${s.price.toStringAsFixed(0)}',
                        style: _pjs(
                            size: 14,
                            weight: FontWeight.w800,
                            color: _kPrimary)),
                    const SizedBox(height: 4),
                    Text('Standard Delivery',
                        style: _pjs(size: 10, color: _kSubtext)),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── Reason selection card ─────────────────────────────────────────────────────
  Widget _buildReasonCard() {
    return Container(
      decoration: BoxDecoration(
        color: _kCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 14, 14, 10),
            child: Text('SELECT REASON FOR CANCELLATION',
                style:
                    _pjs(size: 11, weight: FontWeight.w800, color: _kSubtext)),
          ),
          const Divider(height: 1, color: _kBorder),
          ..._kReasons.map((reason) => _ReasonTile(
                reason: reason,
                selected: _selected == reason,
                onTap: () => setState(() => _selected = reason),
              )),
        ],
      ),
    );
  }

  // ── Optional comment card ─────────────────────────────────────────────────────
  Widget _buildCommentCard() {
    return Container(
      decoration: BoxDecoration(
        color: _kCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _kBorder),
      ),
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text('Additional details',
                  style: _pjs(size: 13, weight: FontWeight.w600)),
              const SizedBox(width: 5),
              Text('(optional)', style: _pjs(size: 12, color: _kSubtext)),
              const Spacer(),
              ValueListenableBuilder<TextEditingValue>(
                valueListenable: _commentCtrl,
                builder: (_, val, __) => Text(
                  '${val.text.length}/$_maxComment',
                  style: _pjs(size: 11, color: _kSubtext),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          TextField(
            controller: _commentCtrl,
            maxLength: _maxComment,
            maxLines: 4,
            style: _pjs(size: 13, height: 1.5),
            decoration: InputDecoration(
              hintText:
                  'Tell us more so we can improve your shopping journey...',
              hintStyle: _pjs(size: 13, color: _kSubtext, height: 1.5),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: _kBorder),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: _kBorder),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: _kSecondary, width: 1.5),
              ),
              counterText: '',
              contentPadding: const EdgeInsets.all(12),
            ),
          ),
        ],
      ),
    );
  }

  // ── Refund timeline notice ────────────────────────────────────────────────────
  Widget _buildRefundTimeline() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: _kChip,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _kBorder),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 22,
            height: 22,
            decoration:
                BoxDecoration(color: _kSecondary, shape: BoxShape.circle),
            child:
                const Icon(Icons.info_outline, size: 13, color: Colors.white),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Expected Refund Timeline',
                    style: _pjs(
                        size: 12, weight: FontWeight.w700, color: _kPrimary)),
                const SizedBox(height: 4),
                Text.rich(
                  TextSpan(
                    text: 'Payment will be automatically credited back to your '
                        'original payment method (${widget.summary.paymentMethod}) '
                        'within ',
                    style: _pjs(size: 12, color: _kSubtext, height: 1.5),
                    children: [
                      TextSpan(
                        text: '24–48 hours',
                        style: _pjs(
                            size: 12,
                            weight: FontWeight.w700,
                            color: _kSecondary,
                            height: 1.5),
                      ),
                      TextSpan(
                        text: ' once cancellation is confirmed.',
                        style: _pjs(size: 12, color: _kSubtext, height: 1.5),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── Bottom bar ────────────────────────────────────────────────────────────────
  Widget _buildBottomBar(bool canProceed) {
    return Container(
      color: _kCard,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              onPressed: canProceed ? _proceed : null,
              style: ElevatedButton.styleFrom(
                backgroundColor:
                    canProceed ? _kPrimary : _kPrimary.withValues(alpha: 0.4),
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              child: Text('Confirm Cancellation',
                  style: _pjs(
                      size: 15, weight: FontWeight.w700, color: Colors.white)),
            ),
          ),
          const SizedBox(height: 10),
          GestureDetector(
            onTap: () => Navigator.pop(context),
            child: Text('Keep Order',
                style: _pjs(size: 14, weight: FontWeight.w600, color: _kText)),
          ),
        ],
      ),
    );
  }
}

// ── Reason tile ───────────────────────────────────────────────────────────────
class _ReasonTile extends StatelessWidget {
  const _ReasonTile({
    required this.reason,
    required this.selected,
    required this.onTap,
  });
  final String reason;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        child: Row(
          children: [
            Expanded(
              child: Text(
                reason,
                style: _pjs(
                  size: 14,
                  weight: selected ? FontWeight.w600 : FontWeight.w400,
                  color: selected ? _kSecondary : _kText,
                ),
              ),
            ),
            // Radio circle
            Container(
              width: 22,
              height: 22,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: selected ? _kPrimary : Colors.transparent,
                border: Border.all(
                  color: selected ? _kPrimary : _kBorder,
                  width: 1.8,
                ),
              ),
              child: selected
                  ? Center(
                      child: Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                            color: Colors.white, shape: BoxShape.circle),
                      ),
                    )
                  : null,
            ),
          ],
        ),
      ),
    );
  }
}
