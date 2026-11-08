# Mimoo Rider audit

The current implementation audit and verification notes are maintained in
[AUDIT_REPORT.md](./AUDIT_REPORT.md).

This workspace is a local/mock-only Flutter app backed by SQLite. The November
8, 2026 update covers Job Offers and capacity, History and delivery filters,
read-only job cards and guarded detail routes, camera-only proof of delivery,
alert consistency, navigation, responsive login fields, and persisted dark
mode. Login and Splash remain light regardless of the saved rider theme.

## Changelog — November 7, 2026

Login field alignment and font were corrected. Job Offers expire 30 minutes
from each `offeredAt` (database v7); seller contact is a phone icon only.
Button/profile-header arrows were removed, alerts were unified, and parcel
capacity now displays `n/5` with acceptance blocked at five.

History search was added and Custom removed. For Delivery has one each of All,
Ready for pickup, Picked up, At Hub, Out for Delivery, Delivered, Overdue,
Return to Sender, and Returned. Delivered, Return to Sender, and Returned are
read-only. Delivery OTP, custody timeline, and payment reconciliation were
removed. POD is live-camera-only, supports retake, has no "Use this photo"
button, and records the full COD automatically.

Home shows Active Dispatch time and no Recent Activity. Back to Jobs opens
`/jobs`; text overflow was fixed; the scanner accepts barcode and QR formats.
See [AUDIT_REPORT.md](./AUDIT_REPORT.md) for verification and known limitations.

## Changelog — November 8, 2026

Login fields now have one visible outer box and vertically centered text; the
password visibility icon aligns with the field content and has an accessible
label. The scan-waybill flow no longer shows Pickup Pay or COD beneath Continue.
Pickup detail's call button is phone-icon-only, with "Call seller" available to
assistive technology.

Ready for pickup, Return to Sender, and Returned job cards are read-only like
Delivered; detail routes use the shared status guard. Settings Appearance now
applies and persists dark mode, while login remains light on logout and saved
appearance returns after sign-in.
