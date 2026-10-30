# PinkBakes – UI/UX Audit Report (Phase 12)

Date: 30 Oct 2026 (IST). Scope: the existing frontend `E:\repos\pinksBakes` (React 18 + Vite, single global `src/styles.css`). The work was local only, with no backend, API or DB changes and no commit, push or deploy. The backup is in `E:\repos\_pinkbakes_backup_20261024\phase12\`.
Method: a dev-only Playwright audit (`e2e/playwright.uiux.config.js` + `e2e/uiux/uiux-audit.spec.js`) runs at 17 viewports × 12 page states, which gives 204 screenshots per run. It uses in-page checks only: horizontal overflow, WCAG 2.2 target size (24 px), accessible names and labels, image alt, text contrast on solid backgrounds, text under 11 px, and heading order. axe-core is not installed, and no dependency was added.
Run it with: `cd e2e; $env:UIUX_PHASE='before'|'after'; npx playwright test -c playwright.uiux.config.js`.

## 1. Pages inspected
- Customer pages: Home (hero), Catalogue/product grid, Product detail (`/products/<slug>`), Cart drawer, Checkout (signed in), Login dialog, Sign-up dialog, Account → Order history/tracking, Policy (`/privacy`), and 404 (unknown product).
- Admin pages: Admin login (`/admin-login`) and Admin dashboard (`/admin`).

## 2. Components inspected
SiteHeader (nav, mobile menu, header actions), HeroSection, CategorySection, ProductCatalog (search, chips, cards), ProductModal (options, reviews), CartDrawer, CheckoutForm, AuthDialog, UserOrdersDialog, PolicyPage, NotFoundPage/ProductNotFoundDialog, CustomCakeSection, HomeSections (benefits, testimonials, gallery), ContactStrip, SiteFooter (links, newsletter, social), ChatbotDock, AdminDialogs, AdminDashboardPanel.

## 3. Visual problems
- **High:** the primary CTA colour `#a67a43` gave white text only 3.83:1 contrast. This affects Explore Cakes, Add to Cart, Checkout, Sign In, Login and Order Now. The active chip, selected size/option, the 10% OFF badge and 3D View were also between 4.1 and 4.3:1.
- **Medium:** muted text was between 2.8 and 4.3:1. This covers the eyebrows, the "(optional)" hint, benefit captions, cart notes, rating/stars, struck-through price, policy meta and footer legal text.
- **Low:** the hero script note sits over the image. It is legible, but contrast cannot be measured automatically.

## 4. Responsive issues
- No horizontal overflow was found at any of the 17 viewports in the 12 states, before or after the changes (`overflowX ≤ 1px`).
- The existing ≤720 px rules already give 44 px touch targets on mobile.
- The desktop range (≥1024 px) had sub-24 px targets: nav links (21 px), footer Explore links, footer legal links (19 px), the WhatsApp icon (15 px wide), the "View All Cakes" link and the selects (19 px).

## 5. Accessibility issues
- **High:** the catalogue search input (`#search`) had no label; it relied on a placeholder only. It appears on every customer page.
- **High:** the footer newsletter e-mail input had no label (every page).
- **High:** buttons with no accessible name: the Product modal close button (`.modal-close`) and the admin-login close button.
- **High:** the admin dashboard date-range select had no name. The same was true of the admin order-status, payment-status and review-filter selects.
- **High:** focus was invisible on several inputs that set `outline:none` (search, newsletter, admin form, chatbot, custom brief). Only 4 `:focus-visible` rules existed.
- **Medium:** there was no `prefers-reduced-motion` handling.
- **Low:** heading order skips h2→h4 in the footer "Explore" section and h1→h3 at product "Customer Reviews".

## 6. Navigation and usability issues
- The desktop nav and footer link hit areas were under the 24 px WCAG 2.2 minimum (see §4).
- The navigation flows themselves (menu, cart, checkout, auth, orders, admin) worked at every viewport. The functional suite covers them.

## 7. Typography and spacing issues
- Several labels were at 6–8 px:
  - 6 px: header brand subtitle;
  - 7 px: auth brand subtitle;
  - 8 px: sale badge, stock pill, benefit captions, review occasion, footer legal row, "Freshly made · Secure checkout", 3D viewer labels.
- The site's deliberate compact scale also uses 9–10 px eyebrows, chips and buttons. That scale is part of the brand, so it was left as is.

## 8. Image presentation issues
- All visible images have `alt`.
- Product grid images are lazy-loaded. Before/after timing shows cards that are still blank while their images load (see visual-diff notes).
- In the local seed, the cart line image is a broken test-fixture path; production uses real images.
- From Phase 11, 2 live product images are over 300 KB. This is a Low item (recommend compression).

## 9. Before/after screenshots
- Before: `e2e/reports/uiux/before/vp-<W>x<H>-<state>.png` (204 files)
- After: `e2e/reports/uiux/after/vp-<W>x<H>-<state>.png` (204 files)
- States: home, catalogue, product, policy, notfound, login, signup, cart, checkout, orders, admin-login, admin-dashboard.
- Audit data: `before/audit.jsonl` and `after/audit.jsonl`. Pixel diff: `e2e/reports/uiux/visual-diff.json`.
- Side-by-side comparisons: `e2e/reports/uiux/compare/` (vp-390x844-home, vp-1440x900-home, vp-1440x900-catalogue, vp-375x667-product, vp-1440x900-checkout, vp-430x932-catalogue, vp-320x568-cart, vp-1366x768-home).
- Diff notes:
  - Most pairs change by under 5%, from the button and text shade changes and the font-size floor.
  - The larger catalogue and cart diffs come from capture timing: lazy images not yet loaded, and the drawer mid-slide in BEFORE. They are not layout regressions; I checked the comparison images manually.

