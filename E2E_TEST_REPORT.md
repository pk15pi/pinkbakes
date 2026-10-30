# PinkBakes – Phase 9 E2E Test Report (2026-10-30)

All testing was local only: an isolated SQLite DB, a fake Razorpay (signed locally), and no SMS, email or real orders. The live site got read-only GETs only. Nothing was committed, pushed or deployed by the agent.

## Inventory
See INVENTORY.md (pages, components, API endpoints, roles, flows) and TEST_PLAN_E2E.md (modules A–M plus N security, O performance, responsive).

## Results
| Suite | Result |
|---|---|
| Playwright chromium (functional A–O) | 56/56 (after test fixes; orders race fix re-run 12/12) |
| Playwright firefox | 56/56 |
| Playwright webkit | 55/56 → 56/56 after harness fix (seed images on example.test now served locally) |
| Responsive, 17 viewports × 4 pages (chromium) | 68/68, no horizontal overflow, header usable |
| Django test suite (SQLite) | 227 tests, OK |
| `npm run build` (SITEMAP_SKIP_FETCH=1) | OK, 6.7 s |
| Lint | No lint script configured (not added; no new dependencies) |

Bundle sizes (gzip): index JS 68.7 kB, react-vendor 45.7 kB, three.js 205.2 kB (lazy-loaded 3D viewer), CSS 13.5 kB.

Evidence: e2e/reports/ (diagnostics.jsonl, perf.jsonl, responsive/ screenshots).

## Bugs found and fixed
| Sev | ID | Issue | Fix |
|---|---|---|---|
| Critical | – | Admin email login did not verify the password; inactive users were accepted | catalog/views.py + tests (already committed by owner, 745243a) |
| High | – | Signup skipped Django password validators; unclear unverified-user message | accounts/serializers.py, views.py + tests (745243a) |
| Medium | BUG-012 | (main.jsx) | src/main.jsx |
| Low | – | Anniversary Cakes fallback image path pointed to a missing file | src/appConstants.js, backend catalog/constants.py (745243a) |
| Low | – | React console error: unknown prop `fetchPriority` | HeroSection.jsx → `fetchpriority` |
| Low (a11y) | – | Auth dialog (aria-modal) could not be closed with Escape | AuthDialog.jsx Escape handler |

Coupon suspicion: false alarm. The server-side discount (81) and total (779) are verified by the checkout E2E test.

## Remaining issues / owner items
- SECRET_KEY / DEBUG fallbacks are hardcoded in settings. Left unchanged per instruction; the owner should move them to env-only.
- Clicking the account button before the session restores briefly opens the sign-in dialog (minor race; documented, not fixed).
- The cart is in memory only and is lost on reload (by design; observation).
- Earlier OWNER items 014, 018, 020, 022, 024 remain open (see earlier phase reports).
- Payments (Razorpay) were not tested against a real gateway.

## Files changed
Frontend (uncommitted): src/main.jsx, src/appConstants.js, src/components/HeroSection.jsx, src/components/AuthDialog.jsx. New: INVENTORY.md, TEST_PLAN_E2E.md, E2E_TEST_REPORT.md, e2e/ (dev-only Playwright).
Backend: already committed and pushed by the owner (745243a "bugfixes").
Backups: E:\repos\_pinkbakes_backup_20261024\phase9\

## How to run
cd e2e; npm ci; npx playwright install
npx playwright test --project=chromium   (or firefox / webkit / "vp-*")
Backend tests: run manage.py test with DB_ENGINE=sqlite3 and DATABASE_URL unset.

## Deploy
Backend: already pushed (745243a), so redeploy the API. Frontend: review and commit the 4 files above, build, then deploy hosting (owner action).
## Phase 10 (2026-10-30) - sign-in flash + server-side cart (owner approved)
- Account button disabled (aria-busy) while the saved session restores; no sign-in dialog flash.
- Guest cart in localStorage `pinkbakes_cart_v1` (id/options/qty only, re-priced from catalog).
- Signed-in cart stored in backend (catalog.Cart/CartItem, migration 0019_cart): GET/PUT/DELETE /api/cart/, POST /api/cart/merge/. Server re-prices on every read, drops unavailable lines/sizes and reports `removed`, clamps to stock (`adjusted`), qty 1..40, max 50 lines.
- Login merges guest cart (sum, cap 40) then removes local copy; logout clears view; cart cleared server-side when payment is marked paid (verify + webhook), so failed payments keep the cart.
- Results: Django 238 OK; chromium full 61/61; firefox+webkit on a,c,d,g,h,i,p 59/60 + 1 startup connection-refused rerun green (6/6); p spec x3 15/15; build OK.
- Deploy: backend pull, `python manage.py migrate` (0019_cart), restart API; then frontend build/deploy. Nothing committed/pushed.