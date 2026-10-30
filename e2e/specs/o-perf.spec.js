import { test, expect } from "../support/fixtures.js";
import fs from "node:fs";
import { API_URL } from "../support/data.js";

test("performance: home load + API timings recorded", async ({ page, request }) => {
  const t0 = Date.now();
  await page.goto("/", { waitUntil: "load" });
  const load = Date.now() - t0;
  const nav = await page.evaluate(() => JSON.stringify(performance.getEntriesByType("navigation")[0]));
  const api = {};
  for (const p of ["/api/categories/", "/api/products/", "/api/site-content/"]) {
    const s = Date.now(); await request.get(API_URL + p); api[p] = Date.now() - s;
  }
  fs.mkdirSync("reports", { recursive: true });
  fs.appendFileSync("reports/perf.jsonl", JSON.stringify({ browser: test.info().project.name, load, nav: JSON.parse(nav), api }) + "\n");
  expect(load).toBeLessThan(15_000);
  for (const v of Object.values(api)) expect(v).toBeLessThan(3000);
});
