import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'cancel_reason_page.dart';
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
        fontSize: size, fontWeight: weight, color: color, height: height);

// ═════════════════════════════════════════════════════════════════════════════
// CANCEL SUCCESS SCREEN
// ═════════════════════════════════════════════════════════════════════════════
class CancelSuccessPage extends StatelessWidget {
  const CancelSuccessPage({
    super.key,
    required this.summary,
    required this.reason,
    required this.isPaid,
  });

  final CancelOrderSummary summary;
  final String reason;
  final bool isPaid;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _kSurface,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            children: [
              const Spacer(flex: 2),
              // ── Success icon ─────────────────────────────────────────────
              Container(
                width: 88,
                height: 88,
                decoration:
                    const BoxDecoration(color: _kChip, shape: BoxShape.circle),
                child: const Icon(Icons.check_circle_rounded,
                    size: 52, color: _kSecondary),
              ),
              const SizedBox(height: 20),
              Text('Order Cancelled',
                  style: _pjs(size: 22, weight: FontWeight.w800)),
              const SizedBox(height: 8),
              Text(
                'Your order #${summary.orderId} has been\nsuccessfully cancelled.',
                textAlign: TextAlign.center,
                style: _pjs(size: 14, color: _kSubtext, height: 1.5),
              ),
              const SizedBox(height: 28),
              // ── Details card ─────────────────────────────────────────────
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
                    _DetailRow(label: 'Order ID', value: summary.orderId),
                    const SizedBox(height: 8),
                    _DetailRow(label: 'Reason', value: reason),
                    if (isPaid) ...[
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 12),
                        child: Divider(height: 1, color: _kBorder),
                      ),
                      // Refund timeline
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 20,
                            height: 20,
                            decoration: const BoxDecoration(
                                color: _kSecondary, shape: BoxShape.circle),
                            child: const Icon(Icons.info_outline,
                                size: 12, color: Colors.white),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Refund Status',
                                    style: _pjs(size: 11, color: _kSubtext)),
                                const SizedBox(height: 3),
                                Text.rich(
                                  TextSpan(
                                    text: 'Refund initiated · ',
                                    style: _pjs(
                                        size: 13,
                                        weight: FontWeight.w700,
                                        color: _kGreen),
                                    children: [
                                      TextSpan(
                                        text:
                                            '₱${summary.price.toStringAsFixed(2)} '
                                            'to ${summary.paymentMethod}',
                                        style: _pjs(
                                            size: 13,
                                            weight: FontWeight.w600,
                                            color: _kText),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 3),
                                Text(
                                  'Expected in 24–48 hours',
                                  style: _pjs(size: 12, color: _kSubtext),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
              const Spacer(flex: 3),
              // ── Back to My Purchases button ───────────────────────────────
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: () {
                    // Pop back past the cancel flow to My Purchases
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

class _DetailRow extends StatelessWidget {
  const _DetailRow({required this.label, required this.value});
  final String label, value;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 100,
          child: Text(label, style: _pjs(size: 12, color: _kSubtext)),
        ),
        Expanded(
          child: Text(value, style: _pjs(size: 12, weight: FontWeight.w600)),
        ),
      ],
    );
  }
}
