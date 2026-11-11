/// Courier app feature flags — the ONE place that decides which screens are
/// reachable.
///
/// A flag is `false` when the Laravel backend has no /api/courier-app route
/// for that feature yet (checked with `php artisan route:list
/// --path=courier-app`). The screens and repository methods are kept in the
/// code; only menus, tabs and background calls are hidden. Turn a flag on
/// once its endpoints exist.
class CourierFeatures {
  CourierFeatures._();

  // ── No backend route yet (hidden) ─────────────────────────────────────────
  /// GET /notifications, /notifications/unread-count, POST .../read
  static const bool notifications = false;

  /// GET /messages/conversations, /messages/{id}/messages, /messages/unread-count
  static const bool messages = false;

  /// GET/POST /trips/* (linehaul trips: accept, load, depart, arrive)
  static const bool trips = false;

  /// GET /timeline (Home activity feed)
  static const bool timeline = false;

  /// GET /history/summary, /history/payments, /history/trips
  static const bool history = false;

  /// GET /duty, POST /duty/on, /duty/off, /duty/checklist, /duty/location
  static const bool duty = false;

  /// POST /profile/documents
  static const bool documents = false;

  /// PUT /profile/vehicle
  static const bool vehicle = false;

  /// COD & Remittance screen (shown as "Coming soon", no backend call).
  static const bool codRemittance = false;

  // ── Backend route exists (shown) ──────────────────────────────────────────
  /// GET /profile, POST /profile/change-password
  static const bool profile = true;

  /// GET /delivery-orders, /delivery-riders, POST /delivery-jobs
  static const bool deliveryManagement = true;

  /// GET /riders (read-only; approve / reject stay on the web)
  static const bool riderManagement = true;
}
