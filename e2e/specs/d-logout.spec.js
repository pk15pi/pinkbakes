import { test, expect, asCustomer } from "../support/fixtures.js";
import { Storefront, AuthDialog } from "../support/pages.js";
import { customerToken, apiContext } from "../support/api.js";
import { meta, PASSWORD } from "../support/data.js";

test.describe("D. Logout", () => {
  test("sign out clears session; refresh/back stay signed out; token revoked server-side", async ({ page }) => {
    const s = new Storefront(page);
    await s.goto("/");
    await s.openAuth();
    await new AuthDialog(page).signIn(meta().customers.b.username, PASSWORD);
    await expect(s.accountButton()).toContainText("Account");
    await expect(s.accountButton()).toHaveAttribute("title", /^Signed in as /);
    const token = await page.evaluate(() => localStorage.getItem("pinkbakes_token"));
    // Phase 16: sign out lives in the account menu.
    await s.accountButton().click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();
    const dlg = s.authDialog();
    if (await dlg.isVisible()) await page.keyboard.press("Escape");
    await expect(dlg).toBeHidden();
    await expect(s.accountButton()).toContainText("Sign in");
    expect(await page.evaluate(() => localStorage.getItem("pinkbakes_token"))).toBeNull();
    await page.reload();
    await expect(s.accountButton()).toContainText("Sign in");
    await page.goto("/privacy");
    await page.goBack();
    await expect(s.accountButton()).toContainText("Sign in");
    const ctx = await apiContext(token);
    expect((await ctx.get("/api/accounts/me/")).status()).toBe(401);
    await ctx.dispose();
  });

  test("an invalid stored customer token is discarded on load", async ({ page }) => {
    await asCustomer(page, "0000000000000000000000000000000000000000");
    const s = new Storefront(page);
    await s.goto("/");
    await expect(s.accountButton()).toContainText("Sign in");
    await expect.poll(() => page.evaluate(() => localStorage.getItem("pinkbakes_token"))).toBeNull();
  });
});
