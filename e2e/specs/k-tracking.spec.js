import { test, expect, asCustomer } from "../support/fixtures.js";
import { customerToken, orderOf } from "../support/api.js";
import { meta } from "../support/data.js";

test.describe("K. Order tracking", () => {
  test("owner sees timeline for a packing order", async ({ page }) => {
    await asCustomer(page, await customerToken("a"));
    const o = await orderOf("a", "PACKING");
    await page.goto(`/orders/${o.id}/tracking`);
    await expect(page.getByText(/Packing/i).first()).toBeVisible();
    await expect(page.getByText(o.order_number).first()).toBeVisible();
  });

  test("other customer gets no tracking data", async ({ page }) => {
    await asCustomer(page, await customerToken("b"));
    const o = await orderOf("a", "PACKING");
    await asCustomer(page, await customerToken("b"));
    await page.goto(`/orders/${o.id}/tracking`);
    await expect(page.getByText(o.order_number)).toHaveCount(0);
  });

  test("invalid order id handled gracefully", async ({ page, diagnostics }) => {
    await asCustomer(page, await customerToken("a"));
    await page.goto("/orders/99999999/tracking");
    await expect(page.locator("body")).not.toBeEmpty();
    expect(diagnostics.pageErrors).toEqual([]);
  });
});
