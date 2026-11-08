import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../orders/orders_page.dart';
import '../orders/track_order_page.dart';
import 'account_settings_page.dart';
import 'address_book_page.dart';
import 'following_page.dart';
import '../../widgets/mimoo_logo.dart';
import '../voucher/voucher_wallet_page.dart';
import '../notifications/notifications_page.dart';
import '../chat/chat_page.dart';
import '../orders/return_request_pages.dart';
import '../../state/auth_service.dart';
import '../../state/wishlist_provider.dart';
import '../../state/cart_provider.dart';
import '../wishlist/wishlist_page.dart';

// ── Tokens ────────────────────────────────────────────────────────────────────
const _kPrimary = Color(0xFF34175B);
const _kSecondary = Color(0xFF6B38D4);
const _kFlash = Color(0xFFFF3B5C);
const _kSurface = Color(0xFFF5F4FC);
const _kCard = Color(0xFFFFFFFF);
const _kChip = Color(0xFFEFE9FD);
const _kBorder = Color(0xFFDDD8F0);
const _kText = Color(0xFF1A1035);
const _kSubtext = Color(0xFF8A84A3);
const _kGreen = Color(0xFF1DB966);

TextStyle _pjs({
  double size = 14,
  FontWeight weight = FontWeight.w400,
  Color color = _kText,
  double? height,
  TextDecoration? decoration,
}) =>
    GoogleFonts.plusJakartaSans(
        fontSize: size,
        fontWeight: weight,
        color: color,
        height: height,
        decoration: decoration);

// ── Account Page ──────────────────────────────────────────────────────────────
class AccountPage extends StatelessWidget {
  const AccountPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _kSurface,
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(child: _buildAppBar(context)),
            SliverToBoxAdapter(child: _MemberZone(context: context)),
            // ── Live delivery banner hidden — hardcoded, not connected to orders ──
            // SliverToBoxAdapter(child: _LiveDeliveryBanner()),
            SliverToBoxAdapter(child: _OrderShortcuts()),
            SliverToBoxAdapter(child: _MyServices()),
            SliverToBoxAdapter(child: _GuaranteeBanner()),
            const SliverToBoxAdapter(child: SizedBox(height: 24)),
          ],
        ),
      ),
    );
  }

  Widget _buildAppBar(BuildContext context) {
    return Container(
      color: _kCard,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      child: Row(
        children: [
          // Brand logo on a light app bar → framed tile with soft shadow
          const MimooLogo(size: 46, framed: true),
          const SizedBox(width: 10),
          Text('Account',
              style: _pjs(size: 18, weight: FontWeight.w800, color: _kText)),
        ],
      ),
    );
  }
}

// ── Member Zone ───────────────────────────────────────────────────────────────
class _MemberZone extends StatelessWidget {
  const _MemberZone({required this.context});
  final BuildContext context;

  @override
  Widget build(BuildContext ctx) {
    return Container(
      margin: const EdgeInsets.fromLTRB(0, 0, 0, 8),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF2D0F52), Color(0xFF4A1C8A)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // MIMOO MEMBER ZONE row
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 10),
            child: Row(
              children: [
                Text('MIMOO MEMBER ZONE',
                    style: _pjs(
                        size: 11,
                        weight: FontWeight.w800,
                        color: Colors.white60)),
                const Spacer(),
                Icon(Icons.account_circle_outlined,
                    color: Colors.white54, size: 20),
                const SizedBox(width: 12),
                GestureDetector(
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) => const AccountSettingsPage()),
                  ),
                  child: Icon(Icons.settings_outlined,
                      color: Colors.white54, size: 20),
                ),
              ],
            ),
          ),

          // Profile header
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
            child: Row(
              children: [
                Stack(
                  children: [
                    CircleAvatar(
                      radius: 32,
                      backgroundColor: _kChip,
                      child: Icon(Icons.person, size: 36, color: _kPrimary),
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: Container(
                        width: 20,
                        height: 20,
                        decoration: BoxDecoration(
                          color: _kSecondary,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 1.5),
                        ),
                        child: const Icon(Icons.camera_alt,
                            size: 11, color: Colors.white),
                      ),
                    ),
                  ],
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          // Rebuilds when the name changes (incl. web edits).
                          ValueListenableBuilder<String?>(
                            valueListenable:
                                AuthService.instance.buyerNameListenable,
                            builder: (_, name, __) => Text(
                                name ?? AuthService.instance.buyerName ?? 'Buyer',
                                style: _pjs(
                                    size: 18,
                                    weight: FontWeight.w800,
                                    color: Colors.white)),
                          ),
                          const SizedBox(width: 6),
                          Icon(Icons.verified, size: 15, color: _kGreen),
                        ],
                      ),
                      // ── Platinum Member & Coins hidden — no DB tables yet ──
                      // const SizedBox(height: 5),
                      // Row(children: [ Container(Platinum Member...), Container(420 Coins...) ]),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // ── VIP Club banner hidden — no membership table yet ──────────────
          // Container(margin: ..., child: Row(children: [mimoo VIP Club...]))
          // ─────────────────────────────────────────────────────────────────
        ],
      ),
    );
  }
}

