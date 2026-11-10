import 'dart:async';

import 'package:flutter/gestures.dart' show PointerDeviceKind;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'core/api_config.dart';
import 'core/auth_controller.dart';
import 'core/connectivity.dart';
import 'core/rider_status_controller.dart';
import 'core/settings_controller.dart';
import 'core/theme.dart';
import 'data/api/rider_api.dart';
import 'data/db/web_database.dart';
import 'data/repositories/app_repositories_scope.dart';
import 'data/repositories/local_repositories.dart';
import 'data/repositories/repository_bundle.dart';
import 'data/parcel_flow.dart';
import 'data/models/entities.dart' as db;
import 'l10n/generated/app_localizations.dart';
import 'mimoo_screens.dart';
import 'mock/rider_mock.dart' show RiderMock;
import 'screens/chat.dart';
import 'screens/delivered.dart';
import 'screens/delivery_detail.dart';
import 'screens/help_center_screen.dart';
import 'screens/history_job_detail.dart';
import 'screens/login.dart';
import 'screens/main_shell.dart';
import 'screens/pod_flow.dart';
import 'screens/profile_screen.dart';
import 'screens/settings/about_screen.dart';
import 'screens/settings/change_password_screen.dart';
import 'screens/settings/emergency_contacts_screen.dart';
import 'screens/settings/legal_screen.dart';
import 'screens/settings/passkey_screen.dart';
import 'screens/settings/permissions_screen.dart';
import 'screens/settings/settings_screen.dart';
import 'screens/splash_screen.dart';
import 'screens/vehicle_documents_screen.dart';
import 'widgets/biometric_gate.dart';

final GlobalKey<NavigatorState> mimooNavigatorKey = GlobalKey<NavigatorState>();

abstract final class MimooRoutes {
  static const suspended = '/suspended';
  static const home = '/home';
  static const pickupDetail = '/pickup-detail';
  static const scanWaybill = '/scan-waybill';
  static const outForDelivery = '/out-for-delivery';
  static const codRemittance = '/cod-remittance';
  static const notifications = '/notifications';
  static const profile = '/profile';
  static const settings = '/settings';
  static const settingsChangePassword = '/settings/change-password';
  static const settingsPasskey = '/settings/passkey';
  static const settingsEmergencyContacts = '/settings/emergency-contacts';
  static const settingsPermissions = '/settings/permissions';
  static const settingsPrivacy = '/settings/privacy';
  static const settingsTerms = '/settings/terms';
  static const settingsAbout = '/settings/about';
  static const helpCenter = '/help-center';
  static const vehicleDocuments = '/vehicle-documents';
  static const historyJob = '/history-job';
}

/// Keeps scrollbars hidden on every platform while allowing touch, mouse and
/// stylus dragging.
class MimooScrollBehavior extends MaterialScrollBehavior {
  const MimooScrollBehavior();

  @override
  Widget buildScrollbar(
          BuildContext context, Widget child, ScrollableDetails details) =>
      child;

  @override
  Set<PointerDeviceKind> get dragDevices => {
        PointerDeviceKind.touch,
        PointerDeviceKind.mouse,
        PointerDeviceKind.stylus,
      };
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  configureWebDatabaseFactory();
  final repositories = await AppRepositories.open();
  final auth = AuthController();
  if (!useMock) {
    // Real backend: reuse a saved Sanctum token so the rider stays logged in.
    await RiderApi.instance.restore();
    if (RiderApi.instance.hasToken) auth.signIn();
    // Any 401 (expired / revoked token) sends the rider back to login once.
    RiderApi.instance.onUnauthorized = () {
      if (!auth.isSignedIn) return;
      RiderMock.instance.clearSession();
      auth.signOut();
      auth.setStartupError('Your session has ended. Please log in again.');
      mimooNavigatorKey.currentState
          ?.pushNamedAndRemoveUntil('/login', (_) => false);
    };
  }
  DispatchStore.install(repositories.parcels);
  ConnectivityMonitor.start();
  final preferences = await SharedPreferences.getInstance();
  final settings = SettingsController(preferences);
  final riderStatus = RiderStatusController(
    parcelRepository: repositories.parcels,
    riderProfileRepository: repositories.riderProfile,
    suspended: repositories.riderProfile.profile?.kycStatus == 'suspended',
    online: repositories.riderProfile.profile?.checkedInAt != null,
  );
  runApp(MimooRiderApp(
    settings: settings,
    auth: auth,
    riderStatus: riderStatus,
    repositories: repositories,
  ));
}

