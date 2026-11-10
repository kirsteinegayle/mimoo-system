import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'rate_product_page.dart';
import 'order_chat_page.dart';
import 'track_order_page.dart';
import 'cancel_reason_page.dart';
import 'what_happened_page.dart';
import 'return_refund_models.dart';
import 'refund_details_screen.dart';
import 'real_order_actions.dart';
import '../../data/sample_products.dart';
import '../../models/product.dart';
import '../../models/order.dart' as api_order;
import '../../services/order_repository.dart';
import '../../services/api_service.dart';
import '../home/product_detail_page.dart';
import '../../state/cart_provider.dart';
import '../seller/seller_store_page.dart';
import '../chat/chat_page.dart';
import '../../theme/app_theme.dart';

// ── Tokens ────────────────────────────────────────────────────────────────────
const _kPrimary = AppColors.primary;
const _kSecondary = AppColors.accent;
const _kFlash = AppColors.flash;
const _kSurface = AppColors.surface;
const _kCard = AppColors.card;
const _kChip = AppColors.chip;
const _kBorder = AppColors.border;
const _kText = AppColors.text;
const _kSubtext = AppColors.textMuted;
const _kGreen = AppColors.success;
const _kOrange = AppColors.orange;
const _kRed = AppColors.flash;

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

// ── Order status ──────────────────────────────────────────────────────────────
enum _OrderStatus {
  toPay,
  toShip,
  toReceive,
  toReview,
  completed,
  cancelled,
  refund,
}

// ── Order model ───────────────────────────────────────────────────────────────
class _OrderItem {
  const _OrderItem({
    required this.orderId,
    required this.storeName,
    required this.storeBadge,
    required this.productName,
    required this.productSub,
    required this.imageUrl,
    required this.price,
    required this.qty,
    required this.status,
    this.statusLabel = '',
    this.statusColor = _kSubtext,
    this.deliveryInfo,
    this.paymentInfo,
    this.expiresLabel,
    this.subNote,
    this.earnNote,
    this.courierName,
    this.trackingNumber,
    this.cancelReason,
    this.cancelledBy,
    this.cancelDate,
    this.refundStatus,
    this.refundAmount,
    this.refundMethod,
    this.completedDate,
    this.dbId,
    this.canCancel = false,
    this.apiOrder,
  });

  final String orderId;
  final String storeName, storeBadge, productName, productSub, imageUrl;
  final double price;
  final int qty;
  final _OrderStatus status;
  final String statusLabel;
  final Color statusColor;
  final String? deliveryInfo, paymentInfo, expiresLabel, subNote, earnNote;
  final String? courierName, trackingNumber;
  final String? cancelReason, cancelledBy, cancelDate;
  final String? refundStatus, refundMethod;
  final double? refundAmount;
  final String? completedDate;

  /// Real DB order id (null for hardcoded sample orders).
  final int? dbId;

  /// Whether the server allows cancellation for this order.
  final bool canCancel;

  /// Full API order (real orders only) — used for review / return actions.
  final api_order.Order? apiOrder;
}

// ── Sample data ───────────────────────────────────────────────────────────────
// Mutable list — cancel/return flows mutate entries in place so My Purchases
// rebuilds without a full restart.
final _orders = <_OrderItem>[
  _OrderItem(
    orderId: 'MM-89241029',
    storeName: 'mimoo Official Flagship',
    storeBadge: 'MALL',
    productName: 'mimoo Studio Acid-Wash Heavyweight Vintage Hoodie',
    productSub: 'Washed Purple, Size M',
    imageUrl: 'https://picsum.photos/seed/hoodie1/200/200',
    price: 849,
    qty: 1,
    status: _OrderStatus.toReceive,
    statusLabel: 'Out for Delivery',
    statusColor: _kSecondary,
    deliveryInfo:
        'Rider Mark V. is on the way\nEstimated arrival by 5:30 PM today',
    subNote: 'Free Delivery',
    courierName: 'mimoo Express  •  Rider Mark V.',
    trackingNumber: 'PH-MM-894120938',
  ),
  _OrderItem(
    orderId: 'MM-78120341',
    storeName: 'StyleTrend Boutique',
    storeBadge: '',
    productName: 'Chic Knit Ribbed Crop Cardigan',
    productSub: 'Lilac, Size S',
    imageUrl: 'https://picsum.photos/seed/cardigan/200/200',
    price: 899,
    qty: 1,
    status: _OrderStatus.toPay,
    statusLabel: 'Pay within 01:45:20',
    statusColor: _kFlash,
    paymentInfo: 'GCash (Auto-deduct pending)',
    expiresLabel: 'Expires Soon',
  ),
  _OrderItem(
    orderId: 'TZ-8849201',
    storeName: 'TechZone Direct',
    storeBadge: 'PREFERRED',
    productName: 'Wireless ANC Earbuds Pro 2nd Gen',
    productSub: 'Matte Black • Free Silicone Case',
    imageUrl: 'https://picsum.photos/seed/earbuds/200/200',
    price: 1250,
    qty: 1,
    status: _OrderStatus.toShip,
    statusLabel: 'Seller is preparing',
    statusColor: _kSecondary,
  ),
  _OrderItem(
    orderId: 'AU-5523190',
    storeName: 'Aura Living Home',
    storeBadge: '',
    productName: 'Minimalist Ceramic Ribbed Table Lamp',
    productSub: 'Warm White • 5W Bulb',
    imageUrl: 'https://picsum.photos/seed/lamp2/200/200',
    price: 680,
    qty: 1,
    status: _OrderStatus.toReview,
    statusLabel: 'Delivered Oct 24',
    statusColor: _kGreen,
    earnNote: 'Review before Oct 30 to earn +10 mimoo Coins',
    courierName: 'mimoo Express',
    trackingNumber: 'PH-AU-552319001',
  ),
  _OrderItem(
    orderId: 'BK-4421987',
    storeName: 'The Book Nook PH',
    storeBadge: '',
    productName: 'Atomic Habits — James Clear (Paperback)',
    productSub: 'English Edition',
    imageUrl: 'https://picsum.photos/seed/book1/200/200',
    price: 320,
    qty: 2,
    status: _OrderStatus.completed,
    statusLabel: 'Completed',
    statusColor: _kGreen,
    completedDate: 'Oct 18',
    subNote: 'Free Delivery',
    courierName: 'mimoo Express',
    trackingNumber: 'PH-BK-442198701',
  ),
  _OrderItem(
    orderId: 'SP-9923001',
    storeName: 'SportHub PH',
    storeBadge: 'PREFERRED',
    productName: 'CloudStep Cushion Running Shoes',
    productSub: 'White/Volt, Size 42',
    imageUrl: 'https://picsum.photos/seed/shoes2/200/200',
    price: 2450,
    qty: 1,
    status: _OrderStatus.completed,
    statusLabel: 'Completed',
    statusColor: _kGreen,
    completedDate: 'Oct 10',
  ),
  _OrderItem(
    orderId: 'UD-3317820',
    storeName: 'Urban Denim Co.',
    storeBadge: '',
    productName: 'Straight Leg Washed Indigo Denim Jeans',
    productSub: 'Waist 30, Indigo Blue',
    imageUrl: 'https://picsum.photos/seed/jeans/200/200',
    price: 590,
    qty: 1,
    status: _OrderStatus.cancelled,
    statusLabel: 'Cancelled',
    statusColor: _kRed,
    cancelDate: 'Oct 22',
    cancelledBy: 'You',
    cancelReason: 'Changed my mind',
    refundStatus: 'Refund Processed',
    refundAmount: 590,
    refundMethod: 'GCash',
  ),
  _OrderItem(
    orderId: 'HB-1109321',
    storeName: 'HomeBase PH',
    storeBadge: '',
    productName: 'Nordic Minimalist Desk Organizer Set',
    productSub: 'Oak Wood, 5-piece',
    imageUrl: 'https://picsum.photos/seed/desk/200/200',
    price: 780,
    qty: 1,
    status: _OrderStatus.cancelled,
    statusLabel: 'Cancelled',
    statusColor: _kRed,
    cancelDate: 'Oct 19',
    cancelledBy: 'Seller',
    cancelReason: 'Item out of stock',
    refundStatus: 'Refund in Progress',
    refundAmount: 780,
    refundMethod: 'Original Payment Method',
  ),
];

// ── Rating state (in-memory store keyed by orderId) ───────────────────────────
// Delegates to reviewStore and ReviewData from rate_product_page.dart
// TODO(backend): replace with API calls

// ── Order mutation helpers ─────────────────────────────────────────────────────
void _mutateOrder(String orderId, _OrderItem Function(_OrderItem) updater) {
  final idx = _orders.indexWhere((o) => o.orderId == orderId);
  if (idx == -1) return;
  _orders[idx] = updater(_orders[idx]);
}

void _markOrderCancelled(String orderId, String reason, String? cancelledBy) {
  _mutateOrder(
    orderId,
    (o) => _OrderItem(
      orderId: o.orderId,
      storeName: o.storeName,
      storeBadge: o.storeBadge,
      productName: o.productName,
      productSub: o.productSub,
      imageUrl: o.imageUrl,
      price: o.price,
      qty: o.qty,
      status: _OrderStatus.cancelled,
      statusLabel: 'Cancelled',
      statusColor: _kRed,
      cancelReason: reason,
      cancelledBy: cancelledBy ?? 'You',
      cancelDate: _todayLabel(),
      paymentInfo: o.paymentInfo,
      refundStatus: o.paymentInfo != null ? 'Refund in Progress' : null,
      refundAmount: o.paymentInfo != null ? o.price : null,
      refundMethod: o.paymentInfo ?? 'Original Method',
    ),
  );
}

