# Pinkbakes QA – Bug Report (2026-10-24)

**Environment:** Chromium (Playwright) on the QA box, local Vite dev server and Vite production build, Django on SQLite. The live site was checked read-only.

**Status key:**
- **FIXED-LOCAL:** changed in the local working tree only. Not committed or deployed.
- **OWNER:** needs the owner's decision.
- **OPEN:** known and not fixed.
- **BLOCKED:** cannot be tested safely without staging.
- **N/A:** not applicable. Real Razorpay payments are not implemented yet (owner, 24 Oct), so payment-gateway items are out of scope, not failures.

**Backups:** originals of every changed file are in `E:\repos\_pinkbakes_backup_20261024\`. Phase 2 (BUG-011/013/016/017/021/027) backups are in its `phase2\` subfolder.

**Applied to `E:\repos` (24 Oct, IST):**
- Phase 2 was applied before 11:08 AM IST: baseline check, backup, apply and SHA-256 check gave 0 mismatches.
- Phase 3 (BUG-023, BUG-025, BUG-026 test, BUG-028, the real 404 status and the desktop search offset) was applied at about 11:35 AM IST, also with 0 hash mismatches. Backups are in `phase3\`.
- The later `src/seo.js` lint fix and these reports were edited directly on the owner's PC. Their backups are in `phase3b\`.
- Phase 4 (BUG-026 per-size prices) was edited directly on the owner's PC at about 1:10–1:40 PM IST. Backups are in `phase4\`. It is uncommitted.
- The owner's commit `970f0ec` (11:38 AM IST) already contains the phase-3 frontend files. The phase-3 backend files, the `seo.js` lint fix and these reports are uncommitted. QA committed and pushed nothing.

**Browser-tester findings:** the eight live browser-QA findings (T1–T8) were all reproduced locally or traced in the code. Their verdicts are mapped below. The tester's screenshots were not available because the shared assets folder was empty.

## Summary
| ID | Pri | Title | Status |
|---|---|---|---|
| BUG-001 (T1) | P0 | Admin login blanks the whole app (`/admin`, and `/` while an admin token exists) | FIXED-LOCAL |
| BUG-002 | P1 | Hard-coded Django `SECRET_KEY` in settings.py (env lookup commented out) | OWNER |
| BUG-003 | P1 | Payment tests and the razorpay import fail on Python 3.12+ unless `setuptools<81` | OWNER (N/A until Razorpay is implemented) |
| BUG-004 | P2 | Production build falls back to an invalid API base `localhost:8000` (no scheme) | FIXED-LOCAL |
| BUG-005 | P2 | Order-success screen shows an invented order number `PB-<timestamp>` | FIXED-LOCAL |
| BUG-006 | P2 | Notification endpoints called without a trailing slash, causing a 301 on every call | FIXED-LOCAL |
| BUG-007 | P2 | Delivery location update returns 500 for invalid coordinates | FIXED-LOCAL |
| BUG-008 (T3) | P2 | Header actions overlap or wrap the brand at ≤480px (~343px) | FIXED-LOCAL |
| BUG-009 (T3) | P2 | Floating Sign-in pill (`.auth-float`) covers the open mobile menu and the cart subtotal | FIXED-LOCAL |
| BUG-010 | P3 | Toast blocks taps on the Checkout / Place order button for 2.2s | FIXED-LOCAL |
| BUG-011 (T2) | P2 | Unknown routes render the home page (soft 404); no `/track`, `/cart` or `/checkout` routes | FIXED-LOCAL (not-found page, plus a real HTTP 404 from hosting after the next deploy) |
| BUG-012 (T1) | P3 | Admin panel opens on any route whenever an admin token is stored; an expired token fails silently | OWNER |
| BUG-013 | P2 | No React error boundary, so any render error gives a blank page | FIXED-LOCAL |
| BUG-014 (T4) | P3 | Product and category images don't match their names | OWNER (data) |
| BUG-015 (T5) | P3 | Discounted price has no strikethrough and runs into the old price | FIXED-LOCAL |
| BUG-016 (T5) | P3 | Currency shown both as "₹" and "Rs." | FIXED-LOCAL |
| BUG-017 (T6) | P2 | Product-modal options (size, eggless, message, delivery date) are never sent to the cart or order; Eggless offered on eggless cakes | FIXED-LOCAL (needs migration 0016 on deploy) |
| BUG-018 (T6) | P3 | "0.0" rating shown for products with no reviews | OWNER |
| BUG-019 (T7) | P3 | Checkout shows "Delivery -" before an address is entered | FIXED-LOCAL |
| BUG-020 (T8) | P3 | Add to Cart in the product modal closes the modal and returns to `/` | OWNER |
| BUG-021 | P3 | Gallery nav lands about 200px below the header at ≥1280px (also About, Custom, and phones) | FIXED-LOCAL |
| BUG-022 | P3 | `pinkbakes.com` and `www.pinkbakes.com` both serve 200 with no canonical redirect | OWNER |
| BUG-023 | P2 | Default anon API throttle of 240/hour per IP can 429 real shoppers | FIXED-LOCAL (separate catalog-read rate, env `THROTTLE_CATALOG_READ`) |
| BUG-024 | P3 | Hygiene: Razorpay test-key fallback (N/A until Razorpay is implemented), non-keyboard `.auth-float`, stale `.bak_coupon` files, hard-coded Mumbai map centre, 49 lint warnings | OWNER |
| BUG-025 | P3 | Email links `/verify-email?token=` and `/orders/<id>/tracking` have no frontend route (open the home page) | FIXED-LOCAL |
| BUG-026 | P3 | Chosen cake size does not change the price (pre-existing; size is now recorded on the order) | FIXED-LOCAL (per-size prices set in admin; needs migration 0017 on deploy) |
| BUG-027 (owner, phone ~320px) | P2 | Phone header: SIGN IN / CART cover the logo, no search on mobile; floating Sign in and Help buttons misaligned and over the hero text | FIXED-LOCAL |
| BUG-028 | P3 | Header is not actually sticky: `.site{overflow:hidden}` makes it scroll away with the page | FIXED-LOCAL |

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
- **Status (24 Oct):** real Razorpay is not implemented yet, so payment-gateway testing is N/A. Keep this for when the gateway goes live.

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

### BUG-011 · P2 · Soft 404 and missing routes (tester T2) · FIXED-LOCAL
- **Repro (before):** `/nonexistent-xyz`, `/cakes`, `/products/a/b` and `/privacy/extra` all rendered the home page with `index,follow`.
- **Root cause:** custom routing only knows products, policies, admin and reset-password; everything else fell through to home. Firebase rewrites every path to index.html.
- **Fix:**
  - New `isKnownAppPath()` in `src/seo.js`. Known: `/`, `/index.html`, `/products/<slug>`, the four policy pages, and the app paths already treated as private (`/admin*`, `/reset-password*`, `/cart`, `/checkout`, `/account`, `/orders*`, `/login`, `/signup`), plus `/verify-email`. These keep today's behaviour, so emailed links never land on a 404.
  - New `src/components/NotFoundPage.jsx`: full-page view reusing the policy-page styles, with "Go to homepage" and "Browse cakes" buttons. Esc goes home; browser Back works (popstate).
  - `usePageMetadata` sets title "Page not found | pinkbakes" and `robots=noindex,follow`.
- **Verification (`fn2.mjs`, 16 route checks, all pass):** `/`, `/products/chocolate-truffle-cake`, `/privacy`, `/terms`, `/admin`, `/admin-login`, `/reset-password/abc123`, `/verify-email?token=x`, `/orders/1/tracking` and `/?token=abc` behave as before. `/this-page-does-not-exist`, `/products/a/b`, `/cakes` and `/privacy/extra` show the not-found page with noindex. "Browse cakes" lands on `/` with `#cakes` 80px from the top; Back re-shows the 404. Screenshots `404_desktop.png`, `404_mobile.png`.
- **Phase 3 (real 404 status):** `firebase.json` now rewrites only the known app routes, as 8 regexes, to `/index.html`. They are the same list as `KNOWN_APP_ROUTES` in `src/seo.js`, which `isKnownAppPath()` now uses. All other paths get Firebase's `404.html` with HTTP 404. `vite.config.js` has a small build-only plugin, `spaNotFoundPage`, that copies the built `index.html` to `dist/404.html`, so the 404 response still boots the app and shows the not-found view.
  - **Emulator check (`ev3/firebase_404_emulator.txt`):** every real route returns 200: `/`, `/index.html`, product slugs, policy pages, `/admin*`, `/admin-login`, `/reset-password/<t>`, `/verify-email`, `/orders`, `/orders/<id>`, `/orders/<id>/tracking`, `/cart`, `/checkout`, `/account`, `/login` and `/signup`. `/nope`, `/products`, `/products/a/b`, `/adminx`, `/orders/abc`, `/wp-login.php` and `/privacy/x` return 404. The app route list and the hosting list match exactly (`route_consistency_check.mjs`, 0 mismatches).
  - **Behaviour change:** `/adminx` and `/cart/x` used to render home; they now show the not-found view.
  - **Note:** if a new top-level route is added later, add it to both `KNOWN_APP_ROUTES` and `firebase.json`. A comment in both places says so.

