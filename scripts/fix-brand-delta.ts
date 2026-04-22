// Recodează 15 produse din brand:tenax → brand:delta-research
// Confirmat de Andrei Rînziș pe WhatsApp, 22 apr 2026
//
// Usage:
//   npx ts-node scripts/fix-brand-delta.ts          # dry-run (default)
//   npx ts-node scripts/fix-brand-delta.ts --apply  # aplică modificările

const BACKEND_URL = "http://localhost:9000"
const ADMIN_EMAIL = "admin@ardmag.com"
const ADMIN_PASSWORD = "Admin1234!"
const DRY_RUN = !process.argv.includes("--apply")

const DELTA_PRODUCT_TITLES = [
  "ECO DRY+",
  "ECO STONE PRO",
  "ECO TONER",
  "WET SEAL",
  "TOTAL BLACK",
  "SILWAX",
  "DE GRAUB",
  "TERGON",
  "SOLVENTE GAMMA",
  "MAC MUD",
  "CLEAN STONE",
  "STONE WET",
  "RES 1001",
  "PROLUX",
  "SABBIATORE AX/F",
]

interface Tag {
  id: string
  value: string
}

interface Product {
  id: string
  title: string
  handle: string
  tags: Tag[]
}

let authToken = ""

async function authenticate(): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/auth/user/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })
  if (!res.ok) throw new Error(`Auth failed: ${res.status}`)
  const data = (await res.json()) as { token: string }
  authToken = data.token
}

async function apiGet(endpoint: string): Promise<unknown> {
  const res = await fetch(`${BACKEND_URL}${endpoint}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  })
  if (!res.ok) throw new Error(`GET ${endpoint} → ${res.status}`)
  return res.json()
}

async function apiPost(endpoint: string, body: unknown): Promise<unknown> {
  const res = await fetch(`${BACKEND_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`POST ${endpoint} → ${res.status}: ${text}`)
  }
  return res.json()
}

async function apiPatch(endpoint: string, body: unknown): Promise<unknown> {
  const res = await fetch(`${BACKEND_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PATCH ${endpoint} → ${res.status}: ${text}`)
  }
  return res.json()
}

async function ensureTag(value: string): Promise<string> {
  const res = (await apiGet(
    `/admin/product-tags?q=${encodeURIComponent(value)}&limit=20`
  )) as { product_tags: Tag[] }

  const existing = res.product_tags.find((t) => t.value === value)
  if (existing) return existing.id

  const created = (await apiPost("/admin/product-tags", { value })) as {
    product_tag: { id: string }
  }
  return created.product_tag.id
}

async function getAllProducts(): Promise<Product[]> {
  const products: Product[] = []
  let offset = 0
  const limit = 50

  while (true) {
    const res = (await apiGet(
      `/admin/products?limit=${limit}&offset=${offset}&fields=id,title,handle,tags`
    )) as { products: Product[]; count: number }

    products.push(...res.products)
    if (products.length >= res.count) break
    offset += limit
  }

  return products
}

async function main() {
  console.log(`\n=== fix-brand-delta.ts | ${DRY_RUN ? "DRY RUN" : "APPLY"} ===\n`)

  await authenticate()
  console.log("Autentificat.\n")

  const allProducts = await getAllProducts()
  console.log(`Total produse în Medusa: ${allProducts.length}\n`)

  let found = 0
  let updated = 0
  let alreadyCorrect = 0
  let notFound = 0

  for (const title of DELTA_PRODUCT_TITLES) {
    const product = allProducts.find(
      (p) => p.title.trim().toUpperCase() === title.toUpperCase()
    )

    if (!product) {
      console.log(`  ✗ NOT FOUND: "${title}"`)
      notFound++
      continue
    }

    found++
    const currentTags = product.tags || []
    const hasTenax = currentTags.some((t) => t.value === "brand:tenax")
    const hasDelta = currentTags.some((t) => t.value === "brand:delta-research")

    if (!hasTenax && hasDelta) {
      console.log(`  ✓ SKIP "${product.title}" — deja brand:delta-research`)
      alreadyCorrect++
      continue
    }

    if (!hasTenax && !hasDelta) {
      console.log(`  ? "${product.title}" — fără brand tag (adăugăm delta-research)`)
    }

    // Build new tags: remove brand:tenax, add brand:delta-research
    const filteredTags = currentTags
      .filter((t) => t.value !== "brand:tenax")
      .map((t) => ({ id: t.id }))

    if (DRY_RUN) {
      const deltaId = "dry-run-delta"
      const newTags = [...filteredTags, { id: deltaId }]
      console.log(
        `  → DRY RUN "${product.title}" [${product.handle}]: ` +
          `brand:tenax → brand:delta-research | tags finali: ${newTags.length}`
      )
      updated++
    } else {
      const deltaId = await ensureTag("brand:delta-research")
      const newTags = [...filteredTags, { id: deltaId }]

      await fetch(`${BACKEND_URL}/admin/products/${product.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ tags: newTags }),
      }).then(async (res) => {
        if (!res.ok) {
          const text = await res.text()
          throw new Error(`POST /admin/products/${product.id} → ${res.status}: ${text}`)
        }
      })

      console.log(`  ✓ UPDATED "${product.title}" [${product.handle}]: brand:tenax → brand:delta-research`)
      updated++
    }
  }

  console.log(`
─────────────────────────────────────
Găsite:          ${found} / ${DELTA_PRODUCT_TITLES.length}
Actualizate:     ${updated}
Deja corecte:    ${alreadyCorrect}
Negăsite:        ${notFound}
─────────────────────────────────────`)

  if (notFound > 0) {
    console.log("\nATENȚIE: produsele negăsite trebuie verificate manual în admin Medusa.")
  }

  if (DRY_RUN) {
    console.log("\nRulează cu --apply pentru a aplica modificările.")
  } else {
    console.log("\nGata. Verifică în admin Medusa că tag-urile sunt corecte.")
  }
}

main().catch((err) => {
  console.error("EROARE:", err.message)
  process.exit(1)
})
