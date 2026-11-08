import 'package:flutter/material.dart';

import 'api_service.dart';

/// A buyer category. [name] is the EXACT value stored in products.category
/// (the server filters with an exact match), so it must never be shortened.
class BuyerCategory {
  const BuyerCategory(this.name, this.icon, {this.productCount});
  final String name;
  final IconData icon;
  final int? productCount;
}

/// Same 12 categories, same order, as the website
/// (resources/js/pages/Homepage.tsx → CATEGORIES).
const kWebCategories = <BuyerCategory>[
  BuyerCategory('Pet Supplies', Icons.pets_outlined),
  BuyerCategory('Electronics and Gadgets', Icons.devices_outlined),
  BuyerCategory("Women's Apparel", Icons.woman_outlined),
  BuyerCategory("Men's Apparel", Icons.man_outlined),
  BuyerCategory('Kids and Baby', Icons.child_friendly_outlined),
  BuyerCategory('Home and Garden', Icons.yard_outlined),
  BuyerCategory('Sports and Outdoors', Icons.directions_run_outlined),
  BuyerCategory('Health and Beauty', Icons.health_and_safety_outlined),
  BuyerCategory('Books and Media', Icons.menu_book_outlined),
  BuyerCategory('Food and Gourmet', Icons.restaurant_outlined),
  BuyerCategory('Furniture and Office Equipment', Icons.chair_outlined),
  BuyerCategory('Jewelry and Watches', Icons.diamond_outlined),
];

class CategoryRepository {
  CategoryRepository._();
  static final CategoryRepository instance = CategoryRepository._();

  /// Web categories (in web order) with product counts from
  /// GET /api/buyer/categories, plus any extra category that exists in the
  /// database but not on the web list. Falls back to the web list offline.
  Future<List<BuyerCategory>> fetch() async {
    try {
      final res = await ApiService.get('/buyer/categories', includeAuth: false)
          as Map<String, dynamic>;
      final counts = <String, int>{
        for (final r in (res['data'] as List<dynamic>? ?? []))
          (r as Map)['name'] as String: (r['product_count'] as num?)?.toInt() ?? 0,
      };
      final out = kWebCategories
          .map((c) => BuyerCategory(c.name, c.icon, productCount: counts[c.name] ?? 0))
          .toList();
      final known = kWebCategories.map((c) => c.name).toSet();
      for (final e in counts.entries) {
        if (!known.contains(e.key)) {
          out.add(BuyerCategory(e.key, Icons.category_outlined, productCount: e.value));
        }
      }
      return out;
    } catch (_) {
      return kWebCategories;
    }
  }
}
