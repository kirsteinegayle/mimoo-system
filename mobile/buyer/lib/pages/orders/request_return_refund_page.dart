import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'return_refund_models.dart';
import 'return_refund_success_page.dart';
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
// REQUEST RETURN / REFUND SCREEN
// ═════════════════════════════════════════════════════════════════════════════
class RequestReturnRefundPage extends StatefulWidget {
  const RequestReturnRefundPage({
    super.key,
    required this.summary,
    required this.category,
    required this.subReason,
  });

  final ReturnOrderSummary summary;
  final ReturnCategory category;
  final ReturnSubReason subReason;

  @override
  State<RequestReturnRefundPage> createState() =>
      _RequestReturnRefundPageState();
}

class _RequestReturnRefundPageState extends State<RequestReturnRefundPage> {
  final _descCtrl = TextEditingController();
  static const int _maxDesc = 2000;

  // Mock photo slots — in a real app connect to image_picker
  final List<bool> _photos = List.filled(6, false);
  bool _hasVideo = false;
  bool _loading = false;

  int get _photoCount => _photos.where((p) => p).length;
  bool get _canSubmit => _descCtrl.text.trim().isNotEmpty && _photoCount >= 1;

  @override
  void dispose() {
    _descCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_canSubmit) return;
    setState(() => _loading = true);
    await Future.delayed(const Duration(milliseconds: 700));

    // Save to in-memory store
    ReturnRefundStore.submit(ReturnRequest(
      orderId: widget.summary.orderId,
      category: widget.category,
      subReason: widget.subReason,
      description: _descCtrl.text.trim(),
      photoCount: _photoCount,
    ));

    // Notify My Purchases to update the order's status immediately
    widget.summary.onSubmitted?.call();

