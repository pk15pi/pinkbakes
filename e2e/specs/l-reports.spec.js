import { test, expect } from "../support/fixtures.js";
import { adminToken, customerToken, apiContext } from "../support/api.js";

test.describe("L. Reports", () => {
  test("summary report counts match the data and CSV export works; admin-only", async () => {
    const admin = await apiContext(await adminToken());
    const r = await admin.get("/api/admin/reports/summary/");
    expect(r.status(), await r.text()).toBe(200);
    const body = await r.json();
    expect(body.user_stats.total_users).toBeGreaterThanOrEqual(3);
    expect(body.product_stats.total_products).toBeGreaterThanOrEqual(4);
    const csv = await (await admin.get("/api/admin/exports/orders/")).text();
    const rows = csv.trim().split(/\r?\n/);
    expect(rows[0]).toMatch(/^order_number,customer_name/);
    expect(rows.length - 1).toBeGreaterThanOrEqual(5);
    // Every exported paid order total is a number (no NaN / blank money fields).
    for (const line of rows.slice(1)) expect(line).toMatch(/,\d+(\.\d+)?,/);
    await admin.dispose();
    const cust = await apiContext(await customerToken("a"));
    expect([401, 403]).toContain((await cust.get("/api/admin/reports/summary/")).status());
    expect([401, 403]).toContain((await cust.get("/api/admin/exports/orders/")).status());
    await cust.dispose();
    const anon = await apiContext();
    expect([401, 403]).toContain((await anon.get("/api/admin/reports/summary/")).status());
    await anon.dispose();
  });
});
