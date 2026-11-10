import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'return_refund_models.dart';
import 'request_return_refund_page.dart';
import '../../theme/app_theme.dart';

// ── Design tokens ─────────────────────────────────────────────────────────────
const _kPrimary = AppColors.primary;
const _kSecondary = AppColors.accent;
const _kCard = AppColors.card;
const _kChip = AppColors.chip;
const _kBorder = AppColors.border;
const _kText = AppColors.text;

TextStyle _pjs({
  double size = 14,
  FontWeight weight = FontWeight.w400,
  Color color = _kText,
  double? height,
}) =>
    GoogleFonts.plusJakartaSans(
        fontSize: size, fontWeight: weight, color: color, height: height);

// ═════════════════════════════════════════════════════════════════════════════
// SELECT REASON MODAL  (bottom sheet)
// ═════════════════════════════════════════════════════════════════════════════
class SelectReasonModal extends StatefulWidget {
  const SelectReasonModal({
    super.key,
    required this.summary,
    required this.category,
  });

  final ReturnOrderSummary summary;
  final ReturnCategory category;

  @override
  State<SelectReasonModal> createState() => _SelectReasonModalState();
}

class _SelectReasonModalState extends State<SelectReasonModal> {
  ReturnSubReason? _selected;

  List<ReturnSubReason> get _subReasons => kSubReasons[widget.category] ?? [];

  void _proceed() {
    if (_selected == null) return;
    // Pop modal, then push next screen on the parent navigator
    Navigator.of(context).pop();
    // The showModalBottomSheet caller's context is still valid after pop,
    // but we need to push on the navigator that owns WhatHappenedPage.
    // We use a slight delay so the pop animation completes first.
    Future.microtask(() {
      if (!mounted) return;
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => RequestReturnRefundPage(
            summary: widget.summary,
            category: widget.category,
            subReason: _selected!,
          ),
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.65,
      minChildSize: 0.4,
      maxChildSize: 0.92,
      expand: false,
      builder: (_, scrollCtrl) => Container(
        decoration: const BoxDecoration(
          color: _kCard,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          children: [
            // Drag handle
            const SizedBox(height: 10),
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: _kBorder,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 14),
            // Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Select Reason',
                            style: _pjs(size: 17, weight: FontWeight.w800)),
                        const SizedBox(height: 2),
                        Text(widget.category.label,
                            style: _pjs(
                                size: 12,
                                color: _kSecondary,
                                weight: FontWeight.w600)),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: _kText),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),
            const Divider(height: 1, color: _kBorder),
            // Sub-reason list
            Expanded(
              child: ListView.separated(
                controller: scrollCtrl,
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                itemCount: _subReasons.length,
                separatorBuilder: (_, __) =>
                    const Divider(height: 1, color: _kBorder),
                itemBuilder: (_, i) {
                  final sub = _subReasons[i];
                  final selected = _selected == sub;
                  return _SubReasonTile(
                    subReason: sub,
                    selected: selected,
                    onTap: () => setState(() => _selected = sub),
                  );
                },
              ),
            ),
            // Bottom bar
            Container(
              color: _kCard,
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 28),
              child: SafeArea(
                top: false,
                child: SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    onPressed: _selected != null ? _proceed : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _selected != null
                          ? _kPrimary
                          : _kPrimary.withValues(alpha: 0.35),
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text('Next',
                        style: _pjs(
                            size: 15,
                            weight: FontWeight.w700,
                            color: Colors.white)),
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

// ── Sub-reason tile ───────────────────────────────────────────────────────────
class _SubReasonTile extends StatelessWidget {
  const _SubReasonTile({
    required this.subReason,
    required this.selected,
    required this.onTap,
  });
  final ReturnSubReason subReason;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 14),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    subReason.label,
                    style: _pjs(
                      size: 14,
                      weight: selected ? FontWeight.w600 : FontWeight.w400,
                      color: selected ? _kSecondary : _kText,
                    ),
                  ),
                  const SizedBox(height: 3),
                  // Solution pill
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: _kChip,
                      borderRadius: BorderRadius.circular(9999),
                    ),
                    child: Text(
                      'Solution: ${subReason.solution}',
                      style: _pjs(
                          size: 11,
                          weight: FontWeight.w600,
                          color: _kSecondary),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            // Radio
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