void _markOrderReturnRequested(String orderId) {
  _mutateOrder(
    orderId,
    (o) => _OrderItem(
      orderId: o.orderId,
      storeName: o.storeName,
      storeBadge: o.storeBadge,
      productName: o.productName,
      productSub: o.productSub,
      imageUrl: o.imageUrl,
      price: o.price,
      qty: o.qty,
      status: _OrderStatus.refund,
      statusLabel: 'Return Requested',
      statusColor: _kOrange,
      refundStatus: 'Pending Review',
      refundAmount: o.price,
      refundMethod: 'Original Method',
    ),
  );
}

String _todayLabel() {
  final now = DateTime.now();
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];
  return '${months[now.month - 1]} ${now.day}';
}

// ═════════════════════════════════════════════════════════════════════════════
// MY PURCHASES PAGE
// ═════════════════════════════════════════════════════════════════════════════
class OrdersPage extends StatefulWidget {
  const OrdersPage({super.key, this.initialTab = 0});

  /// Tab to open on (0 All, 1 To Ship, 2 To Receive, 3 Completed,
  /// 4 Cancelled). UI only; data loading is unchanged.
  final int initialTab;

  @override
  State<OrdersPage> createState() => _OrdersPageState();
}

class _OrdersPageState extends State<OrdersPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabCtrl;

  // ── API state ─────────────────────────────────────────────────────────────
  List<api_order.Order> _apiOrders = [];
  bool _loading = true;
  String? _error;

  // Tab labels (To Pay / To Review hidden per spec; code kept)
  static const _tabs = [
    'All',
    'To Ship',
    'To Receive',
    'Completed',
    'Cancelled'
  ];

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(
        length: _tabs.length,
        vsync: this,
        initialIndex: widget.initialTab.clamp(0, _tabs.length - 1));
    _load();
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final page = await OrderRepository.instance.fetchOrders();
      if (!mounted) return;
      setState(() {
        _apiOrders = page.orders;
        _loading = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = e.message;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = 'Could not load orders.';
      });
    }
  }

  List<_OrderItem> _toViewModels(List<api_order.Order> orders) {
    return orders.map((o) {
      final tab = api_order.orderTabFromStatus(o.status);
      final label = _statusLabel(o.status, o.paymentMethod);
      final color = _statusColor(tab);
      final first = o.items.isNotEmpty ? o.items.first : null;
      return _OrderItem(
        orderId: o.orderNumber,
        storeName: first?.sellerName ?? 'Order ${o.orderNumber}',
        storeBadge: '',
        productName: first?.productName ?? 'Order ${o.orderNumber}',
        productSub: first?.variantId ?? '',
        imageUrl: first?.imageUrl ?? '',
        price: o.total,
        qty: first?.quantity ?? 1,
        status: _tabToLocal(tab),
        statusLabel: label,
        statusColor: color,
        paymentInfo: o.paymentMethod.toUpperCase(),
        // Delivery tracking line (null when no tracking yet).
        deliveryInfo: o.trackingSummary,
        dbId: o.id,
        canCancel: o.canCancel,
        apiOrder: o,
      );
    }).toList();
  }

  static String _statusLabel(api_order.OrderStatus s, String method) {
    switch (s) {
      case api_order.OrderStatus.pending:
        return 'Awaiting shipment';
      case api_order.OrderStatus.paid:
        return 'Paid — awaiting shipment';
      case api_order.OrderStatus.packed:
        return 'Packed — ready to ship';
      case api_order.OrderStatus.shipped:
      case api_order.OrderStatus.inTransit:
        return 'In Transit';
      case api_order.OrderStatus.completed:
        return 'Completed';
      case api_order.OrderStatus.cancelled:
        return 'Cancelled';
      case api_order.OrderStatus.failed:
        return 'Failed';
      default:
        return s.name;
    }
  }

  static Color _statusColor(api_order.OrderTab tab) {
    switch (tab) {
      case api_order.OrderTab.toShip:
        return _kSecondary;
      case api_order.OrderTab.toReceive:
        return _kOrange;
      case api_order.OrderTab.completed:
        return _kGreen;
      case api_order.OrderTab.cancelled:
        return _kRed;
    }
  }

  static _OrderStatus _tabToLocal(api_order.OrderTab tab) {
    switch (tab) {
      case api_order.OrderTab.toShip:
        return _OrderStatus.toShip;
      case api_order.OrderTab.toReceive:
        return _OrderStatus.toReceive;
      case api_order.OrderTab.completed:
        return _OrderStatus.completed;
      case api_order.OrderTab.cancelled:
        return _OrderStatus.cancelled;
    }
  }

  List<_OrderItem> _filtered(int i) {
    final vms = _toViewModels(_apiOrders);
    switch (i) {
      case 0:
        return vms;
      case 1:
        return vms.where((o) => o.status == _OrderStatus.toShip).toList();
      case 2:
        return vms.where((o) => o.status == _OrderStatus.toReceive).toList();
      case 3:
        return vms.where((o) => o.status == _OrderStatus.completed).toList();
      case 4:
        return vms.where((o) => o.status == _OrderStatus.cancelled).toList();
      default:
        return vms;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _kSurface,
      appBar: _buildAppBar(),
      body: Column(children: [
        _buildTabBar(),
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : _error != null
                  ? _buildError()
                  : TabBarView(
                      controller: _tabCtrl,
                      children: List.generate(
                          _tabs.length,
                          (i) => RefreshIndicator(
                                onRefresh: _load,
                                child: _OrderList(
                                    orders: _filtered(i),
                                    // Reload so review / return state is fresh.
                                    onRated: () => _load(),
                                    onCancelled: _load),
                              )),
                    ),
        ),
      ]),
    );
  }

  Widget _buildError() => Center(
          child: Column(mainAxisSize: MainAxisSize.min, children: [
        const Icon(Icons.wifi_off_outlined, size: 48, color: _kBorder),
        const SizedBox(height: 12),
        Text(_error!,
            textAlign: TextAlign.center,
            style: _pjs(size: 13, color: _kSubtext)),
        const SizedBox(height: 12),
        FilledButton.tonal(
            onPressed: _load,
            child:
                Text('Retry', style: _pjs(size: 13, weight: FontWeight.w700))),
      ]));

  AppBar _buildAppBar() => AppBar(
        backgroundColor: _kCard,
        elevation: 0,
        leading: IconButton(
            icon: Icon(Icons.arrow_back, color: _kText),
            onPressed: () => Navigator.maybePop(context)),
        title: Text('My Purchases',
            style: _pjs(size: 17, weight: FontWeight.w800)),
        actions: [
          IconButton(
              icon: Icon(Icons.chat_bubble_outline, color: _kText),
              onPressed: () => Navigator.push(
                  context, MaterialPageRoute(builder: (_) => const ChatPage())))
        ],
      );

  Widget _buildTabBar() => Container(
        color: _kCard,
        child: TabBar(
          controller: _tabCtrl,
          isScrollable: true,
          tabAlignment: TabAlignment.start,
          labelColor: _kPrimary,
          unselectedLabelColor: _kSubtext,
          indicatorColor: _kPrimary,
          indicatorWeight: 2.5,
          labelStyle: _pjs(size: 13, weight: FontWeight.w700),
          unselectedLabelStyle: _pjs(size: 13),
          tabs: _tabs.map((t) => Tab(text: t)).toList(),
        ),
      );
}

// ── Order list ────────────────────────────────────────────────────────────────
class _OrderList extends StatelessWidget {
  const _OrderList({
    required this.orders,
    required this.onRated,
    required this.onCancelled,
  });
  final List<_OrderItem> orders;
  final VoidCallback onRated;
  final VoidCallback onCancelled;

  @override
  Widget build(BuildContext context) {
    if (orders.isEmpty) {
      return ListView(
        children: [
          const SizedBox(height: 120),
          Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.shopping_bag_outlined, size: 64, color: _kSubtext),
                const SizedBox(height: 12),
                Text('No orders here yet',
                    style: _pjs(size: 15, color: _kSubtext)),
                const SizedBox(height: 6),
                Text('Orders you place will appear here',
                    style: _pjs(size: 12, color: _kSubtext)),
              ],
            ),
          ),
        ],
      );
    }
    return CustomScrollView(
      slivers: [
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(12, 12, 12, 0),
          sliver: SliverList(
            delegate: SliverChildBuilderDelegate(
              (ctx, i) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: _OrderCard(
                    order: orders[i],
                    onRated: onRated,
                    onCancelled: onCancelled),
              ),
              childCount: orders.length,
            ),
          ),
        ),
        // "You may also like" hidden: it only had sample products.
        const SliverToBoxAdapter(child: SizedBox(height: 24)),
      ],
    );
  }
}

