// Medusa v2 API client for the enrichment pipeline.
// Uses native fetch (Node 18+). No axios.

const BACKEND_URL = "http://localhost:9000"
const ADMIN_EMAIL = "admin@ardmag.com"
const ADMIN_PASSWORD = "Admin1234!"
const PUBLISHABLE_KEY =
  "pk_56dae88717f8f6c8d4632979fb5f50d99ef68a41a6e89096ef500063ee7a35af"
const DELAY_MS = 200

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminProduct {
  id: string
  handle: string
  title: string
  status: string
  tags: Array<{ id: string; value: string }>
  metadata: Record<string, unknown> | null
  thumbnail: string | null
  images: Array<{ id: string; url: string }>
  variants: Array<{ id: string }>
}

export interface StoreProduct {
  id: string
  handle: string
  title: string
  status: string
  tags: Array<{ value: string }>
  metadata: Record<string, unknown> | null
  images: Array<{ url: string }>
  thumbnail: string | null
}

export interface ProductPatch {
  tags?: Array<{ id: string }>
  metadata?: Record<string, unknown>
  images?: Array<{ url: string }>
  thumbnail?: string
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

let authToken = ""

export async function authenticate(): Promise<void> {
  if (authToken) return

  const res = await fetch(`${BACKEND_URL}/auth/user/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })
  if (!res.ok) throw new Error(`authenticate() → ${res.status}`)
  const data = (await res.json()) as { token: string }
  authToken = data.token
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function adminGet<T>(endpoint: string): Promise<T> {
  await sleep(DELAY_MS)
  const res = await fetch(`${BACKEND_URL}${endpoint}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  })
  if (res.status === 401) {
    // Force re-auth and retry once
    authToken = ""
    await authenticate()
    const retry = await fetch(`${BACKEND_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    if (!retry.ok) throw new Error(`GET ${endpoint} → ${retry.status}`)
    return retry.json() as Promise<T>
  }
  if (!res.ok) throw new Error(`GET ${endpoint} → ${res.status}`)
  return res.json() as Promise<T>
}

async function adminPost<T>(endpoint: string, body: unknown): Promise<T> {
  await sleep(DELAY_MS)
  const res = await fetch(`${BACKEND_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(body),
  })
  if (res.status === 401) {
    authToken = ""
    await authenticate()
    const retry = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    })
    if (!retry.ok) {
      const text = await retry.text()
      throw new Error(`POST ${endpoint} → ${retry.status}: ${text}`)
    }
    return retry.json() as Promise<T>
  }
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`POST ${endpoint} → ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

// ─── Tag registry ─────────────────────────────────────────────────────────────

const tagCache = new Map<string, string>() // value -> id

export async function ensureTag(value: string): Promise<string> {
  if (tagCache.has(value)) return tagCache.get(value)!

  await authenticate()

  const data = await adminGet<{ product_tags: Array<{ id: string; value: string }> }>(
    `/admin/product-tags?q=${encodeURIComponent(value)}&limit=20`
  )

  const existing = data.product_tags.find((t) => t.value === value)
  if (existing) {
    tagCache.set(value, existing.id)
    return existing.id
  }

  const created = await adminPost<{ product_tag: { id: string } }>(
    "/admin/product-tags",
    { value }
  )
  tagCache.set(value, created.product_tag.id)
  return created.product_tag.id
}

// ─── Product queries ──────────────────────────────────────────────────────────

export async function getAllProducts(): Promise<AdminProduct[]> {
  await authenticate()

  const all: AdminProduct[] = []
  let offset = 0
  const limit = 200

  while (true) {
    const data = await adminGet<{
      products: AdminProduct[]
      count: number
    }>(`/admin/products?limit=${limit}&offset=${offset}`)

    all.push(...data.products)

    if (all.length >= data.count || data.products.length < limit) break
    offset += limit
  }

  return all
}

export async function getProduct(handle: string): Promise<AdminProduct | null> {
  await authenticate()

  const data = await adminGet<{ products: AdminProduct[] }>(
    `/admin/products?handle=${encodeURIComponent(handle)}&fields=id,handle,title,status,tags.id,tags.value,metadata,thumbnail,images.id,images.url,variants.id`
  )

  return data.products?.[0] ?? null
}

export async function patchProduct(id: string, payload: ProductPatch): Promise<void> {
  await authenticate()
  await adminPost<unknown>(`/admin/products/${id}`, payload)
}

// ─── Store API ────────────────────────────────────────────────────────────────

export async function storeGetProduct(handle: string): Promise<StoreProduct | null> {
  await sleep(DELAY_MS)

  const url =
    `${BACKEND_URL}/store/products?handle=${encodeURIComponent(handle)}` +
    `&fields=+tags.value,+metadata,+images.url`

  const res = await fetch(url, {
    headers: { "x-publishable-api-key": PUBLISHABLE_KEY },
  })

  if (res.status === 404) return null
  if (!res.ok) throw new Error(`GET /store/products?handle=${handle} → ${res.status}`)

  const data = (await res.json()) as { products: StoreProduct[] }
  return data.products?.[0] ?? null
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

export function getPublishableKey(): string {
  return PUBLISHABLE_KEY
}
