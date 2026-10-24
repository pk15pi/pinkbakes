# Pinkbakes QA – Bug Report (2026-10-24)

**Environment:** Chromium (Playwright) on the QA box, local Vite dev server and Vite production build, Django on SQLite. The live site was checked read-only.

**Status key:**
- **FIXED-LOCAL:** changed in the local working tree only. Not committed or deployed.
- **OWNER:** needs the owner's decision.
- **OPEN:** known and not fixed.
- **BLOCKED:** cannot be tested safely without staging.

**Backups:** originals of every changed file are in `E:\repos\_pinkbakes_backup_20261024\`.

**Browser-tester findings:** the eight live browser-QA findings (T1–T8) were all reproduced locally or traced in the code. Their verdicts are mapped below. The tester's screenshots were not available because the shared assets folder was empty.

## Summary
| ID | Pri | Title | Status |
|---|---|---|---|
| BUG-001 (T1) | P0 | Admin login blanks the whole app (`/admin`, and `/` while an admin token exists) | FIXED-LOCAL |
| BUG-002 | P1 | Hard-coded Django `SECRET_KEY` in settings.py (env lookup commented out) | OWNER |
| BUG-003 | P1 | Payment tests and the razorpay import fail on Python 3.12+ unless `setuptools<81` | OWNER |
| BUG-004 | P2 | Production build falls back to an invalid API base `localhost:8000` (no scheme) | FIXED-LOCAL |
| BUG-005 | P2 | Order-success screen shows an invented order number `PB-<timestamp>` | FIXED-LOCAL |
| BUG-006 | P2 | Notification endpoints called without a trailing slash, causing a 301 on every call | FIXED-LOCAL |
| BUG-007 | P2 | Delivery location update returns 500 for invalid coordinates | FIXED-LOCAL |
| BUG-008 (T3) | P2 | Header actions overlap or wrap the brand at ≤480px (~343px) | FIXED-LOCAL |
| BUG-009 (T3) | P2 | Floating Sign-in pill (`.auth-float`) covers the open mobile menu and the cart subtotal | FIXED-LOCAL |
| BUG-010 | P3 | Toast blocks taps on the Checkout / Place order button for 2.2s | FIXED-LOCAL |
| BUG-011 (T2) | P2 | Unknown routes render the home page (soft 404); no `/track`, `/cart` or `/checkout` routes | OWNER |
| BUG-012 (T1) | P3 | Admin panel opens on any route whenever an admin token is stored; an expired token fails silently | OWNER |
| BUG-013 | P2 | No React error boundary, so any render error gives a blank page | OWNER |
| BUG-014 (T4) | P3 | Product and category images don't match their names | OWNER (data) |
| BUG-015 (T5) | P3 | Discounted price has no strikethrough and runs into the old price | FIXED-LOCAL |
| BUG-016 (T5) | P3 | Currency shown both as "₹" and "Rs." | OWNER |
| BUG-017 (T6) | P2 | Product-modal options (size, eggless, message, delivery date) are never sent to the cart or order; Eggless offered on eggless cakes | OWNER |
| BUG-018 (T6) | P3 | "0.0" rating shown for products with no reviews | OWNER |
| BUG-019 (T7) | P3 | Checkout shows "Delivery -" before an address is entered | FIXED-LOCAL |
| BUG-020 (T8) | P3 | Add to Cart in the product modal closes the modal and returns to `/` | OWNER |
| BUG-021 | P3 | Gallery nav lands about 200px below the header at ≥1280px | OPEN |
| BUG-022 | P3 | `pinkbakes.com` and `www.pinkbakes.com` both serve 200 with no canonical redirect | OWNER |
| BUG-023 | P2 | Default anon API throttle of 240/hour per IP can 429 real shoppers | OWNER |
| BUG-024 | P3 | Hygiene: Razorpay test-key fallback, non-keyboard `.auth-float`, stale `.bak_coupon` files, hard-coded Mumbai map centre, 49 lint warnings | OWNER |

---

## Details

### BUG-001 · P0 · Admin login blanks the app on every route (tester T1)
- **Route/component:**
  - `/admin`, `/admin/orders` and `/` when `pinkbakes_admin_token` is set
  - `src/main.jsx`, admin refunds loader
- **Browser/viewport:** Chromium, all viewports, production build. Reproduced against the live bundle `index-BeXoDRug.js`.
- **Repro:**
  1. Log in as admin.
  2. The page goes white.
  3. Reload `/` and it stays white while the token exists.
- **Expected:** the admin dashboard renders.
- **Actual:** blank page, with the console error `ReferenceError: fetchAdminRefunds is not defined`.
- **Root cause:**
  - The module refactor left `fetchAdminRefunds` used in `main.jsx` but missing from the `services/authService.js` import list.
  - The admin panel opens automatically whenever a token exists (see BUG-012), and there is no error boundary (BUG-013). So the crash blanks every route.
  - Eslint flags this as its only error (`no-undef`).
- **Fix:** add `fetchAdminRefunds` to the import in `src/main.jsx`. One line.
- **Verification:**
  - Prod build repro: before, 5 of 5 admin states were blank (`live1orig_*.png`). After, the dashboard, orders and refunds render with a Logout tab (`live1fix_*.png`).
  - Lint now reports 0 errors.

### BUG-002 · P1 · Hard-coded SECRET_KEY in settings
- **File:** `pinkbakes_backend/pinkbakes_backend/settings.py` (around lines 69–72). The env lookup for `DJANGO_SECRET_KEY` is commented out and a literal key is assigned instead. The value is intentionally not reproduced here.
- **Impact:** if production runs this file, session and signing security depends on a key that sits in the repo.
- **Recommendation:**
  - Restore `SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]` with a hard failure when `DEBUG` is False.
  - Rotate the key on OCI.
- **Not applied:** this is a security and deploy-sensitive change.

### BUG-003 · P1 · razorpay requires `setuptools<81` on Python 3.12+
- **Repro:** a fresh venv, then `manage.py test` gives 11 payment test errors. The razorpay SDK imports `pkg_resources`.
- **Fix (owner):** pin `setuptools<81` in requirements.txt or upgrade the razorpay SDK, then verify on OCI's Python. Not applied, because it changes dependencies. The QA venv used `setuptools<81`.

### BUG-004 · P2 · Invalid API base in production builds
- **Component:** `src/config.js`.
- **Root cause:**
  - The fallback was `"localhost:8000"`, which has no scheme, so it is treated as a relative path.
  - Any build without `VITE_API_URL` calls `https://pinkbakes.com/localhost:8000/api/...`.
