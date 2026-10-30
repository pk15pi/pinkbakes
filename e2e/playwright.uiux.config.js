// Dev-only UI/UX audit run: screenshots + lightweight a11y/layout checks at all viewports.
// Usage: UIUX_PHASE=before|after npx playwright test -c playwright.uiux.config.js
import base, { VIEWPORTS } from "./playwright.config.js";
import { devices } from "@playwright/test";

export default {
  ...base,
  testDir: "./uiux",
  reporter: [["line"]],
  projects: VIEWPORTS.map(([w, h]) => ({
    name: `vp-${w}x${h}`,
    use: { ...devices["Desktop Chrome"], viewport: { width: w, height: h }, hasTouch: w < 1024, isMobile: w <= 430 },
  })),
};