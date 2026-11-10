import 'package:flutter/material.dart';
import '../../models/courier_models.dart';
import '../../services/api_service.dart';
import '../../services/courier_repository.dart';
import '../../services/location_service.dart';
import '../../state/auth_service.dart';
import '../../theme/mimoo_theme.dart';
import '../../widgets/courier_shared.dart';
import '../auth/login_page.dart';
import '../history/history_page.dart';
import '../trips/trip_detail_page.dart';
import '../trips/trips_page.dart';
import 'change_password_page.dart';
import 'documents_page.dart';
import 'duty_checklist_page.dart';
import 'profile_page.dart';

class AccountTab extends StatefulWidget {
  const AccountTab({super.key});

  @override
  State<AccountTab> createState() => _AccountTabState();
}

class _AccountTabState extends State<AccountTab> {
  CourierProfile? _profile;
  DutyState? _duty;
  CourierTrip? _activeTrip;
  bool _loading = true;
  bool _updatingDuty = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  CourierProfile _fallbackProfile() {
    final auth = AuthService.instance;
    return CourierProfile(
      id: int.tryParse(auth.courierId ?? '') ?? 0,
      name: auth.courierName ?? '',
      email: auth.courierEmail ?? '',
      companyName: auth.companyName ?? 'Mimoo Courier',
      status: 'active',
      dutyStatus: 'off_duty',
      documents: const [],
    );
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    CourierProfile? profile;
    DutyState? duty;
    List<CourierTrip> trips = [];
    Object? failure;
    try {
      profile = await CourierRepository.instance.profile();
    } catch (e) {
      failure = e;
    }
    try {
      duty = await CourierRepository.instance.duty();
    } catch (_) {}
    try {
      trips = (await CourierRepository.instance.trips()).items;
    } catch (_) {}
    if (!mounted) return;
    final resolved = profile ?? _fallbackProfile();
    setState(() {
      _profile = resolved;
      _duty = duty ??
          DutyState(
            dutyStatus: resolved.dutyStatus,
            status: resolved.status,
            licenseExpired: false,
          );
      _activeTrip =
          trips.where((t) => t.status != 'assigned').firstOrNull ??
              trips.firstOrNull;
      _loading = false;
      _error = profile == null && failure != null
          ? ApiService.friendlyError(failure)
          : null;
    });
  }

  bool get _onDuty => _duty?.dutyStatus == 'on_duty';

