# Mimoo — Live Checklist (P4)

Palitan ang `<domain>` ng totoong domain (hal. `mimoo.bond`). Hindi ginalaw ang `.env` — gabay lang ito.

---

## 1. `.env` sa production (`web/.env`)

| Key | Ngayon (local) | Production |
|---|---|---|
| `APP_ENV` | `local` | `production` |
| `APP_DEBUG` | `true` | `false` — **mahalaga**: kapag `true`, ibinabalik ng `/api/rider-app/deliveries/{id}/otp` ang `debug_otp` (RiderDeliveryController.php:172) at lumalabas ang stack trace |
| `LOG_LEVEL` | `debug` | `warning` o `error` |
| `APP_URL` | `http://localhost:8000` | `https://<domain>` (ginagamit sa photo URLs at email links) |
| `APP_KEY` | — | bagong key sa server: `php artisan key:generate` (huwag kopyahin ang local) |
| `DB_HOST/PORT/DATABASE/USERNAME/PASSWORD` | local MySQL | production DB credentials (hiwalay na user, hindi root) |
| `MAIL_MAILER` | `log` | `smtp` + `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_SCHEME`, `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME`. Habang `log`, **walang naipapadalang** OTP, verification o password-reset email (nasusulat lang sa `storage/logs`). |
| `SESSION_DOMAIN` | `null` | `.<domain>` (o `<domain>` kung iisang host lang) |
| `SESSION_SECURE_COOKIE` | (wala) | `true` |
| `SANCTUM_STATEFUL_DOMAINS` | (wala) | `<domain>,www.<domain>` — para sa web SPA lang; ang Flutter apps ay Bearer token kaya hindi apektado |
| `QUEUE_CONNECTION` | `database` | `database` ay OK pero **kailangan ng tumatakbong worker** (tingnan §2). Walang `ShouldQueue` class na nakita sa `app/`, pero Laravel/Fortify notifications ay maaaring i-queue sa hinaharap. |
| `ADMIN_MASTER_CODE` | (local value) | bagong random na value |
| `FILESYSTEM_DISK` | `local` | `local` OK (POD ay `local` disk, buyer/return photos ay `public` disk) |
| `BROADCAST_CONNECTION` | `log` | iwan kung walang realtime feature |

**CORS:** Walang `config/cors.php`, kaya gamit ang default ng Laravel 12 (`paths: api/*, sanctum/csrf-cookie`, `allowed_origins: *`).
- Android/iOS builds: hindi kailangan ang CORS.
- Flutter **web** builds na naka-host sa ibang origin kaysa API: gumagana na sa default (`*`). Kung gusto mong limitahan sa sariling domain lang, kailangang i-publish ang `config/cors.php` (`php artisan config:publish cors`) at itakda ang `allowed_origins` — **desisyon mo** (tingnan §6).

---

## 2. Server

```bash
cd /path/to/web
composer install --no-dev --optimize-autoloader
npm ci && npm run build
rm -f public/hot            # ⚠ may public/hot sa repo ngayon; kapag naiwan, kukunin ng Laravel ang assets sa Vite dev server
php artisan key:generate    # unang deploy lang
php artisan migrate --force
php artisan storage:link    # para sa /storage (buyer_photos, chat_images, atbp.)
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

- **Scheduler (cron)** — kailangan para sa `orders:auto-complete` (routes/console.php:8, daily):
  ```
  * * * * * cd /path/to/web && php artisan schedule:run >> /dev/null 2>&1
  ```
- **Queue worker** (supervisor/systemd):
  ```
  php artisan queue:work --sleep=3 --tries=3 --max-time=3600
  ```
  Pagkatapos ng bawat deploy: `php artisan queue:restart`.
- **HTTPS**: valid na TLS certificate (hal. Let's Encrypt), i-redirect ang HTTP → HTTPS. `APP_URL` ay dapat `https://` para walang mixed content sa photo URLs na ibinabalik ng API. Kung nasa likod ng proxy/load balancer, i-configure ang trusted proxies para tama ang `https` scheme.
- Pagkatapos baguhin ang `.env`: `php artisan config:clear && php artisan config:cache`.

