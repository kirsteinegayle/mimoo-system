import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../core/error_messages.dart';
import '../core/theme.dart';
import '../data/parcel_flow.dart';
import '../data/repositories/app_repositories_scope.dart';
import '../widgets/common.dart';
import '../widgets/custody_timeline.dart';
import '../widgets/delivery_sections.dart';
import 'pickup_detail_screen.dart';

class DeliveryDetailScreen extends StatefulWidget {
  final DispatchParcel parcel;
  final VoidCallback? onBack;
  final Future<bool> Function()? onMarkOut;
  const DeliveryDetailScreen(
      {super.key, required this.parcel, this.onBack, this.onMarkOut});

  @override
  State<DeliveryDetailScreen> createState() => _DeliveryDetailScreenState();
}

class _DeliveryDetailScreenState extends State<DeliveryDetailScreen> {
  bool _busy = false;
  bool _markedOut = false;

  DispatchParcel get _parcel => widget.parcel;

  Future<void> _callBuyer() async {
    final messenger = ScaffoldMessenger.of(context);
    final uri = Uri.parse('tel:${_parcel.phone}');
    var opened = false;
    try {
      opened = await canLaunchUrl(uri) && await launchUrl(uri);
    } catch (_) {
      opened = false;
    }
    if (!opened) {
      messenger.showSnackBar(
          const SnackBar(content: Text("Couldn't start the call")));
    }
  }

  void _message() => Navigator.pushNamed(context, '/chat/thread');

