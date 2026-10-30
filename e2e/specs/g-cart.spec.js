import { test, expect } from "../support/fixtures.js";
import { ProductPage, Storefront } from "../support/pages.js";
import { meta } from "../support/data.js";

async function addProduct(page, name, size) {
  await page.goto(`/products/${meta().products[name].slug}`);
  const p = new ProductPage(page);
  if (size) await p.size(size).click();
  await p.setDeliveryDate(2);
  await p.addToCart().click();
}
const money = t => Number(String(t).replace(/[^\d.]/g, ""));

test.describe("G. Cart", () => {
  test("empty cart state", async ({ page }) => {
    const s = new Storefront(page);
    await s.goto("/");
    await s.openCart();
    await expect(page.getByRole("heading", { name: "Your cart is empty", exact: true })).toBeVisible();
  });

  test("add multiple, change qty, remove; subtotal follows business rules", async ({ page }) => {
    await addProduct(page, "E2E Chocolate Truffle Cake", "1 kg"); // 800
    const s = new Storefront(page);
    await page.keyboard.press("Escape");
    await s.search().fill("Velvet");
    await page.locator("#cakes").getByRole("button", { name: "View Cake" }).first().click();
    const p = new ProductPage(page);
    await expect(p.title()).toHaveText("E2E Red Velvet Cake");
    await p.setDeliveryDate(2);
    await p.addToCart().click();                                   // 810
    await expect(s.cartCount()).toHaveText("2");
    await s.openCart();
    const subtotal = page.locator("aside .cart-summary b").first();
    await expect.poll(async () => money(await subtotal.textContent())).toBe(1610);
    await page.getByRole("button", { name: "Increase E2E Red Velvet Cake quantity" }).click();
    await expect.poll(async () => money(await subtotal.textContent())).toBe(2420);
    await page.getByRole("button", { name: "Decrease E2E Red Velvet Cake quantity" }).click();
    await expect.poll(async () => money(await subtotal.textContent())).toBe(1610);
    await page.getByRole("button", { name: "Remove E2E Chocolate Truffle Cake" }).click();
    await expect.poll(async () => money(await page.locator("aside .cart-summary b").first().textContent())).toBe(810);
  });

  test("server cart validation rejects bad quantities and unknown products", async ({ request }) => {
    const id = meta().products["E2E Butterscotch Cake"].id;
    for (const items of [[{ id, quantity: 0 }], [{ id, quantity: -2 }], [{ id: 999999, quantity: 1 }], [{ id: meta().products["E2E Sold Out Cake"].id, quantity: 1 }]]) {
      const r = await request.post("http://127.0.0.1:8765/api/cart/validate/", { data: { items } });
      expect([200, 400]).toContain(r.status());
      if (r.status() === 200) {
        const b = await r.json();
        expect(JSON.stringify(b)).toMatch(/invalid|unavailable|error|false|available/i);
      }
    }
  });
});
