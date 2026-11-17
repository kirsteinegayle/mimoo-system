import 'package:flutter/material.dart';

/// Profile picture with a clean fallback: the photo when the URL loads,
/// otherwise the initials in a colored circle (never a broken image).
/// URLs come from the API (App\Support\AvatarUrl on the server).
class UserAvatar extends StatelessWidget {
  const UserAvatar({
    super.key,
    required this.url,
    required this.name,
    this.size = 40,
    this.border,
  });

  final String? url;
  final String name;
  final double size;
  final BoxBorder? border;

  static const _colors = <Color>[
    Color(0xFF8B5CF6),
    Color(0xFF0EA5E9),
    Color(0xFF10B981),
    Color(0xFFF59E0B),
    Color(0xFFF43F5E),
    Color(0xFF6366F1),
    Color(0xFF14B8A6),
    Color(0xFFD946EF),
  ];

  static String initials(String name) {
    final parts =
        name.trim().split(RegExp(r'\s+')).where((p) => p.isNotEmpty).toList();
    if (parts.isEmpty) return '?';
    final first = parts.first.characters.first;
    final last = parts.length > 1 ? parts.last.characters.first : '';
    return (first + last).toUpperCase();
  }

  static Color colorFor(String name) {
    var h = 0;
    for (final c in name.trim().toLowerCase().codeUnits) {
      h = (h * 31 + c) & 0x7fffffff;
    }
    return _colors[h % _colors.length];
  }

  @override
  Widget build(BuildContext context) {
    final fallback = Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      color: colorFor(name),
      child: Text(
        initials(name),
        style: TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.w700,
          fontSize: size * 0.38,
        ),
      ),
    );
    final u = url?.trim() ?? '';
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(shape: BoxShape.circle, border: border),
      child: ClipOval(
        child: u.isEmpty
            ? fallback
            : Image.network(
                u,
                width: size,
                height: size,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => fallback,
                loadingBuilder: (_, child, progress) =>
                    progress == null ? child : fallback,
              ),
      ),
    );
  }
}
