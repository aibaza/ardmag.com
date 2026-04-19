#!/usr/bin/env node
/**
 * Pixel-level diff between baseline and after screenshots using pixelmatch.
 * threshold=0 means ZERO tolerance — any differing pixel = FAIL.
 * includeAA=true skips anti-aliasing pixels (sub-pixel rendering noise).
 *
 * Usage:
 *   node scripts/pixel-diff.mjs --component badge --pages index,category,product
 */

import { createRequire } from 'module';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import process from 'process';

const require = createRequire(import.meta.url);
const _pixelmatch = require('pixelmatch');
const pixelmatch = _pixelmatch.default || _pixelmatch;
const { PNG } = require('pngjs');

const BASE = '/home/dc/Work/SurCod/client-projects/ardmag.com/reports/extract';

// Parse CLI args
const args = process.argv.slice(2);
const getArg = (flag) => {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
};

const component = getArg('--component');
const pages = (getArg('--pages') || 'index,category,product').split(',').map(p => p.trim());

if (!component) {
  console.error('Usage: node pixel-diff.mjs --component <name> [--pages page1,page2]');
  process.exit(1);
}

const viewports = ['mobile', 'tablet', 'desktop'];

const pairs = [];
let totalDiffPixels = 0;
const results = [];

for (const page of pages) {
  for (const vp of viewports) {
    const baselinePath = join(BASE, component, 'baseline', `${page}-${vp}.png`);
    const afterPath = join(BASE, component, 'after', `${page}-${vp}.png`);
    const diffPath = join(BASE, component, 'diff', `${page}-${vp}.png`);

    if (!existsSync(baselinePath)) {
      console.error(`MISSING baseline: ${baselinePath}`);
      results.push({ page, viewport: vp, diffPixels: -1, error: 'baseline missing', diffPath: null });
      totalDiffPixels += 1;
      continue;
    }
    if (!existsSync(afterPath)) {
      console.error(`MISSING after: ${afterPath}`);
      results.push({ page, viewport: vp, diffPixels: -1, error: 'after missing', diffPath: null });
      totalDiffPixels += 1;
      continue;
    }

    const img1 = PNG.sync.read(readFileSync(baselinePath));
    const img2 = PNG.sync.read(readFileSync(afterPath));

    // If dimensions differ, that itself is a diff
    if (img1.width !== img2.width || img1.height !== img2.height) {
      const err = `Dimension mismatch: baseline ${img1.width}x${img1.height} vs after ${img2.width}x${img2.height}`;
      console.error(`DIMENSION DIFF ${page}/${vp}: ${err}`);
      results.push({ page, viewport: vp, diffPixels: -1, error: err, diffPath: null });
      totalDiffPixels += 1;
      continue;
    }

    const { width, height } = img1;
    const diffPng = new PNG({ width, height });

    const numDiff = pixelmatch(
      img1.data, img2.data, diffPng.data,
      width, height,
      { threshold: 0, includeAA: true }
    );

    if (numDiff > 0) {
      writeFileSync(diffPath, PNG.sync.write(diffPng));
    }

    totalDiffPixels += numDiff;
    results.push({ page, viewport: vp, diffPixels: numDiff, diffPath: numDiff > 0 ? diffPath : null });

    const status = numDiff === 0 ? '✓' : '✗';
    console.log(`  ${page}-${vp}: ${numDiff} diff pixels  ${status}${numDiff > 0 ? `  → ${diffPath}` : ''}`);
  }
}

const verdict = totalDiffPixels === 0 ? 'PASS' : 'FAIL';

const report = {
  component,
  pages,
  pairs: results,
  totalDiffPixels,
  verdict,
};

const reportPath = join(BASE, component, 'diff-report.json');
writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log('');
console.log('─'.repeat(50));
console.log(`Total diff pixels: ${totalDiffPixels}`);
console.log(`VERDICT: ${verdict}`);
console.log(`Report: ${reportPath}`);

process.exit(verdict === 'PASS' ? 0 : 1);
