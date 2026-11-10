# Courier Implementation and Audit Report

## Changelog — 2026-11-10

- **Login icons always visible and aligned:** mail/lock icons moved into the
  field's own Row (one 44 px container) instead of `InputDecoration.prefix`;
  Poppins ascent compensated (`height: 1.0`, even leading, strut, collapsed
  decoration, measured -1.5 px offset). Widget test added.
- **Demo content removed, real API only:** deleted `courier_mock_api.dart`,
  demo login, DEMO MODE banner, simulate-barcode, hardcoded roster/COD data;
  backend `demo-login` and `CourierDemoSeeder` removed. 401 clears the session
  and returns to Login.
- **API base URL per environment:** Android emulator `10.0.2.2:8000/api`,
  web/iOS `localhost:8000/api`, real phone via `--dart-define=API_BASE_URL`.
- **Real couriers:** created by Logistics in web courier management.
- **Splash matches buyer:** 2600 ms fade sequence, black background, same image
  and native Android launch theme; destination is Home with a valid session,
  otherwise Login.

## Scope

Courier work was performed in `C:\Project\mimoo-overall\mobile\courier` and
`C:\Project\mimoo-system\web`. `C:\Project\rider\mimoo_rider` is the Rider
clone; it was not used for these Courier changes.

## Implemented in this continuation

- Corrected Pickup navigation label and added total/scheduled counts to Pickup
  filter chips, with API and widget test coverage.
- Enabled all `mobile_scanner` barcode formats and added camera/flashlight
  loading scans, duplicate-read suppression and breakdown rescan UX.
- Added Camera document capture alongside Files upload.
- Locked the courier and trip rows while assigning/accepting so overlapping
  assignment/accept requests cannot leave one courier with multiple active
  trips.
- Allowed reassignment of an In Transit trip only after a Vehicle breakdown
  report. The replacement courier inherits the trip pay, must rescan every
  parcel, and cannot mark Arrived until rescanning is complete.
- Added Laravel feature tests for capacity, the one-active-trip rule,
  breakdown reassignment/rescans and vehicle pay.
- Added and applied a migration for persisted missing-parcel state. Logistics
  handover now records seal/missing discrepancies, updates orders to `at_hub`
  or `missing_in_transit`, and notifies sellers; tests cover the workflow.
- Updated README and created Courier-scoped agent/audit documentation.

The inherited implementation already included the Home/Scan-centered
navigation, messages, notifications, Dispatch Timeline, pickup actions,
account pages, trip APIs, document upload API, checklist/duty rules and
history/pay endpoints. Those features were inspected and retained.

## Black-box totals

Of 52 workbook cases: **32 IMPLEMENTED**, **12 PARTIAL**, **5 MISSING**, and
**3 NEEDS DEVICE TEST**. Module breakdown and case evidence:
[`../../docs/COURIER_BLACKBOX_AUDIT.md`](../../docs/COURIER_BLACKBOX_AUDIT.md).

## Verification

- `flutter analyze`: passed, no issues.
- `flutter test`: passed, 7 tests.
- Flutter hot reload: succeeded.
- Courier Laravel feature tests via Pest with SQLite enabled: passed, 17 tests
  and 176 assertions.
- `php artisan route:list --path=courier-app`: passed, 51 routes (after removing `demo-login`).
- `php artisan migrate --force`: passed; migration
  `2026_11_10_000001_add_missing_to_courier_trip_parcels` applied.
- The ordinary `php artisan test` command was attempted and failed because the
  PHP CLI lacks the SQLite PDO driver. The focused Courier Pest suite passed
  when the SQLite extensions were explicitly enabled.
- Real Android/iOS camera, location, flashlight, push, background behavior and
  accessibility/large-font checks were not verified on hardware.

## PROGRESS NOTE

Finished: login icons/alignment, demo removal in app and backend code, API base
URL config, splash match, docs.

Not done / not verified:

- The old demo user (`demo@courier.mimoo`) may still exist in a developer's
  local database; delete it manually (databases are per developer).
- No real courier was created in this pass, so the end-to-end web <-> mobile
  sync check (create on web -> appears on mobile; mobile action -> web) is not
  verified.
- Native splash / Android 12 behavior and the splash screenshot comparison need
  a device or emulator.

Remaining work for the next agent:

1. Implement push notifications for relevant users; current notifications are
   in-app database records only.
2. Add periodic/background courier location updates and stale-duty handling;
   the API currently accepts explicit location updates only.
3. Add destination-map launch from trip details.
4. Add offline/no-internet state and safe retry/queue behavior for trip scans.
5. Add a Logistics action to remove a parcel before departure and return it to
   the origin hub.
6. Require a courier-authored 10–300 character discrepancy note before
   Logistics completes a seal/missing discrepancy; current receiving stores a
   note supplied by Logistics. Verify customer/seller tracking consumers honor
   destination `at_hub` and `missing_in_transit` statuses. Damage-photo
   receiving is API-backed but does not enforce live-camera capture.
7. Include declined and reassigned-away trips in Courier history/pay views.
8. Add document previews and verify Camera/Files flows, file-size behavior,
   permissions, session timeout, small-screen/large-text layouts and trip
   scanning on physical Android devices. The checkout has no iOS project, so
   iOS permission configuration and testing are still outstanding.