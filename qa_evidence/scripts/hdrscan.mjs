import { chromium } from "playwright";
// Header overlap scan across widths: reports brand/actions overlap and truncation.
const url = process.argv[2] || "http://localhost:5173/";
const widths = (process.argv[3]||"320,340,360,375,390,414,430,480,481,520,560,600,640,680,720,721,768,900,1023,1024,1100,1279,1280,1440").split(",").map(Number);
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:320,height:700} });
await p.goto(url, { waitUntil:"networkidle" }); await p.waitForTimeout(800);
for (const w of widths) {
  await p.setViewportSize({ width:w, height:800 }); await p.waitForTimeout(250);
  const r = await p.evaluate(() => {
    const R = s => { const e=document.querySelector(s); if(!e||getComputedStyle(e).display==="none") return null; return e.getBoundingClientRect(); };
    const brand=R(".header .brand"), strong=document.querySelector(".header .brand strong"), acts=[...document.querySelectorAll(".header .header-actions > *")].filter(e=>getComputedStyle(e).display!=="none").map(e=>e.getBoundingClientRect());
    const first = acts.length ? Math.min(...acts.map(a=>a.left)) : 9999;
    const lastR = acts.length ? Math.max(...acts.map(a=>a.right)) : 0;
    const order = R(".header .order-top");
    return { brandR: Math.round(brand.right), actL: Math.round(first), actR: Math.round(lastR), vw: innerWidth,
      nameTrunc: strong.scrollWidth > strong.clientWidth + 1, tagShown: !!R(".header .brand small"), search: !!R(".header .search-toggle"),
      labels: !!R(".header .account-btn .action-label") && getComputedStyle(document.querySelector(".header .account-btn .action-label")).position!=="absolute",
      orderLines: order ? Math.round(order.height) : 0, sw: document.documentElement.scrollWidth };
  });
  const bad = r.brandR > r.actL || r.nameTrunc || r.actR > r.vw || r.sw > r.vw;
  console.log(`${w}\t${bad?"FAIL":"ok"}\t${JSON.stringify(r)}`);
}
await b.close();
