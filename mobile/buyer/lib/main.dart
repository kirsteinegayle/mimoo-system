import 'dart:async';

import 'package:flutter/material.dart';
import 'state/auth_service.dart';
import 'state/cart_provider.dart';
import 'state/wishlist_provider.dart';
import 'state/notification_state.dart';
import 'pages/splash_screen.dart';
import 'pages/auth/login_page.dart';
import 'services/api_service.dart';
import 'pages/home/shop_page.dart';
import 'pages/categories/categories_page.dart';
import 'pages/chat/chat_page.dart';
import 'pages/account/account_page.dart';
import 'pages/wishlist/wishlist_page.dart';
import 'utils/animations.dart';
import 'theme/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Wire CartState + WishlistState to AuthService BEFORE restoreSession
  // so the cart and wishlist are loaded whenever a token is found in
  // secure storage.
  AuthService.instance.onLoginCallback = () async {
    await CartProvider.defaultCart.onLogin();
    await WishlistProvider.defaultWishlist.onLogin();
    // In-app notifications: poll unread count every 30 s while open.
    NotificationState.instance.start();
    // Pick up profile edits made on the website (users.name).
    unawaited(AuthService.instance.refreshProfile());
  };
  AuthService.instance.onLogoutCallback = () {
    CartProvider.defaultCart.onLogout();
    WishlistProvider.defaultWishlist.onLogout();
    NotificationState.instance.stop();
  };

  // Any 401 on an authenticated request: clear the saved token and go to the
  // login screen (instead of leaving an "Unauthenticated." error on screen).
  ApiService.onUnauthorized = _handleUnauthorized;

  // The persisted Sanctum session is restored by SplashScreen (first
  // screen) while its animation plays, then it routes to Home or Login.
  runApp(const EcommerceApp());
}

/// Root navigator, used to leave any screen when the session expires.
final GlobalKey<NavigatorState> rootNavigatorKey = GlobalKey<NavigatorState>();

bool _handlingUnauthorized = false;

Future<void> _handleUnauthorized() async {
  if (_handlingUnauthorized) return;
  _handlingUnauthorized = true;
  try {
    await AuthService.instance.clearLocalSession();
    final nav = rootNavigatorKey.currentState;
    if (nav != null) {
      nav.pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const LoginPage()),
        (route) => false,
      );
      final ctx = rootNavigatorKey.currentContext;
      if (ctx != null && ctx.mounted) {
        ScaffoldMessenger.maybeOf(ctx)?.showSnackBar(const SnackBar(
          content: Text('Your session has expired. Please log in again.'),
          behavior: SnackBarBehavior.floating,
        ));
      }
    }
  } finally {
    _handlingUnauthorized = false;
  }
}

class EcommerceApp extends StatelessWidget {
  const EcommerceApp({super.key});

  @override
  Widget build(BuildContext context) {
    return WishlistProvider(
      wishlist: WishlistProvider.defaultWishlist,
      child: CartProvider(
        cart: CartProvider.defaultCart,
        child: MaterialApp(
          navigatorKey: rootNavigatorKey,
          title: 'Mimoo',
          debugShowCheckedModeBanner: false,
          theme: buildAppTheme(),
          home: const SplashScreen(),
        ),
      ),
    );
  }
}

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> with WidgetsBindingObserver {
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    // Show cart + wishlist server errors in a snackbar from the root scaffold
    WidgetsBinding.instance.addObserver(this);
    CartProvider.defaultCart.addListener(_onCartChanged);
    WishlistProvider.defaultWishlist.addListener(_onWishlistChanged);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    CartProvider.defaultCart.removeListener(_onCartChanged);
    WishlistProvider.defaultWishlist.removeListener(_onWishlistChanged);
    super.dispose();
  }

  /// On resume, re-sync data the website may have changed meanwhile
  /// (profile name, server-side cart). Silent on failure.
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && AuthService.instance.isLoggedIn) {
      unawaited(AuthService.instance.refreshProfile());
      unawaited(CartProvider.defaultCart.refresh());
    }
  }

  void _onCartChanged() {
    final error = CartProvider.defaultCart.consumeError();
    if (error != null && mounted) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(error),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 4),
        ));
      });
    }
  }

  void _onWishlistChanged() {
    final error = WishlistProvider.defaultWishlist.consumeError();
    if (error != null && mounted) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(error),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 4),
        ));
      });
    }
  }

  void _openWishlist() {
    final wishlist = WishlistProvider.of(context);
    final cart = CartProvider.of(context);
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => WishlistProvider(
          wishlist: wishlist,
          child: CartProvider(
            cart: cart,
            child: const WishlistPage(),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final cart = CartProvider.of(context);
    final wishlist = WishlistProvider.of(context);

    return AnimatedBuilder(
      animation: Listenable.merge([cart, wishlist]),
      builder: (context, _) => Scaffold(
        body: IndexedStack(
          index: _currentIndex,
          children: const [
            ShopPage(), // 0 — Home
            CategoriesPage(), // 1 — Categories
            ChatPage(), // 2 — Messages
            AccountPage(), // 3 — Account
            // Cart moved to the top header (CartIconButton) on every main tab.
          ],
        ),
        bottomNavigationBar: MimooNavBar(
          currentIndex: _currentIndex,
          onTap: (i) => setState(() => _currentIndex = i),
          items: const [
            MimooNavItem(
              icon: Icons.home_outlined,
              activeIcon: Icons.home_rounded,
              label: 'Home',
            ),
            MimooNavItem(
              icon: Icons.grid_view_outlined,
              activeIcon: Icons.grid_view_rounded,
              label: 'Categories',
            ),
            MimooNavItem(
              icon: Icons.chat_bubble_outline,
              activeIcon: Icons.chat_bubble,
              label: 'Messages',
            ),
            MimooNavItem(
              icon: Icons.person_outline,
              activeIcon: Icons.person,
              label: 'Account',
            ),
          ],
        ),
        // Wishlist FAB shown on Home and Categories tabs
        floatingActionButton: (_currentIndex == 0 || _currentIndex == 1)
            ? FloatingActionButton.small(
                onPressed: _openWishlist,
                backgroundColor: AppColors.primary,
                tooltip: 'Wishlist',
                elevation: 3,
                child: Badge(
                  isLabelVisible: wishlist.count > 0,
                  label: Text('${wishlist.count}'),
                  backgroundColor: AppColors.flash,
                  child: const Icon(Icons.favorite_border,
                      color: Colors.white, size: 18),
                ),
              )
            : null,
        floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
      ),
    );
  }
}
