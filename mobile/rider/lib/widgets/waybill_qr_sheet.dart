import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../core/theme.dart';

/// Shows the parcel's waybill number as a QR code. The QR content is the plain waybill number,
/// the same value the web and courier "View Waybill" pages encode, so any Mimoo scanner reads it.
Future<void> showWaybillQr(BuildContext context, String waybill) =>
    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => SafeArea(
          child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
              child: WaybillQrCard(waybill: waybill))),
    );

class WaybillQrCard extends StatelessWidget {
  const WaybillQrCard({super.key, required this.waybill});
  final String waybill;

  @override
  Widget build(BuildContext context) =>
      Column(mainAxisSize: MainAxisSize.min, children: [
        Text('Waybill QR', style: ts(18, w: FontWeight.w800)),
        const SizedBox(height: 12),
        Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: MC.tintHi)),
            child: QrImageView(
                key: const ValueKey('waybill-qr'),
                data: waybill,
                size: 220,
                backgroundColor: Colors.white)),
        const SizedBox(height: 12),
        SelectableText(waybill,
            textAlign: TextAlign.center,
            style: ts(16, w: FontWeight.w800, c: MC.violetDark)),
        const SizedBox(height: 4),
        Text('Scan this at pickup, hand-off or delivery.',
            textAlign: TextAlign.center, style: ts(12, c: MC.muted)),
      ]);
}
