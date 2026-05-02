import { test, expect } from "@playwright/test"
import { API, PK, BASE, createTestCustomer, setAuthCookie, setCartCookie, dismissCookieBanner } from "./helpers/auth"

const REGION_RO = "reg_01KPH383249W5F5HP8Z2ZWMR5A"

test("Checkout: introduce adresa noua cu 'Salveaza in cont' si verifica in account", async ({ page, request }) => {
  test.setTimeout(180000)
  const { token } = await createTestCustomer(request)

  const headers = { "x-publishable-api-key": PK, "Content-Type": "application/json", Authorization: `Bearer ${token}` }

  // Creeaza cart
  const pResp = await request.get(`${API}/store/products?limit=1&fields=id,*variants`, { headers })
  const { products } = await pResp.json()
  const variantId = products?.[0]?.variants?.[0]?.id
  const cResp = await request.post(`${API}/store/carts`, { headers, data: { region_id: REGION_RO } })
  const { cart } = await cResp.json()
  await request.post(`${API}/store/carts/${cart.id}/line-items`, { headers, data: { variant_id: variantId, quantity: 1 } })

  const cacheId = `test-cache-${cart.id.slice(-8)}`
  await setAuthCookie(page, token)
  await setCartCookie(page, cart.id, cacheId)

  // ── Step address ──────────────────────────────────────────────────────────────
  await page.goto(`${BASE}/checkout?step=address`, { waitUntil: "domcontentloaded", timeout: 40000 })
  await dismissCookieBanner(page)
  await page.waitForSelector("h3", { timeout: 25000 })

  // Forma direct (fara adrese salvate)
  await expect(page.locator('input[name="shipping_address.address_1"]')).toBeVisible({ timeout: 10000 })
  await expect(page.locator('input[name="save_to_account"]')).toBeChecked()

  await page.fill('[name="shipping_address.first_name"]', "Ana")
  await page.fill('[name="shipping_address.last_name"]', "Ionescu")
  await page.fill('[name="shipping_address.phone"]', "0722500500")
  await page.fill('[name="shipping_address.address_1"]', "Bd. Eroilor 20")
  await page.fill('[name="shipping_address.city"]', "Cluj-Napoca")
  await page.fill('[name="shipping_address.postal_code"]', "400100")
  await page.selectOption('[name="shipping_address.province"]', "Cluj")

  const visibleEmail = page.locator('input[name="email"][type="email"]')
  if (await visibleEmail.count() > 0) await visibleEmail.fill("test@ardmag.ro")

  await page.locator("button[type=submit]", { hasText: /continua spre livrare/i }).click()

  // ── Step delivery ─────────────────────────────────────────────────────────────
  await page.waitForURL(/step=delivery/, { timeout: 20000 })
  await expect(page.locator("h3", { hasText: /metoda de livrare/i })).toBeVisible({ timeout: 15000 })
  // Fan Courier e selectat by default
  await page.locator("button.btn.primary.lg", { hasText: /continua spre plata/i }).click()

  // ── Step payment ──────────────────────────────────────────────────────────────
  await page.waitForURL(/step=payment/, { timeout: 20000 })
  await page.waitForSelector("h3", { timeout: 15000 })
  await page.locator("label", { hasText: /ramburs/i }).click()
  await page.locator("button.btn.primary.lg", { hasText: /revizuieste/i }).click()

  // ── Review + place order ──────────────────────────────────────────────────────
  await page.waitForURL(/step=review/, { timeout: 20000 })
  await page.locator("button", { hasText: /plaseaza comanda/i }).click()
  await page.waitForURL(/\/order\/.*\/confirmed/, { timeout: 30000 })
  expect(page.url()).toMatch(/\/order\/.+\/confirmed/)

  // ── Verifica adresa salvata in /account/addresses ─────────────────────────────
  await page.goto(`${BASE}/account/addresses`, { waitUntil: "domcontentloaded", timeout: 30000 })
  await page.waitForSelector("h2", { timeout: 20000 })
  await expect(page.locator("text=Bd. Eroilor 20")).toBeVisible({ timeout: 10000 })
  await expect(page.locator("text=Ana")).toBeVisible()
})
