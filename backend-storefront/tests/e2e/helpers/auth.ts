const API  = "https://api.ardmag.surcod.ro"
const PK   = "pk_56dae88717f8f6c8d4632979fb5f50d99ef68a41a6e89096ef500063ee7a35af"
const BASE = process.env.TEST_BASE_URL ?? "https://ardmag.surcod.ro"

export const isVercel = BASE.includes("surcod.ro") || BASE.includes("vercel.app")
export const cookieDomain = isVercel ? "ardmag.surcod.ro" : "localhost"
export { API, PK, BASE }

export async function createTestCustomer(request: any): Promise<{ email: string; token: string; customerId: string }> {
  const ts = Date.now()
  const email = `e2e_${ts}@ardmag.ro`
  const password = "Test1234!"
  const headers = { "x-publishable-api-key": PK, "Content-Type": "application/json" }

  // 1. Register
  const regResp = await request.post(`${API}/auth/customer/emailpass/register`, {
    data: { email, password },
    headers,
  })
  const { token: regToken } = await regResp.json()
  if (!regToken) throw new Error("Register failed")

  // 2. Create customer profile
  const custResp = await request.post(`${API}/store/customers`, {
    data: { email, first_name: "Test", last_name: "E2E" },
    headers: { ...headers, Authorization: `Bearer ${regToken}` },
  })
  const { customer } = await custResp.json()
  if (!customer?.id) throw new Error("Customer creation failed")

  // 3. Login for session token
  const loginResp = await request.post(`${API}/auth/customer/emailpass`, {
    data: { email, password },
    headers,
  })
  const { token } = await loginResp.json()
  if (!token) throw new Error("Login failed")

  return { email, token, customerId: customer.id }
}

export async function setAuthCookie(page: any, token: string) {
  await page.context().addCookies([{
    name: "_medusa_jwt",
    value: token,
    domain: cookieDomain,
    path: "/",
    httpOnly: true,
    secure: isVercel,
    sameSite: "Strict",
  }])
}

export async function setCartCookie(page: any, cartId: string, cacheId?: string) {
  const cookies = [{
    name: "_medusa_cart_id",
    value: cartId,
    domain: cookieDomain,
    path: "/",
    httpOnly: false,
    secure: isVercel,
    sameSite: "Lax",
  }] as any[]

  if (cacheId) {
    cookies.push({
      name: "_medusa_cache_id",
      value: cacheId,
      domain: cookieDomain,
      path: "/",
      httpOnly: false,
      secure: isVercel,
      sameSite: "Lax",
    })
  }

  await page.context().addCookies(cookies)
}

export async function dismissCookieBanner(page: any) {
  try {
    const btn = page.locator("button", { hasText: /accepta toate/i })
    await btn.waitFor({ state: "visible", timeout: 3000 })
    await btn.click()
  } catch {}
}

export async function addAddress(
  request: any,
  token: string,
  overrides: Record<string, unknown> = {}
) {
  const headers = {
    "x-publishable-api-key": PK,
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  }
  const resp = await request.post(`${API}/store/customers/me/addresses`, {
    headers,
    data: {
      first_name: "Ion",
      last_name: "Pop",
      address_1: "Str. Test 1",
      city: "Cluj-Napoca",
      province: "Cluj",
      postal_code: "400001",
      country_code: "ro",
      phone: "0722000000",
      is_default_shipping: false,
      is_default_billing: false,
      ...overrides,
    },
  })
  const body = await resp.json()
  const addresses: any[] = body.customer?.addresses ?? []
  return addresses[addresses.length - 1]
}