// ── You May Also Like section ─────────────────────────────────────────────────
// Hidden for now (sample products only); kept for when real
// recommendations exist.
// ignore: unused_element
class _YouMayAlsoLike extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.auto_awesome, size: 14, color: _kSecondary),
              const SizedBox(width: 6),
              Text('YOU MAY ALSO LIKE',
                  style: _pjs(
                      size: 12, weight: FontWeight.w800, color: _kSubtext)),
              const SizedBox(width: 6),
              const Icon(Icons.auto_awesome, size: 14, color: _kSecondary),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: sampleProducts.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              childAspectRatio: 0.68,
            ),
            itemBuilder: (ctx, i) {
              final p = sampleProducts[i];
              return GestureDetector(
                onTap: () => Navigator.push(
                    ctx,
                    MaterialPageRoute(
                        builder: (_) => ProductDetailPage(product: p))),
                child: Container(
                  decoration: BoxDecoration(
                    color: _kCard,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: const [
                      BoxShadow(
                          color: AppColors.primaryA05,
                          blurRadius: 8,
                          offset: Offset(0, 2)),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Stack(
                        children: [
                          ClipRRect(
                            borderRadius: const BorderRadius.vertical(
                                top: Radius.circular(12)),
                            child: AspectRatio(
                              aspectRatio: 1,
                              child: Image.network(p.imageUrl,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => Container(
                                      color: _kChip,
                                      child: const Icon(Icons.image_outlined,
                                          size: 40, color: _kSubtext))),
                            ),
                          ),
                          Positioned(
                            top: 6,
                            left: 6,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 5, vertical: 2),
                              decoration: BoxDecoration(
                                  color: _kFlash,
                                  borderRadius: BorderRadius.circular(4)),
                              child: Text('-${(i * 7 + 8)}%',
                                  style: _pjs(
                                      size: 9,
                                      weight: FontWeight.w800,
                                      color: Colors.white)),
                            ),
                          ),
                          Positioned(
                            top: 6,
                            right: 6,
                            child: Container(
                              width: 26,
                              height: 26,
                              decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.9),
                                  shape: BoxShape.circle),
                              child: const Icon(Icons.favorite_border,
                                  size: 14, color: _kFlash),
                            ),
                          ),
                        ],
                      ),
                      Padding(
                        padding: const EdgeInsets.fromLTRB(8, 6, 8, 8),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 4, vertical: 1),
                                  decoration: BoxDecoration(
                                      color: _kPrimary,
                                      borderRadius: BorderRadius.circular(3)),
                                  child: Text('MAL',
                                      style: _pjs(
                                          size: 8,
                                          weight: FontWeight.w800,
                                          color: Colors.white)),
                                ),
                                const SizedBox(width: 4),
                                Expanded(
                                    child: Text(p.category,
                                        overflow: TextOverflow.ellipsis,
                                        style: _pjs(
                                            size: 10,
                                            color: _kSecondary,
                                            weight: FontWeight.w600))),
                              ],
                            ),
                            const SizedBox(height: 3),
                            Text(p.name,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: _pjs(
                                    size: 12,
                                    weight: FontWeight.w600,
                                    height: 1.3)),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 5, vertical: 2),
                                  decoration: BoxDecoration(
                                      color: _kFlash.withValues(alpha: 0.1),
                                      borderRadius: BorderRadius.circular(4)),
                                  child: Text('Sulit Deal',
                                      style: _pjs(
                                          size: 9,
                                          weight: FontWeight.w700,
                                          color: _kFlash)),
                                ),
                                const SizedBox(width: 4),
                                Icon(Icons.star_rounded,
                                    size: 11, color: AppColors.star),
                                Text(' ${p.rating}',
                                    style: _pjs(
                                        size: 10, weight: FontWeight.w600)),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text('₱${p.price.toStringAsFixed(0)}',
                                style: _pjs(
                                    size: 14,
                                    weight: FontWeight.w800,
                                    color: _kText)),
                            const SizedBox(height: 2),
                            Text('${p.reviewCount} sold',
                                style: _pjs(size: 10, color: _kSubtext)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

// ── Order card ────────────────────────────────────────────────────────────────
class _OrderCard extends StatelessWidget {
  const _OrderCard({
    required this.order,
    required this.onRated,
    required this.onCancelled,
  });
  final _OrderItem order;
  final VoidCallback onRated;
  final VoidCallback onCancelled;

  bool get _isCancelled => order.status == _OrderStatus.cancelled;
  bool get _isCompleted => order.status == _OrderStatus.completed;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: _kCard,
        borderRadius: BorderRadius.circular(14),
        boxShadow: const [
          BoxShadow(
              color: AppColors.primaryA05, blurRadius: 8, offset: Offset(0, 2))
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildStoreHeader(context),
          const Divider(height: 1, color: _kBorder),
          _buildProductRow(),
          if (order.deliveryInfo != null) _buildDeliveryInfo(),
          if (order.paymentInfo != null) _buildPaymentInfo(),
          if (order.earnNote != null) _buildEarnNote(),
          if (order.status == _OrderStatus.toReview) _buildRateReminder(),
          if (_isCancelled) _buildCancelInfo(),
          if (order.subNote != null && order.status == _OrderStatus.refund)
            _buildRefundNote(),
          const Divider(height: 1, color: _kBorder),
          _buildFooter(context),
        ],
      ),
    );
  }

  int? get _storeSellerId {
    final items = order.apiOrder?.items ?? const [];
    return items.isEmpty ? null : items.first.sellerId;
  }

  String? get _storeSellerName {
    final items = order.apiOrder?.items ?? const [];
    return items.isEmpty ? null : items.first.sellerName;
  }

  Widget _buildStoreHeader(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 10, 12, 8),
      child: Row(
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
                color: _kChip, borderRadius: BorderRadius.circular(6)),
            child: Icon(Icons.storefront_outlined, size: 15, color: _kPrimary),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: GestureDetector(
              // Opens the store only with the real numeric seller_id of the
              // order's first item; sample orders (no id) are not tappable.
              onTap: _storeSellerId == null
                  ? null
                  : () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => SellerStorePage(
                            sellerId: '$_storeSellerId',
                            sellerName: _storeSellerName ?? order.storeName,
                          ),
                        ),
                      ),
              child: Text(order.storeName,
                  style: _pjs(size: 13, weight: FontWeight.w700)),
            ),
          ),
          if (order.storeBadge.isNotEmpty) ...[
            const SizedBox(width: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: order.storeBadge == 'MALL'
                    ? _kSecondary
                    : order.storeBadge == 'PREFERRED'
                        ? _kPrimary
                        : _kSubtext,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(order.storeBadge,
                  style: _pjs(
                      size: 9, weight: FontWeight.w800, color: Colors.white)),
            ),
            const SizedBox(width: 6),
          ],
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: order.statusColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(9999),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (order.status == _OrderStatus.toPay) ...[
                  Icon(Icons.timer_outlined,
                      size: 11, color: order.statusColor),
                  const SizedBox(width: 3),
                ],
                if (_isCancelled) ...[
                  Icon(Icons.cancel_outlined,
                      size: 11, color: order.statusColor),
                  const SizedBox(width: 3),
                ],
                if (_isCompleted) ...[
                  Icon(Icons.check_circle_outline,
                      size: 11, color: order.statusColor),
                  const SizedBox(width: 3),
                ],
                if (order.status == _OrderStatus.toReview) ...[
                  Icon(Icons.star_outline_rounded,
                      size: 11, color: order.statusColor),
                  const SizedBox(width: 3),
                ],
                Text(order.statusLabel,
                    style: _pjs(
                        size: 11,
                        weight: FontWeight.w700,
                        color: order.statusColor)),
                if ((_isCancelled && order.cancelDate != null) ||
                    (_isCompleted && order.completedDate != null))
                  Text(
                    _isCancelled
                        ? '  ·  ${order.cancelDate}'
                        : '  ·  ${order.completedDate}',
                    style: _pjs(size: 10, color: order.statusColor),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProductRow() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Stack(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.network(order.imageUrl,
                    width: 64,
                    height: 64,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) =>
                        Container(width: 64, height: 64, color: _kChip)),
              ),
              if (_isCancelled)
                Positioned.fill(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      color: Colors.black.withValues(alpha: 0.35),
                      child: const Icon(Icons.block,
                          color: Colors.white54, size: 24),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(order.productName,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: _pjs(
                        size: 13,
                        weight: FontWeight.w700,
                        color: _isCancelled ? _kSubtext : _kText)),
                const SizedBox(height: 2),
                Text(order.productSub, style: _pjs(size: 11, color: _kSubtext)),
                const SizedBox(height: 4),
                Text('x${order.qty}', style: _pjs(size: 11, color: _kSubtext)),
              ],
            ),
          ),
          Text('₱${order.price.toStringAsFixed(2)}',
              style: _pjs(
                  size: 14,
                  weight: FontWeight.w800,
                  color: _isCancelled ? _kSubtext : _kPrimary)),
        ],
      ),
    );
  }

  Widget _buildDeliveryInfo() {
    return Container(
      margin: const EdgeInsets.fromLTRB(12, 0, 12, 8),
      padding: const EdgeInsets.all(10),
      decoration:
          BoxDecoration(color: _kChip, borderRadius: BorderRadius.circular(8)),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.delivery_dining, size: 16, color: _kSecondary),
          const SizedBox(width: 6),
          Expanded(
              child: Text(order.deliveryInfo!,
                  style: _pjs(size: 11, color: _kSecondary, height: 1.4))),
        ],
      ),
    );
  }

  Widget _buildPaymentInfo() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 0, 12, 8),
      child: Row(
        children: [
          Icon(Icons.payment_outlined, size: 16, color: _kSecondary),
          const SizedBox(width: 6),
          Text(order.paymentInfo!,
              style:
                  _pjs(size: 12, color: _kSecondary, weight: FontWeight.w600)),
          const Spacer(),
          if (order.expiresLabel != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                  color: _kFlash.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(4)),
              child: Text(order.expiresLabel!,
                  style:
                      _pjs(size: 10, weight: FontWeight.w700, color: _kFlash)),
            ),
        ],
      ),
    );
  }

  Widget _buildEarnNote() {
    return Container(
      margin: const EdgeInsets.fromLTRB(12, 0, 12, 8),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        color: AppColors.warningBg,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.warningBorder),
      ),
      child: Row(
        children: [
          const Text('🪙', style: TextStyle(fontSize: 13)),
          const SizedBox(width: 6),
          Expanded(
            child: Text(order.earnNote!,
                style: _pjs(
                    size: 11,
                    weight: FontWeight.w600,
                    color: AppColors.warningText)),
          ),
          const Icon(Icons.chevron_right, size: 16, color: AppColors.warningText),
        ],
      ),
    );
  }

  Widget _buildRateReminder() {
    return Container(
      margin: const EdgeInsets.fromLTRB(12, 0, 12, 8),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
          color: _kChip,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: _kBorder)),
      child: Row(
        children: [
          Icon(Icons.star_outline_rounded, size: 15, color: _kSecondary),
          const SizedBox(width: 8),
          Expanded(
            child: Text('Rate this product to help other buyers',
                style: _pjs(
                    size: 12, weight: FontWeight.w600, color: _kSecondary)),
          ),
          Icon(Icons.chevron_right, size: 16, color: _kSecondary),
        ],
      ),
    );
  }

  Widget _buildRefundNote() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 0, 12, 8),
      child: Row(
        children: [
          Icon(Icons.info_outline, size: 14, color: _kSubtext),
          const SizedBox(width: 6),
          Expanded(
              child: Text(order.subNote!,
                  style: _pjs(size: 11, color: _kSubtext))),
        ],
      ),
    );
  }

  Widget _buildCancelInfo() {
    final hasRefund = order.refundStatus != null;
    return Container(
      margin: const EdgeInsets.fromLTRB(12, 0, 12, 8),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: _kRed.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: _kRed.withValues(alpha: 0.18)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.cancel_outlined, size: 13, color: _kRed),
              const SizedBox(width: 5),
              Text(
                  'Cancelled by ${order.cancelledBy ?? 'you'}  ·  ${order.cancelDate ?? ''}',
                  style: _pjs(size: 11, weight: FontWeight.w700, color: _kRed)),
            ],
          ),
          if (order.cancelReason != null) ...[
            const SizedBox(height: 3),
            Text('Reason: ${order.cancelReason}',
                style: _pjs(size: 11, color: _kSubtext)),
          ],
          if (hasRefund) ...[
            const SizedBox(height: 6),
            Row(
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                  decoration: BoxDecoration(
                    color: order.refundStatus!.contains('Processed')
                        ? _kGreen.withValues(alpha: 0.12)
                        : _kOrange.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(9999),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        order.refundStatus!.contains('Processed')
                            ? Icons.check_circle_outline
                            : Icons.hourglass_empty_outlined,
                        size: 10,
                        color: order.refundStatus!.contains('Processed')
                            ? _kGreen
                            : _kOrange,
                      ),
                      const SizedBox(width: 3),
                      Text(order.refundStatus!,
                          style: _pjs(
                              size: 10,
                              weight: FontWeight.w700,
                              color: order.refundStatus!.contains('Processed')
                                  ? _kGreen
                                  : _kOrange)),
                    ],
                  ),
                ),
                if (order.refundAmount != null) ...[
                  const SizedBox(width: 8),
                  Text(
                      '₱${order.refundAmount!.toStringAsFixed(2)} → ${order.refundMethod ?? 'Original Method'}',
                      style: _pjs(size: 11, color: _kSubtext)),
                ],
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildFooter(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              if (order.subNote != null &&
                  order.status != _OrderStatus.refund &&
                  !_isCancelled)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                      color: _kSecondary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(9999)),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.local_shipping_outlined,
                          size: 11, color: _kSecondary),
                      const SizedBox(width: 4),
                      Text(order.subNote!,
                          style: _pjs(
                              size: 11,
                              weight: FontWeight.w700,
                              color: _kSecondary)),
                    ],
                  ),
                ),
              const Spacer(),
              Text(
                  '${order.qty} item${order.qty > 1 ? 's' : ''} • Order Total:',
                  style: _pjs(size: 12, color: _kSubtext)),
              const SizedBox(width: 6),
              Text('₱${order.price.toStringAsFixed(2)}',
                  style: _pjs(
                      size: 14,
                      weight: FontWeight.w800,
                      color: _isCancelled ? _kSubtext : _kPrimary)),
            ],
          ),
          const SizedBox(height: 10),
          _buildActions(context),
        ],
      ),
    );
  }

  // ── Action buttons ────────────────────────────────────────────────────────
  Widget _buildActions(BuildContext context) {
    final outlineStyle = OutlinedButton.styleFrom(
      side: const BorderSide(color: _kBorder),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      minimumSize: const Size(0, 40),
      padding: const EdgeInsets.symmetric(horizontal: 14),
    );
    final primaryOutlineStyle = OutlinedButton.styleFrom(
      side: const BorderSide(color: _kPrimary),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      minimumSize: const Size(0, 40),
      padding: const EdgeInsets.symmetric(horizontal: 14),
    );
    final filledStyle = ElevatedButton.styleFrom(
      backgroundColor: _kPrimary,
      foregroundColor: Colors.white,
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      minimumSize: const Size(0, 40),
      padding: const EdgeInsets.symmetric(horizontal: 14),
    );

    void goContact() => Navigator.push(context,
        MaterialPageRoute(builder: (_) => OrderChatPage(order: order)));

    void goTrack() => Navigator.push(
        context,
        MaterialPageRoute(
            builder: (_) => TrackOrderPage(orderId: order.orderId)));

    void buyAgain() => showBuyAgainModal(context, order);

    // ── Cancel helper — toPay only ───────────────────────────────────────────
    CancelOrderSummary buildCancelSummary() => CancelOrderSummary(
          orderId: order.orderId,
          dbOrderId: order.dbId,
          storeName: order.storeName,
          productName: order.productName,
          productSub: order.productSub,
          imageUrl: order.imageUrl,
          price: order.price,
          qty: order.qty,
          paymentMethod: order.paymentInfo ?? 'GCash / Card',
          isPaid: order.status == _OrderStatus.toShip,
        );

    void goCancel() => Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => CancelReasonPage(
              summary: buildCancelSummary(),
              onCancelled: onCancelled,
              onCancelledWithReason: (reason) {
                _markOrderCancelled(order.orderId, reason, 'You');
                onCancelled();
              },
            ),
          ),
        );

    void goReturnRefund() => Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => WhatHappenedPage(
              summary: ReturnOrderSummary(
                orderId: order.orderId,
                storeName: order.storeName,
                productName: order.productName,
                productSub: order.productSub,
                imageUrl: order.imageUrl,
                price: order.price,
                qty: order.qty,
                paymentMethod: order.paymentInfo ?? 'GCash / Card',
                onSubmitted: () {
                  _markOrderReturnRequested(order.orderId);
                  onCancelled();
                },
              ),
            ),
          ),
        );

    // ── Real API orders: only show Cancel for toShip/toPay, nothing else ──
    final isRealOrder = order.dbId != null;

    if (isRealOrder) {
      // Real orders can only be cancelled (when in toShip status).
      // Track, Return/Refund, Rate, Contact, Buy Again are hidden.
      if (order.status == _OrderStatus.toShip) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
              decoration: BoxDecoration(
                color: _kSecondary.withValues(alpha: 0.06),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.info_outline, size: 13, color: _kSecondary),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      'You can cancel this order while the seller has not yet prepared your item.',
                      style: _pjs(size: 11, color: _kSecondary, height: 1.4),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                SizedBox(
                  width: 160,
                  child: OutlinedButton(
                    onPressed: goCancel,
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: _kRed),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10)),
                      minimumSize: const Size(0, 40),
                    ),
                    child: Text('Cancel Order',
                        style: _pjs(
                            size: 13, weight: FontWeight.w700, color: _kRed)),
                  ),
                ),
              ],
            ),
          ],
        );
      }
      // Other statuses: real Rate / Request Return / Return Status actions.
      return order.apiOrder != null
          ? RealOrderActions(order: order.apiOrder!, onChanged: onRated)
          : const SizedBox.shrink();
    }

    switch (order.status) {
      // ── To Pay — Cancel Order + View Details ────────────────────────────
      case _OrderStatus.toPay:
        return Row(children: [
          Expanded(
            child: OutlinedButton(
              onPressed: goCancel,
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: _kRed),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10)),
                minimumSize: const Size(0, 40),
              ),
              child: Text('Cancel Order',
                  style: _pjs(size: 13, weight: FontWeight.w700, color: _kRed)),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: OutlinedButton(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (_) => CancellationDetailsPage(order: order)),
              ),
              style: outlineStyle,
              child: Text('View Details',
                  style:
                      _pjs(size: 13, weight: FontWeight.w700, color: _kText)),
            ),
          ),
        ]);

      // ── To Ship — Cancel Order ───────────────────────────────────────────
      // Buyer can cancel if the seller hasn't prepared the item yet.
      case _OrderStatus.toShip:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Note about cancellation eligibility
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
              decoration: BoxDecoration(
                color: _kSecondary.withValues(alpha: 0.06),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.info_outline, size: 13, color: _kSecondary),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      'You can cancel this order while the seller has not yet prepared your item.',
                      style: _pjs(size: 11, color: _kSecondary, height: 1.4),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            // Half-width Cancel Order button — right-aligned
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                SizedBox(
                  width: 160,
                  child: OutlinedButton(
                    onPressed: goCancel,
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: _kRed),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10)),
                      minimumSize: const Size(0, 40),
                    ),
                    child: Text('Cancel Order',
                        style: _pjs(
                            size: 13, weight: FontWeight.w700, color: _kRed)),
                  ),
                ),
              ],
            ),
          ],
        );

      // ── To Receive — Track + Contact Seller ─────────────────────────────
      case _OrderStatus.toReceive:
        return Row(children: [
          Expanded(
            child: OutlinedButton.icon(
              onPressed: goTrack,
              icon: const Icon(Icons.location_on_outlined,
                  size: 14, color: _kPrimary),
              label: Text('Track',
                  style: _pjs(
                      size: 13, weight: FontWeight.w700, color: _kPrimary)),
              style: primaryOutlineStyle,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: ElevatedButton.icon(
              onPressed: goContact,
              icon: const Icon(Icons.chat_bubble_outline,
                  size: 14, color: Colors.white),
              label: Text('Contact Seller',
                  style: _pjs(
                      size: 13, weight: FontWeight.w700, color: Colors.white)),
              style: filledStyle,
            ),
          ),
        ]);

      // ── To Review — fall through to Completed ────────────────────────────
      case _OrderStatus.toReview:

      // ── Completed — Buy Again + Rate + Return/Refund ─────────────────────
      case _OrderStatus.completed:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: buyAgain,
                  icon: const Icon(Icons.refresh, size: 14, color: _kSubtext),
                  label: Text('Buy Again',
                      style: _pjs(
                          size: 13, weight: FontWeight.w700, color: _kText)),
                  style: outlineStyle,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => _goRate(context, readOnly: false),
                  icon: const Icon(Icons.star_outline_rounded,
                      size: 14, color: Colors.white),
                  label: Text('Rate',
                      style: _pjs(
                          size: 13,
                          weight: FontWeight.w700,
                          color: Colors.white)),
                  style: filledStyle,
                ),
              ),
            ]),
            const SizedBox(height: 8),
            OutlinedButton.icon(
              onPressed: goReturnRefund,
              icon: const Icon(Icons.assignment_return_outlined,
                  size: 14, color: _kSecondary),
              label: Text('Return / Refund',
                  style: _pjs(
                      size: 13, weight: FontWeight.w700, color: _kSecondary)),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: _kSecondary),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10)),
                minimumSize: const Size(0, 40),
              ),
            ),
          ],
        );

      // ── Cancelled ───────────────────────────────────────────────────────
      case _OrderStatus.cancelled:
        return Row(children: [
          Expanded(
            child: OutlinedButton(
              onPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (_) => CancellationDetailsPage(order: order))),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: _kBorder),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10)),
                minimumSize: const Size(0, 40),
                padding: const EdgeInsets.symmetric(horizontal: 14),
              ),
              child: Text('Cancellation Details',
                  style:
                      _pjs(size: 13, weight: FontWeight.w700, color: _kText)),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: ElevatedButton(
              onPressed: () => showBuyAgainModal(context, order),
              style: ElevatedButton.styleFrom(
                backgroundColor: _kPrimary,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10)),
                minimumSize: const Size(0, 40),
                padding: const EdgeInsets.symmetric(horizontal: 14),
              ),
              child: Text('Buy Again',
                  style: _pjs(
                      size: 13, weight: FontWeight.w700, color: Colors.white)),
            ),
          ),
        ]);

      // ── Refund ──────────────────────────────────────────────────────────
      case _OrderStatus.refund:
        // Look up the request ID from ReturnRefundStore
        final refundReq = ReturnRefundStore.forOrder(order.orderId);
        return Row(children: [
          Expanded(
            child: OutlinedButton.icon(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => RefundDetailsScreen(
                    refundRequestId: refundReq?.orderId ?? order.orderId,
                  ),
                ),
              ),
              icon: const Icon(Icons.receipt_long_outlined,
                  size: 14, color: _kSubtext),
              label: Text('View Refund',
                  style:
                      _pjs(size: 13, weight: FontWeight.w700, color: _kText)),
              style: outlineStyle,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: ElevatedButton.icon(
              onPressed: goContact,
              icon: const Icon(Icons.chat_bubble_outline,
                  size: 14, color: Colors.white),
              label: Text('Contact',
                  style: _pjs(
                      size: 13, weight: FontWeight.w700, color: Colors.white)),
              style: filledStyle,
            ),
          ),
        ]);
    }
  }

  Future<void> _goRate(BuildContext context, {required bool readOnly}) async {
    final args = RateProductArgs(
      orderId: order.orderId,
      productId: order.orderId,
      productName: order.productName,
      productSub: order.productSub,
      imageUrl: order.imageUrl,
      storeName: order.storeName,
      price: order.price,
    );
    final rated = await Navigator.push<bool>(context,
        MaterialPageRoute(builder: (_) => RateProductPage(args: args)));
    if (rated == true && context.mounted) onRated();
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// CANCELLATION DETAILS PAGE
// ═════════════════════════════════════════════════════════════════════════════
// CANCELLATION DETAILS PAGE
// ═════════════════════════════════════════════════════════════════════════════
class CancellationDetailsPage extends StatelessWidget {
  // ignore: library_private_types_in_public_api
  const CancellationDetailsPage({super.key, required this.order});
  // ignore: library_private_types_in_public_api
  final _OrderItem order;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _kSurface,
      appBar: AppBar(
        backgroundColor: _kCard,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: _kText),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Product Details',
            style: _pjs(size: 17, weight: FontWeight.w800)),
        actions: [
          IconButton(
            icon: Icon(Icons.share_outlined, color: _kText, size: 20),
            onPressed: () {},
          ),
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: CircleAvatar(
              radius: 16,
              backgroundColor: _kPrimary,
              child: const Icon(Icons.person, color: Colors.white, size: 16),
            ),
          ),
        ],
      ),
      body: ListView(
        padding: EdgeInsets.zero,
        children: [
          // ── Status banner ────────────────────────────────────────────────
          Container(
            margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: _kSurface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: _kBorder),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Cancellation Completed',
                          style: _pjs(
                              size: 18,
                              weight: FontWeight.w800,
                              color: _kText)),
                      const SizedBox(height: 4),
                      Text('on ${order.cancelDate ?? '—'}.',
                          style: _pjs(size: 12, color: _kSubtext)),
                    ],
                  ),
                ),
                Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    color: _kChip,
                    shape: BoxShape.circle,
                  ),
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      Icon(Icons.replay_outlined, size: 28, color: _kSecondary),
                      Positioned(
                        right: 6,
                        bottom: 6,
                        child: Container(
                          width: 16,
                          height: 16,
                          decoration: const BoxDecoration(
                            color: _kSecondary,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.check,
                              size: 10, color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          // ── Store + products ─────────────────────────────────────────────
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: _kCard,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: _kBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    _StoreBadgeChip(badge: order.storeBadge),
                    const SizedBox(width: 6),
                    Text(order.storeName,
                        style: _pjs(size: 13, weight: FontWeight.w700)),
                    const Icon(Icons.chevron_right, size: 16, color: _kSubtext),
                    const Spacer(),
                    Icon(Icons.chat_bubble_outline,
                        size: 14, color: _kSecondary),
                    const SizedBox(width: 4),
                    GestureDetector(
                      onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) => OrderChatPage(order: order))),
                      child: Text('Contact',
                          style: _pjs(
                              size: 12,
                              weight: FontWeight.w700,
                              color: _kSecondary)),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                // Product row
                _CancelledProductRow(
                  imageUrl: order.imageUrl,
                  name: order.productName,
                  sub: order.productSub,
                  qty: order.qty,
                  price: order.price,
                  originalPrice: order.price * 2.5, // display only
                ),
                const SizedBox(height: 12),
                const Divider(color: _kBorder, height: 1),
                const SizedBox(height: 10),
                // Cancellation refund row
                Row(
                  children: [
                    Icon(Icons.replay_outlined, size: 15, color: _kSecondary),
                    const SizedBox(width: 6),
                    Text('Cancellation Refund',
                        style: _pjs(
                            size: 13,
                            weight: FontWeight.w600,
                            color: _kSecondary)),
                    const Spacer(),
                    Text('₱0.00 (No deduction)',
                        style: _pjs(size: 12, color: _kSubtext)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          // ── Details rows ─────────────────────────────────────────────────
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            decoration: BoxDecoration(
              color: _kCard,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: _kBorder),
            ),
            child: Column(
              children: [
                _DetailRow(
                    label: 'Requested by', value: order.cancelledBy ?? 'Buyer'),
                _DetailRow(
                    label: 'Requested at', value: order.cancelDate ?? '—'),
                _DetailRow(label: 'Reason', value: order.cancelReason ?? '—'),
                _DetailRow(
                  label: 'Payment method',
                  value: 'Cash on Delivery',
                  icon: Icons.account_balance_wallet_outlined,
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          // ── Order Detail button ──────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: OutlinedButton(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => OrderDetailPage(order: order),
                ),
              ),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: _kSecondary),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
                minimumSize: const Size(double.infinity, 50),
              ),
              child: Text('Order Detail',
                  style: _pjs(
                      size: 15, weight: FontWeight.w700, color: _kSecondary)),
            ),
          ),
          const SizedBox(height: 8),
          // ── Return to Purchases ──────────────────────────────────────────
          TextButton.icon(
            onPressed: () => Navigator.pop(context),
            icon: Icon(Icons.arrow_back, size: 14, color: _kSubtext),
            label: Text('Return to Purchases',
                style:
                    _pjs(size: 13, weight: FontWeight.w600, color: _kSubtext)),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

// ── Reusable product row for cancelled/detail views ───────────────────────────
class _CancelledProductRow extends StatelessWidget {
  const _CancelledProductRow({
    required this.imageUrl,
    required this.name,
    required this.sub,
    required this.qty,
    required this.price,
    required this.originalPrice,
  });
  final String imageUrl, name, sub;
  final int qty;
  final double price, originalPrice;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: Image.network(imageUrl,
              width: 64,
              height: 64,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) =>
                  Container(width: 64, height: 64, color: _kChip)),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(name,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: _pjs(size: 13, weight: FontWeight.w600)),
              Text(sub, style: _pjs(size: 11, color: _kSubtext)),
              const SizedBox(height: 4),
              Text('x$qty', style: _pjs(size: 11, color: _kSubtext)),
            ],
          ),
        ),
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text('₱${originalPrice.toStringAsFixed(0)}',
                style: _pjs(size: 11, color: _kSubtext)
                    .copyWith(decoration: TextDecoration.lineThrough)),
            Text('₱${price.toStringAsFixed(0)}',
                style: _pjs(size: 14, weight: FontWeight.w800, color: _kText)),
          ],
        ),
      ],
    );
  }
}

