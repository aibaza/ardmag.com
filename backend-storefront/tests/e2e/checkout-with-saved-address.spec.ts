import { test, expect } from "@playwright/test"
import { API, PK, BASE, createTestCustomer, setAuthCookie, setCartCookie, dismissCookieBanner, addAddress } from "./helpers/auth"

const REGION_RO = "reg_01KPH383249W5F5HP8Z2ZWMR5A"

test("Checkout picker: doua adrese salvate, default selectat, billing toggle arata al doilea picker", async ({ page, request }) => {
  test.setTimeout(120000)
  const { token } = await createTestCustomer(request)

  // 2 adrese: una default shipping, alta default billing
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

  await page.goto(`${BASE}/checkout?step=address`, { waitUntil: "domcontentloaded", timeout: 40000 })
  await dismissCookieBanner(page)
  await page.waitForSelector("h3", { timeout: 25000 })

  // Picker-ul shipping arata ambele adrese; default shipping ("Acasa") e selectata
  await expect(page.locator("label", { hasText: /acasa/i }).first()).toBeVisible({ timeout: 10000 })
  await expect(page.locator("label", { hasText: /birou/i }).first()).toBeVisible()
  // Default shipping e selectata (checked radio)
  await expect(page.locator('input[type="radio"]:checked')).toHaveCount(1)

  // Badge "Livrare implicita" pe Acasa card
  await expect(page.locator(".badge.stock-in", { hasText: /livrare implicita/i })).toBeVisible()

  // "Aceeasi adresa pentru facturare" e bifat by default
  const sameCheckbox = page.locator('input[name="same_as_billing"]')
  await expect(sameCheckbox).toBeChecked()

  // Debifa → apare sectiunea billing
  await sameCheckbox.uncheck()
  await expect(page.locator("h3", { hasText: /facturare/i })).toBeVisible({ timeout: 5000 })

  // Picker billing are badge-ul "Facturare implicita" pe Birou
  await expect(page.locator(".badge", { hasText: /facturare implicita/i })).toBeVisible()
})

test("Checkout cu adresa salvata: submit picker → cart are adresa setata → redirect delivery", async ({ page, request }) => {
  test.setTimeout(120000)
  const { token } = await createTestCustomer(request)

  await addAddress(request, token, { address_name: "Acasa", address_1: "Str. Livrare 10", city: "Cluj-Napoca", province: "Cluj", postal_code: "400001", is_default_shipping: true, is_default_billing: true })

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

  await page.goto(`${BASE}/checkout?step=address`, { waitUntil: "domcontentloaded", timeout: 40000 })
  await dismissCookieBanner(page)
  await page.waitForSelector("h3", { timeout: 25000 })

  // Picker arata adresa salvata
  await expect(page.locator("label", { hasText: /str. livrare 10/i })).toBeVisible({ timeout: 10000 })

  // Submit cu adresa din picker (default selectata)
  await page.locator("button[type=submit]", { hasText: /continua spre livrare/i }).click()

  // Redirect la delivery confirma ca adresa a fost aplicata pe cart corect
  await page.waitForURL(/step=delivery/, { timeout: 25000 })
  await expect(page.locator("h3", { hasText: /metoda de livrare/i })).toBeVisible({ timeout: 15000 })
  await expect(page.locator("text=Fan Courier")).toBeVisible()
})
