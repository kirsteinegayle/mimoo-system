import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mimoo_rider/core/rider_status_controller.dart';
import 'package:mimoo_rider/core/theme.dart';
import 'package:mimoo_rider/data/db/app_database.dart';
import 'package:mimoo_rider/data/models/entities.dart';
import 'package:mimoo_rider/data/repositories/app_repositories_scope.dart';
import 'package:mimoo_rider/data/repositories/local_repositories.dart';
import 'package:mimoo_rider/screens/cod_remittance_screen.dart';
import 'package:mimoo_rider/screens/jobs_tab.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  late AppRepositories repositories;

  setUpAll(() {
    sqfliteFfiInit();
  });

  setUp(() async {
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

  void setNarrowLargeTextViewport(WidgetTester tester) {
    tester.view.physicalSize = const Size(360, 800);
    tester.view.devicePixelRatio = 1;
    tester.platformDispatcher.textScaleFactorTestValue = 1.5;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
      tester.platformDispatcher.clearTextScaleFactorTestValue();
    });
  }

  testWidgets('For Delivery filters fit and show a single At Hub chip',
      (tester) async {
    setNarrowLargeTextViewport(tester);
    final riderStatus = RiderStatusController(
      parcelRepository: repositories.parcels,
      riderProfileRepository: repositories.riderProfile,
      online: false,
    );
    addTearDown(riderStatus.dispose);

    await tester.pumpWidget(MaterialApp(
      home: AppRepositoriesScope(
        repositories: repositories,
        child: RiderStatusScope(
          controller: riderStatus,
          child: const Scaffold(body: JobsTab()),
        ),
      ),
    ));
    await tester.tap(find.textContaining('For Delivery'));
    await tester.pumpAndSettle();

    expect(find.textContaining('Ready for pickup'), findsOneWidget);
    expect(find.textContaining('Picked up'), findsOneWidget);
    expect(find.textContaining('At Hub'), findsOneWidget);
    expect(find.textContaining('Out for Delivery'), findsOneWidget);
    expect(find.textContaining('Overdue'), findsOneWidget);
    expect(find.textContaining('Return to Sender'), findsOneWidget);
    expect(find.textContaining('Returned'), findsOneWidget);
    expect(find.textContaining('Assigned'), findsNothing);
    for (final tracking in [
      'TRK-0012601',
      'TRK-0012604',
      'TRK-0012322',
      'TRK-0011982',
    ]) {
      final card = tester.widget<MCard>(
        find
            .ancestor(
              of: find.text(tracking),
              matching: find.byType(MCard),
            )
            .first,
      );
      expect(card.onTap, isNull, reason: '$tracking must be read-only');
    }
    await tester.ensureVisible(find.textContaining('Out for Delivery'));
    await tester.tap(find.textContaining('Out for Delivery'));
    await tester.pumpAndSettle();
    expect(find.text('TRK-0012605'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('Job Offers content remains visible while rider is offline',
      (tester) async {
    setNarrowLargeTextViewport(tester);
    final riderStatus = RiderStatusController(
      parcelRepository: repositories.parcels,
      riderProfileRepository: repositories.riderProfile,
      online: false,
    );
    addTearDown(riderStatus.dispose);

    await tester.pumpWidget(MaterialApp(
      home: AppRepositoriesScope(
        repositories: repositories,
        child: RiderStatusScope(
          controller: riderStatus,
          child: const Scaffold(body: JobsTab()),
        ),
      ),
    ));

    expect(find.text('Santo Angel Pantry'), findsOneWidget);
    expect(find.text("You're offline. Go Active to accept job offers."),
        findsOneWidget);
    expect(find.text('No pickup offers right now'), findsNothing);
    expect(tester.takeException(), isNull);
  });

  testWidgets('COD amount and due chip stay visible at narrow width',
      (tester) async {
    setNarrowLargeTextViewport(tester);
    final parcel = Parcel(
      trackingNo: 'TRK-COD-2250',
      jobType: ParcelJobType.delivery,
      status: ParcelStatus.delivered,
      sellerName: 'Seller',
      sellerAddress: 'Seller address',
      buyerName: 'Buyer',
      buyerPhone: '0918',
      address: 'Buyer address',
      codAmount: 2250,
      codCollected: true,
      updatedAt: DateTime.now(),
    );

    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: CodRemittanceScreen(
          parcels: [parcel],
          history: const [],
          fleetName: 'Mimoo Logistics',
          cutoff: '10:00 PM',
          onRemit: (_, __, ___) async {},
        ),
      ),
    ));
    await tester.pumpAndSettle();

    expect(find.text('₱2,250.00'), findsWidgets);
    expect(find.text('DUE 10:00 PM'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
