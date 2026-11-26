import { test, expect } from "@playwright/test"

// slefuire-piatra: multi-brand (sait + woosuk). „Pe pagina” a fost scos (lista se incarca la derulare).
const CAT_URL = "/ro/categories/slefuire-piatra"
const SORT_ASC = "Preț ascendent"
const SORT_ASC_ENCODED = /sortBy=Pre/

test.describe("CategoryToolbar — sort URL sync", () => {

  test("1. sort change -> URL contine ?sortBy=", async ({ page }) => {
    await page.goto(CAT_URL)
    await page.locator("#sort:visible, .mobile-filter-bar select:visible").waitFor({ state: "visible" })
    await page.selectOption("#sort:visible, .mobile-filter-bar select:visible", SORT_ASC)
    await page.waitForURL(SORT_ASC_ENCODED)
    expect(page.url()).toMatch(SORT_ASC_ENCODED)
  })

  test("2. sort = Relevanță -> sortBy dispare din URL", async ({ page }) => {
    await page.goto(`${CAT_URL}?sortBy=Pre%C8%9B%20ascendent`)
    await page.locator("#sort:visible, .mobile-filter-bar select:visible").waitFor({ state: "visible" })
    await page.selectOption("#sort:visible, .mobile-filter-bar select:visible", "Relevanță")
    await page.waitForFunction(() => !window.location.search.includes("sortBy="))
    expect(page.url()).not.toContain("sortBy=")
  })

  test("4. sort change reseteaza ?page=", async ({ page }) => {
    await page.goto(`${CAT_URL}?page=2`)
    await page.locator("#sort:visible, .mobile-filter-bar select:visible").waitFor({ state: "visible" })
    await page.selectOption("#sort:visible, .mobile-filter-bar select:visible", SORT_ASC)
    await page.waitForURL(SORT_ASC_ENCODED)
    expect(page.url()).not.toContain("page=")
  })

  test("6. sort change pastreaza ?brand=", async ({ page }) => {
    await page.goto(`${CAT_URL}?brand=sait`)
    await page.locator("#sort:visible, .mobile-filter-bar select:visible").waitFor({ state: "visible" })
    await page.selectOption("#sort:visible, .mobile-filter-bar select:visible", SORT_ASC)
    await page.waitForURL(SORT_ASC_ENCODED)
    expect(page.url()).toContain("brand=sait")
  })

  test("8. refresh pe URL cu ?sortBy -> select pre-selectat", async ({ page }) => {
    await page.goto(`${CAT_URL}?sortBy=Pre%C8%9B%20ascendent`)
    await page.locator("#sort:visible, .mobile-filter-bar select:visible").waitFor({ state: "visible" })
    await expect(page.locator("#sort:visible, .mobile-filter-bar select:visible")).toHaveValue(SORT_ASC)
  })

  test("10. pagina se incarca fara erori console", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text())
    })
    const response = await page.goto(CAT_URL)
    expect(response?.status()).toBe(200)
    await page.locator("#sort:visible, .mobile-filter-bar select:visible").waitFor({ state: "visible" })
    expect(errors.filter(e => !e.includes("favicon"))).toHaveLength(0)
  })

})
