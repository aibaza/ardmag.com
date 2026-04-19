import { test, expect } from "@playwright/test"

// slefuire-piatra has both brand:sait and brand:woosuk tagged products
const CAT_URL = "/ro/categories/slefuire-piatra"

test.describe("FilterSidebar — URL sync", () => {

  test("1. bifeaza brand -> URL contine ?brand=slug", async ({ page }) => {
    await page.goto(CAT_URL)
    const firstCheckbox = page.locator(".filters .chk input[type=checkbox]").first()
    await firstCheckbox.waitFor({ state: "visible" })
    await firstCheckbox.click()
    await page.waitForURL(/brand=/)
    expect(page.url()).toContain("brand=")
  })

  test("2. doua branduri -> URL comma-separated", async ({ page }) => {
    await page.goto(CAT_URL)
    // Target brand checkboxes specifically (first <details> group is Brand)
    const brandCheckboxes = page.locator(".filters details").first().locator("input[type=checkbox]")
    await brandCheckboxes.first().waitFor({ state: "visible" })
    const count = await brandCheckboxes.count()
    if (count >= 2) {
      await brandCheckboxes.nth(0).click()
      await page.waitForURL(/brand=/)
      await brandCheckboxes.nth(1).click()
      await page.waitForURL(/brand=[^&]*(,|%2C)/)
      const url = new URL(page.url())
      const brands = url.searchParams.get("brand") ?? ""
      expect(brands.split(",").length).toBeGreaterThanOrEqual(2)
    } else {
      test.skip()
    }
  })

  test("3. debifeaza ultimul brand -> param brand dispare din URL", async ({ page }) => {
    await page.goto(CAT_URL)
    const firstCheckbox = page.locator(".filters .chk input[type=checkbox]").first()
    await firstCheckbox.waitFor({ state: "visible" })
    await firstCheckbox.click()
    await page.waitForURL(/brand=/)
    // Re-resolve after navigation and click the now-checked first brand checkbox
    await page.locator(".filters .chk input[type=checkbox]").first().click()
    await page.waitForFunction(() => !window.location.search.includes("brand="))
    expect(page.url()).not.toContain("brand=")
  })

  test("4. schimbare filtru reseteaza page param", async ({ page }) => {
    await page.goto(`${CAT_URL}?page=2`)
    const firstCheckbox = page.locator(".filters .chk input[type=checkbox]").first()
    await firstCheckbox.waitFor({ state: "visible" })
    await firstCheckbox.click()
    await page.waitForURL(/brand=/)
    expect(page.url()).not.toContain("page=")
  })

  test("5. schimbare filtru pastreaza sortBy", async ({ page }) => {
    await page.goto(`${CAT_URL}?sortBy=Pre%C8%9B%20ascendent`)
    const firstCheckbox = page.locator(".filters .chk input[type=checkbox]").first()
    await firstCheckbox.waitFor({ state: "visible" })
    await firstCheckbox.click()
    await page.waitForURL(/brand=/)
    expect(page.url()).toContain("sortBy=")
  })

  test("6. buton Resetează sterge brand+material din URL", async ({ page }) => {
    await page.goto(CAT_URL)
    const firstCheckbox = page.locator(".filters .chk input[type=checkbox]").first()
    await firstCheckbox.waitFor({ state: "visible" })
    await firstCheckbox.click()
    await page.waitForURL(/brand=/)
    await page.click(".filter-actions .btn.secondary")
    await page.waitForFunction(() => !window.location.search.includes("brand="))
    expect(page.url()).not.toContain("brand=")
    expect(page.url()).not.toContain("material=")
  })

  test("7. refresh pe URL cu brand -> checkbox apare bifat", async ({ page }) => {
    await page.goto(CAT_URL)
    const firstCheckbox = page.locator(".filters .chk input[type=checkbox]").first()
    await firstCheckbox.waitFor({ state: "visible" })
    await firstCheckbox.click()
    await page.waitForURL(/brand=/)
    const urlWithBrand = page.url()
    // Full reload — server renders with brand param, checkbox should be checked
    await page.goto(urlWithBrand)
    await page.locator(".filters .chk input[type=checkbox]").first().waitFor({ state: "visible" })
    await expect(page.locator(".filters .chk input[type=checkbox]").first()).toBeChecked()
  })

  test("8. pagina de categorie se incarca fara erori (200, no console errors)", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text())
    })
    const response = await page.goto(CAT_URL)
    expect(response?.status()).toBe(200)
    await page.locator(".filters").waitFor({ state: "visible" })
    expect(errors.filter(e => !e.includes("favicon"))).toHaveLength(0)
  })

  test("9. sidebar vizibil cu cel putin un grup de checkboxuri", async ({ page }) => {
    await page.goto(CAT_URL)
    await page.locator(".filters").waitFor({ state: "visible" })
    const checkboxes = page.locator(".filters .chk input[type=checkbox]")
    await expect(checkboxes.first()).toBeVisible()
    expect(await checkboxes.count()).toBeGreaterThan(0)
  })

  test("10. dupa filtrare, grila de produse afiseaza produse", async ({ page }) => {
    await page.goto(CAT_URL)
    const firstCheckbox = page.locator(".filters .chk input[type=checkbox]").first()
    await firstCheckbox.waitFor({ state: "visible" })
    await firstCheckbox.click()
    await page.waitForURL(/brand=/)
    await page.locator(".cat-products").waitFor({ state: "visible" })
    // Either products are shown or empty-state message
    const hasProducts = await page.locator(".pcard").count() > 0
    const hasEmpty = await page.locator(".cat-products").textContent().then(t => t?.includes("Niciun produs"))
    expect(hasProducts || hasEmpty).toBeTruthy()
  })

  test("11. buton Resetează pastreaza sortBy", async ({ page }) => {
    await page.goto(`${CAT_URL}?sortBy=Pre%C8%9B%20ascendent`)
    const firstCheckbox = page.locator(".filters .chk input[type=checkbox]").first()
    await firstCheckbox.waitFor({ state: "visible" })
    await firstCheckbox.click()
    await page.waitForURL(/brand=/)
    await page.click(".filter-actions .btn.secondary")
    await page.waitForFunction(() => !window.location.search.includes("brand="))
    expect(page.url()).toContain("sortBy=")
  })
})
