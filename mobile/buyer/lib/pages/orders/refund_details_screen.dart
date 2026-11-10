import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../home/product_detail_page.dart';
import '../seller/seller_store_page.dart';
import '../../models/product.dart';
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
const _kRed = AppColors.flash;

TextStyle _pjs({
  double size = 14,
  FontWeight weight = FontWeight.w400,
  Color color = _kText,
  double? height,
  TextDecoration? decoration,
}) =>
    GoogleFonts.plusJakartaSans(
      fontSize: size,
      fontWeight: weight,
      color: color,
      height: height,
      decoration: decoration,
    );

// ═════════════════════════════════════════════════════════════════════════════
// DATA MODEL
// ═════════════════════════════════════════════════════════════════════════════

enum RefundStatus {
  pending, // submitted, waiting for seller/platform review
  approved, // approved, not yet processed
  processed, // money sent from platform to payment provider
  credited, // money visible in buyer's account
  rejected, // declined
}

extension RefundStatusX on RefundStatus {
  String get label {
    switch (this) {
      case RefundStatus.pending:
        return 'Refund Request Submitted';
      case RefundStatus.approved:
        return 'Refund Approved';
      case RefundStatus.processed:
        return 'Refund Processing';
      case RefundStatus.credited:
        return 'Refund Credited Successfully';
      case RefundStatus.rejected:
        return 'Refund Rejected';
    }
  }

  Color get bannerColor {
    switch (this) {
      case RefundStatus.pending:
        return _kSecondary;
      case RefundStatus.approved:
        return _kSecondary;
      case RefundStatus.processed:
        return _kSecondary;
      case RefundStatus.credited:
        return _kGreen;
      case RefundStatus.rejected:
        return _kRed;
    }
  }
}

class RefundRequest {
  const RefundRequest({
    required this.requestId,
    required this.orderId,
    required this.status,
    required this.refundAmount,
    required this.paymentMethod,
    required this.storeName,
    required this.storeBadge,
    required this.sellerId,
    required this.productName,
    required this.productSub,
    required this.productImageSeed,
    required this.productId,
    required this.reason,
    required this.requestedAt,
    this.refundApprovedAt,
    this.refundProcessedAt,
    this.refundCreditedAt,
    this.estimatedCreditBy,
    this.shippingRefund = 0,
    this.deduction = 0,
    this.rejectionReason,
    this.qty = 1,
    this.itemPrice = 0,
  });

  final String requestId;
  final String orderId;
  final RefundStatus status;
  final double refundAmount;
  final String paymentMethod;
  final String storeName;
  final String storeBadge;
  final String sellerId;
  final String productName;
  final String productSub;
  final String productImageSeed;
  final String productId;
  final String reason;
  final DateTime requestedAt;
  final DateTime? refundApprovedAt;
  final DateTime? refundProcessedAt;
  final DateTime? refundCreditedAt;
  final String? estimatedCreditBy; // e.g. "17 Nov"
  final double shippingRefund;
  final double deduction;
  final String? rejectionReason;
  final int qty;
  final double itemPrice;
}

