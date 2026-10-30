import { chromium } from "playwright";
const base = "http://localhost:5173";
const shots = "/workspace/pinkbakes/reports/shots2";
const b = await chromium.launch();
const res = [];
const rec = (name, ok, info="") => { res.push({name, ok, info}); };
async function page(w=1280,h=800){ const c = await b.newContext({viewport:{width:w,height:h}}); const p = await c.newPage(); const errs=[]; p.on("pageerror", e=>errs.push(String(e))); return {c,p,errs}; }

// C: routing
const routes = [
  ["/", false], ["/products/chocolate-truffle-cake", false], ["/privacy", false], ["/terms", false],
  ["/admin", false], ["/admin-login", false], ["/reset-password/abc123", false], ["/verify-email?token=x", false],
  ["/orders/1/tracking", false], ["/?token=abc", false],
  ["/this-page-does-not-exist", true], ["/products/a/b", true], ["/cakes", true], ["/privacy/extra", true],
];
for (const [path, expect404] of routes) {
  const {c,p,errs} = await page();
  await p.goto(base+path, {waitUntil:"networkidle"});
  await p.waitForTimeout(600);
  const nf = await p.locator(".not-found-page").count();
  const robots = await p.evaluate(()=>document.querySelector('meta[name="robots"]')?.content||"");
  const title = await p.title();
  const extra = path.startsWith("/products/chocolate") ? await p.locator(".product-modal h1, .product-modal h2").first().textContent().catch(()=>"") : (path==="/privacy"? await p.locator(".policy-page h1").first().textContent().catch(()=>"") : "");
  rec(`route ${path}`, (nf>0)===expect404 && errs.length===0 && (!expect404 || robots.startsWith("noindex")), `notFound=${nf>0} title="${title}" robots=${robots} ${extra?`content="${extra.trim()}"`:""} errors=${errs.length}`);
  if (path==="/this-page-does-not-exist") {
    await p.screenshot({path:`${shots}/404_desktop.png`});
    await p.locator(".not-found-page button", {hasText:"Browse cakes"}).click();
    await p.waitForTimeout(2500);
    const top = await p.evaluate(()=>Math.round(document.getElementById("cakes").getBoundingClientRect().top));
    rec("404 'Browse cakes' -> home #cakes", (await p.locator(".not-found-page").count())===0 && await p.evaluate(()=>location.pathname)==="/" && Math.abs(top-80)<20, `path=${await p.evaluate(()=>location.pathname)} cakesTop=${top}`);
    await p.goBack(); await p.waitForTimeout(400);
    rec("404 back button re-shows not-found", (await p.locator(".not-found-page").count())===1);
  }
  await c.close();
}
{ const {c,p} = await page(390,844); await p.goto(base+"/nope",{waitUntil:"networkidle"}); await p.waitForTimeout(500); await p.screenshot({path:`${shots}/404_mobile.png`}); await c.close(); }

// C: error boundary (inject a render crash into SiteHeader via request interception; source untouched)
{
  const {c,p} = await page();
  await p.route(/\/src\/components\/SiteHeader\.jsx/, async route => {
    const r = await route.fetch(); let body = await r.text();
    body = body.replace(/function SiteHeader\(([^)]*)\)\s*\{/, (m)=> m + ' throw new Error("QA injected crash");');
    await route.fulfill({response:r, body});
  });
  await p.goto(base+"/", {waitUntil:"networkidle"}); await p.waitForTimeout(800);
  const fb = await p.locator(".error-fallback").count();
  const txt = fb ? await p.locator(".error-fallback h1").textContent() : "";
  await p.screenshot({path:`${shots}/error_boundary.png`});
  rec("ErrorBoundary fallback on render crash", fb===1 && /Something went wrong/.test(txt), `fallback=${fb} h1="${txt}"`);
  await c.close();
}

// B + D: product popup options -> cart
{
  const {c,p,errs} = await page();
  await p.goto(base+"/products/chocolate-truffle-cake", {waitUntil:"networkidle"}); await p.waitForTimeout(800);
  const pm = p.locator(".product-modal");
  await pm.locator(".option-row button", {hasText:"1.5 kg"}).click();
  await pm.locator(".option-row button", {hasText:/^Eggless$/}).click();
  await pm.locator("#cake-message-input").fill("Happy Birthday Riya");
  const d = new Date(Date.now()+3*864e5); const iso = d.toISOString().slice(0,10);
  await pm.locator("#cake-delivery-date").fill(iso);
  await p.screenshot({path:`${shots}/modal_options.png`});
  await pm.locator("button.full").click(); await p.waitForTimeout(500);
  // second line: same cake, different options
  await p.evaluate(()=>{ history.pushState({}, "", "/products/chocolate-truffle-cake"); dispatchEvent(new PopStateEvent("popstate")); }); await p.waitForTimeout(1000);
  await p.locator(".product-modal button.full").click(); await p.waitForTimeout(400);
  await p.locator(".cart-btn").click(); await p.waitForTimeout(600);
  const lines = await p.locator(".cart-item").count();
  const opts = await p.locator(".cart-item .cart-options").allTextContents();
  const prices = await p.locator(".cart-item strong, .cart-summary").allTextContents();
  await p.screenshot({path:`${shots}/cart_options.png`});
  rec("Options shown on cart line; separate lines per option set", lines===2 && opts.some(t=>/1\.5 kg/.test(t)&&/Eggless/.test(t)&&/Happy Birthday Riya/.test(t)), `lines=${lines} options=${JSON.stringify(opts)}`);
  rec("₹ used in cart, no 'Rs.'", prices.join(" ").includes("₹") && !/Rs\.?\s?\d/.test(await p.content()), prices.join(" | ").slice(0,160));
  // past date rejected
  await p.goto(base+"/products/vanilla-dream-birthday-cake", {waitUntil:"networkidle"}); await p.waitForTimeout(800);
  const past = new Date(Date.now()-2*864e5).toISOString().slice(0,10);
  await p.locator("#cake-delivery-date").fill(past);
  await p.locator(".product-modal button.full").click(); await p.waitForTimeout(300);
  rec("Past delivery date rejected in popup", await p.locator(".product-modal .auth-error").count()===1, await p.locator(".product-modal .auth-error").textContent().catch(()=>""));
  rec("no page errors in options flow", errs.length===0, errs.join(";"));
  await c.close();
}
{
  const {c,p} = await page();
  await p.goto(base+"/products/eggless-black-forest-cake", {waitUntil:"networkidle"}); await p.waitForTimeout(800);
  const regular = await p.locator(".product-modal .option-row button", {hasText:"Regular"}).count();
  const note = await p.locator(".product-modal .option-note").textContent().catch(()=>"");
  await p.screenshot({path:`${shots}/modal_eggless_product.png`});
  rec("Eggless product: no Regular/Eggless choice, shows note", regular===0 && /already eggless/.test(note), `regularButtons=${regular} note="${note}"`);
  await c.close();
}
await b.close();
for (const r of res) console.log(r.ok?"PASS":"FAIL", "-", r.name, "::", r.info);
console.log("FAILS:", res.filter(r=>!r.ok).length, "/", res.length);
