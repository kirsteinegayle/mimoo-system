import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import '../core/theme.dart';

class PickupJob {
  final String tracking, seller, merchantId, address, phone, parcelLabel;
  final double pay, km;
  final int etaMins;
  const PickupJob(
      {required this.tracking,
      required this.seller,
      required this.merchantId,
      required this.address,
      required this.phone,
      required this.parcelLabel,
      required this.pay,
      required this.km,
      required this.etaMins});
}

class PickupDetailScreen extends StatelessWidget {
  final PickupJob job;
  final VoidCallback onBack, onScanWaybill;
  const PickupDetailScreen(
      {super.key,
      required this.job,
      required this.onBack,
      required this.onScanWaybill});

  @override
  Widget build(BuildContext context) => MScaffold(
      title: 'Pickup',
      onBack: onBack,
      actions: [
        Padding(
            padding: const EdgeInsets.only(right: 12),
            child: Pill(job.tracking, icon: Icons.qr_code_2))
      ],
      bottom: SafeArea(
          child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(children: [
                Expanded(
                    child: PillButton('Navigate',
                        icon: Icons.navigation,
                        style: BtnStyle.tonal,
                        onPressed: () => showNavigationPicker(context,
                            address: job.address,
                            etaMins: job.etaMins,
                            km: job.km,
                            title: 'Navigate to Seller'))),
                const SizedBox(width: 8),
                Expanded(
                    child: PillButton('Scan Waybill',
                        icon: Icons.arrow_forward, onPressed: onScanWaybill))
              ]))),
      body: ListView(padding: MS.pagePadding, children: [
        MCard(
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Expanded(
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                  Text(job.seller, style: ts(18, w: FontWeight.w700)),
                  const SizedBox(height: 4),
                  const Pill('Verified seller', icon: Icons.verified),
                  const SizedBox(height: 4),
                  Text('Merchant ID: ${job.merchantId}',
                      style: ts(12, c: MC.muted))
                ])),
            const Pill('Standard pickup', bg: MC.tint)
          ]),
          const SizedBox(height: 12),
          Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                  color: MC.tintLow, borderRadius: BorderRadius.circular(8)),
              child: Column(children: [
                Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const IconCircle(Icons.storefront, size: 28),
                  const SizedBox(width: 10),
                  Expanded(
                      child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                        Text('PICKUP ADDRESS',
                            style: ts(12, w: FontWeight.w800, c: MC.muted)),
                        Text(job.address,
                            style: ts(14, w: FontWeight.w500, h: 1.3))
                      ]))
                ]),
                Align(
                    alignment: Alignment.centerRight,
                    child: TextButton.icon(
                        icon: const Icon(Icons.content_copy, size: 16),
                        label: const Text('Copy Address'),
                        onPressed: () {
                          Clipboard.setData(ClipboardData(text: job.address));
                          ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Address copied')));
                        })),
              ])),
          const SizedBox(height: 12),
          Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                  color: MC.tint, borderRadius: BorderRadius.circular(8)),
              child: Row(children: [
                const IconCircle(Icons.phone_in_talk,
                    bg: Colors.white, fg: MC.violetDark),
                const SizedBox(width: 12),
                Expanded(
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                      Text('SELLER CONTACT',
                          style: ts(12, w: FontWeight.w800, c: MC.muted)),
                      Text(job.phone, style: ts(14, w: FontWeight.w700))
                    ])),
                FilledButton.icon(
                    style:
                        FilledButton.styleFrom(backgroundColor: MC.violetDark),
                    icon: const Icon(Icons.call, size: 16),
                    label: const Text('Call Seller'),
                    onPressed: () => launchUrl(Uri.parse('tel:${job.phone}')))
              ])),
          const SizedBox(height: 12),
          LayoutBuilder(builder: (context, constraints) {
            final compact = MediaQuery.textScalerOf(context).scale(1) > 1.2 ||
                constraints.maxWidth < 380;
            final columns = compact ? 1 : 2;
            final width =
                (constraints.maxWidth - MS.sm * (columns - 1)) / columns;
            return Wrap(spacing: MS.sm, runSpacing: MS.sm, children: [
              SizedBox(
                  width: width,
                  child: _meta(Icons.inventory_2, 'PARCEL DETAILS', '1 Parcel',
                      job.parcelLabel)),
              SizedBox(
                  width: width,
                  child: _meta(Icons.payments, 'PICKUP PAY', peso(job.pay),
                      'Guaranteed base tier',
                      big: true)),
            ]);
          }),
        ])),
        const SizedBox(height: 12),
        InfoBanner(
            Icons.near_me, '${job.km} km away · Est. ${job.etaMins} mins'),
      ]));

  Widget _meta(IconData i, String k, String v, String sub,
          {bool big = false}) =>
      Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
              color: MC.tintLow, borderRadius: BorderRadius.circular(8)),
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Icon(i, size: 16, color: MC.muted),
              const SizedBox(width: 4),
              Text(k, style: ts(12, w: FontWeight.w800, c: MC.muted))
            ]),
            const SizedBox(height: 4),
            Text(v,
                style: big
                    ? ts(24, w: FontWeight.w800, c: MC.violetDark)
                    : ts(14, w: FontWeight.w700)),
            Text(sub, style: ts(12, c: MC.muted))
          ]));
}

/// Launches Google Maps directions for [address] (or lat/lng if provided).
/// Opens with [LaunchMode.externalApplication]. Shows a SnackBar on failure.
/// Shared by pickup and delivery screens.
Future<void> showNavigationPicker(
  BuildContext context, {
  required String address,
  int etaMins = 0,
  double km = 0,
  String title = 'Navigate to Seller',
  double? lat,
  double? lng,
}) async {
  final q =
      lat != null && lng != null ? '$lat,$lng' : Uri.encodeComponent(address);
  final mapsUri = Uri.parse(
      'https://www.google.com/maps/dir/?api=1&destination=$q&travelmode=driving');
  bool opened = false;
  try {
    opened = await launchUrl(mapsUri, mode: LaunchMode.externalApplication);
  } catch (_) {
    opened = false;
  }
  if (!opened && context.mounted) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
          content: Text("Couldn't open Google Maps. Please try again.")),
    );
  }
}
