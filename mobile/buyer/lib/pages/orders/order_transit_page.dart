import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../models/order_tracking.dart';
import '../../services/api_service.dart';
import '../../services/order_repository.dart';
import '../../theme/app_theme.dart';

const _kPrimary = AppColors.primary;
const _kAccent = AppColors.accent;
const _kBorder = AppColors.border;
const _kSubtext = AppColors.textMuted;

const _months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
String _fmtDate(DateTime d) => '${_months[d.month - 1]} ${d.day}, ${d.year}';
String _fmtTime(DateTime d) {
  final h = d.hour % 12 == 0 ? 12 : d.hour % 12;
  return '$h:${d.minute.toString().padLeft(2, '0')} ${d.hour < 12 ? 'AM' : 'PM'}';
}

/// Track Order: the parcel's transit log as a timeline (newest on top).
/// Same data as the website's /orders/{id}/tracking page.
class OrderTransitPage extends StatefulWidget {
  const OrderTransitPage({super.key, required this.orderId});
  final int orderId;

  @override
  State<OrderTransitPage> createState() => _OrderTransitPageState();
}

class _OrderTransitPageState extends State<OrderTransitPage> {
  OrderTracking? _data;
  String? _error;
  bool _loading = true;
  Timer? _poll;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _poll?.cancel();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final d = await OrderRepository.instance.fetchTracking(widget.orderId);
      if (!mounted) return;
      setState(() {
        _data = d;
        _error = null;
        _loading = false;
      });
      // Light auto-refresh while the parcel is still moving.
      _poll?.cancel();
      if (!d.isFinished) {
        _poll = Timer(const Duration(seconds: 60), _load);
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e is ApiException ? e.message : ApiService.friendlyError(e);
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        backgroundColor: AppColors.card,
        elevation: 0,
        foregroundColor: AppColors.text,
        title: const Text('Track Order',
            style: TextStyle(fontWeight: FontWeight.w800, fontSize: 17)),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null && _data == null
              ? _ErrorView(message: _error!, onRetry: () {
                  setState(() => _loading = true);
                  _load();
                })
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      _Summary(data: _data!),
                      const SizedBox(height: 12),
                      _Timeline(events: _data!.events.reversed.toList()),
                    ],
                  ),
                ),
    );
  }
}

class _Summary extends StatelessWidget {
  const _Summary({required this.data});
  final OrderTracking data;

  @override
  Widget build(BuildContext context) {
    final latest = data.events.isNotEmpty ? data.events.last : null;
    final headline = data.trackingLabel ?? latest?.title;
    return _Card(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(data.orderNumber,
            style: const TextStyle(
                fontSize: 16, fontWeight: FontWeight.w800, color: _kPrimary)),
        if (data.waybillNumber != null) ...[
          const SizedBox(height: 4),
          GestureDetector(
            onTap: () {
              Clipboard.setData(ClipboardData(text: data.waybillNumber!));
              ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Waybill number copied')));
            },
            child: Row(children: [
              Text('Waybill: ${data.waybillNumber}',
                  style: const TextStyle(fontSize: 12, color: _kSubtext)),
              const SizedBox(width: 4),
              const Icon(Icons.copy, size: 12, color: _kSubtext),
            ]),
          ),
        ],
        const SizedBox(height: 12),
        _InfoRow(Icons.local_shipping_outlined, 'Courier',
            data.courierName ?? 'Not yet assigned'),
        _InfoRow(Icons.warehouse_outlined, 'Current location',
            data.currentLocation ?? '—'),
        _InfoRow(Icons.location_on_outlined, 'Destination', data.destination),
        if (headline != null) ...[
          const SizedBox(height: 8),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.chip,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              data.trackingMessage?.isNotEmpty == true
                  ? '$headline · ${data.trackingMessage}'
                  : headline,
              style: const TextStyle(
                  fontSize: 13, fontWeight: FontWeight.w600, color: _kPrimary),
            ),
          ),
        ],
      ]),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow(this.icon, this.label, this.value);
  final IconData icon;
  final String label, value;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Icon(icon, size: 16, color: _kSubtext),
          const SizedBox(width: 8),
          SizedBox(
              width: 110,
              child: Text(label,
                  style: const TextStyle(fontSize: 12, color: _kSubtext))),
          Expanded(
              child: Text(value,
                  style: const TextStyle(
                      fontSize: 12, fontWeight: FontWeight.w600))),
        ]),
      );
}

class _Timeline extends StatelessWidget {
  const _Timeline({required this.events}); // newest first
  final List<TrackingEvent> events;

  @override
  Widget build(BuildContext context) {
    return _Card(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Transit history',
            style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
        const SizedBox(height: 12),
        if (events.isEmpty)
          const Text('No tracking updates yet.',
              style: TextStyle(color: _kSubtext, fontSize: 13)),
        ...List.generate(events.length, (i) {
          final e = events[i];
          final first = i == 0;
          final last = i == events.length - 1;
          final color = e.isProblem
              ? AppColors.error
              : first
                  ? _kAccent
                  : _kSubtext;
          final icon = e.isProblem
              ? Icons.cancel
              : (first || e.isDone)
                  ? Icons.check_circle
                  : Icons.radio_button_unchecked;
          final meta = [e.location, e.handler]
              .whereType<String>()
              .where((s) => s.isNotEmpty)
              .join(' · ');
          return IntrinsicHeight(
            child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              // Date/time column
              SizedBox(
                width: 72,
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(_fmtDate(e.at),
                          style: const TextStyle(
                              fontSize: 10, color: _kSubtext)),
                      Text(_fmtTime(e.at),
                          style: TextStyle(
                              fontSize: 11,
                              fontWeight: first ? FontWeight.w700 : FontWeight.w500,
                              color: first ? AppColors.text : _kSubtext)),
                    ]),
              ),
              const SizedBox(width: 10),
              // Dot + line
              Column(children: [
                Icon(icon, size: 18, color: color),
                if (!last)
                  Expanded(child: Container(width: 2, color: _kBorder)),
              ]),
              const SizedBox(width: 10),
              Expanded(
                child: Padding(
                  padding: EdgeInsets.only(bottom: last ? 0 : 18),
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(e.title,
                            style: TextStyle(
                                fontSize: 13,
                                fontWeight:
                                    first ? FontWeight.w800 : FontWeight.w600,
                                color: e.isProblem
                                    ? AppColors.error
                                    : first
                                        ? _kPrimary
                                        : AppColors.text)),
                        if (e.description != null) ...[
                          const SizedBox(height: 2),
                          Text(e.description!,
                              style: const TextStyle(
                                  fontSize: 12, color: _kSubtext)),
                        ],
                        if (meta.isNotEmpty) ...[
                          const SizedBox(height: 2),
                          Text(meta,
                              style: const TextStyle(
                                  fontSize: 11, color: _kSubtext)),
                        ],
                      ]),
                ),
              ),
            ]),
          );
        }),
      ]),
    );
  }
}

class _Card extends StatelessWidget {
  const _Card({required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) => Container(
        width: double.infinity,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: _kBorder),
        ),
        child: child,
      );
}

class _ErrorView extends StatelessWidget {
  const _ErrorView({required this.message, required this.onRetry});
  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) => Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            const Icon(Icons.local_shipping_outlined, size: 40, color: _kSubtext),
            const SizedBox(height: 8),
            Text(message, textAlign: TextAlign.center),
            const SizedBox(height: 12),
            OutlinedButton(onPressed: onRetry, child: const Text('Try again')),
          ]),
        ),
      );
}
