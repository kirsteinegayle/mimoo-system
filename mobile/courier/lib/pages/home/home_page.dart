import 'package:flutter/material.dart';
import '../../state/auth_service.dart';
import '../../theme/mimoo_theme.dart';
import '../auth/login_page.dart';
import '../dashboard/dashboard_tab.dart';
import '../shipments/shipments_tab.dart';
import '../pickups/pickups_tab.dart';
import '../scan/scan_tab.dart';

// ── Coming-soon placeholder (reserved for future screens) ────────────────────
// ignore: unused_element
class _ComingSoon extends StatelessWidget {
  const _ComingSoon({required this.icon, required this.label});
  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) => Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Container(
              width: 72,
              height: 72,
              decoration:
                  const BoxDecoration(color: kChip, shape: BoxShape.circle),
              child: Icon(icon, size: 34, color: kPrimary),
            ),
            const SizedBox(height: 16),
            Text(label,
                style: pjs(size: 17, weight: FontWeight.w800),
                textAlign: TextAlign.center),
            const SizedBox(height: 8),
            Text('Coming soon',
                style:
                    pjs(size: 13, color: kSecondary, weight: FontWeight.w600)),
          ]),
        ),
      );
}

// ── Account Tab ───────────────────────────────────────────────────────────────
class _AccountTab extends StatelessWidget {
  const _AccountTab();

  @override
  Widget build(BuildContext context) {
    final auth = AuthService.instance;
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Account', style: pjs(size: 22, weight: FontWeight.w800)),
          const SizedBox(height: 20),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: kCard,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: kBorder),
            ),
            child: Row(children: [
              const CircleAvatar(
                backgroundColor: kChip,
                radius: 24,
                child: Icon(Icons.business_outlined, color: kPrimary),
              ),
              const SizedBox(width: 14),
              Expanded(
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                    Text(auth.companyName ?? 'Courier Company',
                        style: pjs(size: 15, weight: FontWeight.w700)),
                    if (auth.courierName != null)
                      Text(auth.courierName!,
                          style: pjs(size: 12, color: kSubtext)),
                    if (auth.courierEmail != null)
                      Text(auth.courierEmail!,
                          style: pjs(size: 12, color: kSubtext)),
                  ])),
            ]),
          ),
          const Spacer(),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: OutlinedButton.icon(
              onPressed: () async {
                await AuthService.instance.logout();
                if (!context.mounted) return;
                Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(builder: (_) => const LoginPage()),
                  (route) => false,
                );
              },
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: kFlash),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(Icons.logout, color: kFlash, size: 18),
              label: Text('Log out',
                  style: pjs(size: 14, weight: FontWeight.w700, color: kFlash)),
            ),
          ),
        ]),
      ),
    );
  }
}

// ── Home Page ─────────────────────────────────────────────────────────────────
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
    PickupsTab(),
    ScanTab(),
    _AccountTab(),
  ];

  static const _labels = [
    'Dashboard',
    'Shipments',
    'Pickups',
    'Scan',
    'Account'
  ];

  static const _icons = [
    Icons.dashboard_outlined,
    Icons.assignment_outlined,
    Icons.local_shipping_outlined,
    Icons.qr_code_scanner_outlined,
    Icons.person_outline,
  ];

  static const _activeIcons = [
    Icons.dashboard,
    Icons.assignment,
    Icons.local_shipping,
    Icons.qr_code_scanner,
    Icons.person,
  ];

  static const _appBarTitles = [
    'Dashboard',
    'Incoming Shipments',
    'Pickup Management',
    'Parcel Scan',
    'Account',
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
}
