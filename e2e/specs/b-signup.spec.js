import { test, expect } from "../support/fixtures.js";
import { Storefront, AuthDialog } from "../support/pages.js";
import { latestOtpFor, uid, meta } from "../support/data.js";
import { apiContext } from "../support/api.js";

async function openSignup(page) {
  const s = new Storefront(page);
  await s.goto("/");
  await s.openAuth();
  const a = new AuthDialog(page);
  await a.tab("Sign Up").click();
  await expect(page.locator("#auth-dialog-title")).toHaveText("Create your account");
  return a;
}
async function fill(a, f) {
  for (const [label, v] of Object.entries(f)) await a.field(label).fill(v);
}

test.describe("B. Signup", () => {
  test("empty submit is blocked by required fields", async ({ page }) => {
    const a = await openSignup(page);
    await a.submit("Create Account").click();
    expect(await a.field("Username").evaluate(el => el.validity.valueMissing)).toBe(true);
  });

  test("weak / common password is rejected with a message (regression)", async ({ page }) => {
    const a = await openSignup(page);
    const id = uid();
    await fill(a, { "First name": "Weak", "Last name": "Pw", Username: `weak${id}`, Email: `weak${id}@example.test`, "Mobile number": "9811111111", Password: "password123" });
    await a.submit("Create Account").click();
    await expect(a.error()).toContainText(/common|password/i);
    await expect(page.locator("#auth-dialog-title")).toHaveText("Create your account");
  });

  test("duplicate email and invalid mobile are rejected", async ({ page }) => {
    const a = await openSignup(page);
    await fill(a, { "First name": "Dup", "Last name": "User", Username: `dup${uid()}`, Email: meta().customers.a.email, "Mobile number": "9822222222", Password: "Velvet-Sponge-4821" });
    await a.submit("Create Account").click();
    await expect(a.error()).toContainText(/already exists/i);
    await a.field("Email").fill(`ok${uid()}@example.test`);
    await a.field("Mobile number").fill("12ab");
    await a.submit("Create Account").click();
    await expect(a.error()).toContainText(/mobile/i);
  });

  test("new user signs up, verifies with OTP (file mail backend), then signs in", async ({ page }) => {
    const a = await openSignup(page);
    const id = uid();
    const email = `new${id}@example.test`;
    await fill(a, { "First name": "Nina", "Last name": "New", Username: `nina${id}`, Email: email, "Mobile number": "9833333333", Password: "Velvet-Sponge-4821" });
    await a.submit("Create Account").click();
    await expect(page.locator("#auth-dialog-title")).toHaveText("Verify your account");
    let otp = null;
    await expect.poll(() => (otp = latestOtpFor(email)), { timeout: 10_000 }).not.toBeNull();
    // Verify through the public API (mobile OTP stage uses the same endpoint).
    const ctx = await apiContext();
    const r = await ctx.post("/api/accounts/verify-otp/", { data: { email, otp } });
    expect(r.status(), await r.text()).toBe(200);
    const s = await ctx.post("/api/accounts/signin/", { data: { username: `nina${id}`, password: "Velvet-Sponge-4821" } });
    expect(s.status()).toBe(200);
    await ctx.dispose();
  });
});
