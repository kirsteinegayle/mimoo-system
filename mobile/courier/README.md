# Mimoo Courier

Mobile app for Mimoo logistics/courier staff.  
Built with Flutter — companion to `mobile/buyer` and `mobile/rider`.

> **Tagline:** A Little Bit of Everything, Just a Moo Away

---

## Quick Start

```bash
# 1. Install packages
flutter pub get

# 2. Run on Chrome (dev — backend on port 8000)
flutter run -d chrome --web-port=5001 --dart-define=API_BASE_URL=http://127.0.0.1:8000/api

# 3. Open in browser
# http://localhost:5001
```

> Make sure `php artisan serve` is already running on port 8000.

---

## Environment

| Variable | Default | Description |
|---|---|---|
| `API_BASE_URL` | `http://127.0.0.1:8000/api` (web) / `http://10.0.2.2:8000/api` (Android) | Laravel API base URL |

Pass at build or run time:
```bash
flutter run --dart-define=API_BASE_URL=http://192.168.x.x:8000/api
flutter build web --dart-define=API_BASE_URL=https://mimoo.bond/api
```

---

## Folder Structure

```
lib/
  config/
    app_config.dart          # API_BASE_URL from --dart-define
  theme/
    mimoo_theme.dart         # Colours, fonts, ThemeData
  services/
    api_service.dart         # Central HTTP client (Bearer token, timeout, logs)
    courier_auth_repository.dart  # TODO: wired to POST /api/courier/login
  state/
    auth_service.dart        # Session persistence (flutter_secure_storage)
  models/                    # (empty — add as API endpoints are built)
  pages/
    splash_page.dart         # Logo animation → Login or Home
    auth/
      login_page.dart        # Login UI (NOT connected to API yet — see TODO)
    home/
      home_page.dart         # Bottom nav shell: Assigned, In Transit, Delivered, Profile
  widgets/
    mimoo_logo.dart          # Reusable logo widget
  main.dart
```

---

## Current Status

| Screen | Status | Backend |
|---|---|---|
| Splash | ✅ Done | — |
| Login | ✅ UI done | ⚠️ Needs `POST /api/courier/login` |
| Home (shell) | ✅ Done | — |
| Assigned Shipments | 🔲 Coming soon | `GET /api/courier/shipments` |
| In Transit | 🔲 Coming soon | `GET /api/courier/pickups` |
| Delivered / COD | 🔲 Coming soon | `GET /api/courier/cod` |
| Profile | 🔲 Basic only | `GET /api/courier/profile` |

---

## Next Steps

1. **Backend auth** — create `POST /api/courier/login` in
   `web/app/Http/Controllers/Api/CourierAuthController.php` and add route in `web/routes/api.php`.
   Then un-comment the real call in `lib/services/courier_auth_repository.dart`.

2. **Dashboard** — `GET /api/courier/dashboard` (stats) → DashboardTab.

3. **Assigned Shipments** — list + accept/reject UI wired to
   `GET /api/courier/shipments`, `POST /api/courier/shipments/{id}/accept`, `POST /api/courier/shipments/{id}/reject`.

4. **Pickup Management** — schedule & confirm pickup flow.

5. **Parcel Scanning** — scan waybill (camera via `image_picker`),
   `POST /api/courier/scan-parcel`.

6. **COD Remittance** — list COD orders, mark remitted.

---

## Running Tests

```bash
flutter test
```

---

## Approved Packages

| Package | Version | Use |
|---|---|---|
| `http` | ^1.2.2 | HTTP client |
| `flutter_secure_storage` | ^9.2.4 | Token persistence |
| `image_picker` | ^1.1.2 | Parcel scan (camera) |
| `google_fonts` | ^6.2.1 | Plus Jakarta Sans |
