import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mimoo_rider/screens/scan_waybill_screen.dart';
import 'package:permission_handler/permission_handler.dart';

/// Rider scanner: layout at 320 / 360 dp and 1x / 1.5x / 2x text, the camera-denied panel, the
/// 4-second duplicate cooldown and the accepted / rejected paths. The real camera cannot run in a
/// unit test, so a fake camera view feeds codes; see the report for what needs a physical phone.
void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  GoogleFonts.config.allowRuntimeFetching = false;

  void Function(String)? emit;
  Widget fakeCamera(BuildContext c, void Function(String) onCode) {
    emit = onCode;
    return const ColoredBox(color: Colors.black, child: SizedBox.expand());
  }

  void setView(WidgetTester tester, Size size, double scale) {
    tester.view.physicalSize = size;
    tester.view.devicePixelRatio = 1;
    tester.platformDispatcher.textScaleFactorTestValue = scale;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
      tester.platformDispatcher.clearTextScaleFactorTestValue();
    });
  }

  Future<void> pump(
    WidgetTester tester, {
    required Size size,
    double scale = 1,
    Future<PermissionStatus> Function({required bool ask})? permission,
    Future<ScanResult> Function(String)? onValidate,
    Future<void> Function(String)? onConfirmed,
    String? expected = 'MIM00000001',
    double cod = 1250.5,
  }) async {
    setView(tester, size, scale);
    await tester.pumpWidget(MaterialApp(
      home: ScanWaybillScreen(
        expectedTracking: expected,
        pickupPay: 30,
        cod: cod,
        onValidate: onValidate ?? (c) async => ScanResult(ScanOutcome.ok, c),
        onConfirmed: onConfirmed ?? (_) async {},
        onBack: () {},
        cameraBuilder: fakeCamera,
        cameraPermission:
            permission ?? ({required bool ask}) async => PermissionStatus.granted,
      ),
    ));
    await tester.pump();
    await tester.pump();
  }

  Future<void> settle(WidgetTester tester) async {
    await tester.pump();
    await tester.pump();
  }

  const longReason =
      'This parcel is already picked up. Hand it over at the hub (Drop at hub) next, then wait for the delivery assignment.';

  group('layout: no overflow', () {
    for (final w in [320.0, 360.0]) {
      for (final scale in [1.0, 1.5, 2.0]) {
        for (final perm in [
          PermissionStatus.granted,
          PermissionStatus.permanentlyDenied,
          PermissionStatus.denied
        ]) {
          testWidgets('${w.toInt()}dp x$scale ${perm.name}', (tester) async {
            await pump(tester,
                size: Size(w, 640),
                scale: scale,
                permission: ({required bool ask}) async => perm,
                onValidate: (c) async =>
                    ScanResult(ScanOutcome.rejected, c, longReason));
            expect(tester.takeException(), isNull);

            if (perm.isGranted) {
              expect(find.text('Camera access is needed to scan'), findsNothing);
              // a refused scan shows its specific reason, still without overflow
              emit!('mim00000002');
              await settle(tester);
              expect(find.text('Scan rejected'), findsOneWidget);
              expect(find.textContaining('Hand it over at the hub'), findsOneWidget);
            } else {
              expect(find.text('Camera access is needed to scan'), findsOneWidget);
              expect(find.text('Open Settings'), findsOneWidget);
              expect(find.text('Allow camera'),
                  perm.isPermanentlyDenied ? findsNothing : findsOneWidget);
            }
            expect(find.byTooltip('Close scanner'), findsOneWidget);
            expect(tester.takeException(), isNull);
          });
        }
      }
    }

    testWidgets('keyboard open on a small phone (320dp, 2x)', (tester) async {
      await pump(tester, size: const Size(320, 640), scale: 2);
      tester.view.viewInsets = const FakeViewPadding(bottom: 260);
      addTearDown(tester.view.resetViewInsets);
      await tester.pump();
      expect(tester.takeException(), isNull);
    });
  });

  group('behaviour', () {
    testWidgets('accepted scan: upper-cases the code, calls onConfirmed once',
        (tester) async {
      final validated = <String>[];
      final confirmed = <String>[];
      await pump(tester,
          size: const Size(360, 740),
          onValidate: (c) async {
            validated.add(c);
            return ScanResult(ScanOutcome.ok, c);
          },
          onConfirmed: (c) async => confirmed.add(c));
      emit!(' mim00000001 ');
      await settle(tester);
      expect(validated, ['MIM00000001']);
      expect(confirmed, ['MIM00000001']);
    });

    testWidgets('rejected scan: shows the server reason and never confirms',
        (tester) async {
      var confirmed = 0;
      await pump(tester,
          size: const Size(360, 740),
          onValidate: (c) async => ScanResult(
              ScanOutcome.rejected, c, 'This parcel is not assigned to you.'),
          onConfirmed: (_) async => confirmed++);
      emit!('MIM00000009');
      await settle(tester);
      expect(find.text('This parcel is not assigned to you.'), findsOneWidget);
      expect(confirmed, 0);
    });

    testWidgets('same code inside the 4 s cooldown is ignored', (tester) async {
      var calls = 0;
      await pump(tester,
          size: const Size(360, 740),
          onValidate: (c) async {
            calls++;
            return ScanResult(ScanOutcome.rejected, c, 'nope');
          });
      emit!('MIM00000001');
      await settle(tester);
      emit!('MIM00000001'); // the camera reports it again straight away
      await settle(tester);
      expect(calls, 1);
      emit!('MIM00000002'); // a different code is fine
      await settle(tester);
      expect(calls, 2);
    });

    testWidgets('manual entry validates the same way', (tester) async {
      final validated = <String>[];
      await pump(tester,
          size: const Size(360, 740),
          onValidate: (c) async {
            validated.add(c);
            return ScanResult(ScanOutcome.rejected, c, 'nope');
          });
      await tester.enterText(find.byType(TextField), 'mim00000003');
      await tester.tap(find.text('Confirm Scan'));
      await settle(tester);
      expect(validated, ['MIM00000003']);
    });

    testWidgets('a throwing validator becomes a clear rejected message',
        (tester) async {
      await pump(tester,
          size: const Size(360, 740),
          onValidate: (c) async => throw Exception('boom'));
      emit!('MIM00000004');
      await settle(tester);
      expect(find.textContaining('Could not check this scan'), findsOneWidget);
    });

    testWidgets('denied: "Allow camera" asks again and then shows the preview',
        (tester) async {
      var calls = 0;
      await pump(tester,
          size: const Size(360, 740),
          permission: ({required bool ask}) async {
            calls++;
            // first (up-front) request is refused, the retry from the button is granted
            return calls == 1
                ? PermissionStatus.denied
                : PermissionStatus.granted;
          });
      expect(find.text('Camera access is needed to scan'), findsOneWidget);
      await tester.tap(find.text('Allow camera'));
      await settle(tester);
      expect(calls, 2);
      expect(find.text('Camera access is needed to scan'), findsNothing);
      expect(find.text('Align the waybill QR within the frame'), findsOneWidget);
    });
  });
}
