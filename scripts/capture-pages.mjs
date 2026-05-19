#!/usr/bin/env node
/**
 * Capture screenshots for baseline or after comparison.
 * Usage: node scripts/capture-pages.mjs --component <name> --phase baseline|after [--pages index,category,product]
 *
 * Pages: index=/ro  category=/ro/design-preview/category  product=/ro/design-preview/product
 */
import { createRequire } from 'module';
import { mkdirSync, statSync } from 'fs';
import { join } from 'path';
import process from 'process';

const require = createRequire(import.meta.url);
const { chromium } = require('/home/dc/Work/SurCod/client-projects/ardmag.com/backend-storefront/node_modules/playwright');

const BASE_URL = 'http://localhost:8000';
const ROOT = '/home/dc/Work/SurCod/client-projects/ardmag.com';
const PAGE_URLS = {
  index: BASE_URL + '/ro',
  category: BASE_URL + '/ro/design-preview/category',
  product: BASE_URL + '/ro/design-preview/product',
};
const VIEWPORTS = [
  { name: 'mobile',  width: 375,  height: 812,  deviceScaleFactor: 2 },
  { name: 'tablet',  width: 768,  height: 1024, deviceScaleFactor: 2 },
  { name: 'desktop', width: 1440, height: 900,  deviceScaleFactor: 1 },
];

const args = process.argv.slice(2);
const getArg = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : null; };

const component = getArg('--component');
const phase = getArg('--phase') || 'baseline';
const pagesArg = getArg('--pages');
const pageNames = pagesArg ? pagesArg.split(',') : ['index', 'category', 'product'];

if (!component) { console.error('Usage: --component <name>'); process.exit(1); }

const OUT = join(ROOT, 'reports/extract', component, phase);
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
for (const pageName of pageNames) {
  const url = PAGE_URLS[pageName];
  if (!url) { console.error('Unknown page:', pageName); continue; }
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.deviceScaleFactor });
    const p = await ctx.newPage();
    await p.goto(url, { waitUntil: 'networkidle' });
    await p.waitForTimeout(3000);
    await p.goto(url, { waitUntil: 'networkidle' });
    await p.waitForTimeout(3000);
    const outFile = join(OUT, `${pageName}-${vp.name}.png`);
    await p.screenshot({ path: outFile, fullPage: true });
    const size = statSync(outFile).size;
    console.log(`captured ${outFile} ${size}`);
    await ctx.close();
  }
}
await browser.close();
console.log('DONE');
