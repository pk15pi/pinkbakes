import { test, expect, asCustomer } from "../support/fixtures.js";
import { ProductPage, Storefront } from "../support/pages.js";
import { apiContext, customerToken } from "../support/api.js";
import { meta } from "../support/data.js";

// Phase 10 regressions: cart persistence (re-priced from catalog) and no sign-in flash.
const KEY = "pinkbakes_cart_v1";
const money = t => Number(String(t).replace(/[^\d.]/g, ""));
const subtotal = page => page.locator("aside .cart-summary b").first();

test.describe("P. Cart persistence & session restore", () => {
  test("cart survives reload with server-priced subtotal", async ({ page }) => {
    await page.goto(`/products/${meta().products["E2E Chocolate Truffle Cake"].slug}`);
    const p = new ProductPage(page);
    await p.size("1 kg").click();
    await p.setDeliveryDate(2);
    await p.addToCart().click();
    const s = new Storefront(page);
    await expect(s.cartCount()).toHaveText("1");
    const stored = JSON.parse(await page.evaluate(k => localStorage.getItem(k), KEY));
    expect(stored.v).toBe(1);
    expect(Object.keys(stored.items[0]).sort()).toEqual(["id", "options", "qty"]);
    await page.reload();
    await expect(s.cartCount()).toHaveText("1");
    await s.openCart();
    await expect.poll(async () => money(await subtotal(page).textContent())).toBe(800);
  });

  test("tampered prices ignored; removed, sold-out and junk lines dropped", async ({ page }) => {
    const m = meta();
    const s = new Storefront(page);
    await s.goto("/");
    await page.evaluate(([k, items]) => localStorage.setItem(k, JSON.stringify({ v: 1, items })), [KEY, [
      { id: m.products["E2E Red Velvet Cake"].id, options: null, qty: 2, price: 1, discounted_price: 1 },
      { id: 999999, options: null, qty: 1 },
      { id: m.products["E2E Sold Out Cake"].id, options: null, qty: 1 },
      { bogus: true }, null, "x",
    ]]);
    await page.reload();
    await expect(s.cartCount()).toHaveText("2");
    await s.openCart();
    await expect.poll(async () => money(await subtotal(page).textContent())).toBe(1620);
    await expect(page.locator("aside").getByText("E2E Sold Out Cake")).toHaveCount(0);
    const stored = JSON.parse(await page.evaluate(k => localStorage.getItem(k), KEY));
    expect(stored.items).toHaveLength(1);
    expect(stored.items[0]).not.toHaveProperty("price");
  });

  test("corrupt storage does not break the page", async ({ page, diagnostics }) => {
    const s = new Storefront(page);
    await s.goto("/");
    await page.evaluate(k => localStorage.setItem(k, "{not json"), KEY);
    await page.reload();
    await expect(s.cartCount()).toHaveText("0");
    expect(diagnostics.pageErrors).toEqual([]);
  });

  test("guest cart merges into server cart on sign-in; survives reload and shows in a second browser", async ({ page, browser }) => {
    const token = await customerToken("c");
    await (await apiContext(token)).delete("/api/cart/");
    const slug = meta().products["E2E Chocolate Truffle Cake"].slug;
    await page.goto(`/products/${slug}`);
    const p = new ProductPage(page);
    await p.size("1 kg").click();
    await p.setDeliveryDate(2);
    await p.addToCart().click();
    const s = new Storefront(page);
    await expect(s.cartCount()).toHaveText("1");
    // Sign in (token restored on next load) -> guest copy is merged and removed.
    await page.evaluate(t => localStorage.setItem("pinkbakes_token", t), token);
    await page.reload();
    await expect(page.getByRole("button", { name: /^Signed in as / })).toBeVisible();
    await expect(s.cartCount()).toHaveText("1");
    await expect.poll(() => page.evaluate(k => localStorage.getItem(k), KEY)).toBeNull();
    const server = await (await (await apiContext(token)).get("/api/cart/")).json();
    expect(server.items).toHaveLength(1);
    expect(server.subtotal).toBe("800.00");

    // Quantity change syncs (debounced) and survives a reload.
    await s.openCart();
    await page.locator("aside").getByRole("button", { name: /increase/i }).first().click();
    await expect.poll(async () => (await (await (await apiContext(token)).get("/api/cart/")).json()).count).toBe(2);
    await page.reload();
    await expect(s.cartCount()).toHaveText("2");

    // Second browser context, same customer -> same cart, server-priced.
    const ctx2 = await browser.newContext();
    try {
      const page2 = await ctx2.newPage();
      await asCustomer(page2, token, { keepServerCart: true });
      const s2 = new Storefront(page2);
      await s2.goto("/");
      await expect(s2.cartCount()).toHaveText("2");
      await s2.openCart();
      await expect.poll(async () => money(await subtotal(page2).textContent())).toBe(1600);
    } finally {
      await ctx2.close();
      await (await apiContext(token)).delete("/api/cart/");
    }
  });

  test("account button during session restore does not flash sign-in dialog", async ({ page }) => {
    await asCustomer(page, await customerToken("a"));
    let release;
    const gate = new Promise(r => { release = r; });
    await page.route(/\/api\/accounts\/me\/$/, async route => { await gate; await route.continue(); });
    const s = new Storefront(page);
    await s.goto("/");
    await expect(s.accountButton()).toBeDisabled();
    await s.accountButton().click({ force: true });
    await page.waitForTimeout(300);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    release();
    await expect(page.getByRole("button", { name: /^Signed in as / })).toBeVisible();
    await expect(s.accountButton()).toBeEnabled();
    await s.accountButton().click();
    await expect(page.getByRole("heading", { name: "Order history" })).toBeVisible();
  });
});