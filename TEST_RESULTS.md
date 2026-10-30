# Pinkbakes QA – Test Results (2026-10-24)

All runs were local unless marked live. Phase 3 was run both on the QA box copy and on the owner's PC (`E:\repos`, where noted):
- Database: SQLite, using dev/test env values (`DJANGO_DEBUG=true`, `SECURE_SSL_REDIRECT=false`). For the browser sweeps, the local anon throttle was raised (`THROTTLE_ANON=100000/hour`) so they would not hit 429.
- No production secrets were used or recorded.

## Build / lint / tests: before vs after
| Check | Before (owner's code as-is) | After (with fixes) |
|---|---|---|
| `vite build` | passes (chunk-size warning only) | passes after phase 3 and again after phase 4 (BUG-026) **on the owner's PC**. Output went to a temp folder, so `dist\` is untouched. Emits `404.html`, identical to `index.html`. Also passes without `VITE_API_URL`; that bundle points only at `https://api.pinkbakes.com` |
| eslint (box-side config; eslint is not installed in the repo) | **1 error** (`fetchAdminRefunds` is not defined, `main.jsx`), 49 warnings | **0 errors**, 49 warnings. Phase 3 introduced 1 new warning (unused import in `seo.js`); it was fixed, so the list is the same as before phase 3. Phase 4 was linted on the owner's PC with the same config (temporary eslint install outside the repo): 0 errors, 49 warnings, none new |
| Django tests | 155 run. With a plain env: 11 payment-test failures (razorpay import needs `setuptools<81` on Python 3.12+). With `DJANGO_DEBUG=true` and `setuptools<81` in the QA venv: 155 OK | **191 run, all OK on the owner's PC** (Python 3.10, Django 5.2.16, SQLite: `.env` loading disabled, `DATABASE_URL` unset, `DB_ENGINE=sqlite3`). New tests: +4 `DeliveryTrackingRegressionTests`, +6 `OrderItemOptionsRegressionTests` (phase 2); in phase 3 +3 `EmailLinkRouteTests`, +1 BUG-026 server-price test, +5 throttle tests; in phase 4 +17 BUG-026 size-pricing tests (`catalog/test_size_pricing.py`). `makemigrations --check`: no changes |

## Test counts
| Type | Executed | Passed | Failed | Blocked | Notes |
|---|---|---|---|---|---|
| Automated responsive/E2E: baseline sweep (r0, 320px, original code) | 29 | 25 | 4 | 0 | header overlap, auth-float over menu/cart, product-modal timeout |
| Automated responsive: pre-fix sweep (r1, 320–600px) | 203 | 187 | 16 | 0 | header brand overlap, `.auth-float` covering menu and cart subtotal, toast covering the CTA |
| Automated responsive: post-fix full sweep (r2, 15 viewports × guest/customer/admin) | 441 | 439 | 2 | 0 | Triage below. The 2 real failures are a P3 Gallery scroll offset (BUG-021). |
| Automated responsive: post-fix phone rerun (r3: 320, 343, 360, 375) | 116 | 116 | 0 | 0 | clean, no console errors |
| Automated prod-build repro of the live admin blank screen | 10 | 10 after the fix (5 failed before) | 0 | 0 | `live1orig_*` vs `live1fix_*` |
| Automated price strikethrough check (343, 1280) | 2 | 2 | 0 | 0 | discount injected only in the intercepted test response; DB unchanged |
| Automated API permission/isolation (local) | 27 | 27 | 0 | 0 | The 2 no-slash notification paths return 301. The frontend now uses the slash form, so both are counted as fixed. Bad-latitude location update: 500 before, 400 now. |
| Automated Django unit tests | 191 | 191 | 0 | 0 | owner's PC, SQLite. Includes the 6 BUG-017, 3 BUG-025, 18 BUG-026 (1 phase 3 + 17 phase 4) and 5 BUG-023 tests |
| Phase 4: frontend size-price helpers (Node check of `appConstants.js`) | 8 | 8 | 0 | 0 | size price 2 kg at 10% → 1350; unpriced size → base; no size → 720; plain product → 800; "from" → ₹450; no size prices → null |
| Phase 3: sticky header (`stickychk.mjs`, 20 viewports 320–1440) | 20 | 20 | 0 | 0 | live before: header not stuck at 9/9 |
| Phase 3: Firebase Hosting emulator, status codes | 30 | 30 | 0 | 0 | 23 real routes → 200; 7 unknown → 404; app vs hosting route lists: 28 checked, 0 mismatches |
| Phase 3: email links (`emailchk.mjs`) | 4 | 4 | 0 | 0 | verify (bad token, no token), tracking (guest, signed-in customer) |
| Phase 2 functional (`fn2.mjs`: routes/404, error boundary, options→cart, ₹, eggless) | 22 | 22 | 0 | 0 | rerun after phase 3: 22/22 |
| Phase 2 nav landing, throttled network (`navchk2.mjs`) | 20 | 20 | 0 | 0 | before the BUG-021 fix: 4/20; rerun after phase 3 (sticky header): 20/20 |
| **Full viewport sweep after BUG-027 (`vpfull.mjs`, 20 viewports × guest/customer/admin)** | 408 | 408 | 0 | 0 | per-viewport table below |
| Header search lands in view, not under a float (`searchchk.mjs`) | 9 | 9 | 0 | 0 | the 9 main viewports. After the sticky header it first failed at 1024/1280/1440 (pill 3px under the bar); fixed, then 9/9 |
| Manual/live read-only GET checks | 16 | 11 | 5 | 1 | failures = soft-404 (×3 routes), no canonical host redirect, no-slash 301. Blocked: HTTP→HTTPS (port 80 is blocked from the QA box) |
| Static review (lint, build, code diff vs pre-refactor) | 3 | 2 | 1 | 0 | lint error before the fix; 0 after |
| Not safely testable | – | – | – | 5 | see Blocked (payment gateway is N/A, not blocked) |

## Phone header / floats (BUG-027): before (live) vs after (local)
Before = live site, read-only page load (`before_live_results.json`). Floats: edge distance / bottom y / height, in px.

| Viewport | Before: brand truncated | Before: header search | Before: Sign in float | Before: Help float | After |
|---|---|---|---|---|---|
| 320x568 | **yes** ("pin…") | **hidden** | 12 / 484 / 48 | 12 / 556 / 56 | logo whole, search shown, floats 16 / 552 / 48 both; hidden while the hero CTA is at the screen bottom |
| 360x800 | no | **hidden** | 12 / 716 / 48 | 12 / 788 / 56 | search shown, floats 16 / 784 / 48 both |
| 375x812 | no | **hidden** | 12 / 728 / 48 | 12 / 800 / 56 | search shown, floats 16 / 796 / 48 both |
| 390x844 | no | **hidden** | 12 / 760 / 48 | 12 / 832 / 56 | search shown, floats 16 / 828 / 48 both |
| 414x896 | no | **hidden** | 12 / 812 / 48 | 12 / 884 / 56 | search shown, floats 16 / 880 / 48 both, Order Now in bar |
| 768x1024 | no | shown | hidden (by design) | 22 / 1002 / 56 | unchanged (Sign in in header) |
| 1024x768 | no | shown | 22 / 746 / **48** | 22 / 746 / **56** | both 22 / 746 / 56 |
| 1280x800 | no | shown | 22 / 778 / **48** | 22 / 778 / **56** | both 22 / 778 / 56 |
| 1440x900 | no | shown | 22 / 878 / **48** | 22 / 878 / **56** | both 22 / 878 / 56 |

### Full viewport sweep after the fixes (`vp_after`, 408 checks, 0 failures)
Per viewport: header (logo visible and on top, no overlap, nothing outside the bar, name not truncated, search/account/cart), floats at top and scrolled, search focus, hamburger menu (+ Order Now at ≤413px), section nav (≥1024px), product listing, product popup, cart drawer, auth dialog, chatbot, 404 page, policy page, customer checkout (layout only, nothing submitted), customer orders, admin, console errors; horizontal overflow and occlusion on each screen.

| Viewport | Checks | Pass | Notes |
|---|---|---|---|
| 320x568 | 20 | 20 | Order Now in menu; floats appear once the user scrolls past the hero CTA |
| 360x800 | 20 | 20 |  |
| 375x812 | 20 | 20 |  |
| 390x844 | 20 | 20 |  |
| 413x880 | 20 | 20 | Order Now in menu (edge) |
| 414x896 | 20 | 20 | Order Now back in bar |
| 480x854 | 20 | 20 | floats are 48px circles |
| 481x854 | 20 | 20 | labels hidden, floats 48px pills |
| 600x960 | 20 | 20 |  |
| 601x960 | 20 | 20 |  |
| 720x1000 | 20 | 20 | last phone layout |
| 721x1000 | 20 | 20 | tablet layout; Sign in float hidden by design, header Sign in visible |
| 768x1024 | 20 | 20 |  |
| 1000x800 | 20 | 20 |  |
| 1001x800 | 20 | 20 |  |
| 1023x800 | 20 | 20 | Sign in float hidden by design |
| 1024x768 | 22 | 22 | desktop; nav Cakes/Gallery/Contact land at 80px |
| 1279x800 | 22 | 22 |  |
| 1280x800 | 22 | 22 |  |
| 1440x900 | 22 | 22 |  |

### r2 flag triage (16 flagged → 2 real)
- **320/360 product modal, checkout and auth (10):** caused by the local API throttle (HTTP 429) during the sweep. The r3 rerun with the throttle relaxed: all pass.
- **`.auth-float` "covered by header" at 768–1001px (4):** false positive. The pill is `display:none` from 721–1023px by design (rect 0×0) and the header Sign-in is visible (`r2_768x1024_guest_home.png`).
- **nav_Contact at 1024/1280/1440 (3 of the 5 nav flags):** expected. Contact is at the page end, and the page is scrolled to its maximum.
- **nav_Gallery at 1280/1440 (2 of the 5 nav flags):** real P3, BUG-021, now FIXED-LOCAL (navchk2 20/20; vp_after all at 80px). Later r4 nav_Gallery flags were a 900 ms fixed-wait artifact; see BUG-021.

## Key results
- **Customer flow (local):** browse, quick view, `/products/:slug` deep link with refresh and back, add to cart, cart drawer, checkout form, order list and tracking all PASS.
- **Payment:** N/A. Real Razorpay is not implemented yet (owner, 24 Oct), so gateway testing was skipped and is not counted as a failure. Order checkout without the gateway passes in the Django tests, and the success screen no longer invents a `PB-<timestamp>` order number.
- **Admin (local):** login, dashboard, orders, refunds and notification logs. Crashed before the fix (P0); PASS after.
- **Tracking API:** owner only. Another customer gets 403, anonymous gets 401, and a customer posting a location gets 403. Invalid coordinates now return 400 instead of 500.
- **Responsive:** no horizontal overflow at any width. After the fixes the logo is never overlapped from 320px up, search is in the phone header, the floats share one baseline and size, the floating pill no longer covers the menu, cart or hero CTA, and the toast no longer blocks the CTA.
- **Sticky header (BUG-028):** fixed locally. The header stays on top at every width with no horizontal overflow. The phone menu fits under the bar and scrolls, and section and search targets land below the bar.
- **404 status:** after the next hosting deploy, unknown paths return a real HTTP 404 (verified in the Firebase emulator, not live).
- **Catalog throttle (BUG-023):** anonymous catalog reads have their own rate (default 3000/hour/IP). Auth, OTP and login limits are unchanged.

## Live read-only results (https://pinkbakes.com, https://api.pinkbakes.com)
| Check | Result |
|---|---|
| `/`, `www.` | 200 / 200. No canonical redirect between the two hosts (P3 SEO) |
| `/privacy`, `/terms`, `/products/1` | 200 |
| `/admin`, `/nonexistent-xyz`, `/cart` | 200 serving index.html (soft 404; the home page renders). Fixed locally in phase 3; live will change only after a hosting deploy |
| `GET api/catalog/products/` | 200 |
| `GET api/admin/dashboard/` unauthenticated | 401 (good) |
| `GET api/accounts/notifications` (no slash) | 301 → slash. The live bundle calls the no-slash path. |
| CORS preflight from pinkbakes.com | 200 |
| HSTS | present |
| Live bundle `index-BeXoDRug.js` | contains the `fetchAdminRefunds` crash path, `PB-${Date.now()}` and the no-slash paths, which confirms the live findings |
| HTTP→HTTPS redirect | BLOCKED (the QA box cannot reach outbound port 80) |

## Not applicable
- Razorpay payment success/failure/refund and webhooks: not implemented yet (owner, 24 Oct).

## Blocked / needs staging
1. Live admin actions (status changes, refunds, product edits). Not done, because they write records.
2. Live customer sign-up, OTP, email and SMS notifications.
3. Live delivery-partner location posting and the live map with real GPS.
4. HTTP→HTTPS redirect check (box network).
5. Real-device Safari/iOS and Android rendering (only Chromium emulation was run).

## Evidence
Phase 3 evidence is in `qa_evidence/phase3/` next to this report: `sticky/before_live_*` and `after_local_*` (with `*_results.json`), `firebase_404_emulator.txt`, `route_consistency_check.mjs`, `emailchk.txt` and the `email_*.png` screenshots. The phase-2 evidence zip (`vpfull/`, `shots3/`, patches) is unpacked into `qa_evidence/`.

On the QA box, `/workspace/pinkbakes/evidence/`. Copies of the key files are in `qa_evidence/` next to this report:
- `live1orig_admin_loggedin.png` / `live1fix_admin_orders_loggedin.png`: blank admin screen before and after the fix
- `r0_320x568_guest_mobile_menu_open.png`, `r0_320x568_guest_cart_drawer.png`: floating pill overlap before the fix
- `fix2_header_stack.png`, `hdr_320x568.png`: header after the fix
- `strike_card_343.png`, `strike_card_1280.png`: strikethrough price
- `frontend_changes.patch`, `backend_changes.patch`: exact phase-1 diffs; `phase2_frontend.patch`, `phase2_backend.patch`: phase 2 + BUG-027 diffs
- `vpfull/before_live_<vp>_home_{top,scrolled}.png`: live site before BUG-027 (9 viewports)
- `vpfull/vp_after_<vp>_{home_top,home_scrolled,search,menu,listing,product_modal,cart_drawer,checkout,404,admin}.png`: after, 9 main viewports
- `shots3/`: owner-report header comparison at 320/414/600 (`live_before_320`, `local_phase1_320`, `local_after_*`)
- `vp_after_results.json`, `before_live_results.json`: raw sweep results

The browser tester's screenshots were not available: the assets folder given to QA was empty, so none could be attached.

## Phase 4: BUG-026 per-size prices (owner's PC, 24 Oct, about 1:40 PM IST)
- **Status:** FIXED-LOCAL. The owner chose a separate price per size, set in admin.
- **Django:** full suite 191/191 OK on SQLite. The 17 new tests in `catalog/test_size_pricing.py` cover:
  - size price used;
  - discount applied;
  - base-price fallback (no size prices, or no size chosen);
  - unpriced or unknown size → 400 with no order;
  - client price ignored;
  - coupon preview and checkout on the size price;
  - public API exposes `size_prices`;
  - admin validation, normalise, clear, create;
  - a non-admin cannot write.
- **Migration:** `catalog/migrations/0017_product_size_prices.py`. `makemigrations --check` reports no changes.
- **Build:** `npx vite build --outDir C:\Users\prasenjit\pb_build_check` (the same Vite build as `npm run build`, kept out of `dist\`) passes, with the chunk-size warning only.
- **Lint:** 0 errors, 49 warnings (the same as the baseline).
- **Not run:** a browser pass of the new admin fields, modal and "from" price against a local server (the rules for this phase kept the repos off the QA box). Payments are N/A.

