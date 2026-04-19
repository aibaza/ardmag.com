#!/usr/bin/env node
/**
 * Captures browser console errors/warnings for all design-preview pages.
 * Usage: node scripts/console-check.mjs [--url http://localhost:8000]
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('/home/dc/Work/SurCod/client-projects/ardmag.com/backend-storefront/node_modules/playwright');

const BASE = process.argv.includes('--url')
  ? process.argv[process.argv.indexOf('--url') + 1]
  : 'http://localhost:8000';

const PAGES = [
  { name: 'index',    path: '/ro' },
  { name: 'category', path: '/ro/design-preview/category' },
  { name: 'product',  path: '/ro/design-preview/product' },
];

const VIEWPORTS = [
  { name: 'mobile',  w: 375,  h: 667,  mobile: true  },
  { name: 'tablet',  w: 768,  h: 1024, mobile: true  },
  { name: 'desktop', w: 1440, h: 900,  mobile: false },
];

const IGNORE = [
  'react-devtools',
  'Download the React DevTools',
];

const browser = await chromium.launch();
let totalIssues = 0;

for (const pg of PAGES) {
  for (const vp of VIEWPORTS) {
    const url = BASE + pg.path;
    const ctx = await browser.newContext({
      viewport: { width: vp.w, height: vp.h },
      isMobile: vp.mobile,
    });
    const page = await ctx.newPage();
    const issues = [];

    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      if (['error', 'warning', 'warn'].includes(type) && !IGNORE.some(i => text.includes(i))) {
        issues.push({ type, text });
      }
    });

    page.on('pageerror', err => {
      issues.push({ type: 'PAGEERROR', text: err.message });
    });

    page.on('requestfailed', req => {
      const f = req.failure()?.errorText;
      if (f && !f.includes('ERR_ABORTED')) {
        issues.push({ type: 'REQFAIL', text: `${req.url()} → ${f}` });
      }
    });

    // Double visit: first sets cookie (307), second renders fully
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(3000); // wait for React hydration

    const label = `${pg.name}@${vp.name}`;
    if (issues.length === 0) {
      console.log(`✓ ${label}`);
    } else {
      console.log(`✗ ${label} — ${issues.length} issue(s):`);
      issues.forEach(i => console.log(`    [${i.type}] ${i.text.substring(0, 400)}`));
      totalIssues += issues.length;
    }

    await ctx.close();
  }
}

await browser.close();

console.log(`\n${'─'.repeat(50)}`);
console.log(totalIssues === 0
  ? '✓ ALL CLEAN — no console errors or warnings'
  : `✗ ${totalIssues} total issue(s) found`
);

process.exit(totalIssues > 0 ? 1 : 0);
