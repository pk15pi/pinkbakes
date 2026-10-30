import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// Firebase Hosting serves dist/404.html with HTTP 404 for any path not listed in the
// firebase.json rewrites. It is a copy of index.html, so the app boots and shows its
// branded not-found page (src/components/NotFoundPage.jsx).
const spaNotFoundPage = {
  name: "pinkbakes-404-html",
  apply: "build",
  writeBundle(options) {
    const outDir = options.dir || resolve("dist");
    copyFileSync(resolve(outDir, "index.html"), resolve(outDir, "404.html"));
  },
};

// Build-time sitemap: fetch the live, catalog-driven sitemap from the Django API
// (<VITE_API_URL>/sitemap.xml) so dist/sitemap.xml only lists products that exist.
// On any failure (offline build, API down, unexpected body) keep public/sitemap.xml,
// which lists only the home page -- never stale product URLs.
// Set SITEMAP_SKIP_FETCH=1 to skip the network call.
function liveSitemap(apiBaseUrl) {
  return {
    name: "pinkbakes-live-sitemap",
    apply: "build",
    async writeBundle(options) {
      if (process.env.SITEMAP_SKIP_FETCH === "1" || !apiBaseUrl) return;
      const outDir = options.dir || resolve("dist");
      const url = `${apiBaseUrl.replace(/\/$/, "")}/sitemap.xml`;
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 10000);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        const body = await res.text();
        if (!res.ok || !body.trimStart().startsWith("<?xml") || !body.includes("<urlset")) {
          throw new Error(`unexpected response (HTTP ${res.status})`);
        }
        writeFileSync(resolve(outDir, "sitemap.xml"), body);
        this.info?.(`sitemap.xml generated from ${url}`);
      } catch (err) {
        console.warn(`[pinkbakes-live-sitemap] ${url} failed (${err.message}); keeping fallback public/sitemap.xml (home page only).`);
      }
    },
  };
}

/**
 * PinkBakes Vite config.
 * - appType: "spa" (Vite default) rewrites unknown paths to index.html in
 *   `vite` and `vite preview`, so refresh on /admin-login and /admin works.
 * - API calls use absolute VITE_API_URL from src/config.js -- no /api proxy.
 * - Firebase hosting rewrites only known app routes to /index.html; see firebase.json.
 * - manualChunks: split lucide, react, and three (GLB viewer) for better caching.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiBaseUrl = env.VITE_API_URL || "https://api.pinkbakes.com";
  return {
  plugins: [react(), spaNotFoundPage, liveSitemap(apiBaseUrl)],
  appType: "spa",
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/lucide-react")) {
            return "lucide";
          }
          if (id.includes("node_modules/three")) {
            return "three";
          }
          if (id.includes("node_modules/react-dom") || id.includes("node_modules/react/")) {
            return "react-vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 400,
  },
  };
});