// ── Sample data keyed by requestId ───────────────────────────────────────────
final Map<String, RefundRequest> _sampleRequests = {
  '2511150SXRTVB2D': RefundRequest(
    requestId: '2511150SXRTVB2D',
    orderId: 'MM-9284102',
    status: RefundStatus.credited,
    refundAmount: 115,
    paymentMethod: 'mimooPay Balance',
    storeName: 'MAANGE Official Shop',
    storeBadge: 'Mall',
    sellerId: '',
    productName:
        'MAANGE Makeup Brush Set with Soft Synthetic Bristles for Effortless Base Makeup',
    productSub: 'Black, 3pcs',
    productImageSeed: 'brushset',
    productId: 'maange-brush-1',
    reason: 'Seller sent wrong item (e.g wrong size, model)',
    itemPrice: 115,
    shippingRefund: 0,
    deduction: 0,
    requestedAt: DateTime(2025, 11, 15, 15, 47),
    refundApprovedAt: DateTime(2025, 11, 15, 16, 15),
    refundProcessedAt: DateTime(2025, 11, 15, 16, 15),
    refundCreditedAt: DateTime(2025, 11, 17, 10, 0),
    estimatedCreditBy: '17 Nov',
    qty: 1,
  ),
  'REF-PENDING-001': RefundRequest(
    requestId: 'REF-PENDING-001',
    orderId: 'TZ-8849201',
    status: RefundStatus.pending,
    refundAmount: 1250,
    paymentMethod: 'GCash',
    storeName: 'TechZone Direct',
    storeBadge: 'PREFERRED',
    sellerId: '',
    productName: 'Wireless ANC Earbuds Pro 2nd Gen',
    productSub: 'Matte Black',
    productImageSeed: 'earbuds',
    productId: 'tz-earbuds-1',
    reason: 'Item is physically damaged / broken',
    itemPrice: 1250,
    shippingRefund: 0,
    deduction: 0,
    requestedAt: DateTime(2025, 10, 28, 9, 30),
    estimatedCreditBy: '3 Nov',
    qty: 1,
  ),
  'REF-PROCESSING-002': RefundRequest(
    requestId: 'REF-PROCESSING-002',
    orderId: 'SP-9923001',
    status: RefundStatus.processed,
    refundAmount: 2450,
    paymentMethod: 'GCash',
    storeName: 'SportHub PH',
    storeBadge: 'PREFERRED',
    sellerId: '',
    productName: 'CloudStep Cushion Running Shoes',
    productSub: 'White/Volt, Size 42',
    productImageSeed: 'shoes2',
    productId: 'sp-shoes-1',
    reason: 'Wrong color / variant received',
    itemPrice: 2450,
    shippingRefund: 80,
    deduction: 0,
    requestedAt: DateTime(2025, 10, 12, 11, 0),
    refundApprovedAt: DateTime(2025, 10, 13, 9, 0),
    refundProcessedAt: DateTime(2025, 10, 14, 14, 30),
    estimatedCreditBy: '16 Oct',
    qty: 1,
  ),
};

// ═════════════════════════════════════════════════════════════════════════════
// SCREEN
// ═════════════════════════════════════════════════════════════════════════════
class RefundDetailsScreen extends StatefulWidget {
  const RefundDetailsScreen({
    super.key,
    required this.refundRequestId,
  });

  final String refundRequestId;

  @override
  State<RefundDetailsScreen> createState() => _RefundDetailsScreenState();
}

class _RefundDetailsScreenState extends State<RefundDetailsScreen> {
  bool _detailsExpanded = true; // tracks Expand/Collapse toggle

  late final RefundRequest? _req;

  @override
  void initState() {
    super.initState();
    _req = _sampleRequests[widget.refundRequestId];
  }

