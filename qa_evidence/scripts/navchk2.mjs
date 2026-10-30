import { chromium } from "playwright";
// Bug 021 check: after clicking a header nav link on a fresh page (lazy images not yet loaded),
// the section top should sit just under the sticky header (~80px from viewport top).
const base = process.env.BASE || "http://localhost:5173/";
const b = await chromium.launch();
const out = [];
for (const [w,h] of [[1280,800],[1366,768],[1440,900],[1920,1080],[390,844]]) {
  for (const [id,label] of [["gallery","Gallery"],["about","About Us"],["custom","Custom Cakes"],["cakes","Cakes"]]) {
    const ctx = await b.newContext({ viewport:{width:w,height:h} });
    const p = await ctx.newPage();
    const cdp = await ctx.newCDPSession(p);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", { offline:false, latency:150, downloadThroughput: 1.5*1024*1024/8, uploadThroughput: 750*1024/8 });
    await p.goto(base, { waitUntil:"domcontentloaded" });
    await p.waitForSelector(".header", { timeout: 30000 });
    await p.waitForTimeout(1500);
    if (w <= 1023) await p.locator(".mobile-menu").click();
    await p.locator(".header nav button", { hasText: label }).filter({ hasText: new RegExp(`^${label}$`) }).first().click();
    await p.waitForTimeout(4000);
    const r = await p.evaluate((i)=>({top:Math.round(document.getElementById(i)?.getBoundingClientRect().top), header:Math.round(document.querySelector(".header").getBoundingClientRect().height), y:Math.round(scrollY)}), id);
    out.push({w, id, ...r, ok: Math.abs(r.top - 80) <= 12 || Math.abs(r.top - r.header) <= 12});
    await ctx.close();
  }
}
await b.close();
for (const o of out) console.log(JSON.stringify(o));
console.log("FAIL count", out.filter(o=>!o.ok).length, "of", out.length);