## 10. Changes made
All CSS is in one commented block appended to the end of `src/styles.css`, following the file's existing append-fix convention. The block adds no new tokens or fonts, no fixed widths, and hides nothing.
- **Focus:** a global `:focus-visible` outline (2 px, brand brown `#8c6a4b`; light `#e8c9a0` in the dark footer).
- **Contrast:** the same hues, about 10% deeper, to reach at least 4.5:1:
  - primary/Order Now/auth active `#a67a43→#956d3c` (hover `#86622f`);
  - chip active `#946d3c`; selected option `#966d3d`; badge/3D `#926e4b`;
  - eyebrow and policy kicker `#7a5b40`; brand subtitle `#85654a`;
  - muted captions `#7b6f65`/`#76665a`/`#807269`/`#827267`; rating `#996b32`; stars `#996c37`; strike price `#8a7057`;
  - footer legal text `#a39488`.
- **Type floor:** text under 9 px raised to 10 px (brand subtitle 6→8 px, so the header stays on one line; auth subtitle 7→9 px).
- **Target size:** `min-height:24px` on the desktop nav, footer Explore links, text links, footer legal links, the auth form inline buttons and single selects; the social icon gets `min-width/min-height:24px`.
- **Reduced motion:** a `@media (prefers-reduced-motion:reduce)` block. This is the standard reset and the only new `!important` usage.
- **Accessible names (JSX attributes only):**
  - `aria-label`s on the search input, newsletter input, Product modal close and admin login close;
  - the admin dashboard date range, order status, payment status and review filter selects.

## 11. Files modified
- `src/styles.css` (+36 lines, appended block)
- `src/components/ProductCatalog.jsx`, `SiteFooter.jsx`, `ProductModal.jsx`, `AdminDialogs.jsx`, `AdminDashboardPanel.jsx` (aria-label attributes only)
- Dev-only, new: `e2e/playwright.uiux.config.js`, `e2e/uiux/uiux-audit.spec.js`, `e2e/reports/uiux/**`
- `e2e/PROGRESS.md` (Phase 12 section)

## 12. Viewports tested
320×568, 360×640, 375×667, 390×844, 414×896, 430×932, 600×960, 768×1024, 820×1180, 1024×1366, 1280×720, 1366×768, 1440×900, 1536×864, 1600×900, 1920×1080, 2560×1440. The audit used Chromium with touch/mobile emulation at ≤1023/≤430 px. The functional suite covered Chromium, Firefox and WebKit.

## 13. Issues fixed
| Priority | Issue | Before → After |
|---|---|---|
| High | Unlabelled inputs/selects and unnamed buttons | 23 distinct → 0 |
| High | Primary CTA and active-state contrast under 4.5:1 | 3.83–4.3 → ≥4.6 |
| High | Invisible keyboard focus (outline:none) | global `:focus-visible` added |
| Medium | Muted text contrast failures | 67 distinct → 9 (all Low/edge, see §14) |
| Medium | No reduced-motion support | added |
| Medium | Targets under 24 px on desktop | 21 distinct → 1 (search input inside its larger pill) |
| Medium | 6–8 px text | all ≥8 px (the brand subtitle at 8 px is the only one under 9 px) |

Results:
- Overflow: 0 cases before and after.
- Full suite after the changes: 191 + 68 = 259 passed.
- One Chromium 404 test timed out under load, then passed 3/3 on rerun.
- The build succeeds.

## 14. Remaining issues
- **Low:** policy nav `.is-current` (3.83:1). A more specific existing selector overrides it; this needs a selector review.
- **Low:** admin `.btn.secondary` active "Dashboard" (4.10:1); avatar initial (4.19:1); custom-cake intro paragraph (4.17:1 on its tinted panel); "(optional)" (4.45:1).
- **Low:** product breadcrumb links are about 4.46:1 because of the inline `opacity` style in ProductModal.
- **Low:** heading skips: the footer "Explore" h4 under h2, and product "Customer Reviews" h3 under h1. Fixing them means changing tags and CSS selectors, so it was deferred to avoid restyling.
- **Low:** the 9–10 px compact type scale (eyebrows, chips, card buttons, ratings) is legible but small. Raising it is a typographic redesign decision.
- **Low:** the hero script note's contrast over the photo was not measured automatically (it looks legible).
- **Low:** 2 live product images are over 300 KB.

## 15. Recommendations
1. Introduce CSS custom properties for the colour and type tokens (`--pb-accent`, `--pb-muted`, `--pb-fs-xs`…). The palette is currently repeated as literals across the stylesheet, which led to many near-duplicate browns.
2. Consolidate the roughly 30 media queries onto a small breakpoint set (480/720/1024/1280).
3. Raise the minimum type size to 11–12 px in a future approved design pass.
4. Fix the heading hierarchy (footer h4→h3 with matching CSS; reviews h3→h2).
5. Compress the large product images (WebP/AVIF, ≤200 KB) and add width/height to card images to minimise CLS.
6. Add `@axe-core/playwright` as a dev-only dependency if deeper automated a11y coverage is wanted.
7. Keep `uiux-audit.spec.js` as a pre-release visual/a11y check.

## Deploy steps (when approved)
Only the frontend changed. There is no backend change and no migrate.
1. `cd E:\repos\pinksBakes; npm run build`
2. Deploy `dist/` with the usual Firebase Hosting flow.
3. Hard-refresh the live site and spot-check the CTA colour, keyboard focus and footer.