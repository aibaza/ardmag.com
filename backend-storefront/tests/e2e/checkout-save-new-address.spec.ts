import { test, expect } from "@playwright/test"
import { API, PK, BASE, createTestCustomer, setAuthCookie, setCartCookie, dismissCookieBanner } from "./helpers/auth"

const REGION_RO = "reg_01KPH383249W5F5HP8Z2ZWMR5A"

test("Checkout: adresa noua introdusa cu 'Salveaza in cont' apare in account", async ({ page, request }) => {
  test.setTimeout(120000)
  const { token } = await createTestCustomer(request)

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

  // ── Step address: user logat, 0 adrese salvate ─────────────────────────────────
  await page.goto(`${BASE}/checkout?step=address`, { waitUntil: "domcontentloaded", timeout: 40000 })
  await dismissCookieBanner(page)
  await page.waitForSelector("h3", { timeout: 25000 })

  // Forma direct (fara picker — nu exista adrese salvate)
  await expect(page.locator('input[name="shipping_address.address_1"]')).toBeVisible({ timeout: 10000 })

  // Checkbox "Salveaza in cont" e prezent (check-row: input e opacity:0, verificam prin isChecked)
  const saveInput = page.locator('input[name="save_to_account"]')
  expect(await saveInput.isChecked()).toBe(true)
  await expect(page.locator("label.check-row", { hasText: /salveaza/i })).toBeVisible()

  // Completeaza form-ul
  await page.fill('[name="shipping_address.first_name"]', "Ana")
  await page.fill('[name="shipping_address.last_name"]', "Ionescu")
  await page.fill('[name="shipping_address.phone"]', "0722500500")
  await page.fill('[name="shipping_address.address_1"]', "Bd. Eroilor 20")
  await page.fill('[name="shipping_address.city"]', "Cluj-Napoca")
  await page.fill('[name="shipping_address.postal_code"]', "400100")
  await page.selectOption('[name="shipping_address.province"]', "Cluj")

  // Email e pre-setat din cont (hidden input); altfel completeaza
  const visibleEmail = page.locator('input[name="email"][type="email"]')
  if (await visibleEmail.count() > 0) await visibleEmail.fill("test@ardmag.ro")

  // Submit → redirect la delivery (confirma ca adresa a fost salvata in cart)
  await page.locator("button[type=submit]", { hasText: /continua spre livrare/i }).click()
  await page.waitForURL(/step=delivery/, { timeout: 20000 })
  await expect(page.locator("h3", { hasText: /metoda de livrare/i })).toBeVisible({ timeout: 15000 })

  // ── Verifica adresa salvata in /account/addresses ─────────────────────────────
  // Adresa a fost trimisa catre Medusa via "save_to_account" flag in setAddresses
  // Dam un scurt timp ca request-ul async de save sa se proceseze
  await page.waitForTimeout(2000)
  await page.goto(`${BASE}/account/addresses`, { waitUntil: "domcontentloaded", timeout: 30000 })
  await page.waitForSelector("h2", { timeout: 20000 })
  await expect(page.locator("text=Bd. Eroilor 20")).toBeVisible({ timeout: 15000 })
  await expect(page.locator("text=Ana")).toBeVisible()
})

test("Checkout: form arata pickerul cand exista adrese salvate", async ({ page, request }) => {
  test.setTimeout(120000)
  const { token } = await createTestCustomer(request)

  const headers = { "x-publishable-api-key": PK, "Content-Type": "application/json", Authorization: `Bearer ${token}` }

  // Adauga o adresa via API
  await request.post(`${API}/store/customers/me/addresses`, {
    headers,
    data: { first_name: "Ion", last_name: "Pop", address_1: "Str. Test 10", city: "Cluj-Napoca", province: "Cluj", postal_code: "400001", country_code: "ro", phone: "0722000000", is_default_shipping: true, is_default_billing: true },
  })

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

  // Picker-ul e vizibil (user are 1 adresa salvata)
  await expect(page.locator("label", { hasText: /str. test 10/i })).toBeVisible({ timeout: 10000 })
  await expect(page.locator('input[type="radio"]:checked')).toHaveCount(1)

  // Nu exista input manual vizibil (picker mode activ)
  await expect(page.locator('input[name="shipping_address.address_1"]')).not.toBeVisible()

  // "+ Foloseste o adresa noua" link e prezent
  await expect(page.locator("button", { hasText: /adresa noua/i })).toBeVisible()

  // Click pe "Adresa noua" → apare form-ul manual cu checkbox "Salveaza in cont"
  await page.locator("button", { hasText: /adresa noua/i }).click()
  await expect(page.locator('input[name="shipping_address.address_1"]')).toBeVisible({ timeout: 5000 })
  // check-row: input e opacity:0 — verificam label-ul vizibil
  await expect(page.locator("label.check-row", { hasText: /salveaza/i })).toBeVisible()
})
