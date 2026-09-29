import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * PinkBakes Vite config.
 * - appType: "spa" (Vite default) rewrites unknown paths to index.html in
 *   `vite` and `vite preview`, so refresh on /admin-login and /admin works.
 * - API calls use absolute VITE_API_URL from src/config.js -- no /api proxy.
 * - Firebase hosting already has SPA rewrites to /index.html for production.
 * - manualChunks: split lucide icons from the app shell for better caching.
 */
export default defineConfig({
  plugins: [react()],
  appType: "spa",
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/lucide-react")) {
            return "lucide";
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
