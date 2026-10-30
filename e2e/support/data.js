import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const E2E_ROOT = path.resolve(HERE, "..");
export const TMP = process.env.PB_E2E_TMP || path.join(E2E_ROOT, ".tmp");
export const API_URL = `http://127.0.0.1:${process.env.PB_E2E_API_PORT || "8765"}`;
export const SIGNING_SECRET = process.env.PB_E2E_SIGNING_SECRET || "e2e-local-signing-secret";
// Local throw-away test accounts only (must match backend/seed_e2e.py).
export const PASSWORD = process.env.PB_E2E_PASSWORD || "E2e-Local-Only-9431";
export const ADMIN_PASSWORD = process.env.PB_E2E_ADMIN_PASSWORD || "E2e-Admin-Local-7720";

export function meta() {
  return JSON.parse(fs.readFileSync(path.join(TMP, "seed_meta.json"), "utf8"));
}
export const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** Newest OTP written by Django's file-based email backend for this address. */
export function latestOtpFor(email) {
  const dir = path.join(TMP, "mail");
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).map(f => path.join(dir, f)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  for (const f of files) {
    const txt = fs.readFileSync(f, "utf8");
    if (!txt.toLowerCase().includes(email.toLowerCase())) continue;
    const m = txt.match(/\b(\d{6})\b/);
    if (m) return m[1];
  }
  return null;
}
