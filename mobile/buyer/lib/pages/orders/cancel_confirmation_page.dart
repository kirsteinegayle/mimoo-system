import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'cancel_reason_page.dart';
import 'cancel_success_page.dart';
import 'cancellation_store.dart';
import '../../services/order_repository.dart';
import '../../services/api_service.dart';
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
        fontSize: size, fontWeight: weight, color: color, height: height);

// ═════════════════════════════════════════════════════════════════════════════
// CANCEL CONFIRMATION SCREEN
// ═════════════════════════════════════════════════════════════════════════════
class CancelConfirmationPage extends StatefulWidget {
  const CancelConfirmationPage({
    super.key,
    required this.summary,
    required this.reason,
    required this.comment,
    required this.onCancelled,
    this.onCancelledWithReason,
  });

  final CancelOrderSummary summary;
  final String reason;
  final String comment;
  final VoidCallback onCancelled;
  final void Function(String reason)? onCancelledWithReason;

  @override
  State<CancelConfirmationPage> createState() => _CancelConfirmationPageState();
}

class _CancelConfirmationPageState extends State<CancelConfirmationPage> {
  bool _loading = false;

  Future<void> _confirmCancellation() async {
    setState(() => _loading = true);

    try {
      // ── Real API call when we have a DB order id ──────────────────────────
      if (widget.summary.dbOrderId != null) {
        await OrderRepository.instance
            .cancelOrder(widget.summary.dbOrderId!, reason: widget.reason);
      } else {
        // Hardcoded sample order — simulate delay
        await Future.delayed(const Duration(milliseconds: 800));
      }

      // Update in-memory cancellation store
      CancellationStore.cancel(
        orderId: widget.summary.orderId,
        reason: widget.reason,
        comment: widget.comment,
        isPaid: widget.summary.isPaid,
      );

      // Notify My Purchases — with-reason callback mutates the order list,
      // plain callback triggers setState so the list view rebuilds.
      widget.onCancelledWithReason?.call(widget.reason);
      widget.onCancelled();

      if (!mounted) return;
      setState(() => _loading = false);

      // Replace entire stack up to success screen, then pop back to My Purchases
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => CancelSuccessPage(
            summary: widget.summary,
            reason: widget.reason,
            isPaid: widget.summary.isPaid,
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);

      // Show server error in a red snackbar
      final msg = e is ApiException ? e.message : e.toString();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(msg, style: _pjs(size: 13, color: Colors.white)),
          backgroundColor: AppColors.flash,
          duration: const Duration(seconds: 4),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
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
                  _buildNotice(),
                  const SizedBox(height: 12),
                  _buildOrderSummaryCard(),
                  const SizedBox(height: 12),
                  _buildReasonCard(),
                  if (widget.comment.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    _buildCommentCard(),
                  ],
                  if (widget.summary.isPaid) ...[
                    const SizedBox(height: 12),
                    _buildRefundCard(),
                  ],
                ],
              ),
            ),
          ),
          _buildBottomBar(context),
        ],
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(BuildContext context) {
    return AppBar(
      backgroundColor: _kCard,
      elevation: 0,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back, color: _kText),
        onPressed: () => Navigator.pop(context),
      ),
      title: Text('Confirm Cancellation',
          style: _pjs(size: 16, weight: FontWeight.w800)),
    );
  }

  // ── Top warning notice ────────────────────────────────────────────────────────
  Widget _buildNotice() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: _kFlash.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _kFlash.withValues(alpha: 0.18)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.warning_amber_rounded, size: 18, color: _kFlash),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'Are you sure you want to cancel this order? '
              'This action cannot be undone once confirmed.',
              style: _pjs(size: 13, color: _kFlash, height: 1.5),
            ),
          ),
        ],
      ),
    );
  }

  // ── Order summary ─────────────────────────────────────────────────────────────
  Widget _buildOrderSummaryCard() {
    final s = widget.summary;
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
          Text('Order Summary', style: _pjs(size: 13, weight: FontWeight.w800)),
          const SizedBox(height: 12),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.network(
                  s.imageUrl,
                  width: 60,
                  height: 60,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) =>
                      Container(width: 60, height: 60, color: _kChip),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(s.storeName, style: _pjs(size: 11, color: _kSubtext)),
                    const SizedBox(height: 2),
                    Text(s.productName,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: _pjs(
                            size: 13, weight: FontWeight.w700, height: 1.35)),
                    const SizedBox(height: 3),
                    Text(s.productSub, style: _pjs(size: 11, color: _kSubtext)),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text('x${s.qty}', style: _pjs(size: 11, color: _kSubtext)),
                  const SizedBox(height: 4),
                  Text('₱${s.price.toStringAsFixed(2)}',
                      style: _pjs(
                          size: 15, weight: FontWeight.w800, color: _kPrimary)),
                ],
              ),
            ],
          ),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 10),
            child: Divider(height: 1, color: _kBorder),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Order ID', style: _pjs(size: 12, color: _kSubtext)),
              Text(s.orderId, style: _pjs(size: 12, weight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Payment Method', style: _pjs(size: 12, color: _kSubtext)),
              Text(s.paymentMethod,
                  style: _pjs(size: 12, weight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Payment Status', style: _pjs(size: 12, color: _kSubtext)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: s.isPaid
                      ? AppColors.success.withValues(alpha: 0.1)
                      : _kFlash.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(9999),
                ),
                child: Text(
                  s.isPaid ? 'Paid' : 'Unpaid',
                  style: _pjs(
                    size: 11,
                    weight: FontWeight.w700,
                    color: s.isPaid ? AppColors.success : _kFlash,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ── Cancellation reason ───────────────────────────────────────────────────────
  Widget _buildReasonCard() {
    return Container(
      decoration: BoxDecoration(
        color: _kCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _kBorder),
      ),
      padding: const EdgeInsets.all(14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.help_outline, size: 16, color: _kSecondary),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Cancellation Reason',
                    style: _pjs(size: 12, color: _kSubtext)),
                const SizedBox(height: 4),
                Text(widget.reason,
                    style: _pjs(size: 14, weight: FontWeight.w700)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── Optional comment ──────────────────────────────────────────────────────────
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
          Text('Additional Details', style: _pjs(size: 12, color: _kSubtext)),
          const SizedBox(height: 6),
          Text(widget.comment, style: _pjs(size: 13, height: 1.5)),
        ],
      ),
    );
  }

  // ── Refund timeline (shown when paid) ─────────────────────────────────────────
  Widget _buildRefundCard() {
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
                const BoxDecoration(color: _kSecondary, shape: BoxShape.circle),
            child:
                const Icon(Icons.info_outline, size: 13, color: Colors.white),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Refund Timeline',
                    style: _pjs(
                        size: 12, weight: FontWeight.w700, color: _kPrimary)),
                const SizedBox(height: 4),
                Text.rich(
                  TextSpan(
                    text: '₱${widget.summary.price.toStringAsFixed(2)} '
                        'will be refunded to your '
                        '${widget.summary.paymentMethod} within ',
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
                        text: ' after cancellation is confirmed.',
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
  Widget _buildBottomBar(BuildContext context) {
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
              onPressed: _loading ? null : _confirmCancellation,
              style: ElevatedButton.styleFrom(
                backgroundColor: _kFlash,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              child: _loading
                  ? const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(
                          color: Colors.white, strokeWidth: 2.5),
                    )
                  : Text('Confirm Cancellation',
                      style: _pjs(
                          size: 15,
                          weight: FontWeight.w700,
                          color: Colors.white)),
            ),
          ),
          const SizedBox(height: 10),
          GestureDetector(
            onTap: () => Navigator.popUntil(
              context,
              (r) => r.isFirst || r.settings.name == '/purchases',
            ),
            child: Text('Keep Order',
                style: _pjs(size: 14, weight: FontWeight.w600, color: _kText)),
          ),
        ],
      ),
    );
  }
}