  @override
  Widget build(BuildContext context) {
    if (_req == null) {
      return Scaffold(
        backgroundColor: _kSurface,
        appBar: AppBar(
          backgroundColor: _kCard,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: _kText),
            onPressed: () => Navigator.pop(context),
          ),
          title: Text('Return/Refund Details',
              style: _pjs(size: 16, weight: FontWeight.w800)),
        ),
        body: Center(
          child: Text('Request not found',
              style: _pjs(size: 14, color: _kSubtext)),
        ),
      );
    }

    final req = _req!;
    return Scaffold(
      backgroundColor: _kSurface,
      appBar: _buildAppBar(),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildStatusBanner(req),
            _buildRefundCard(req),
            const SizedBox(height: 10),
            _buildSellerProductCard(req),
            const SizedBox(height: 10),
            _buildSupportCenter(req),
            const SizedBox(height: 32),
          ],
        ),
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
      title: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text('Return/Refund', style: _pjs(size: 16, weight: FontWeight.w800)),
          Text('Details', style: _pjs(size: 16, weight: FontWeight.w800)),
        ],
      ),
    );
  }

  // ── Status banner ─────────────────────────────────────────────────────────────
  Widget _buildStatusBanner(RefundRequest req) {
    return Container(
      width: double.infinity,
      color: req.status.bannerColor,
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
      child: Text(
        req.status.label,
        style: _pjs(size: 18, weight: FontWeight.w800, color: Colors.white),
      ),
    );
  }

  // ── Main refund card ──────────────────────────────────────────────────────────
  Widget _buildRefundCard(RefundRequest req) {
    return Container(
      color: _kCard,
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Refund Amount Details link
          GestureDetector(
            onTap: () => _showBreakdownModal(req),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('Refund Amount Details',
                    style: _pjs(
                        size: 13,
                        color: _kSubtext,
                        decoration: TextDecoration.underline)),
                const Icon(Icons.chevron_right, size: 16, color: _kSubtext),
              ],
            ),
          ),
          const SizedBox(height: 6),
          // Amount
          Center(
            child: Text(
              '₱${req.refundAmount.toStringAsFixed(0)}',
              style: _pjs(size: 38, weight: FontWeight.w800, color: _kText),
            ),
          ),
          const SizedBox(height: 6),
          // "To [Payment Method]" link
          Center(
            child: GestureDetector(
              onTap: () => _showPaymentMethodInfo(req),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('To ${req.paymentMethod}',
                      style: _pjs(
                          size: 13,
                          weight: FontWeight.w600,
                          color: _kSecondary,
                          decoration: TextDecoration.underline)),
                  const Icon(Icons.chevron_right, size: 16, color: _kSecondary),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
          // Progress tracker
          _buildProgressTracker(req),
          // Estimated credit note
          if (req.status != RefundStatus.credited &&
              req.status != RefundStatus.rejected &&
              req.estimatedCreditBy != null) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: _kChip,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'Your refund is estimated to be credited by ${req.estimatedCreditBy}, '
                'exact date and time is subject to the financial institution.',
                style: _pjs(size: 12, color: _kSubtext, height: 1.5),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ],
      ),
    );
  }

  // ── Progress tracker ──────────────────────────────────────────────────────────
  Widget _buildProgressTracker(RefundRequest req) {
    // Steps: Approved → Processed → Credited
    final steps = [
      _ProgressStep(
        icon: Icons.assignment_turned_in_outlined,
        label: 'Refund\nApproved',
        date: req.refundApprovedAt != null
            ? _formatDate(req.refundApprovedAt!)
            : null,
        isDone: req.refundApprovedAt != null,
        isCurrent:
            req.refundApprovedAt != null && req.refundProcessedAt == null,
      ),
      _ProgressStep(
        icon: Icons.account_balance_outlined,
        label: 'Refund\nProcessed',
        date: req.refundProcessedAt != null
            ? _formatDate(req.refundProcessedAt!)
            : null,
        isDone: req.refundProcessedAt != null,
        isCurrent:
            req.refundProcessedAt != null && req.refundCreditedAt == null,
      ),
      _ProgressStep(
        icon: Icons.credit_card_outlined,
        label: 'Refund\nCredited',
        date: req.refundCreditedAt != null
            ? _formatDate(req.refundCreditedAt!)
            : req.estimatedCreditBy != null
                ? null
                : null,
        // Badge shows "By 17" only while still pending
        pendingBadge:
            req.refundCreditedAt == null && req.estimatedCreditBy != null
                ? 'By ${req.estimatedCreditBy!.split(' ').first}'
                : null,
        isDone: req.refundCreditedAt != null,
        isCurrent: req.refundCreditedAt != null,
      ),
    ];

    return Row(
      children: steps.asMap().entries.expand((entry) {
        final i = entry.key;
        final step = entry.value;
        final widgets = <Widget>[
          Expanded(child: _ProgressStepWidget(step: step)),
        ];
        if (i < steps.length - 1) {
          widgets.add(_ProgressConnector(filled: step.isDone));
        }
        return widgets;
      }).toList(),
    );
  }

  // ── Seller + Product card ─────────────────────────────────────────────────────
  Widget _buildSellerProductCard(RefundRequest req) {
    return Container(
      color: _kCard,
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Seller row
          GestureDetector(
            // Only a real numeric seller id opens the store; the sample
            // refund data has none, so the link is disabled.
            onTap: int.tryParse(req.sellerId) == null
                ? null
                : () => Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => SellerStorePage(
                          sellerId: req.sellerId,
                          sellerName: req.storeName,
                        ),
                      ),
                    ),
            child: Row(
              children: [
                if (req.storeBadge.isNotEmpty)
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    margin: const EdgeInsets.only(right: 6),
                    decoration: BoxDecoration(
                      color: _kPrimary,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(req.storeBadge,
                        style: _pjs(
                            size: 9,
                            weight: FontWeight.w800,
                            color: Colors.white)),
                  ),
                Expanded(
                  child: Text(req.storeName,
                      style: _pjs(size: 14, weight: FontWeight.w800)),
                ),
                const Icon(Icons.chevron_right, size: 18, color: _kSubtext),
              ],
            ),
          ),
          const SizedBox(height: 12),
          const Divider(height: 1, color: _kBorder),
          const SizedBox(height: 12),
          // Product row
          GestureDetector(
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => ProductDetailPage(
                  product: Product(
                    id: req.productId.hashCode,
                    name: req.productName,
                    price: req.itemPrice,
                    imageUrl:
                        'https://picsum.photos/seed/${req.productImageSeed}/300/300',
                    category: 'Store',
                    rating: 4.5,
                    reviewCount: 0,
                  ),
                ),
              ),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(6),
                  child: Image.network(
                    'https://picsum.photos/seed/${req.productImageSeed}/100/100',
                    width: 50,
                    height: 50,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) =>
                        Container(width: 50, height: 50, color: _kChip),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(req.productName,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: _pjs(
                              size: 13, weight: FontWeight.w600, height: 1.35)),
                      const SizedBox(height: 3),
                      Text(req.productSub,
                          style: _pjs(size: 11, color: _kSubtext)),
                    ],
                  ),
                ),
                Text('x${req.qty}', style: _pjs(size: 12, color: _kSubtext)),
              ],
            ),
          ),
          const SizedBox(height: 14),
          const Divider(height: 1, color: _kBorder),
          const SizedBox(height: 12),
          // Detail rows
          _DetailRow(
            label: 'Refund Amount',
            value: '₱${req.refundAmount.toStringAsFixed(0)}',
            actionLabel: 'View Detail',
            onAction: () => _showBreakdownModal(req),
          ),
          const SizedBox(height: 8),
          _DetailRow(
            label: 'Refund to',
            value: req.paymentMethod,
            actionLabel: null,
            valueColor: _kSecondary,
            trailingIcon: Icons.chevron_right,
            onAction: () => _showPaymentMethodInfo(req),
          ),
          const SizedBox(height: 8),
          _DetailRow(
            label: 'Reason',
            value: req.reason,
            actionLabel: 'View Detail',
            onAction: () => _showReasonModal(req),
          ),
          // Collapsible rows
          if (_detailsExpanded) ...[
            const SizedBox(height: 8),
            _DetailRow(
              label: 'Requested at',
              value: _formatDateTime(req.requestedAt),
            ),
            if (req.refundApprovedAt != null) ...[
              const SizedBox(height: 8),
              _DetailRow(
                label: 'Refund Approved at',
                value: _formatDateTime(req.refundApprovedAt!),
              ),
            ],
            if (req.refundProcessedAt != null) ...[
              const SizedBox(height: 8),
              _DetailRow(
                label: 'Refund Processed at',
                value: _formatDateTime(req.refundProcessedAt!),
              ),
            ],
            const SizedBox(height: 8),
            // Request ID row with Copy button
            Row(
              children: [
                Text('Request ID', style: _pjs(size: 12, color: _kSubtext)),
                const Spacer(),
                Flexible(
                  child: Text(req.requestId,
                      style: _pjs(size: 12, weight: FontWeight.w600),
                      overflow: TextOverflow.ellipsis),
                ),
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: () => _copyRequestId(req.requestId),
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      border: Border.all(color: _kBorder),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text('Copy',
                        style: _pjs(
                            size: 12, weight: FontWeight.w600, color: _kText)),
                  ),
                ),
              ],
            ),
          ],
          const SizedBox(height: 12),
          // Expand / Collapse toggle
          GestureDetector(
            onTap: () => setState(() => _detailsExpanded = !_detailsExpanded),
            child: Center(
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    _detailsExpanded ? 'Collapse' : 'Expand',
                    style: _pjs(size: 13, color: _kSubtext),
                  ),
                  Icon(
                    _detailsExpanded
                        ? Icons.keyboard_arrow_up
                        : Icons.keyboard_arrow_down,
                    size: 18,
                    color: _kSubtext,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Support center ────────────────────────────────────────────────────────────
  Widget _buildSupportCenter(RefundRequest req) {
    return Container(
      color: _kCard,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 10),
            child: Text('SUPPORT CENTER',
                style:
                    _pjs(size: 11, weight: FontWeight.w800, color: _kSubtext)),
          ),
          const Divider(height: 1, color: _kBorder),
          _SupportTile(
            icon: Icons.headset_mic_outlined,
            iconColor: _kPrimary,
            label: 'Customer Service',
            onTap: () => _openCustomerService(req),
          ),
          const Divider(height: 1, color: _kBorder, indent: 56),
          _SupportTile(
            icon: Icons.help_outline_rounded,
            iconColor: _kSecondary,
            label: 'Help Center',
            onTap: () => _openHelpCenter(),
          ),
          const Divider(height: 1, color: _kBorder),
        ],
      ),
    );
  }

  // ── Actions ───────────────────────────────────────────────────────────────────

  void _copyRequestId(String id) {
    Clipboard.setData(ClipboardData(text: id));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Request ID copied',
            style:
                _pjs(size: 13, color: Colors.white, weight: FontWeight.w600)),
        backgroundColor: _kPrimary,
        duration: const Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  void _showBreakdownModal(RefundRequest req) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _BreakdownModal(req: req),
    );
  }

  void _showPaymentMethodInfo(RefundRequest req) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _PaymentMethodModal(paymentMethod: req.paymentMethod),
    );
  }

  void _showReasonModal(RefundRequest req) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _ReasonModal(reason: req.reason),
    );
  }

  void _openCustomerService(RefundRequest req) {
    // Navigate to chat page pre-filled with refund reference
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => _SupportChatPage(
          refundRequestId: req.requestId,
          orderId: req.orderId,
        ),
      ),
    );
  }

  void _openHelpCenter() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const _HelpCenterPage()),
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// PROGRESS STEP DATA + WIDGETS
// ═════════════════════════════════════════════════════════════════════════════
class _ProgressStep {
  const _ProgressStep({
    required this.icon,
    required this.label,
    this.date,
    this.pendingBadge,
    required this.isDone,
    this.isCurrent = false,
  });
  final IconData icon;
  final String label;
  final String? date; // actual date once done
  final String? pendingBadge; // "By 17" badge while pending
  final bool isDone;
  final bool isCurrent;
}