- **Fix:** use the dev server fallback `http://localhost:8000` and the production fallback `https://api.pinkbakes.com`, both via `import.meta.env.DEV`. An env var still overrides both.
- **Verification:** the no-env build bundle contains only `https://api.pinkbakes.com`, and the dev build reaches the local API.

### BUG-005 · P2 · Invented order number on the success screen
- **Component:** `src/hooks/useCheckoutFlow.js`.
- **Root cause:**
  - The success summary used `PB-${Date.now()}`.
  - The backend create and verify responses carry `order_id`, not `order_number`.
  - Customers were shown a reference that doesn't exist in admin or support. This came from the old pre-refactor code and is also in the live bundle.
- **Fix:**
  - Use the server's `order_number` if present, otherwise `#<order_id>`.
  - Never generate one client-side.
  - Also applied to the retry flow and the verify handler.
- **Verification:** local checkout shows `#<id>`, which matches the admin list.
- **Owner note:** returning `order_number` from the payment create and verify endpoints would let the UI show `PB-QA-000x`-style references. That is an API change, so it was not applied.

### BUG-006 · P2 · Notification endpoints 301 (no trailing slash)
- **Component:** `src/services/authService.js`, which called `/api/accounts/notifications?…` and `/api/admin/notification-logs?…`.
- **Actual:** 301 to the slash URL, both locally and on live. This adds an extra round trip per poll and risks breaking authenticated cross-origin redirects.
- **Fix:** add the trailing slashes.
- **Verification:** API check results are now 200.

