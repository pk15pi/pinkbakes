import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * PinkBakes Vite config.
 * - appType: "spa" (Vite default) rewrites unknown paths to index.html in
 *   `vite` and `vite preview`, so refresh on /admin-login and /admin works.
 * - API calls use absolute VITE_API_URL from src/config.js -- no /api proxy.
 * - Firebase hosting already has SPA rewrites to /index.html for production.
 */
export default defineConfig({
  plugins: [react()],
  appType: "spa",
});
