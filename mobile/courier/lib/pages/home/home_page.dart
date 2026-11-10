import 'package:flutter/material.dart';
import '../../services/courier_repository.dart';
import '../../state/auth_service.dart';
import '../../theme/mimoo_theme.dart';
import '../account/account_tab.dart';
import '../dashboard/dashboard_tab.dart';
import '../messages/messages_page.dart';
import '../notifications/notifications_page.dart';
import '../pickups/pickups_tab.dart';
import '../scan/scan_tab.dart';
import '../shipments/shipments_tab.dart';
import '../trips/trips_page.dart';
import 'courier_menu_pages.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _selectedIndex = 0;

  static const _tabs = [
    DashboardTab(),
    ShipmentsTab(),
    ScanTab(),
    PickupsTab(),
    TripsPage(embedded: true),
  ];

  static const _labels = [
    'Home',
    'Shipments',
    'Scan',
    'Pickup',
    'Delivery',
  ];

  static const _icons = [
    Icons.home_outlined,
    Icons.assignment_outlined,
    Icons.qr_code_scanner_outlined,
    Icons.local_shipping_outlined,
    Icons.route_outlined,
  ];

  static const _activeIcons = [
    Icons.home,
    Icons.assignment,
    Icons.qr_code_scanner,
    Icons.local_shipping,
    Icons.route,
  ];

  static const _appBarTitles = [
    'Home',
    'Incoming Shipments',
    'Parcel Scan',
    'Pickup Management',
    'Delivery Management',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kSurface,
      appBar: AppBar(
        backgroundColor: kCard,
        title: Text(_appBarTitles[_selectedIndex],
            style: pjs(size: 17, weight: FontWeight.w800)),
        elevation: 0,
        actions: _selectedIndex == 0
            ? const [_HomeHeaderActions(), SizedBox(width: 4)]
            : null,
      ),
      drawer: _CourierDrawer(
        onAccount: () => _openPage(
          Scaffold(
            backgroundColor: kSurface,
            appBar: AppBar(
              backgroundColor: kCard,
              title: Text('Account',
                  style: pjs(size: 17, weight: FontWeight.w800)),
            ),
            body: const AccountTab(),
          ),
        ),
        onNotifications: () => _openPage(const NotificationsPage()),
        onMessages: () => _openPage(const MessagesPage()),
        onRiderManagement: () => _openPage(const CourierMenuPage(
          title: 'Rider Management',
          icon: Icons.groups_outlined,
          message: 'No rider records are available yet.',
        )),
        onCodRemittance: () => _openPage(const CourierMenuPage(
          title: 'COD & Remittance',
          icon: Icons.account_balance_wallet_outlined,
          message: 'No COD or remittance records are available yet.',
        )),
        onHelpCenter: () => _openPage(const HelpCenterPage()),
      ),
      body: IndexedStack(index: _selectedIndex, children: _tabs),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (i) => setState(() => _selectedIndex = i),
        backgroundColor: kCard,
        indicatorColor: kChip,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        destinations: List.generate(
            _labels.length,
            (i) => NavigationDestination(
                  icon: Icon(_icons[i], color: kSubtext),
                  selectedIcon: Icon(_activeIcons[i], color: kPrimary),
                  label: _labels[i],
                )),
      ),
    );
  }

  void _openPage(Widget page) {
    Navigator.pop(context);
    Navigator.push(context, MaterialPageRoute(builder: (_) => page));
  }
}

class _CourierDrawer extends StatelessWidget {
  const _CourierDrawer({
    required this.onAccount,
    required this.onNotifications,
    required this.onMessages,
    required this.onRiderManagement,
    required this.onCodRemittance,
    required this.onHelpCenter,
  });

  final VoidCallback onAccount;
  final VoidCallback onNotifications;
  final VoidCallback onMessages;
  final VoidCallback onRiderManagement;
  final VoidCallback onCodRemittance;
  final VoidCallback onHelpCenter;

