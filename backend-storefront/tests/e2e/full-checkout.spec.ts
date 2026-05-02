import { test, expect } from "@playwright/test"

// Testeaza impotriva Vercel production
const BASE = process.env.TEST_BASE_URL ?? "https://ardmag.surcod.ro"
const API  = "https://api.ardmag.surcod.ro"
const PK   = "pk_56dae88717f8f6c8d4632979fb5f50d99ef68a41a6e89096ef500063ee7a35af"
const REGION_RO     = "reg_01KPH383249W5F5HP8Z2ZWMR5A"
const SO_FAN_COURIER = "so_01KPNGZ3XT33XGDJQJS67R995C"

const isVercel = BASE.includes("surcod.ro") || BASE.includes("vercel.app")
const cookieDomain = isVercel ? "ardmag.surcod.ro" : "localhost"

async function createReadyCart(request: any): Promise<string> {
  const headers = { "x-publishable-api-key": PK, "Content-Type": "application/json" }

  const pResp = await request.get(`${API}/store/products?limit=1&fields=id,*variants`, { headers })
  const pData = await pResp.json()
  const variantId = pData.products?.[0]?.variants?.[0]?.id
  if (!variantId) throw new Error("No variant found")

  const cResp = await request.post(`${API}/store/carts`, { headers, data: { region_id: REGION_RO } })
  const cartId = (await cResp.json()).cart?.id
  if (!cartId) throw new Error("Cart creation failed")

  await request.post(`${API}/store/carts/${cartId}/line-items`, {
    headers, data: { variant_id: variantId, quantity: 1 }
  })
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
  await request.post(`${API}/store/carts/${cartId}/shipping-methods`, {
    headers, data: { option_id: SO_FAN_COURIER }
  })

  return cartId
}

async function setCartCookie(page: any, cartId: string) {
  await page.context().addCookies([{
    name: "_medusa_cart_id", value: cartId,
    domain: cookieDomain, path: "/", httpOnly: false, secure: isVercel,
    sameSite: "Lax",
  }])
}

async function dismissCookieBanner(page: any) {
  const btn = page.locator("button", { hasText: /accepta toate/i })
  try {
    await btn.waitFor({ state: "visible", timeout: 3000 })
    await btn.click()
  } catch {
    // banner absent, merge mai departe
  }
}

test("Checkout complet: address API → delivery (Fan Courier) → Stripe card → review → comanda plasata", async ({ page, request }) => {
  const cartId = await createReadyCart(request)
  console.log("Cart:", cartId)
  await setCartCookie(page, cartId)

  // ── Step payment ─────────────────────────────────────────────────────────────
  await page.goto(`${BASE}/checkout?step=payment`, { waitUntil: "domcontentloaded", timeout: 40000 })
  await page.waitForSelector("h3", { timeout: 30000 })

  await dismissCookieBanner(page)

  // Verifica pretul Fan Courier apare in sumar
  await expect(page.locator("td", { hasText: "Transport" })).toBeVisible({ timeout: 10000 })

  // Stripe selectat by default, apasa continua cu cardul
  const stripeLabel = page.locator("label", { hasText: /card bancar/i })
  await expect(stripeLabel).toBeVisible()
  await stripeLabel.click()

  await page.locator("button.btn.primary.lg", { hasText: /continua cu cardul/i }).click()

  // ── Stripe CardElement ────────────────────────────────────────────────────────
  await page.waitForSelector('iframe[src*="stripe"]', { timeout: 25000 })

  // Intra in iframe-ul Stripe CardElement
  // Stripe CardElement are un iframe cu name "__privateStripeFrame..."
  const cardFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first()

  await cardFrame.locator('[placeholder="Card number"]').click()
  await cardFrame.locator('[placeholder="Card number"]').fill("4242424242424242")
  await cardFrame.locator('[placeholder="MM / YY"]').fill("1234")
  await cardFrame.locator('[placeholder="CVC"]').fill("123")

  // ── Confirma plata ────────────────────────────────────────────────────────────
  const confirmBtn = page.locator("button", { hasText: /plata cu cardul/i })
  await expect(confirmBtn).toBeVisible({ timeout: 5000 })
  await confirmBtn.click()

  // ── Review step ───────────────────────────────────────────────────────────────
  await page.waitForURL(/step=review/, { timeout: 30000 })
  await expect(page.locator("h3", { hasText: /confirma comanda/i })).toBeVisible({ timeout: 10000 })

  // Verifica date corecte in review
  await expect(page.locator("text=Card bancar")).toBeVisible()
  await expect(page.locator("text=Fan Courier")).toBeVisible()

  // ── Plaseaza comanda ──────────────────────────────────────────────────────────
  await page.locator("button", { hasText: /plaseaza comanda/i }).click()

  // ── Confirmare ────────────────────────────────────────────────────────────────
  await page.waitForURL(/\/order\/.*\/confirmed/, { timeout: 30000 })
  const finalUrl = page.url()
  console.log("Order confirmed URL:", finalUrl)

  expect(finalUrl).toMatch(/\/order\/.+\/confirmed/)
}, { timeout: 120000 })

test("Checkout Ramburs: delivery → payment ramburs → review → comanda plasata", async ({ page, request }) => {
  const cartId = await createReadyCart(request)
  console.log("Cart:", cartId)
  await setCartCookie(page, cartId)

  await page.goto(`${BASE}/checkout?step=payment`, { waitUntil: "domcontentloaded", timeout: 40000 })
  await page.waitForSelector("h3", { timeout: 30000 })

  await dismissCookieBanner(page)

  // Selecteaza Ramburs
  const rambursLabel = page.locator("label", { hasText: /ramburs/i })
  await expect(rambursLabel).toBeVisible()
  await rambursLabel.click()

  // Click "Revizuieste comanda"
  await page.locator("button.btn.primary.lg", { hasText: /revizuieste comanda/i }).click()

  // ── Review step ───────────────────────────────────────────────────────────────
  await page.waitForURL(/step=review/, { timeout: 20000 })
  await expect(page.locator("h3", { hasText: /confirma comanda/i })).toBeVisible({ timeout: 10000 })

  await expect(page.locator("text=Ramburs")).toBeVisible()
  await expect(page.locator("text=Fan Courier")).toBeVisible()

  // ── Plaseaza comanda ──────────────────────────────────────────────────────────
  await page.locator("button", { hasText: /plaseaza comanda/i }).click()

  await page.waitForURL(/\/order\/.*\/confirmed/, { timeout: 30000 })
  const finalUrl = page.url()
  console.log("Order confirmed URL:", finalUrl)

  expect(finalUrl).toMatch(/\/order\/.+\/confirmed/)
}, { timeout: 90000 })