---

## 3. Build commands ng apps

Pansinin: **magkaiba** ang format ng `API_BASE_URL` ng rider.

| App | Ano ang inaasahan ng code | Halaga |
|---|---|---|
| Buyer (`lib/services/api_service.dart`) | API root **may** `/api` | `https://<domain>/api` |
| Courier (`lib/config/app_config.dart`) | API root **may** `/api` | `https://<domain>/api` |
| Rider (`lib/core/api_config.dart`) | server root **walang** `/api` (dinadagdag ng code ang `/api/rider-app`) | `https://<domain>` |

```bash
# Buyer
cd mobile/buyer
flutter build apk --release       --dart-define=API_BASE_URL=https://<domain>/api
flutter build appbundle --release --dart-define=API_BASE_URL=https://<domain>/api
flutter build web --release       --dart-define=API_BASE_URL=https://<domain>/api

# Courier
cd mobile/courier
flutter build apk --release --dart-define=API_BASE_URL=https://<domain>/api

# Rider  (WALANG /api sa dulo)
cd mobile/rider
flutter build apk --release --dart-define=API_BASE_URL=https://<domain>
```

Kapag walang `--dart-define`, babalik ang apps sa dev default (`127.0.0.1` / `10.0.2.2`) — kaya laging isama ito sa release build.

Release-safety na na-verify:
- Rider: `useMock = false` (api_config.dart:8). Demo login prefill (`kDebugDemoEmail/Password`, api_config.dart:35-36) ay ginagamit lang sa `if (kDebugMode && !useMock)` (login.dart:36) → tree-shaken sa release. "Simulate assigned job" (inbox_screen.dart:49) ay `kDebugMode && useMock`; State gallery entry (jobs_screen.dart:68, profile_tab.dart:152) ay `kDebugMode`; debug OTP hint ay `kDebugMode`.
- Courier: walang mock/demo; `API_BASE_URL` lang ang gamit.

---

## 4. Pag-verify ng live

```bash
# Health
curl -i https://<domain>/up                       # 200

# Login bawat role (palitan ang credentials ng totoong account)
curl -s -X POST https://<domain>/api/buyer/login       -H 'Accept: application/json' -d email=BUYER  -d password=PASS
curl -s -X POST https://<domain>/api/courier-app/login -H 'Accept: application/json' -d email=COURIER -d password=PASS
curl -s -X POST https://<domain>/api/rider-app/login   -H 'Accept: application/json' -d email=RIDER  -d password=PASS
# Seller/admin (web): mag-login sa https://<domain>/login sa browser
```

Inaasahan: 200 + token. Tingnan din na `https://` ang lahat ng URL sa response at walang `debug_otp`/stack trace.

Uploads (gamitin ang totoong app sa release build):
1. **POD** — Rider app: kumpletuhin ang delivery na may photo → `POST /api/rider-app/deliveries/{id}/pod`. I-check na may file sa `storage/app/private/...` (local disk) at walang 500 sa `storage/logs/laravel.log`.
2. **Return photo** — Buyer app: Request return na may photo → `POST /api/buyer/orders/{id}/return`. Buksan ang return detail at tiyaking lumalabas ang photo (`/api/buyer/return-photo/{filename}`).
3. **Email** — mag-register ng bagong buyer/rider at tiyaking dumating ang verification/OTP email (patunay na gumagana ang SMTP).
4. **Scheduler** — `php artisan schedule:list` dapat may `orders:auto-complete`.

---

## 5. Naka-demo pa / dapat palitan bago live