class _ProgressStepWidget extends StatelessWidget {
  const _ProgressStepWidget({required this.step});
  final _ProgressStep step;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Circle with icon
        Stack(
          clipBehavior: Clip.none,
          alignment: Alignment.center,
          children: [
            Container(
              width: 46,
              height: 46,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: step.isDone ? _kChip : Colors.white,
                border: Border.all(
                  color: step.isDone ? _kSecondary : _kBorder,
                  width: 1.5,
                ),
              ),
              child: Icon(
                step.icon,
                size: 20,
                color: step.isDone ? _kSecondary : _kBorder,
              ),
            ),
            if (step.isDone)
              Positioned(
                bottom: -2,
                right: -2,
                child: Container(
                  width: 18,
                  height: 18,
                  decoration: const BoxDecoration(
                    color: _kSecondary,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.check, size: 11, color: Colors.white),
                ),
              ),
          ],
        ),
        const SizedBox(height: 6),
        // Label
        Text(
          step.label,
          textAlign: TextAlign.center,
          style: _pjs(
            size: 10,
            weight: step.isDone ? FontWeight.w700 : FontWeight.w400,
            color: step.isDone ? _kText : _kSubtext,
            height: 1.3,
          ),
        ),
        const SizedBox(height: 4),
        // Date or pending badge
        if (step.date != null)
          Text(step.date!, style: _pjs(size: 10, color: _kSubtext))
        else if (step.pendingBadge != null)
          Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: _kPrimary,
                borderRadius: BorderRadius.circular(9999),
              ),
              child: Text(step.pendingBadge!,
                  style: _pjs(
                      size: 10, weight: FontWeight.w700, color: Colors.white))),
      ],
    );
  }
}

