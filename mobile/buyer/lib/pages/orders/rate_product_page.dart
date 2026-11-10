import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../theme/app_theme.dart';

// ── Design tokens (match orders_page.dart exactly) ───────────────────────────
const _kPrimary = AppColors.primary;
const _kSecondary = AppColors.accent;
const _kAccent = AppColors.violet;
const _kFlash = AppColors.flash;
const _kSurface = AppColors.surface;
const _kCard = AppColors.card;
const _kChip = AppColors.chip;
const _kBorder = AppColors.border;
const _kText = AppColors.text;
const _kSubtext = AppColors.textMuted;
const _kGreen = AppColors.success;
const _kOrange = AppColors.orange;
const _kGold = AppColors.warning;

TextStyle _pjs({
  double size = 14,
  FontWeight weight = FontWeight.w400,
  Color color = _kText,
  double? height,
  TextDecoration? decoration,
  double? letterSpacing,
}) =>
    GoogleFonts.plusJakartaSans(
      fontSize: size,
      fontWeight: weight,
      color: color,
      height: height,
      decoration: decoration,
      letterSpacing: letterSpacing,
    );

// ── Review data model (shared with orders_page via import) ───────────────────
class ReviewData {
  ReviewData({
    required this.productRating,
    required this.reviewText,
    required this.sellerRating,
    required this.deliveryRating,
    required this.fitSelection,
    required this.anonymous,
    this.photoCount = 0,
    this.reviewDate,
    this.editedDate,
    this.sellerReply,
  });

  final int productRating; // 1–5
  final String reviewText;
  final int sellerRating; // 1–5
  final int deliveryRating; // 1–5
  final String fitSelection; // 'Small' | 'True to size' | 'Large'
  final bool anonymous;
  final int photoCount; // number of "uploaded" photo placeholders
  final String? reviewDate; // e.g. 'Oct 29, 2024, 11:20 AM'
  final String? editedDate; // non-null when review has been edited
  final String? sellerReply; // mock seller response text
}

// ── In-memory review store: orderId → ReviewData ─────────────────────────────
// TODO(backend): replace with an API call to POST /reviews and GET /reviews/:orderId
final Map<String, ReviewData> reviewStore = {};

// ── Product summary model passed from the orders page ───────────────────────
class RateProductArgs {
  const RateProductArgs({
    required this.orderId,
    required this.productId,
    required this.productName,
    required this.productSub,
    required this.imageUrl,
    required this.storeName,
    required this.price,
    this.readOnly = false,
  });

  final String orderId;
  final String productId;
  final String productName;
  final String productSub;
  final String imageUrl;
  final String storeName;
  final double price;

  /// When true, renders as "View My Review" (read-only)
  final bool readOnly;
}

// ═════════════════════════════════════════════════════════════════════════════
// RATE PRODUCT PAGE
// ═════════════════════════════════════════════════════════════════════════════
class RateProductPage extends StatefulWidget {
  const RateProductPage({super.key, required this.args});
  final RateProductArgs args;

  @override
  State<RateProductPage> createState() => _RateProductPageState();
}

class _RateProductPageState extends State<RateProductPage> {
  // ── Form state ─────────────────────────────────────────────────────────────
  int _productRating = 0;
  int _sellerRating = 4;
  int _deliveryRating = 4;
  String _fitSelection = 'True to size';
  bool _anonymous = false;
  bool _submitted = false;
  bool _isInvalid = false;

  final _reviewCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();

  // Mock photo slots (up to 5)
  final List<_PhotoSlot> _photos = [];
  static const int _maxPhotos = 5;

  // Character counter
  static const int _maxChars = 500;
  int get _charCount => _reviewCtrl.text.length;

  static const _fitOptions = ['Small', 'True to size', 'Large'];

  static const _ratingLabels = {
    0: '',
    1: 'Poor',
    2: 'Fair',
    3: 'Okay',
    4: 'Good',
    5: 'Excellent & Loved it!',
  };

