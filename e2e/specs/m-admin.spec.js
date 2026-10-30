import { test, expect, asAdmin, asCustomer } from "../support/fixtures.js";
import { AdminPanel, Storefront } from "../support/pages.js";
import { adminToken, customerToken, apiContext } from "../support/api.js";
import { meta, ADMIN_PASSWORD } from "../support/data.js";

test.describe("M. Admin panel", () => {
  test("admin logs in via /admin-login and sees dashboard sections", async ({ page }) => {
    const a = new AdminPanel(page);
    await page.goto("/admin-login");
    await a.login(meta().admin.username, ADMIN_PASSWORD);
    await expect(a.heading()).toBeVisible();
    for (const sec of ["Orders", "Products", "Coupons", "Customers", "Reports"]) {
      await a.nav(sec).click();
      await expect(page.getByRole("heading", { level: 3 }).first()).toBeVisible();
    }
  });

  test("REGRESSION BUG-012: stored admin token on storefront does not open the admin panel", async ({ page }) => {
    await asAdmin(page, await adminToken());
    await new Storefront(page).goto("/");
    await expect(page.locator("#cakes")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Dashboard$/ })).toHaveCount(0);
  });

  test("REGRESSION CRITICAL: admin email login with wrong password is rejected", async ({ request }) => {
    const r = await request.post("http://127.0.0.1:8765/api/admin/login/", { data: { username: meta().admin.email, password: "Definitely-Wrong-1" } });
    expect(r.status()).toBe(401);
  });

  test("customer cannot access admin APIs or panel", async ({ page }) => {
    const ctx = await apiContext(await customerToken("a"), true);
    for (const p of ["/api/admin/dashboard/", "/api/admin/orders/", "/api/admin/customers/"]) {
      expect([401, 403], p).toContain((await ctx.get(p)).status());
    }
    await ctx.dispose();
    await asCustomer(page, await customerToken("a"));
    await page.goto("/admin");
    await expect(page.getByRole("button", { name: "Customers", exact: true })).toHaveCount(0);
  });

  test("admin logout clears token", async ({ page }) => {
    await asAdmin(page, await adminToken());
    await page.goto("/admin");
    await page.getByRole("button", { name: "Logout" }).click();
    await expect.poll(() => page.evaluate(() => localStorage.getItem("pinkbakes_admin_token"))).toBeNull();
  });
});