class _ProgressConnector extends StatelessWidget {
  const _ProgressConnector({required this.filled});
  final bool filled;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 2,
      color: filled ? _kSecondary : _kBorder,
      margin: const EdgeInsets.only(bottom: 36),
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// DETAIL ROW WIDGET
// ═════════════════════════════════════════════════════════════════════════════
class _DetailRow extends StatelessWidget {
  const _DetailRow({
    required this.label,
    required this.value,
    this.actionLabel,
    this.onAction,
    this.valueColor,
    this.trailingIcon,
  });
  final String label;
  final String value;
  final String? actionLabel;
  final VoidCallback? onAction;
  final Color? valueColor;
  final IconData? trailingIcon;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 110,
          child: Text(label, style: _pjs(size: 12, color: _kSubtext)),
        ),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Flexible(
                    child: Text(
                      value,
                      textAlign: TextAlign.right,
                      style: _pjs(
                        size: 12,
                        weight: FontWeight.w600,
                        color: valueColor ?? _kText,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  if (trailingIcon != null) ...[
                    const SizedBox(width: 2),
                    Icon(trailingIcon,
                        size: 14, color: valueColor ?? _kSubtext),
                  ],
                ],
              ),
              if (actionLabel != null)
                GestureDetector(
                  onTap: onAction,
                  child: Text(
                    actionLabel!,
                    style: _pjs(
                        size: 11,
                        weight: FontWeight.w600,
                        color: _kSecondary,
                        decoration: TextDecoration.underline),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// SUPPORT TILE
// ═════════════════════════════════════════════════════════════════════════════
class _SupportTile extends StatelessWidget {
  const _SupportTile({
    required this.icon,
    required this.iconColor,
    required this.label,
    required this.onTap,
  });
  final IconData icon;
  final Color iconColor;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: iconColor.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 18, color: iconColor),
            ),
            const SizedBox(width: 12),
            Expanded(
              child:
                  Text(label, style: _pjs(size: 14, weight: FontWeight.w600)),
            ),
            const Icon(Icons.chevron_right, size: 18, color: _kSubtext),
          ],
        ),
      ),
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// MODALS
// ═════════════════════════════════════════════════════════════════════════════

