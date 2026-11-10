import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:mimoo_courier/pages/auth/login_page.dart';
import 'package:mimoo_courier/pages/home/home_page.dart';
import 'package:mimoo_courier/services/api_service.dart';
import 'package:mimoo_courier/state/auth_service.dart';
import 'package:mimoo_courier/theme/mimoo_theme.dart';

http.Response _json(Object body, [int status = 200]) => http.Response(
      jsonEncode(body),
      status,
      headers: {'content-type': 'application/json'},
    );

Map<String, dynamic> _pageMeta() =>
    {'current_page': 1, 'last_page': 1, 'total': 0};

/// Responses for every endpoint the Home tabs request after a real login.
http.Response _emptyAppResponse(String path) {
  if (path.endsWith('/courier-app/dashboard')) {
    return _json({
      'data': {
        'incoming_shipments': 4,
        'pending_pickups': 2,
        'scheduled_today': 1,
        'picked_up_today': 3,
        'failed': 0,
        'expiring_soon': 1,
      },
    });
  }
  if (path.endsWith('/courier-app/timeline')) {
    return _json({'data': <Object>[]});
  }
  if (path.endsWith('/courier-app/pickups')) {
    return _json({
      'data': <Object>[],
      'stats': <String, int>{},
      'personnel': <Object>[],
      'meta': _pageMeta(),
    });
  }
  if (path.endsWith('/courier-app/shipments')) {
    return _json({'data': <Object>[], 'meta': _pageMeta()});
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
  return _json({'data': <Object>[], 'meta': _pageMeta()});
}

Map<String, dynamic> _loginPayload() => {
      'data': {
        'token': '9|real-sanctum-token',
        'courier': {
          'id': 9,
          'email': 'courier@mimoo.test',
          'company_name': 'Test Logistics Co',
          'contact_first_name': 'Test',
          'contact_last_name': 'Courier',
          'role': 'courier',
          'account_type': 'logistics',
        },
      },
    };

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() async {
    FlutterSecureStorage.setMockInitialValues({});
    ApiService.token = null;
    await AuthService.instance.clearSession();
  });

  tearDown(() {
    ApiService.httpClient = http.Client();
    ApiService.token = null;
  });

  testWidgets('real API sign-in opens Home and shows only server data',
      (tester) async {
    final requests = <http.Request>[];
    ApiService.httpClient = MockClient((request) async {
      requests.add(request);
      if (request.url.path.endsWith('/courier-app/login')) {
        return _json(_loginPayload());
      }
      return _emptyAppResponse(request.url.path);
    });

    await tester.binding.setSurfaceSize(const Size(800, 900));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    await tester.pumpWidget(MaterialApp(
      theme: mimooTheme(),
      home: const LoginPage(),
    ));
    await tester.pumpAndSettle();

    // No demo/offline shortcut exists in the app anymore.
    expect(find.text('Continue with demo account'), findsNothing);
    expect(find.textContaining('demo'), findsNothing);

    await tester.enterText(
      find.descendant(
        of: find.byKey(const ValueKey('email-field-box')),
        matching: find.byType(TextField),
      ),
      'courier@mimoo.test',
    );
    await tester.enterText(
      find.descendant(
        of: find.byKey(const ValueKey('password-field-box')),
        matching: find.byType(TextField),
      ),
      'secret-password',
    );
    await tester.tap(find.text('Sign In'));
    await tester.pumpAndSettle();

    expect(find.byType(HomePage), findsOneWidget);
    expect(find.text('Test Logistics Co'), findsOneWidget);
    expect(find.text('Incoming'), findsOneWidget);
    expect(find.text('4'), findsOneWidget);

    final login = requests.firstWhere(
      (r) => r.url.path.endsWith('/courier-app/login'),
    );
    expect(login.method, 'POST');
    expect(login.headers['Accept'], 'application/json');
    expect(login.headers.containsKey('Authorization'), isFalse);

    final dashboard = requests.firstWhere(
      (r) => r.url.path.endsWith('/courier-app/dashboard'),
    );
    expect(dashboard.headers['Accept'], 'application/json');
    expect(dashboard.headers['Authorization'], 'Bearer 9|real-sanctum-token');
    expect(ApiService.token, '9|real-sanctum-token');
  });

  testWidgets('wrong credentials show the API error and stay on Login',
      (tester) async {
    ApiService.httpClient = MockClient((request) async {
      if (request.url.path.endsWith('/courier-app/login')) {
        return _json({'message': 'Invalid email or password.'}, 401);
      }
      return _emptyAppResponse(request.url.path);
    });

    await tester.binding.setSurfaceSize(const Size(800, 900));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    await tester.pumpWidget(MaterialApp(
      theme: mimooTheme(),
      home: const LoginPage(),
    ));
    await tester.pumpAndSettle();

    await tester.enterText(
      find.descendant(
        of: find.byKey(const ValueKey('email-field-box')),
        matching: find.byType(TextField),
      ),
      'courier@mimoo.test',
    );
    await tester.enterText(
      find.descendant(
        of: find.byKey(const ValueKey('password-field-box')),
        matching: find.byType(TextField),
      ),
      'wrong-password',
    );
    await tester.tap(find.text('Sign In'));
    await tester.pumpAndSettle();

    expect(find.text('Invalid email or password.'), findsOneWidget);
    expect(find.byType(HomePage), findsNothing);
  });

  testWidgets('dashboard API failure shows an error with Retry',
      (tester) async {
    ApiService.httpClient = MockClient((request) async {
      if (request.url.path.endsWith('/courier-app/login')) {
        return _json(_loginPayload());
      }
      if (request.url.path.endsWith('/courier-app/dashboard')) {
        return _json({'message': 'Server exploded.'}, 500);
      }
      return _emptyAppResponse(request.url.path);
    });

    await tester.binding.setSurfaceSize(const Size(800, 900));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    await tester.pumpWidget(MaterialApp(
      theme: mimooTheme(),
      home: const LoginPage(),
    ));
    await tester.pumpAndSettle();

    await tester.enterText(
      find.descendant(
        of: find.byKey(const ValueKey('email-field-box')),
        matching: find.byType(TextField),
      ),
      'courier@mimoo.test',
    );
    await tester.enterText(
      find.descendant(
        of: find.byKey(const ValueKey('password-field-box')),
        matching: find.byType(TextField),
      ),
      'secret-password',
    );
    await tester.tap(find.text('Sign In'));
    await tester.pumpAndSettle();

    expect(find.text('Server error (500). Please try again.'), findsOneWidget);
    expect(find.text('Try again'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
