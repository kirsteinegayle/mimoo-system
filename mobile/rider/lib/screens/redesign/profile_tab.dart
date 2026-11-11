import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../../core/auth_controller.dart';
import '../../core/rider_status_controller.dart';
import '../../core/theme.dart';
import '../../data/repositories/app_repositories_scope.dart';
import '../../mock/rider_mock.dart';
import '../../widgets/motion.dart';
import 'inbox_screen.dart';
import 'job_actions.dart' show openMessages;
import 'job_router.dart';
import 'state_gallery_screen.dart';

/// Profile tab: identity, hub/vehicle info, and links (Vehicle & Documents,
/// Messages, Notifications, Settings, Help Center, Logout).
/// Profile values are MOCK data.
class ProfileTab extends StatelessWidget {
  const ProfileTab({super.key});

  Future<void> _logout(BuildContext context) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (c) => AlertDialog(
        icon: Icon(Icons.logout, color: MC.of(c).coral),
        title: const Text('Log out?'),
        content: const Text(
            "You'll need to sign in again to see your assigned jobs."),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(c, false),
              child: const Text('Cancel')),
          FilledButton(
              style: FilledButton.styleFrom(
                  backgroundColor: MC.of(c).coral),
              onPressed: () => Navigator.pop(c, true),
              child: const Text('Log out')),
        ],
      ),
    );
    if (ok != true || !context.mounted) return;
    // Same sign-out sequence as the existing Settings screen.
    final repositories = AppRepositoriesScope.of(context);
    await RiderMock.instance.signOut(); // API mode: revoke token + clear data
    await repositories.signOut();
    if (!context.mounted) return;
    AuthScope.of(context).signOut();
    Navigator.pushNamedAndRemoveUntil(context, '/login', (_) => false);
  }

  @override
  Widget build(BuildContext context) {
    final mock = RiderMock.instance;
    final online = RiderStatusScope.of(context).isOnline;
    return ListenableBuilder(
      listenable: mock,
      builder: (context, _) {
        final c = MC.of(context);
        final p = mock.profile;
        final sections = <Widget>[
          // Identity card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [MC.violetDark, MC.violet],
              ),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                    color: MC.violet.withValues(alpha: 0.25),
                    blurRadius: 16,
                    offset: const Offset(0, 6)),
              ],
            ),
            child: Row(children: [
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withValues(alpha: 0.16),
                  border: Border.all(color: Colors.white54, width: 2),
                ),
                alignment: Alignment.center,
                child: Text(p.initials,
                    style: ts(22, w: FontWeight.w800, c: Colors.white)),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(p.name,
                      style: ts(19, w: FontWeight.w800, c: Colors.white),
                      maxLines: 2),
                  Text(p.riderId,
                      style: ts(12, c: Colors.white.withValues(alpha: 0.7))),
                  const SizedBox(height: 8),
                  Wrap(spacing: 6, runSpacing: 6, children: [
                    _chip(Icons.verified, p.status, MC.greenSoft, c.green),
                    _chip(
                        online ? Icons.circle : Icons.circle_outlined,
                        online ? 'Online' : 'Offline',
                        online ? MC.greenSoft : Colors.white24,
                        online ? c.green : Colors.white),
                  ]),
                ]),
              ),
            ]),
          ),
          // Info
          MCard(
            radius: 20,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Column(children: [
              _info(
                  c,
                  Icons.warehouse_outlined,
                  'Hub',
                  p.hubAssigned
                      ? [p.hub, if (p.hubAddress != null) p.hubAddress!].join('\n')
                      : 'Not assigned yet'
                          '${p.courierCompany != null ? ' · ${p.courierCompany}' : ''}'),
              const Divider(height: 1),
              _info(c, Icons.location_city_outlined, 'Municipality',
                  p.municipality),
              const Divider(height: 1),
              _info(c, Icons.two_wheeler, 'Vehicle type',
                  '${p.vehicleType} · ${p.plateNo}'),
            ]),
          ),
          // Links
          MCard(
            radius: 20,
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Column(children: [
              _link(c, Icons.badge_outlined, 'Vehicle & Documents',
                  () => Navigator.pushNamed(context, '/vehicle-documents')),
              _divider(),
              _link(c, Icons.chat_bubble_outline_rounded, 'Messages',
                  () => openMessages(context),
                  badge: mock.unreadMessages),
              _divider(),
              _link(
                  c,
                  Icons.notifications_none_rounded,
                  'Notifications',
                  () => Navigator.of(context).push(MaterialPageRoute<void>(
                      builder: (_) =>
                          const InboxScreen(onOpenJob: openJobDetail))),
                  badge: mock.unreadNotifications),
              _divider(),
              _link(c, Icons.settings_outlined, 'Settings',
                  () => Navigator.pushNamed(context, '/settings')),
              _divider(),
              _link(c, Icons.help_outline, 'Help Center',
                  () => Navigator.pushNamed(context, '/help-center')),
              if (kDebugMode) ...[
                _divider(),
                _link(
                    c,
                    Icons.palette_outlined,
                    'State gallery (debug)',
                    () => Navigator.of(context).push(MaterialPageRoute<void>(
                        builder: (_) => const StateGalleryScreen()))),
              ],
            ]),
          ),
          PillButton('Log out',
              icon: Icons.logout,
              trailing: null,
              style: BtnStyle.outline,
              fg: c.coral,
              onPressed: () => _logout(context)),
        ];
        return Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 600),
            child: ListView.separated(
              padding: MS.pagePadding,
              itemCount: sections.length,
              separatorBuilder: (_, __) => const SizedBox(height: MS.md),
              itemBuilder: (context, i) =>
                  FadeSlideIn.stagger(i, child: sections[i]),
            ),
          ),
        );
      },
    );
  }

  static Widget _divider() =>
      const Divider(height: 1, indent: 56, endIndent: 16);

  static Widget _chip(IconData icon, String text, Color bg, Color fg) =>
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
            color: bg, borderRadius: BorderRadius.circular(99)),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(icon, size: 12, color: fg),
          const SizedBox(width: 4),
          Text(text.toUpperCase(),
              style: ts(11, w: FontWeight.w800, c: fg)),
        ]),
      );

  static Widget _info(MimooColors c, IconData icon, String label, String value) =>
      ListTile(
        contentPadding: EdgeInsets.zero,
        leading: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
              color: c.tint, borderRadius: BorderRadius.circular(12)),
          child: Icon(icon, color: c.primary, size: 20),
        ),
        title: Text(label, style: MT.bodySm.copyWith(color: c.muted)),
        subtitle: Text(value, style: MT.labelLg.copyWith(color: c.text)),
      );

  static Widget _link(
          MimooColors c, IconData icon, String label, VoidCallback onTap,
          {int badge = 0}) =>
      ListTile(
        minTileHeight: 56,
        leading: Icon(icon, color: c.primary),
        title: Text(label, style: MT.labelLg),
        trailing: Row(mainAxisSize: MainAxisSize.min, children: [
          PopBadge(count: badge, borderColor: c.lowest),
          const SizedBox(width: 4),
          Icon(Icons.chevron_right, color: c.muted),
        ]),
        onTap: onTap,
      );
}
