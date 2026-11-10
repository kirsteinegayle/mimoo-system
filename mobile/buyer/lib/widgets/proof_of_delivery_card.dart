import 'dart:typed_data';

import 'package:flutter/material.dart';

import '../services/api_service.dart';
import '../services/order_repository.dart';
import '../theme/app_theme.dart';

const _kPrimary = AppColors.primary;
const _kBorder = AppColors.border;
const _kSubtext = AppColors.textMuted;

/// "Proof of delivery" thumbnail (GET /buyer/orders/{id}/pod-photo).
///
/// The order detail API does not say whether a POD exists, so this asks the
/// route directly: 200 → show the photo (tap to enlarge), 404 → hide the whole
/// section. Shows a small loading row while fetching and a retry row on other
/// errors. The photo is kept in memory only.
class ProofOfDeliveryCard extends StatefulWidget {
  const ProofOfDeliveryCard({super.key, required this.orderId});
  final int orderId;

  @override
  State<ProofOfDeliveryCard> createState() => _ProofOfDeliveryCardState();
}

class _ProofOfDeliveryCardState extends State<ProofOfDeliveryCard> {
  Uint8List? _bytes;
  bool _loading = true;
  bool _none = false;
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
      final bytes = await OrderRepository.instance.fetchPodPhoto(widget.orderId);
      if (!mounted) return;
      setState(() {
        _bytes = bytes;
        _none = bytes == null || bytes.isEmpty;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e is ApiException
          ? ApiService.friendlyError(e)
          : 'Could not load the proof of delivery photo.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _enlarge() {
    final bytes = _bytes;
    if (bytes == null) return;
    showDialog<void>(
      context: context,
      barrierColor: Colors.black87,
      builder: (ctx) => Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.all(12),
        child: Stack(
          children: [
            InteractiveViewer(
              minScale: 1,
              maxScale: 4,
              child: Center(
                child: Image.memory(bytes,
                    fit: BoxFit.contain,
                    errorBuilder: (_, __, ___) => const _BrokenImage(size: 64)),
              ),
            ),
            Positioned(
              top: 4,
              right: 4,
              child: IconButton(
                tooltip: 'Close',
                onPressed: () => Navigator.of(ctx).pop(),
                icon: const Icon(Icons.close, color: Colors.white),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (!_loading && _error == null && _none) return const SizedBox.shrink();

    Widget body;
    if (_loading) {
      body = const Row(children: [
        SizedBox(
            width: 16,
            height: 16,
            child: CircularProgressIndicator(strokeWidth: 2)),
        SizedBox(width: 10),
        Text('Loading proof of delivery…',
            style: TextStyle(fontSize: 13, color: _kSubtext)),
      ]);
    } else if (_error != null) {
      body = Row(children: [
        Expanded(
          child: Text(_error!,
              style: const TextStyle(fontSize: 13, color: _kSubtext)),
        ),
        TextButton(onPressed: _load, child: const Text('Retry')),
      ]);
    } else {
      body = Row(children: [
        GestureDetector(
          onTap: _enlarge,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Image.memory(_bytes!,
                width: 72,
                height: 72,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => const _BrokenImage(size: 72)),
          ),
        ),
        const SizedBox(width: 12),
        const Expanded(
          child: Text('Photo taken by your rider at delivery. Tap to enlarge.',
              style: TextStyle(fontSize: 13, color: _kSubtext)),
        ),
      ]);
    }

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(children: [
            Icon(Icons.verified_outlined, size: 18, color: _kPrimary),
            SizedBox(width: 6),
            Text('Proof of delivery',
                style: TextStyle(fontWeight: FontWeight.w700)),
          ]),
          const SizedBox(height: 10),
          body,
        ],
      ),
    );
  }
}

class _BrokenImage extends StatelessWidget {
  const _BrokenImage({required this.size});
  final double size;

  @override
  Widget build(BuildContext context) => Container(
        width: size,
        height: size,
        color: AppColors.chip,
        child: const Icon(Icons.broken_image_outlined, color: _kSubtext),
      );
}
