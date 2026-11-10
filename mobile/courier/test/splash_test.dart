import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:mimoo_courier/models/courier_models.dart';
import 'package:mimoo_courier/pages/auth/login_page.dart';
import 'package:mimoo_courier/pages/home/home_page.dart';
import 'package:mimoo_courier/pages/splash_page.dart';
import 'package:mimoo_courier/services/api_service.dart';
import 'package:mimoo_courier/state/auth_service.dart';
import 'package:mimoo_courier/theme/mimoo_theme.dart';

http.Response _json(Object body) => http.Response(
      jsonEncode(body),
      200,
      headers: {'content-type': 'application/json'},
    );

http.Response _emptyAppResponse(String path) {
  if (path.endsWith('/courier-app/dashboard')) {
    return _json({
      'data': {
        'incoming_shipments': 0,
        'pending_pickups': 0,
        'scheduled_today': 0,
        'picked_up_today': 0,
        'failed': 0,
        'expiring_soon': 0,
      },
    });
  }
  if (path.endsWith('/courier-app/timeline')) {
    return _json({'data': <Object>[]});
  }
  if (path.endsWith('/courier-app/facilities')) {
    return _json({'data': <Object>[]});
  }
  if (path.endsWith('/courier-app/trips')) {
    return _json({
      'data': <Object>[],
      'stats': <String, int>{'active': 0, 'completed': 0},
    });
  }
  return _json({
    'data': <Object>[],
    'stats': <String, int>{},
    'personnel': <Object>[],
    'meta': {'current_page': 1, 'last_page': 1, 'total': 0},
  });
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() async {
    FlutterSecureStorage.setMockInitialValues({});
    ApiService.token = null;
    await AuthService.instance.clearSession();
    ApiService.httpClient =
        MockClient((request) async => _emptyAppResponse(request.url.path));
  });

  tearDown(() {
    ApiService.httpClient = http.Client();
    ApiService.token = null;
  });

  Future<void> pumpSplash(WidgetTester tester) async {
    await tester.pumpWidget(MaterialApp(
      theme: mimooTheme(),
      home: const SplashPage(),
    ));
  }

  testWidgets('splash shows the buyer artwork for 2600 ms then Login',
      (tester) async {
    await pumpSplash(tester);

    expect(find.byType(SplashPage), findsOneWidget);
    final scaffold = tester.widget<Scaffold>(find.byType(Scaffold));
    expect(scaffold.backgroundColor, Colors.black);
    final image = tester.widget<Image>(find.byType(Image));
    expect((image.image as AssetImage).assetName, 'assets/images/splash.png');
    expect(image.fit, BoxFit.cover);

    final fadeFinder = find.descendant(
      of: find.byType(SplashPage),
      matching: find.byType(FadeTransition),
    );
    final fade = tester.widget<FadeTransition>(fadeFinder);
    expect(fade.opacity.value, 0);

    // Mid hold (after the 780 ms fade-in) the splash is fully visible.
    await tester.pump(const Duration(milliseconds: 1300));
    expect(find.byType(SplashPage), findsOneWidget);
    expect(
      tester.widget<FadeTransition>(fadeFinder).opacity.value,
      1,
    );

    // Still on the splash just before the 2600 ms sequence finishes.
    await tester.pump(const Duration(milliseconds: 1200));
    expect(find.byType(SplashPage), findsOneWidget);

    await tester.pump(const Duration(milliseconds: 150));
    await tester.pumpAndSettle();
    expect(find.byType(LoginPage), findsOneWidget);
    expect(find.byType(HomePage), findsNothing);
  });

  testWidgets('splash goes to Home when a saved session exists',
      (tester) async {
    await AuthService.instance.persistLogin(
      token: '9|saved-token',
      courier: const CourierUser(
        id: 9,
        email: 'courier@mimoo.test',
        companyName: 'Test Logistics Co',
        contactFirstName: 'Test',
        contactLastName: 'Courier',
      ),
    );

    await pumpSplash(tester);
    await tester.pump(const Duration(milliseconds: 2700));
    await tester.pumpAndSettle();

    expect(find.byType(HomePage), findsOneWidget);
    expect(find.byType(LoginPage), findsNothing);
  });
}
