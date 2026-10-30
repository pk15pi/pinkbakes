import { test, expect, asCustomer } from "../support/fixtures.js";
import { ProductPage, Storefront } from "../support/pages.js";
import { customerToken, apiContext } from "../support/api.js";
import { meta } from "../support/data.js";

const money = t => Number(String(t).replace(/[^\d.]/g, ""));
async function addVelvet(page) {
  await page.goto(`/products/${meta().products["E2E Red Velvet Cake"].slug}`);
  const p = new ProductPage(page);
  await p.setDeliveryDate(2);
  await p.addToCart().click();
}
function checkout(page) { return page.locator("form").filter({ has: page.getByRole("button", { name: "Place Order" }) }); }

test.describe("H. Checkout (payment mocked)", () => {
  test("guest checkout asks the customer to sign in", async ({ page }) => {
    await addVelvet(page);
    const s = new Storefront(page);
    await s.openCart();
    await page.getByRole("button", { name: /Proceed to Checkout/ }).click();
    await expect(page.locator("#auth-dialog-title, .auth-page-card").first()).toBeVisible();
  });

  test("signed-in checkout: saved address, delivery fee, coupon, place order", async ({ page }) => {
    const token = await customerToken("a");
    await asCustomer(page, token);
    await addVelvet(page);
    const s = new Storefront(page);
    await s.openCart();
    await page.getByRole("button", { name: /Proceed to Checkout/ }).click();
    const f = checkout(page);
    await expect(f).toBeVisible();
    await expect(f.getByText("Saved addresses")).toBeVisible();
    await f.locator('input[type="radio"]').first().check();
    const totalRow = f.locator(".cart-summary div", { hasText: /^\s*Total/ }).locator("b").last();
    await expect(f.locator(".cart-summary div", { hasText: "Delivery" }).locator("b")).toContainText("50");
    await expect.poll(async () => money(await totalRow.textContent())).toBe(860);
    await f.getByLabel("Promo code").fill("E2ESAVE10");
    await f.getByRole("button", { name: "Apply" }).click();
    await expect(f.getByText(/Coupon \(E2ESAVE10\)/)).toBeVisible();
    await expect.poll(async () => money(await totalRow.textContent())).toBe(779);
    await f.getByRole("button", { name: "Place Order" }).click();
    await expect(page.getByRole("heading", { name: "Order Confirmed" })).toBeVisible({ timeout: 20_000 });
    // Server-side truth: newest order of A is paid with the coupon discount applied.
    const ctx = await apiContext(token);
    const list = await (await ctx.get("/api/orders/")).json();
    const rows = Array.isArray(list) ? list : list.results;
    const newest = rows.sort((x, y) => y.id - x.id)[0];
    expect(newest.payment_status).toBe("paid");
    expect(Number(newest.discount_amount)).toBeCloseTo(81, 2);
    expect(Number(newest.total_amount)).toBeCloseTo(779, 2);
    await ctx.dispose();
  });

  test("pincode outside delivery zones is not deliverable", async ({ request }) => {
    const r = await request.post("http://127.0.0.1:8765/api/delivery/quote/", {
      data: { postal_code: "999999", items: [{ id: meta().products["E2E Red Velvet Cake"].id, quantity: 1 }] } });
    expect(r.status()).toBeLessThan(500);
    const b = await r.json();
    expect(b.eligible).toBeFalsy();
  });

  test("payment-create rejects empty cart, unknown address, bad coupon", async () => {
    const token = await customerToken("b");
    const ctx = await apiContext(token);
    expect((await ctx.post("/api/payments/create/", { data: { items: [] } })).status()).toBe(400);
    const items = [{ id: meta().products["E2E Butterscotch Cake"].id, quantity: 1 }];
    expect((await ctx.post("/api/payments/create/", { data: { items, address_id: 999999 } })).status()).toBe(400);
    const addrs = await (await ctx.get("/api/addresses/")).json();
    const list = Array.isArray(addrs) ? addrs : addrs.results;
    expect((await ctx.post("/api/payments/create/", { data: { items, address_id: list[0].id, coupon_code: "NOPE-XYZ" } })).status()).toBe(400);
    await ctx.dispose();
  });

  test("forged payment signature is rejected and order stays unpaid", async () => {
    const token = await customerToken("b");
    const ctx = await apiContext(token);
    const addrs = await (await ctx.get("/api/addresses/")).json();
    const list = Array.isArray(addrs) ? addrs : addrs.results;
    const r = await ctx.post("/api/payments/create/", { data: { items: [{ id: meta().products["E2E Butterscotch Cake"].id, quantity: 1 }], address_id: list[0].id } });
    const info = await r.json();
    const v = await ctx.post("/api/payments/verify/", { data: { razorpay_order_id: info.payment_order_id, razorpay_payment_id: "pay_forged", razorpay_signature: "deadbeef", amount: info.amount } });
    expect(v.status()).toBeGreaterThanOrEqual(400);
    const o = await (await ctx.get(`/api/orders/${info.order_id}/`)).json();
    expect(o.payment_status).not.toBe("paid");
    await ctx.dispose();
  });
});
