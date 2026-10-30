# Pinkbakes QA – Test Plan (2026-10-24)

Scope: frontend `pinksBakes` (React 18 / Vite 6, Firebase Hosting) and backend `pinkbakes_backend` (Django/DRF), checked after the frontend was split from one `main.jsx` into hooks and components.

## Environments and safety
| Env | Use | Rules |
|---|---|---|
| Local (QA box copy of both repos) | All functional, order-flow, admin, tracking, API and responsive tests | SQLite only (`db.sqlite3` seeded copy), `DJANGO_DEBUG=true`, `SECURE_SSL_REDIRECT=false`, dev/test env values only. No real `.env` secrets were read into reports. |
| Live https://pinkbakes.com, https://api.pinkbakes.com | Read-only GET checks of public pages, assets and unauthenticated API responses | No orders, payments, sign-ups, notifications, logins or writes. Anything that needs one is **BLOCKED / needs staging**. |
| Razorpay / payment gateway | **N/A: not implemented yet** (owner, 24 Oct) | All payment-gateway testing is skipped (create, verify, retry, refund-to-gateway, webhooks). Those items are recorded as N/A, not as failures. Order tests use `/api/orders/checkout/`, which does not touch the gateway. |

| Owner's PC (`E:\repos`, phase 3 onward) | Edits in place, Django tests, vite build | Backups in `E:\repos\_pinkbakes_backup_20261024\`. Tests run with `.env` loading disabled and SQLite forced; the build writes to a temp folder, not `dist\`. |

Not touched: Firebase (except the local Hosting emulator on the QA box), OCI, production PostgreSQL, git remotes. QA committed and pushed nothing.

## Architecture under test
- Routing is custom (no react-router):
  - `useProductRoute` handles `/products/:slug|id`.
  - `usePolicyRoute` handles `/privacy|terms|shipping|refund`.
  - `main.jsx` checks for `/admin*` and `/reset-password/:token`.
  - Other known app paths (`/cart`, `/checkout`, `/account`, `/orders*`, `/login`, `/signup`, `/verify-email`) render the home page. Any other path shows the not-found page (phase 2, BUG-011). Since phase 3, `firebase.json` rewrites only the known routes to `index.html`, using the same regex list as `KNOWN_APP_ROUTES` in `src/seo.js`. Other paths get `404.html` (a copy of `index.html` made at build time) with HTTP 404.
  - A top-level `ErrorBoundary` wraps the app (BUG-013).
- State lives in hooks: `useCart`, `useCatalog`, `useCheckoutFlow`, `useAuthFlow`, `useAdmin*`, `useCustomerAccount` and others. All HTTP calls go through `services/authService.js` and `config.apiBaseUrl`.
- Admin is a modal workspace (`AdminDialogs` and others). It opens whenever `pinkbakes_admin_token` is in storage.
- Backend apps: `accounts`, `catalog` (products, orders, payments, coupons, refunds, delivery tracking, admin reports), `notifications` and `seo`.

## Navigation inventory
| Entry point | Location | Target / behaviour | Tested |
|---|---|---|---|
| Brand logo | Header | scroll to `#home` | auto (all viewports) |
| Home / Cakes / Categories / Custom Cakes / About Us / Gallery / Contact | Header nav (desktop) and hamburger menu (≤1023px) | smooth scroll to section id | auto, each viewport |
| Search icon | Header (all widths; restored on phones, BUG-027) | focus `#search` and scroll it into view | auto (`vpfull`, `searchchk`) |
| Sign in / Orders | Header pill + floating `.auth-float` button (≤720px and ≥1024px; hidden while the hero CTA is at the bottom of a phone screen) | AuthDialog, or UserOrdersDialog when logged in | auto |
| Cart | Header | CartDrawer, then Checkout | auto |
| Order Now | Header (≥414px); bottom of the hamburger menu at ≤413px | checkout / order flow | auto |
| Quick View / View Cake | Product card | ProductModal + `/products/:slug` (pushState) | auto + refresh/back |
| 3D View | Product card | Product3DViewer | static/manual |
| Add to Cart | Product card / modal | cart add, toast; the modal sends size, eggless, message and delivery date as cart-line options | auto |
| Explore / Company links | Footer | scroll to section | static |
| Privacy / Terms / Shipping / Refund | Footer | `/privacy` etc. PolicyPage | auto + live GET |
| HELP DESK | Footer + floating Help (`.chatbot-launch`) | ChatbotDock | auto |
| Admin Login / Admin | Footer | Admin login dialog, then admin workspace | auto (local) |
| `/admin`, `/admin/*` | URL | admin login or workspace | auto (local prod build) |
| `/reset-password/:token` | email link | reset form | auto (local) |
| Unknown path (e.g. `/track`, `/xyz`, `/products/a/b`) | URL | not-found page, `noindex` (phase 2) | local `fn2.mjs` |
| `/cart`, `/checkout`, `/account`, `/login`, `/signup`, `/orders` | URL | renders home (HTTP 200) | `fn2.mjs`, Hosting emulator |
| `/verify-email?token=` | verification email | sign-in dialog + verify API result (BUG-025) | `emailchk.mjs` |
| `/orders/<id>/tracking` | order emails | My Orders → order → live tracking; guests get the sign-in prompt (BUG-025) | `emailchk.mjs` |
| Order tracking | UserOrdersDialog → order → live map | no standalone route | API + static |