### BUG-012 · P3 · Admin auto-opens on any route (tester T1, second half)
- **Detail:**
  - `main.jsx` opens the admin workspace whenever `pinkbakes_admin_token` exists, including on `/`. This is pre-existing design.
  - An expired token is dropped silently.
- **Recommendation:** auto-open only on `/admin*` and show a "session expired" toast.

### BUG-013 · P2 · No error boundary · FIXED-LOCAL
- **Detail (before):** any runtime render error unmounted the whole app and left a white page. This is what made BUG-001 a full outage.
- **Fix:** new `src/components/ErrorBoundary.jsx` (class component) wraps `<App />` in `main.jsx`. The fallback uses the policy-page styles: "Something went wrong", with "Reload page" and "Go to homepage" buttons. The error is logged to the console only; nothing is sent anywhere.
- **Verification:** a render crash was injected into `SiteHeader` through Playwright request interception (source untouched). The fallback rendered instead of a blank page (`error_boundary.png`).

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

### BUG-016 · P3 · ₹ vs "Rs." (tester T5) · FIXED-LOCAL
- **Fix:**
  - `formatCurrency(value, fractionDigits = 0)` in `appConstants.js` now takes an optional precision. Whole rupees show no decimals; paise show two (`₹1,299`, `₹1,299.50`). NaN-safe.
  - Every hard-coded "Rs." in the UI now uses it: `ProductModal`, `CartDrawer`, `CheckoutForm`, `OrderSuccessDialog`, `UserOrdersDialog`, `AdminDialogs`, `AdminDashboardPanel` (including the "Price (₹)" label), `AdminCustomerDrawer`, `adminRefundUtils`, `useAdminActionDialogs`, and the chatbot FAQ text.
  - Backend customer-facing text uses ₹ too: coupon messages (`catalog/coupons.py`), delivery-fee messages (`catalog/delivery.py`), emails (`accounts/email_service.py`) and notifications (`notifications/service.py`).
