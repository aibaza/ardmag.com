import { test, expect } from "@playwright/test"
import { API, PK, BASE, createTestCustomer, setAuthCookie, setCartCookie, dismissCookieBanner, addAddress } from "./helpers/auth"

const REGION_RO = "reg_01KPH383249W5F5HP8Z2ZWMR5A"

test("Checkout cu adresa salvata: picker autocomplete, submit, order confirmat", async ({ page, request }) => {
  test.setTimeout(180000)
  const { token } = await createTestCustomer(request)

  // 2 adrese via API
  await addAddress(request, token, { address_name: "Acasa", address_1: "Str. Livrare 10", city: "Cluj-Napoca", is_default_shipping: true, is_default_billing: false })
  await addAddress(request, token, { address_name: "Birou", address_1: "Str. Factura 5", city: "Cluj-Napoca", is_default_shipping: false, is_default_billing: true })

  const headers = { "x-publishable-api-key": PK, "Content-Type": "application/json", Authorization: `Bearer ${token}` }
  const pResp = await request.get(`${API}/store/products?limit=1&fields=id,*variants`, { headers })
  const { products } = await pResp.json()
  const variantId = products?.[0]?.variants?.[0]?.id
  const cResp = await request.post(`${API}/store/carts`, { headers, data: { region_id: REGION_RO } })
  const { cart } = await cResp.json()
  await request.post(`${API}/store/carts/${cart.id}/line-items`, { headers, data: { variant_id: variantId, quantity: 1 } })

  const cacheId = `test-cache-${cart.id.slice(-8)}`
  await setAuthCookie(page, token)
  await setCartCookie(page, cart.id, cacheId)

  // ── Step address: picker cu adrese salvate ────────────────────────────────────
  await page.goto(`${BASE}/checkout?step=address`, { waitUntil: "domcontentloaded", timeout: 40000 })
  await dismissCookieBanner(page)
  await page.waitForSelector("h3", { timeout: 25000 })

  // Picker-ul arata adresele salvate
  await expect(page.locator("label", { hasText: /acasa/i }).first()).toBeVisible({ timeout: 10000 })
  await expect(page.locator('input[type="radio"]:checked')).toHaveCount(1)

  // Debifam "aceeasi adresa pentru facturare"
  await page.locator('input[name="same_as_billing"]').uncheck()
  // Sectiunea billing cu picker apare
  await expect(page.locator("h3", { hasText: /facturare/i })).toBeVisible({ timeout: 5000 })

  // Submit cu adresele selectate implicit
  await page.locator("button[type=submit]", { hasText: /continua spre livrare/i }).click()

  // ── Step delivery ─────────────────────────────────────────────────────────────
  await page.waitForURL(/step=delivery/, { timeout: 20000 })
  await expect(page.locator("h3", { hasText: /metoda de livrare/i })).toBeVisible({ timeout: 15000 })
  await expect(page.locator("text=Fan Courier")).toBeVisible()
  await page.locator("button.btn.primary.lg", { hasText: /continua spre plata/i }).click()

  // ── Step payment ──────────────────────────────────────────────────────────────
  await page.waitForURL(/step=payment/, { timeout: 20000 })
  await page.waitForSelector("h3", { timeout: 15000 })
  await page.locator("label", { hasText: /ramburs/i }).click()
  await page.locator("button.btn.primary.lg", { hasText: /revizuieste comanda/i }).click()

  // ── Review ────────────────────────────────────────────────────────────────────
  await page.waitForURL(/step=review/, { timeout: 20000 })
  await expect(page.locator("h3", { hasText: /confirma comanda/i })).toBeVisible({ timeout: 10000 })

  // Adresele din picker sunt reflectate in review
  await expect(page.locator("text=Str. Livrare 10")).toBeVisible()
  await expect(page.locator("text=Str. Factura 5")).toBeVisible()
  await expect(page.locator("text=Ramburs")).toBeVisible()

  // ── Place order ───────────────────────────────────────────────────────────────
  await page.locator("button", { hasText: /plaseaza comanda/i }).click()
  await page.waitForURL(/\/order\/.*\/confirmed/, { timeout: 30000 })
  expect(page.url()).toMatch(/\/order\/.+\/confirmed/)
})