    if (!mounted) return;
    setState(() => _loading = false);

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (_) => ReturnRefundSuccessPage(summary: widget.summary),
      ),
    );
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
                  // Product card
                  _buildProductCard(),
                  const SizedBox(height: 12),
                  // Reason + solution
                  _buildReasonCard(),
                  const SizedBox(height: 12),
                  // Description + media
                  _buildDescriptionCard(),
                  const SizedBox(height: 12),
                  // Refund method
                  _buildRefundToCard(),
                  const SizedBox(height: 12),
                  // Total refund
                  _buildTotalRefundCard(),
                  const SizedBox(height: 12),
                  // Contact
                  _buildContactCard(),
                ],
              ),
            ),
          ),
          _buildSubmitBar(),
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
      title: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text('Request', style: _pjs(size: 16, weight: FontWeight.w800)),
          Text('Return/Refund', style: _pjs(size: 16, weight: FontWeight.w800)),
        ],
      ),
    );
  }

  // ── Product summary card ──────────────────────────────────────────────────────
  Widget _buildProductCard() {
    final s = widget.summary;
    return Container(
      decoration: BoxDecoration(
        color: _kCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _kBorder),
      ),
      padding: const EdgeInsets.all(12),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Image.network(
              s.imageUrl,
              width: 56,
              height: 60,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) =>
                  Container(width: 56, height: 60, color: _kChip),
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
                    style:
                        _pjs(size: 13, weight: FontWeight.w700, height: 1.35)),
                const SizedBox(height: 3),
                Text(s.productSub, style: _pjs(size: 11, color: _kSubtext)),
                const SizedBox(height: 2),
                Text('${s.qty} Pc', style: _pjs(size: 11, color: _kSubtext)),
              ],
            ),
          ),
          Text('x${s.qty}', style: _pjs(size: 12, color: _kSubtext)),
        ],
      ),
    );
  }

  // ── Reason + solution card ────────────────────────────────────────────────────
  Widget _buildReasonCard() {
    return Container(
      decoration: BoxDecoration(
        color: _kCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _kBorder),
      ),
      padding: const EdgeInsets.all(14),
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Reason', style: _pjs(size: 13, color: _kSubtext)),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  widget.subReason.label,
                  textAlign: TextAlign.right,
                  style: _pjs(size: 13, weight: FontWeight.w600),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          // Solution pill — right-aligned, secondary purple
          Align(
            alignment: Alignment.centerRight,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
              decoration: BoxDecoration(
                color: _kChip,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'Solution: ${widget.subReason.solution}',
                style:
                    _pjs(size: 13, weight: FontWeight.w700, color: _kSecondary),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Description + photo/video upload card ─────────────────────────────────────
  Widget _buildDescriptionCard() {
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
          // Description header row
          Row(
            children: [
              Text('Description',
                  style: _pjs(size: 13, weight: FontWeight.w700)),
              const Spacer(),
              ValueListenableBuilder<TextEditingValue>(
                valueListenable: _descCtrl,
                builder: (_, val, __) => Text(
                  '${val.text.length}/$_maxDesc',
                  style: _pjs(size: 11, color: _kSubtext),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          // Required asterisk note
          Text(
            '* Required',
            style: _pjs(size: 11, color: _kFlash),
          ),
          const SizedBox(height: 8),
          // Description text field
          TextField(
            controller: _descCtrl,
            maxLength: _maxDesc,
            maxLines: 4,
            onChanged: (_) => setState(() {}),
            style: _pjs(size: 13, height: 1.5),
            decoration: InputDecoration(
              hintText: 'Describe the problem you faced',
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
          const SizedBox(height: 14),
          // Photo + Video upload area
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Photo slot
              Expanded(
                child: GestureDetector(
                  onTap: _addPhoto,
                  child: _MediaBox(
                    icon: Icons.photo_camera_outlined,
                    label: 'Add Photo',
                    count: _photoCount,
                    max: 6,
                    maxMb: '20MB',
                  ),
                ),
              ),
              const SizedBox(width: 12),
              // Video slot
              Expanded(
                child: GestureDetector(
                  onTap: _addVideo,
                  child: _MediaBox(
                    icon: Icons.videocam_outlined,
                    label: 'Add Video',
                    count: _hasVideo ? 1 : 0,
                    max: 1,
                    maxMb: '200MB',
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Evidence note
          Text.rich(
            TextSpan(
              text: '* Clear photo showing the parcel and the wrong '
                  'product(s) received is mandatory for this request: ',
              style: _pjs(size: 11, color: _kFlash, height: 1.5),
              children: [
                TextSpan(
                  text: 'View Examples',
                  style: _pjs(
                      size: 11,
                      weight: FontWeight.w700,
                      color: _kSecondary,
                      height: 1.5),
                ),
              ],
            ),
          ),
          const SizedBox(height: 6),
          Text(
            '1. All products received after packaging is removed and '
            'indicate which item/s is/are wrong',
            style: _pjs(size: 11, color: _kSubtext, height: 1.5),
          ),
        ],
      ),
    );
  }

  void _addPhoto() {
    // Simulate selecting a photo (next empty slot)
    final idx = _photos.indexWhere((p) => !p);
    if (idx == -1) return;
    setState(() => _photos[idx] = true);
  }

  void _addVideo() {
    setState(() => _hasVideo = !_hasVideo);
  }

  // ── Refund to card ────────────────────────────────────────────────────────────
  Widget _buildRefundToCard() {
    return _SectionCard(
      child: Row(
        children: [
          Text('Refund To', style: _pjs(size: 13, weight: FontWeight.w600)),
          const Spacer(),
          GestureDetector(
            onTap: () {},
            child: Row(
              children: [
                Text('Add Refund Method',
                    style: _pjs(
                        size: 13, weight: FontWeight.w600, color: _kSecondary)),
                const Icon(Icons.chevron_right, size: 16, color: _kSecondary),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── Total refund card ─────────────────────────────────────────────────────────
  Widget _buildTotalRefundCard() {
    final price = widget.summary.price;
    return _SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Total Refund',
                  style: _pjs(size: 13, weight: FontWeight.w700)),
              // Price with peso sign and cents superscript layout
              _PriceWidget(price: price),
            ],
          ),
          const SizedBox(height: 2),
          Text('Refundable Item Price',
              style: _pjs(size: 11, color: _kSubtext)),
        ],
      ),
    );
  }

  // ── Contact card ──────────────────────────────────────────────────────────────
  Widget _buildContactCard() {
    return _SectionCard(
      child: Row(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Contact', style: _pjs(size: 13, weight: FontWeight.w600)),
              Text('Email', style: _pjs(size: 12, color: _kSubtext)),
            ],
          ),
          const Spacer(),
          GestureDetector(
            onTap: () {},
            child: Row(
              children: [
                Text(
                    widget.summary.contactEmail.isEmpty
                        ? 'Not set'
                        : widget.summary.contactEmail,
                    style: _pjs(size: 12, color: _kSubtext)),
                const Icon(Icons.chevron_right, size: 16, color: _kSubtext),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── Submit bar ────────────────────────────────────────────────────────────────
  Widget _buildSubmitBar() {
    return Container(
      color: _kCard,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
      child: SafeArea(
        top: false,
        child: SizedBox(
          width: double.infinity,
          height: 52,
          child: ElevatedButton(
            onPressed: (_canSubmit && !_loading) ? _submit : null,
            style: ElevatedButton.styleFrom(
              backgroundColor:
                  _canSubmit ? _kPrimary : _kPrimary.withValues(alpha: 0.3),
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
                : Text('Submit',
                    style: _pjs(
                        size: 15,
                        weight: FontWeight.w700,
                        color: Colors.white)),
          ),
        ),
      ),
    );
  }
}

// ── Media upload box ──────────────────────────────────────────────────────────
class _MediaBox extends StatelessWidget {
  const _MediaBox({
    required this.icon,
    required this.label,
    required this.count,
    required this.max,
    required this.maxMb,
  });
  final IconData icon;
  final String label;
  final int count;
  final int max;
  final String maxMb;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          height: 110,
          decoration: BoxDecoration(
            color: const Color(0xFFF8F7FC),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
                color: AppColors.outlineVariant,
                width: 1,
                style: BorderStyle.solid),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 32, color: const Color(0xFFBBB5CC)),
              const SizedBox(height: 6),
              Text(label,
                  style: GoogleFonts.plusJakartaSans(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: AppColors.textMuted)),
              Text('$count/$max',
                  style: GoogleFonts.plusJakartaSans(
                      fontSize: 11, color: AppColors.textMuted)),
            ],
          ),
        ),
        const SizedBox(height: 4),
        Text('Max: $maxMb',
            style: GoogleFonts.plusJakartaSans(
                fontSize: 10, color: AppColors.textMuted)),
      ],
    );
  }
}

// ── Section card wrapper ──────────────────────────────────────────────────────
class _SectionCard extends StatelessWidget {
  const _SectionCard({required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      padding: const EdgeInsets.all(14),
      child: child,
    );
  }
}

// ── Price widget with peso sign and superscript cents ────────────────────────
class _PriceWidget extends StatelessWidget {
  const _PriceWidget({required this.price});
  final double price;

  @override
  Widget build(BuildContext context) {
    final parts = price.toStringAsFixed(2).split('.');
    final whole = parts[0];
    final cents = parts.length > 1 ? parts[1] : '00';

    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text('₱',
            style: GoogleFonts.plusJakartaSans(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: AppColors.text)),
        Text(whole,
            style: GoogleFonts.plusJakartaSans(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: AppColors.text)),
        Padding(
          padding: const EdgeInsets.only(bottom: 3),
          child: Text(cents,
              style: GoogleFonts.plusJakartaSans(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: AppColors.text)),
        ),
      ],
    );
  }
}
