import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/product_report_repository.dart';
import '../theme/app_theme.dart';

TextStyle _pjs({double size = 14, FontWeight weight = FontWeight.w400, Color color = AppColors.text}) =>
    GoogleFonts.plusJakartaSans(fontSize: size, fontWeight: weight, color: color);

/// Opens the "Report product" bottom sheet. Returns the success message when
/// a report was submitted, or null when the sheet was closed.
Future<String?> showReportProductSheet(
  BuildContext context, {
  required int productId,
  required String productName,
}) {
  return showModalBottomSheet<String>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => ReportProductSheet(productId: productId, productName: productName),
  );
}

class ReportProductSheet extends StatefulWidget {
  const ReportProductSheet({super.key, required this.productId, required this.productName});
  final int productId;
  final String productName;

  @override
  State<ReportProductSheet> createState() => _ReportProductSheetState();
}

class _ReportProductSheetState extends State<ReportProductSheet> {
  String _reason = ProductReportRepository.reasons.first.value;
  final _descCtrl = TextEditingController();
  bool _submitting = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _descCtrl.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _descCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final desc = _descCtrl.text.trim();
    if (desc.isEmpty) {
      setState(() => _error = 'Please provide details about why you are reporting this product.');
      return;
    }
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      final msg = await ProductReportRepository.instance.submit(
        productId: widget.productId,
        reason: _reason,
        description: desc,
      );
      if (!mounted) return;
      Navigator.pop(context, msg);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _submitting = false;
        _error = ProductReportRepository.errorMessage(e);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final len = _descCtrl.text.length;
    final canSubmit = !_submitting && _descCtrl.text.trim().isNotEmpty;

    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Container(
        decoration: const BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: SafeArea(
          top: false,
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppColors.border,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    const Icon(Icons.flag_outlined, color: Colors.redAccent, size: 22),
                    const SizedBox(width: 8),
                    Expanded(child: Text('Report product', style: _pjs(size: 17, weight: FontWeight.w700))),
                    IconButton(
                      icon: const Icon(Icons.close, color: AppColors.textMuted),
                      onPressed: _submitting ? null : () => Navigator.pop(context),
                      tooltip: 'Close',
                    ),
                  ],
                ),
                Text(widget.productName,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: _pjs(size: 12, color: AppColors.textMuted)),
                const SizedBox(height: 14),
                Text('Reason', style: _pjs(size: 13, weight: FontWeight.w600)),
                const SizedBox(height: 4),
                RadioGroup<String>(
                  groupValue: _reason,
                  onChanged: (v) {
                    if (_submitting || v == null) return;
                    setState(() => _reason = v);
                  },
                  child: Column(
                    children: [
                      for (final r in ProductReportRepository.reasons)
                        RadioListTile<String>(
                          value: r.value,
                          dense: true,
                          contentPadding: EdgeInsets.zero,
                          activeColor: AppColors.primary,
                          title: Text(r.label, style: _pjs(size: 13)),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                Text('Details', style: _pjs(size: 13, weight: FontWeight.w600)),
                const SizedBox(height: 6),
                TextField(
                  controller: _descCtrl,
                  enabled: !_submitting,
                  maxLines: 4,
                  maxLength: ProductReportRepository.maxDescription,
                  style: _pjs(size: 13),
                  decoration: InputDecoration(
                    hintText: 'Tell us what is wrong with this product',
                    hintStyle: _pjs(size: 13, color: AppColors.textMuted),
                    counterText: '$len/${ProductReportRepository.maxDescription}',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
                    ),
                  ),
                ),
                if (_error != null) ...[
                  const SizedBox(height: 6),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.red.shade50,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(_error!, style: _pjs(size: 12, color: Colors.red.shade700)),
                  ),
                ],
                const SizedBox(height: 14),
                SizedBox(
                  width: double.infinity,
                  height: 46,
                  child: ElevatedButton(
                    onPressed: canSubmit ? _submit : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: _submitting
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : Text('Submit report',
                            style: _pjs(size: 14, weight: FontWeight.w700, color: Colors.white)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
