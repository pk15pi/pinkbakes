# PinkBakes – End-to-End Test Plan (Phase 9)

## Environment (isolated; never production)
- **Backend:** `e2e/backend/run_backend.py --fresh --port 8765`. It uses `e2e_settings.py`: a fresh SQLite DB under `e2e/.tmp`, a file email backend, SMS disabled, a local test payment signing secret, and an `.env` that is never loaded.
- **Seed:** `e2e/backend/seed_e2e.py` creates fake accounts (`*@example.test`), 4 products, a zone for PIN 122001 (fee ₹50, free over ₹2000), the coupon E2ESAVE10, and 5 orders in different states.
- **Frontend:** Vite dev server on `localhost:5174` with `VITE_API_URL=http://127.0.0.1:8765`.
- **Payment:** `checkout.razorpay.com` is intercepted and replaced by a fake `window.Razorpay` that signs locally. Analytics requests are aborted. No real money, SMS or email.

## Projects
- **Functional:** chromium, firefox, webkit (Desktop 1440×900).
- **Responsive (`@responsive`), 17 viewports:**
  - mobile: 320×568, 360×640, 375×667, 390×844, 414×896, 430×932;
  - tablet: 600×960, 768×1024, 820×1180, 1024×1366;
  - desktop: 1280×720, 1366×768, 1440×900, 1536×864, 1600×900, 1920×1080, 2560×1440.
  - Widths under 1024 use touch, and widths up to 430 use mobile emulation. All run on Chromium.

## Modules and cases
| Module | Spec | Key cases |
|---|---|---|
| A Home/navigation | a-home | Load, title, sections, no console errors, nav scroll, broken images, policy deep-links and refresh, 404, back/forward |
| B Signup | b-signup | Required fields, weak/common password rejected, duplicate email, bad mobile, signup → OTP from mail file → verify → signin |
| C Login | c-login | Valid login and persistence, wrong password or unknown user (generic error), empty fields, unverified-user message, protected route |
| D Logout | d-logout | UI sign-out, refresh and back stay signed out, server token revoked, stale token discarded |
| E Catalogue | e-catalogue | Listing, search, no-results state, category filter, out-of-stock disabled, invalid product URL, no draft products in API |
| F Product | f-product | Deep link, per-size price, add to cart, discount price, OOS detail |
| G Cart | g-cart | Empty state, multiple items, quantity +/−, remove, subtotal maths, server validation of qty/unknown/OOS |
| H Checkout | h-checkout | Guest must sign in; saved address, delivery fee, coupon (−10%), mocked payment, server totals; non-deliverable PIN; bad address/coupon/empty cart; forged signature |
| I Orders | i-orders | Own orders only, IDOR read/cancel/track, 401 unauthenticated, cannot cancel after dispatch-ready |
| J Delivery | j-delivery | Zone fee and free threshold; admin status transitions valid/invalid; customer cannot change status |
| K Tracking | k-tracking | Owner timeline, other user blocked, invalid id handled |
| L Reports | l-reports | Summary counts, CSV export structure, admin-only (customer and anonymous blocked) |
| M Admin | m-admin | Login and section navigation, BUG-012 regression, admin email+wrong password regression, customer blocked, logout |
| Security | n-security | XSS in search, SQL-ish input, no tracebacks, nosniff header, signin burst never 500s |
| Performance | o-perf | Page load and API timings → `reports/perf.jsonl`; bundle sizes from `vite build` |
| Responsive | responsive | No horizontal overflow, header and cart visible, mobile menu works, touch targets under 40px annotated, screenshots in `reports/responsive/` |

## Pass criteria
All specs green on the 3 browsers and 17 viewports; Django suite green; `vite build` succeeds; every bug fixed has a regression test.
