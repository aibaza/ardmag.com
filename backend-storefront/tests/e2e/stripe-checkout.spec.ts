import { test, expect } from "@playwright/test"

const BASE = "http://localhost:8000"
const API  = "https://api.ardmag.surcod.ro"
const PK   = "pk_56dae88717f8f6c8d4632979fb5f50d99ef68a41a6e89096ef500063ee7a35af"
const REGION_RO  = "reg_01KPH383249W5F5HP8Z2ZWMR5A"
const SO_FAN_COURIER = "so_01KPNGZ3XT33XGDJQJS67R995C"

async function h() {
  return { "x-publishable-api-key": PK, "Content-Type": "application/json" }
}

async function createReadyCartForPayment(request: any): Promise<string> {
  const headers = await h()

  // 1. get variant
  const pResp = await request.get(`${API}/store/products?limit=1&fields=id,*variants`, { headers })
  const pData = await pResp.json()
  const variantId = pData.products?.[0]?.variants?.[0]?.id
  if (!variantId) throw new Error("No variant found")

  // 2. create cart
  const cResp = await request.post(`${API}/store/carts`, { headers, data: { region_id: REGION_RO } })
  const cartId = (await cResp.json()).cart?.id
  if (!cartId) throw new Error("Cart creation failed")

  // 3. add item
  await request.post(`${API}/store/carts/${cartId}/line-items`, {
    headers, data: { variant_id: variantId, quantity: 1 }
  })

  // 4. set shipping address + email
  await request.post(`${API}/store/carts/${cartId}`, {
    headers,
    data: {
      email: "test@ardmag.ro",
      shipping_address: {
        first_name: "Ion", last_name: "Pop",
        address_1: "Str. Test 1", city: "Cluj-Napoca",
        province: "Cluj", postal_code: "400001",
        country_code: "ro", phone: "0722000000",
      },
    },
  })

  // 5. set shipping method
  await request.post(`${API}/store/carts/${cartId}/shipping-methods`, {
    headers, data: { option_id: SO_FAN_COURIER }
  })

  return cartId
}

async function setCartCookie(page: any, cartId: string) {
  await page.context().addCookies([{
    name: "_medusa_cart_id", value: cartId,
    domain: "localhost", path: "/", httpOnly: false, secure: false,
  }])
}

test("Stripe CardElement apare dupa selectare metoda card", async ({ page, request }) => {
  const cartId = await createReadyCartForPayment(request)
  await setCartCookie(page, cartId)

  await page.goto(`${BASE}/checkout?step=payment`)
  await page.waitForSelector("h3", { timeout: 15000 })

  const stripeLabel = page.locator("label", { hasText: /card bancar/i })
  await expect(stripeLabel).toBeVisible({ timeout: 10000 })
  await stripeLabel.click()

  await page.locator("button.btn.primary", { hasText: /continua cu cardul/i }).click()

  await page.waitForSelector('iframe[src*="stripe"]', { timeout: 20000 })
  const iframes = await page.locator('iframe[src*="stripe"]').count()
  expect(iframes).toBeGreaterThan(0)

  await expect(page.locator("button", { hasText: /confirm/i })).toBeVisible()
})

test("Ramburs merge direct la review fara card form", async ({ page, request }) => {
  const cartId = await createReadyCartForPayment(request)
  await setCartCookie(page, cartId)

  await page.goto(`${BASE}/checkout?step=payment`)
  await page.waitForSelector("h3", { timeout: 15000 })

  // select ramburs (system_default)
  const rambursLabel = page.locator("label", { hasText: /ramburs/i })
  await expect(rambursLabel).toBeVisible({ timeout: 10000 })
  await rambursLabel.click()

  await page.locator("button.btn.primary", { hasText: /revizuieste/i }).click()
  await page.waitForURL(/step=review/, { timeout: 15000 })

  // Stripe.js injects hidden fraud-detection iframes globally; what matters is
  // that the card form (CardElement) is NOT rendered on the review page.
  await expect(page.locator('[placeholder="Card number"]')).not.toBeVisible()
  await expect(page.locator("button", { hasText: /plaseaza comanda/i })).toBeVisible()
})
