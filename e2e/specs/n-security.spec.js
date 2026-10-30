import { test, expect } from "../support/fixtures.js";
import { API_URL } from "../support/data.js";

test.describe("Security probes (local)", () => {
  test("XSS payload in search is rendered as text", async ({ page }) => {
    let dialog = false;
    page.on("dialog", d => { dialog = true; d.dismiss(); });
    await page.goto("/");
    await page.locator("#search").fill('<img src=x onerror=alert(1)>');
    await page.waitForTimeout(500);
    expect(dialog).toBe(false);
  });

  test("SQL-ish input to search API doesn't 500", async ({ request }) => {
    const r = await request.get(`${API_URL}/api/products/?search=${encodeURIComponent("' OR 1=1 --")}`);
    expect(r.status()).toBeLessThan(500);
  });

  test("API responses carry no stack traces; security headers present", async ({ request }) => {
    const r = await request.get(`${API_URL}/api/orders/abc/`);
    expect(await r.text()).not.toMatch(/Traceback|File \"/);
    const h = (await request.get(`${API_URL}/api/categories/`)).headers();
    expect(h["x-content-type-options"]).toBe("nosniff");
  });

  test("signin is rate-limited or at least never 500s under bursts", async ({ request }) => {
    const statuses = [];
    for (let i = 0; i < 15; i++) statuses.push((await request.post(`${API_URL}/api/accounts/signin/`, { data: { username: "nobody", password: "x" } })).status());
    expect(statuses.every(s => s < 500)).toBe(true);
  });
});