// ── Detail row (label + value) ────────────────────────────────────────────────
class _DetailRow extends StatelessWidget {
  const _DetailRow({
    required this.label,
    required this.value,
    this.icon,
  });
  final String label, value;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          Text(label, style: _pjs(size: 13, color: _kSubtext)),
          const Spacer(),
          if (icon != null) ...[
            Icon(icon, size: 14, color: _kSubtext),
            const SizedBox(width: 4),
          ],
          Text(value, style: _pjs(size: 13, weight: FontWeight.w600)),
        ],
      ),
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// ORDER DETAIL PAGE (reusable across all statuses)
// ═════════════════════════════════════════════════════════════════════════════
class OrderDetailPage extends StatefulWidget {
  // ignore: library_private_types_in_public_api
  const OrderDetailPage({super.key, required this.order});
  // ignore: library_private_types_in_public_api
  final _OrderItem order;

  @override
  State<OrderDetailPage> createState() => _OrderDetailPageState();
}

class _OrderDetailPageState extends State<OrderDetailPage> {
  bool _showMore = false;

  _OrderItem get o => widget.order;

  // ── Status banner config ─────────────────────────────────────────────────
  ({
    Color bg,
    Color text,
    Color border,
    IconData icon,
    String label,
    String sub
  }) get _banner {
    switch (o.status) {
      case _OrderStatus.toReceive:
        return (
          bg: _kSecondary,
          text: Colors.white,
          border: _kSecondary,
          icon: Icons.local_shipping_outlined,
          label: 'Parcel is out for delivery',
          sub: 'Estimated delivery: Today, 24 Oct (SPX Express)',
        );
      case _OrderStatus.toPay:
        return (
          bg: _kFlash,
          text: Colors.white,
          border: _kFlash,
          icon: Icons.access_time_outlined,
          label: 'Waiting for payment',
          sub: o.expiresLabel ?? 'Pay before it expires',
        );
      case _OrderStatus.toShip:
        return (
          bg: _kChip,
          text: _kSecondary,
          border: _kSecondary,
          icon: Icons.inventory_2_outlined,
          label: 'Seller is preparing your order',
          sub: 'Your order will be shipped soon',
        );
      case _OrderStatus.toReview:
      case _OrderStatus.completed:
        return (
          bg: const Color(0xFFE8F8EF),
          text: _kGreen,
          border: _kGreen,
          icon: Icons.check_circle_outline,
          label: 'Order Delivered',
          sub: o.completedDate != null ? 'Delivered on ${o.completedDate}' : '',
        );
      case _OrderStatus.cancelled:
        return (
          bg: _kRed.withValues(alpha: 0.08),
          text: _kRed,
          border: _kRed.withValues(alpha: 0.3),
          icon: Icons.cancel_outlined,
          label: 'Order Cancelled on ${o.cancelDate ?? ''}',
          sub: 'Cancelled by ${o.cancelledBy ?? 'you'}',
        );
      case _OrderStatus.refund:
        return (
          bg: _kOrange.withValues(alpha: 0.08),
          text: _kOrange,
          border: _kOrange.withValues(alpha: 0.3),
          icon: Icons.assignment_return_outlined,
          label: 'Return Requested',
          sub: o.refundStatus ?? 'Pending Review',
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final b = _banner;
    return Scaffold(
      backgroundColor: _kSurface,
      appBar: AppBar(
        backgroundColor: _kCard,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: _kText),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Order Details',
            style: _pjs(size: 17, weight: FontWeight.w800)),
        actions: [
          IconButton(
            icon: Icon(Icons.share_outlined, color: _kText, size: 20),
            onPressed: () {},
          ),
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: CircleAvatar(
              radius: 16,
              backgroundColor: _kPrimary,
              child: const Icon(Icons.person, color: Colors.white, size: 16),
            ),
          ),
        ],
      ),
      body: ListView(
        padding: EdgeInsets.zero,
        children: [
          // ── Status banner ──────────────────────────────────────────────
          Container(
            margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: b.bg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: b.border),
            ),
            child: Row(
              children: [
                Icon(b.icon, color: b.text, size: 20),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(b.label,
                          style: _pjs(
                              size: 13,
                              weight: FontWeight.w700,
                              color: b.text)),
                      if (b.sub.isNotEmpty)
                        Text(b.sub,
                            style: _pjs(
                                size: 11,
                                color: b.text.withValues(alpha: 0.75))),
                    ],
                  ),
                ),
                Icon(Icons.qr_code_outlined,
                    size: 20, color: b.text.withValues(alpha: 0.6)),
              ],
            ),
          ),
          const SizedBox(height: 12),
          // ── Shipping section ───────────────────────────────────────────
          _buildShippingSection(),
          const SizedBox(height: 8),
          // ── Delivery info ──────────────────────────────────────────────
          _buildDeliveryInfo(),
          const SizedBox(height: 8),
          // ── Store + products ───────────────────────────────────────────
          _buildProductsSection(context),
          const SizedBox(height: 8),
          // ── Order total ────────────────────────────────────────────────
          _buildOrderTotal(),
          const SizedBox(height: 8),
          // ── Support Center ─────────────────────────────────────────────
          _buildSupportCenter(context),
          const SizedBox(height: 8),
          // ── Metadata ──────────────────────────────────────────────────
          _buildMetaSection(context),
          const SizedBox(height: 8),
          // ── You May Also Like ──────────────────────────────────────────
          _buildYouMayAlsoLike(context),
          const SizedBox(height: 16),
        ],
      ),
      bottomNavigationBar: _buildBottomActions(context),
    );
  }

  Widget _buildShippingSection() {
    return Container(
      color: _kCard,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text('Shipping Information',
                  style: _pjs(size: 14, weight: FontWeight.w700)),
              const Spacer(),
              Text('Live Tracking',
                  style: _pjs(
                      size: 12, weight: FontWeight.w600, color: _kSecondary)),
              const Icon(Icons.chevron_right, size: 14, color: _kSecondary),
            ],
          ),
          const SizedBox(height: 8),
          if (o.deliveryInfo != null) ...[
            Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: _kChip,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.delivery_dining_outlined,
                      size: 16, color: _kSecondary),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child:
                      Text(o.deliveryInfo!, style: _pjs(size: 12, height: 1.4)),
                ),
              ],
            ),
            const SizedBox(height: 8),
          ],
          if (o.courierName != null)
            Row(
              children: [
                Text('${o.courierName}  •  ',
                    style: _pjs(size: 12, color: _kSubtext)),
                if (o.trackingNumber != null)
                  GestureDetector(
                    onTap: () {},
                    child: Text(o.trackingNumber!,
                        style: _pjs(size: 12, color: _kSubtext)),
                  ),
                const SizedBox(width: 6),
                GestureDetector(
                  onTap: () {},
                  child: Text('Copy',
                      style: _pjs(
                          size: 12,
                          weight: FontWeight.w700,
                          color: _kSecondary)),
                ),
              ],
            ),
        ],
      ),
    );
  }

  Widget _buildDeliveryInfo() {
    return Container(
      color: _kCard,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Delivery Information',
              style: _pjs(size: 14, weight: FontWeight.w700)),
          const SizedBox(height: 8),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.location_on_outlined,
                  size: 16, color: _kSecondary),
              const SizedBox(width: 6),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Kimzhyrelle del mundo  (+63) 948 627 3654',
                        style: _pjs(size: 13, weight: FontWeight.w700)),
                    Text(
                        'Gen. Luna st. 092, Maracta (Pob.), Lumban, Laguna, South Luzon',
                        style: _pjs(size: 12, color: _kSubtext, height: 1.4)),
                    GestureDetector(
                      onTap: () {},
                      child: Text('more',
                          style: _pjs(
                              size: 12,
                              weight: FontWeight.w700,
                              color: _kSecondary)),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildProductsSection(BuildContext context) {
    return Container(
      color: _kCard,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Store header
          Row(
            children: [
              _StoreBadgeChip(badge: o.storeBadge),
              const SizedBox(width: 6),
              Text(o.storeName, style: _pjs(size: 13, weight: FontWeight.w700)),
              const Icon(Icons.chevron_right, size: 14, color: _kSubtext),
              const Spacer(),
              Text(o.statusLabel,
                  style: _pjs(
                      size: 12, weight: FontWeight.w700, color: o.statusColor)),
            ],
          ),
          const SizedBox(height: 10),
          // Product
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.network(o.imageUrl,
                    width: 64,
                    height: 64,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) =>
                        Container(width: 64, height: 64, color: _kChip)),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(o.productName,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: _pjs(size: 13, weight: FontWeight.w600)),
                    Text(o.productSub, style: _pjs(size: 11, color: _kSubtext)),
                    const SizedBox(height: 4),
                    Text('x${o.qty}', style: _pjs(size: 11, color: _kSubtext)),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  if (o.status == _OrderStatus.cancelled)
                    Text('₱${(o.price * 2.5).toStringAsFixed(0)}',
                        style: _pjs(size: 11, color: _kSubtext)
                            .copyWith(decoration: TextDecoration.lineThrough)),
                  Text('₱${o.price.toStringAsFixed(0)}',
                      style: _pjs(
                          size: 14, weight: FontWeight.w800, color: _kText)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 8),
          // View More
          GestureDetector(
            onTap: () => setState(() => _showMore = !_showMore),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('View More',
                    style: _pjs(
                        size: 12, weight: FontWeight.w600, color: _kSubtext)),
                Icon(
                  _showMore
                      ? Icons.keyboard_arrow_up
                      : Icons.keyboard_arrow_down,
                  size: 16,
                  color: _kSubtext,
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          const Divider(color: _kBorder, height: 1),
          const SizedBox(height: 8),
          // Order total
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              Text('Total ${o.qty} item${o.qty > 1 ? 's' : ''}:  ',
                  style: _pjs(size: 13, color: _kSubtext)),
              Text('₱${o.price.toStringAsFixed(0)}',
                  style: _pjs(
                      size: 16, weight: FontWeight.w800, color: _kPrimary)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildOrderTotal() {
    return Container(
      color: _kCard,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      child: GestureDetector(
        onTap: () => setState(() => _showMore = !_showMore),
        child: Row(
          children: [
            Text('Order Total', style: _pjs(size: 14, weight: FontWeight.w700)),
            const Spacer(),
            Text('₱${o.price.toStringAsFixed(0)}',
                style:
                    _pjs(size: 16, weight: FontWeight.w800, color: _kPrimary)),
            Icon(
              _showMore ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
              size: 18,
              color: _kSubtext,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSupportCenter(BuildContext context) {
    return Container(
      color: _kCard,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Support Center',
              style: _pjs(size: 14, weight: FontWeight.w800)),
          const SizedBox(height: 8),
          _SupportRow(
            icon: Icons.chat_outlined,
            label: 'Contact Seller',
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => OrderChatPage(order: o)),
            ),
          ),
          const Divider(height: 1, color: _kBorder),
          _SupportRow(
            icon: Icons.help_outline,
            label: 'Help Center',
            onTap: () => ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Opening Help Center...',
                    style: _pjs(size: 13, color: Colors.white)),
                backgroundColor: _kPrimary,
                duration: const Duration(seconds: 2),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetaSection(BuildContext context) {
    return Container(
      color: _kCard,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      child: Column(
        children: [
          Row(
            children: [
              Text('Order ID', style: _pjs(size: 13, color: _kSubtext)),
              const Spacer(),
              Text(o.orderId, style: _pjs(size: 13, weight: FontWeight.w600)),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: () {
                  // ignore: deprecated_member_use
                  // Clipboard copy
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Order ID copied!',
                          style: _pjs(size: 13, color: Colors.white)),
                      backgroundColor: _kPrimary,
                      duration: const Duration(seconds: 1),
                    ),
                  );
                },
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: _kChip,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text('Copy',
                      style: _pjs(
                          size: 11,
                          weight: FontWeight.w700,
                          color: _kSecondary)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Text('Paid by', style: _pjs(size: 13, color: _kSubtext)),
              const Spacer(),
              Text('Cash on Delivery',
                  style: _pjs(size: 13, weight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 4),
          GestureDetector(
            onTap: () => setState(() => _showMore = !_showMore),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('View More',
                    style: _pjs(
                        size: 12, color: _kSubtext, weight: FontWeight.w600)),
                Icon(
                  _showMore ? Icons.expand_less : Icons.expand_more,
                  size: 16,
                  color: _kSubtext,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildYouMayAlsoLike(BuildContext context) {
    const seeds = [
      (
        'mascara',
        'Ashley Shine Velvet Lip Cream Matte Tint',
        65.0,
        120.0,
        4.9,
        1200,
        45
      ),
      (
        'powder',
        'Ashley Shine Oil-Control Matte Compact Powder',
        88.0,
        175.0,
        4.8,
        890,
        50
      ),
      (
        'eyeliner',
        'Ashley Shine 3D Precision Eyebrow Definer Pencil',
        49.0,
        80.0,
        5.0,
        420,
        38
      ),
      (
        'spray',
        'Ashley Shine Longwear Hydrating Setting Spray',
        109.0,
        270.0,
        4.7,
        630,
        60
      ),
    ];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 10),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.auto_awesome, size: 14, color: _kSecondary),
              const SizedBox(width: 6),
              Text('YOU MAY ALSO LIKE',
                  style: _pjs(
                      size: 12, weight: FontWeight.w800, color: _kSubtext)),
              const SizedBox(width: 6),
              const Icon(Icons.auto_awesome, size: 14, color: _kSecondary),
            ],
          ),
        ),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 12),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            childAspectRatio: 0.75,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
          ),
          itemCount: seeds.length,
          itemBuilder: (ctx, i) {
            final s = seeds[i];
            return Container(
              decoration: BoxDecoration(
                color: _kCard,
                borderRadius: BorderRadius.circular(12),
                boxShadow: const [
                  BoxShadow(
                      color: AppColors.primaryA05,
                      blurRadius: 6,
                      offset: Offset(0, 2)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Stack(
                    children: [
                      ClipRRect(
                        borderRadius: const BorderRadius.vertical(
                            top: Radius.circular(12)),
                        child: Image.network(
                          'https://picsum.photos/seed/${s.$1}/300/300',
                          height: 130,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) =>
                              Container(height: 130, color: _kChip),
                        ),
                      ),
                      Positioned(
                        top: 6,
                        left: 6,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 5, vertical: 2),
                          decoration: BoxDecoration(
                            color: _kFlash,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text('-${s.$7}%',
                              style: _pjs(
                                  size: 10,
                                  weight: FontWeight.w800,
                                  color: Colors.white)),
                        ),
                      ),
                    ],
                  ),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(8, 6, 8, 6),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(s.$2,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: _pjs(
                                size: 11,
                                weight: FontWeight.w600,
                                height: 1.3)),
                        const SizedBox(height: 3),
                        Row(
                          children: [
                            Icon(Icons.star_rounded,
                                size: 11, color: AppColors.star),
                            const SizedBox(width: 2),
                            Text(
                                '${s.$5} (${s.$6 >= 1000 ? '${(s.$6 / 1000).toStringAsFixed(1)}k' : s.$6})',
                                style: _pjs(size: 9, color: _kSubtext)),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('₱${s.$4.toStringAsFixed(0)}',
                                    style: _pjs(size: 10, color: _kSubtext)
                                        .copyWith(
                                            decoration:
                                                TextDecoration.lineThrough)),
                                Text('₱${s.$3.toStringAsFixed(0)}',
                                    style: _pjs(
                                        size: 14,
                                        weight: FontWeight.w800,
                                        color: _kPrimary)),
                              ],
                            ),
                            Container(
                              width: 28,
                              height: 28,
                              decoration: const BoxDecoration(
                                  color: _kPrimary, shape: BoxShape.circle),
                              child: const Icon(Icons.add_shopping_cart,
                                  size: 14, color: Colors.white),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildBottomActions(BuildContext context) {
    switch (o.status) {
      case _OrderStatus.cancelled:
        return _BottomActionBar(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (_) => CancellationDetailsPage(order: o)),
                ),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: _kBorder),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10)),
                  minimumSize: const Size(0, 48),
                ),
                child: Text('Cancellation Details',
                    style:
                        _pjs(size: 13, weight: FontWeight.w700, color: _kText)),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: ElevatedButton(
                onPressed: () => showBuyAgainModal(context, o),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _kPrimary,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10)),
                  minimumSize: const Size(0, 48),
                ),
                child: Text('Buy Again',
                    style: _pjs(
                        size: 13,
                        weight: FontWeight.w700,
                        color: Colors.white)),
              ),
            ),
          ],
        );
      case _OrderStatus.toReceive:
        return _BottomActionBar(children: [
          Expanded(
            child: OutlinedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.chat_outlined, size: 14, color: _kPrimary),
              label: Text('Contact Seller',
                  style: _pjs(
                      size: 13, weight: FontWeight.w700, color: _kPrimary)),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: _kBorder),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10)),
                minimumSize: const Size(0, 48),
              ),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: ElevatedButton(
              onPressed: () {},
              style: ElevatedButton.styleFrom(
                backgroundColor: _kPrimary,
                elevation: 0,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10)),
                minimumSize: const Size(0, 48),
              ),
              child: Text('Order Received',
                  style: _pjs(
                      size: 13, weight: FontWeight.w700, color: Colors.white)),
            ),
          ),
        ]);
      default:
        return _BottomActionBar(children: [
          Expanded(
            child: OutlinedButton(
              onPressed: () {},
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: _kBorder),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10)),
                minimumSize: const Size(0, 48),
              ),
              child: Text('Contact Seller',
                  style:
                      _pjs(size: 13, weight: FontWeight.w700, color: _kText)),
            ),
          ),
        ]);
    }
  }
}