### BUG-007 · P2 · Location update 500 on bad input
- **Component:** backend `catalog/views.py`, `DeliveryLocationUpdateView`.
- **Repro:** as a staff user, POST `/api/catalog/orders/<id>/location/` with `latitude="abc"` or `91`. The response is 500.
- **Root cause:** `float()` was called on the raw input with no validation and no range check.
- **Fix:**
  - Parse latitude, longitude and accuracy inside `try/except`.
  - Reject NaN and infinity.
  - Enforce lat -90..90 and lng -180..180.
  - Invalid input returns 400 with a clear message.
- **Scope:** validation only. No schema, permission or API-shape change.
- **Tests:** four new tests in `catalog/tests.py` (`DeliveryTrackingRegressionTests`):
  - owner-only tracking
  - a customer cannot post a location
  - invalid coordinates return 400 and save nothing
  - a valid post returns 201
- **Verification:** 159 of 159 tests pass.

### BUG-008 · P2 · Header crowding at ≤480px (tester T3)
- **Viewports:** 320–480px. The tester saw it at ~343px.
- **Repro:** open `/` at 320 or 343px.
- **Actual:**
  - The SIGN IN and CART pills overlap the brand; the brand box was only 12px wide at 320px.
  - The labels and Order Now wrap.
- **Root cause:** the brand had no flex-shrink or ellipsis, and the text labels on the header actions don't fit.
- **Fix:** scoped CSS appended to `styles.css`:
  - At ≤720px, the brand flexes and truncates with an ellipsis, and the actions don't shrink.
  - At ≤480px, the action text labels are visually hidden (screen-reader accessible). The buttons keep their `aria-label` and `title` and a 44px tap target.
- **Verification:**
  - `hdr_*.png` and `fix2_header_stack.png`.
  - r3 at 320, 343, 360 and 375 is clean.

### BUG-009 · P2 · Floating Sign-in pill over the menu and cart (tester T3)
- **Viewports:** ≤720px.
- **Repro:** at 320px, open the hamburger menu or the cart drawer.
- **Actual:** the bottom-left `.auth-float` (z-index 185) covers the menu's Contact item and the cart subtotal (`r0_320x568_guest_mobile_menu_open.png`, `r0_320x568_guest_cart_drawer.png`).
- **Fix:** z-index 45, below the header and mobile nav (50) and below drawers, modals and the admin panel. The pill is not hidden. It is hidden at 721–1023px, as designed before.
- **Verification:** in r2 and r3 the menu and cart items are reachable and uncovered.
- **Note:** the floating Help button (`.chatbot-launch`) sits bottom-right. It was not found covering content after the fix.

### BUG-010 · P3 · Toast intercepts taps on the checkout CTA
- **Fix:** `.toast{pointer-events:none}`. The toast still shows, but taps pass through to the button underneath.
- **Verification:** the r2 and r3 checkout CTA is reachable.

### BUG-011 · P2 · Soft 404 and missing routes (tester T2)
- **Repro:** `/nonexistent-xyz`, `/cart`, `/checkout` and `/track` all return 200 and render the home page. This happens both live and locally.
- **Root cause:**
  - Custom routing only knows products, policies, admin and reset-password.
  - Firebase rewrites every path to index.html.
  - Tracking lives inside the orders dialog.
  - Same behaviour before the refactor.
- **Recommendation:**
  - Add a NotFound view with `noindex`.
  - Optionally add a `/track/:orderId` entry that opens the orders dialog.
  - Optionally serve `404.html` for crawlers.
- **Not applied:** this is new routing behaviour.

### BUG-012 · P3 · Admin auto-opens on any route (tester T1, second half)
- **Detail:**
  - `main.jsx` opens the admin workspace whenever `pinkbakes_admin_token` exists, including on `/`. This is pre-existing design.
  - An expired token is dropped silently.
- **Recommendation:** auto-open only on `/admin*` and show a "session expired" toast.

### BUG-013 · P2 · No error boundary
- **Detail:** any runtime render error unmounts the whole app and leaves a white page. This is what made BUG-001 a full outage.
- **Recommendation:** add a small top-level ErrorBoundary with a reload button. Not applied because it is new UI.

### BUG-014 · P3 · Image and name mismatch (tester T4)
- **Root cause:** data, not code.
  - The live API `image` fields point at generic category files, e.g. Red Velvet uses `DesignerCakes_AlmondMarzipan.jpg`.
  - The frontend renders `product.image` as-is.
  - Also, `useAdminProducts.js:54` defaults a new product's image to `catalog[0]?.image`, which creates new mismatches.
