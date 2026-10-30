import { test, expect, asCustomer } from "../support/fixtures.js";
import { apiContext, customerToken } from "../support/api.js";
import { meta } from "../support/data.js";
import { Storefront } from "../support/pages.js";
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

test.describe("N2. Cart API security (phase 11)", () => {
  test.describe.configure({ mode: "serial" });
  test("cart endpoints require auth", async ({ request }) => {
    for (const [m, u] of [["get", "/api/cart/"], ["put", "/api/cart/"], ["delete", "/api/cart/"], ["post", "/api/cart/merge/"]]) {
      const r = await request[m](`${API_URL}${u}`, { data: { items: [] } });
      expect([401, 403], `${m} ${u}`).toContain(r.status());
    }
  });

  test("customers cannot see each other's carts; hostile input is rejected without 500", async () => {
    const id = meta().products["E2E Red Velvet Cake"].id;
    const a = await apiContext(await customerToken("d"));
    const b = await apiContext(await customerToken("a"));
    const put = await a.put("/api/cart/", { data: { items: [{ id, quantity: 1, options: { message: "<img src=x onerror=alert(1)>" } }] } });
    expect(put.status()).toBe(200);
    const other = await (await b.get("/api/cart/")).json();
    expect(JSON.stringify(other.items)).not.toContain("onerror");
    for (const bad of [{ id: "1 OR 1=1", quantity: 1 }, { id, quantity: "1; DROP TABLE x" }, { id, quantity: 1e9 }]) {
      const r = await a.put("/api/cart/", { data: { items: [bad] } });
      expect(r.status()).toBeLessThan(500);
      expect(await r.text()).not.toMatch(/Traceback|File "/);
    }
    await a.delete("/api/cart/");
  });

  test("cart option text is rendered as text, not HTML", async ({ page }) => {
    const token = await customerToken("d");
    const id = meta().products["E2E Red Velvet Cake"].id;
    const a = await apiContext(token);
    await a.put("/api/cart/", { data: { items: [{ id, quantity: 1, options: { message: "<img src=x onerror=window.__xss=1>" } }] } });
    await asCustomer(page, token, { keepServerCart: true });
    let dialog = false;
    page.on("dialog", d => { dialog = true; d.dismiss(); });
    const s = new Storefront(page);
    await s.goto("/");
    await expect(s.cartCount()).toHaveText("1");
    await s.openCart();
    await expect(page.locator("aside img[src='x']")).toHaveCount(0);
    expect(await page.evaluate(() => window.__xss)).toBeUndefined();
    expect(dialog).toBe(false);
    await a.delete("/api/cart/");
  });
});