// ── Bottom action bar wrapper ─────────────────────────────────────────────────
class _BottomActionBar extends StatelessWidget {
  const _BottomActionBar({required this.children});
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: _kCard,
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 20),
      child: SafeArea(
        top: false,
        child: Row(children: children),
      ),
    );
  }
}

// ── Store badge chip ──────────────────────────────────────────────────────────
class _StoreBadgeChip extends StatelessWidget {
  const _StoreBadgeChip({required this.badge});
  final String badge;

  Color get _bgColor {
    if (badge == 'MALL') return _kSecondary;
    if (badge == 'PREFERRED') return _kPrimary;
    return _kSubtext;
  }

  @override
  Widget build(BuildContext context) {
    if (badge.isEmpty) return const SizedBox.shrink();
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: _bgColor,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(badge,
          style: _pjs(size: 9, weight: FontWeight.w800, color: Colors.white)),
    );
  }
}

// ── Support row ───────────────────────────────────────────────────────────────
class _SupportRow extends StatelessWidget {
  const _SupportRow({
    required this.icon,
    required this.label,
    required this.onTap,
  });
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 10),
        child: Row(
          children: [
            Icon(icon, size: 18, color: _kSecondary),
            const SizedBox(width: 12),
            Expanded(
                child: Text(label,
                    style: _pjs(size: 13, weight: FontWeight.w600))),
            const Icon(Icons.chevron_right, size: 18, color: _kSubtext),
          ],
        ),
      ),
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// BUY AGAIN MODAL — shown as bottom sheet
// ═════════════════════════════════════════════════════════════════════════════
void showBuyAgainModal(BuildContext context, _OrderItem order) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => CartProvider(
      cart: CartProvider.of(context),
      child: _BuyAgainSheet(order: order),
    ),
  );
}

