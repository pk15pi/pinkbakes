import { chromium } from "playwright";
const b = await chromium.launch(); let fails = 0;
for (const [w, h] of [[320,568],[360,800],[375,812],[390,844],[414,896],[768,1024],[1024,768],[1280,800],[1440,900]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: w < 1024 });
  await p.goto("http://localhost:5173/", { waitUntil: "networkidle" }); await p.waitForTimeout(800);
  await p.locator(".header .search-toggle").click();
  let last = -1; for (let i = 0; i < 40; i++) { await p.waitForTimeout(150); const y = await p.evaluate(() => scrollY); if (y === last) break; last = y; }
  await p.waitForTimeout(600);
  const r = await p.evaluate(() => {
    const s = document.getElementById("search"), box = s.closest(".searchbox").getBoundingClientRect();
    const hdr = document.querySelector(".header").getBoundingClientRect();
    const hit = (el) => { if (!el) return false; const st = getComputedStyle(el.closest(".auth-float,.chatbot-dock") || el); const q = el.getBoundingClientRect(); return st.opacity !== "0" && q.width > 0 && !(q.right <= box.left || q.left >= box.right || q.bottom <= box.top || q.top >= box.bottom); };
    return { focused: document.activeElement === s, top: Math.round(box.top), bottom: Math.round(box.bottom), hdr: Math.round(hdr.bottom), inView: box.top >= hdr.bottom && box.bottom <= innerHeight,
      coveredByFloat: hit(document.querySelector(".auth-float-badge")) || hit(document.querySelector(".chatbot-launch")) };
  });
  const ok = r.focused && r.inView && !r.coveredByFloat; if (!ok) fails++;
  console.log(JSON.stringify({ vp: `${w}x${h}`, ok, ...r }));
  await p.screenshot({ path: `/workspace/pinkbakes/evidence/vpfull/vp_after_${w}x${h}_search.png` });
  await p.close();
}
console.log("FAILS", fails); await b.close();
