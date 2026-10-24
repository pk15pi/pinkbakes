# Pinkbakes QA – Test Plan (2026-10-24)

Scope: frontend `pinksBakes` (React 18 / Vite 6, Firebase Hosting) and backend `pinkbakes_backend` (Django/DRF), checked after the frontend was split from one `main.jsx` into hooks and components.

## Environments and safety
| Env | Use | Rules |
|---|---|---|
| Local (QA box copy of both repos) | All functional, payment-flow, admin, tracking, API and responsive tests | SQLite only (`db.sqlite3` seeded copy), `DJANGO_DEBUG=true`, `SECURE_SSL_REDIRECT=false`, dev/test env values only. No real `.env` secrets were read into reports. |
| Live https://pinkbakes.com, https://api.pinkbakes.com | Read-only GET checks of public pages, assets and unauthenticated API responses | No orders, payments, sign-ups, notifications, logins or writes. Anything that needs one is **BLOCKED / needs staging**. |
| Razorpay | Order-create and verify code paths, using local test doubles from the existing Django test suite | A real gateway success, failure or webhook needs staging and test keys, so it is **BLOCKED**. |

Not touched: Firebase, OCI, production PostgreSQL, git remotes. Nothing was committed or pushed.

## Architecture under test
- Routing is custom (no react-router):
  - `useProductRoute` handles `/products/:slug|id`.
  - `usePolicyRoute` handles `/privacy|terms|shipping|refund`.
  - `main.jsx` checks for `/admin*` and `/reset-password/:token`.
  - Every other path renders the home page. Firebase rewrites `**` to `index.html`.
- State lives in hooks: `useCart`, `useCatalog`, `useCheckoutFlow`, `useAuthFlow`, `useAdmin*`, `useCustomerAccount` and others. All HTTP calls go through `services/authService.js` and `config.apiBaseUrl`.
- Admin is a modal workspace (`AdminDialogs` and others). It opens whenever `pinkbakes_admin_token` is in storage.
- Backend apps: `accounts`, `catalog` (products, orders, payments, coupons, refunds, delivery tracking, admin reports), `notifications` and `seo`.

## Navigation inventory
| Entry point | Location | Target / behaviour | Tested |
|---|---|---|---|
| Brand logo | Header | scroll to `#home` | auto (all viewports) |
| Home / Cakes / Categories / Custom Cakes / About Us / Gallery / Contact | Header nav (desktop) and hamburger menu (≤1023px) | smooth scroll to section id | auto, each viewport |
| Search icon | Header | focus `#search` | auto |
| Sign in / Orders | Header pill + floating `.auth-float` pill (≤720px and ≥1024px) | AuthDialog, or UserOrdersDialog when logged in | auto |
| Cart | Header | CartDrawer, then Checkout | auto |
| Order Now | Header | scroll to cakes | auto |
| Quick View / View Cake | Product card | ProductModal + `/products/:slug` (pushState) | auto + refresh/back |
| 3D View | Product card | Product3DViewer | static/manual |
| Add to Cart | Product card / modal | cart add, toast | auto |
| Explore / Company links | Footer | scroll to section | static |
| Privacy / Terms / Shipping / Refund | Footer | `/privacy` etc. PolicyPage | auto + live GET |
| HELP DESK | Footer + floating Help (`.chatbot-launch`) | ChatbotDock | auto |
| Admin Login / Admin | Footer | Admin login dialog, then admin workspace | auto (local) |
| `/admin`, `/admin/*` | URL | admin login or workspace | auto (local prod build) |
| `/reset-password/:token` | email link | reset form | auto (local) |
| Unknown path (e.g. `/cart`, `/checkout`, `/track`, `/xyz`) | URL | renders home (soft 404) | live GET + local |
| Order tracking | UserOrdersDialog → order → live map | no standalone route | API + static |

## Test matrix
- **Viewports:** 320x568, 343x740, 360x800, 375x812, 390x844, 414x896, 480x854, 600x960, 720x1000, 768x1024, 900x1000, 1000x800, 1001x800, 1024x768, 1280x800, 1440x900. Chromium via Playwright, box-side only.
- **Contexts:** guest, customer (seeded local user), admin (seeded local staff).
- **Per viewport/context:** home load, horizontal overflow, small tap targets, key-control reachability and occlusion (`elementFromPoint`), hamburger menu open, every nav item, product modal, add to cart, cart drawer, checkout form, auth dialog, chatbot, policy page, product deep link, admin panel, console errors.
- **API checks (local):** auth required, owner isolation for orders and tracking, staff-only admin endpoints, staff-only location posting, input validation, trailing-slash redirects.
- **Live read-only:** status codes for pages and routes, soft 404, canonical host, CORS preflight, security headers, bundle inspection.
- **Static:** eslint (box-side config), vite build with and without `VITE_API_URL`, code review against the pre-refactor `main.jsx`.
- **Regression:** Django test suite plus new `DeliveryTrackingRegressionTests`.

## Exit criteria
No P0/P1 open in code that can be fixed safely. Build, lint (0 errors) and Django tests green. Anything not safely testable is marked BLOCKED.