## Test matrix
- **Viewports:** 320x568, 343x740, 360x800, 375x812, 390x844, 414x896, 480x854, 600x960, 720x1000, 768x1024, 900x1000, 1000x800, 1001x800, 1024x768, 1280x800, 1440x900. Chromium via Playwright, box-side only.
- **Contexts:** guest, customer (seeded local user), admin (seeded local staff).
- **Per viewport/context:** home load, horizontal overflow, small tap targets, key-control reachability and occlusion (`elementFromPoint`), hamburger menu open, every nav item, product modal, add to cart, cart drawer, checkout form, auth dialog, chatbot, policy page, product deep link, admin panel, console errors.
- **API checks (local):** auth required, owner isolation for orders and tracking, staff-only admin endpoints, staff-only location posting, input validation, trailing-slash redirects.
- **Live read-only:** status codes for pages and routes, soft 404, canonical host, CORS preflight, security headers, bundle inspection.
- **Static:** eslint (box-side config), vite build with and without `VITE_API_URL`, code review against the pre-refactor `main.jsx`.
- **Regression:** Django test suite plus new `DeliveryTrackingRegressionTests` and `OrderItemOptionsRegressionTests`.
- **Phase 2 (BUG-011/013/016/017/021):**
  - `fn2.mjs`: 16 route checks, the 404 buttons and Back, an injected render crash for the error boundary, options from modal to cart, a past delivery date, the eggless note, and ₹ in the cart.
  - `navchk2.mjs`: header nav landing position on a fresh load with throttled network (1.5 Mbps, 150 ms latency) at 1280, 1366, 1440, 1920 and 390, for Gallery, About, Custom Cakes and Cakes.
  - Responsive sweep `r4` on 320, 343, 390, 768, 1024, 1280 and 1440.
- **Phone header and floats (BUG-027), `vpfull.mjs`:**
  - Viewports: 320x568, 360x800, 375x812, 390x844, 414x896, 768x1024, 1024x768, 1280x800, 1440x900, plus breakpoint edges 413, 480/481, 600/601, 720/721, 1000/1001, 1023, 1279.
  - Per viewport: header (logo visible and on top, no overlaps, nothing outside the bar, name not truncated, search/account/cart present), floats at top and scrolled (same bottom, same height, same edge distance, no hero CTA covered), header search, hamburger menu (+ Order Now at ≤413), section nav landing (waits for smooth scroll to settle), product listing, product popup, cart drawer, auth dialog, chatbot, 404 page, policy page, customer checkout layout (no submit), customer orders, admin tabs, console errors, horizontal overflow and occlusion on each.
  - Screenshots for the 9 main viewports; "before" screenshots of the live site (read-only page load and scroll) at the same 9.
- **Phase 3 (BUG-023/025/026/028, 404 status):**
  - `stickychk.mjs`: 20 viewports (320–1440). Header position at 4 scroll depths, horizontal overflow, the phone menu fitting under the bar, and anchor landing. Live "before" screenshots at 9 viewports (read-only).
  - Firebase Hosting emulator on a local build: status codes for 23 real and 7 unknown paths, plus a check that the app and hosting route lists match.
  - `emailchk.mjs`: verify-email link (bad token, no token) and tracking link (guest, signed-in customer).
  - Django: `EmailLinkRouteTests` (links built from `FRONTEND_URL`, routed paths, encoded tokens), BUG-026 server-side price and per-size pricing (`catalog/test_size_pricing.py`: size price, discount, fallback, unpriced size 400, client price ignored, coupon, admin validation), and `catalog/test_throttles.py` (catalog reads over the anon limit, write and auth limits still strict, env override).
  - Reruns: `vpfull`, `searchchk`, `navchk2`, `fn2`, lint, build (owner's PC), Django suite (owner's PC).
- **Out of scope:** payment gateway (N/A, not implemented).

## Exit criteria
No P0/P1 open in code that can be fixed safely. Build, lint (0 errors) and Django tests green. Anything not safely testable is marked BLOCKED. Payment-gateway items are N/A.
