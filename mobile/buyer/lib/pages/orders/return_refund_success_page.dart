import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'return_refund_models.dart';
import 'refund_details_screen.dart';
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

// ═════════════════════════════════════════════════════════════════════════════
// RETURN / REFUND SUCCESS SCREEN
// ═════════════════════════════════════════════════════════════════════════════
class ReturnRefundSuccessPage extends StatelessWidget {
  const ReturnRefundSuccessPage({super.key, required this.summary});
  final ReturnOrderSummary summary;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _kSurface,
      // No back button — user completes the flow here
      appBar: AppBar(
        backgroundColor: _kCard,
        elevation: 0,
        automaticallyImplyLeading: false,
        title: Text('Request Submitted',
            style: _pjs(size: 17, weight: FontWeight.w800)),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            children: [
              const Spacer(flex: 2),

              // ── Success animation / icon ────────────────────────────────────
              Container(
                width: 96,
                height: 96,
                decoration:
                    const BoxDecoration(color: _kChip, shape: BoxShape.circle),
                child: const Icon(Icons.check_circle_rounded,
                    size: 56, color: _kSecondary),
              ),
              const SizedBox(height: 20),
              Text('Return/Refund Request Submitted',
                  textAlign: TextAlign.center,
                  style: _pjs(size: 20, weight: FontWeight.w800, height: 1.3)),
              const SizedBox(height: 10),
              Text(
                'Your request is now under review.\n'
                'We\'ll notify you within 1–3 business days.',
                textAlign: TextAlign.center,
                style: _pjs(size: 14, color: _kSubtext, height: 1.55),
              ),
              const SizedBox(height: 28),

              // ── Details card ────────────────────────────────────────────────
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: _kCard,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: _kBorder),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _Row(label: 'Order ID', value: summary.orderId),
                    const SizedBox(height: 8),
                    _Row(
                        label: 'Request Status',
                        value: 'Pending Review',
                        valueColor: _kSecondary),
                    const SizedBox(height: 8),
                    _Row(
                        label: 'Refund Amount',
                        value: '₱${summary.price.toStringAsFixed(2)}'),
                    const SizedBox(height: 8),
                    _Row(label: 'Refund Method', value: summary.paymentMethod),
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 12),
                      child: Divider(height: 1, color: _kBorder),
                    ),
                    // Timeline
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 20,
                          height: 20,
                          decoration: const BoxDecoration(
                              color: _kSecondary, shape: BoxShape.circle),
                          child: const Icon(Icons.access_time,
                              size: 12, color: Colors.white),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Review Timeline',
                                  style: _pjs(size: 11, color: _kSubtext)),
                              const SizedBox(height: 3),
                              Text(
                                'Seller review: 1–3 business days\n'
                                'Refund processing: 3–5 business days after approval',
                                style:
                                    _pjs(size: 12, color: _kText, height: 1.5),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const Spacer(flex: 3),

              // ── View Refund Details ─────────────────────────────────────────
              SizedBox(
                width: double.infinity,
                height: 52,
                child: OutlinedButton.icon(
                  onPressed: () {
                    // Use orderId as requestId lookup key
                    final req = ReturnRefundStore.forOrder(summary.orderId);
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => RefundDetailsScreen(
                          refundRequestId: req?.orderId ?? 'REF-PENDING-001',
                        ),
                      ),
                    );
                  },
                  icon: const Icon(Icons.receipt_long_outlined, size: 16),
                  label: Text('View Refund Details',
                      style: _pjs(
                          size: 14,
                          weight: FontWeight.w700,
                          color: _kSecondary)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: _kSecondary),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                    foregroundColor: _kSecondary,
                  ),
                ),
              ),
              const SizedBox(height: 10),

              // ── Back to My Purchases ────────────────────────────────────────
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: () {
                    // Pop all the way back to My Purchases (or root)
                    Navigator.of(context).popUntil(
                      (route) =>
                          route.isFirst || route.settings.name == '/purchases',
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _kPrimary,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                  child: Text('Back to My Purchases',
                      style: _pjs(
                          size: 15,
                          weight: FontWeight.w700,
                          color: Colors.white)),
                ),
              ),
              const SizedBox(height: 12),
              GestureDetector(
                onTap: () => Navigator.of(context).popUntil(
                  (r) => r.isFirst,
                ),
                child: Text('Continue Shopping',
                    style: _pjs(
                        size: 14, weight: FontWeight.w600, color: _kSecondary)),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}

class _Row extends StatelessWidget {
  const _Row({
    required this.label,
    required this.value,
    this.valueColor,
  });
  final String label, value;
  final Color? valueColor;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        SizedBox(
          width: 110,
          child: Text(label, style: _pjs(size: 12, color: _kSubtext)),
        ),
        Expanded(
          child: Text(
            value,
            style: _pjs(
              size: 12,
              weight: FontWeight.w600,
              color: valueColor ?? _kText,
            ),
          ),
        ),
      ],
    );
  }
}
