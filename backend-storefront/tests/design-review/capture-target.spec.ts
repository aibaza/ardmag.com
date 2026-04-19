import { test } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { loadScope, screenshotPath } from './_helpers'

const scope = loadScope()
const iteration = process.env.ITERATION ?? 'current'

for (const pageSpec of scope.pages) {
  test(`target: ${pageSpec.name}`, async ({ page }) => {
    const outPath = screenshotPath(iteration, 'target', pageSpec.name, test.info().project.name)
    fs.mkdirSync(path.dirname(outPath), { recursive: true })

    await page.goto(pageSpec.target_url)
    await page.waitForLoadState('networkidle')

    if (pageSpec.target_selector) {
      await page.locator(pageSpec.target_selector).scrollIntoViewIfNeeded()
    }

    await page.screenshot({ path: outPath, fullPage: true })
  })
}