class _BuyAgainSheet extends StatefulWidget {
  // ignore: library_private_types_in_public_api
  const _BuyAgainSheet({required this.order});
  // ignore: library_private_types_in_public_api
  final _OrderItem order;

  @override
  State<_BuyAgainSheet> createState() => _BuyAgainSheetState();
}

class _BuyAgainSheetState extends State<_BuyAgainSheet> {
  // Simulate stock check: the first item (the order's product) is in stock,
  // any hypothetical additional items use a simple odd/even rule.
  // Replace with a real API call when the backend is live.

  // For this single-product order model, we generate a 2-item view to match
  // the design (one available, one out of stock) to demonstrate the UI.
  late final List<_ReorderItem> _items;

  @override
  void initState() {
    super.initState();
    _items = [
      _ReorderItem(
        imageUrl: widget.order.imageUrl,
        name: widget.order.productName,
        sub: widget.order.productSub,
        price: widget.order.price,
        qty: widget.order.qty,
        isAvailable: true,
        selected: true,
      ),
      // Simulated second item — out of stock
      _ReorderItem(
        imageUrl: 'https://picsum.photos/seed/eyeliner/200/200',
        name: '${widget.order.storeName} — Related Item',
        sub: widget.order.productSub,
        price: widget.order.price * 0.75,
        qty: 2,
        isAvailable: false,
        selected: false,
      ),
    ];
  }

