import fs from "node:fs";
import path from "node:path";
import { test, expect, asCustomer, asAdmin } from "../support/fixtures.js";
import { ProductPage, Storefront } from "../support/pages.js";
import { adminToken, apiContext, customerToken } from "../support/api.js";
import { meta } from "../support/data.js";

const PHASE = process.env.UIUX_PHASE || "before";
const OUT = path.resolve("reports/uiux", PHASE);
fs.mkdirSync(OUT, { recursive: true });

// In-page checks (no extra dependencies): overflow, WCAG 2.2 target size (24px),
// missing alt / accessible names, text contrast (solid backgrounds), tiny text, heading order.
function audit() {
  const vis = el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && Number(s.opacity) > 0; };
  const name = el => (el.getAttribute("aria-label") || el.getAttribute("title") || el.textContent || el.getAttribute("placeholder") || el.value || "").trim().replace(/\s+/g, " ").slice(0, 40);
  const lbl = el => el.closest("label") || (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)) || el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || el.getAttribute("title");
  const sel = el => el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : "");
  const rgb = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lum = ({ r, g, b }) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const bgOf = el => { for (let e = el; e; e = e.parentElement) { const s = getComputedStyle(e); if (s.backgroundImage !== "none") return null; const c = rgb(s.backgroundColor); if (c && c.a >= 0.9) return c; } return { r: 255, g: 255, b: 255, a: 1 }; };
  const out = { overflowX: document.documentElement.scrollWidth - innerWidth, targets: [], noAlt: [], noName: [], contrast: [], tiny: [], headings: [] };
  const inter = [...document.querySelectorAll("a[href],button,input:not([type=hidden]),select,textarea,[role=button]")].filter(vis);
  for (const el of inter) {
    const r = el.getBoundingClientRect();
    if ((r.width < 24 || r.height < 24) && !["checkbox", "radio"].includes(el.type) && getComputedStyle(el).display !== "inline") out.targets.push(`${sel(el)} "${name(el)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
    if (["INPUT", "SELECT", "TEXTAREA"].includes(el.tagName) ? !lbl(el) : !name(el) && !el.querySelector("img[alt]:not([alt=''])")) out.noName.push(sel(el));
  }
  for (const img of [...document.images].filter(vis)) if (!img.hasAttribute("alt")) out.noAlt.push(img.currentSrc.slice(-60));
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  while (walker.nextNode()) {
    const el = walker.currentNode.parentElement;
    if (!el || seen.has(el) || !walker.currentNode.textContent.trim() || !vis(el)) continue;
    seen.add(el);
    const s = getComputedStyle(el); const fs = parseFloat(s.fontSize);
    if (fs < 11) out.tiny.push(`${sel(el)} ${fs}px "${walker.currentNode.textContent.trim().slice(0, 30)}"`);
    const fg = rgb(s.color); const bg = bgOf(el);
    if (!fg || !bg || el.closest("[disabled],[aria-disabled=true]")) continue;
    const L1 = lum(fg), L2 = lum(bg); const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const large = fs >= 24 || (fs >= 18.66 && Number(s.fontWeight) >= 700);
    if (ratio < (large ? 3 : 4.5)) out.contrast.push(`${sel(el)} ${ratio.toFixed(2)} ${s.color} "${walker.currentNode.textContent.trim().slice(0, 30)}"`);
  }
  let prev = 0;
  for (const h of [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter(vis)) { const l = Number(h.tagName[1]); if (prev && l > prev + 1) out.headings.push(`h${prev}->h${l} "${h.textContent.trim().slice(0, 30)}"`); prev = l; }
  out.h1 = [...document.querySelectorAll("h1")].filter(vis).length;
  for (const k of ["targets", "noAlt", "noName", "contrast", "tiny", "headings"]) out[k] = [...new Set(out[k])];
  return out;
}

async function settle(page) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.addStyleTag({ content: "*,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important;caret-color:transparent!important}" });
}

async function capture(page, info, state) {
  await settle(page);
  const shot = path.join(OUT, `${info.project.name}-${state}.png`);
  await page.screenshot({ path: shot });
  const result = await page.evaluate(audit);
  fs.appendFileSync(path.join(OUT, "audit.jsonl"), JSON.stringify({ vp: info.project.name, state, ...result }) + "\n");
  expect(result.overflowX, `${state} horizontal overflow`).toBeLessThanOrEqual(1);
}

async function addCake(page) {
  await page.goto(`/products/${meta().products["E2E Chocolate Truffle Cake"].slug}`);
  const p = new ProductPage(page);
  await p.size("1 kg").click();
  await p.setDeliveryDate(2);
  await p.addToCart().click();
}

test.describe("UI/UX audit", () => {
  test("home, catalogue, product, policy, 404", async ({ page }, info) => {
    await page.goto("/");
    await capture(page, info, "home");
    await page.locator("#cakes, .catalog, #products").first().scrollIntoViewIfNeeded().catch(() => {});
    await capture(page, info, "catalogue");
    await page.goto(`/products/${meta().products["E2E Chocolate Truffle Cake"].slug}`);
    await expect(page.locator(".product-title")).toBeVisible();
    await capture(page, info, "product");
    await page.goto("/privacy");
    await capture(page, info, "policy");
    await page.goto("/products/does-not-exist-uiux");
    await capture(page, info, "notfound");
  });

  test("auth dialogs", async ({ page }, info) => {
    const s = new Storefront(page);
    await s.goto("/");
    await s.openAuth();
    await capture(page, info, "login");
    const signup = s.authDialog().locator(".auth-toggle").getByRole("button").nth(1);
    await signup.click();
    await capture(page, info, "signup");
  });

  test("cart, checkout, orders (signed in)", async ({ page }, info) => {
    const token = await customerToken("d");
    await (await apiContext(token)).delete("/api/cart/");
    await asCustomer(page, token, { keepServerCart: true });
    await addCake(page);
    const s = new Storefront(page);
    await expect(s.cartCount()).toHaveText("1");
    await s.openCart();
    await capture(page, info, "cart");
    await page.getByRole("button", { name: /Proceed to Checkout/ }).click();
    await expect(page.getByRole("button", { name: "Place Order" })).toBeVisible();
    await capture(page, info, "checkout");
    await page.keyboard.press("Escape");
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await s.accountButton().click();
    await expect(page.getByRole("heading", { name: "Order history" })).toBeVisible();
    await capture(page, info, "orders");
    await (await apiContext(token)).delete("/api/cart/");
  });

  test("admin login and dashboard", async ({ page }, info) => {
    await page.goto("/admin-login");
    await capture(page, info, "admin-login");
    const p2 = await page.context().newPage();
    await asAdmin(p2, await adminToken());
    await p2.goto("/admin");
    await expect(p2.getByRole("heading", { name: /Dashboard$/ }).first()).toBeVisible();
    await capture(p2, info, "admin-dashboard");
  });
});