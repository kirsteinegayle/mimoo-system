import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:mimoo_courier/pages/scan/scan_tab.dart';
import 'package:mimoo_courier/services/api_service.dart';

/// Courier scanner, second pass: layout at 320 / 360 dp and 1x-2x font, and the manual path that
/// shares the camera's code path (lookup -> facility -> POST scan-parcel -> specific refusal text).
/// The live camera + permission dialog need a physical phone (see the report).
http.Response _json(Object body, [int status = 200]) => http.Response(
    jsonEncode(body), status,
    headers: {'content-type': 'application/json'});

void main() {
  late List<http.Request> sent;
  late http.Response Function(http.Request) scanReply;

  setUp(() {
    sent = [];
    scanReply = (_) =>
        _json({'message': 'Parcel received at Main Hub.', 'waybill_number': 'MIM1'});
    ApiService.httpClient = MockClient((r) async {
      sent.add(r);
      final p = r.url.path;
      if (p.endsWith('/facilities')) {
        return _json({
          'data': [
            {
              'id': 7,
              'facility_name': 'Main Hub',
              'facility_code': 'HUB-1',
              'facility_type': 'Main Hub',
              'status': 'Active',
              'city': 'Santa Rosa'
            }
          ]
        });
      }
      if (p.contains('/parcel/')) {
        final code = p.split('/').last;
        if (code == 'NOPE') {
          return _json({'message': 'No parcel found with waybill: NOPE'}, 404);
        }
        return _json({
          'data': {
            'waybill_number': code,
            'order_number': 'MIM-00000001',
            'buyer_name': 'Maria Clara de la Cruz-Santos',
            'buyer_address':
                'Unit 12B Bldg. Santa Catalina Residences, Barangay San Antonio, Santa Rosa, Laguna',
            'destination': 'Santa Rosa',
            'payment_method': 'COD',
            'total_amount': 1250.5,
            'status': 'shipped',
            'weight': 1.2,
          }
        });
      }
      if (p.endsWith('/scan-parcel')) return scanReply(r);
      return _json({'message': 'not found'}, 404);
    });
  });

  Future<void> settle(WidgetTester tester) async {
    for (var i = 0; i < 5; i++) {
      await tester.pump(const Duration(milliseconds: 100));
    }
  }

  Future<void> pump(WidgetTester tester, Size size, double scale) async {
    tester.view.physicalSize = size;
    tester.view.devicePixelRatio = 1;
    tester.platformDispatcher.textScaleFactorTestValue = scale;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
      tester.platformDispatcher.clearTextScaleFactorTestValue();
    });
    await tester.pumpWidget(const MaterialApp(home: Scaffold(body: ScanTab())));
    await settle(tester);
  }

  Future<void> search(WidgetTester tester, String code) async {
    await tester.enterText(find.byType(TextField), code);
    await tester.ensureVisible(find.text('Search'));
    await tester.tap(find.text('Search'));
    await settle(tester);
  }

  for (final w in [320.0, 360.0]) {
    for (final scale in [1.0, 1.5, 2.0]) {
      testWidgets('no overflow ${w.toInt()}dp x$scale (camera panel + parcel + facility)',
          (tester) async {
        await pump(tester, Size(w, 740), scale);
        expect(tester.takeException(), isNull);
        await search(tester, 'mim1');
        expect(find.text('Parcel Info'), findsOneWidget);
        expect(tester.takeException(), isNull);
      });
    }
  }

  testWidgets('camera preview has the torch and close controls', (tester) async {
    await pump(tester, const Size(360, 740), 1);
    expect(find.byTooltip('Toggle flashlight'), findsOneWidget);
    expect(find.byTooltip('Hide camera'), findsOneWidget);
    // Close hides the preview and offers to open it again.
    await tester.tap(find.byTooltip('Hide camera'));
    await settle(tester);
    expect(find.text('Open camera scanner'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('lookup + confirm posts the upper-cased waybill and the facility',
      (tester) async {
    await pump(tester, const Size(360, 900), 1);
    await search(tester, 'mim1');
    await tester.ensureVisible(find.text('Confirm Receipt'));
    await tester.tap(find.text('Confirm Receipt'));
    await settle(tester);
    final post = sent.lastWhere((r) => r.url.path.endsWith('/scan-parcel'));
    expect(jsonDecode(post.body), {'waybill_number': 'MIM1', 'facility_id': 7});
    expect(find.text('Parcel received at Main Hub!'), findsOneWidget);
  });

  testWidgets('a server refusal is shown with its specific reason',
      (tester) async {
    scanReply = (_) =>
        _json({'message': 'Parcel is not expected at this facility.'}, 422);
    await pump(tester, const Size(360, 900), 1);
    await search(tester, 'MIM1');
    await tester.ensureVisible(find.text('Confirm Receipt'));
    await tester.tap(find.text('Confirm Receipt'));
    await settle(tester);
    expect(
        find.textContaining(
            'Scan rejected: Parcel is not expected at this facility.'),
        findsOneWidget);
  });

  testWidgets('unknown waybill shows the lookup error', (tester) async {
    await pump(tester, const Size(360, 900), 1);
    await search(tester, 'nope');
    expect(find.textContaining('No parcel found'), findsOneWidget);
  });
}