  @override
  Widget build(BuildContext context) {
    final auth = AuthService.instance;

    return Drawer(
      backgroundColor: kSurface,
      child: SafeArea(
        child: Column(
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [kPrimary, kSecondary],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.local_shipping_outlined,
                      color: Colors.white, size: 30),
                  const SizedBox(height: 14),
                  Text(
                    auth.companyName ?? 'Mimoo Courier',
                    style: pjs(
                        size: 16, weight: FontWeight.w800, color: Colors.white),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    auth.courierName ?? 'Courier account',
                    style: pjs(size: 12, color: Colors.white70),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 8),
                children: [
                  _DrawerItem(
                    icon: Icons.person_outline,
                    label: 'Account',
                    onTap: () {
                      onAccount();
                    },
                  ),
                  _DrawerItem(
                    icon: Icons.notifications_none_outlined,
                    label: 'Notification',
                    onTap: onNotifications,
                  ),
                  _DrawerItem(
                    icon: Icons.chat_bubble_outline,
                    label: 'Message',
                    onTap: onMessages,
                  ),
                  const Divider(height: 16, indent: 16, endIndent: 16),
                  _DrawerItem(
                    icon: Icons.groups_outlined,
                    label: 'Rider Management',
                    onTap: onRiderManagement,
                  ),
                  _DrawerItem(
                    icon: Icons.account_balance_wallet_outlined,
                    label: 'COD & Remittance',
                    onTap: onCodRemittance,
                  ),
                  const Divider(height: 16, indent: 16, endIndent: 16),
                  _DrawerItem(
                    icon: Icons.help_outline,
                    label: 'Help Center',
                    onTap: onHelpCenter,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DrawerItem extends StatelessWidget {
  const _DrawerItem({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: kSubtext),
      title: Text(
        label,
        style: pjs(size: 13, weight: FontWeight.w600, color: kText),
      ),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      contentPadding: const EdgeInsets.symmetric(horizontal: 20),
      onTap: onTap,
    );
  }
}

class _HomeHeaderActions extends StatefulWidget {
  const _HomeHeaderActions();

  @override
  State<_HomeHeaderActions> createState() => _HomeHeaderActionsState();
}

class _HomeHeaderActionsState extends State<_HomeHeaderActions> {
  int _messages = 0;
  int _notifications = 0;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    var messages = 0;
    var notifications = 0;
    try {
      messages = await CourierRepository.instance.unreadMessageCount();
    } catch (_) {}
    try {
      notifications =
          await CourierRepository.instance.unreadNotificationCount();
    } catch (_) {}
    if (!mounted) return;
    setState(() {
      _messages = messages;
      _notifications = notifications;
    });
  }

  Future<void> _open(Widget page) async {
    await Navigator.push(context, MaterialPageRoute(builder: (_) => page));
    if (mounted) _load();
  }

  @override
  Widget build(BuildContext context) {
    return Row(mainAxisSize: MainAxisSize.min, children: [
      _BadgeIcon(
        icon: Icons.chat_bubble_outline_rounded,
        tooltip: 'Messages',
        count: _messages,
        onTap: () => _open(const MessagesPage()),
      ),
      _BadgeIcon(
        icon: Icons.notifications_none_rounded,
        tooltip: 'Notifications',
        count: _notifications,
        onTap: () => _open(const NotificationsPage()),
      ),
    ]);
  }
}

class _BadgeIcon extends StatelessWidget {
  const _BadgeIcon({
    required this.icon,
    required this.tooltip,
    required this.count,
    required this.onTap,
  });
  final IconData icon;
  final String tooltip;
  final int count;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Stack(alignment: Alignment.center, children: [
      IconButton(
        tooltip: tooltip,
        onPressed: onTap,
        icon: Icon(icon, color: kText, size: 22),
      ),
      if (count > 0)
        Positioned(
          top: 8,
          right: 7,
          child: Container(
            constraints: const BoxConstraints(minWidth: 17, minHeight: 17),
            padding: const EdgeInsets.symmetric(horizontal: 4),
            decoration: BoxDecoration(
              color: kFlash,
              borderRadius: BorderRadius.circular(99),
              border: Border.all(color: kCard, width: 1.4),
            ),
            child: Center(
              child: Text(
                count > 9 ? '9+' : '$count',
                style:
                    pjs(size: 9, weight: FontWeight.w900, color: Colors.white),
              ),
            ),
          ),
        ),
    ]);
  }
}