  Future<void> _startDuty() async {
    if (_updatingDuty) return;
    final hasRecentChecklist = _duty?.latestChecklist?.passed == true;
    if (!hasRecentChecklist) {
      final result = await Navigator.push<bool>(
        context,
        MaterialPageRoute(builder: (_) => const DutyChecklistPage()),
      );
      if (result == true && mounted) _load();
      return;
    }

    final choice = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: kCard,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(18))),
      builder: (_) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 18, 20, 16),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Text('Start your shift',
                style: pjs(size: 16, weight: FontWeight.w800)),
            const SizedBox(height: 6),
            Text('Your last pre-trip checklist passed.',
                style: pjs(size: 12, color: kSubtext)),
            const SizedBox(height: 14),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () => Navigator.pop(context, 'reuse'),
                style: FilledButton.styleFrom(backgroundColor: kPrimary),
                child: Text('Go On Duty',
                    style: pjs(
                        size: 14,
                        weight: FontWeight.w800,
                        color: Colors.white)),
              ),
            ),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () => Navigator.pop(context, 'checklist'),
                style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: kPrimary)),
                child: Text('Run checklist again',
                    style: pjs(
                        size: 14,
                        weight: FontWeight.w700,
                        color: kPrimary)),
              ),
            ),
          ]),
        ),
      ),
    );
    if (!mounted) return;

    if (choice == 'checklist') {
      final result = await Navigator.push<bool>(
        context,
        MaterialPageRoute(builder: (_) => const DutyChecklistPage()),
      );
      if (result == true && mounted) _load();
    } else if (choice == 'reuse') {
      await _goOnDutyWithLocation();
    }
  }

  Future<void> _goOnDutyWithLocation() async {
    setState(() => _updatingDuty = true);
    try {
      final location = await LocationService.current();
      await CourierRepository.instance.goOnDuty(
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
      );
      if (!mounted) return;
      courierSnack(context, 'You are now On Duty.', kGreen);
      await _load();
    } catch (e) {
      if (!mounted) return;
      courierSnack(context, ApiService.friendlyError(e), kFlash);
    } finally {
      if (mounted) setState(() => _updatingDuty = false);
    }
  }

  Future<void> _goOffDuty() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Go Off Duty'),
        content: const Text(
            'You will stop receiving new trips until you go On Duty again.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancel')),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(backgroundColor: kFlash),
            child: const Text('Go Off Duty'),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;

    setState(() => _updatingDuty = true);
    try {
      await CourierRepository.instance.goOffDuty();
      if (!mounted) return;
      courierSnack(context, 'You are now Off Duty.', kSubtext);
      await _load();
    } catch (e) {
      if (!mounted) return;
      courierSnack(context, ApiService.friendlyError(e), kFlash);
    } finally {
      if (mounted) setState(() => _updatingDuty = false);
    }
  }

  Future<void> _open(Widget page) async {
    await Navigator.push(context, MaterialPageRoute(builder: (_) => page));
    if (mounted) _load();
  }

  Future<void> _logout() async {
    await AuthService.instance.logout();
    if (!mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginPage()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator(color: kPrimary));
    }

    final p = _profile!;
    final duty = _duty!;
    final canStart = !duty.licenseExpired &&
        p.status != 'suspended' &&
        p.suspendedReason == null;

    return RefreshIndicator(
      color: kPrimary,
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (_error != null) ...[
            InkWell(
              onTap: _load,
              borderRadius: BorderRadius.circular(10),
              child: Container(
                padding: const EdgeInsets.all(11),
                decoration: BoxDecoration(
                  color: kFlash.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: kFlash.withValues(alpha: 0.3)),
                ),
                child: Row(children: [
                  const Icon(Icons.cloud_off_outlined, size: 16, color: kFlash),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Showing saved account info. Tap to retry.',
                      style: pjs(size: 11, color: kFlash),
                    ),
                  ),
                ]),
              ),
            ),
            const SizedBox(height: 10),
          ],
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: kCard,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: kBorder),
            ),
            child: Row(children: [
              const CircleAvatar(
                backgroundColor: kChip,
                radius: 26,
                child: Icon(Icons.business_outlined, color: kPrimary, size: 25),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(p.companyName,
                          style: pjs(size: 15, weight: FontWeight.w800)),
                      Text(p.name,
                          style: pjs(size: 12, color: kSubtext)),
                      Text(p.email,
                          style: pjs(size: 12, color: kSubtext)),
                      const SizedBox(height: 6),
                      Wrap(spacing: 6, runSpacing: 6, children: [
                        CourierStatusBadge(status: p.status),
                        CourierStatusBadge(status: duty.dutyStatus),
                      ]),
                    ]),
              ),
            ]),
          ),
          if (p.suspendedReason != null) ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: kFlash.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: kFlash.withValues(alpha: 0.3)),
              ),
              child: Text(
                'Account suspended: ${p.suspendedReason}',
                style: pjs(size: 12, color: kFlash),
              ),
            ),
          ],
          const SizedBox(height: 10),
          CourierInfoCard(
            title: 'Duty status',
            description: _onDuty
                ? 'You are visible to dispatch and can receive trips.'
                : 'Complete the pre-trip checklist to start accepting trips.',
            children: [
              Row(children: [
                Expanded(
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(_onDuty ? 'On Duty' : 'Off Duty',
                            style: pjs(
                                size: 20,
                                weight: FontWeight.w900,
                                color: _onDuty ? kGreen : kSubtext)),
                        if (duty.activeTripCode != null)
                          Text('Active trip: ${duty.activeTripCode}',
                              style: pjs(size: 12, color: kSubtext)),
                        if (duty.licenseExpiry != null)
                          Text(
                            duty.licenseExpired
                                ? 'License expired ${duty.licenseExpiry}'
                                : 'License valid until ${duty.licenseExpiry}',
                            style: pjs(
                                size: 11,
                                color: duty.licenseExpired
                                    ? kFlash
                                    : kSubtext),
                          ),
                      ]),
                ),
                if (_updatingDuty)
                  const SizedBox(
                    width: 24,
                    height: 24,
                    child:
                        CircularProgressIndicator(strokeWidth: 2, color: kPrimary),
                  )
                else
                  FilledButton(
                    onPressed: _onDuty
                        ? _goOffDuty
                        : (canStart ? _startDuty : null),
                    style: FilledButton.styleFrom(
                      backgroundColor: _onDuty ? kFlash : kGreen,
                    ),
                    child: Text(_onDuty ? 'Go Off Duty' : 'Start Duty',
                        style: pjs(
                            size: 12,
                            weight: FontWeight.w800,
                            color: Colors.white)),
                  ),
              ]),
              if (duty.latestChecklist != null) ...[
                const Divider(height: 18, color: kBorder),
                Row(children: [
                  Icon(
                    duty.latestChecklist!.passed
                        ? Icons.check_circle_outline
                        : Icons.warning_amber_rounded,
                    size: 17,
                    color: duty.latestChecklist!.passed ? kGreen : kFlash,
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      'Last checklist ${duty.latestChecklist!.passed ? 'passed' : 'failed'}${duty.latestChecklist!.submittedAt == null ? '' : ' · ${duty.latestChecklist!.submittedAt}'}',
                      style: pjs(size: 11, color: kSubtext),
                    ),
                  ),
                ]),
              ],
            ],
          ),
          if (_activeTrip != null) ...[
            const SizedBox(height: 10),
            GestureDetector(
              onTap: () => _open(TripDetailPage(id: _activeTrip!.id)),
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: kCard,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: kPrimary.withValues(alpha: 0.3)),
                ),
                child: Row(children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: const BoxDecoration(
                        color: kChip, shape: BoxShape.circle),
                    child: const Icon(Icons.local_shipping_outlined,
                        color: kPrimary, size: 21),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(children: [
                            Text(_activeTrip!.tripCode,
                                style: pjs(
                                    size: 14, weight: FontWeight.w800)),
                            const SizedBox(width: 6),
                            CourierStatusBadge(
                                status: _activeTrip!.status),
                          ]),
                          Text(_activeTrip!.route,
                              style: pjs(size: 12, color: kSubtext)),
                          Text(
                              '${_activeTrip!.loadedCount}/${_activeTrip!.parcelsCount} parcels loaded',
                              style: pjs(size: 11, color: kSubtext)),
                        ]),
                  ),
                  const Icon(Icons.chevron_right, color: kSubtext),
                ]),
              ),
            ),
          ],
          const SizedBox(height: 16),
          _MenuTile(
            icon: Icons.local_shipping_outlined,
            title: 'My Trips',
            subtitle: 'Accept, load, depart and complete trips',
            onTap: () => _open(const TripsPage()),
          ),
          _MenuTile(
            icon: Icons.payments_outlined,
            title: 'History & Pay',
            subtitle: 'Completed trips, receipts and earnings',
            onTap: () => _open(const HistoryPage()),
          ),
          _MenuTile(
            icon: Icons.person_outline,
            title: 'Profile & Vehicle',
            subtitle: 'Driver details, plate and license',
            onTap: () => _open(const ProfilePage()),
          ),
          _MenuTile(
            icon: Icons.folder_outlined,
            title: 'Documents',
            subtitle: 'OR/CR, license and other requirements',
            onTap: () => _open(const DocumentsPage()),
          ),
          _MenuTile(
            icon: Icons.lock_outline,
            title: 'Change Password',
            subtitle: 'Update your account password',
            onTap: () => _open(const ChangePasswordPage()),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: OutlinedButton.icon(
              onPressed: _logout,
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: kFlash),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(Icons.logout, color: kFlash, size: 18),
              label: Text('Log out',
                  style:
                      pjs(size: 14, weight: FontWeight.w700, color: kFlash)),
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}

class _MenuTile extends StatelessWidget {
  const _MenuTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(13),
        decoration: BoxDecoration(
          color: kCard,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: kBorder),
        ),
        child: Row(children: [
          Container(
            width: 36,
            height: 36,
            decoration:
                const BoxDecoration(color: kChip, shape: BoxShape.circle),
            child: Icon(icon, size: 18, color: kPrimary),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      style:
                          pjs(size: 13, weight: FontWeight.w800, color: kText)),
                  Text(subtitle, style: pjs(size: 11, color: kSubtext)),
                ]),
          ),
          const Icon(Icons.chevron_right, color: kSubtext, size: 20),
        ]),
      ),
    );
  }
}
