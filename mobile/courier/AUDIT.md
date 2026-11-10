# Courier Audit

## Changelog — 2026-11-10

- Login icons always visible and text aligned (single Row container, no prefix).
- All demo content removed; real Laravel API only, with error + Retry.
- API base URL set per environment (emulator, web/iOS, real phone).
- Real couriers are created via web Logistics courier management.
- Splash now matches the buyer app.

The case-by-case black-box review, status totals, evidence and remaining gaps
are maintained in
[`../../docs/COURIER_BLACKBOX_AUDIT.md`](../../docs/COURIER_BLACKBOX_AUDIT.md).

The implementation summary and continuation checklist are in
[`AUDIT_REPORT.md`](AUDIT_REPORT.md).

## Latest verified update

Logistics handover now persists seal mismatches and confirmed missing parcels,
updates received/missing order statuses, and notifies sellers. The missing
parcel migration is applied locally. Focused Courier tests pass (17 tests,
176 assertions); Flutter analyze and tests pass (7 tests). Remaining case gaps are listed
in the linked black-box audit and report.