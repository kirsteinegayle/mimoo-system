import 'package:flutter/material.dart';
import '../models/product.dart';
import '../models/cart_item.dart';
import '../models/db_cart_item.dart';
import '../services/cart_repository.dart';
import '../services/api_service.dart';

/// Cart state that is a cache of the server cart when the user is logged in,
/// and an empty local-only cart when logged out.
///
/// Public method names (add, remove, increment, decrement, clear, contains,
/// totalPrice) are kept so all existing callers keep compiling.
/// The mutating methods return [Future<void>] so callers can await them, but
/// existing callers that don't await them also compile fine.
class CartState extends ChangeNotifier {
  // ── Server-backed items (populated when logged in) ────────────────────────
  final List<DbCartItem> _dbItems = [];

  /// Local fallback items for logged-out users (no server sync).
  final List<CartItem> _localItems = [];

  bool _isLoggedIn = false;
  bool _loading = false;
  String? _lastError; // last server error message, shown then cleared
  // Set of item IDs currently being mutated (for disabling +/- during request)
  final Set<int> _inFlight = {};

  // ── Public read-only accessors ────────────────────────────────────────────

  bool get isLoggedIn => _isLoggedIn;
  bool get loading => _loading;
  String? get lastError => _lastError;

  List<DbCartItem> get dbItems => List.unmodifiable(_dbItems);
  List<CartItem> get items => List.unmodifiable(_localItems); // compat

  bool isInFlight(int itemId) => _inFlight.contains(itemId);

  int get totalCount => _isLoggedIn
      ? _dbItems.fold(0, (s, i) => s + i.quantity)
      : _localItems.fold(0, (s, i) => s + i.quantity);

  /// Number of distinct cart lines — same as the web navbar cart badge
  /// (Cart::total_items = items()->count()).
  int get lineCount => _isLoggedIn ? _dbItems.length : _localItems.length;

  double get totalPrice => _isLoggedIn
      ? _dbItems.fold(0.0, (s, i) => s + i.lineTotal)
      : _localItems.fold(0.0, (s, i) => s + i.product.price * i.quantity);

  bool contains(Product product) => _isLoggedIn
      ? _dbItems.any((i) => i.productId == product.id)
      : _localItems.any((i) => i.product.id == product.id);

  // ── Session lifecycle (called by AuthService hooks) ───────────────────────

  /// Call after login / restoreSession to load the server cart.
  Future<void> onLogin() async {
    _isLoggedIn = true;
    _localItems.clear();
    await _fetchFromServer();
  }

