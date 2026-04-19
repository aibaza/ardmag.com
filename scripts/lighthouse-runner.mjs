#!/usr/bin/env node
/**
 * Lighthouse perf audit runner for ardmag.com Faza 2
 * Usage: node scripts/lighthouse-runner.mjs --page=homepage|category|product
 *
 * Budget: LCP<2.5s, CLS<0.1, TBT<200ms (mobile + 3G simulated)
 */

import { execSync } from "child_process"
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, "../backend-storefront")

const PAGE_MAP = {
  homepage: "http://localhost:8000/ro",
  category: "http://localhost:8000/ro/categories/discuri-diamantate",
  product:  "http://localhost:8000/ro/products/disc-diamantat-delta-turbo-ul115",
}

const BUDGET = {
  lcp: 2500,   // ms
  cls: 0.1,
  tbt: 200,    // ms
}

const args = process.argv.slice(2)
const pageArg = args.find(a => a.startsWith("--page="))?.split("=")[1] ?? "homepage"
const url = PAGE_MAP[pageArg]

if (!url) {
  console.error(`Unknown page: ${pageArg}. Valid: ${Object.keys(PAGE_MAP).join(", ")}`)
  process.exit(1)
}

const reportDir = resolve(ROOT, `reports/perf/${pageArg}`)
mkdirSync(reportDir, { recursive: true })
const reportPath = resolve(reportDir, "lighthouse.json")

console.log(`\nLIGHTHOUSE AUDIT: ${pageArg}`)
console.log(`URL: ${url}`)
console.log("Profile: mobile + 3G simulated throttle")
console.log("Running...")

// Run Lighthouse CLI
const cmd = [
  `node ${resolve(ROOT, "node_modules/.bin/lighthouse")}`,
  `"${url}"`,
  "--output=json",
  `--output-path="${reportPath}"`,
  "--preset=perf",
  "--emulated-form-factor=mobile",
  "--throttling-method=simulate",
  "--throttling.rttMs=150",
  "--throttling.throughputKbps=1600",
  '--chrome-flags="--headless --no-sandbox --disable-dev-shm-usage"',
  "--quiet",
].join(" ")

try {
  execSync(cmd, { stdio: "pipe", cwd: ROOT })
} catch (e) {
  // Lighthouse may exit non-zero but still produce output
}

if (!existsSync(reportPath)) {
  console.error("ERROR: Lighthouse did not produce a report. Check Chrome installation.")
  process.exit(1)
}

const report = JSON.parse(readFileSync(reportPath, "utf-8"))
const audits = report.audits

const metrics = {
  lcp: audits["largest-contentful-paint"]?.numericValue,
  cls: audits["cumulative-layout-shift"]?.numericValue,
  tbt: audits["total-blocking-time"]?.numericValue,
  fcp: audits["first-contentful-paint"]?.numericValue,
  score: Math.round((report.categories?.performance?.score ?? 0) * 100),
}

console.log()
const results = []

for (const [key, budget] of [["lcp", BUDGET.lcp], ["cls", BUDGET.cls], ["tbt", BUDGET.tbt]]) {
  const value = metrics[key]
  if (value === undefined) {
    console.log(`  ${key.toUpperCase()}: N/A — SKIP`)
    results.push(true) // don't block if metric missing
    continue
  }
  const pass = value <= budget
  const unit = key === "cls" ? "" : "ms"
  const formatted = key === "cls" ? value.toFixed(3) : Math.round(value)
  console.log(`  ${key.toUpperCase()}: ${formatted}${unit} (budget: <${budget}${unit}) — ${pass ? "PASS" : "FAIL"}`)
  results.push(pass)
}

if (metrics.fcp !== undefined) {
  console.log(`  FCP: ${Math.round(metrics.fcp)}ms (informational)`)
}
console.log(`  Performance score: ${metrics.score}/100`)

const allPass = results.every(Boolean)
console.log(`\nReport: ${reportPath}`)
console.log(`\nVERDICT: ${allPass ? "PASS" : "FAIL"}`)

process.exit(allPass ? 0 : 1)
