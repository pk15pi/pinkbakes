// BUG-025: emailed links open a real screen (local only).
import { chromium } from "playwright";
import { FE, API, userToken } from "./common.mjs";
const b = await chromium.launch(); let fails = 0;
const out = (name, ok, info) => { if (!ok) fails++; console.log(`${ok ? "PASS" : "FAIL"} - ${name} :: ${info}`); };
const dlgText = (p) => p.evaluate(() => document.body.innerText.replace(/\s+/g, " "));
{ const p = await b.newPage(); await p.goto(`${FE}/verify-email?token=not-a-real-token`, { waitUntil: "networkidle" }); await p.waitForTimeout(1500);
  const t = await dlgText(p); out("verify link, bad token", p.url() === `${FE}/` && /invalid|expired/i.test(t) && !/Page not found/.test(await p.title()), `url=${p.url()} dialog="${t.slice(0,140)}"`); await p.screenshot({ path: "/workspace/pinkbakes/ev3/email_verify_badtoken.png" }); await p.close(); }
{ const p = await b.newPage(); await p.goto(`${FE}/verify-email`, { waitUntil: "networkidle" }); await p.waitForTimeout(1000);
  const t = await dlgText(p); out("verify link, no token", /incomplete/i.test(t), `dialog="${t.slice(0,120)}"`); await p.close(); }
{ const p = await b.newPage(); await p.goto(`${FE}/orders/1/tracking`, { waitUntil: "networkidle" }); await p.waitForTimeout(1000);
  const t = await dlgText(p); out("tracking link, guest", /sign in to track/i.test(t), `dialog="${t.slice(0,120)}"`); await p.screenshot({ path: "/workspace/pinkbakes/ev3/email_tracking_guest.png" }); await p.close(); }
{ const tok = await userToken(); const r = await fetch(`${API}/api/orders/`, { headers: { Authorization: `Token ${tok}` } }); const j = await r.json(); const list = Array.isArray(j) ? j : (j.results || j.orders || []);
  const id = list[0]?.id; if (!id) { out("tracking link, signed-in customer", false, `no local order (status ${r.status})`); }
  else { const c = await b.newContext(); await c.addInitScript(t => localStorage.setItem("pinkbakes_token", t), tok); const p = await c.newPage(); const reqs = [];
    p.on("request", q => { if (/\/tracking/.test(q.url())) reqs.push(q.url()); });
    await p.goto(`${FE}/orders/${id}/tracking`, { waitUntil: "networkidle" }); await p.waitForTimeout(2500);
    const t = await dlgText(p); out("tracking link, signed-in customer", new RegExp(`PB-QA-0*${id}`).test(t) && /Live delivery/i.test(t) && reqs.length > 0, `order=${id} trackingCalls=${reqs.length} dialog="${t.slice(0,140)}"`);
    await p.screenshot({ path: "/workspace/pinkbakes/ev3/email_tracking_customer.png" }); await c.close(); } }
console.log(`FAILS ${fails}`); await b.close();