// ── Live Delivery Banner ──────────────────────────────────────────────────────
// ignore: unused_element
class _LiveDeliveryBanner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: _kCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _kBorder),
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Image.network(
              'https://picsum.photos/seed/orderitem/80/80',
              width: 52,
              height: 52,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) =>
                  Container(width: 52, height: 52, color: _kChip),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                          color: Color(0xFF8B5CF6), shape: BoxShape.circle),
                    ),
                    const SizedBox(width: 5),
                    Text('OUT FOR DELIVERY',
                        style: _pjs(
                            size: 10,
                            weight: FontWeight.w800,
                            color: _kSecondary)),
                    const Spacer(),
                    Text('Arriving by 3:30 PM',
                        style: _pjs(size: 10, color: _kSubtext)),
                  ],
                ),
                const SizedBox(height: 3),
                Text('Acid-Wash Vintage...',
                    style: _pjs(size: 13, weight: FontWeight.w700)),
                Row(
                  children: [
                    Icon(Icons.delivery_dining, size: 12, color: _kSubtext),
                    const SizedBox(width: 3),
                    Text('Rider Mark V. (mimoo Express)',
                        style: _pjs(size: 11, color: _kSubtext)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          OutlinedButton(
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (_) => const TrackOrderPage(orderId: 'MM-89241029')),
            ),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: _kPrimary),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(9)),
              minimumSize: const Size(0, 32),
              padding: const EdgeInsets.symmetric(horizontal: 12),
            ),
            child: Text('Track Order',
                style:
                    _pjs(size: 12, weight: FontWeight.w700, color: _kPrimary)),
          ),
        ],
      ),
    );
  }
}

