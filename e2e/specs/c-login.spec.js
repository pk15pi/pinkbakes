import { test, expect } from "../support/fixtures.js";
import { Storefront, AuthDialog } from "../support/pages.js";
import { meta, PASSWORD, uid } from "../support/data.js";
import { apiContext } from "../support/api.js";

test.describe("C. Login", () => {
  test("valid login creates a session that survives refresh", async ({ page }) => {
    const s = new Storefront(page);
    await s.goto("/");
    await s.openAuth();
    await new AuthDialog(page).signIn(meta().customers.a.username, PASSWORD);
    await expect(s.accountButton()).toContainText("Account");
    await expect(s.accountButton()).toHaveAttribute("title", /^Signed in as /);
    expect(await page.evaluate(() => !!localStorage.getItem("pinkbakes_token"))).toBe(true);
    await page.reload();
    await expect(s.accountButton()).toContainText("Account");
    await expect(s.accountButton()).toHaveAttribute("title", /^Signed in as /);
  });

  test("wrong password and unknown user show a generic error", async ({ page }) => {
    const s = new Storefront(page);
    await s.goto("/");
    await s.openAuth();
    const a = new AuthDialog(page);
    await a.signIn(meta().customers.a.username, "Wrong-Password-1");
    await expect(a.error()).toContainText(/invalid username or password/i);
    await a.signIn(`nobody${uid()}`, "Wrong-Password-1");
    await expect(a.error()).toContainText(/invalid username or password/i);
    expect(await page.evaluate(() => localStorage.getItem("pinkbakes_token"))).toBeNull();
  });

  test("empty fields are blocked client-side", async ({ page }) => {
    const s = new Storefront(page);
    await s.goto("/");
    await s.openAuth();
    const a = new AuthDialog(page);
    await a.submit("Sign In").click();
    expect(await a.field("Password").evaluate(el => el.validity.valueMissing)).toBe(true);
  });

  test("unverified account gets the verification message (regression)", async ({ page }) => {
    const id = uid();
    const ctx = await apiContext();
    const r = await ctx.post("/api/accounts/signup/", { data: { first_name: "Un", last_name: "Verified", username: `unv${id}`, email: `unv${id}@example.test`, mobile_number: "9844444444", password: "Velvet-Sponge-4821" } });
    expect(r.status()).toBe(201);
    await ctx.dispose();
    const s = new Storefront(page);
    await s.goto("/");
    await s.openAuth();
    const a = new AuthDialog(page);
    await a.signIn(`unv${id}`, "Velvet-Sponge-4821");
    await expect(page.getByText(/not been verified|verify/i).first()).toBeVisible();
  });

  test("protected route /orders without session does not leak data", async ({ page }) => {
    await page.goto("/orders");
    expect(await page.evaluate(() => localStorage.getItem("pinkbakes_token"))).toBeNull();
    await expect(page.getByText(/PB-\d{8}/)).toHaveCount(0);
  });
});
