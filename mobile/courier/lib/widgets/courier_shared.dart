import 'package:flutter/material.dart';
import '../theme/mimoo_theme.dart';

String displayStatus(String value) {
  if (value.isEmpty) return 'Not provided';
  return value
      .split(RegExp(r'[_\s]+'))
      .map((word) =>
          word.isEmpty ? word : '${word[0].toUpperCase()}${word.substring(1)}')
      .join(' ');
}

Color statusColor(String status) {
  switch (status) {
    case 'completed':
    case 'picked_up':
    case 'approved':
    case 'active':
    case 'on_duty':
      return kGreen;
    case 'completed_with_discrepancy':
    case 'arrived':
    case 'loading':
      return Colors.orange;
    case 'in_transit':
    case 'accepted':
    case 'scheduled':
      return kSecondary;
    case 'cancelled':
    case 'failed':
    case 'rejected':
    case 'suspended':
      return kFlash;
    case 'assigned':
    case 'pending':
    case 'pending_pickup':
      return kPrimary;
    default:
      return kSubtext;
  }
}

class CourierStatusBadge extends StatelessWidget {
  const CourierStatusBadge({super.key, required this.status, this.label});
  final String status;
  final String? label;

  @override
  Widget build(BuildContext context) {
    final color = statusColor(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        (label ?? displayStatus(status)).toUpperCase(),
        // 11sp (was 9) and an AA-safe shade of the status colour on its tinted background
        style: pjs(size: 11, weight: FontWeight.w800, color: aaText(color)),
      ),
    );
  }
}

class CourierInfoCard extends StatelessWidget {
  const CourierInfoCard({
    super.key,
    required this.title,
    required this.children,
    this.description,
    this.trailing,
  });

  final String title;
  final List<Widget> children;
  final String? description;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: kBorder),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Expanded(
            child: Text(title,
                style:
                    pjs(size: 13, weight: FontWeight.w800, color: kPrimary)),
          ),
          if (trailing != null) trailing!,
        ]),
        if (description != null) ...[
          const SizedBox(height: 4),
          Text(description!, style: pjs(size: 11, color: kSubtext)),
        ],
        const Divider(height: 12, color: kBorder),
        ...children,
      ]),
    );
  }
}

class CourierInfoRow extends StatelessWidget {
  const CourierInfoRow(this.label, this.value, {super.key, this.trailing});
  final String label;
  final String value;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        SizedBox(
          width: 96,
          child: Text(label, style: pjs(size: 12, color: kSubtext)),
        ),
        Expanded(
          child: Text(value.isEmpty ? 'Not provided' : value,
              style: pjs(size: 12, weight: FontWeight.w600)),
        ),
        if (trailing != null) trailing!,
      ]),
    );
  }
}

class CourierErrorState extends StatelessWidget {
  const CourierErrorState({
    super.key,
    required this.message,
    required this.onRetry,
  });
  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          const Icon(Icons.wifi_off_outlined, size: 48, color: kSubtext),
          const SizedBox(height: 12),
          Text(message,
              style: pjs(size: 13, color: kSubtext),
              textAlign: TextAlign.center),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: onRetry,
            style: FilledButton.styleFrom(backgroundColor: kPrimary),
            child: Text('Try again',
                style: pjs(
                    size: 13, weight: FontWeight.w700, color: Colors.white)),
          ),
        ]),
      ),
    );
  }
}

class CourierEmptyState extends StatelessWidget {
  const CourierEmptyState({
    super.key,
    required this.icon,
    required this.message,
    this.actionLabel,
    this.onAction,
  });
  final IconData icon;
  final String message;

  /// Optional next step ("no dead ends"): refresh, clear filters, add…
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Icon(icon, size: 52, color: kSubtext),
          const SizedBox(height: 12),
          Text(message,
              style: pjs(size: 13, color: kSubtext),
              textAlign: TextAlign.center),
          if (actionLabel != null && onAction != null) ...[
            const SizedBox(height: 16),
            OutlinedButton(
              onPressed: onAction,
              style: OutlinedButton.styleFrom(
                  minimumSize: const Size(48, 48),
                  side: const BorderSide(color: kPrimary)),
              child: Text(actionLabel!,
                  style:
                      pjs(size: 13, weight: FontWeight.w700, color: kPrimary)),
            ),
          ],
        ]),
      ),
    );
  }
}

/// Spinner for first loads (lists keep showing old data while refreshing).
class CourierLoadingState extends StatelessWidget {
  const CourierLoadingState({super.key});

  @override
  Widget build(BuildContext context) => const Center(
        child: Padding(
          padding: EdgeInsets.all(32),
          child: CircularProgressIndicator(color: kPrimary),
        ),
      );
}

/// Search box used on long lists.
class CourierSearchField extends StatelessWidget {
  const CourierSearchField({
    super.key,
    required this.onChanged,
    this.hint = 'Search',
  });
  final ValueChanged<String> onChanged;
  final String hint;

  @override
  Widget build(BuildContext context) => TextField(
        onChanged: onChanged,
        textInputAction: TextInputAction.search,
        style: pjs(size: 14),
        decoration: mimooInput(hint: hint, icon: Icons.search),
      );
}

/// Horizontal filter chips (48dp tall touch targets).
class CourierFilterChips extends StatelessWidget {
  const CourierFilterChips({
    super.key,
    required this.options,
    required this.value,
    required this.onChanged,
  });
  final Map<String, String> options; // value -> label
  final String value;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) => SizedBox(
        height: 48 * MediaQuery.textScalerOf(context).scale(1).clamp(1.0, 1.8),
        child: ListView(
          scrollDirection: Axis.horizontal,
          children: [
            for (final e in options.entries)
              Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ChoiceChip(
                  label: Text(e.value,
                      style: pjs(
                          size: 12,
                          weight: FontWeight.w700,
                          color: value == e.key ? Colors.white : kText)),
                  selected: value == e.key,
                  selectedColor: kPrimary,
                  backgroundColor: kCard,
                  side: const BorderSide(color: kBorder),
                  showCheckmark: false,
                  onSelected: (_) => onChanged(e.key),
                ),
              ),
          ],
        ),
      );
}

/// Confirmation for destructive / irreversible actions.
Future<bool> courierConfirm(BuildContext context,
    {required String title,
    required String message,
    String confirmLabel = 'Confirm',
    bool destructive = false}) async {
  final ok = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      title: Text(title, style: pjs(size: 16, weight: FontWeight.w800)),
      content: Text(message, style: pjs(size: 13, color: kSubtext)),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(ctx, false),
          child: Text('Cancel', style: pjs(size: 13, weight: FontWeight.w700)),
        ),
        FilledButton(
          onPressed: () => Navigator.pop(ctx, true),
          style: FilledButton.styleFrom(
              backgroundColor: destructive ? kFlash : kPrimary),
          child: Text(confirmLabel,
              style:
                  pjs(size: 13, weight: FontWeight.w700, color: Colors.white)),
        ),
      ],
    ),
  );
  return ok ?? false;
}

/// ₱1,234.50
String courierPeso(num n) {
  final parts = n.toStringAsFixed(2).split('.');
  final whole = parts[0].replaceAllMapped(
      RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',');
  return '₱$whole.${parts[1]}';
}

void courierSnack(BuildContext context, String message, Color color) {
  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
    content: Text(message, style: pjs(size: 13, color: Colors.white)),
    backgroundColor: color,
    behavior: SnackBarBehavior.floating,
  ));
}