- **Verification:** `rg "Rs\."` finds nothing in `src`. The cart shows `₹1,299` and Subtotal `₹2,598`. Django tests pass (none asserted "Rs").

### BUG-017 · P2 · Product options not carried to cart or order (tester T6) · FIXED-LOCAL
- **Before:** `ProductModal` collected Size, Eggless, Message and Delivery date, but `onAdd(detail)` sent only the product. Eggless was offered on cakes that are already eggless.
- **Frontend:**
  - `ProductModal.jsx` passes `{size, eggless, message, delivery_date}` to `onAdd`. The message is limited to 60 characters; the date picker has `min=today` and a past date is rejected with an inline error.
  - Eggless products (category, name or badge contains "eggless") show a disabled "Eggless" chip and "This cake is already eggless." instead of a Regular/Eggless choice. Eggless is not sent for them.
  - `useCart.js`: each cart line is keyed by product and options, so the same cake with different options makes separate lines. The stock cap is checked across all lines of a product.
  - `CartDrawer` and `UserOrdersDialog` show the options under the item (for example, `1.5 kg | Eggless | Message: "Happy Birthday" | Delivery: 27 Oct 2026`). The admin order detail shows them as well.
  - `useCheckoutFlow.js` sends `items: [{id, quantity, options}]` (the `options` key only when something was chosen) to cart validate, delivery quote and checkout.
