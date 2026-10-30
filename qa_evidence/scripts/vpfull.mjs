import { chromium } from "playwright";
import fs from "fs";
import { FE, adminToken, userToken, watch } from "./common.mjs";
const TAG = process.argv[2] || "vp";
const VPS = (process.env.VPS || "320x568,360x800,375x812,390x844,413x880,414x896,480x854,481x854,600x960,601x960,720x1000,721x1000,768x1024,1000x800,1001x800,1023x800,1024x768,1279x800,1280x800,1440x900").split(",").map(s=>s.split("x").map(Number));
const EV = "/workspace/pinkbakes/evidence/vpfull"; fs.mkdirSync(EV, { recursive: true });
const results = [];
const AUDIT = `(() => {
  const vw = document.documentElement.clientWidth, vh = window.innerHeight;
  const sw = document.scrollingElement.scrollWidth;
  const clipped = el => { for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) { const s = getComputedStyle(a); if (s.overflowX !== "visible" || s.overflow.includes("hidden")) return true; } return false; };
  const desc = el => el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\\s+/).slice(0,2).join(".") : "");
  const over = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
    const s = getComputedStyle(el); if (s.visibility === "hidden" || s.display === "none") continue;
    if ((r.right > vw + 1 || r.left < -1) && !clipped(el)) over.push(desc(el) + " [" + Math.round(r.left) + "," + Math.round(r.right) + "]");
  }
  const small = [];
  for (const el of document.querySelectorAll("button, a[href], input:not([type=hidden]), select, [role=button]")) {
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
    if (r.bottom < 0 || r.top > vh) continue;
    const s = getComputedStyle(el); if (s.visibility === "hidden") continue;
    if (r.width < 24 || r.height < 24) small.push(desc(el) + " " + Math.round(r.width) + "x" + Math.round(r.height) + " '" + (el.innerText||el.getAttribute("aria-label")||"").trim().slice(0,20) + "'");
  }
  return { vw, sw, hOverflow: sw > vw + 1, over: over.slice(0, 10), overCount: over.length, small: small.slice(0, 12), smallCount: small.length };
})()`;
async function reachable(page, sel) {
  const loc = page.locator(sel).first();
  if (!(await loc.count())) return { sel, found: false };
  try { await loc.scrollIntoViewIfNeeded({ timeout: 2000 }); } catch {}
  return await loc.evaluate(el => {
    const r = el.getBoundingClientRect(); const vw = document.documentElement.clientWidth, vh = innerHeight;
    const cx = Math.min(Math.max(r.left + r.width / 2, 0), vw - 1), cy = Math.min(Math.max(r.top + r.height / 2, 0), vh - 1);
    const top = document.elementFromPoint(cx, cy);
    const inView = r.left >= -1 && r.right <= vw + 1 && r.top >= -1 && r.bottom <= vh + 1;
    const covered = !(top && (el === top || el.contains(top)));
    let coverer = covered && top ? top.tagName.toLowerCase() + "." + String(top.className).split(" ")[0] : "";
    return { found: true, inView, covered, coverer, rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] };
  }).then(o => ({ sel, ...o }));
}
async function step(ctxName, page, vp, name, fn, sels = []) {
  const rec = { vp: vp.join("x"), ctx: ctxName, name, ok: true };
  try {
    if (fn) await fn();
    await page.waitForTimeout(500);
    rec.audit = await page.evaluate(AUDIT);
    rec.reach = [];
    for (const s of sels) rec.reach.push(await reachable(page, s));
    const bad = rec.audit.hOverflow || rec.reach.some(r => r.found && (!r.inView || r.covered)) || rec.reach.some(r => !r.found);
    rec.flag = bad;
    if (bad) { const f = `${EV}/${TAG}_${vp.join("x")}_${ctxName}_${name}.png`; await page.screenshot({ path: f }); rec.shot = f; }
  } catch (e) { rec.ok = false; rec.err = e.message.split("\n")[0]; try { const f = `${EV}/${TAG}_${vp.join("x")}_${ctxName}_${name}_err.png`; await page.screenshot({ path: f }); rec.shot = f; } catch {} }
  results.push(rec);
}

