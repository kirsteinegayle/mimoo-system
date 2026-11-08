import 'dart:typed_data';

import 'package:flutter/material.dart';

import '../../services/api_service.dart';
import '../../services/return_repository.dart';
import '../../services/review_repository.dart' show PickedImage;
import '../../utils/image_pick.dart';

const _kPrimary = Color(0xFF34175B);
const _kSecondary = Color(0xFF6B38D4);
const _kBorder = Color(0xFFDDD8F0);
const _kSubtext = Color(0xFF8A84A3);

String returnStatusLabel(String s) {
  switch (s) {
    case 'pending':
      return 'Pending seller review';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'escalated':
      return 'Escalated to mimoo';
    case 'refunded':
      return 'Refunded';
    case 'closed':
      return 'Closed';
    default:
      return s;
  }
}

Color returnStatusColor(String s) {
  switch (s) {
    case 'approved':
    case 'refunded':
      return const Color(0xFF1DB966);
    case 'rejected':
      return Colors.red.shade600;
    case 'escalated':
      return const Color(0xFFFF6B00);
    default:
      return _kSecondary;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Request form
// ─────────────────────────────────────────────────────────────────────────────

class ReturnRequestFormPage extends StatefulWidget {
  const ReturnRequestFormPage(
      {super.key, required this.orderId, required this.orderNumber});
  final int orderId;
  final String orderNumber;

  @override
  State<ReturnRequestFormPage> createState() => _ReturnRequestFormPageState();
}

class _ReturnRequestFormPageState extends State<ReturnRequestFormPage> {
  String? _reason;
  final _desc = TextEditingController();
  final List<PickedImage> _images = [];
  bool _sending = false;
  String? _error;

  @override
  void dispose() {
    _desc.dispose();
    super.dispose();
  }

  Future<void> _addPhotos() async {
    final res = await pickImages(remaining: 5 - _images.length);
    if (!mounted) return;
    setState(() => _images.addAll(res.images));
    if (res.warning != null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(res.warning!), behavior: SnackBarBehavior.floating));
    }
  }

  Future<void> _submit() async {
    final d = _desc.text.trim();
    String? err;
    if (_reason == null) {
      err = 'Please select a reason.';
    } else if (d.length < 10) {
      err = 'Description must be at least 10 characters.';
    } else if (_images.isEmpty) {
      err = 'Please add at least 1 photo.';
    }
    if (err != null) {
      setState(() => _error = err);
      return;
    }
    setState(() {
      _sending = true;
      _error = null;
    });
    try {
      final rr = await ReturnRepository.instance.submit(
        orderId: widget.orderId,
        reason: _reason!,
        description: d,
        images: _images,
      );
      if (!mounted) return;
      await Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => ReturnStatusPage(returnId: rr.id)),
      );
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _error = e.errors?.values.first.first ?? e.message);
    } catch (_) {
      if (!mounted) return;
      setState(() => _error = 'Could not submit. Check your connection and try again.');
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Request Return'),
        backgroundColor: Colors.white,
        foregroundColor: _kPrimary,
        elevation: 0.5,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('Order ${widget.orderNumber}',
              style: const TextStyle(fontWeight: FontWeight.w700)),
          const SizedBox(height: 4),
          const Text(
              'Returns can be requested within 7 days. One open request per order.',
              style: TextStyle(fontSize: 12, color: _kSubtext)),
          const SizedBox(height: 16),
          const Text('Reason', style: TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 6),
          Wrap(
            spacing: 8,
            runSpacing: 4,
            children: ReturnRepository.reasons
                .map((r) => ChoiceChip(
                      label: Text(r),
                      selected: _reason == r,
                      onSelected: (_) => setState(() => _reason = r),
                    ))
                .toList(),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _desc,
            maxLength: 500,
            maxLines: 5,
            decoration: InputDecoration(
              labelText: 'Describe the problem (10–500 characters)',
              alignLabelWithHint: true,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
            ),
          ),
          Text('Photos (${_images.length}/5, at least 1)',
              style: const TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Wrap(spacing: 8, runSpacing: 8, children: [
            ..._images.asMap().entries.map((e) => Stack(children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.memory(Uint8List.fromList(e.value.bytes),
                        width: 72, height: 72, fit: BoxFit.cover),
                  ),
                  Positioned(
                    right: 0,
                    top: 0,
                    child: GestureDetector(
                      onTap: () => setState(() => _images.removeAt(e.key)),
                      child: const CircleAvatar(
                          radius: 10,
                          backgroundColor: Colors.black54,
                          child: Icon(Icons.close, size: 12, color: Colors.white)),
                    ),
                  ),
                ])),
            if (_images.length < 5)
              InkWell(
                onTap: _sending ? null : _addPhotos,
                child: Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    border: Border.all(color: _kBorder),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.add_a_photo_outlined, color: _kSubtext),
                ),
              ),
          ]),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Text(_error!, style: const TextStyle(color: Colors.red)),
            ),
          const SizedBox(height: 20),
          FilledButton(
            style: FilledButton.styleFrom(
                backgroundColor: _kSecondary,
                minimumSize: const Size.fromHeight(48)),
            onPressed: _sending ? null : _submit,
            child: _sending
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: Colors.white))
                : const Text('Submit Request'),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Status page