- **Backend (additive schema change):**
  - `catalog.OrderItem` gets `options = JSONField(null=True, blank=True)`. Migration `catalog/migrations/0016_orderitem_options.py` adds one nullable column (`ALTER TABLE catalog_orderitem ADD COLUMN options … NULL`). There is no data migration and no default backfill; existing rows stay NULL.
  - `PaymentService.clean_item_options()` validates the options server-side, inside the existing `ensure_valid_cart`:
    - size must be one of 0.5/1/1.5/2 kg;
    - eggless must be a boolean, and is dropped for already-eggless cakes;
    - message must be printable text, at most 60 characters;
    - delivery_date must be an ISO date, not before today (store time zone, default Asia/Kolkata) and at most 365 days ahead;
    - unknown keys are dropped.
    Bad options return 400 and create no order.
  - Both `OrderItem.objects.create` calls store the cleaned options. `OrderItemSerializer` returns `options` as a read-only field. That is the only response change (one extra key per item); existing fields are unchanged and old clients that send no options keep working.
- **Tests:** `OrderItemOptionsRegressionTests`, 6 new tests through `/api/orders/checkout/` (no payment gateway):
  1. options are saved and returned, including in order detail;
  2. different options make two lines;
  3. a legacy payload without options gives `options: null`;
  4. eggless is dropped for an eggless cake;
  5. invalid options return 400 and create no order;
  6. `/api/cart/validate/` accepts options.
- **Verification:** UI flow (`fn2.mjs`): options go into the cart; the same cake twice with different options gives 2 lines; a past date is rejected; an eggless cake shows the note (`modal_options.png`, `cart_options.png`, `modal_eggless_product.png`).
- **Deploy note:** run `python manage.py migrate` (migration 0016) before or with the new backend. Old frontend bundles keep working against the new backend.
- **Later:** size-based pricing was added in phase 4 (BUG-026). The Razorpay payment-create path shares the same validation code, but it was not exercised (payments N/A).

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

### BUG-021 · P3 · Gallery nav offset · FIXED-LOCAL
- **Repro (throttled network, fresh load, `navchk2.mjs`):** before the fix, 16 of 20 nav clicks landed 70–260px low. That covered Gallery, About and Custom Cakes at 1280/1366/1440/1920 and all sections at 390px. For example, at 1280 Gallery's top was at 155px, and at 1366 it was at 221px, instead of 80px.
- **Root cause:** `scrollTo()` computes the target once, then lazy images and the catalog above the section load during the smooth scroll and push the section down.
- **Fix (`src/main.jsx`, `scrollTo`):** a 100 ms watcher (max ~6 s) re-aims the scroll as soon as the section moves during the smooth scroll (up to 8 corrections), and once more after scrolling settles if the section is more than 4px off. Any wheel, touch or key input cancels the correction, so the page never fights the user. The Contact "scroll room" logic is unchanged.
- **Verification:**
  - `navchk2.mjs` (throttled network): 20 of 20 clicks land with the section exactly 80px from the top, at 1280, 1366, 1440, 1920 and 390 (rerun after the header work: 20/20).
  - Full viewport sweep `vp_after`: nav Cakes, Gallery, Contact land at 80px at 1024, 1279, 1280 and 1440.
  - Note: the r4 sweep showed three nav_Gallery flags (178/203/221px). Those were a test artifact: the sweep measured after a fixed 900 ms, but Chrome's smooth scroll over ~4000px takes ~1.1–1.2 s. Position sampling showed the section reaching 80px by ~1.2 s. The new sweep waits for scrolling to settle.

