import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../theme/mimoo_theme.dart';

/// Shows a parcel's waybill as a QR code (the waybill number, same payload as the
/// printed web waybill) so the web scanner can read it with a phone/PC camera.
/// The reverse also works: this app's Scan tab reads the QR shown on the web.
class WaybillPage extends StatelessWidget {
  const WaybillPage({
    super.key,
    required this.waybillNumber,
    required this.orderNumber,
    this.sellerName,
    this.destination,
    this.weight,
    this.paymentMethod,
    this.totalAmount,
  });

  final String waybillNumber;
  final String orderNumber;
  final String? sellerName;
  final String? destination;
  final String? weight;
  final String? paymentMethod;
  final String? totalAmount;

  @override
  Widget build(BuildContext context) {
    final rows = <MapEntry<String, String>>[
      MapEntry('Order', orderNumber),
      if (sellerName != null && sellerName!.isNotEmpty) MapEntry('Seller', sellerName!),
      if (destination != null && destination!.isNotEmpty) MapEntry('Deliver to', destination!),
      if (weight != null && weight!.isNotEmpty) MapEntry('Weight', weight!),
      if (paymentMethod != null && paymentMethod!.isNotEmpty) MapEntry('Payment', paymentMethod!.toUpperCase()),
      if (totalAmount != null && totalAmount!.isNotEmpty) MapEntry('Amount', totalAmount!),
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Waybill')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE6DFF2)),
              ),
              child: Column(
                children: [
                  if (waybillNumber.isEmpty)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 40),
                      child: Text('No waybill has been generated for this parcel yet.'),
                    )
                  else ...[
                    // White background and a quiet zone keep the code readable by any camera.
                    QrImageView(
                      data: waybillNumber,
                      version: QrVersions.auto,
                      size: 260,
                      backgroundColor: Colors.white,
                      errorCorrectionLevel: QrErrorCorrectLevel.M,
                    ),
                    const SizedBox(height: 12),
                    SelectableText(
                      waybillNumber,
                      style: pjs(size: 20, weight: FontWeight.w700),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Show this to a scanner. Raise screen brightness for best results.',
                      textAlign: TextAlign.center,
                      style: pjs(size: 12),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 16),
            for (final r in rows)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 6),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(width: 96, child: Text(r.key, style: pjs(size: 13))),
                    Expanded(child: Text(r.value, style: pjs(size: 13, weight: FontWeight.w600))),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