  int get _selectedCount =>
      _items.where((i) => i.isAvailable && i.selected).length;
  int get _totalCount => _items.length;
  int get _availableCount => _items.where((i) => i.isAvailable).length;

  void _addToCart() {
    final cart = CartProvider.of(context);
    for (final item in _items) {
      if (!item.isAvailable || !item.selected) continue;
      // Convert to Product for CartState.add()
      final product = Product(
        id: item.name.hashCode,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        category: widget.order.storeName,
        rating: 4.5,
        reviewCount: 0,
      );
      for (var i = 0; i < item.qty; i++) {
        cart.add(product);
      }
    }
    Navigator.pop(context); // close modal
    // Navigate to Cart tab — find the HomePage and switch tab
    Navigator.of(context).popUntil((route) => route.isFirst);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: _kCard,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle
          Container(
            margin: const EdgeInsets.only(top: 10),
            width: 36,
            height: 4,
            decoration: BoxDecoration(
              color: _kBorder,
              borderRadius: BorderRadius.circular(9999),
            ),
          ),
          // Title row
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            child: Row(
              children: [
                Text('Add Available Item(s) to Cart',
                    style: _pjs(size: 16, weight: FontWeight.w800)),
                const Spacer(),
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Text('close', style: _pjs(size: 13, color: _kSubtext)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          // Stock summary banner
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: _kChip,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Icon(Icons.info_outline, size: 14, color: _kSecondary),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      '$_availableCount of $_totalCount item${_totalCount > 1 ? 's' : ''} '
                      '${_availableCount == 1 ? 'is' : 'are'} currently in stock and ready to reorder.',
                      style: _pjs(size: 12, color: _kSecondary, height: 1.4),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          // Items list
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: _items.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (_, i) => _ReorderItemTile(
              item: _items[i],
              onToggle: _items[i].isAvailable
                  ? () =>
                      setState(() => _items[i].selected = !_items[i].selected)
                  : null,
            ),
          ),
          const SizedBox(height: 16),
          // Add to Cart button
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 20),
            child: SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                onPressed: _selectedCount > 0 ? _addToCart : null,
                icon: const Icon(Icons.shopping_bag_outlined,
                    size: 18, color: Colors.white),
                label: Text('Add to Cart ($_selectedCount)',
                    style: _pjs(
                        size: 15,
                        weight: FontWeight.w700,
                        color: Colors.white)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _kPrimary,
                  disabledBackgroundColor: _kBorder,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
          ),
          SizedBox(height: MediaQuery.of(context).padding.bottom),
        ],
      ),
    );
  }
}

