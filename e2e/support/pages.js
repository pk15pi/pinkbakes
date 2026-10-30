// Page objects built on accessible roles/labels (no test-only markup needed).
import { expect } from "@playwright/test";

export class Storefront {
  constructor(page) { this.page = page; }
  async goto(path = "/") {
    await this.page.goto(path);
    await expect(this.page.locator("header.header")).toBeVisible();
  }
  header() { return this.page.locator("header.header"); }
  accountButton() { return this.page.getByRole("button", { name: "Open account" }); }
  cartButton() { return this.page.getByRole("button", { name: "Open cart" }); }
  cartCount() { return this.page.locator(".cart-count"); }
  productCard(name) { return this.page.locator(".cake-card, .product-card, article").filter({ has: this.page.getByRole("heading", { name, exact: true }) }).first(); }
  search() { return this.page.locator("#search"); }
  async openAuth() { await this.accountButton().click(); await expect(this.authDialog()).toBeVisible(); }
  authDialog() { return this.page.getByRole("dialog").filter({ has: this.page.locator("#auth-dialog-title") }); }
  async openCart() { await this.cartButton().click(); await expect(this.page.getByRole("heading", { name: "Your Cart", exact: true })).toBeVisible(); }
}

export class AuthDialog {
  constructor(page) { this.page = page; this.d = page.getByRole("dialog").filter({ has: page.locator("#auth-dialog-title") }); }
  tab(name) { return this.d.locator(".auth-toggle").getByRole("button", { name, exact: true }); }
  field(label) { return this.d.getByLabel(label, { exact: true }); }
  submit(name) { return this.d.locator("form").getByRole("button", { name, exact: true }); }
  error() { return this.d.locator(".auth-error"); }
  async signIn(username, password) {
    await this.field("Username").fill(username);
    await this.field("Password").fill(password);
    await this.submit("Sign In").click();
  }
}

export class ProductPage {
  constructor(page) { this.page = page; }
  title() { return this.page.locator(".product-title"); }
  size(label) { return this.page.getByRole("button", { name: label, exact: true }); }
  addToCart() { return this.page.locator("button.btn.primary.full", { hasText: /Add to Cart|Out of Stock/ }); }
  async setDeliveryDate(daysAhead = 2) {
    const d = new Date(Date.now() + daysAhead * 86400000);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    await this.page.locator("#cake-delivery-date").fill(iso);
  }
}

export class AdminPanel {
  constructor(page) { this.page = page; }
  loginDialog() { return this.page.locator(".admin-modal"); }
  async login(username, password) {
    await this.page.getByLabel("Admin username").fill(username);
    await this.page.locator(".admin-modal").getByLabel("Password").fill(password);
    await this.page.locator(".admin-modal form").getByRole("button", { name: /login|sign in/i }).click();
  }
  heading() { return this.page.getByRole("heading", { name: /Dashboard$/ }).first(); }
  nav(label) { return this.page.getByRole("button", { name: label, exact: true }); }
}