  Future<void> _markOut() async {
    if (_busy) return;
    final messenger = ScaffoldMessenger.of(context);
    setState(() => _busy = true);
    try {
      final completed = widget.onMarkOut != null
          ? await widget.onMarkOut!()
          : await _advanceToOutForDelivery();
      if (mounted && completed) setState(() => _markedOut = true);
    } catch (error) {
      if (mounted) {
        messenger.showSnackBar(SnackBar(content: Text(friendlyError(error))));
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<bool> _advanceToOutForDelivery() async {
    final parcels = AppRepositoriesScope.of(context).parcels;
    final current = parcels.byTracking(_parcel.trackingNo);
    if (current == null) return false;
    final steps = switch (current.status) {
      ParcelStatus.assigned => [
          ParcelStatus.pickedUp,
          ParcelStatus.atHub,
          ParcelStatus.outForDelivery,
        ],
      ParcelStatus.pickedUp => [
          ParcelStatus.atHub,
          ParcelStatus.outForDelivery,
        ],
      ParcelStatus.atHub => [ParcelStatus.outForDelivery],
      ParcelStatus.failedDelivery => [
          ParcelStatus.atHub,
          ParcelStatus.outForDelivery,
        ],
      _ => const <ParcelStatus>[],
    };
    for (final step in steps) {
      final changed = await parcels.transition(current.trackingNo, step);
      if (!changed) return false;
    }
    return steps.isNotEmpty;
  }

  Future<void> _fail() async {
    final c = MC.of(context);
    final reason = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: c.lowest,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 20),
          child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                    child: Container(
                        width: 44,
                        height: 5,
                        decoration: BoxDecoration(
                            color: c.outlineVariant,
                            borderRadius: BorderRadius.circular(9)))),
                const SizedBox(height: 16),
                Text('Why did the delivery fail?',
                    style: MT.headlineMd.copyWith(color: c.text)),
                const SizedBox(height: 8),
                for (final reason in failureReasons)
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading:
                        Icon(Icons.report_problem_outlined, color: c.coral),
                    title: Text(reason,
                        style: MT.bodyMd.copyWith(
                            fontWeight: FontWeight.w600, color: c.text)),
                    trailing: Icon(Icons.chevron_right, color: c.muted),
                    onTap: () => Navigator.pop(ctx, reason),
                  ),
              ]),
        ),
      ),
    );
    if (reason == null || !mounted) return;
    try {
      await AppRepositoriesScope.of(context).parcels.transition(
            _parcel.trackingNo,
            ParcelStatus.failedDelivery,
            reason: reason,
          );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(friendlyError(error))));
      return;
    }
    if (!mounted) return;
    Navigator.pushNamedAndRemoveUntil(context, '/home', (_) => false);
  }

  @override
  Widget build(BuildContext context) {
    final p = _parcel;
    final c = MC.of(context);
    final status = _markedOut ? ParcelStatus.outForDelivery : p.status;
    final step = deliveryStepFor(status);
    final delivered = status == ParcelStatus.delivered;
    final atHub = status == ParcelStatus.assigned ||
        status == ParcelStatus.pickedUp ||
        status == ParcelStatus.atHub ||
        status == ParcelStatus.failedDelivery;
    final canPod = status == ParcelStatus.outForDelivery;
    final (pillBg, pillFg) = switch (status) {
      ParcelStatus.failedDelivery => (c.coral, c.lowest),
      ParcelStatus.delivered || ParcelStatus.returned => (c.greenSoft, c.green),
      ParcelStatus.outForDelivery => (c.primary, c.lowest),
      _ => (c.container, c.primary),
    };
    return Scaffold(
      backgroundColor: c.bg,
      appBar: MSubAppBar(
        title:
            Text(p.tracking, style: MT.labelLg.copyWith(color: Colors.white)),
        onBack: widget.onBack,
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: MChip(status.label, bg: pillBg, fg: pillFg),
          ),
        ],
      ),
      body: MPageBody(
          child: ListView(padding: MS.pagePadding, children: [
        if (status == ParcelStatus.failedDelivery) ...[
          DeliveryOverdueBanner(parcel: p),
          const SizedBox(height: 12),
        ],
        if (delivered) ...[
          InfoBanner(Icons.check_circle, 'Delivered',
              body: 'Handover completed to ${p.buyer}.',
              bg: c.greenSoft,
              fg: c.green),
          const SizedBox(height: 12),
        ],
        DeliveryProgressCard(step: step, completed: delivered),
        const SizedBox(height: 12),
        DeliveryRecipientCard(
          parcel: p,
          onCall: _callBuyer,
          onMessage: _message,
        ),
        const SizedBox(height: 12),
        DeliveryAddressCard(parcel: p),
        if (p.landmark?.isNotEmpty == true) ...[
          const SizedBox(height: 12),
          DeliveryNoteBanner(parcel: p),
        ],
        const SizedBox(height: 12),
        DeliveryParcelCard(parcel: p),
        const SizedBox(height: 12),
        DeliveryPaymentCard(parcel: p),
        const SizedBox(height: 12),
        CustodyTimeline(events: p.custody),
        const SizedBox(height: 16),
        PillButton.secondary('Navigate (Google Maps)',
            leading: Icons.near_me,
            onPressed: () => showNavigationPicker(context,
                address: p.address, title: 'Navigate to Customer')),
        if (atHub) ...[
          const SizedBox(height: 8),
          PillButton('Mark Out for Delivery',
              icon: Icons.arrow_forward,
              loading: _busy,
              onPressed: _busy ? null : _markOut),
          const SizedBox(height: 8),
          const PillButton('Proof of Delivery',
              icon: Icons.lock, style: BtnStyle.tonal, onPressed: null),
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text(
              'Mark Out for Delivery first (Delivered cannot be skipped)',
              textAlign: TextAlign.center,
              style: ts(12, c: c.muted),
            ),
          ),
        ],
        if (canPod) ...[
          const SizedBox(height: 8),
          PillButton('Proof of Delivery',
              icon: Icons.photo_camera,
              onPressed: () =>
                  Navigator.pushNamed(context, '/pod', arguments: p.tracking)),
          const SizedBox(height: 4),
          TextButton.icon(
            onPressed: _fail,
            icon: Icon(Icons.error, color: c.coral, size: 18),
            label: Text('Delivery failed / Customer unavailable',
                style: ts(14, w: FontWeight.w600, c: c.coral)),
          ),
        ],
        if (delivered) ...[
          const SizedBox(height: 8),
          PillButton.secondary('View COD Balance',
              leading: Icons.account_balance,
              onPressed: () => Navigator.pushNamed(context, '/cod-remittance')),
        ],
      ])),
    );
  }
}
