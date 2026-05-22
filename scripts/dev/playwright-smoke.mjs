#!/usr/bin/env node
// playwright-smoke.mjs
//
// Quick smoke test pentru stack-ul dev local.
// Verifica:
//   - homepage :8000 (HTTP 200, contine "ARDmag" sau categoria principala)
//   - PDP exemplu (primul produs din /produse)
//   - admin login pe :9000/app
//   - store API /store/products cu publishable key (return 200 + products array)
//   - backend health endpoint
//
// Output: PASS/FAIL per check + screenshots in reports/dev-smoke/

import { chromium } from "playwright";
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "../..");
const REPORTS_DIR = join(REPO_ROOT, "reports/dev-smoke");

const BACKEND_URL = "http://localhost:9000";
const STOREFRONT_URL = "http://localhost:8000";
const ADMIN_EMAIL = "dev@ardmag.local";
const ADMIN_PASSWORD = "dev123456";

const results = [];
const record = (name, ok, detail = "") => {
  const status = ok ? "PASS" : "FAIL";
  console.log(`[${status}] ${name}${detail ? " — " + detail : ""}`);
  results.push({ name, ok, detail });
};

if (!existsSync(REPORTS_DIR)) mkdirSync(REPORTS_DIR, { recursive: true });

// --- Fetch publishable key from DB via psql ---
const { execSync } = await import("node:child_process");
let publishableKey = "";
try {
  publishableKey = execSync(
    `PGPASSWORD=medusa psql -h 127.0.0.1 -p 5433 -U medusa -d medusa_dev_clone -tAc "SELECT token FROM api_key WHERE type='publishable' LIMIT 1"`,
    { encoding: "utf-8" }
  ).trim();
  record("publishable key fetched from DB", !!publishableKey, publishableKey.substring(0, 20) + "...");
} catch (e) {
  record("publishable key fetched from DB", false, e.message);
}

// --- 1. Backend health ---
try {
  const r = await fetch(`${BACKEND_URL}/health`);
  record("backend /health", r.status === 200, `HTTP ${r.status}`);
} catch (e) {
  record("backend /health", false, e.message);
}

// --- 2. Store API with publishable key ---
try {
  const r = await fetch(`${BACKEND_URL}/store/products?limit=3`, {
    headers: { "x-publishable-api-key": publishableKey },
  });
  const json = await r.json();
  const count = json.products?.length || 0;
  record("store /store/products", r.status === 200 && count > 0, `${count} products returned`);
} catch (e) {
  record("store /store/products", false, e.message);
}

// --- 3. Admin login API ---
let adminToken = "";
try {
  const r = await fetch(`${BACKEND_URL}/auth/user/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  const json = await r.json();
  adminToken = json.token || "";
  record("admin login API", r.status === 200 && !!adminToken, `token len ${adminToken.length}`);
} catch (e) {
  record("admin login API", false, e.message);
}

// --- 4. Admin API call with token ---
try {
  const r = await fetch(`${BACKEND_URL}/admin/products?limit=3`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const json = await r.json();
  const count = json.products?.length || 0;
  record("admin /admin/products", r.status === 200 && count > 0, `${count} products`);
} catch (e) {
  record("admin /admin/products", false, e.message);
}

// --- 5-8. Storefront pages via Playwright ---
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();

const consoleErrors = [];
page.on("pageerror", (err) => consoleErrors.push(err.message));
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(`console.error: ${msg.text()}`);
});

// 5. Homepage
try {
  const resp = await page.goto(STOREFRONT_URL, { waitUntil: "networkidle", timeout: 30000 });
  const status = resp?.status() || 0;
  const title = await page.title();
  await page.screenshot({ path: join(REPORTS_DIR, "01-homepage.png"), fullPage: false });
  record("storefront homepage", status === 200 && title.length > 0, `HTTP ${status}, title="${title}"`);
} catch (e) {
  record("storefront homepage", false, e.message);
}

// 6. Pagina produse
try {
  const resp = await page.goto(`${STOREFRONT_URL}/produse`, { waitUntil: "networkidle", timeout: 30000 });
  await page.screenshot({ path: join(REPORTS_DIR, "02-produse.png"), fullPage: false });
  record("storefront /produse", resp?.status() === 200, `HTTP ${resp?.status()}`);
} catch (e) {
  record("storefront /produse", false, e.message);
}

// 7. Un produs specific (folosim handle din DB)
try {
  const handle = execSync(
    `PGPASSWORD=medusa psql -h 127.0.0.1 -p 5433 -U medusa -d medusa_dev_clone -tAc "SELECT handle FROM product WHERE deleted_at IS NULL AND handle IS NOT NULL LIMIT 1"`,
    { encoding: "utf-8" }
  ).trim();
  const resp = await page.goto(`${STOREFRONT_URL}/products/${handle}`, { waitUntil: "networkidle", timeout: 30000 });
  await page.screenshot({ path: join(REPORTS_DIR, "03-pdp.png"), fullPage: false });
  record(`storefront PDP /products/${handle}`, resp?.status() === 200, `HTTP ${resp?.status()}`);
} catch (e) {
  record("storefront PDP", false, e.message);
}

// 8. Admin login page
try {
  const resp = await page.goto(`${BACKEND_URL}/app/login`, { waitUntil: "networkidle", timeout: 30000 });
  await page.screenshot({ path: join(REPORTS_DIR, "04-admin-login.png"), fullPage: false });
  record("admin /app/login", resp?.status() === 200, `HTTP ${resp?.status()}`);
} catch (e) {
  record("admin /app/login", false, e.message);
}

// 9. Console errors during navigation
record("zero pageerror/console.error", consoleErrors.length === 0,
  consoleErrors.length > 0 ? `${consoleErrors.length} errors (first: ${consoleErrors[0].slice(0,80)})` : "clean");

// 10. Sanitization integrity SQL
try {
  const realEmails = execSync(
    `PGPASSWORD=medusa psql -h 127.0.0.1 -p 5433 -U medusa -d medusa_dev_clone -tAc "SELECT COUNT(*) FROM customer WHERE deleted_at IS NULL AND (email NOT LIKE '%@dev.local' AND email NOT LIKE '%@ardmag.local')"`,
    { encoding: "utf-8" }
  ).trim();
  record("sanitization: no real emails in customer", realEmails === "0", `${realEmails} non-dev emails`);
} catch (e) {
  record("sanitization check", false, e.message);
}

try {
  const realCusIds = execSync(
    `PGPASSWORD=medusa psql -h 127.0.0.1 -p 5433 -U medusa -d medusa_dev_clone -tAc "SELECT COUNT(*) FROM account_holder WHERE deleted_at IS NULL AND external_id LIKE 'cus_%'"`,
    { encoding: "utf-8" }
  ).trim();
  record("sanitization: no real Stripe cus_ in account_holder", realCusIds === "0", `${realCusIds} real Stripe IDs`);
} catch (e) {
  record("sanitization Stripe check", false, e.message);
}

await browser.close();

// Summary + JSON report
const passed = results.filter(r => r.ok).length;
const failed = results.filter(r => !r.ok).length;
console.log(`\n${passed} passed, ${failed} failed, ${results.length} total`);
writeFileSync(join(REPORTS_DIR, "results.json"), JSON.stringify({
  timestamp: new Date().toISOString(),
  passed, failed, total: results.length,
  results,
}, null, 2));
console.log(`Report: ${REPORTS_DIR}/results.json`);
console.log(`Screenshots: ${REPORTS_DIR}/*.png`);

process.exit(failed > 0 ? 1 : 0);
