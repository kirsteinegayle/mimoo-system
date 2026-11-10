import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../theme/mimoo_brand.dart';
import 'mimoo_logo.dart';
import 'motion.dart';
import '../theme/app_theme.dart';

/// Hero tag shared by the splash logo and the auth header logo.
const kMimooLogoHeroTag = 'mimoo-logo';

TextStyle mimooText({
  double size = 14,
  FontWeight weight = FontWeight.w400,
  Color color = MimooBrand.text,
  double? height,
  FontStyle? style,
}) =>
    GoogleFonts.plusJakartaSans(
        fontSize: size, fontWeight: weight, color: color, height: height, fontStyle: style);

/// Dark rounded header: logo, "Mimoo" and the tagline.
class MimooAuthHeader extends StatelessWidget {
  const MimooAuthHeader({
    super.key,
    this.compact = false,
    this.onBack,
    this.bottomPadding = 56,
    this.rounded = true,
  });

  final bool compact;
  final VoidCallback? onBack;

  /// Extra space at the bottom so the white card can overlap the header.
  final double bottomPadding;
  final bool rounded;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: MimooBrand.headerGradient,
        borderRadius: rounded
            ? const BorderRadius.vertical(bottom: Radius.circular(28))
            : null,
      ),
      padding: EdgeInsets.fromLTRB(16, compact ? 8 : 20, 16, bottomPadding),
      child: SafeArea(
        bottom: false,
        child: Column(
          children: [
            if (onBack != null)
              Align(
                alignment: Alignment.centerLeft,
                child: IconButton(
                  tooltip: 'Back',
                  onPressed: onBack,
                  icon: const Icon(Icons.arrow_back, color: Colors.white),
                ),
              ),
            MimooLogo(size: compact ? 96 : 150, heroTag: kMimooLogoHeroTag),
            SizedBox(height: compact ? 2 : 6),
            Text(
              MimooBrand.tagline,
              textAlign: TextAlign.center,
              style: mimooText(
                size: compact ? 12 : 13.5,
                weight: FontWeight.w500,
                color: MimooBrand.accentSoft,
                style: FontStyle.italic,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Auth page layout: dark header + white rounded card that overlaps it,
/// centred with max width 480, scrollable (no overflow with the keyboard).
/// The card slides up + fades in on first show (600 ms, easeOutCubic).
class MimooAuthLayout extends StatefulWidget {
  const MimooAuthLayout({
    super.key,
    required this.card,
    this.below,
    this.compactHeader = false,
    this.onBack,
    this.bottomBar,
  });

  final Widget card;
  final Widget? below;
  final bool compactHeader;
  final VoidCallback? onBack;

  /// Optional pinned bottom area (e.g. a sticky primary button).
  final Widget? bottomBar;

  @override
  State<MimooAuthLayout> createState() => _MimooAuthLayoutState();
}

class _MimooAuthLayoutState extends State<MimooAuthLayout>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl = AnimationController(
      vsync: this, duration: const Duration(milliseconds: 600));
  bool _started = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_started) return;
    _started = true;
    if (reduceMotion(context)) {
      _ctrl.value = 1; // reduce motion: no slide-up
    } else {
      _ctrl.forward();
    }
  }
  late final Animation<double> _curve =
      CurvedAnimation(parent: _ctrl, curve: Curves.easeOutCubic);

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: MimooBrand.surface,
      bottomNavigationBar: widget.bottomBar,
      body: SingleChildScrollView(
        child: Column(
          children: [
            MimooAuthHeader(compact: widget.compactHeader, onBack: widget.onBack),
            Transform.translate(
              offset: const Offset(0, -36), // card overlaps the header
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 480),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: FadeTransition(
                      opacity: _curve,
                      child: SlideTransition(
                        position: Tween(begin: const Offset(0, 0.12), end: Offset.zero)
                            .animate(_curve),
                        child: Column(
                          children: [
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.fromLTRB(20, 24, 20, 22),
                              decoration: BoxDecoration(
                                color: MimooBrand.card,
                                borderRadius: BorderRadius.circular(24),
                                boxShadow: const [
                                  BoxShadow(
                                      color: AppColors.shadowBrand,
                                      blurRadius: 24,
                                      offset: Offset(0, 8)),
                                ],
                              ),
                              child: widget.card,
                            ),
                            if (widget.below != null) ...[
                              const SizedBox(height: 18),
                              widget.below!,
                            ],
                            const SizedBox(height: 8),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Shared input style for auth forms (filled, rounded, optional icon).
InputDecoration mimooInputDecoration({
  String? label,
  String? hint,
  IconData? icon,
  Widget? suffix,
}) {
  OutlineInputBorder b(Color c, [double w = 1]) => OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(color: c, width: w),
      );
  return InputDecoration(
    labelText: label,
    hintText: hint,
    counterText: '',
    hintStyle: mimooText(size: 14, color: MimooBrand.subtext),
    labelStyle: mimooText(size: 13, color: MimooBrand.subtext, weight: FontWeight.w600),
    floatingLabelStyle:
        mimooText(size: 13, color: MimooBrand.accent, weight: FontWeight.w700),
    prefixIcon: icon == null ? null : Icon(icon, size: 19, color: MimooBrand.subtext),
    suffixIcon: suffix,
    filled: true,
    fillColor: MimooBrand.inputFill,
    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
    enabledBorder: b(MimooBrand.border),
    disabledBorder: b(MimooBrand.border),
    focusedBorder: b(MimooBrand.accent, 1.5),
    errorBorder: b(MimooBrand.error),
    focusedErrorBorder: b(MimooBrand.error, 1.5),
  );
}

/// Small field label above an input (screenshot style).
class MimooFieldLabel extends StatelessWidget {
  const MimooFieldLabel(this.text, {super.key});
  final String text;
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(bottom: 6, top: 2),
        child: Text(text, style: mimooText(size: 13, weight: FontWeight.w600)),
      );
}

/// Inline error box (no snackbar).
class MimooInlineError extends StatelessWidget {
  const MimooInlineError(this.message, {super.key});
  final String message;
  @override
  Widget build(BuildContext context) => Container(
        width: double.infinity,
        margin: const EdgeInsets.only(top: 12),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: AppColors.errorContainer,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Icon(Icons.error_outline, size: 18, color: MimooBrand.error),
          const SizedBox(width: 8),
          Expanded(
            child: Text(message,
                style: mimooText(size: 12.5, color: MimooBrand.error, height: 1.35)),
          ),
        ]),
      );
}

/// Big primary button with trailing arrow and loading state.
class MimooPrimaryButton extends StatelessWidget {
  const MimooPrimaryButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.loading = false,
    this.showArrow = true,
  });
  final String label;
  final VoidCallback? onPressed;
  final bool loading;
  final bool showArrow;

  @override
  Widget build(BuildContext context) {
    final d = reduceMotion(context) ? Duration.zero : const Duration(milliseconds: 220);
    return PressScale(
      enabled: !loading && onPressed != null,
      scale: 0.97,
      child: SizedBox(
        width: double.infinity,
        height: 54,
        child: FilledButton(
          onPressed: loading ? null : onPressed,
          style: FilledButton.styleFrom(
            backgroundColor: MimooBrand.primary,
            disabledBackgroundColor: MimooBrand.primary.withValues(alpha: 0.55),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(9999)),
            elevation: 2,
          ),
          // Label ⇄ spinner cross-fade + scale
          child: AnimatedSwitcher(
            duration: d,
            transitionBuilder: (c, a) => FadeTransition(
              opacity: a,
              child: ScaleTransition(scale: Tween(begin: 0.85, end: 1.0).animate(a), child: c),
            ),
            child: loading
                ? const SizedBox(
                    key: ValueKey('spinner'),
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(strokeWidth: 2.2, color: Colors.white))
                : Row(
                    key: ValueKey('label-$label'),
                    mainAxisAlignment: MainAxisAlignment.center,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(label,
                          style: mimooText(size: 15, weight: FontWeight.w700, color: Colors.white)),
                      if (showArrow) ...[
                        const SizedBox(width: 8),
                        const Icon(Icons.arrow_forward, color: Colors.white, size: 18),
                      ],
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}
