# Courier App Working Notes

## Changelog — 2026-11-10

- Login icons (mail, lock) always visible and aligned with the text: one 44 px
  container with a Row, no `InputDecoration.prefix`, Poppins metrics fixed.
- All demo/mock content removed; the app uses only the real Laravel API, with
  error + Retry on every screen. Backend `demo-login` and `CourierDemoSeeder`
  removed.
- API base URL is environment-driven (`lib/config/app_config.dart`): Android
  emulator `http://10.0.2.2:8000/api`, web/iOS `http://localhost:8000/api`, real
  phone via `--dart-define=API_BASE_URL=http://<LAN-IP>:8000/api`.
- Real couriers are created by Logistics in web courier management
  (`role=courier`, `status=approved`, `verification_status=verified`).
- Splash matches the buyer app exactly; only the next screen differs.

## Scope and guardrails

- The Courier Flutter app is in this folder; the Laravel API is in
  `../../web`. This workspace is separate from the Rider clone.
- Preserve the existing Mimoo UI theme, fonts, colors, spacing and card/button
  styles. Add or remove only requested behavior and reuse `mimoo_theme.dart`
  and `courier_shared.dart`.
- Never add demo/mock data, demo credentials or auto-login to app code. Test
  doubles live only in `test/`.
- Do not touch Firebase or the Buyer/Rider apps for Courier work.
- Keep binary workbook input read-only. The source is
  `../../docs/Mobile_Blackbox_Test_Cases_Courier_Modules.xlsx`.
- Format only files changed. Avoid broad project formatting and destructive
  cleanup.

## Validation

From `mobile/courier`, run `flutter analyze` and `flutter test`. For Courier
Laravel feature tests, use the PHP SQLite extensions when available:

```powershell
Set-Location ..\..\web
php -d extension=pdo_sqlite -d extension=sqlite3 vendor\bin\pest tests\Courier\CourierAppApiTest.php
```

The regular `php artisan test` command currently cannot start SQLite tests
because the PHP CLI does not load `pdo_sqlite` by default.

## Current implementation notes

- Bottom navigation is Home, Shipments, Scan, Pickup, Account; Scan is centered.
- Home timeline, in-app notifications/chat, profile, documents, duty/checklist,
  trip lifecycle, history and pay have Courier API support.
- Trip assignment/acceptance is serialized by courier; breakdown reassignment
  keeps the trip In Transit and requires the replacement courier to rescan all
  parcels.
- Logistics hub receiving records seal mismatches and confirmed missing
  parcels, updates order statuses, and sends seller notifications. The
  `2026_11_10_000001_add_missing_to_courier_trip_parcels` migration has been
  applied in the current local environment. Courier-authored discrepancy notes
  remain a gap.
- Latest validation: `flutter analyze` clean, `flutter test` passed (7 tests),
  and focused Courier Pest passed (17 tests / 176 assertions).
- Android camera permission is declared. This checkout has no `ios/` project.
- Case-by-case limitations and the exact handoff are in
  [`../../docs/COURIER_BLACKBOX_AUDIT.md`](../../docs/COURIER_BLACKBOX_AUDIT.md)
  and the `PROGRESS NOTE` in [`README.md`](README.md).