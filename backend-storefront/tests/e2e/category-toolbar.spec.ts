import { test, expect } from "@playwright/test"

// slefuire-piatra: multi-brand (sait + woosuk), enough products to test perPage
const CAT_URL = "/ro/categories/slefuire-piatra"
const SORT_ASC = "Preț ascendent"
const SORT_ASC_ENCODED = /sortBy=Pre/

test.describe("CategoryToolbar — sort + perPage URL sync", () => {

  test("1. sort change -> URL contine ?sortBy=", async ({ page }) => {
    await page.goto(CAT_URL)
    await page.locator("#sort").waitFor({ state: "visible" })
    await page.selectOption("#sort", SORT_ASC)
    await page.waitForURL(SORT_ASC_ENCODED)
    expect(page.url()).toMatch(SORT_ASC_ENCODED)
  })

  test("2. sort = Relevanță -> sortBy dispare din URL", async ({ page }) => {
    await page.goto(`${CAT_URL}?sortBy=Pre%C8%9B%20ascendent`)
    await page.locator("#sort").waitFor({ state: "visible" })
    await page.selectOption("#sort", "Relevanță")
    await page.waitForFunction(() => !window.location.search.includes("sortBy="))
    expect(page.url()).not.toContain("sortBy=")
  })

  test("3. perPage change -> URL contine ?perPage=40", async ({ page }) => {
    await page.goto(CAT_URL)
    await page.locator("#per-page").waitFor({ state: "visible" })
    await page.selectOption("#per-page", "40")
    await page.waitForURL(/perPage=40/)
    expect(page.url()).toContain("perPage=40")
  })

  test("4. sort change reseteaza ?page=", async ({ page }) => {
    await page.goto(`${CAT_URL}?page=2`)
    await page.locator("#sort").waitFor({ state: "visible" })
    await page.selectOption("#sort", SORT_ASC)
    await page.waitForURL(SORT_ASC_ENCODED)
    expect(page.url()).not.toContain("page=")
  })

  test("5. perPage change reseteaza ?page=", async ({ page }) => {
    await page.goto(`${CAT_URL}?page=2`)
    await page.locator("#per-page").waitFor({ state: "visible" })
    await page.selectOption("#per-page", "40")
    await page.waitForURL(/perPage=40/)
    expect(page.url()).not.toContain("page=")
  })

  test("6. sort change pastreaza ?brand=", async ({ page }) => {
    await page.goto(`${CAT_URL}?brand=sait`)
    await page.locator("#sort").waitFor({ state: "visible" })
    await page.selectOption("#sort", SORT_ASC)
    await page.waitForURL(SORT_ASC_ENCODED)
    expect(page.url()).toContain("brand=sait")
  })

  test("7. perPage change pastreaza ?sortBy=", async ({ page }) => {
    await page.goto(`${CAT_URL}?sortBy=Pre%C8%9B%20ascendent`)
    await page.locator("#per-page").waitFor({ state: "visible" })
    await page.selectOption("#per-page", "40")
    await page.waitForURL(/perPage=40/)
    expect(page.url()).toContain("sortBy=")
  })

  test("8. refresh pe URL cu ?sortBy -> select pre-selectat", async ({ page }) => {
    await page.goto(`${CAT_URL}?sortBy=Pre%C8%9B%20ascendent`)
    await page.locator("#sort").waitFor({ state: "visible" })
    await expect(page.locator("#sort")).toHaveValue(SORT_ASC)
  })

  test("9. refresh pe URL cu ?perPage=40 -> select pre-selectat", async ({ page }) => {
    await page.goto(`${CAT_URL}?perPage=40`)
    await page.locator("#per-page").waitFor({ state: "visible" })
    await expect(page.locator("#per-page")).toHaveValue("40")
  })

  test("10. pagina se incarca fara erori console", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text())
    })
    const response = await page.goto(CAT_URL)
    expect(response?.status()).toBe(200)
    await page.locator("#sort").waitFor({ state: "visible" })
    expect(errors.filter(e => !e.includes("favicon"))).toHaveLength(0)
  })

  test("11. perPage=40 -> grila afiseaza cel mult 40 produse", async ({ page }) => {
    await page.goto(`${CAT_URL}?perPage=40`)
    await page.locator(".cat-products").waitFor({ state: "visible" })
    const count = await page.locator(".pcard").count()
    expect(count).toBeLessThanOrEqual(40)
    expect(count).toBeGreaterThan(0)
  })

})