class MimooRiderApp extends StatelessWidget {
  const MimooRiderApp({
    super.key,
    required this.settings,
    required this.auth,
    required this.riderStatus,
    required this.repositories,
  });

  final SettingsController settings;
  final AuthController auth;
  final RiderStatusController riderStatus;
  final RepositoryBundle repositories;

  SystemUiOverlayStyle _overlayStyle() {
    final platformBrightness =
        WidgetsBinding.instance.platformDispatcher.platformBrightness;
    final dark = settings.themeMode == ThemeMode.dark ||
        (settings.themeMode == ThemeMode.system &&
            platformBrightness == Brightness.dark);
    return !auth.isSignedIn || !dark
        ? SystemUiOverlayStyle.dark
        : SystemUiOverlayStyle.light;
  }

  @override
  Widget build(BuildContext context) => SettingsScope(
        controller: settings,
        child: AuthScope(
          controller: auth,
          child: RiderStatusScope(
            controller: riderStatus,
            child: AppRepositoriesScope(
              repositories: repositories,
              child: AnimatedBuilder(
                animation: Listenable.merge([settings, auth]),
                builder: (context, _) => MaterialApp(
                  title: 'Mimoo Rider',
                  debugShowCheckedModeBanner: false,
                  navigatorKey: mimooNavigatorKey,
                  scrollBehavior: const MimooScrollBehavior(),
                  theme: mimooTheme(),
                  darkTheme: mimooTheme(brightness: Brightness.dark),
                  themeMode:
                      auth.isSignedIn ? settings.themeMode : ThemeMode.light,
                  locale:
                      settings.locale == null ? null : Locale(settings.locale!),
                  localizationsDelegates:
                      AppLocalizations.localizationsDelegates,
                  supportedLocales: AppLocalizations.supportedLocales,
                  builder: (context, child) =>
                      AnnotatedRegion<SystemUiOverlayStyle>(
                    value: _overlayStyle(),
                    child:
                        BiometricGate(child: child ?? const SizedBox.shrink()),
                  ),
                  // Splash plays first, then goes to the same route the app
                  // already chose from the session state.
                  initialRoute: '/splash',
                  routes: {
                    '/splash': (_) => SplashScreen(
                        nextRoute: auth.isSignedIn ? '/home' : '/login'),
                    '/login': (_) => const LoginScreen(),
                    MimooRoutes.home: (_) => const MainShell(),
                    '/delivery': (context) {
                      final parcel = repositories.parcels
                          .fromArgs(ModalRoute.of(context)?.settings.arguments);
                      return parcel == null
                          ? const _RouteDataError()
                          : DeliveryDetailScreen(parcel: parcel);
                    },
                    '/pod': (context) {
                      final parcel = repositories.parcels
                          .fromArgs(ModalRoute.of(context)?.settings.arguments);
                      return parcel == null
                          ? const _RouteDataError()
                          : PodFlowScreen(parcel: parcel);
                    },
                    '/delivered': (context) {
                      final argument =
                          ModalRoute.of(context)?.settings.arguments;
                      final args = argument is DeliveredArgs
                          ? argument
                          : repositories.parcels.fromArgs(argument) == null
                              ? null
                              : DeliveredArgs(
                                  tracking: repositories.parcels
                                      .fromArgs(argument)!
                                      .trackingNo);
                      if (args == null) return const _RouteDataError();
                      return DeliveredScreen(args: args);
                    },
                    '/chat': (_) => const ChatListScreen(),
                    '/chat/thread': (_) => const ChatThreadScreen(),
                    MimooRoutes.notifications: (context) => ListenableBuilder(
                          listenable: repositories.notifications,
                          builder: (context, _) => NotificationsScreen(
                            items: repositories.notifications.notifications
                                .map((notification) => AppNotification(
                                      switch (notification.kind) {
                                        'parcel_assigned' =>
                                          NotifKind.parcelAssigned,
                                        'remittance' => NotifKind.remittance,
                                        'weather' => NotifKind.weather,
                                        'rescheduled' => NotifKind.rescheduled,
                                        'seller_ready' => NotifKind.sellerReady,
                                        _ => NotifKind.parcelAssigned,
                                      },
                                      notification.title,
                                      notification.body,
                                      clock(notification.createdAt),
                                      tag: notification.parcelId ?? '',
                                      unread: notification.readAt == null,
                                    ))
                                .toList(growable: false),
                            onMarkAllRead:
                                repositories.notifications.markAllRead,
                          ),
                        ),
                    MimooRoutes.profile: (_) => const ProfileScreen(),
                    MimooRoutes.settings: (_) => const SettingsScreen(),
                    MimooRoutes.settingsChangePassword: (_) =>
                        const ChangePasswordScreen(),
                    MimooRoutes.settingsPasskey: (_) => const PasskeyScreen(),
                    MimooRoutes.settingsEmergencyContacts: (_) =>
                        const EmergencyContactsScreen(),
                    MimooRoutes.settingsPermissions: (_) =>
                        const PermissionsScreen(),
                    MimooRoutes.settingsPrivacy: (context) => LegalScreen(
                          title: AppLocalizations.of(context).settingsPrivacy,
                          body: AppLocalizations.of(context).legalPrivacyBody,
                        ),
                    MimooRoutes.settingsTerms: (context) => LegalScreen(
                          title: AppLocalizations.of(context).settingsTerms,
                          body: AppLocalizations.of(context).legalTermsBody,
                        ),
                    MimooRoutes.settingsAbout: (_) => const AboutScreen(),
                    MimooRoutes.helpCenter: (_) => const HelpCenterScreen(),
                    MimooRoutes.vehicleDocuments: (_) =>
                        const VehicleDocumentsScreen(),
                    MimooRoutes.historyJob: (context) {
                      final argument =
                          ModalRoute.of(context)?.settings.arguments;
                      if (argument is! HistoryJob) {
                        return const _RouteDataError();
                      }
                      return HistoryJobDetailScreen(job: argument);
                    },
                    MimooRoutes.pickupDetail: (context) {
                      final parcel = repositories.parcels.fromArgs(
                              ModalRoute.of(context)?.settings.arguments) ??
                          repositories.parcels.assignedPickup;
                      if (parcel == null) return const _RouteDataError();
                      final pickup = PickupJob(
                        tracking: parcel.trackingNo,
                        seller: parcel.sellerName,
                        merchantId: parcel.trackingNo, // seller merchant ID not yet in model
                        address: parcel.sellerAddress,
                        phone: parcel.sellerPhone ?? parcel.buyerPhone,
                        parcelLabel: parcel.item ?? '1 parcel',
                        pay: parcel.pickupFee > 0 ? parcel.pickupFee : 30,
                        km: 2.4,
                        etaMins: 15,
                      );
                      return PickupDetailScreen(
                        job: pickup,
                        onBack: () => Navigator.of(context).pop(),
                        onScanWaybill: () => Navigator.of(context).pushNamed(
                            MimooRoutes.scanWaybill,
                            arguments: pickup.tracking),
                      );
                    },
                    MimooRoutes.scanWaybill: (context) {
                      final argument =
                          ModalRoute.of(context)?.settings.arguments;
                      final expected = argument is String ? argument : null;
                      final pickupParcel = expected == null
                          ? null
                          : repositories.parcels.byTracking(expected);
                      return ScanWaybillScreen(
                        expectedTracking: expected,
                        pickupPay: 30,
                        cod: pickupParcel?.codAmount ?? 0,
                        onValidate: (code) async {
                          if (expected != null) {
                            return code == expected &&
                                    pickupParcel?.status ==
                                        ParcelStatus.assigned
                                ? ScanResult(ScanOutcome.ok, code)
                                : ScanResult(ScanOutcome.mismatch, code);
                          }
                          final parcel = repositories.parcels.byTracking(code);
                          if (parcel == null) {
                            return ScanResult(ScanOutcome.mismatch, code,
                                'This parcel is not assigned to you.');
                          }
                          if (parcel.status == ParcelStatus.assigned) {
                            return ScanResult(ScanOutcome.ok, code);
                          }
                          return ScanResult(ScanOutcome.alreadyPickedUp, code,
                              'This parcel is already ${parcel.status.label.toLowerCase()}.');
                        },
                        onConfirmed: (code) async {
                          final parcel = repositories.parcels.byTracking(code);
                          if (parcel == null) return;
                          if (parcel.jobType == db.ParcelJobType.pickup) {
                            await repositories.parcels
                                .transition(code, ParcelStatus.pickedUp);
                            if (!context.mounted) return;
                            Navigator.of(context).pop();
                            return;
                          }
                          final navigator = Navigator.of(context);
                          navigator.pop();
                          if (expected == null) {
                            navigator.pushNamed(MimooRoutes.outForDelivery,
                                arguments: parcel.trackingNo);
                          }
                        },
                        onBack: () => Navigator.of(context).pop(),
                      );
                    },
                    MimooRoutes.outForDelivery: (context) {
                      final parcel = repositories.parcels
                          .fromArgs(ModalRoute.of(context)?.settings.arguments);
                      if (parcel == null) return const _RouteDataError();
                      return OutForDeliveryScreen(
                        parcel: parcel,
                        onBack: () => Navigator.of(context).pop(),
                        onMarkOut: () async {
                          final current = repositories.parcels
                              .byTracking(parcel.trackingNo);
                          if (current == null) return false;
                          final steps = switch (current.status) {
                            ParcelStatus.assigned => [
                                ParcelStatus.pickedUp,
                                ParcelStatus.atHub,
                                ParcelStatus.outForDelivery,
                              ],
                            ParcelStatus.pickedUp => [
                                ParcelStatus.atHub,
                                ParcelStatus.outForDelivery,
                              ],
                            ParcelStatus.atHub => [ParcelStatus.outForDelivery],
                            ParcelStatus.failedDelivery => [
                                ParcelStatus.atHub,
                                ParcelStatus.outForDelivery,
                              ],
                            _ => const <ParcelStatus>[],
                          };
                          for (final step in steps) {
                            final changed = await repositories.parcels
                                .transition(parcel.trackingNo, step);
                            if (!changed) return false;
                          }
                          if (!context.mounted) return false;
                          Navigator.of(context).pushReplacementNamed(
                              '/delivery',
                              arguments: parcel.trackingNo);
                          return true;
                        },
                      );
                    },
                    MimooRoutes.codRemittance: (context) => ListenableBuilder(
                          listenable: Listenable.merge([
                            repositories.parcels,
                            repositories.remittances,
                          ]),
                          builder: (context, _) => CodRemittanceScreen(
                            parcels: repositories.parcels.unremitted,
                            history: repositories.remittances.remittances,
                            fleetName: 'Bilis Hatid Express Inc.',
                            cutoff: SettingsScope.of(context).remittanceCutoff,
                            onRemit: (amount, method, reference) async {
                              await repositories.parcels.remitCollected(
                                method: method.name,
                                reference: reference,
                              );
                              await repositories.remittances.refresh();
                            },
                          ),
                        ),
                    MimooRoutes.suspended: (context) => SuspendedScreen(
                          fleetName: 'Bilis Hatid Express Inc.',
                          reason: 'Unremitted COD balance past cutoff',
                          dateLabel: 'Oct 26, 2026',
                          hotline: '+639171234567',
                          coordinatorName: 'Ana Dela Cruz',
                          coordinatorHub: 'Quezon City Hub',
                          coordinatorSms: '+639181234567',
                          onLogout: () => Navigator.of(context)
                              .pushNamedAndRemoveUntil('/login', (_) => false),
                        ),
                  },
                ),
              ),
            ),
          ),
        ),
      );
}

class _RouteDataError extends StatelessWidget {
  const _RouteDataError();

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Mimoo Rider')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(l10n.routeMissingData, textAlign: TextAlign.center),
        ),
      ),
    );
  }
}
