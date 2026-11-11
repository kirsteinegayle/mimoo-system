/// Central feature flags for the buyer app.
///
/// Flip a flag here instead of deleting code. Keep every flag `const` so the
/// disabled branches are tree-shaken from release builds.
class Features {
  Features._();

  /// Legacy mock order pages from the pre-API prototype:
  /// TrackOrderPage, DriverChatPage, OrderChatPage, RateProductPage,
  /// MyReviewPage, RefundDetailsScreen, RequestReturnRefundPage (and their
  /// local-only helpers: WhatHappenedPage, CancellationDetailsPage, the
  /// mock OrderDetailPage inside orders_page.dart).
  ///
  /// The real flows live in ApiOrderDetailPage (tracking + rider chat),
  /// RealOrderActions, WriteReviewPage and return_request_pages.dart.
  /// Keep `false` so the app matches the web.
  static const bool legacyMockOrderPages = false;
}
