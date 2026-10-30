// Dev-only Playwright setup for PinkBakes. Runs against an isolated local stack:
// Django on 127.0.0.1:8765 (throw-away SQLite, seeded) + Vite on localhost:5174.
import { defineConfig, devices } from "@playwright/test";

const API_PORT = process.env.PB_E2E_API_PORT || "8765";
const WEB_PORT = process.env.PB_E2E_WEB_PORT || "5174";
export const API_URL = `http://127.0.0.1:${API_PORT}`;
const PY = process.env.PB_E2E_PYTHON || "python";

export const VIEWPORTS = [
  [320, 568], [360, 640], [375, 667], [390, 844], [414, 896], [430, 932],
  [600, 960], [768, 1024], [820, 1180], [1024, 1366],
  [1280, 720], [1366, 768], [1440, 900], [1536, 864],
  [1600, 900], [1920, 1080], [2560, 1440],
];

const functional = { testIgnore: /responsive\.spec\.js/ };

export default defineConfig({
  testDir: "./specs",
  outputDir: "./test-results",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: 0,
  reporter: [
    ["list"],
    ["html", { outputFolder: "reports/html", open: "never" }],
    ["json", { outputFile: "reports/results.json" }],
  ],
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },
  webServer: [
    {
      command: `${PY} backend/run_backend.py --fresh --port ${API_PORT}`,
      url: `${API_URL}/api/categories/`,
      timeout: 120_000,
      reuseExistingServer: !!process.env.PB_E2E_REUSE,
      stdout: "ignore",
      stderr: "pipe",
    },
    {
      command: `npx vite --port ${WEB_PORT} --strictPort --host localhost`,
      cwd: "..",
      url: `http://localhost:${WEB_PORT}/`,
      timeout: 120_000,
      reuseExistingServer: !!process.env.PB_E2E_REUSE,
      env: { VITE_API_URL: API_URL, SITEMAP_SKIP_FETCH: "1" },
      stdout: "ignore",
    },
  ],
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] }, ...functional },
    { name: "firefox", use: { ...devices["Desktop Firefox"] }, ...functional },
    { name: "webkit", use: { ...devices["Desktop Safari"] }, ...functional },
    ...VIEWPORTS.map(([w, h]) => ({
      name: `vp-${w}x${h}`,
      testMatch: /responsive\.spec\.js/,
      use: { ...devices["Desktop Chrome"], viewport: { width: w, height: h }, hasTouch: w < 1024, isMobile: w <= 430 },
    })),
  ],
});