// ─────────────────────────────────────────────────────────────────────────────

class ReturnStatusPage extends StatefulWidget {
  const ReturnStatusPage({super.key, required this.returnId});
  final int returnId;

  @override
  State<ReturnStatusPage> createState() => _ReturnStatusPageState();
}

class _ReturnStatusPageState extends State<ReturnStatusPage> {
  ReturnRequestInfo? _rr;
  bool _loading = true;
  bool _escalating = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final rr = await ReturnRepository.instance.show(widget.returnId);
      if (!mounted) return;
      setState(() => _rr = rr);
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _error = e.message);
    } catch (_) {
      if (!mounted) return;
      setState(() => _error = 'Could not load. Check your connection.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _escalate() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Escalate request?'),
        content: const Text(
            'mimoo will review your request and the seller\'s response. You can escalate only once.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancel')),
          TextButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('Escalate')),
        ],
      ),
    );
    if (ok != true) return;
    setState(() => _escalating = true);
    try {
      final rr = await ReturnRepository.instance.escalate(widget.returnId);
      if (!mounted) return;
      setState(() => _rr = rr);
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Your request was escalated for review.'),
        behavior: SnackBarBehavior.floating,
      ));
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(e.message),
        backgroundColor: Colors.red.shade700,
        behavior: SnackBarBehavior.floating,
      ));
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: const Text('Something went wrong. Please try again.'),
        backgroundColor: Colors.red.shade700,
        behavior: SnackBarBehavior.floating,
      ));
    } finally {
      if (mounted) setState(() => _escalating = false);
    }
  }

  String _fmt(DateTime? d) => d == null
      ? ''
      : '${d.toLocal().year}-${d.toLocal().month.toString().padLeft(2, '0')}-${d.toLocal().day.toString().padLeft(2, '0')}';

  @override
  Widget build(BuildContext context) {
    final rr = _rr;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Return Request'),
        backgroundColor: Colors.white,
        foregroundColor: _kPrimary,
        elevation: 0.5,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null || rr == null
              ? Center(
                  child: Column(mainAxisSize: MainAxisSize.min, children: [
                    Text(_error ?? 'Not found.'),
                    const SizedBox(height: 8),
                    OutlinedButton(onPressed: _load, child: const Text('Retry')),
                  ]),
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: returnStatusColor(rr.status).withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(children: [
                          Icon(Icons.assignment_return_outlined,
                              color: returnStatusColor(rr.status)),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(returnStatusLabel(rr.status),
                                    style: TextStyle(
                                        fontWeight: FontWeight.w800,
                                        color: returnStatusColor(rr.status))),
                                Text('Order ${rr.orderNumber} · requested ${_fmt(rr.createdAt)}',
                                    style: const TextStyle(
                                        fontSize: 12, color: _kSubtext)),
                              ],
                            ),
                          ),
                        ]),
                      ),
                      const SizedBox(height: 16),
                      _row('Reason', rr.reason),
                      _row('Description', rr.description),
                      const SizedBox(height: 8),
                      SizedBox(
                        height: 72,
                        child: ListView.separated(
                          scrollDirection: Axis.horizontal,
                          itemCount: rr.images.length,
                          separatorBuilder: (_, __) => const SizedBox(width: 8),
                          itemBuilder: (_, i) => ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.network(rr.images[i],
                                width: 72,
                                height: 72,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => Container(
                                    width: 72,
                                    height: 72,
                                    color: const Color(0xFFEFE9FD))),
                          ),
                        ),
                      ),
                      const Divider(height: 32),
                      const Text('Seller response',
                          style: TextStyle(fontWeight: FontWeight.w700)),
                      const SizedBox(height: 6),
                      Text(
                        rr.sellerResponse?.isNotEmpty == true
                            ? rr.sellerResponse!
                            : 'Waiting for the seller to respond.',
                        style: TextStyle(
                            color: rr.sellerResponse?.isNotEmpty == true
                                ? null
                                : _kSubtext),
                      ),
                      if (rr.respondedAt != null)
                        Text('Responded ${_fmt(rr.respondedAt)}',
                            style: const TextStyle(fontSize: 11, color: _kSubtext)),
                      if (rr.escalatedAt != null)
                        Padding(
                          padding: const EdgeInsets.only(top: 8),
                          child: Text('Escalated ${_fmt(rr.escalatedAt)}',
                              style: const TextStyle(fontSize: 12, color: _kSubtext)),
                        ),
                      const SizedBox(height: 20),
                      if (rr.canEscalate)
                        FilledButton.icon(
                          style: FilledButton.styleFrom(
                              backgroundColor: const Color(0xFFFF6B00),
                              minimumSize: const Size.fromHeight(48)),
                          onPressed: _escalating ? null : _escalate,
                          icon: const Icon(Icons.campaign_outlined),
                          label: Text(_escalating ? 'Escalating…' : 'Escalate to mimoo'),
                        ),
                      if (rr.status == 'rejected' && !rr.canEscalate && rr.escalatedAt == null)
                        const Text('The 3-day escalation period has ended.',
                            style: TextStyle(fontSize: 12, color: _kSubtext)),
                    ],
                  ),
                ),
    );
  }

  Widget _row(String k, String v) => Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(k, style: const TextStyle(fontSize: 12, color: _kSubtext)),
            const SizedBox(height: 2),
            Text(v), // plain text
          ],
        ),
      );
}