// ── Order Shortcuts ───────────────────────────────────────────────────────────
class _OrderShortcuts extends StatelessWidget {
  static const _items = [
    ('To Pay', Icons.payment_outlined, 1, _kFlash),
    ('To Ship', Icons.inventory_2_outlined, 2, _kSecondary),
    ('To Receive', Icons.local_shipping_outlined, 1, _kSecondary),
    ('To Review', Icons.rate_review_outlined, 4, _kText),
    ('Returns', Icons.keyboard_return_outlined, 0, _kText),
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: _kCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _kBorder),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('My Purchases',
                  style: _pjs(size: 15, weight: FontWeight.w800)),
              GestureDetector(
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const OrdersPage()),
                ),
                child: Row(
                  children: [
                    Text('View All Orders',
                        style: _pjs(
                            size: 12,
                            weight: FontWeight.w600,
                            color: _kSecondary)),
                    Icon(Icons.chevron_right, size: 16, color: _kSecondary),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: _items.map((item) {
              return GestureDetector(
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const OrdersPage()),
                ),
                child: Column(
                  children: [
                    Stack(
                      clipBehavior: Clip.none,
                      children: [
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: _kChip,
                            shape: BoxShape.circle,
                          ),
                          child: Icon(item.$2, size: 22, color: item.$4),
                        ),
                        if (item.$3 > 0)
                          Positioned(
                            top: -4,
                            right: -4,
                            child: Container(
                              width: 18,
                              height: 18,
                              decoration: BoxDecoration(
                                color:
                                    item.$4 == _kFlash ? _kFlash : _kSecondary,
                                shape: BoxShape.circle,
                                border:
                                    Border.all(color: Colors.white, width: 1.5),
                              ),
                              alignment: Alignment.center,
                              child: Text('${item.$3}',
                                  style: _pjs(
                                      size: 9,
                                      weight: FontWeight.w800,
                                      color: Colors.white)),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 5),
                    Text(item.$1,
                        style: _pjs(
                            size: 11,
                            weight: FontWeight.w600,
                            color: item.$1 == 'To Receive'
                                ? _kSecondary
                                : _kText)),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

// ── My Services ───────────────────────────────────────────────────────────────
class _MyServices extends StatelessWidget {
  static const _row2 = [
    ('Returns\n& Refunds', Icons.assignment_return_outlined, '', Color(0xFFFF6B00)),
    // "Help Center" and "Live Deals" removed — not on the web, no backend.
    ('Notifications', Icons.notifications_none_outlined, '', _kSecondary),
    ('Messages\nChat', Icons.chat_bubble_outline, '', _kFlash),
    ('Settings\nSecurity', Icons.settings_outlined, '', _kText),
  ];

  @override
  Widget build(BuildContext context) {
    final wishlist = WishlistProvider.of(context);
    return AnimatedBuilder(
      animation: wishlist,
      builder: (context, _) {
        final wishCount = wishlist.count;
        final row1 = [
          ('Vouchers', Icons.local_offer_outlined, '', _kFlash),
          (
            'Wishlist\n$wishCount item${wishCount == 1 ? '' : 's'}',
            Icons.favorite_outline,
            '',
            _kFlash
          ),
          ('Addresses\nAddress Book', Icons.location_on_outlined, '', _kText),
          ('Following\nStores', Icons.store_outlined, '', _kGreen),
        ];
        return Container(
          margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: _kCard,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: _kBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('My Services',
                      style: _pjs(size: 15, weight: FontWeight.w800)),
                  Text('Frequently Used',
                      style: _pjs(size: 12, color: _kSubtext)),
                ],
              ),
              const SizedBox(height: 14),
              _serviceRow(context, row1),
              const SizedBox(height: 14),
              _serviceRow(context, _row2),
            ],
          ),
        );
      },
    );
  }

  Widget _serviceRow(
      BuildContext context, List<(String, IconData, String, Color)> items) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: items.map((item) {
        final label = item.$1;
        return GestureDetector(
          onTap: () {
            if (label.startsWith('Settings')) {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const AccountSettingsPage()),
              );
            } else if (label.startsWith('Wishlist')) {
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
            } else if (label.startsWith('Addresses')) {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const AddressBookPage()),
              );
            } else if (label.startsWith('Following')) {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const FollowingPage()),
              );
            } else if (label.startsWith('Returns')) {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const ReturnsListPage()),
              );
            } else if (label.startsWith('Vouchers')) {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const VoucherWalletPage()),
              );
            } else if (label.startsWith('Notifications')) {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const NotificationsPage()),
              );
            } else if (label.startsWith('Messages')) {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const ChatPage()),
              );
            } else {
              final messages = {
                'Vouchers': 'Your vouchers: 3 active',
                'Recent': 'Opening recently viewed...',
                'Official': 'Browsing Official Mall sellers...',
                'Invite': 'Share your referral link...',
                'Live': 'Loading live deals...',
              };
              final msg = messages.entries
                  .firstWhere(
                    (e) => label.startsWith(e.key),
                    orElse: () => MapEntry(label, label),
                  )
                  .value;
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(msg,
                      style: _pjs(
                          size: 13,
                          color: Colors.white,
                          weight: FontWeight.w600)),
                  backgroundColor: _kPrimary,
                  duration: const Duration(seconds: 2),
                ),
              );
            }
          },
          child: Column(
            children: [
              Stack(
                clipBehavior: Clip.none,
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: _kChip,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Icon(item.$2, size: 22, color: item.$4),
                  ),
                  if (item.$3.isNotEmpty)
                    Positioned(
                      top: -6,
                      right: -6,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 5, vertical: 2),
                        decoration: BoxDecoration(
                          color: item.$4 == _kFlash ? _kFlash : _kSecondary,
                          borderRadius: BorderRadius.circular(9999),
                          border: Border.all(color: Colors.white, width: 1.5),
                        ),
                        child: Text(item.$3,
                            style: _pjs(
                                size: 9,
                                weight: FontWeight.w800,
                                color: Colors.white)),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 5),
              Text(
                item.$1,
                style: item.$1.contains('Up to') || item.$1.contains('Just')
                    ? _pjs(size: 10, weight: FontWeight.w600, color: _kFlash)
                    : item.$1.contains('100%')
                        ? _pjs(
                            size: 10, weight: FontWeight.w600, color: _kGreen)
                        : _pjs(size: 10, weight: FontWeight.w600),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}

// ── Guarantee Banner ──────────────────────────────────────────────────────────
class _GuaranteeBanner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 0),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: _kChip,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _kBorder),
      ),
      child: Row(
        children: [
          Icon(Icons.shield_outlined, size: 18, color: _kSecondary),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              'mimoo Guarantee: 100% Authentic products, fast refunds, and secured payment escrow.',
              style: _pjs(size: 12, color: _kSubtext, height: 1.4),
            ),
          ),
        ],
      ),
    );
  }
}