class _BreakdownModal extends StatelessWidget {
  const _BreakdownModal({required this.req});
  final RefundRequest req;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                  color: _kBorder, borderRadius: BorderRadius.circular(2)),
            ),
          ),
          const SizedBox(height: 16),
          Text('Refund Amount Details',
              style: _pjs(size: 16, weight: FontWeight.w800)),
          const SizedBox(height: 16),
          _BreakdownLine('Item Price', '₱${req.itemPrice.toStringAsFixed(0)}'),
          if (req.shippingRefund > 0)
            _BreakdownLine(
                'Shipping Refund', '₱${req.shippingRefund.toStringAsFixed(0)}'),
          if (req.deduction > 0)
            _BreakdownLine('Deduction', '-₱${req.deduction.toStringAsFixed(0)}',
                color: _kRed),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 10),
            child: Divider(color: _kBorder),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Total Refund',
                  style: _pjs(size: 14, weight: FontWeight.w800)),
              Text('₱${req.refundAmount.toStringAsFixed(0)}',
                  style: _pjs(
                      size: 16, weight: FontWeight.w800, color: _kSecondary)),
            ],
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: _kPrimary,
                elevation: 0,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
                minimumSize: const Size(0, 48),
              ),
              child: Text('Close',
                  style: _pjs(
                      size: 14, weight: FontWeight.w700, color: Colors.white)),
            ),
          ),
        ],
      ),
    );
  }
}

class _BreakdownLine extends StatelessWidget {
  const _BreakdownLine(this.label, this.value, {this.color});
  final String label, value;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: _pjs(size: 13, color: _kSubtext)),
          Text(value,
              style: _pjs(
                  size: 13, weight: FontWeight.w600, color: color ?? _kText)),
        ],
      ),
    );
  }
}