// ─────────────────────────────────────────────────────────────────────────────
// All return requests (Account → Returns)
// ─────────────────────────────────────────────────────────────────────────────

class ReturnsListPage extends StatefulWidget {
  const ReturnsListPage({super.key});

  @override
  State<ReturnsListPage> createState() => _ReturnsListPageState();
}

class _ReturnsListPageState extends State<ReturnsListPage> {
  List<ReturnRequestInfo> _items = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final list = await ReturnRepository.instance.list();
      if (!mounted) return;
      setState(() => _items = list);
    } catch (e) {
      if (!mounted) return;
      setState(() => _error =
          e is ApiException ? e.message : 'Could not load. Check your connection.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Returns & Refunds'),
        backgroundColor: Colors.white,
        foregroundColor: _kPrimary,
        elevation: 0.5,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(mainAxisSize: MainAxisSize.min, children: [
                    Text(_error!),
                    const SizedBox(height: 8),
                    OutlinedButton(onPressed: _load, child: const Text('Retry')),
                  ]),
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  child: _items.isEmpty
                      ? ListView(children: const [
                          SizedBox(height: 120),
                          Icon(Icons.assignment_return_outlined,
                              size: 56, color: _kSubtext),
                          SizedBox(height: 12),
                          Center(child: Text('No return requests.')),
                        ])
                      : ListView.separated(
                          padding: const EdgeInsets.all(16),
                          itemCount: _items.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 8),
                          itemBuilder: (_, i) {
                            final r = _items[i];
                            return ListTile(
                              tileColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  side: const BorderSide(color: _kBorder)),
                              title: Text('Order ${r.orderNumber}',
                                  style: const TextStyle(fontWeight: FontWeight.w700)),
                              subtitle: Text(r.reason),
                              trailing: Text(returnStatusLabel(r.status),
                                  style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w700,
                                      color: returnStatusColor(r.status))),
                              onTap: () async {
                                await Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                      builder: (_) => ReturnStatusPage(returnId: r.id)),
                                );
                                _load();
                              },
                            );
                          },
                        ),
                ),
    );
  }
}
