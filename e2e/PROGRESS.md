# Phase 9 progress (local only â€” no commit/push/deploy by the agent)

## Done
- Backend fixes: admin email-login password check; signup/reset use validate_password; unverified-user signin message; tests added.
  - NOTE: these backend files were committed by the owner at 10:02 IST (commit 745243a "bugfixes", branch shows up to date with origin). The agent did not commit or push.
- Coupon reservation at payment-create: verified to be a false alarm (reserve_coupon_for_order is called inside the atomic block). The E2E checkout test asserts the server-side discount.
- Frontend fixes (uncommitted):
  - main.jsx (BUG-012);
  - appConstants.js (missing Anniversary fallback image);
  - HeroSection.jsx (fetchPriority â†’ fetchpriority, React 18 warning);
  - AuthDialog.jsx (Escape closes the dialog).
- Backend: catalog/constants.py (same missing image).
- Backups: E:\repos\_pinkbakes_backup_20261024\phase9\
- The e2e suite is written (specs aâ€“o plus responsive). The chromium functional run passed 56/56 after the fixes (the logout spec was fixed and re-run).
- INVENTORY.md and TEST_PLAN_E2E.md are drafted.

## Next
1. Run the projects one at a time: chromium, firefox, webkit, then responsive. Use timeouts.
2. Run the Django suite, then the build.
3. Write E2E_TEST_REPORT.md, then clean up.

- 10:40 IST: chromium 55/56. The orders spec had a session-restore race; fixed in the test and passed 12/12 on repeat. Next: firefox.
- firefox: 56/56 passed. Next: webkit.
- webkit: 55/56 -> fixed harness (example.test seed images routed to 1x1 PNG; WebKit logged DNS errors). a-home 12/12 chromium+webkit. Next: responsive.
- responsive vp-* (17 viewports x 4 pages): 68/68 passed. Next: Django suite + build.
- Django 227 OK; build OK; E2E_TEST_REPORT.md written. Cleanup done.

## Phase 10 (11:21 IST)
- Fixes applied: useCart.js (localStorage cart v1, re-price), SiteHeader.jsx + main.jsx (sessionRestoring). Backups in phase10. Build OK. Added specs/p-persistence.spec.js. Next: run.
- 11:26 steer: server-side cart (Cart/CartItem). Backups of models/views/urls/admin/authService in phase10. Affected-spec 3-browser run was interrupted; rerun later.

## Phase 10 (2026-10-30) - sign-in flash + server-side cart (owner approved)
- Account button disabled (aria-busy) while the saved session restores; no sign-in dialog flash.
- Guest cart in localStorage `pinkbakes_cart_v1` (id/options/qty only, re-priced from catalog).
- Signed-in cart stored in backend (catalog.Cart/CartItem, migration 0019_cart): GET/PUT/DELETE /api/cart/, POST /api/cart/merge/. Server re-prices on every read, drops unavailable lines/sizes and reports `removed`, clamps to stock (`adjusted`), qty 1..40, max 50 lines.
- Login merges guest cart (sum, cap 40) then removes local copy; logout clears view; cart cleared server-side when payment is marked paid (verify + webhook), so failed payments keep the cart.
- Results: Django 238 OK; chromium full 61/61; firefox+webkit on a,c,d,g,h,i,p 59/60 + 1 startup connection-refused rerun green (6/6); p spec x3 15/15; build OK.
- Deploy: backend pull, `python manage.py migrate` (0019_cart), restart API; then frontend build/deploy. Nothing committed/pushed.
## Phase 11 (2026-10-30) - full re-audit after phase-10 deploy
- Totals: Playwright 260/260 passed, 0 failed, 0 skipped (chromium/firefox/webkit 64 each + 17 viewports x 4 = 68); Django 238 OK; makemigrations --check clean; build OK.
- New security tests (N2): cart endpoints 401 unauthenticated; cross-user cart isolation; SQLi-ish/oversized cart input -> 4xx, no traceback; cart option text with HTML rendered as text (no script execution).
- Bugs: critical 0, high 0, medium 0 in app code. Test-harness fix: server carts are per user and specs run in parallel, which made a cart test fail intermittently; added dedicated seed customers c/d (e2e/backend/seed_e2e.py) for server-cart specs.
- Live read-only: home 200 (~1.2s from test host), JS 57KB/40KB vendor/CSS 12KB compressed; CSP, HSTS, nosniff, X-Frame-Options DENY present; /api/cart, /api/orders, /api/admin/dashboard 401 unauthenticated; catalog API ~1.5s from test host (network latency, not reproducible locally). 12 product images total 2.4MB, 2 over 300KB (low: recompress in admin uploads, content-only).
- Remaining/unverified: payment gateway, SMS/WhatsApp/email delivery, SECRET_KEY/DEBUG item (skipped by owner); live performance measured from a single remote host only.
- Files modified: e2e/specs/n-security.spec.js, e2e/specs/p-persistence.spec.js, e2e/backend/seed_e2e.py (tests only). No app code, no migration. Nothing committed.
## Phase 12 – UI/UX audit (30 Oct 2026, IST) – DONE
- Harness: `playwright.uiux.config.js` + `uiux/uiux-audit.spec.js`. Run it with `UIUX_PHASE=before|after` to write screenshots and audit.jsonl under `reports/uiux/<phase>/`.
- Backup: `E:\repos\_pinkbakes_backup_20261024\phase12\src\...`.
- Fixes:
  - the appended Phase 12 block in `src/styles.css` (focus-visible, AA colour shades, type floor, 24 px targets, reduced motion);
  - aria-labels in 5 components.
- Results:
  - uiux audit 68/68 at 17 viewports;
  - full suite 191 functional + 68 viewport passed (one Chromium 404 test timed out under load, then passed 3/3 on rerun);
  - build OK.
- Report: `UIUX_AUDIT_REPORT.md`. Nothing has been committed or deployed.

## Phase 16 - COMPLETE (2026-10-30 18:55 IST)
- Items 1-15 done. Django 262 OK. Chromium e2e 71/71. Firefox/WebKit affected specs (c,d,h,i,p,q) pass; first runs had load-related page.goto/goBack timeouts that passed on serial rerun.
- Migration catalog/0020_phase16_wishlist. Nothing committed, pushed or deployed.
