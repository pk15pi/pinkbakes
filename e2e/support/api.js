import { request } from "@playwright/test";
import crypto from "node:crypto";
import { API_URL, PASSWORD, ADMIN_PASSWORD, SIGNING_SECRET, meta } from "./data.js";

export async function apiContext(token) {
  return request.newContext({
    baseURL: API_URL,
    extraHTTPHeaders: token ? { Authorization: `Token ${token}` } : {},
  });
}
export async function customerToken(who = "a") {
  const m = meta();
  const ctx = await apiContext();
  const r = await ctx.post("/api/accounts/signin/", { data: { username: m.customers[who].username, password: PASSWORD } });
  if (!r.ok()) throw new Error(`signin ${who} failed ${r.status()}`);
  const body = await r.json();
  await ctx.dispose();
  return body.token;
}
export async function adminToken() {
  const m = meta();
  const ctx = await apiContext();
  const r = await ctx.post("/api/admin/login/", { data: { username: m.admin.username, password: ADMIN_PASSWORD } });
  if (!r.ok()) throw new Error(`admin login failed ${r.status()}`);
  const body = await r.json();
  await ctx.dispose();
  return body.token;
}
export const sign = (orderId, paymentId) =>
  crypto.createHmac("sha256", SIGNING_SECRET).update(`${orderId}|${paymentId}`).digest("hex");

/** Create + pay an order through the real API (mock gateway signature). */
export async function placePaidOrder(token, items, extra = {}) {
  const ctx = await apiContext(token);
  const me = await (await ctx.get("/api/accounts/me/")).json();
  const addrs = await (await ctx.get("/api/addresses/")).json();
  const list = Array.isArray(addrs) ? addrs : addrs.results || [];
  const r = await ctx.post("/api/payments/create/", { data: { items, address_id: list[0]?.id, customer_email: me.email, ...extra } });
  const info = await r.json();
  if (!r.ok()) { await ctx.dispose(); return { status: r.status(), body: info }; }
  const pid = `pay_e2e_${info.order_id}_${Date.now()}`;
  const v = await ctx.post("/api/payments/verify/", { data: {
    razorpay_order_id: info.payment_order_id, razorpay_payment_id: pid,
    razorpay_signature: sign(info.payment_order_id, pid), amount: info.amount } });
  const out = { status: v.status(), body: await v.json(), info };
  await ctx.dispose();
  return out;
}

/** Orders of a seeded customer (via API, sorted oldest first). */
export async function ordersOf(who) {
  const ctx = await apiContext(await customerToken(who));
  const body = await (await ctx.get("/api/orders/")).json();
  await ctx.dispose();
  return (Array.isArray(body) ? body : body.results).sort((x, y) => x.id - y.id);
}
export async function orderOf(who, status) {
  const o = (await ordersOf(who)).find(x => x.status === status);
  if (!o) throw new Error(`no ${status} order for ${who}`);
  return o;
}