  @override
  void initState() {
    super.initState();
    _reviewCtrl.addListener(() => setState(() {}));

    // Validate orderId
    if (widget.args.orderId.isEmpty || widget.args.productId.isEmpty) {
      _isInvalid = true;
      return;
    }

    // If readOnly, pre-fill from store
    if (widget.args.readOnly) {
      final stored = reviewStore[widget.args.orderId];
      if (stored != null) {
        _productRating = stored.productRating;
        _sellerRating = stored.sellerRating;
        _deliveryRating = stored.deliveryRating;
        _fitSelection = stored.fitSelection;
        _anonymous = stored.anonymous;
        _reviewCtrl.text = stored.reviewText;
        for (int i = 0; i < stored.photoCount; i++) {
          _photos.add(_PhotoSlot(seed: 'review_photo_$i'));
        }
        _submitted = true; // treat readOnly as already submitted
      }
    }
  }

  @override
  void dispose() {
    _reviewCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  bool get _canSubmit =>
      _productRating > 0 && !widget.args.readOnly && !_submitted;

  String _fmtDateTime(DateTime dt) {
    const months = [
      '',
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
    final h = dt.hour > 12
        ? dt.hour - 12
        : dt.hour == 0
            ? 12
            : dt.hour;
    final m = dt.minute.toString().padLeft(2, '0');
    final ap = dt.hour >= 12 ? 'PM' : 'AM';
    return '${months[dt.month]} ${dt.day}, ${dt.year}, $h:$m $ap';
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  void _submit() {
    if (!_canSubmit) return;

    // Inline validation
    if (_reviewCtrl.text.trim().length < 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Please write at least 10 characters.',
              style:
                  _pjs(size: 13, color: Colors.white, weight: FontWeight.w600)),
          backgroundColor: _kFlash,
          duration: const Duration(seconds: 2),
        ),
      );
      return;
    }

    // TODO(backend): POST /api/reviews with {orderId, productId, rating, text, ...}
    final now = DateTime.now();
    final review = ReviewData(
      productRating: _productRating,
      reviewText: _reviewCtrl.text.trim(),
      sellerRating: _sellerRating,
      deliveryRating: _deliveryRating,
      fitSelection: _fitSelection,
      anonymous: _anonymous,
      photoCount: _photos.length,
      reviewDate: _fmtDateTime(now),
      sellerReply:
          '"Thank you for your wonderful feedback! We\'re thrilled to hear the product met your expectations. Have a great day!"',
    );
    reviewStore[widget.args.orderId] = review;

    setState(() => _submitted = true);

    // Scroll to top to show success banner
    if (_scrollCtrl.hasClients) {
      _scrollCtrl.animateTo(0,
          duration: const Duration(milliseconds: 400), curve: Curves.easeOut);
    }

    // Redirect to My Purchases (Completed tab) after 2 seconds
    Future.delayed(const Duration(seconds: 2), () {
      if (!mounted) return;
      // Pop back to My Purchases; the caller will see the updated reviewStore
      Navigator.pop(context, true); // true = submitted
    });
  }

  // ── Add mock photo ─────────────────────────────────────────────────────────
  void _addPhoto() {
    if (_photos.length >= _maxPhotos) return;
    setState(() {
      _photos.add(_PhotoSlot(
          seed:
              'review_${_photos.length}_${DateTime.now().millisecondsSinceEpoch}'));
    });
  }

  void _removePhoto(int index) {
    setState(() => _photos.removeAt(index));
  }

