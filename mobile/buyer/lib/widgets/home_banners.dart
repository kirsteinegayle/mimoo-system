import 'dart:async';
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

/// Homepage banners from Admin > Banner Management (GET /api/banners, hero slot): auto-sliding carousel,
/// tap runs [onLink] when the banner has a link, a skeleton while loading, and nothing at all when
/// there are no live banners or the request fails (the home screen just starts at the categories).
class HomeBanners extends StatefulWidget {
  const HomeBanners({super.key, this.onLink});

  /// Receives the banner's link, e.g. `/category/Pet%20Supplies`.
  final void Function(String link)? onLink;

  @override
  State<HomeBanners> createState() => _HomeBannersState();
}

class _Banner {
  const _Banner({required this.title, required this.image, this.link});
  final String title;
  final String image;
  final String? link;
}

class _HomeBannersState extends State<HomeBanners> {
  static const double _height = 190;

  final PageController _page = PageController();
  List<_Banner> _banners = [];
  bool _loading = true;
  int _index = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _page.dispose();
    super.dispose();
  }

  /// `/storage/...` and `/images/...` come back as server paths; make them absolute.
  String _abs(String path) {
    if (path.startsWith('http')) return path;
    final origin = ApiService.baseUrl.replaceAll(RegExp(r'/api$'), '');
    return '$origin${path.startsWith('/') ? '' : '/'}$path';
  }

  Future<void> _load() async {
    try {
      final res = await ApiService.get('/banners', includeAuth: false) as Map<String, dynamic>;
      final hero = ((res['data'] as Map<String, dynamic>?)?['hero'] as List<dynamic>?) ?? const [];
      final list = hero
          .whereType<Map>()
          .where((b) => (b['image'] ?? '').toString().isNotEmpty)
          .map((b) => _Banner(
                title: (b['title'] ?? '').toString(),
                image: _abs(b['image'].toString()),
                link: (b['link_url'] as String?)?.trim().isEmpty ?? true ? null : b['link_url'] as String,
              ))
          .toList();
      if (!mounted) return;
      setState(() {
        _banners = list;
        _loading = false;
      });
      _startAutoSlide();
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false); // empty: no banner area, no error noise
    }
  }

  void _startAutoSlide() {
    _timer?.cancel();
    if (_banners.length < 2) return;
    _timer = Timer.periodic(const Duration(seconds: 5), (_) {
      if (!mounted || !_page.hasClients) return;
      final next = (_index + 1) % _banners.length;
      _page.animateToPage(next, duration: const Duration(milliseconds: 500), curve: Curves.easeInOut);
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Padding(
        padding: const EdgeInsets.fromLTRB(12, 12, 12, 0),
        child: Container(
          height: _height,
          decoration: BoxDecoration(color: AppColors.chip, borderRadius: BorderRadius.circular(18)),
        ),
      );
    }
    if (_banners.isEmpty) return const SizedBox.shrink();

    return Column(children: [
      SizedBox(
        height: _height,
        child: PageView.builder(
          controller: _page,
          itemCount: _banners.length,
          onPageChanged: (i) => setState(() => _index = i),
          itemBuilder: (_, i) {
            final b = _banners[i];
            return Padding(
              padding: const EdgeInsets.fromLTRB(12, 12, 12, 0),
              child: Semantics(
                label: b.title,
                button: b.link != null,
                child: InkWell(
                  borderRadius: BorderRadius.circular(18),
                  onTap: b.link == null ? null : () => widget.onLink?.call(b.link!),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(18),
                    child: Image.network(
                      b.image,
                      fit: BoxFit.cover,
                      width: double.infinity,
                      height: _height,
                      errorBuilder: (_, __, ___) => Container(color: AppColors.chip, alignment: Alignment.center, child: const Icon(Icons.image_not_supported_outlined, color: AppColors.accent)),
                      loadingBuilder: (c, child, p) => p == null ? child : Container(color: AppColors.chip),
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ),
      if (_banners.length > 1) ...[
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(_banners.length, (i) {
            final active = i == _index;
            return AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              margin: const EdgeInsets.symmetric(horizontal: 3),
              width: active ? 24 : 8,
              height: 4,
              decoration: BoxDecoration(
                color: active ? AppColors.accent : AppColors.outlineVariant,
                borderRadius: BorderRadius.circular(9999),
              ),
            );
          }),
        ),
      ],
    ]);
  }
}