class _PaymentMethodModal extends StatelessWidget {
  const _PaymentMethodModal({required this.paymentMethod});
  final String paymentMethod;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Center(
            child: Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                  color: _kBorder, borderRadius: BorderRadius.circular(2)),
            ),
          ),
          const SizedBox(height: 16),
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(color: _kChip, shape: BoxShape.circle),
            child: const Icon(Icons.account_balance_wallet_outlined,
                size: 28, color: _kSecondary),
          ),
          const SizedBox(height: 12),
          Text(paymentMethod, style: _pjs(size: 16, weight: FontWeight.w800)),
          const SizedBox(height: 8),
          Text(
            'Your refund will be automatically credited to your '
            '$paymentMethod account within 24–48 hours after processing. '
            'Check your $paymentMethod transaction history for confirmation.',
            textAlign: TextAlign.center,
            style: _pjs(size: 13, color: _kSubtext, height: 1.5),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: _kPrimary,
                elevation: 0,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
                minimumSize: const Size(0, 48),
              ),
              child: Text('Got it',
                  style: _pjs(
                      size: 14, weight: FontWeight.w700, color: Colors.white)),
            ),
          ),
        ],
      ),
    );
  }
}

class _ReasonModal extends StatelessWidget {
  const _ReasonModal({required this.reason});
  final String reason;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                  color: _kBorder, borderRadius: BorderRadius.circular(2)),
            ),
          ),
          const SizedBox(height: 16),
          Text('Reason for Return/Refund',
              style: _pjs(size: 16, weight: FontWeight.w800)),
          const SizedBox(height: 12),
          Text(reason, style: _pjs(size: 14, height: 1.6)),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: _kPrimary,
                elevation: 0,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
                minimumSize: const Size(0, 48),
              ),
              child: Text('Close',
                  style: _pjs(
                      size: 14, weight: FontWeight.w700, color: Colors.white)),
            ),
          ),
        ],
      ),
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// STUB SCREENS (navigate to real ones when available)
// ═════════════════════════════════════════════════════════════════════════════

class _SupportChatPage extends StatelessWidget {
  const _SupportChatPage({
    required this.refundRequestId,
    required this.orderId,
  });
  final String refundRequestId;
  final String orderId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.text),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Customer Service',
            style: GoogleFonts.plusJakartaSans(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: AppColors.text)),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.headset_mic_outlined,
                  size: 56, color: AppColors.accent),
              const SizedBox(height: 16),
              Text('Customer Service',
                  style: GoogleFonts.plusJakartaSans(
                      fontSize: 18, fontWeight: FontWeight.w800)),
              const SizedBox(height: 8),
              Text(
                'Reference: $refundRequestId\nOrder: $orderId',
                textAlign: TextAlign.center,
                style: GoogleFonts.plusJakartaSans(
                    fontSize: 13, color: AppColors.textMuted, height: 1.5),
              ),
              const SizedBox(height: 24),
              Text('Connect to live support to resolve your refund query.',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.plusJakartaSans(
                      fontSize: 13,
                      color: AppColors.textMuted,
                      height: 1.5)),
            ],
          ),
        ),
      ),
    );
  }
}

class _HelpCenterPage extends StatelessWidget {
  const _HelpCenterPage();

  @override
  Widget build(BuildContext context) {
    final faqs = [
      'How long does a refund take?',
      'What payment methods support refunds?',
      'How do I track my refund status?',
      'Can I cancel a refund request?',
      'What if my refund amount is incorrect?',
    ];
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.text),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Help Center — Refunds',
            style: GoogleFonts.plusJakartaSans(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: AppColors.text)),
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: faqs.length,
        separatorBuilder: (_, __) =>
            const Divider(height: 1, color: AppColors.border),
        itemBuilder: (_, i) => ListTile(
          contentPadding: const EdgeInsets.symmetric(vertical: 4),
          leading: const Icon(Icons.help_outline,
              color: AppColors.accent, size: 20),
          title: Text(faqs[i],
              style: GoogleFonts.plusJakartaSans(
                  fontSize: 13, fontWeight: FontWeight.w600)),
          trailing: const Icon(Icons.chevron_right,
              size: 18, color: AppColors.textMuted),
          onTap: () {},
        ),
      ),
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═════════════════════════════════════════════════════════════════════════════

String _formatDate(DateTime dt) {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];
  return '${dt.day} ${months[dt.month - 1]} ${dt.year}';
}

String _formatDateTime(DateTime dt) {
  final dateStr = '${dt.month.toString().padLeft(2, '0')}/'
      '${dt.day.toString().padLeft(2, '0')}/'
      '${dt.year.toString().substring(2)}';
  final timeStr = '${dt.hour.toString().padLeft(2, '0')}:'
      '${dt.minute.toString().padLeft(2, '0')}';
  return '$dateStr  $timeStr';
}