// ── Reorder item model ────────────────────────────────────────────────────────
class _ReorderItem {
  _ReorderItem({
    required this.imageUrl,
    required this.name,
    required this.sub,
    required this.price,
    required this.qty,
    required this.isAvailable,
    required this.selected,
  });
  final String imageUrl, name, sub;
  final double price;
  final int qty;
  final bool isAvailable;
  bool selected;
}

// ── Reorder item tile ─────────────────────────────────────────────────────────
class _ReorderItemTile extends StatelessWidget {
  const _ReorderItemTile({required this.item, this.onToggle});
  final _ReorderItem item;
  final VoidCallback? onToggle;

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: item.isAvailable ? 1.0 : 0.55,
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: _kSurface,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
              color:
                  item.isAvailable && item.selected ? _kSecondary : _kBorder),
        ),
        child: Row(
          children: [
            // Image with overlay badge
            Stack(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.network(item.imageUrl,
                      width: 64,
                      height: 64,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) =>
                          Container(width: 64, height: 64, color: _kChip)),
                ),
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 3),
                    decoration: BoxDecoration(
                      color:
                          item.isAvailable ? _kGreen : const Color(0xFF666666),
                      borderRadius: const BorderRadius.vertical(
                          bottom: Radius.circular(8)),
                    ),
                    child: Center(
                      child: Text(
                        item.isAvailable ? 'READY' : 'Invalid',
                        style: _pjs(
                            size: 9,
                            weight: FontWeight.w800,
                            color: Colors.white),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(width: 10),
            // Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(item.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: _pjs(
                          size: 13,
                          weight: FontWeight.w600,
                          color: item.isAvailable ? _kText : _kSubtext)),
                  const SizedBox(height: 2),
                  if (!item.isAvailable)
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: _kBorder,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text('Out of stock',
                          style: _pjs(size: 10, color: _kSubtext)),
                    )
                  else
                    Text(item.sub, style: _pjs(size: 11, color: _kSubtext)),
                  const SizedBox(height: 4),
                  Text('₱${item.price.toStringAsFixed(0)}',
                      style: _pjs(
                          size: 14,
                          weight: FontWeight.w800,
                          color: item.isAvailable ? _kPrimary : _kSubtext)),
                ],
              ),
            ),
            // Right side: qty + checkbox/block
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text('x${item.qty}', style: _pjs(size: 12, color: _kSubtext)),
                const SizedBox(height: 8),
                GestureDetector(
                  onTap: onToggle,
                  child: item.isAvailable
                      ? Container(
                          width: 24,
                          height: 24,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: item.selected
                                ? _kSecondary
                                : Colors.transparent,
                            border: Border.all(
                                color: item.selected ? _kSecondary : _kBorder,
                                width: 1.5),
                          ),
                          child: item.selected
                              ? const Icon(Icons.check,
                                  size: 14, color: Colors.white)
                              : null,
                        )
                      : Icon(Icons.block_outlined, size: 22, color: _kBorder),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ── Info card widget ──────────────────────────────────────────────────────────
class _InfoCard extends StatelessWidget {
  const _InfoCard({
    required this.title,
    required this.rows,
    this.titleColor,
  });
  final String title;
  final List<(String, String)> rows;
  final Color? titleColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
          color: _kCard,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: _kBorder)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title,
              style: _pjs(
                  size: 13,
                  weight: FontWeight.w800,
                  color: titleColor ?? _kText)),
          const SizedBox(height: 10),
          ...rows.map((row) => Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Row(
                  children: [
                    SizedBox(
                      width: 120,
                      child:
                          Text(row.$1, style: _pjs(size: 12, color: _kSubtext)),
                    ),
                    Expanded(
                        child: Text(row.$2,
                            style: _pjs(size: 12, weight: FontWeight.w600))),
                  ],
                ),
              )),
        ],
      ),
    );
  }
}

// ── Legacy ORDER CHAT PAGE (inline stub — superseded by order_chat_page.dart)
class _LegacyOrderChatPage extends StatefulWidget {
  const _LegacyOrderChatPage({required this.order});
  final _OrderItem order;
  @override
  State<_LegacyOrderChatPage> createState() => _LegacyOrderChatPageState();
}

class _LegacyOrderChatPageState extends State<_LegacyOrderChatPage> {
  @override
  Widget build(BuildContext context) => const SizedBox.shrink();
}