// Header geometry: brand never overlapped or truncated, visible actions inside the bar and not overlapping.
const HEADER = `(() => {
  const vis = e => e && getComputedStyle(e).display !== "none" && e.getBoundingClientRect().width > 0;
  const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom }; };
  const vw = document.documentElement.clientWidth;
  const brand = document.querySelector(".header .brand"), strong = brand.querySelector("strong"), mark = brand.querySelector(".brand-mark");
  const items = [document.querySelector(".mobile-menu"), mark, strong, ...document.querySelectorAll(".header .header-actions > *")].filter(vis);
  const boxes = items.map(e => ({ n: (e.className && String(e.className).split(" ").slice(-1)[0]) || e.tagName, ...R(e) }));
  const overlaps = [];
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], c = boxes[j];
    if (a.l < c.r - 1 && c.l < a.r - 1 && a.t < c.b - 1 && c.t < a.b - 1) overlaps.push(a.n + "/" + c.n);
  }
  const outside = boxes.filter(x => x.l < -1 || x.r > vw + 1).map(x => x.n);
  // Logo pixels on top: the element at the centre of mark and name must be the brand itself.
  const onTop = e => { const r = e.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!t && (e === t || e.contains(t) || brand.contains(t)); };
  return {
    overlaps, outside,
    nameTruncated: strong.scrollWidth > strong.clientWidth + 1,
    logoOnTop: onTop(mark) && onTop(strong),
    search: vis(document.querySelector(".header .search-toggle")),
    account: vis(document.querySelector(".header .account-btn")),
    cart: vis(document.querySelector(".header .cart-btn")),
    orderInBar: vis(document.querySelector(".header .order-top")),
  };
})()`;
// Floats: same bottom line and height, equal edge gaps, neither covers the hero buttons.
const FLOATS = `(() => {
  const vis = e => e && getComputedStyle(e).display !== "none" && parseFloat(getComputedStyle(e).opacity) > 0.5 && e.getBoundingClientRect().width > 0;
  const a = document.querySelector(".auth-float-badge"), c = document.querySelector(".chatbot-launch");
  const vw = document.documentElement.clientWidth;
  const out = { auth: vis(a), chat: vis(c) };
  if (out.auth) { const r = a.getBoundingClientRect(); out.authBox = [Math.round(r.left), Math.round(r.bottom), Math.round(r.height)]; }
  if (out.chat) { const r = c.getBoundingClientRect(); out.chatBox = [Math.round(vw - r.right), Math.round(r.bottom), Math.round(r.height)]; }
  if (out.auth && out.chat) {
    out.sameBottom = Math.abs(out.authBox[1] - out.chatBox[1]) <= 1;
    out.sameHeight = Math.abs(out.authBox[2] - out.chatBox[2]) <= 1;
    out.sameEdge = Math.abs(out.authBox[0] - out.chatBox[0]) <= 1;
  }
  const covered = [];
  for (const b of document.querySelectorAll(".hero-buttons .btn")) {
    const r = b.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) continue;
    for (const [x, y] of [[r.left + 4, r.top + r.height / 2], [r.right - 4, r.top + r.height / 2], [r.left + r.width / 2, r.top + r.height / 2]]) {
      if (y < 0 || y > innerHeight - 1) continue;
      const t = document.elementFromPoint(x, y);
      if (t && !(b === t || b.contains(t))) covered.push(b.innerText.trim() + " by " + t.tagName.toLowerCase() + "." + String(t.className).split(" ")[0]);
    }
  }
  out.heroCovered = covered;
  return out;
})()`;
async function waitScrollSettled(p, max = 4000) {
  let last = -1, stable = 0;
  for (let t = 0; t < max; t += 100) {
    const y = await p.evaluate(() => window.scrollY);
    stable = Math.abs(y - last) < 1 ? stable + 1 : 0; last = y;
    if (stable >= 4) return; await p.waitForTimeout(100);
  }
}
function push(vp, ctx, name, data, flag) { results.push({ vp: vp.join("x"), ctx, name, ...data, flag }); }
async function shot(p, name) { await p.screenshot({ path: `${EV}/${TAG}_${name}.png` }); }
async function openOrderNow(p) {
  if (await p.locator(".header .order-top").isVisible()) return p.click(".header .order-top");
  await p.click(".mobile-menu"); await p.click(".nav.mobile-visible .nav-order");
}
const KEY = new Set((process.env.SHOTS || "320x568,360x800,375x812,390x844,414x896,768x1024,1024x768,1280x800,1440x900").split(","));
const b = await chromium.launch();
const at = await adminToken(); const ut = await userToken();
for (const vp of VPS) {
  const [w, h] = vp; const key = KEY.has(vp.join("x")); const V = vp.join("x");
  { const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: w < 1024 });
    const p = await ctx.newPage(); p.setDefaultTimeout(6000); const errs = []; watch(p, errs);
    await p.goto(FE + "/", { waitUntil: "networkidle" }); await p.waitForTimeout(900);
    await step("guest", p, vp, "home", null, [".header .cart-btn", ".header .account-btn", ".header .brand"]);
    const hd = await p.evaluate(HEADER);
    push(vp, "guest", "header", hd, hd.overlaps.length > 0 || hd.outside.length > 0 || hd.nameTruncated || !hd.logoOnTop || !hd.search || !hd.account || !hd.cart);
    let fl = await p.evaluate(FLOATS);
    // Floats at load: may be faded on phones while the hero buttons are in the bottom strip.
    push(vp, "guest", "floats_top", fl, fl.heroCovered.length > 0);
    if (key) await shot(p, `${V}_home_top`);
    await p.evaluate(() => window.scrollTo(0, Math.round(innerHeight * 1.6))); await p.waitForTimeout(600);
    fl = await p.evaluate(FLOATS);
    const expectAuth = !(w >= 721 && w <= 1023);
    push(vp, "guest", "floats_scrolled", fl, !fl.chat || (expectAuth && (!fl.auth || !fl.sameBottom || !fl.sameHeight || !fl.sameEdge)) || (!expectAuth && fl.auth));
    if (key) await shot(p, `${V}_home_scrolled`);
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300);
    // Search: header icon must focus the catalog search box and bring it into view, uncovered.
    await step("guest", p, vp, "search", async () => { await p.click(".header .search-toggle"); await waitScrollSettled(p); }, ["#search"]);
    const sf = await p.evaluate(() => document.activeElement && document.activeElement.id === "search");
    results[results.length - 1].focused = sf; if (!sf) results[results.length - 1].flag = true;
    if (key) await shot(p, `${V}_search`);
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300);
    const menuVisible = await p.locator(".mobile-menu").isVisible();
    if (menuVisible) {
      await step("guest", p, vp, "mobile_menu_open", () => p.click(".mobile-menu"), [".nav.mobile-visible button:has-text('Contact')", ".nav.mobile-visible button:has-text('Home')"]);
      const needOrder = !(await p.locator(".header .order-top").isVisible());
      if (needOrder) { const r = await reachable(p, ".nav.mobile-visible .nav-order"); results[results.length - 1].menuOrderNow = r; if (!r.found || !r.inView || r.covered) results[results.length - 1].flag = true; }
      if (key) await shot(p, `${V}_menu`);
      await step("guest", p, vp, "mobile_menu_contact", async () => { await p.click(".nav.mobile-visible button:has-text('Contact')"); await waitScrollSettled(p); });
      const st = await p.evaluate(() => ({ menuOpen: !!document.querySelector(".nav.mobile-visible"), top: Math.round(document.getElementById("contact").getBoundingClientRect().top) }));
      results[results.length - 1].navCheck = st; if (st.menuOpen) results[results.length - 1].flag = true;
    } else {
      for (const [label, id] of [["Cakes","cakes"],["Gallery","gallery"],["Contact","contact"],["Home","home"]]) {
        await p.click(`.nav button:has-text('${label}')`); await waitScrollSettled(p);
        const r = await p.evaluate(i => ({ top: Math.round(document.getElementById(i).getBoundingClientRect().top), atMax: Math.abs(scrollY - (document.documentElement.scrollHeight - innerHeight)) < 2 }), id);
        push(vp, "guest", `nav_${label}`, { navTop: r.top, atMax: r.atMax }, !(r.atMax || (r.top >= 60 && r.top <= 100) || (id === "home" && r.top >= 0 && r.top <= 100)));
      }
    }
    await p.evaluate(() => window.scrollTo(0, 0)); await p.goto(FE + "/", { waitUntil: "networkidle" }); await p.waitForTimeout(600);
    await p.evaluate(() => document.getElementById("cakes").scrollIntoView()); await p.waitForTimeout(600);
    await step("guest", p, vp, "product_listing", null, [".product-card button:has-text('Add to Cart')"]);
    if (key) await shot(p, `${V}_listing`);
    await step("guest", p, vp, "product_modal", async () => { await p.locator(".product-card .btn.secondary.small, button:has-text('View Cake')").first().click(); await p.waitForSelector(".product-modal"); }, [".product-modal .modal-close", ".product-modal .option-row button", ".product-modal button:has-text('Add to Cart')"]);
    if (key) await shot(p, `${V}_product_modal`);
    await p.keyboard.press("Escape"); await p.waitForTimeout(300);
    if (await p.locator(".product-modal").count()) await p.locator(".product-modal .modal-close").click();
    await p.locator(".product-card button:has-text('Add to Cart')").first().click(); await p.waitForTimeout(300);
    await step("guest", p, vp, "cart_drawer", async () => { await p.click(".header .cart-btn"); await p.waitForSelector(".cart-drawer.open"); }, [".drawer-head button", ".cart-summary .btn.primary", ".cart-item .qty button"]);
    if (key) await shot(p, `${V}_cart_drawer`);
    await p.click(".drawer-head button").catch(() => {});
    await step("guest", p, vp, "auth_dialog", async () => { await p.click(".header .account-btn"); await p.waitForSelector(".auth-page-card"); }, [".auth-page-card button[type=submit]", ".auth-page-card .auth-close"]);
    await p.keyboard.press("Escape"); await p.locator(".auth-page-card .auth-close").click().catch(() => {});
    await p.evaluate(() => window.scrollTo(0, Math.round(innerHeight * 1.6))); await p.waitForTimeout(500);
    await step("guest", p, vp, "chatbot", async () => { await p.locator(".chatbot-launch").first().click(); await p.waitForSelector(".chatbot-panel"); }, [".chatbot-close", ".chatbot-panel input, .chatbot-panel textarea"]);
    await p.goto(FE + "/this-page-does-not-exist", { waitUntil: "networkidle" }); await p.waitForTimeout(400);
    await step("guest", p, vp, "not_found", null, [".not-found-page h1", ".not-found-page button:has-text('Go to homepage')", ".not-found-page button:has-text('Browse cakes')"]);
    if (key) await shot(p, `${V}_404`);
    await p.goto(FE + "/privacy", { waitUntil: "networkidle" });
    await step("guest", p, vp, "policy", null, [".policy-page button"]);
    results.push({ vp: V, ctx: "guest", name: "console", errors: errs.slice(0, 8), flag: errs.length > 0 });
    await ctx.close(); }
  { const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: w < 1024 });
    await ctx.addInitScript(`localStorage.setItem("pinkbakes_token","${ut}")`);
    const p = await ctx.newPage(); p.setDefaultTimeout(6000); const errs = []; watch(p, errs);
    await p.goto(FE + "/", { waitUntil: "networkidle" }); await p.waitForTimeout(800);
    await p.evaluate(() => document.getElementById("cakes").scrollIntoView()); await p.waitForTimeout(400);
    await p.locator(".product-card button:has-text('Add to Cart')").first().click(); await p.waitForTimeout(300);
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300);
    // Checkout form layout only; nothing is submitted and the payment gateway is not exercised (N/A).
    await step("customer", p, vp, "checkout", async () => { await openOrderNow(p); await p.waitForSelector("form.auth-form"); }, ["button[aria-label='Close checkout']", "form.auth-form button[type=submit]"]);
    if (key) await shot(p, `${V}_checkout`);
    await p.click("button[aria-label='Close checkout']").catch(() => {});
    await step("customer", p, vp, "orders", async () => { await p.click(".header .account-btn"); await p.waitForTimeout(800); }, []);
    results.push({ vp: V, ctx: "customer", name: "console", errors: errs.slice(0, 8), flag: errs.length > 0 });
    await ctx.close(); }
  { const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: w < 1024 });
    await ctx.addInitScript(`localStorage.setItem("pinkbakes_admin_token","${at}")`);
    const p = await ctx.newPage(); p.setDefaultTimeout(6000); const errs = []; watch(p, errs);
    await p.goto(FE + "/admin", { waitUntil: "networkidle" }); await p.waitForTimeout(1000);
    await step("admin", p, vp, "admin_home", null, []);
    if (key) await shot(p, `${V}_admin`);
    const tabs = await p.locator(".admin-panel-tabs button, .admin-tabs button").allInnerTexts().catch(() => []);
    for (const t of tabs) { if (/logout/i.test(t)) continue;
      await step("admin", p, vp, "tab_" + t.trim().replace(/\W+/g, ""), async () => { await p.locator(`button:text-is("${t.trim()}")`).first().click(); await p.waitForTimeout(600); }, []); }
    results.push({ vp: V, ctx: "admin", name: "console", errors: errs.slice(0, 8), flag: errs.length > 0 });
    await ctx.close(); }
  console.error("done", V); fs.writeFileSync(`/workspace/pinkbakes/${TAG}_results.json`, JSON.stringify(results, null, 1));
}
fs.writeFileSync(`/workspace/pinkbakes/${TAG}_results.json`, JSON.stringify(results, null, 1));
await b.close();
