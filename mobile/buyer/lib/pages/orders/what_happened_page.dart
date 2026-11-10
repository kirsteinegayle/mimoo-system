import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'return_refund_models.dart';
import 'select_reason_modal.dart';
import '../../theme/app_theme.dart';

// ── Design tokens ─────────────────────────────────────────────────────────────
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

// ── Category display data (matching screenshot exactly) ───────────────────────
const _kCategories = [
  _CatData(
    category: ReturnCategory.damaged,
    label: 'Received Damaged Item(s)',
    description: 'Physical/functional damages on Item',
    icon: Icons.inventory_2_outlined,
  ),
  _CatData(
    category: ReturnCategory.incorrect,
    label: 'Received Incorrect Item(s)',
    description: 'Wrong item, wrong size, counterfeit etc.',
    icon: Icons.swap_horiz_outlined,
  ),
  _CatData(
    category: ReturnCategory.notReceived,
    label: 'Did Not Receive Some/All of the Item(s)',
    description: 'Some/all of my item(s) or accessories are not delivered',
    icon: Icons.remove_shopping_cart_outlined,
  ),
];

class _CatData {
  const _CatData({
    required this.category,
    required this.label,
    required this.description,
    required this.icon,
  });
  final ReturnCategory category;
  final String label;
  final String description;
  final IconData icon;
}

// ═════════════════════════════════════════════════════════════════════════════
// WHAT HAPPENED SCREEN
// ═════════════════════════════════════════════════════════════════════════════
class WhatHappenedPage extends StatelessWidget {
  const WhatHappenedPage({super.key, required this.summary});
  final ReturnOrderSummary summary;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _kSurface,
      appBar: _buildAppBar(context),
      body: Padding(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Single white card containing all three categories
            Container(
              decoration: BoxDecoration(
                color: _kCard,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: _kBorder),
              ),
              child: Column(
                children: _kCategories.asMap().entries.map((entry) {
                  final i = entry.key;
                  final data = entry.value;
                  return Column(
                    children: [
                      _CategoryRow(
                        data: data,
                        onTap: () => _openModal(context, data.category),
                      ),
                      if (i < _kCategories.length - 1)
                        const Divider(
                            height: 1,
                            color: _kBorder,
                            indent: 16,
                            endIndent: 16),
                    ],
                  );
                }).toList(),
              ),
            ),
          ],
        ),
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
      title: Text('What happened to your order?',
          style: _pjs(size: 15, weight: FontWeight.w800)),
    );
  }

  void _openModal(BuildContext context, ReturnCategory category) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => SelectReasonModal(
        summary: summary,
        category: category,
      ),
    );
  }
}

// ── Single category row inside the card ───────────────────────────────────────
class _CategoryRow extends StatelessWidget {
  const _CategoryRow({required this.data, required this.onTap});
  final _CatData data;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Icon in chip-coloured square box
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: _kChip,
                borderRadius: BorderRadius.circular(9),
              ),
              child: Icon(data.icon, size: 20, color: _kSecondary),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(data.label,
                      style: _pjs(size: 14, weight: FontWeight.w700)),
                  const SizedBox(height: 2),
                  Text(data.description,
                      style: _pjs(size: 12, color: _kSubtext, height: 1.4)),
                ],
              ),
            ),
            const SizedBox(width: 8),
            const Icon(Icons.chevron_right, color: _kSubtext, size: 20),
          ],
        ),
      ),
    );
  }
}
