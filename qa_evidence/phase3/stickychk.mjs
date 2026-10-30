// BUG-028 check: header stays at the top while scrolling, no horizontal overflow,
// phone menu opens under the sticky header with every item reachable, anchors land below it.
import { chromium } from "playwright";
import fs from "fs";
const BASE = process.env.FE || "http://localhost:5173";
const TAG = process.argv[2] || "sticky";
const EV = "/workspace/pinkbakes/ev3/sticky"; fs.mkdirSync(EV, { recursive: true });
const VPS = (process.env.VPS || "320x568,360x800,375x812,390x844,413x880,414x896,480x854,481x854,600x960,601x960,720x1000,721x1000,768x1024,1000x800,1001x800,1023x800,1024x768,1279x800,1280x800,1440x900").split(",").map(s => s.split("x").map(Number));
const SHOTS = new Set((process.env.SHOTS || "320x568,390x844,768x1024,1440x900").split(","));
const out = [];
const b = await chromium.launch();
for (const [w, h] of VPS) {
  const V = `${w}x${h}`;
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: w < 1024 });
  const p = await ctx.newPage(); p.setDefaultTimeout(8000);
  await p.goto(BASE + "/", { waitUntil: "networkidle" }); await p.waitForTimeout(700);
  const rec = { vp: V, positions: [] };
  const maxY = await p.evaluate(() => document.scrollingElement.scrollHeight - innerHeight);
  for (const y of [0, 600, Math.round(maxY / 2), maxY]) {
    await p.evaluate(y => window.scrollTo({ top: y, behavior: "instant" }), y); await p.waitForTimeout(250);
    rec.positions.push(await p.evaluate(() => {
      const hd = document.querySelector(".header").getBoundingClientRect();
      const t = document.elementFromPoint(innerWidth / 2, Math.max(2, hd.height / 2));
      return { y: Math.round(scrollY), top: Math.round(hd.top), h: Math.round(hd.height), onTop: !!t && !!t.closest(".header"),
        sw: document.scrollingElement.scrollWidth, vw: document.documentElement.clientWidth };
    }));
    if (SHOTS.has(V) && y === Math.round(maxY / 2)) await p.screenshot({ path: `${EV}/${TAG}_${V}_midscroll.png` });
  }
  rec.stuck = rec.positions.every(x => x.top === 0 && x.onTop);
  rec.noHOverflow = rec.positions.every(x => x.sw <= x.vw + 1);
  // Phone menu opened mid-page: attached under the header, last item reachable.
  if (await p.locator(".mobile-menu").isVisible()) {
    await p.evaluate(y => window.scrollTo({ top: y, behavior: "instant" }), Math.round(maxY / 2)); await p.waitForTimeout(200);
    await p.click(".mobile-menu"); await p.waitForTimeout(300);
    const last = p.locator(".nav.mobile-visible > *:visible").last();
    await last.scrollIntoViewIfNeeded().catch(() => {});
    rec.menu = await p.evaluate(() => {
      const nav = document.querySelector(".nav.mobile-visible"), hd = document.querySelector(".header").getBoundingClientRect();
      const items = [...nav.children].filter(e => getComputedStyle(e).display !== "none");
      const lastR = items[items.length - 1].getBoundingClientRect(), nr = nav.getBoundingClientRect();
      const t = document.elementFromPoint(lastR.left + lastR.width / 2, lastR.top + lastR.height / 2);
      return { navTop: Math.round(nr.top), headerBottom: Math.round(hd.bottom), navBottom: Math.round(nr.bottom), vh: innerHeight,
        lastInView: lastR.top >= 0 && lastR.bottom <= innerHeight + 1, lastOnTop: !!t && items[items.length - 1].contains(t) };
    });
    rec.menuOk = Math.abs(rec.menu.navTop - rec.menu.headerBottom) <= 1 && rec.menu.lastInView && rec.menu.lastOnTop && rec.menu.navBottom <= rec.menu.vh + 1;
    if (SHOTS.has(V)) await p.screenshot({ path: `${EV}/${TAG}_${V}_menu_midscroll.png` });
    await p.keyboard.press("Escape"); await p.click(".mobile-menu").catch(() => {}); await p.waitForTimeout(200);
  }
  // Anchors (Contact/Gallery) land below the sticky header, not under it.
  await p.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  rec.anchors = {};
  for (const id of ["cakes", "gallery", "contact"]) {
    const ok = await p.evaluate(id => !!document.getElementById(id), id); if (!ok) continue;
    await p.evaluate(id => { const el = document.getElementById(id); const y = el.getBoundingClientRect().top + scrollY - 80; window.scrollTo({ top: y, behavior: "instant" }); }, id);
    await p.waitForTimeout(150);
    rec.anchors[id] = await p.evaluate(id => Math.round(document.getElementById(id).getBoundingClientRect().top - document.querySelector(".header").getBoundingClientRect().bottom), id);
  }
  rec.anchorsOk = Object.values(rec.anchors).every(gap => gap >= -1);
  rec.pass = rec.stuck && rec.noHOverflow && (rec.menuOk !== false) && rec.anchorsOk;
  out.push(rec); console.error(V, rec.pass ? "PASS" : "FAIL");
  await ctx.close();
}
await b.close();
fs.writeFileSync(`${EV}/${TAG}_results.json`, JSON.stringify(out, null, 1));
console.log(out.map(r => `${r.vp} ${r.pass ? "PASS" : "FAIL"} stuck=${r.stuck} noHOverflow=${r.noHOverflow} menu=${r.menuOk ?? "n/a"} anchors=${JSON.stringify(r.anchors)}`).join("\n"));
