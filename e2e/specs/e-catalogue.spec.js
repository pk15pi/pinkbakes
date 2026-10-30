import { test, expect } from "../support/fixtures.js";
import { Storefront } from "../support/pages.js";

test.describe("E. Product catalogue", () => {
  test("lists active seeded products with prices and images", async ({ page }) => {
    const s = new Storefront(page);
    await s.goto("/");
    for (const n of ["E2E Chocolate Truffle Cake", "E2E Red Velvet Cake", "E2E Butterscotch Cake"]) {
      await expect(page.getByRole("heading", { name: n, exact: true })).toBeVisible();
    }
    await expect(page.locator("#cakes").getByText(/₹\s?[\d,]+/).first()).toBeVisible();
  });

  test("search filters, and empty search shows a no-results state", async ({ page }) => {
    const s = new Storefront(page);
    await s.goto("/");
    await s.search().fill("Velvet");
    await expect(page.getByRole("heading", { name: "E2E Red Velvet Cake" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "E2E Butterscotch Cake" })).toHaveCount(0);
    await s.search().fill("zzzz-no-such-cake");
    await expect(page.locator("#cakes h3")).toHaveCount(0);
    await expect(page.locator("#cakes").getByText(/no cakes|no results|nothing/i).first()).toBeVisible();
  });

  test("category chip filters products", async ({ page }) => {
    const s = new Storefront(page);
    await s.goto("/");
    await page.locator("#cakes .chip", { hasText: "Anniversary Cakes" }).first().click();
    await expect(page.getByRole("heading", { name: "E2E Red Velvet Cake" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "E2E Butterscotch Cake" })).toHaveCount(0);
  });

  test("out-of-stock product cannot be added", async ({ page }) => {
    const s = new Storefront(page);
    await s.goto("/");
    const btn = page.locator("#cakes").getByRole("button", { name: /out of stock/i }).first();
    await expect(btn).toBeDisabled();
  });

  test("invalid product URL shows a not-found state", async ({ page }) => {
    await page.goto("/products/no-such-cake-e2e");
    await expect(page.getByText(/not found|isn't available|unavailable|no longer/i).first()).toBeVisible();
  });

  test("catalogue API: draft/inactive products are not public", async ({ request }) => {
    const r = await request.get("http://127.0.0.1:8765/api/products/");
    expect(r.ok()).toBeTruthy();
    const body = await r.json();
    const rows = Array.isArray(body) ? body : body.results;
    expect(rows.every(p => p.status === undefined || p.status === "published" || p.status === "active")).toBe(true);
  });
});
