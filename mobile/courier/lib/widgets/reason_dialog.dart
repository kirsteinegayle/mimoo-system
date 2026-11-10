import 'package:flutter/material.dart';
import '../theme/mimoo_theme.dart';

/// Reason presets copied from the web courier pages.
const List<String> courierRejectionReasons = [
  'Out of service area',
  'Vehicle unavailable',
  'Peak capacity reached',
  'Pickup time conflicts',
  'Insufficient preparation time',
  'Weather/road conditions',
  'Other (specify below)',
];

const List<String> courierCancellationReasons = [
  'Seller unavailable',
  'Parcel not ready',
  'Wrong pickup address',
  'Seller refused',
  'Out of service area',
  'Weather/road conditions',
  'Vehicle breakdown',
  'Other (specify below)',
];

const List<String> courierFailureReasons = [
  'Seller unavailable',
  'Parcel not ready',
  'Wrong address',
  'Seller refused shipment',
  'Access denied to location',
  'Incomplete documentation',
  'Other (specify below)',
];

const String kOtherReason = 'Other (specify below)';

/// Dialog with an optional preset dropdown and a custom reason field.
///
/// Returns the final reason string (at least 10 characters) or null.
class ReasonDialog extends StatefulWidget {
  const ReasonDialog({
    super.key,
    required this.title,
    required this.hint,
    required this.confirmLabel,
    required this.confirmColor,
    this.presets = const [],
  });

  final String title;
  final List<String> presets;
  final String hint;
  final String confirmLabel;
  final Color confirmColor;

  @override
  State<ReasonDialog> createState() => _ReasonDialogState();
}

class _ReasonDialogState extends State<ReasonDialog> {
  final _ctrl = TextEditingController();
  String? _preset;
  String? _error;

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  String? get _finalReason {
    if (widget.presets.isEmpty) {
      final text = _ctrl.text.trim();
      return text.length >= 10 ? text : null;
    }
    if (_preset == null) return null;
    if (_preset == kOtherReason) {
      final text = _ctrl.text.trim();
      return text.length >= 10 ? text : null;
    }
    return _preset;
  }

  void _submit() {
    final reason = _finalReason;
    if (reason == null) {
      setState(() => _error =
          'Please select or enter a reason of at least 10 characters.');
      return;
    }
    Navigator.pop(context, reason);
  }

  @override
  Widget build(BuildContext context) {
    final needsCustom = widget.presets.isEmpty || _preset == kOtherReason;

    return AlertDialog(
      title: Text(widget.title, style: pjs(size: 16, weight: FontWeight.w800)),
      content: SingleChildScrollView(
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          if (widget.presets.isNotEmpty) ...[
            DropdownButtonFormField<String>(
              initialValue: _preset,
              items: widget.presets
                  .map((r) => DropdownMenuItem(
                        value: r,
                        child: Text(r,
                            style: pjs(size: 13),
                            overflow: TextOverflow.ellipsis),
                      ))
                  .toList(),
              onChanged: (v) => setState(() {
                _preset = v;
                _error = null;
              }),
              decoration: mimooInput(hint: 'Select a reason'),
            ),
            if (needsCustom) const SizedBox(height: 12),
          ],
          if (needsCustom)
            TextField(
              controller: _ctrl,
              maxLines: 3,
              style: pjs(size: 13),
              onChanged: (_) {
                if (_error != null) setState(() => _error = null);
              },
              decoration: InputDecoration(
                hintText: widget.hint,
                hintStyle: pjs(size: 12, color: kSubtext),
                border:
                    OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
              ),
            ),
          if (_error != null) ...[
            const SizedBox(height: 8),
            Align(
              alignment: Alignment.centerLeft,
              child: Text(_error!,
                  style: pjs(size: 11, color: kFlash, height: 1.3)),
            ),
          ],
        ]),
      ),
      actions: [
        TextButton(
            onPressed: () => Navigator.pop(context), child: const Text('Back')),
        FilledButton(
          onPressed: _submit,
          style: FilledButton.styleFrom(backgroundColor: widget.confirmColor),
          child: Text(widget.confirmLabel),
        ),
      ],
    );
  }
}
