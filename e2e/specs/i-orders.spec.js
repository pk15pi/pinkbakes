import { test, expect, asCustomer } from "../support/fixtures.js";
import { Storefront } from "../support/pages.js";
import { customerToken, apiContext, ordersOf, orderOf } from "../support/api.js";
import { meta } from "../support/data.js";

test.describe("I. Order management", () => {
  test("customer sees only own orders in order history", async ({ page }) => {
    await asCustomer(page, await customerToken("a"));
    const s = new Storefront(page);
    await s.goto("/");
    // wait until the session is restored, otherwise the button opens the sign-in dialog
    await expect(page.getByRole("button", { name: /^Signed in as / })).toBeVisible();
    await s.accountButton().click();
    await expect(page.getByRole("heading", { name: "Order history" })).toBeVisible();
    for (const o of (await ordersOf("a")).slice(0, 3)) await expect(page.getByText(o.order_number).first()).toBeVisible();
    for (const o of await ordersOf("b")) await expect(page.getByText(o.order_number)).toHaveCount(0);
  });

  test("IDOR: customer B cannot read, cancel or track A's order", async () => {
    const ctx = await apiContext(await customerToken("b"));
    const aId = (await ordersOf("a"))[0].id;
    expect([403, 404]).toContain((await ctx.get(`/api/orders/${aId}/`)).status());
    expect([403, 404]).toContain((await ctx.post(`/api/orders/${aId}/cancel/`)).status());
    expect([403, 404]).toContain((await ctx.get(`/api/orders/${aId}/tracking/`)).status());
    await ctx.dispose();
  });

  test("unauthenticated order APIs return 401", async ({ request }) => {
    expect((await request.get("http://127.0.0.1:8765/api/orders/")).status()).toBe(401);
  });

  test("delivered/ready orders cannot be cancelled by the customer", async () => {
    const ctx = await apiContext(await customerToken("b"));
    const r = await ctx.post(`/api/orders/${(await orderOf("b", "READY_FOR_DELIVERY")).id}/cancel/`);
    expect(r.status()).toBe(400);
    await ctx.dispose();
  });
});
