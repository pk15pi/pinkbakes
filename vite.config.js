import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync } from "node:fs";
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

/**
 * PinkBakes Vite config.
 * - appType: "spa" (Vite default) rewrites unknown paths to index.html in
 *   `vite` and `vite preview`, so refresh on /admin-login and /admin works.
 * - API calls use absolute VITE_API_URL from src/config.js -- no /api proxy.
 * - Firebase hosting rewrites only known app routes to /index.html; see firebase.json.
 * - manualChunks: split lucide, react, and three (GLB viewer) for better caching.
 */
export default defineConfig({
  plugins: [react(), spaNotFoundPage],
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
});