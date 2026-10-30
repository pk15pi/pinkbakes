import { test, expect } from "../support/fixtures.js";
import { ProductPage, Storefront } from "../support/pages.js";
import { meta } from "../support/data.js";

test.describe("F. Product details", () => {
  test("direct product URL renders name, sizes and per-size price", async ({ page }) => {
    const slug = meta().products["E2E Chocolate Truffle Cake"].slug;
    await page.goto(`/products/${slug}`);
    const p = new ProductPage(page);
    await expect(p.title()).toHaveText("E2E Chocolate Truffle Cake");
    await p.size("2 kg").click();
    await expect(page.getByText(/₹\s?1,500/).first()).toBeVisible();
    await p.size("0.5 kg").click();
    await expect(page.getByText(/₹\s?500\b/).first()).toBeVisible();
  });

  test("add to cart with size + date updates cart count", async ({ page }) => {
    const slug = meta().products["E2E Chocolate Truffle Cake"].slug;
    await page.goto(`/products/${slug}`);
    const p = new ProductPage(page);
    await p.size("1 kg").click();
    await p.setDeliveryDate(2);
    await p.addToCart().click();
    await expect(new Storefront(page).cartCount()).toHaveText("1");
  });

  test("discounted product shows discounted price (10% off 900 = 810)", async ({ page }) => {
    await page.goto(`/products/${meta().products["E2E Red Velvet Cake"].slug}`);
    await expect(page.getByText(/810/).first()).toBeVisible();
  });

  test("out-of-stock product detail disables add", async ({ page }) => {
    await page.goto(`/products/${meta().products["E2E Sold Out Cake"].slug}`);
    await expect(new ProductPage(page).addToCart()).toBeDisabled();
  });
});