- **Recommendation:**
  - Fix the images in the admin panel or with the `wire_*cake_images` scripts.
  - Default new products to no image or a placeholder.
- **Not applied:** the DB was not touched.

### BUG-015 · P3 · Discount price has no strikethrough (tester T5)
- **Root cause:** `ProductCatalog` and `ProductModal` render `<span class="strike">`, but no `.strike` or `.price-row` CSS ever existed, before or after the refactor.
- **Fix:** scoped `.price-row` and `.modal-price-row` flex layout with an 8px gap, and `.strike` with `line-through`.
- **Verification:** `strike_card_343.png` and `strike_card_1280.png`. The computed `text-decoration-line` is `line-through`.

### BUG-016 · P3 · ₹ vs "Rs." (tester T5)
- **Detail:**
  - `ProductModal`, `CartDrawer`, `CheckoutForm` and others hard-code "Rs.".
  - The catalog uses `formatCurrency` (₹).
- **Recommendation:** switch everything to `formatCurrency`. Several components are affected, so this was left for an owner-approved sweep.

### BUG-017 · P2 · Product options not carried to cart or order (tester T6)
- **Detail:**
  - `ProductModal` collects Size, Eggless, Message and Delivery date, but calls `onAdd(detail)` with the product only. The choices are lost. Same as before the refactor.
  - Eggless is offered even on products that are already eggless.
- **Recommendation:**
  - Define a cart-line options contract (frontend, plus backend order-item fields or notes).
  - Hide Eggless for eggless products.
- **Not applied:** it needs API and schema work.

### BUG-018 · P3 · "0.0" rating (tester T6)
- **Detail:** products with `review_count` 0 show "0.0".
- **Recommendation:** hide the rating, or show "New", when `review_count` is 0.
- **Status:** data plus a UX decision.

### BUG-019 · P3 · "Delivery -" in checkout (tester T7)
- **Fix:** `CheckoutForm.jsx` now shows "Enter address" before a quote exists and "Not available" when the quote has no fee.
- **Verification:** local checkout.

### BUG-020 · P3 · Add to Cart in the modal closes it and goes to `/` (tester T8)
- **Detail:** `onAdd` calls `addToCart` and then `closeProduct()`, which pops the `/products/:slug` URL. Identical to the pre-refactor code, so this is intended UX.
- **Recommendation:** keep the modal open with a "View cart" action. Product decision.

### BUG-021 · P3 · Gallery nav offset
- **Viewports:** Chromium 1280x800 and 1440x900.
- **Actual:** after clicking Gallery, the section top sits about 200px below the header.
- **Root cause:** lazy images above it change size during the smooth scroll.
- **Recommendation:** give the images `width`/`height` or `aspect-ratio`, or re-scroll after load.
- **Status:** OPEN.

### BUG-022 · P3 · No canonical host
- **Detail:** apex and `www` both return 200.
- **Recommendation:** redirect one to the other in Firebase and set the canonical link. Owner and hosting change.

### BUG-023 · P2 · Default anon throttle 240/hour
- **Detail:** `THROTTLE_ANON` defaults to 240/hour per IP. A local browsing sweep hit 429 on `/api/catalog/products/` within minutes. Shoppers behind a shared mobile-carrier IP could be throttled while browsing.
- **Recommendation:** check the prod env value. Consider a higher limit or a separate scope for read-only catalog endpoints. Needs staging and load data.

### BUG-024 · P3 · Hygiene
- **Issues:**
  - `razorpayKeyId` falls back to `rzp_test_default_key`; it should fail loudly instead.
  - `.auth-float` is a clickable `div`, not a `button`, so it can't be reached by keyboard.
  - Stale `*.bak_coupon` files and `_baseline_*` files sit in the repos.
  - Hard-coded Mumbai map centre in `config.js`.
  - 49 eslint warnings, mostly unused vars and hook dependencies.

## Blocked / needs staging
- Real Razorpay payment, refund and webhook.
- Live admin writes.
- Live sign-up, OTP and notifications.
- Live GPS tracking.
- HTTP→HTTPS redirect.
- Real iOS and Android devices.