  // ── Build ──────────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    if (_isInvalid) return _buildErrorState();
    return Scaffold(
      backgroundColor: _kSurface,
      appBar: _buildAppBar(),
      body: _submitted && !widget.args.readOnly
          ? _buildSuccessState()
          : _buildForm(),
      bottomNavigationBar:
          (!_submitted || widget.args.readOnly) ? _buildBottomBar() : null,
    );
  }

  // ── AppBar ─────────────────────────────────────────────────────────────────
  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: _kCard,
      elevation: 0,
      centerTitle: true,
      leading: IconButton(
        icon: Icon(Icons.arrow_back, color: _kText),
        onPressed: () => Navigator.pop(context),
        tooltip: 'Back to My Purchases',
      ),
      title: Text(
        widget.args.readOnly ? 'My Review' : 'Rate Product',
        style: _pjs(size: 17, weight: FontWeight.w800),
      ),
      actions: [
        Padding(
          padding: const EdgeInsets.only(right: 12),
          child: CircleAvatar(
            radius: 17,
            backgroundColor: _kChip,
            child: Icon(Icons.person, size: 18, color: _kPrimary),
          ),
        ),
      ],
    );
  }

  // ── Form body ──────────────────────────────────────────────────────────────
  Widget _buildForm() {
    final ro = widget.args.readOnly;
    return ListView(
      controller: _scrollCtrl,
      padding: const EdgeInsets.only(bottom: 100),
      children: [
        // ── Coins incentive banner ────────────────────────────────────────
        if (!ro)
          Container(
            color: _kCard,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(
              children: [
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: AppColors.warningBg,
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.warningBorder),
                  ),
                  child: const Center(
                    child: Text('🪙', style: TextStyle(fontSize: 14)),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: RichText(
                    text: TextSpan(
                      style: _pjs(size: 13),
                      children: [
                        TextSpan(
                          text: 'Enjoy up to ',
                          style: _pjs(size: 13, color: _kSubtext),
                        ),
                        TextSpan(
                          text: '1.3 mimoo Coins',
                          style: _pjs(
                              size: 13,
                              weight: FontWeight.w700,
                              color: _kOrange),
                        ),
                        TextSpan(
                          text: ' for your review',
                          style: _pjs(size: 13, color: _kSubtext),
                        ),
                      ],
                    ),
                  ),
                ),
                Icon(Icons.chevron_right, size: 18, color: _kSubtext),
              ],
            ),
          ),

        // ── Product summary card ──────────────────────────────────────────
        Container(
          margin: const EdgeInsets.fromLTRB(12, 10, 12, 0),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: _kCard,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: _kBorder),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.network(
                  widget.args.imageUrl,
                  width: 56,
                  height: 56,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    width: 56,
                    height: 56,
                    color: _kChip,
                    child:
                        Icon(Icons.image_outlined, color: _kSubtext, size: 24),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(widget.args.productName,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: _pjs(size: 13, weight: FontWeight.w700)),
                    const SizedBox(height: 3),
                    Text(widget.args.productSub,
                        style: _pjs(size: 11, color: _kSubtext)),
                    const SizedBox(height: 3),
                    Text('Order #${widget.args.orderId}',
                        style: _pjs(
                            size: 11,
                            color: _kSecondary,
                            weight: FontWeight.w600)),
                  ],
                ),
              ),
            ],
          ),
        ),

        // ── Star rating ───────────────────────────────────────────────────
        Container(
          margin: const EdgeInsets.fromLTRB(12, 10, 12, 0),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: _kCard,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: _kBorder),
          ),
          child: Column(
            children: [
              Text('RATE PRODUCT',
                  style: _pjs(
                      size: 11,
                      weight: FontWeight.w800,
                      color: _kSubtext,
                      letterSpacing: 0.8)),
              const SizedBox(height: 12),
              // Stars
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (i) {
                  final filled = i < _productRating;
                  return GestureDetector(
                    onTap: ro
                        ? null
                        : () => setState(() => _productRating = i + 1),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 5),
                      child: Icon(
                        filled
                            ? Icons.star_rounded
                            : Icons.star_outline_rounded,
                        size: 44,
                        color: filled ? _kGold : _kBorder,
                      ),
                    ),
                  );
                }),
              ),
              const SizedBox(height: 8),
              // Label
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 200),
                child: Text(
                  _ratingLabels[_productRating] ?? '',
                  key: ValueKey(_productRating),
                  style: _pjs(
                      size: 14,
                      weight: FontWeight.w700,
                      color: _productRating > 0 ? _kSecondary : _kSubtext),
                ),
              ),
              if (_productRating == 0 && !ro) ...[
                const SizedBox(height: 4),
                Text('Tap a star to rate (required)',
                    style: _pjs(size: 11, color: _kFlash)),
              ],
            ],
          ),
        ),

        // ── Photo upload ──────────────────────────────────────────────────
        Container(
          margin: const EdgeInsets.fromLTRB(12, 10, 12, 0),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: _kCard,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: _kBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text('Add photos and video',
                      style: _pjs(size: 14, weight: FontWeight.w800)),
                  const Spacer(),
                  Row(
                    children: [
                      const Text('🪙', style: TextStyle(fontSize: 12)),
                      const SizedBox(width: 4),
                      Text('+0.3 Coins',
                          style: _pjs(
                              size: 12,
                              weight: FontWeight.w700,
                              color: _kOrange)),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 12),
              // Photo preview row
              SizedBox(
                height: 88,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: [
                    // Uploaded photo thumbnails
                    ..._photos.asMap().entries.map((e) {
                      final idx = e.key;
                      final slot = e.value;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: Stack(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(10),
                              child: Image.network(
                                'https://picsum.photos/seed/${slot.seed}/88/88',
                                width: 88,
                                height: 88,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => Container(
                                  width: 88,
                                  height: 88,
                                  color: _kChip,
                                  child: Icon(Icons.image_outlined,
                                      color: _kSubtext),
                                ),
                              ),
                            ),
                            if (!ro)
                              Positioned(
                                top: 4,
                                right: 4,
                                child: GestureDetector(
                                  onTap: () => _removePhoto(idx),
                                  child: Container(
                                    width: 20,
                                    height: 20,
                                    decoration: BoxDecoration(
                                      color:
                                          Colors.black.withValues(alpha: 0.6),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(Icons.close,
                                        size: 13, color: Colors.white),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      );
                    }),

                    // Photo add tile (only if not readOnly and under limit)
                    if (!ro && _photos.length < _maxPhotos)
                      GestureDetector(
                        onTap: _addPhoto,
                        child: _UploadTile(
                          icon: Icons.photo_camera_outlined,
                          label: 'Photo',
                          sub: 'Upload photos',
                        ),
                      ),

                    // Video tile (always last, decoration only)
                    if (!ro) ...[
                      const SizedBox(width: 8),
                      _UploadTile(
                        icon: Icons.videocam_outlined,
                        label: 'Video',
                        sub: 'Upload clips',
                      ),
                    ],
                  ],
                ),
              ),
              if (_photos.isNotEmpty || ro) ...[
                const SizedBox(height: 8),
                Text(
                  ro
                      ? '${_photos.length} photo${_photos.length == 1 ? '' : 's'} attached'
                      : '${_photos.length}/$_maxPhotos photos added',
                  style: _pjs(size: 11, color: _kSubtext),
                ),
              ],
            ],
          ),
        ),

        // ── Review text ───────────────────────────────────────────────────
        Container(
          margin: const EdgeInsets.fromLTRB(12, 10, 12, 0),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: _kCard,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: _kBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text('Write a review',
                      style: _pjs(size: 14, weight: FontWeight.w800)),
                  const Spacer(),
                  Text('Min. 10 characters',
                      style: _pjs(size: 11, color: _kSubtext)),
                ],
              ),
              const SizedBox(height: 10),
              // Text field
              TextField(
                controller: _reviewCtrl,
                enabled: !ro,
                minLines: 5,
                maxLines: 8,
                maxLength: _maxChars,
                inputFormatters: [
                  LengthLimitingTextInputFormatter(_maxChars),
                ],
                style: _pjs(size: 13, height: 1.55),
                decoration: InputDecoration(
                  hintText:
                      'Material Quality:\nColour:\nAppearance:\nShare more thoughts on the product to help other buyers...',
                  hintStyle: _pjs(size: 12, color: _kSubtext, height: 1.6),
                  contentPadding: const EdgeInsets.all(12),
                  counterText: '', // we draw our own counter
                  filled: true,
                  fillColor: _kSurface,
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(color: _kBorder)),
                  enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(color: _kBorder)),
                  focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(color: _kSecondary)),
                  disabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(color: _kBorder)),
                ),
              ),
              const SizedBox(height: 6),
              Row(
                children: [
                  if (!ro)
                    GestureDetector(
                      onTap: () {},
                      child: Row(
                        children: [
                          Icon(Icons.auto_awesome, size: 13, color: _kAccent),
                          const SizedBox(width: 4),
                          Text('Helpful feedback tips',
                              style: _pjs(
                                  size: 12,
                                  weight: FontWeight.w600,
                                  color: _kAccent)),
                        ],
                      ),
                    ),
                  const Spacer(),
                  Text(
                    '$_charCount/$_maxChars',
                    style: _pjs(
                        size: 11,
                        color:
                            _charCount > _maxChars * 0.9 ? _kFlash : _kSubtext),
                  ),
                ],
              ),
            ],
          ),
        ),

        // ── Fit / Size ────────────────────────────────────────────────────
        Container(
          margin: const EdgeInsets.fromLTRB(12, 10, 12, 0),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: _kCard,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: _kBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text('Tell us how it fits',
                      style: _pjs(size: 14, weight: FontWeight.w800)),
                  const Spacer(),
                  Row(
                    children: [
                      const Text('🪙', style: TextStyle(fontSize: 12)),
                      const SizedBox(width: 4),
                      Text('+1.0 Coin',
                          style: _pjs(
                              size: 12,
                              weight: FontWeight.w700,
                              color: _kOrange)),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: _fitOptions.map((opt) {
                  final sel = _fitSelection == opt;
                  return Expanded(
                    child: GestureDetector(
                      onTap:
                          ro ? null : () => setState(() => _fitSelection = opt),
                      child: Container(
                        margin: const EdgeInsets.only(right: 8),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: sel ? _kPrimary : _kSurface,
                          borderRadius: BorderRadius.circular(9999),
                          border: Border.all(color: sel ? _kPrimary : _kBorder),
                        ),
                        alignment: Alignment.center,
                        child: Text(opt,
                            style: _pjs(
                                size: 12,
                                weight: FontWeight.w700,
                                color: sel ? Colors.white : _kText)),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
        ),

        // ── Anonymous toggle ──────────────────────────────────────────────
        Container(
          margin: const EdgeInsets.fromLTRB(12, 10, 12, 0),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: _kCard,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: _kBorder),
          ),
          child: Row(
            children: [
              Transform.scale(
                scale: 0.9,
                child: Switch(
                  value: _anonymous,
                  onChanged: ro ? null : (v) => setState(() => _anonymous = v),
                  activeColor: _kPrimary,
                  activeTrackColor: _kChip,
                  inactiveThumbColor: _kSubtext,
                  inactiveTrackColor: _kBorder,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Review Anonymously',
                        style: _pjs(size: 13, weight: FontWeight.w700)),
                    Text('Your username will be masked as m***o',
                        style: _pjs(size: 11, color: _kSubtext)),
                  ],
                ),
              ),
            ],
          ),
        ),

        // ── Service & Delivery ────────────────────────────────────────────
        Container(
          margin: const EdgeInsets.fromLTRB(12, 10, 12, 0),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: _kCard,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: _kBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(Icons.storefront_outlined, size: 16, color: _kSecondary),
                  const SizedBox(width: 6),
                  Text('Service & Delivery',
                      style: _pjs(
                          size: 14,
                          weight: FontWeight.w800,
                          color: _kSecondary)),
                ],
              ),
              const Divider(color: _kBorder, height: 20),
              _ServiceRatingRow(
                label: 'Seller Service',
                rating: _sellerRating,
                readOnly: ro,
                onChanged: (v) => setState(() => _sellerRating = v),
              ),
              const SizedBox(height: 12),
              _ServiceRatingRow(
                label: 'Delivery Speed',
                rating: _deliveryRating,
                readOnly: ro,
                onChanged: (v) => setState(() => _deliveryRating = v),
              ),
            ],
          ),
        ),

        const SizedBox(height: 20),
      ],
    );
  }

  // ── Bottom bar ─────────────────────────────────────────────────────────────
  Widget _buildBottomBar() {
    final ro = widget.args.readOnly;
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 24),
      decoration: const BoxDecoration(
        color: _kCard,
        boxShadow: [
          BoxShadow(
              color: AppColors.primaryA10, blurRadius: 12, offset: Offset(0, -4))
        ],
      ),
      child: SafeArea(
        child: ro
            // Read-only mode: just a Close button
            ? OutlinedButton(
                onPressed: () => Navigator.pop(context),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: _kBorder),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                  minimumSize: const Size(double.infinity, 52),
                ),
                child: Text('Close',
                    style:
                        _pjs(size: 15, weight: FontWeight.w700, color: _kText)),
              )
            // Submit button — disabled until a star is tapped
            : ElevatedButton.icon(
                onPressed: _canSubmit ? _submit : null,
                icon: Icon(Icons.arrow_forward,
                    size: 18, color: _canSubmit ? Colors.white : _kSubtext),
                label: Text('Submit Review',
                    style: _pjs(
                        size: 15,
                        weight: FontWeight.w800,
                        color: _canSubmit ? Colors.white : _kSubtext)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _canSubmit ? _kPrimary : _kBorder,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                  minimumSize: const Size(double.infinity, 52),
                ),
              ),
      ),
    );
  }

  // ── Success state ─────────────────────────────────────────────────────────
  Widget _buildSuccessState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: _kGreen.withValues(alpha: 0.12),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check_circle_outline,
                  size: 42, color: _kGreen),
            ),
            const SizedBox(height: 20),
            Text('Review Submitted!',
                style: _pjs(size: 20, weight: FontWeight.w800)),
            const SizedBox(height: 8),
            Text(
              'Thank you for sharing your experience.\nYour review helps other buyers.',
              textAlign: TextAlign.center,
              style: _pjs(size: 13, color: _kSubtext, height: 1.55),
            ),
            const SizedBox(height: 6),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('🪙', style: TextStyle(fontSize: 14)),
                const SizedBox(width: 6),
                Text('+1.3 mimoo Coins earned!',
                    style: _pjs(
                        size: 13, weight: FontWeight.w700, color: _kOrange)),
              ],
            ),
            const SizedBox(height: 24),
            Text('Returning to My Purchases…',
                style: _pjs(size: 12, color: _kSubtext)),
          ],
        ),
      ),
    );
  }

  // ── Error / invalid state ─────────────────────────────────────────────────
  Widget _buildErrorState() {
    return Scaffold(
      backgroundColor: _kSurface,
      appBar: AppBar(
        backgroundColor: _kCard,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: _kText),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Rate Product',
            style: _pjs(size: 17, weight: FontWeight.w800)),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: _kFlash.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child:
                    const Icon(Icons.error_outline, size: 36, color: _kFlash),
              ),
              const SizedBox(height: 20),
              Text('Order Not Found',
                  style: _pjs(size: 18, weight: FontWeight.w800)),
              const SizedBox(height: 8),
              Text(
                'The order or product ID is invalid.\nPlease return to My Purchases.',
                textAlign: TextAlign.center,
                style: _pjs(size: 13, color: _kSubtext, height: 1.5),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: () => Navigator.pop(context),
                icon:
                    const Icon(Icons.arrow_back, size: 16, color: Colors.white),
                label: Text('Back to My Purchases',
                    style: _pjs(
                        size: 14,
                        weight: FontWeight.w700,
                        color: Colors.white)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _kPrimary,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                  minimumSize: const Size(0, 50),
                  padding: const EdgeInsets.symmetric(horizontal: 28),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Upload tile ───────────────────────────────────────────────────────────────
class _UploadTile extends StatelessWidget {
  const _UploadTile({
    required this.icon,
    required this.label,
    required this.sub,
  });
  final IconData icon;
  final String label, sub;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 96,
      height: 88,
      decoration: BoxDecoration(
        color: _kSurface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: _kBorder),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 26, color: _kAccent),
          const SizedBox(height: 5),
          Text(label,
              style: _pjs(size: 12, weight: FontWeight.w700, color: _kText)),
          Text(sub,
              style: _pjs(size: 9, color: _kSubtext),
              textAlign: TextAlign.center),
        ],
      ),
    );
  }
}

// ── Service rating row ────────────────────────────────────────────────────────
class _ServiceRatingRow extends StatelessWidget {
  const _ServiceRatingRow({
    required this.label,
    required this.rating,
    required this.readOnly,
    required this.onChanged,
  });
  final String label;
  final int rating;
  final bool readOnly;
  final void Function(int) onChanged;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(label, style: _pjs(size: 13, weight: FontWeight.w600)),
        ),
        Row(
          children: List.generate(5, (i) {
            final filled = i < rating;
            return GestureDetector(
              onTap: readOnly ? null : () => onChanged(i + 1),
              child: Padding(
                padding: const EdgeInsets.only(left: 4),
                child: Icon(
                  filled ? Icons.star_rounded : Icons.star_outline_rounded,
                  size: 28,
                  color: filled ? _kGold : _kBorder,
                ),
              ),
            );
          }),
        ),
      ],
    );
  }
}

// ── Photo slot model ──────────────────────────────────────────────────────────
class _PhotoSlot {
  _PhotoSlot({required this.seed});
  final String seed;
}
