# PinkBakes – Application Inventory (Phase 9 audit, 30 Oct 2026)

Local audit only. Nothing here was deployed. Credentials are deliberately omitted.

## Stack
| Layer | Tech |
|---|---|
| Frontend | React 18.3 + Vite 6 SPA (`E:\repos\pinksBakes`). There is no router library: `src/main.jsx` and `src/seo.js` (`KNOWN_APP_ROUTES`) do the path handling. Hosted on Firebase Hosting. |
| Backend | Django + DRF (`E:\repos\pinkbakes_backend`). Apps: `accounts`, `catalog`, `seo`, notifications and addresses. Token auth. PostgreSQL in production; SQLite for local tests. |
| Payments | Razorpay checkout.js plus an HMAC signature check on the server. `PAYMENT_ENABLED=False` in production. E2E tests use a mock only. |
| Lint | **No lint script or ESLint config exists.** `vite build` is the only static check. |

## Public routes (SPA)
`/`, `/products/<slug>`, `/privacy`, `/terms`, `/shipping`, `/refund`, `/cart`, `/checkout`, `/account`, `/login`, `/signup`, `/orders`, `/orders/<id>/tracking`, `/reset-password`, `/verify-email`, `/admin`, `/admin-login`. Any other path shows the NotFound page.

## Frontend modules
- **Components (27):** AdminCustomerDrawer, AdminDashboardPanel, AdminDialogs, AdminEmployeesPanel, AdminSiteContentPanel, AuthDialog, BakeryLocationDialog, CartDrawer, CategorySection, ChatbotDock, CheckoutForm, ContactStrip, CustomCakeSection, ErrorBoundary, GlbModelCanvas, HeroSection, HomeSections, NotFoundPage, OrderSuccessDialog, PolicyPage, Product3DViewer, ProductCatalog, ProductModal, ProductNotFoundDialog, SiteFooter, SiteHeader, UserOrdersDialog.
- **Hooks (17):** useAdminActionDialogs, useAdminCommerceConfig, useAdminEmployees, useAdminProducts, useAdminSession, useAdminWorkspace, useAuthFlow, useBakeryLocation, useCart, useCatalog, useChatAssistant, useCheckoutFlow, useCustomerAccount, usePageMetadata, usePolicyRoute, useProductRoute, useStorefrontInteractions.
- **Storage:** `pinkbakes_token` (customer) and `pinkbakes_admin_token` are kept in localStorage. The cart is held in memory only; it is not persisted across reloads, by design.

## User roles
Anonymous visitor · Customer (verified by email or mobile OTP) · Unverified customer (cannot sign in) · Staff admin (`is_staff`; uses `/api/admin/*`) · Delivery employee (admin-managed).

## Main features
Catalogue (search, categories, sizes, eggless option, discounts, stock), product modal with 3D view, cart, checkout (saved addresses, delivery zones and fees, slots, coupons, Razorpay), order history, cancel and tracking, notifications, reviews, chatbot, policy pages, SEO and sitemap.

Admin: dashboard, orders (status workflow), payments, refunds, products, inventory, coupons, customers, delivery, reviews, notifications, site content, reports and CSV exports, settings, zones.

## API surface (93 URL patterns across `catalog` and `accounts`)
- **Accounts** `/api/accounts/`: signup, signin, verify-otp, OTP login, me, logout, forgot and reset password, verify email, notifications.
- **Catalog** `/api/` (also mounted at `/api/catalog/`): categories, products, cart validate, addresses, delivery quote and slots, coupons validate, payments create and verify, orders (list, detail, cancel, tracking), reviews, site content.
- **Admin** `/api/admin/`: login, dashboard, orders and status, payments, refunds, products, inventory, coupons, customers, employees, zones, reviews, notifications, settings, `reports/{summary,users,products,revenue,reviews,product-performance,admin-activity}`, `exports/<entity>`.

## Order status workflow
PENDING → ORDER_CONFIRMED → PREPARING → PACKING → READY_FOR_DELIVERY → DELIVERY_BOY_ASSIGNED → OUT_FOR_DELIVERY → DELIVERED. CANCELLED goes through its own endpoint, with refunds tracked per order.
