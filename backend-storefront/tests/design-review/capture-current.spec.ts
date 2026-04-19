import { test } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { loadScope, screenshotPath } from './_helpers'

const scope = loadScope()
const iteration = process.env.ITERATION ?? 'current'

for (const pageSpec of scope.pages) {
  test(`current: ${pageSpec.name}`, async ({ page }) => {
    const outPath = screenshotPath(iteration, 'current', pageSpec.name, test.info().project.name)
    fs.mkdirSync(path.dirname(outPath), { recursive: true })

    await page.goto(`${scope.base_url}${pageSpec.url}`)
    await page.waitForLoadState('networkidle')

    await page.screenshot({ path: outPath, fullPage: true })
  })
}
