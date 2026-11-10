# Mimoo Courier

Mobile app for Mimoo logistics/courier staff.
Built with Flutter — companion to `mobile/buyer` and `mobile/rider`.

> **Tagline:** A Little Bit of Everything, Just a Moo Away

---

## Quick Start

### 1. Backend

```bash
cd web

# Apply the courier schema (users.role + courier tables)
php artisan migrate

# Serve the API (0.0.0.0 so a real phone on the same Wi-Fi can reach it)
php artisan serve --host=0.0.0.0 --port=8000
```

There is no demo seeder. Create a real courier first (see
[Courier accounts](#courier-accounts)).

### 2. Mobile app

```bash
cd mobile/courier

flutter pub get

# Chrome (backend on port 8000)
flutter run -d chrome --web-port=5001 \
  --dart-define=API_BASE_URL=http://127.0.0.1:8000/api
```

Open <http://localhost:5001>. The app always talks to the real Laravel API, so
the backend must be running and a real courier account must exist.

---

## Courier accounts

The app has no demo mode, no demo credentials and no offline sample data.
Every screen reads from the Laravel API and shows an error with **Retry** if a
request fails.

**Create a real courier (web):** sign in to the web app as a Logistics user and
add the courier through the courier management screen. The account must have
`role = courier`, `status = approved` and `verification_status = verified`,
otherwise login is rejected. Credentials are never stored in the app or repo.

Login errors shown in the app: wrong email/password, an account that is not a
courier, and suspended or unapproved accounts. A courier only sees their own
shipments, pickups, trips, notifications and messages.

> If your local database still contains `demo@courier.mimoo` from the old
> `CourierDemoSeeder`, delete that user (and its related rows) manually.
> Databases are per developer, so pulling the code does not remove it.

---

## Environment

One config file, `lib/config/app_config.dart`, decides the API base URL.

| Target | Base URL |
|---|---|
| Android emulator (default) | `http://10.0.2.2:8000/api` |
| Web, iOS simulator, desktop (default) | `http://localhost:8000/api` |
| Real phone | your PC's LAN IP, passed with `--dart-define` |

```bash
# Real phone on the same Wi-Fi as the PC running `php artisan serve --host=0.0.0.0`
flutter run --dart-define=API_BASE_URL=http://192.168.x.x:8000/api

# Production build
flutter build web --dart-define=API_BASE_URL=https://mimoo.bond/api
```

`AppConfig` trims trailing slashes and appends `/api` if the value does not
already end with it, so `/api` is never duplicated or missing. Every request
sends `Accept: application/json`, and the Bearer token is sent on every
authenticated request. A `401` clears the saved session and returns to Login.

---

## API Endpoints

All routes are additive under `/api/courier-app` and require
`Authorization: Bearer <Sanctum token>` except `login`. The `courier` role is
required.

| Method | URI | Purpose |
|---|---|---|
| POST | `/api/courier-app/login` | Email/password login |
| POST | `/api/courier-app/logout` | Revoke current token |
| GET | `/api/courier-app/me` | Current courier profile |
| GET | `/api/courier-app/dashboard` | Real shipment/pickup counts |
| GET | `/api/courier-app/shipments` | Paginated assignments (`status`, `date_from`, `date_to`, `page`) |
| GET | `/api/courier-app/shipments/{id}` | Shipment detail |
| POST | `/api/courier-app/shipments/{id}/accept` | Accept assignment |
| POST | `/api/courier-app/shipments/{id}/reject` | Reject assignment with `reason` |
| GET | `/api/courier-app/pickups` | Paginated pickups + stats + personnel |
| POST | `/api/courier-app/pickups/{id}/schedule` | Set `scheduled_date` / `scheduled_time_window` |
| POST | `/api/courier-app/pickups/{id}/assign-personnel` | Set `personnel_id` |
| POST | `/api/courier-app/pickups/{id}/confirm` | Confirm with `scanned_waybill` |
| POST | `/api/courier-app/pickups/{id}/record-failed` | Record `reason` |
| GET | `/api/courier-app/facilities` | Active facilities |
| GET | `/api/courier-app/parcel/{waybill}` | Parcel lookup by waybill |
| GET | `/api/courier-app/parcels/scan/{waybill}` | Alias of parcel lookup |
| POST | `/api/courier-app/scan-parcel` | Record scan (`waybill_number`, `facility_id`) |
| GET | `/api/courier-app/timeline` | Courier trip and parcel events |
| GET | `/api/courier-app/notifications` | List notifications (`filter`, `category`, `page`) |
| GET | `/api/courier-app/notifications/unread-count` | Unread notification badge |
| POST | `/api/courier-app/notifications/{id}/read` | Mark one notification read |
| POST | `/api/courier-app/notifications/read-all` | Mark all notifications read |
| GET | `/api/courier-app/messages/conversations` | Courier/logistics conversations |
| GET | `/api/courier-app/messages/unread-count` | Unread message badge |
| GET/POST | `/api/courier-app/messages/{id}/messages` | Read or send a chat message |
| GET | `/api/courier-app/trips` | Courier trips (`filter`, `date_from`, `date_to`) |
| GET | `/api/courier-app/trips/{id}` | Courier-owned trip detail |
| POST | `/api/courier-app/trips/{id}/accept` | Accept an assigned trip |
| POST | `/api/courier-app/trips/{id}/decline` | Decline with a reason |
| POST | `/api/courier-app/trips/{id}/start-loading` | Start parcel loading |
| POST | `/api/courier-app/trips/{id}/scan` | Load or rescan a parcel by waybill |
| POST | `/api/courier-app/trips/{id}/depart` | Depart with seal and coordinates |
| POST | `/api/courier-app/trips/{id}/delay` | Report a delay and new ETA |
| POST | `/api/courier-app/trips/{id}/arrive` | Mark arrival with coordinates |
| POST | `/api/courier-app/trips/{id}/note` | Add a courier note |
| POST | `/api/courier-app/trips/{id}/cancel` | Cancel before departure |
| GET | `/api/courier-app/profile` | Courier, vehicle, hub and document metadata |
| PUT | `/api/courier-app/profile/vehicle` | Update vehicle, capacity, plate and license |
| POST | `/api/courier-app/profile/documents` | Upload a document (max 5 MB) |
| POST | `/api/courier-app/profile/change-password` | Change password |
| GET | `/api/courier-app/duty` | Duty, checklist and active-trip state |
| POST | `/api/courier-app/duty/checklist` | Submit pre-trip checklist |
| POST | `/api/courier-app/duty/on` | Go On Duty with location |
| POST | `/api/courier-app/duty/off` | Go Off Duty |
| POST | `/api/courier-app/duty/location` | Update last known location |
| GET | `/api/courier-app/history/summary` | Completed-trip pay summary |
| GET | `/api/courier-app/history/payments` | Completed trip payments |
| GET | `/api/courier-app/history/trips` | Courier-owned trip history |
| GET | `/api/courier-app/history/trips/{id}` | Courier-owned trip receipt |

The legacy `parcel` / `parcels/scan` / `scan-parcel` aliases keep older mobile
builds working.

Additional courier endpoints cover profile/vehicle and documents, duty and
checklists, notifications, messages, trip lifecycle, timeline, and history/pay.
Logistics-only trip assignment, reassignment, receiving, notifications, and
messages live under `/api/logistics-app/*`.

### Schema notes

The courier schema is additive: `users.role` plus `courier_facilities`,
`courier_personnel`, `shipment_assignments` (including pickup fields),
`shipment_assignment_history`, `shipment_scans`, and courier trip/account
tables. Migration `2026_11_10_000001_add_missing_to_courier_trip_parcels`
adds persisted missing-parcel state. Receiving updates completed orders to
`at_hub` and confirmed missing orders to `missing_in_transit`.

The history enum in this workspace only supports
`assigned | accepted | rejected | re-assigned`, so API actions are mapped as:

| Action | Stored history status |
|---|---|
| Schedule / assign personnel | `re-assigned` (detail in `notes`) |
| Confirm pickup | `accepted` |
| Record failed attempt | `rejected` |

---

## Folder Structure

```
lib/
  config/
    app_config.dart              # API_BASE_URL from --dart-define
  theme/
    mimoo_theme.dart             # Colours, fonts, ThemeData
  services/
    api_service.dart             # HTTP client (Bearer token, timeout, errors)
    courier_repository.dart      # Courier data access
  state/
    auth_service.dart            # Session + token persistence
  models/
    courier_models.dart          # User, stats, shipment, pickup, scan models
  pages/
    splash_page.dart                 # Session restore → Login or Home
    auth/login_page.dart             # Email/password login
    home/home_page.dart              # Home, Shipments, Scan, Pickup, Delivery
    dashboard/dashboard_tab.dart     # Dashboard stats + dispatch timeline
    shipments/shipments_tab.dart     # Filters, detail, accept/reject
    pickups/pickups_tab.dart         # Counted filters and pickup actions
    scan/scan_tab.dart               # Live QR/barcode camera + manual lookup
    notifications/notifications_page.dart
    messages/messages_page.dart      # Conversation list and chat
    trips/                           # Trip lifecycle and camera loading scan
    account/                         # Profile, vehicle, documents, duty, pay
  widgets/
    mimoo_logo.dart              # Reusable logo widget
  main.dart
```

---

## Current Status

| Screen | Status | Backend |
|---|---|---|
| Splash | Done | — |
| Login | Done | `POST /api/courier-app/login` |
| Home | Done | Dashboard counts and dispatch timeline |
| Shipments | Done | List, detail, accept, reject |
| Pickup | Done | Counted filters, schedule, assign, confirm, fail |
| Scan | Done | Camera QR/barcode scan, flashlight and manual entry |
| Delivery | Done | Trip lifecycle, loading scans, breakdown rescan |
| Messages/Notifications | Done | Conversation actions and unread counts |
| Account | Done | Profile, vehicle, documents, duty checklist, history/pay |
| Rider Management / COD & Remittance | Placeholder | No real endpoints yet; screens show an honest empty state |

Physical-device verification is still required for camera, flashlight,
permissions, background location, locked-screen notifications, and small
screens with large text. Push delivery, offline queuing, courier-authored
handover discrepancy notes and some history cases remain open; see
`../../docs/COURIER_BLACKBOX_AUDIT.md`.

## Changelog

- Courier login redesigned from docs\design\Courier_Login.svg (colors, Poppins
  on the login screen only, logo asset, layout).
- **Login icons always visible and aligned:** the mail and lock icons (size 18,
  `#655A93`) now live in the field's own Row inside one 44 px container instead
  of `InputDecoration.prefix`, which only shows on focus. Poppins' tall ascent
  pushed text low; fixed with `height: 1.0`, even leading distribution, a forced
  strut, a collapsed `InputDecoration`, and a measured `-1.5 px` vertical offset.
  A widget test checks both icons exist before any tap and are centered with the
  text.
- **All demo content removed, real API only:** deleted the mock API, demo login,
  demo banner, sample data and hardcoded rosters; backend `demo-login`,
  `CourierDemoSeeder` and demo test fixtures removed. Failed requests show an
  error with Retry.
- **API base URL per environment:** see [Environment](#environment).
- **Real couriers:** created by Logistics through web courier management; see
  [Courier accounts](#courier-accounts).
- **Splash matches the buyer app:** same 2600 ms fade sequence, black
  background, `splash.png` cover image, zero-duration transition and native
  Android launch theme; only the destination differs (valid session -> Home,
  else Login).
- Navigation uses **Home, Shipments, Scan, Pickup, Delivery**, with Scan
  centered; Account remains in the menu. Home adds Messages/Notifications
  shortcuts and a Dispatch Timeline.
- Pickup filter chips now show total, pending, scheduled, picked-up and failed
  counts from the API.
- Added live QR/barcode scanning using `BarcodeFormat.all`, a flashlight,
  duplicate-read debounce and manual waybill input. Trip loading supports
  camera scans and required rescans after vehicle-breakdown reassignment.
- Added in-app notifications/chat, account profile and vehicle editing,
  document upload from Files or Camera, pre-trip checklist, location-gated duty,
  and trip history/pay.
- Serialized assignment and acceptance on the courier record, enforced one
  active trip/capacity, and added tested vehicle-breakdown reassignment.
- Added Laravel and Flutter tests for pickup counts, capacity, active-trip
  blocking, breakdown rescan and pay rates.
- Added and applied a migration for missing-parcel state. Logistics receiving
  now records seal/missing discrepancies, updates order statuses, writes audit
  and timeline events, and notifies sellers. Courier-authored discrepancy
  notes remain a gap.
- Focused Courier Pest suite: 17 tests / 176 assertions.
- Detailed black-box results: `../../docs/COURIER_BLACKBOX_AUDIT.md`.

---

## Running Tests

### Mobile

```bash
cd mobile/courier
flutter analyze
flutter test
```

### Backend courier tests

The PHP CLI on this machine does not enable SQLite by default. Run Pest
directly so the extension flags reach the test process:

```bash
cd web
php -d extension=pdo_sqlite -d extension=sqlite3 \
  vendor/bin/pest tests/Courier/CourierAppApiTest.php
```

`php artisan test` spawns a separate PHP process and therefore cannot use those
`-d` flags; without SQLite it reports `could not find driver`.

The courier test file builds only the tables it needs, so it does not depend on
the workspace's MySQL-only migrations.

---

## Troubleshooting

**`route api/courier-app/... could not be found`**

The backend routes are not loaded or the app is pointing at a different
backend. Confirm:

```bash
cd web
php artisan route:list --path=courier-app
```

If the routes are missing, verify the `Courier` route group exists in
`routes/api.php` and that `bootstrap/app.php` registers the `courier.role`
middleware alias.

**Login works but every tab is empty / 401**

The token was not persisted or has expired. The app clears the session on a
`401`; sign in again with a real courier account.

**Cannot reach the server**

Check the base URL for your target (see [Environment](#environment)). A real
phone needs the PC's LAN IP, `php artisan serve --host=0.0.0.0`, and the same
Wi-Fi network.

**Parcel not found**

Use a waybill that exists in your own database.

---

## Approved Packages

| Package | Version | Use |
|---|---|---|
| `http` | ^1.2.2 | HTTP client |
| `flutter_secure_storage` | ^9.2.4 | Token persistence |
| `image_picker` | ^1.1.2 | Camera document capture |
| `google_fonts` | ^6.2.1 | Plus Jakarta Sans |
| `mobile_scanner` | ^5.2.3 | Camera QR/barcode scanning |
| `permission_handler` | ^11.3.1 | Camera-denied settings link |
| `file_picker` | ^11.0.3 | Document selection |
| `geolocator` | ^14.0.2 | Duty and geofence coordinates |

## Progress Note

Still open: device verification of Android camera/flashlight/location and
large-font layouts; iOS configuration (this checkout has no `ios/` project);
push notifications; background location/stale-duty detection; map-app handoff;
offline scan retry/queue; removal of an individual trip parcel; courier-
authored discrepancy notes before Logistics closes a seal/missing discrepancy;
verification that customer/seller tracking consumers honor `at_hub` and
`missing_in_transit`; and history rows for declined/reassigned-away trips.
See `../../docs/COURIER_BLACKBOX_AUDIT.md` for case-level status and evidence.