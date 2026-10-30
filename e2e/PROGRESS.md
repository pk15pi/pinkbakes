# Phase 9 progress (local only — no commit/push/deploy by the agent)

## Done
- Backend fixes: admin email-login password check; signup/reset use validate_password; unverified-user signin message; tests added.
  - NOTE: these backend files were committed by the owner at 10:02 IST (commit 745243a "bugfixes", branch shows up to date with origin). The agent did not commit or push.
- Coupon reservation at payment-create: verified to be a false alarm (reserve_coupon_for_order is called inside the atomic block). The E2E checkout test asserts the server-side discount.
- Frontend fixes (uncommitted):
  - main.jsx (BUG-012);
  - appConstants.js (missing Anniversary fallback image);
  - HeroSection.jsx (fetchPriority → fetchpriority, React 18 warning);
  - AuthDialog.jsx (Escape closes the dialog).
- Backend: catalog/constants.py (same missing image).
- Backups: E:\repos\_pinkbakes_backup_20261024\phase9\
- The e2e suite is written (specs a–o plus responsive). The chromium functional run passed 56/56 after the fixes (the logout spec was fixed and re-run).
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