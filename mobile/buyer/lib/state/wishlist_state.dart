import 'package:flutter/material.dart';
import '../models/product.dart';
import '../models/wishlist_item.dart';
import '../services/wishlist_repository.dart';
import '../services/api_service.dart';

/// Wishlist state that is a cache of the server wishlist when the user is
/// logged in, and an empty local-only wishlist when logged out.
///
/// Public API (toggle, contains, count, items) is preserved so all existing
/// callers keep compiling. `toggle()` now calls the API when logged in and
/// uses optimistic update with rollback on failure.
class WishlistState extends ChangeNotifier {
  // ── Server-backed items (populated when logged in) ────────────────────────
  final List<WishlistItem> _serverItems = [];

  /// Local fallback items for logged-out users (no server sync).
  final List<Product> _localItems = [];

  bool _isLoggedIn = false;
  bool _loading = false;
  String? _lastError;

  // Set of product IDs currently being mutated (prevents double-tap race)
  final Set<int> _inFlight = {};

  // ── Public read-only accessors ────────────────────────────────────────────

  bool get isLoggedIn => _isLoggedIn;
  bool get loading => _loading;
  String? get lastError => _lastError;

  /// Server items (when logged in) — use [serverItems] for the rich model.
  List<WishlistItem> get serverItems => List.unmodifiable(_serverItems);

  /// Compatibility: returns local items when logged out, empty when logged in.
  /// Use [serverItems] for the real data when logged in.
  List<Product> get items => List.unmodifiable(_localItems);

  int get count => _isLoggedIn ? _serverItems.length : _localItems.length;

  /// Optimistic state: product IDs that are in the wishlist (local + server).
  /// This is updated immediately on toggle, before the API call completes.
  final Set<int> _wishlistedIds = {};

  /// Returns true if [product] is in the wishlist.
  /// When logged in, checks the server-backed ID set.
  /// When logged out, checks the local list.
  bool contains(Product product) => _isLoggedIn
      ? _wishlistedIds.contains(product.id)
      : _localItems.any((p) => p.id == product.id);

  bool isInFlight(int productId) => _inFlight.contains(productId);

  // ── Session lifecycle (called by AuthService hooks) ───────────────────────

  /// Call after login / restoreSession to load the server wishlist.
  Future<void> onLogin() async {
    _isLoggedIn = true;
    _localItems.clear();
    await _fetchFromServer();
  }

  /// Call on logout to wipe local cache.
  void onLogout() {
    _isLoggedIn = false;
    _serverItems.clear();
    _localItems.clear();
    _wishlistedIds.clear();
    _inFlight.clear();
    _lastError = null;
    notifyListeners();
  }

  // ── Server fetch ──────────────────────────────────────────────────────────

  Future<void> _fetchFromServer() async {
    if (!_isLoggedIn) return;
    _loading = true;
    notifyListeners();
    try {
      final result = await WishlistRepository.instance.fetchWishlist();
      _serverItems
        ..clear()
        ..addAll(result);
      _wishlistedIds
        ..clear()
        ..addAll(result.map((e) => e.productId));
      _lastError = null;
    } on ApiException catch (e) {
      _lastError = e.message;
    } catch (_) {
      _lastError = 'Could not load wishlist.';
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  /// Force refresh (e.g. pull-to-refresh on wishlist page).
  Future<void> refresh() => _fetchFromServer();

  // ── Mutating methods ──────────────────────────────────────────────────────

  /// Toggle [product] in/out of the wishlist.
  /// When logged in: calls the API with optimistic update + rollback.
  /// When logged out: modifies the local list only.
  Future<void> toggle(Product product) async {
    if (_isLoggedIn) {
      final isCurrentlyWishlisted = _wishlistedIds.contains(product.id);
      if (isCurrentlyWishlisted) {
        await _removeFromServer(product.id);
      } else {
        await _addToServer(product.id);
      }
    } else {
      if (_localItems.any((p) => p.id == product.id)) {
        _localItems.removeWhere((p) => p.id == product.id);
      } else {
        _localItems.add(product);
      }
      notifyListeners();
    }
  }

  /// Remove [product] from the wishlist.
  Future<void> remove(Product product) async {
    if (_isLoggedIn) {
      await _removeFromServer(product.id);
    } else {
      _localItems.removeWhere((p) => p.id == product.id);
      notifyListeners();
    }
  }

  /// Remove multiple products at once (for the "select + remove" flow).
  Future<void> removeAll(List<Product> products) async {
    if (_isLoggedIn) {
      for (final p in products) {
        await _removeFromServer(p.id);
      }
    } else {
      for (final p in products) {
        _localItems.removeWhere((item) => item.id == p.id);
      }
      notifyListeners();
    }
  }

  /// Clear the entire wishlist (local only — no bulk delete API).
  void clear() {
    _localItems.clear();
    notifyListeners();
  }

  // ── Internal server mutations ────────────────────────────────────────────

  Future<void> _addToServer(int productId) async {
    if (_inFlight.contains(productId)) return;
    _inFlight.add(productId);

    // Optimistic: add to wishlist immediately
    _wishlistedIds.add(productId);
    notifyListeners();

    try {
      await WishlistRepository.instance.add(productId);
      // Refresh to get the full item data (name, image, price, etc.)
      await _fetchFromServer();
    } on ApiException catch (e) {
      // Rollback
      _wishlistedIds.remove(productId);
      _lastError = e.message;
      notifyListeners();
    } catch (_) {
      _wishlistedIds.remove(productId);
      _lastError = 'Could not add to wishlist.';
      notifyListeners();
    } finally {
      _inFlight.remove(productId);
    }
  }

  Future<void> _removeFromServer(int productId) async {
    if (_inFlight.contains(productId)) return;
    _inFlight.add(productId);

    // Optimistic: remove immediately
    _wishlistedIds.remove(productId);
    _serverItems.removeWhere((e) => e.productId == productId);
    notifyListeners();

    try {
      await WishlistRepository.instance.remove(productId);
      // No need to re-fetch — we already removed locally
    } on ApiException catch (e) {
      // Rollback: re-add to IDs, but we'd need to re-fetch for the full item
      _wishlistedIds.add(productId);
      _lastError = e.message;
      await _fetchFromServer();
    } catch (_) {
      _wishlistedIds.add(productId);
      _lastError = 'Could not remove from wishlist.';
      await _fetchFromServer();
    } finally {
      _inFlight.remove(productId);
    }
  }

  // ── Error helper ──────────────────────────────────────────────────────────

  /// Consume and return the last server error, then clear it.
  String? consumeError() {
    final e = _lastError;
    _lastError = null;
    return e;
  }
}
