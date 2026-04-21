// Sets includes_tax: true on all RON prices for all existing products.
// Run once after the import to fix prices that were created without includes_tax.
//
// Usage: cd scripts && npx ts-node fix-prices-includes-tax.ts

const BACKEND_URL = "https://admin.ardmag.surmont.co"
const ADMIN_EMAIL = "admin@ardmag.com"
const ADMIN_PASSWORD = "Admin1234!"
const CURRENCY = "ron"
const CONCURRENCY = 20
const TIMEOUT_MS = 15000

let authToken = ""

async function apiFetch(path: string, opts: RequestInit = {}): Promise<any> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      ...opts,
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
        ...(opts.headers ?? {}),
      },
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`${res.status}: ${text}`)
    }
    return res.json()
  } finally {
    clearTimeout(timer)
  }
}

async function login() {
  const controller = new AbortController()
  setTimeout(() => controller.abort(), TIMEOUT_MS)
  const res = await fetch(`${BACKEND_URL}/auth/user/emailpass`, {
    method: "POST",
    signal: controller.signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })
  if (!res.ok) throw new Error(`Login failed: ${res.status}`)
  authToken = (await res.json()).token
}

async function getAllProducts(): Promise<{ id: string; variants: { id: string }[] }[]> {
  const limit = 100
  let offset = 0
  const all: any[] = []
  while (true) {
    const data = await apiFetch(`/admin/products?limit=${limit}&offset=${offset}&fields=id,variants.id`)
    all.push(...data.products)
    if (all.length >= data.count) break
    offset += limit
  }
  return all
}

// Run tasks with max concurrency
async function pool<T>(items: T[], concurrency: number, fn: (item: T) => Promise<void>) {
  const queue = [...items]
  async function worker() {
    while (queue.length > 0) {
      const item = queue.shift()!
      await fn(item)
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker))
}

async function main() {
  console.log("Logging in...")
  await login()

  console.log("Fetching products...")
  const products = await getAllProducts()
  const pairs: { productId: string; variantId: string }[] = products.flatMap((p) =>
    (p.variants ?? []).map((v: any) => ({ productId: p.id, variantId: v.id }))
  )
  console.log(`Found ${products.length} products, ${pairs.length} variants\n`)

  let updated = 0
  let alreadyOk = 0
  let errors = 0

  await pool(pairs, CONCURRENCY, async ({ productId, variantId }) => {
    try {
      const vdata = await apiFetch(`/admin/products/${productId}/variants/${variantId}`)
      const prices: any[] = vdata.variant?.prices ?? []
      const ron = prices.filter((p: any) => p.currency_code === CURRENCY)
      const toFix = ron.filter((p: any) => !p.includes_tax)

      if (toFix.length === 0) {
        alreadyOk += ron.length
        return
      }

      await apiFetch(`/admin/products/${productId}/variants/${variantId}`, {
        method: "POST",
        body: JSON.stringify({
          prices: toFix.map((p: any) => ({
            id: p.id,
            amount: p.amount,
            currency_code: CURRENCY,
            includes_tax: true,
          })),
        }),
      })
      updated += toFix.length
      process.stdout.write(".")
    } catch (e: any) {
      process.stdout.write("E")
      errors++
    }
  })

  console.log("\n\nDone.")
  console.log(`  Updated    : ${updated}`)
  console.log(`  Already ok : ${alreadyOk}`)
  console.log(`  Errors     : ${errors}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
