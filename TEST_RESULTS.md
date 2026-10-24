# Pinkbakes QA – Test Results (2026-10-24)

All runs were local on the QA box copy unless marked live:
- Database: SQLite, using dev/test env values (`DJANGO_DEBUG=true`, `SECURE_SSL_REDIRECT=false`). For the browser sweeps, the local anon throttle was raised (`THROTTLE_ANON=100000/hour`) so they would not hit 429.
- No production secrets were used or recorded.

## Build / lint / tests: before vs after
| Check | Before (owner's code as-is) | After (with fixes) |
|---|---|---|
| `vite build` | passes (chunk-size warning only) | passes; also passes without `VITE_API_URL`, and that bundle points only at `https://api.pinkbakes.com` |
| eslint (box-side config) | **1 error** (`fetchAdminRefunds` is not defined, `main.jsx`), 49 warnings | **0 errors**, 49 warnings |
| Django tests | 155 run. With a plain env: 11 payment-test failures (razorpay import needs `setuptools<81` on Python 3.12+). With `DJANGO_DEBUG=true` and `setuptools<81` in the QA venv: 155 OK | **159 run, all OK** (+4 new `DeliveryTrackingRegressionTests`) |

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
| Automated Django unit tests | 159 | 159 | 0 | 0 | |
| Manual/live read-only GET checks | 16 | 11 | 5 | 1 | failures = soft-404 (×3 routes), no canonical host redirect, no-slash 301. Blocked: HTTP→HTTPS (port 80 is blocked from the QA box) |
| Static review (lint, build, code diff vs pre-refactor) | 3 | 2 | 1 | 0 | lint error before the fix; 0 after |
| Not safely testable | – | – | – | 6 | see Blocked |

### r2 flag triage (16 flagged → 2 real)
- **320/360 product modal, checkout and auth (10):** caused by the local API throttle (HTTP 429) during the sweep. The r3 rerun with the throttle relaxed: all pass.
- **`.auth-float` "covered by header" at 768–1001px (4):** false positive. The pill is `display:none` from 721–1023px by design (rect 0×0) and the header Sign-in is visible (`r2_768x1024_guest_home.png`).
- **nav_Contact at 1024/1280/1440 (3 of the 5 nav flags):** expected. Contact is at the page end, and the page is scrolled to its maximum.
- **nav_Gallery at 1280/1440 (2 of the 5 nav flags):** real P3. The section lands about 200px below the header because lazy images above it change the layout during the smooth scroll (BUG-021, not fixed).

## Key results
- **Customer flow (local):** browse, quick view, `/products/:slug` deep link with refresh and back, add to cart, cart drawer, checkout form, order list and tracking all PASS.
- **Payment:** order create and verify paths pass in the Django tests. The success screen no longer invents a `PB-<timestamp>` order number. Real Razorpay checkout and webhooks are BLOCKED.
- **Admin (local):** login, dashboard, orders, refunds and notification logs. Crashed before the fix (P0); PASS after.
- **Tracking API:** owner only. Another customer gets 403, anonymous gets 401, and a customer posting a location gets 403. Invalid coordinates now return 400 instead of 500.
- **Responsive:** no horizontal overflow at any width. After the fixes, the header fits from 320px up, the floating pill no longer covers the menu or cart, and the toast no longer blocks the CTA.

## Live read-only results (https://pinkbakes.com, https://api.pinkbakes.com)
| Check | Result |
|---|---|
| `/`, `www.` | 200 / 200. No canonical redirect between the two hosts (P3 SEO) |
| `/privacy`, `/terms`, `/products/1` | 200 |
| `/admin`, `/nonexistent-xyz`, `/cart` | 200 serving index.html (soft 404; the home page renders) |
| `GET api/catalog/products/` | 200 |
| `GET api/admin/dashboard/` unauthenticated | 401 (good) |
| `GET api/accounts/notifications` (no slash) | 301 → slash. The live bundle calls the no-slash path. |
| CORS preflight from pinkbakes.com | 200 |
| HSTS | present |
| Live bundle `index-BeXoDRug.js` | contains the `fetchAdminRefunds` crash path, `PB-${Date.now()}` and the no-slash paths, which confirms the live findings |
| HTTP→HTTPS redirect | BLOCKED (the QA box cannot reach outbound port 80) |

## Blocked / needs staging
1. Real Razorpay payment success, failure and refund, and webhook signature delivery.
2. Live admin actions (status changes, refunds, product edits). Not done, because they write records.
3. Live customer sign-up, OTP, email and SMS notifications.
4. Live delivery-partner location posting and the live map with real GPS.
5. HTTP→HTTPS redirect check (box network).
6. Real-device Safari/iOS and Android rendering (only Chromium emulation was run).

## Evidence
On the QA box, `/workspace/pinkbakes/evidence/`. Copies of the key files are in `qa_evidence/` next to this report:
- `live1orig_admin_loggedin.png` / `live1fix_admin_orders_loggedin.png`: blank admin screen before and after the fix
- `r0_320x568_guest_mobile_menu_open.png`, `r0_320x568_guest_cart_drawer.png`: floating pill overlap before the fix
- `fix2_header_stack.png`, `hdr_320x568.png`: header after the fix
- `strike_card_343.png`, `strike_card_1280.png`: strikethrough price
- `frontend_changes.patch`, `backend_changes.patch`: exact diffs

The browser tester's screenshots were not available: the assets folder given to QA was empty, so none could be attached.
