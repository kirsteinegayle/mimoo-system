import 'dart:async';

import 'package:flutter/material.dart';

import '../services/order_repository.dart';
import '../theme/app_theme.dart';

const _kPrimary = AppColors.primary;
const _kSubtext = AppColors.textMuted;

/// "Give this code to your rider: 123456" — shown only while the backend
/// returns an active code (GET /buyer/orders/{id}/delivery-code). Hidden
/// otherwise, including on errors. Re-checks every 30 s and hides itself when
/// the code expires. The code is kept in memory only (never stored).
class DeliveryCodeCard extends StatefulWidget {
  const DeliveryCodeCard({super.key, required this.orderId});
  final int orderId;

  @override
  State<DeliveryCodeCard> createState() => _DeliveryCodeCardState();
}

class _DeliveryCodeCardState extends State<DeliveryCodeCard> {
  DeliveryCode? _code;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _load();
    _timer = Timer.periodic(const Duration(seconds: 30), (_) => _load());
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _load() async {
    DeliveryCode? c;
    try {
      c = await OrderRepository.instance.fetchDeliveryCode(widget.orderId);
    } catch (_) {
      c = null; // hide on any error (401 is handled globally)
    }
    if (mounted) setState(() => _code = c);
  }

  String _time(DateTime t) {
    final l = t.toLocal();
    final h = l.hour % 12 == 0 ? 12 : l.hour % 12;
    final m = l.minute.toString().padLeft(2, '0');
    return '$h:$m ${l.hour < 12 ? 'AM' : 'PM'}';
  }

  @override
  Widget build(BuildContext context) {
    final c = _code;
    if (c == null || !c.expiresAt.isAfter(DateTime.now())) {
      return const SizedBox.shrink();
    }
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF3EEFC),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.accent),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Give this code to your rider${c.riderFirstName != null ? ' (${c.riderFirstName})' : ''}:',
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: _kPrimary)),
          const SizedBox(height: 6),
          SelectableText(c.code,
              style: const TextStyle(
                  fontSize: 28, fontWeight: FontWeight.w800, letterSpacing: 6, color: _kPrimary)),
          const SizedBox(height: 4),
          Text('Expires at ${_time(c.expiresAt)}. Only share it when you receive your parcel.',
              style: const TextStyle(fontSize: 12, color: _kSubtext)),
        ],
      ),
    );
  }
}
