import { test as base, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { E2E_ROOT, API_URL } from "./data.js";
import { sign, apiContext } from "./api.js";

const REPORT_DIR = path.join(E2E_ROOT, "reports");
const IGNORED_CONSOLE = [/Download the React DevTools/i, /\[vite\]/i];

// Fake Razorpay Checkout: no network to razorpay.com; signs with the local e2e secret.
const FAKE_RAZORPAY = `
window.Razorpay = function (opts) {
  this.on = function () {};
  this.open = async function () {
    const pid = "pay_e2e_" + Date.now();
    const sig = await window.__pbSign(opts.order_id, pid);
    setTimeout(function () { opts.handler({ razorpay_order_id: opts.order_id, razorpay_payment_id: pid, razorpay_signature: sig }); }, 0);
  };
};`;

export const test = base.extend({
  diagnostics: [async ({ page }, use, testInfo) => {
    const consoleErrors = [];
    const failedRequests = [];
    page.on("console", msg => {
      if (msg.type() !== "error") return;
      const text = msg.text();
      if (IGNORED_CONSOLE.some(re => re.test(text))) return;
      consoleErrors.push(text.slice(0, 500));
    });
    page.on("pageerror", err => consoleErrors.push(`pageerror: ${String(err.message).slice(0, 500)}`));
    page.on("requestfailed", req => {
      const f = req.failure()?.errorText || "";
      if (/ERR_ABORTED|NS_BINDING_ABORTED|cancelled/i.test(f)) return;
      failedRequests.push(`${req.method()} ${req.url()} ${f}`);
    });
    page.on("response", res => {
      if (res.status() >= 500) failedRequests.push(`${res.request().method()} ${res.url()} -> ${res.status()}`);
    });
    // Never reach any real payment gateway / third-party tracker from tests.
    await page.route(/checkout\.razorpay\.com/, route => route.fulfill({ contentType: "application/javascript", body: FAKE_RAZORPAY }));
    await page.route(/(googletagmanager|google-analytics|api\.razorpay\.com)/, route => route.abort());
    // Seed fixture images use the reserved example.test host; serve a 1x1 PNG so engines that log DNS failures (WebKit) stay clean.
    await page.route(/example\.test/, route => route.fulfill({ contentType: "image/png", body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64") }));
    await page.exposeBinding("__pbSign", (_src, orderId, paymentId) => sign(orderId, paymentId));
    const diag = { consoleErrors, failedRequests, get pageErrors() { return consoleErrors.filter(e => e.startsWith("pageerror:")); } };
    await use(diag);
    if (consoleErrors.length || failedRequests.length) {
      fs.mkdirSync(REPORT_DIR, { recursive: true });
      fs.appendFileSync(path.join(REPORT_DIR, "diagnostics.jsonl"), JSON.stringify({
        test: testInfo.titlePath.join(" > "), project: testInfo.project.name, consoleErrors, failedRequests }) + "\n");
      await testInfo.attach("diagnostics", { body: JSON.stringify(diag, null, 2), contentType: "application/json" });
    }
  }, { auto: true }],
});
export { expect, API_URL };

/** Seed localStorage tokens before the app boots. */
export async function asCustomer(page, token, { keepServerCart = false } = {}) {
  // Signed-in carts live on the server; start each test from an empty one.
  if (!keepServerCart) await (await apiContext(token)).delete("/api/cart/");
  await page.addInitScript(t => { localStorage.setItem("pinkbakes_token", t); }, token);
}
export async function asAdmin(page, token) {
  await page.addInitScript(t => { localStorage.setItem("pinkbakes_admin_token", t); }, token);
}