### BUG-027 · P2 · Phone header, search and floating buttons (owner screenshot, ~320px) · FIXED-LOCAL
- **Viewports:** ≤720px; worst at 320–413px. Still present on live today (live = phase 1).
- **Actual (live, read-only, `before_live_*` screenshots and `before_live_results.json`):**
  - 320px: the brand name is truncated to "pin…" and the action pills crowd the logo (the owner's screenshot, taken before the phase-1 deploy, shows them overlapping it).
  - The header search icon is hidden at every width ≤720px. This rule (`.search-toggle{display:none}` at ≤720) was already in the original pre-refactor CSS, so phones never had a header search; the only search was the catalog search box far down the page.
  - Floating Sign in (left, 48px tall, bottom 84px from the screen edge) and Help (right, 56px, bottom 12px) are on different baselines and sizes; at 320x568 the Sign in pill sits over the hero paragraph.
- **Fix:**
  - `src/styles.css` (new block at the end, ≤720px rules): the brand never shrinks or truncates; the actions give way. Icon buttons are 44px tap targets with 4px gaps. Header action labels are visually hidden at ≤600px (still read by screen readers). The tagline is hidden ≤480px. Order Now leaves the bar at ≤413px, where logo + menu + 3 icons + Order Now cannot fit, and appears as a full-width button at the bottom of the hamburger menu (the hero also has "Order Your Cake"). Search icon shown again on phones. The cart badge stays inside the bar.
  - Floats: both 16px from their edge and 16px (+ iOS safe area) from the bottom, both 48px tall on ≤720px, both 48px circles on ≤480px; 56px on desktop for both. The footer reserves 72px so they never cover the last footer line.
  - `src/main.jsx`: the floats fade out while the hero CTA buttons are in the bottom 88px of the screen (IntersectionObserver, `body.floats-yield`), so they never cover "Explore Cakes"/"Order Your Cake". On short phones (320x568) this means they appear once the user starts scrolling. The Sign in float is now a real `<button>` (keyboard and screen-reader accessible; closes the BUG-024 hygiene item).
  - `src/components/SiteHeader.jsx`: the search icon focuses the catalog search box inside the tap (so the phone keyboard opens) and scrolls the box itself just under the top of the screen; Order Now added to the mobile menu for ≤413px.
- **Verification:**
  - `hdrscan.mjs`: no overlap, no truncation, nothing outside the bar at every width from 320 to 1440.
  - `vpfull.mjs` (20 viewports × guest/customer/admin, 408 checks): 0 failures. Logo never overlapped, search/account/cart visible, floats on the same baseline and size with equal edge spacing, no hero CTA covered.
  - `searchchk.mjs` (9 main viewports, 9/9): the search box is focused, fully in view and not under a float.
  - Before/after screenshots: `qa_evidence/vpfull/before_live_<vp>_*.png` vs `vp_after_<vp>_*.png`.

### BUG-028 · P3 · Header is not sticky · FIXED-LOCAL
- **Repro (live, read-only, `ev3/sticky/before_live_*`):** scroll halfway down at any of 9 viewports from 320 to 1440 and the header has scrolled away (`stuck=false` at all 9).
- **Root cause:** `.header` is `position:sticky`, but its parent `.site` has `overflow:hidden`. That makes `.site` the sticky container, so the header scrolls away with the page.
- **Fix (`src/styles.css`, new block at the end):**
  - `.site{overflow:visible;overflow-x:clip}`. `clip` stops horizontal overflow without creating a scroll container, so `sticky` works again.
  - For old browsers without `overflow-x:clip`: `@supports not (overflow-x:clip){body{overflow-x:hidden}}`.
  - Phones (≤720px): the open hamburger menu is limited to the screen height under the 65px bar (`max-height:calc(100dvh - 65px)`, scrolls inside, `overscroll-behavior:contain`), so the menu's lower items stay reachable now that the bar does not scroll away.
- **Follow-up regression found and fixed:** with the header now sticky, the desktop header search scrolled the search pill to 71px, 3px under the 74px desktop bar (`searchchk` failed at 1024, 1280 and 1440). In `src/main.jsx`, `scrollTo()` now aims at the whole `.searchbox` pill instead of the inner input. `searchchk` is 9/9 again, with the pill at 80px everywhere.
- **Verification:**
  - `stickychk.mjs` (20 viewports, 320–1440): the header stays at the top mid-scroll, there is no horizontal overflow, the phone menu fits and scrolls, and anchors land below the bar. 20/20 pass (`ev3/sticky/after_local_*`).
  - Full sweep `vpfull.mjs`: 408/408. `navchk2` 20/20 (sections land at 80px under the 74px or 65px bar). `fn2` 22/22.

### BUG-025 · P3 · Emailed links without a frontend route · FIXED-LOCAL
- **Before:** the backend emailed `/verify-email?token=…` and `/orders/<id>/tracking`. Neither had a screen, so both opened the plain home page.
- **Backend:**
  - New `notifications.service.frontend_link(path)` builds every emailed link from `settings.FRONTEND_URL`, with no hard-coded host.
  - The verify-email, reset-password and tracking links use it. Tokens are URL-encoded.
  - Tests: 3 new `EmailLinkRouteTests` in `accounts/tests.py`. Each link uses `FRONTEND_URL` and a path the frontend routes.
- **Frontend:**
  - `src/seo.js` has `emailLinkFromPath()`.
  - `src/main.jsx`:
    - `/verify-email?token=` replaces the URL with `/`, opens the sign-in dialog and calls the existing verify API. It shows "Email verified…" or the API error. A missing token shows "This verification link is incomplete…".
    - `/orders/<id>/tracking` opens My Orders, then that order, and starts live tracking once the customer is signed in. A guest gets the sign-in dialog with "Please sign in to track your order."
  - The reset-password effect skips these paths.
  - `src/hooks/useCustomerAccount.js`: `handleOpenOrder` returns its promise so tracking starts after the order loads.
- **Verification (`emailchk.mjs`, local, 4/4):** bad token shows "Invalid or expired verification link." (`ev3/email_verify_badtoken.png`). The no-token message, the guest tracking prompt (`email_tracking_guest.png`) and the signed-in customer flow (order dialog plus 2 tracking API calls, `email_tracking_customer.png`) all pass. A real verification email was not sent (live notifications are blocked by the QA rules).
- **Deploy note:** `FRONTEND_URL` defaults to `https://www.pinkbakes.com` in settings. Set `FRONTEND_URL=https://pinkbakes.com` on OCI if the apex is the canonical host (see BUG-022).

### BUG-026 · P3 · Size does not change the price · FIXED-LOCAL (needs migration 0017 on deploy)
- **Detail:** every size (0.5–2 kg) was charged the product price. The chosen size was already stored on the order item (BUG-017).
- **Owner decision (24 Oct, 1:04 PM IST):** a separate price for each size, set in admin.
- **Fix (backend, `E:\repos\pinkbakes_backend`):**
  - `catalog/models.py`: new optional `Product.size_prices` JSON field, a size label → list price map such as `{"0.5 kg": "699.00", "1 kg": "1199.00"}`. The default is `{}`. Also `Product.SIZE_OPTIONS` (the 4 popup sizes) and two helpers:
    - `base_price_for_size(size)`;
    - `discounted_price_for_size(size)`, which uses the same discount formula as `discounted_price`.
  - `catalog/migrations/0017_product_size_prices.py`: `AddField`, depends on `0016_orderitem_options`. Additive only: existing products get `{}` and keep their current prices.
  - `catalog/views.py`: `PaymentService.ensure_valid_cart` prices each line as `discounted_price_for_size(options.size)`. This path is used by cart validation, checkout and payment-create. `CAKE_SIZE_OPTIONS` now comes from `Product.SIZE_OPTIONS`.
  - `catalog/coupons.py`: the coupon-preview path reads the line's size and uses the same size price, so the coupon preview matches checkout.
  - `catalog/serializers.py`: `size_prices` is exposed on the admin, public list and public detail serializers. It is also saved on admin create/update and validated:
    - keys must be one of the 4 popup sizes;
    - values must be positive numbers with at most 2 decimals and below 10^8 (no bools, NaN or text);
    - blank values are dropped;
    - stored as strings normalised to 2 decimals.
- **Pricing rule (server-side only; client prices are never read):**
  - **No size prices set:** every size is charged `price` less the discount, as before.
  - **Size prices set and the line has a size:** unit price = that size's price less the product discount. Coupons then apply to the line total exactly as they did on the base price.
  - **Size prices set and the line names a size without a price:** HTTP 400, `Size "1.5 kg" is not available for "<cake>". Please choose another size.` No order is created.
  - **Size prices set and the line has no size** (old clients and API calls): base `price` is charged.
- **Fix (frontend, `E:\repos\pinksBakes`):**
  - `src/appConstants.js`:
    - New helpers `sizeListPrice`, `pricedSizes`, `hasSizePrices`, `sizePriceFor` and `fromSizePrice`.
    - `cartUnitPrice` uses the line's size price first, so the cart drawer and checkout subtotal follow the size.
    - Display uses the existing `formatCurrency` ₹ helper.
  - `src/components/ProductModal.jsx`: when size prices exist, only the priced sizes are offered. The default is 1 kg if it is priced, otherwise the first priced size. The price shown is the selected size's discounted price, with that size's list price struck through when there is a discount.
  - `src/components/ProductCatalog.jsx`: cards show "from ₹X" (the lowest discounted size price). The card button becomes "Choose Size" and opens the product popup, so a size is always picked.
  - `src/hooks/useAdminProducts.js` and `src/components/AdminDashboardPanel.jsx`: the admin cake form has 4 optional price boxes (0.5 kg, 1 kg, 1.5 kg, 2 kg) under Discount. Blank boxes are left out, clearing all of them sends `{}`, and invalid values are blocked with a message. The form saves through the existing admin product API (`POST`/`PUT /api/catalog/admin/products/`).
- **How the admin sets size prices:** Admin → Cakes → Edit (or Add New Cake), then fill "Price per size". Leave every box blank to keep one price for all sizes. The main Price is still required; it is the fallback for orders without a size.
- **Tests:** `catalog/test_size_pricing.py`, 17 new tests, all pass. They cover:
  - model helpers;
  - size price used;
  - product discount applied (1500 at 10% → 1350.00);
  - fallback to the base price with no size prices and with no size chosen;
  - unpriced size → 400 with no order;
  - unknown size → 400;
  - client-sent `price`, `unit_price`, `discounted_price` and `size_prices` ignored;
  - coupon on a size price (preview and checkout, 10% of 1500 = 150);
  - coupon preview rejects an unpriced size;
  - public list and detail expose `size_prices`;
  - admin set, normalise, clear and keep-on-omit, plus create;
  - 8 invalid admin payloads → 400;
  - a customer cannot set size prices.
  - The phase-3 test `test_price_is_computed_server_side_and_size_does_not_change_it` still passes; it covers products without size prices.
  - A Node check of the frontend helpers gave the expected values (size price, discount, fallback, "from").
- **Not changed:**
  - The SEO structured-data price (`src/seo.js`) still uses the base discounted price.
  - Order history and admin order views show the stored `unit_price`, which is already the size price.
  - The Razorpay payment-create path uses the same `ensure_valid_cart`, but it was not exercised (payments N/A).

### BUG-022 · P3 · No canonical host
- **Detail:** apex and `www` both return 200.
- **Recommendation:** redirect one to the other in Firebase and set the canonical link. Owner and hosting change. Also align `FRONTEND_URL` (BUG-025).

### BUG-023 · P2 · Default anon throttle 240/hour · FIXED-LOCAL
- **Detail:** `THROTTLE_ANON` defaults to 240/hour per IP. A local browsing sweep hit 429 on `/api/catalog/products/` within minutes. Shoppers behind a shared mobile-carrier IP could be throttled while browsing.
- **Fix:**
  - New `catalog/throttles.py`:
    - `CatalogReadAnonThrottle` (scope `catalog_read`) applies to GET/HEAD/OPTIONS only.
    - `CatalogWriteAnonThrottle` keeps the normal `anon` rate for writes, such as anonymous review POSTs.
  - `catalog/views.py`: categories, product list, product by slug or id, and product reviews use `CATALOG_READ_THROTTLES`. Nothing else changed.
  - `settings.py`: new rate `'catalog_read': os.environ.get('THROTTLE_CATALOG_READ', '3000/hour')`. The test-mode override was raised as well.
  - Auth, OTP, login, admin login, payment and `anon` rates are unchanged and still strict.
- **Tests (`catalog/test_throttles.py`, 5):**
  - Catalog reads go past the anon limit.
  - Catalog reads do not use up the anon budget, and review POSTs are still limited at the anon rate.
  - Signin still returns 429 at its limit, and so does admin login.
  - The default is `3000/hour`, and the env variable overrides it.
- **Deploy notes:**
  - Optional env `THROTTLE_CATALOG_READ`; the default is 3000/hour per IP.
  - `NUM_PROXIES` is not set, so DRF identifies clients by the `X-Forwarded-For` header. Behind the OCI proxy or load balancer, set `REST_FRAMEWORK['NUM_PROXIES']` to match, or one shared proxy IP or a spoofed header decides the limit. This applies to every throttle, not just this one. Owner decision.

### BUG-024 · P3 · Hygiene
- **Issues:**
  - `razorpayKeyId` falls back to `rzp_test_default_key`; it should fail loudly instead.
  - ~~`.auth-float` is a clickable `div`, not a `button`~~: fixed with BUG-027.
  - Stale `*.bak_coupon` files and `_baseline_*` files sit in the repos.
  - Hard-coded Mumbai map centre in `config.js`.
  - 49 eslint warnings, mostly unused vars and hook dependencies (unchanged by QA; phase 3 adds none).

## Not applicable
- Real Razorpay payment, refund and webhook: not implemented yet, so out of scope (owner, 24 Oct). Not counted as failures.

## Blocked / needs staging
- Live admin writes.
- Live sign-up, OTP and notifications.
- Live GPS tracking.
- HTTP→HTTPS redirect.
- Real iOS and Android devices.
