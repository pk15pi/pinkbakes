# The Cake Haven — Premium React Bakery Store

A polished, responsive React/Vite bakery storefront inspired by the generated premium homepage concept.

## Included

- Premium responsive bakery homepage
- Sticky navigation + mobile menu
- Cake category navigation
- Search and category filters
- Product cards with prices, sizes and ratings
- Product quick-view modal
- Product image gallery
- Image zoom
- Interactive CSS 3D-style cake preview
- Cart drawer with quantity controls
- Checkout-ready cart flow (demo notification)
- Custom cake CTA
- Reviews, gallery, contact and newsletter sections
- Responsive mobile/tablet/desktop layouts
- SEO title/meta description
- No backend required for the demo

## Run locally

Requirements: Node.js 18+

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

For production:

```bash
npm run build
npm run preview
```

The production files are generated in `dist/`.

## Deploy to Hostinger

Run `npm run build`, then upload the contents of `dist/` to your Hostinger static website/public_html directory.

If Hostinger asks for the build/output directory, use:

`dist`

## Connect to Shopify later

This frontend is intentionally separated from the commerce layer. For a real store, replace the demo cart/checkout handler in `src/main.jsx` with Shopify Storefront API, Shopify Buy Button, or a Shopify headless setup.

## Real 3D cake models

The included 3D experience is a lightweight CSS demo so the project works immediately without large model files. For production, replace the preview with a GLB/USDZ model using `<model-viewer>` or Three.js. Shopify also supports 3D product media if you later move the commerce layer to Shopify.

## Replace products

Edit the `products` array near the top of `src/main.jsx`. Replace the image URLs, names, prices, categories and descriptions with your real cake catalogue.

## Design reference

The project follows the premium cream / blush / chocolate / gold visual direction of the generated homepage concept.

## Deploy to Firebase Hosting (pinkbakes.com)

1. Set frontend env (`VITE_API_URL`, `VITE_PUBLIC_SITE_URL=https://pinkbakes.com`) and run `npm run build` (or `npm run deploy:hosting`).
2. Static SEO files under `public/` are copied into `dist/` by Vite and served by Hosting (not the SPA fallback):
   - `public/robots.txt` — `Sitemap: https://pinkbakes.com/sitemap.xml`
   - `public/sitemap.xml` — homepage + published product URLs (snapshot from Django; refresh from `https://api.pinkbakes.com/sitemap.xml` when the catalog changes)
3. Deploy Hosting:

```bash
npm run deploy:hosting
# optional full deploy still includes functions (unused for sitemap unless you re-enable the rewrite):
# npm run deploy
```

`firebase.json` SPA rewrite is `**` → `/index.html` only. Exact files like `/sitemap.xml` and `/robots.txt` in `dist/` take precedence over that rewrite. Keep Django `PUBLIC_SITE_URL=https://pinkbakes.com` so `<loc>` URLs stay correct if you regenerate the snapshot from the API.
