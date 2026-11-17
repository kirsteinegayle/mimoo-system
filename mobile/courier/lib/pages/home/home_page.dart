import 'package:flutter/material.dart';
import '../../config/features.dart';
import '../../services/courier_repository.dart';
import '../../state/auth_service.dart';
import '../../theme/mimoo_theme.dart';
import '../account/account_tab.dart';
import '../account/company_settings_page.dart';
import '../branch_assign/branch_assign_page.dart';
import '../cod/cod_remittance_page.dart';
import '../facilities/facilities_page.dart';
import '../support/support_page.dart';
import '../transfers/transfers_page.dart';
import '../dashboard/dashboard_tab.dart';
import '../delivery/delivery_management_page.dart';
import '../messages/messages_page.dart';
import '../notifications/notifications_page.dart';
import '../riders/rider_management_page.dart';
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

  // Not const: the dashboard's Quick Actions switch tabs / open pages here.
  late final List<Widget> _tabs = [
    DashboardTab(
      onOpenTab: (i) => setState(() => _selectedIndex = i),
      onOpenPage: _openPage,
    ),
    const ShipmentsTab(),
    const ScanTab(),
    // New Assign per branch (replaces the removed Pickup Management tab):
    // pickup + delivery riders, grouped by branch.
    const BranchAssignPage(),
    // Delivery tab: rider assignment (same as web Delivery Management).
    // Linehaul trips have no backend route yet (CourierFeatures.trips).
    CourierFeatures.trips
        ? const TripsPage(embedded: true)
        : const DeliveryManagementPage(),
  ];

  static const _labels = [
    'Home',
    'Shipments',
    'Scan',
    'Assign',
    'Delivery',
  ];

  static const _icons = [
    Icons.home_outlined,
    Icons.assignment_outlined,
    Icons.qr_code_scanner_outlined,
    Icons.assignment_ind_outlined,
    Icons.route_outlined,
  ];

  static const _activeIcons = [
    Icons.home,
    Icons.assignment,
    Icons.qr_code_scanner,
    Icons.assignment_ind,
    Icons.route,
  ];

  static const _appBarTitles = [
    'Home',
    'Incoming Shipments',
    'Parcel Scan',
    'New Assign',
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
        // Message / notification icons only when their backend exists.
        actions: _selectedIndex == 0 &&
                (CourierFeatures.messages || CourierFeatures.notifications)
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
        onRiderManagement: () => _openPage(const RiderManagementPage()),
        onCodRemittance: () => _openPage(const CodRemittancePage()),
        onTransfers: () => _openPage(const TransfersPage()),
        onFacilities: () => _openPage(const FacilitiesPage()),
        onSupport: () => _openPage(const SupportPage()),
        onCompanySettings: () => _openPage(const CompanySettingsPage()),
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
    required this.onTransfers,
    required this.onFacilities,
    required this.onSupport,
    required this.onCompanySettings,
    required this.onHelpCenter,
  });

  final VoidCallback onAccount;
  final VoidCallback onNotifications;
  final VoidCallback onMessages;
  final VoidCallback onRiderManagement;
  final VoidCallback onCodRemittance;
  final VoidCallback onTransfers;
  final VoidCallback onFacilities;
  final VoidCallback onSupport;
  final VoidCallback onCompanySettings;
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
                  if (CourierFeatures.notifications)
                    _DrawerItem(
                      icon: Icons.notifications_none_outlined,
                      label: 'Notification',
                      onTap: onNotifications,
                    ),
                  if (CourierFeatures.messages)
                    _DrawerItem(
                      icon: Icons.chat_bubble_outline,
                      label: 'Message',
                      onTap: onMessages,
                    ),
                  const _DrawerSection('Operations'),
                  _DrawerItem(
                    icon: Icons.swap_horiz,
                    label: 'Sorting & Transfers',
                    onTap: onTransfers,
                  ),
                  _DrawerItem(
                    icon: Icons.warehouse_outlined,
                    label: 'Branches & Facilities',
                    onTap: onFacilities,
                  ),
                  _DrawerItem(
                    icon: Icons.groups_outlined,
                    label: 'Rider Management',
                    onTap: onRiderManagement,
                  ),
                  const _DrawerSection('Money'),
                  _DrawerItem(
                    icon: Icons.account_balance_wallet_outlined,
                    label: 'COD & Remittance',
                    onTap: onCodRemittance,
                  ),
                  const _DrawerSection('Company'),
                  _DrawerItem(
                    icon: Icons.business_outlined,
                    label: 'Company Settings',
                    onTap: onCompanySettings,
                  ),
                  _DrawerItem(
                    icon: Icons.support_agent_outlined,
                    label: 'Support',
                    onTap: onSupport,
                  ),
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

class _DrawerSection extends StatelessWidget {
  const _DrawerSection(this.title);
  final String title;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(20, 14, 20, 4),
        child: Text(title.toUpperCase(),
            style: pjs(size: 11, weight: FontWeight.w800, color: kSubtext)),
      );
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
      minVerticalPadding: 12,
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
                    pjs(size: 11, weight: FontWeight.w900, color: Colors.white),
              ),
            ),
          ),
        ),
    ]);
  }
}
