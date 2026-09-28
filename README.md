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

1. Set frontend env (`VITE_API_URL`, `VITE_PUBLIC_SITE_URL=https://pinkbakes.com`) and run `npm run build`.
2. Sitemap proxy: copy `functions/.env.example` to `functions/.env` and set `API_ORIGIN` to your Django API origin (no trailing slash). Then `cd functions && npm install`.
3. Deploy Hosting + the `sitemap` function (Blaze plan required for Functions):

```bash
npm run deploy
# or separately:
# npm run deploy:hosting
# npm run deploy:functions
```

`firebase.json` rewrites `/sitemap.xml` to the `sitemap` Cloud Function before the SPA `**` -> `/index.html` fallback. The function GETs `${API_ORIGIN}/sitemap.xml` and returns `application/xml`.

Static `public/robots.txt` is served as a normal Hosting file (not the SPA). Its `Sitemap:` line is `https://pinkbakes.com/sitemap.xml`. Keep Django `PUBLIC_SITE_URL=https://pinkbakes.com` so `<loc>` URLs in the sitemap match the public site.