Backend (`web/`):
- `database/seeders/DatabaseSeeder.php:22-23` — admin `admin@mimoo.com` na may hardcoded na password. Huwag i-seed sa production, o palitan agad ang password pagkatapos.
- `app/Console/Commands/RiderDemoSeed.php`, `RiderDemoDelivery.php`, `RiderDemoClean.php`, `RiderTestDelivery.php` — demo/test commands (gumagawa ng `demo.rider@mimoo-demo.test`). Huwag patakbuhin sa production; isaalang-alang kung isasama sa deploy.
- `web/public/hot` — Vite dev file; dapat wala sa server.
- Sa ugat ng repo: `_debug_b0.php` ay nasa git status bilang untracked (wala na sa disk nang i-check) — tiyaking hindi ma-deploy ang anumang `_debug*.php`.

Buyer (`mobile/buyer/lib`):
- `pages/orders/track_order_page.dart:41` — `_kMapsApiKey = 'YOUR_GOOGLE_MAPS_API_KEY'` (placeholder; kailangan ng totoong key, mas mabuti sa `--dart-define`).
- `pages/orders/return_refund_models.dart:17` — default `contactEmail = 'mumimumiee@gmail.com'` (mukhang personal na email).
- `data/sample_products.dart` + `pages/orders/orders_page.dart:666` — hardcoded na sample products (picsum images) sa "recommended" grid.
- `pages/home/shop_page.dart:64-88`, `pages/landing_page.dart:131-210`, `pages/cart/cart_page.dart:425`, `pages/orders/orders_page.dart:129-241, 2611, 2902-2925` — placeholder/simulated data at `picsum.photos` images.
- `pages/orders/request_return_refund_page.dart:371` — "Simulate selecting a photo" (tingnan kung ito pa ang gamit na flow).
- `pages/orders/my_review_page.dart:446,1274`, `rate_product_page.dart:528`, `refund_details_screen.dart:504,518`, `track_order_page.dart:818,911`, `driver_chat_page.dart:193,737`, `pages/seller/*` — `picsum.photos` placeholder images.

Rider (`mobile/rider/lib`):
- `screens/registration.dart:443-452` — lokal na OTP (random code, walang SMS); ang banner ay `kDebugMode` lang, kaya sa release **hindi makikita ng user ang code** at walang SMS na ipinapadala → hindi matatapos ang phone verification sa release.
- `screens/registration.dart:832` — `tel:+639171234567` (placeholder na Logistics hotline).
- `data/db/app_database.dart:553-571` — lokal na SQLite seed na `rider@mimoo.ph` / password `password` (ginagamit lang kapag `useMock = true`; `login.dart:115` biometric path ay `useMock` lang din).
- `core/app_info.dart:6` — `support@mimoo.ph`; tiyaking totoong inbox ito.

Courier (`mobile/courier/lib`): walang nakitang demo/mock.

---

## 6. Kailangan ng desisyon mo

1. **Domain** at kung `www` din (para sa `SESSION_DOMAIN`, `SANCTUM_STATEFUL_DOMAINS`, `APP_URL`, build commands).
2. **SMTP provider** (hal. Gmail Workspace, Mailgun, SES, Brevo) at `MAIL_FROM_ADDRESS`.
3. **CORS**: iwan ang default (`*`) o i-publish ang `config/cors.php` at limitahan sa `https://<domain>` (kailangan lang kung may Flutter web sa ibang origin).
4. **Queue**: `database` + worker (pinakasimple) o `redis`.
5. **Rider phone OTP sa registration**: walang SMS provider; sa release hindi lumalabas ang code — kailangan ng SMS integration o pansamantalang alisin/laktawan ang hakbang (logic change, hindi sakop ng P4).
6. **Google Maps API key** para sa buyer track-order (at kung gagawing `--dart-define`).
7. **Placeholder/sample data at picsum images** sa buyer — tanggalin o palitan ng totoong data bago live (feature work, hindi sakop ng P4).
8. **Admin seed** — paano gagawin ang unang admin sa production (seed na may bagong password o manual).
9. Kung isasama sa production deploy ang `rider:demo-*` / `rider:test-delivery` commands.