  /// Call on logout to wipe local cache.
  void onLogout() {
    _isLoggedIn = false;
    _dbItems.clear();
    _localItems.clear();
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
      final result = await CartRepository.instance.fetchCart();
      _dbItems
        ..clear()
        ..addAll(result.items);
      _lastError = null;
    } on ApiException catch (e) {
      _lastError = e.message;
    } catch (_) {
      _lastError = 'Could not load cart.';
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  /// Force refresh (e.g. pull-to-refresh on cart page).
  Future<void> refresh() => _fetchFromServer();

  // ── Mutating methods (keep original signatures) ───────────────────────────

  /// Add [product] to the cart. For logged-in users: calls the API.
  /// For guests: adds to the local list (gate is in the UI layer).
  Future<void> add(Product product,
      {String? variantId, int quantity = 1}) async {
    if (!_isLoggedIn) {
      final existing = _localItems.where((i) => i.product.id == product.id);
      if (existing.isNotEmpty) {
        existing.first.quantity += quantity;
      } else {
        _localItems.add(CartItem(product: product, quantity: quantity));
      }
      notifyListeners();
      return;
    }

    // Optimistic: show loading
    _loading = true;
    notifyListeners();
    try {
      await CartRepository.instance.addItem(
        productId: product.id,
        quantity: quantity,
        variantId: variantId,
      );
      await _fetchFromServer();
    } on ApiException catch (e) {
      _lastError = e.message;
      _loading = false;
      notifyListeners();
    } catch (_) {
      _lastError = 'Could not add to cart.';
      _loading = false;
      notifyListeners();
    }
  }

  /// Remove a product from cart (by productId match).
  Future<void> remove(Product product) async {
    if (!_isLoggedIn) {
      _localItems.removeWhere((i) => i.product.id == product.id);
      notifyListeners();
      return;
    }
    final item = _dbItems.where((i) => i.productId == product.id).firstOrNull;
    if (item == null) return;
    await removeById(item.id);
  }

  /// Remove a specific DB cart item by its server ID.
  Future<void> removeById(int itemId) async {
    if (!_isLoggedIn) return;
    _inFlight.add(itemId);
    notifyListeners();
    try {
      await CartRepository.instance.removeItem(itemId);
      _dbItems.removeWhere((i) => i.id == itemId);
      _lastError = null;
    } on ApiException catch (e) {
      _lastError = e.message;
    } catch (_) {
      _lastError = 'Could not remove item.';
    } finally {
      _inFlight.remove(itemId);
      notifyListeners();
    }
  }

  /// Increment quantity by 1.
  Future<void> increment(Product product) async {
    if (!_isLoggedIn) {
      _localItems.firstWhere((i) => i.product.id == product.id).quantity++;
      notifyListeners();
      return;
    }
    final item = _dbItems.where((i) => i.productId == product.id).firstOrNull;
    if (item == null) return;
    await _setQuantity(item, item.quantity + 1);
  }

  /// Decrement quantity by 1; removes item when it reaches 0.
  Future<void> decrement(Product product) async {
    if (!_isLoggedIn) {
      final local =
          _localItems.where((i) => i.product.id == product.id).firstOrNull;
      if (local == null) return;
      if (local.quantity > 1) {
        local.quantity--;
      } else {
        _localItems.remove(local);
      }
      notifyListeners();
      return;
    }
    final item = _dbItems.where((i) => i.productId == product.id).firstOrNull;
    if (item == null) return;
    if (item.quantity <= 1) {
      await removeById(item.id);
    } else {
      await _setQuantity(item, item.quantity - 1);
    }
  }

  /// Increment a DB item by its server ID (for cart page which knows the ID).
  Future<void> incrementById(int itemId) async {
    final item = _dbItems.where((i) => i.id == itemId).firstOrNull;
    if (item == null) return;
    await _setQuantity(item, item.quantity + 1);
  }

  /// Decrement a DB item by its server ID.
  Future<void> decrementById(int itemId) async {
    final item = _dbItems.where((i) => i.id == itemId).firstOrNull;
    if (item == null) return;
    if (item.quantity <= 1) {
      await removeById(itemId);
    } else {
      await _setQuantity(item, item.quantity - 1);
    }
  }

  Future<void> _setQuantity(DbCartItem item, int newQty) async {
    _inFlight.add(item.id);
    // Optimistic update
    final idx = _dbItems.indexWhere((i) => i.id == item.id);
    if (idx >= 0) {
      _dbItems[idx] = item.copyWith(quantity: newQty);
    }
    notifyListeners();
    try {
      await CartRepository.instance.updateItem(item.id, newQty);
      _lastError = null;
      // Re-fetch to get server-computed line totals
      await _fetchFromServer();
    } on ApiException catch (e) {
      // Roll back optimistic update
      if (idx >= 0) _dbItems[idx] = item;
      _lastError = e.errorFor('quantity') ?? e.message;
    } catch (_) {
      if (idx >= 0) _dbItems[idx] = item;
      _lastError = 'Could not update quantity.';
    } finally {
      _inFlight.remove(item.id);
      notifyListeners();
    }
  }

  /// Clear the entire cart.
  Future<void> clear() async {
    if (!_isLoggedIn) {
      _localItems.clear();
      notifyListeners();
      return;
    }
    _loading = true;
    notifyListeners();
    try {
      await CartRepository.instance.clearCart();
      _dbItems.clear();
      _lastError = null;
    } on ApiException catch (e) {
      _lastError = e.message;
    } catch (_) {
      _lastError = 'Could not clear cart.';
    } finally {
      _loading = false;
      notifyListeners();
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
