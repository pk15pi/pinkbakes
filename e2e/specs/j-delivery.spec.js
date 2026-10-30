import { test, expect } from "../support/fixtures.js";
import { adminToken, apiContext, orderOf } from "../support/api.js";
import { meta } from "../support/data.js";

test.describe("J. Delivery management", () => {
  test("zone quote: fee 50 below threshold, free above 2000", async ({ request }) => {
    const id = meta().products["E2E Chocolate Truffle Cake"].id;
    const q = async qty => (await request.post("http://127.0.0.1:8765/api/delivery/quote/", { data: { postal_code: "122001", items: [{ id, quantity: qty, options: { size: "1 kg" } }] } })).json();
    expect(Number((await q(1)).delivery_fee)).toBe(50);
    expect(Number((await q(3)).delivery_fee)).toBe(0);
  });

  test("admin status workflow: valid transition ok, skipping steps rejected", async () => {
    const ctx = await apiContext(await adminToken(), true);
    const id = (await orderOf("a", "ORDER_CONFIRMED")).id;
    const skip = await ctx.patch(`/api/admin/orders/${id}/status/`, { data: { status: "DELIVERED" } });
    expect(skip.status()).toBe(400);
    const ok = await ctx.patch(`/api/admin/orders/${id}/status/`, { data: { status: "PREPARING" } });
    expect(ok.status(), await ok.text()).toBe(200);
    await ctx.dispose();
  });

  test("customer token cannot change order status", async () => {
    const { customerToken } = await import("../support/api.js");
    const ctx = await apiContext(await customerToken("a"), true);
    const r = await ctx.patch(`/api/admin/orders/${(await orderOf("a", "PACKING")).id}/status/`, { data: { status: "READY_FOR_DELIVERY" } });
    expect([401, 403]).toContain(r.status());
    await ctx.dispose();
  });
});
