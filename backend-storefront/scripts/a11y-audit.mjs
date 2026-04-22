#!/usr/bin/env node
import { chromium } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { writeFileSync, mkdirSync } from 'fs'

const PAGE_MAP = {
  homepage: 'http://localhost:8000/ro',
  produse: 'http://localhost:8000/ro/produse',
  product: null, // will be discovered from /ro/produse
}

const VIEWPORT_MAP = {
  mobile: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 },
}

const ALLOWLIST = [
  // Pre-existing design issues that cannot be fixed without redesign
]

const args = process.argv.slice(2)
const pageArg = args.find(a => a.startsWith('--page='))?.split('=')[1] ?? 'homepage'
const viewportsArg = args.find(a => a.startsWith('--viewports='))?.split('=')[1] ?? 'desktop'
const viewports = viewportsArg.split(',')

let url = PAGE_MAP[pageArg]

const browser = await chromium.launch()
let discoverProductUrl = null

// If product page requested, first discover a product URL from /ro/produse
if (pageArg === 'product') {
  const context = await browser.newContext({ viewport: VIEWPORT_MAP.desktop })
  const discoveryPage = await context.newPage()
  await discoveryPage.goto('http://localhost:8000/ro/produse')
  await discoveryPage.waitForLoadState('networkidle')

  // Find first product link
  const productLink = await discoveryPage.locator('a[href*="/products/"]').first()
  if (productLink) {
    const href = await productLink.getAttribute('href')
    if (href) {
      discoverProductUrl = `http://localhost:8000${href}`
      url = discoverProductUrl
      console.log(`Discovered product URL: ${url}`)
    }
  }
  await context.close()
}

if (!url) {
  console.error(`Unknown page: ${pageArg}`)
  process.exit(1)
}

const results = []

for (const vp of viewports) {
  const { width, height } = VIEWPORT_MAP[vp]
  const context = await browser.newContext({ viewport: { width, height } })
  const page = await context.newPage()
  await page.goto(url)
  await page.waitForLoadState('networkidle')

  const axeResults = await new AxeBuilder({ page })
    .disableRules(ALLOWLIST)
    .analyze()

  const violations = axeResults.violations.filter(v =>
    ['moderate', 'serious', 'critical'].includes(v.impact)
  )

  results.push({
    viewport: vp,
    url: url,
    violations,
    passes: axeResults.passes.length,
    timestamp: new Date().toISOString()
  })
  await context.close()
}

await browser.close()

// Save report
const reportDir = `/home/dc/Work/SurCod/client-projects/ardmag.com/backend-storefront/reports/a11y/${pageArg}`
mkdirSync(reportDir, { recursive: true })
const reportPath = `${reportDir}/report.json`
writeFileSync(reportPath, JSON.stringify(results, null, 2))

// Print summary
const totalViolations = results.reduce((sum, r) => sum + r.violations.length, 0)
console.log(`\nA11Y AUDIT REPORT: ${pageArg}`)
console.log('============================')
for (const r of results) {
  const status = r.violations.length === 0 ? 'PASS' : 'FAIL'
  const vp = r.viewport.padEnd(10)
  console.log(`${vp} (${String(VIEWPORT_MAP[r.viewport].width).padEnd(4)}): ${status} — ${r.violations.length} violations, ${r.passes} passes`)

  if (r.violations.length > 0) {
    for (const v of r.violations) {
      console.log(`  [${v.impact.toUpperCase()}] ${v.id}: ${v.description}`)
      console.log(`    Nodes affected: ${v.nodes.length}`)
      for (const node of v.nodes.slice(0, 3)) {
        console.log(`      - ${node.html}`)
      }
      if (v.nodes.length > 3) {
        console.log(`      ... and ${v.nodes.length - 3} more`)
      }
    }
  }
}
console.log(`\nTotal violations: ${totalViolations}`)
console.log(`VERDICT: ${totalViolations === 0 ? 'PASS' : 'FAIL'}`)
console.log(`\nReport saved: ${reportPath}`)
