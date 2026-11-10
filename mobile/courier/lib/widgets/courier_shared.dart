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
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        (label ?? displayStatus(status)).toUpperCase(),
        style: pjs(size: 9, weight: FontWeight.w800, color: color),
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
  });
  final IconData icon;
  final String message;

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
        ]),
      ),
    );
  }
}

void courierSnack(BuildContext context, String message, Color color) {
  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
    content: Text(message, style: pjs(size: 13, color: Colors.white)),
    backgroundColor: color,
    behavior: SnackBarBehavior.floating,
  ));
}
