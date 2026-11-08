import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mimoo_rider/core/auth_controller.dart';
import 'package:mimoo_rider/core/rider_status_controller.dart';
import 'package:mimoo_rider/core/settings_controller.dart';
import 'package:mimoo_rider/data/db/app_database.dart';
import 'package:mimoo_rider/data/repositories/local_repositories.dart';
import 'package:mimoo_rider/main.dart';
import 'package:mimoo_rider/screens/login.dart';
import 'package:mimoo_rider/screens/main_shell.dart';
import 'package:mimoo_rider/screens/settings/settings_screen.dart';
import 'package:mimoo_rider/widgets/mimoo_rider_logo.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  late AppRepositories repositories;

  setUpAll(() {
    sqfliteFfiInit();
    GoogleFonts.config.allowRuntimeFetching = false;
  });

  setUp(() async {
    SharedPreferences.setMockInitialValues({
      'settings.themeMode': 'dark',
    });
    repositories = await AppRepositories.open(
      database: AppDatabase(
        factory: databaseFactoryFfi,
        databasePath: inMemoryDatabasePath,
      ),
    );
  });

  tearDown(() async {
    await repositories.close();
  });

  testWidgets('splash and login stay light and use the branded layout',
      (tester) async {
    tester.view.physicalSize = const Size(360, 800);
    tester.view.devicePixelRatio = 1;
    tester.platformDispatcher.textScaleFactorTestValue = 1.3;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
      tester.platformDispatcher.clearTextScaleFactorTestValue();
    });

    final prefs = await SharedPreferences.getInstance();
    final settings = SettingsController(prefs);
    final auth = AuthController();
    final riderStatus = RiderStatusController(
      parcelRepository: repositories.parcels,
      riderProfileRepository: repositories.riderProfile,
      online: false,
    );

    await tester.pumpWidget(MimooRiderApp(
      settings: settings,
      auth: auth,
      riderStatus: riderStatus,
      repositories: repositories,
    ));

    // Splash screen shows the rider logo widget.
    expect(find.byType(MimooRiderLogo), findsWidgets);
    expect(
      Theme.of(tester.element(find.byType(MimooRiderLogo).first)).brightness,
      Brightness.light,
    );

    await tester.pump(const Duration(milliseconds: 2700));
    await tester.pumpAndSettle();

    // After splash, login screen appears.
    expect(find.byType(LoginScreen), findsOneWidget);

    // Required UI elements.
    expect(find.byType(SvgPicture), findsWidgets);
    expect(find.text('Log In'), findsWidgets);
    expect(find.text('Welcome back, Rider'), findsOneWidget);
    expect(find.text('Email'), findsOneWidget);
    expect(find.text('Password'), findsOneWidget);
    expect(find.byTooltip('Show password'), findsNothing); // eye icon removed
    expect(find.text('Show password'), findsOneWidget);   // text button below field
    final loginFields = tester.widgetList<TextField>(find.byType(TextField));
    expect(loginFields, hasLength(2));
    for (final field in loginFields) {
      expect(field.textAlignVertical, TextAlignVertical.center);
      expect(field.decoration!.filled, isFalse);
      expect(field.decoration!.border, InputBorder.none);
      expect(field.decoration!.enabledBorder, InputBorder.none);
      expect(field.decoration!.focusedBorder, InputBorder.none);
      expect(field.decoration!.errorBorder, InputBorder.none);
      expect(field.decoration!.disabledBorder, InputBorder.none);
    }
    expect(find.text('Need access?'), findsOneWidget);

    // Forbidden elements.
    expect(find.text('Continue with Google'), findsNothing);
    expect(find.text('Sign in with Passkey'), findsNothing);

    // Login is always light even though themeMode is dark.
    expect(
      Theme.of(tester.element(find.byType(LoginScreen))).brightness,
      Brightness.light,
    );
    expect(tester.takeException(), isNull);

    tester.view.physicalSize = const Size(900, 1200);
    tester.platformDispatcher.textScaleFactorTestValue = 1;
    auth.signIn();
    Navigator.of(tester.element(find.byType(LoginScreen)))
        .pushNamedAndRemoveUntil('/home', (_) => false);
    await tester.pumpAndSettle();
    expect(
      Theme.of(tester.element(find.byType(MainShell))).brightness,
      Brightness.dark,
    );

    Navigator.of(tester.element(find.byType(MainShell))).pushNamed('/settings');
    await tester.pumpAndSettle();
    await tester.tap(find.text('Appearance').first);
    await tester.pumpAndSettle();
    await tester.tap(find.text('Light'));
    await tester.pumpAndSettle();
    expect(settings.themeMode, ThemeMode.light);
    expect(
      Theme.of(tester.element(find.byType(SettingsScreen))).brightness,
      Brightness.light,
    );

    await tester.tap(find.text('Appearance').first);
    await tester.pumpAndSettle();
    await tester.tap(find.text('Dark'));
    await tester.pumpAndSettle();
    expect(settings.themeMode, ThemeMode.dark);
    auth.signOut();
    Navigator.of(tester.element(find.byType(SettingsScreen)))
        .pushNamedAndRemoveUntil('/login', (_) => false);
    await tester.pumpAndSettle();
    expect(
      Theme.of(tester.element(find.byType(LoginScreen))).brightness,
      Brightness.light,
    );
    auth.signIn();
    Navigator.of(tester.element(find.byType(LoginScreen)))
        .pushNamedAndRemoveUntil('/home', (_) => false);
    await tester.pumpAndSettle();
    expect(
      Theme.of(tester.element(find.byType(MainShell))).brightness,
      Brightness.dark,
    );
    await tester.pumpWidget(const SizedBox.shrink());
  });
}
