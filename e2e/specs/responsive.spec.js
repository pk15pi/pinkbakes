import { test, expect } from "../support/fixtures.js";
import { meta } from "../support/data.js";

const pages = () => [["home", "/"], ["product", `/products/${meta().products["E2E Chocolate Truffle Cake"].slug}`], ["privacy", "/privacy"], ["admin-login", "/admin-login"]];

test.describe("@responsive layout", () => {
  for (const [name] of [["home"], ["product"], ["privacy"], ["admin-login"]]) {
    test(`${name}: no horizontal overflow, header usable`, async ({ page, viewport }, info) => {
      const path = pages().find(p => p[0] === name)[1];
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, "horizontal overflow px").toBeLessThanOrEqual(1);
      await page.screenshot({ path: `reports/responsive/${info.project.name}-${name}.png`, fullPage: false });
      if (name === "home") {
        await expect(page.getByRole("button", { name: "Open cart" })).toBeVisible();
        if (viewport.width < 1024) {
          const menu = page.getByRole("button", { name: "Menu" });
          await expect(menu).toBeVisible();
          await menu.click();
          await expect(page.getByRole("button", { name: "Cakes", exact: true }).first()).toBeVisible();
          const small = await page.$$eval("header button", bs => bs.filter(b => b.offsetParent).map(b => { const r = b.getBoundingClientRect(); return { n: b.getAttribute("aria-label") || b.textContent.trim(), w: r.width, h: r.height }; }).filter(r => r.w < 40 || r.h < 40));
          info.annotations.push({ type: "touch-targets<40px", description: JSON.stringify(small) });
        }
      }
    });
  }
});
