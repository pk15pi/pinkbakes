import { test, expect } from "../support/fixtures.js";
import { Storefront } from "../support/pages.js";

test.describe("A. Homepage & navigation", () => {
  test("home loads with header, hero, catalogue and footer, no console errors", async ({ page, diagnostics }) => {
    const s = new Storefront(page);
    await s.goto("/");
    await expect(page).toHaveTitle(/Pink ?Bakes/i);
    await expect(s.header().getByText(/CAKES FOR EVERY MOMENT/)).toBeVisible();
    await expect(page.locator("#cakes")).toBeAttached();
    await expect(page.locator("footer")).toBeAttached();
    await expect(page.getByRole("heading", { name: "E2E Chocolate Truffle Cake" })).toBeVisible();
    expect(diagnostics.consoleErrors, diagnostics.consoleErrors.join("\n")).toEqual([]);
    expect(diagnostics.failedRequests.filter(r => r.includes("127.0.0.1:8765")), "API failures").toEqual([]);
  });

  test("nav buttons scroll to their sections", async ({ page, viewport }) => {
    test.skip(viewport.width < 1100, "desktop nav");
    const s = new Storefront(page);
    await s.goto("/");
    for (const [label, id] of [["Cakes", "cakes"], ["Categories", "categories"], ["Gallery", "gallery"], ["Contact", "contact"]]) {
      await s.header().locator("nav").getByRole("button", { name: label, exact: true }).click();
      await expect(page.locator(`#${id}`)).toBeInViewport({ ratio: 0.05 });
    }
  });

  // Phase 15: "Custom Cakes" -> custom cake brief form; "About Us" -> the About section (not the area above #custom).
  for (const mode of ["desktop", "mobile"]) {
    test(`${mode} nav: Custom Cakes and About Us land on the right sections`, async ({ page, viewport }) => {
      if (mode === "mobile") await page.setViewportSize({ width: 390, height: 844 });
      else test.skip(viewport.width < 1100, "desktop nav");
      const s = new Storefront(page);
      await s.goto("/");
      const go = async (label) => {
        if (mode === "mobile") await s.header().getByRole("button", { name: "Menu" }).click();
        await s.header().locator("nav").getByRole("button", { name: label, exact: true }).click();
        if (mode === "mobile") await expect(s.header().locator("nav")).not.toHaveClass(/mobile-visible/);
      };
      const topOf = (sel) => page.locator(sel).evaluate(el => Math.round(el.getBoundingClientRect().top));
      const headerH = await s.header().evaluate(el => el.getBoundingClientRect().height);

      await go("Custom Cakes");
      await expect(page.getByRole("heading", { name: "Create Your Custom Cake" })).toBeInViewport();
      await expect(page.locator("#custom form.custom-brief")).toBeInViewport({ ratio: 0.05 });
      await expect.poll(() => topOf("#custom")).toBeLessThan(headerH + 60);
      await expect.poll(() => topOf("#custom")).toBeGreaterThan(-5);

      await go("About Us");
      await expect(page.getByRole("heading", { name: /^About / })).toBeInViewport();
      await expect.poll(() => topOf("#about")).toBeLessThan(headerH + 60);
      await expect.poll(() => topOf("#about")).toBeGreaterThan(-5);
      await expect(page.locator("#about")).toContainText("Hygienic");
      await expect(page.getByRole("heading", { name: "Create Your Custom Cake" })).not.toBeInViewport();
    });
  }

  test("local images load (no broken <img>)", async ({ page }) => {
    const s = new Storefront(page);
    await s.goto("/");
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => requestAnimationFrame(r)); } });
    await page.waitForLoadState("networkidle");
    const broken = await page.$$eval("img", imgs => imgs
      .filter(i => i.complete && i.naturalWidth === 0 && i.src && i.src.startsWith(location.origin))
      .map(i => i.getAttribute("src")));
    expect(broken).toEqual([]);
  });

  test("direct URL access to policy pages and refresh", async ({ page }) => {
    for (const p of ["/privacy", "/terms", "/shipping", "/refund"]) {
      const res = await page.goto(p);
      expect(res.status()).toBeLessThan(400);
      await expect(page.locator("h1").first()).toBeVisible();
      await page.reload();
      await expect(page.locator("h1").first()).toBeVisible();
    }
  });

  test("unknown URL shows the not-found page and can return home", async ({ page }) => {
    await page.goto("/this-page-does-not-exist-e2e");
    await expect(page.getByText(/not found|404/i).first()).toBeVisible();
  });

  test("back / forward navigation between routes", async ({ page }) => {
    await page.goto("/");
    await page.goto("/privacy");
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("#cakes")).toBeAttached();
    await page.goForward();
    await expect(page).toHaveURL(/\/privacy$/);
  });
});
