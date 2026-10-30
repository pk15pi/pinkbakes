// Phase 16: promo sign-in prompt with field preservation, wishlist (guest -> login merge -> move to cart),
// review stars + admin approval, default delivery date, card button label.
import { test, expect, asCustomer } from "../support/fixtures.js";
import { Storefront, AuthDialog, ProductPage } from "../support/pages.js";
import { customerToken, adminToken, apiContext } from "../support/api.js";
import { meta, PASSWORD, uid } from "../support/data.js";

const localIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const checkout = page => page.locator("form").filter({ has: page.getByRole("button", { name: "Place Order" }) });
const slug = name => meta().products[name].slug;

test.describe("Q. Phase 16", () => {
  test("product detail defaults delivery date to today; cards say Order", async ({ page }) => {
    await page.goto(`/products/${slug("E2E Red Velvet Cake")}`);
    await expect(page.locator("#cake-delivery-date")).toHaveValue(localIso());
    await new Storefront(page).goto("/");
    const card = new Storefront(page).productCard("E2E Chocolate Truffle Cake");
    await expect(card.getByRole("button", { name: "Order", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Choose Size" })).toHaveCount(0);
  });

  test("guest promo prompt: cancel keeps code unapplied; continue signs in, restores fields, applies code", async ({ page }) => {
    const token = await customerToken("b");
    const ctx = await apiContext(token);
    await ctx.delete("/api/cart/");
    await page.goto(`/products/${slug("E2E Red Velvet Cake")}`);
    await new ProductPage(page).addToCart().click();
    const s = new Storefront(page);
    await s.openCart();
    await page.getByRole("button", { name: /Proceed to Checkout/ }).click();
    const f = checkout(page);
    await expect(f).toBeVisible();
    const note = `Ring twice ${uid()}`;
    await f.getByLabel("Order notes").fill(note);
    await f.getByLabel("Full name").fill("Guest Promo Tester");
    await f.getByLabel("City").fill("Promoville");
    await f.getByLabel("Promo code").fill(meta().coupon);
    await f.getByRole("button", { name: "Apply" }).click();
    const prompt = page.getByRole("alertdialog");
    await expect(prompt).toContainText("Please sign in to use promo codes");
    await prompt.getByRole("button", { name: "Cancel" }).click();
    await expect(prompt).toBeHidden();
    await expect(f.getByText(/Coupon \(E2ESAVE10\)/)).toHaveCount(0);
    await expect(f.getByLabel("Promo code")).toHaveValue(meta().coupon);

    await f.getByRole("button", { name: "Apply" }).click();
    await prompt.getByRole("button", { name: "Continue" }).click();
    await expect(s.authDialog()).toBeVisible();
    await new AuthDialog(page).signIn(meta().customers.b.username, PASSWORD);
    const f2 = checkout(page);
    await expect(f2).toBeVisible({ timeout: 15_000 });
    await expect(f2.getByLabel("Order notes")).toHaveValue(note);
    await expect(f2.getByLabel("Promo code")).toHaveValue(meta().coupon);
    await expect(f2.getByText(/Coupon \(E2ESAVE10\)/)).toBeVisible({ timeout: 15_000 });
    const nameField = f2.getByLabel("Full name");
    if (await nameField.isVisible()) await expect(nameField).toHaveValue("Guest Promo Tester");
    await ctx.delete("/api/cart/");
    await ctx.dispose();
  });

  test("wishlist: guest hearts persist locally, merge on login, move to cart, clear on logout", async ({ page }) => {
    const token = await customerToken("b");
    const ctx = await apiContext(token);
    const product = meta().products["E2E Butterscotch Cake"];
    await ctx.delete(`/api/wishlist/items/${product.id}/`);
    await ctx.delete("/api/cart/");
    const s = new Storefront(page);
    await s.goto("/");
    const card = s.productCard("E2E Butterscotch Cake");
    await card.getByRole("button", { name: "Add to wishlist" }).click();
    await expect(card.getByRole("button", { name: "Remove from wishlist" })).toBeVisible();
    await expect.poll(() => page.evaluate(() => localStorage.getItem("pinkbakes_wishlist") || "")).toContain(String(product.id));
    await page.reload();
    await expect(s.productCard("E2E Butterscotch Cake").getByRole("button", { name: "Remove from wishlist" })).toBeVisible();

    await s.openAuth();
    await new AuthDialog(page).signIn(meta().customers.b.username, PASSWORD);
    await expect(s.accountButton()).toHaveAttribute("title", /^Signed in as /);
    await expect.poll(async () => (await (await ctx.get("/api/wishlist/")).json()).items.map(i => i.id)).toContain(product.id);

    await s.accountButton().click();
    await page.getByRole("menuitem", { name: "Wishlist" }).click();
    const section = page.locator("#cart-wishlist");
    await expect(section).toBeVisible();
    await expect(section).toContainText("E2E Butterscotch Cake");
    await section.getByRole("button", { name: "Move E2E Butterscotch Cake to cart" }).click();
    await expect(page.locator(".cart-items")).toContainText("E2E Butterscotch Cake");
    await expect(section).not.toContainText("E2E Butterscotch Cake");
    await expect.poll(async () => (await (await ctx.get("/api/wishlist/")).json()).items.map(i => i.id)).not.toContain(product.id);
    await page.getByRole("button", { name: "Close cart" }).click();
    await s.accountButton().click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();
    await expect(s.accountButton()).toContainText("Sign in");
    expect(await page.evaluate(() => localStorage.getItem("pinkbakes_wishlist"))).toBeFalsy();
    await ctx.delete("/api/cart/");
    await ctx.dispose();
  });

  test("detail-view heart toggles wishlist", async ({ page }) => {
    await page.goto(`/products/${slug("E2E Red Velvet Cake")}`);
    const row = page.locator(".product-title-row");
    await row.getByRole("button", { name: "Add to wishlist" }).click();
    await expect(row.getByRole("button", { name: "Remove from wishlist" })).toBeVisible();
    await row.getByRole("button", { name: "Remove from wishlist" }).click();
    await expect(row.getByRole("button", { name: "Add to wishlist" })).toBeVisible();
  });

  test("reviews: clickable + keyboard stars, pending until admin approves", async ({ page }) => {
    const token = await customerToken("d");
    const product = meta().products["E2E Butterscotch Cake"];
    // Seed gives customer D several DELIVERED Butterscotch orders (one per browser project).
    const admin = await apiContext(await adminToken());
    await asCustomer(page, token, { keepServerCart: true });
    await page.goto(`/products/${slug("E2E Butterscotch Cake")}`);
    const card = page.locator(".modal-gallery .review-form-card");
    const stars = card.getByRole("radiogroup");
    await expect(stars).toBeVisible({ timeout: 15_000 });
    await stars.getByRole("radio", { name: "3 stars" }).click();
    await expect(stars.getByRole("radio", { name: "3 stars" })).toHaveAttribute("aria-checked", "true");
    await page.keyboard.press("ArrowRight");
    await expect(stars.getByRole("radio", { name: "4 stars" })).toHaveAttribute("aria-checked", "true");
    await expect(stars.getByRole("radio", { name: "4 stars" })).toBeFocused();
    await page.keyboard.press("End");
    await expect(stars.getByRole("radio", { name: "5 stars" })).toHaveAttribute("aria-checked", "true");
    await page.keyboard.press("ArrowLeft");
    const comment = `Phase16 review ${uid()}`;
    await card.getByLabel("Your review").fill(comment);
    await card.getByRole("button", { name: "Submit review" }).click();
    await expect(card.getByText("Thanks! Your review will appear after approval.").first()).toBeVisible();
    const list = page.getByRole("list", { name: "Customer reviews" });
    const mine = list.locator("li", { hasText: comment });
    await expect(mine).toContainText("Pending approval");
    // Not public yet.
    const pub = await apiContext();
    const before = await (await pub.get(`/api/products/${product.id}/reviews/?page=1&page_size=50`)).json();
    expect(before.results.map(r => r.comment)).not.toContain(comment);
    const pending = await (await admin.get("/api/admin/reviews/?status=pending")).json();
    const row = (pending.results || pending).find(r => r.comment === comment);
    expect(row.rating).toBe(4);
    expect((await admin.post(`/api/admin/reviews/${row.id}/approve/`, { data: {} })).status()).toBe(200);
    await page.reload();
    await expect(list.locator("li", { hasText: comment })).toBeVisible();
    await expect(list.locator("li", { hasText: comment })).not.toContainText("Pending approval");
    await pub.dispose();
    await admin.dispose();
  });
});
