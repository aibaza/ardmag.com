import { test, expect } from "@playwright/test"

const BASE = "http://localhost:8000"
const URL = `${BASE}/ro/products/dischete-de-slefuit-cu-carbura`

test.describe("variant selector DISCHETE - context-aware selection", () => {

  test("selecteaza SAITDISC + 125 impreuna", async ({ page }) => {
    await page.goto(URL)
    await page.waitForSelector(".var-opt")

    // Starea initiala: prima varianta selectata (VEL / 180 / ...)
    // Selecteaza SAITDISC
    const saitdiscBtn = page.locator(".var-opt", { hasText: "SAITDISC" }).first()
    await saitdiscBtn.click()
    await page.waitForURL(/v_id=/)

    // Verifica ca SAITDISC e activ
    await expect(page.locator(".var-opt.on", { hasText: "SAITDISC" })).toBeVisible()

    // Acum selecteaza diametru 125
    const btn125 = page.locator(".variant-group", { hasText: "DIAMETRU" })
      .locator(".var-opt", { hasText: "125" })
    await btn125.click()
    await page.waitForURL(/v_id=/)

    // SAITDISC trebuie sa ramana activ dupa click pe 125
    await expect(page.locator(".var-opt.on", { hasText: "SAITDISC" })).toBeVisible()

    // 125 trebuie sa fie activ
    await expect(
      page.locator(".variant-group", { hasText: "DIAMETRU" })
        .locator(".var-opt.on", { hasText: "125" })
    ).toBeVisible()

    // CANTITATE trebuie sa fie CUTIE (25 BUC.) sau BAX (100 BUC.) - nu BAX (400 BUC.) care e doar VEL
    const selectedCantitate = await page.locator(".variant-group", { hasText: "CANTITATE" })
      .locator(".var-opt.on")
      .textContent()
    console.log("Cantitate selectata:", selectedCantitate?.trim())
    expect(selectedCantitate?.trim()).not.toBe("BAX (400 BUC.)")
  })

  test("schimba VEL -> SAITDISC pastrand diametru si granulatie", async ({ page }) => {
    // Porneste de la VEL / 125 / 40
    await page.goto(`${URL}?v_id=variant_01KPH3RCKXBR2R90XEZM4A01J4`)
    await page.waitForSelector(".var-opt")

    // Verifica starea initiala
    await expect(page.locator(".var-opt.on", { hasText: "VEL" })).toBeVisible()
    await expect(
      page.locator(".variant-group", { hasText: "DIAMETRU" }).locator(".var-opt.on")
    ).toHaveText("125")

    // Schimba la SAITDISC
    await page.locator(".var-opt", { hasText: "SAITDISC" }).first().click()
    await page.waitForURL(/v_id=/)

    // SAITDISC activ
    await expect(page.locator(".var-opt.on", { hasText: "SAITDISC" })).toBeVisible()

    // Diametru trebuie sa ramana 125
    await expect(
      page.locator(".variant-group", { hasText: "DIAMETRU" }).locator(".var-opt.on")
    ).toHaveText("125")

    // Granulatie 40 exista la SAITDISC 125? NU - deci ar trebui sa mearga la prima granulatie disponibila
    const gr = await page.locator(".variant-group", { hasText: "GRANULAȚIE" })
      .locator(".var-opt.on").textContent()
    console.log("Granulatie dupa switch la SAITDISC:", gr?.trim())

    // Pretul trebuie sa se fi schimbat (SAITDISC != VEL)
    const price = await page.locator(".price, [class*='price']").first().textContent()
    console.log("Pret:", price?.trim())
  })

  test("VEL 125 -> click pe 180 pastreaza VEL", async ({ page }) => {
    await page.goto(`${URL}?v_id=variant_01KPH3RCKXBR2R90XEZM4A01J4`)
    await page.waitForSelector(".var-opt")

    await expect(page.locator(".var-opt.on", { hasText: "VEL" })).toBeVisible()

    await page.locator(".variant-group", { hasText: "DIAMETRU" })
      .locator(".var-opt", { hasText: "180" }).click()
    await page.waitForURL(/v_id=/)

    // VEL trebuie sa ramana activ
    await expect(page.locator(".var-opt.on", { hasText: "VEL" })).toBeVisible()
    await expect(
      page.locator(".variant-group", { hasText: "DIAMETRU" }).locator(".var-opt.on")
    ).toHaveText("180")
  })
})
