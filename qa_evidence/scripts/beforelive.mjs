import { chromium } from "playwright";
import fs from "fs";
// BEFORE evidence from the live site (read-only page loads and scrolling; no clicks that change data).
const EV = "/workspace/pinkbakes/evidence/vpfull"; fs.mkdirSync(EV, { recursive: true });
const VPS = "320x568,360x800,375x812,390x844,414x896,768x1024,1024x768,1280x800,1440x900".split(",").map(s => s.split("x").map(Number));
const b = await chromium.launch(); const out = [];
for (const [w, h] of VPS) {
  const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: w < 1024 });
  await p.goto("https://pinkbakes.com/", { waitUntil: "networkidle" }); await p.waitForTimeout(1500);
  await p.screenshot({ path: `${EV}/before_live_${w}x${h}_home_top.png` });
  const g = await p.evaluate(() => {
    const vis = e => e && getComputedStyle(e).display !== "none" && e.getBoundingClientRect().width > 0;
    const s = document.querySelector(".header .brand strong"); const a = document.querySelector(".auth-float-badge"), c = document.querySelector(".chatbot-launch");
    const ra = a && a.getBoundingClientRect(), rc = c && c.getBoundingClientRect();
    return { nameTruncated: s.scrollWidth > s.clientWidth + 1, search: vis(document.querySelector(".header .search-toggle")),
      auth: ra ? [Math.round(ra.left), Math.round(ra.bottom), Math.round(ra.height)] : null, chat: rc ? [Math.round(innerWidth - rc.right), Math.round(rc.bottom), Math.round(rc.height)] : null };
  });
  out.push({ vp: `${w}x${h}`, ...g }); console.log(JSON.stringify(out[out.length - 1]));
  await p.evaluate(() => window.scrollTo(0, Math.round(innerHeight * 1.6))); await p.waitForTimeout(800);
  await p.screenshot({ path: `${EV}/before_live_${w}x${h}_home_scrolled.png` });
  await p.close();
}
fs.writeFileSync("/workspace/pinkbakes/before_live_results.json", JSON.stringify(out, null, 1));
await b.close();
