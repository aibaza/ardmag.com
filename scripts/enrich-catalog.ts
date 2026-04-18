import { parse } from "csv-parse/sync"
import * as fs from "fs"
import * as path from "path"

const BACKEND_URL = "http://localhost:9000"
const ADMIN_EMAIL = "admin@ardmag.com"
const ADMIN_PASSWORD = "Admin1234!"
const CSV_PATH = path.resolve(__dirname, "../resources/Wix Products Catalog.csv")
const DELAY_MS = 200

// Map Wix collection name → product type label
const CATEGORY_TO_TYPE: Record<string, string> = {
  "MASTICI TENAX":                       "Adeziv",
  "PACHETE PROMOȚIONALE":               "Adeziv",
  "SOLUȚII PENTRU PIATRĂ":              "Soluție",
  "ȘLEFUIRE PIATRĂ":                    "Disc de șlefuire",
  "ABRAZIVI ȘI PERII":                  "Disc de șlefuire",
  "ABRAZIVI OALĂ":                       "Disc de șlefuire",
  "TĂIERE PIATRĂ":                      "Disc de tăiere",
  "DISCURI DE TĂIERE":                  "Disc de tăiere",
  "POLIZARE PIATRĂ":                    "Disc de polizare",
  "CAROTE DIAMANTATE":                   "Carotă diamantată",
  "FREZE DIAMANTATE":                    "Freză diamantată",
  "MAȘINI ȘI SCULE":                    "Sculă / Mașină",
  "MESE DE TĂIAT":                       "Sculă / Mașină",
  "DIVERSE":                             "Accesoriu",
}

// Faza 0 no-collection map (same as import script)
const NO_COLLECTION_MAP: Record<string, string> = {
  "CAROTE DIAMANTATE":                   "ȘLEFUIRE PIATRĂ",
  "DISC DE ȘLEFUIRE CONCAV":            "ȘLEFUIRE PIATRĂ",
  "ÎNTREȚINERE ȘI CERURI":              "SOLUȚII PENTRU PIATRĂ",
  "DETERGENȚI ACIZI":                   "SOLUȚII PENTRU PIATRĂ",
  "DETERGENȚI":                          "SOLUȚII PENTRU PIATRĂ",
  "TRATAMENTE SPECIFICE":               "SOLUȚII PENTRU PIATRĂ",
  "IMPERMEABILIZANȚI PE BAZĂ DE APĂ":  "SOLUȚII PENTRU PIATRĂ",
  "IMPERMEABILIZANȚI PE BAZĂ DE SOLVENȚI": "SOLUȚII PENTRU PIATRĂ",
}

interface WixRow {
  handleId: string
  fieldType: string
  name: string
  collection: string
  ribbon: string
  weight: string
  [key: string]: string
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[șş]/g, "s")
    .replace(/[țţ]/g, "t")
    .replace(/[ăâ]/g, "a")
    .replace(/[î]/g, "i")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

let authToken = ""

async function apiGet(path: string): Promise<unknown> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  })
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`)
  return res.json()
}

async function apiPost(path: string, body: unknown): Promise<unknown> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`POST ${path} → ${res.status}: ${text}`)
  }
  return res.json()
}

async function authenticate(): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/auth/user/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })
  const data = (await res.json()) as { token: string }
  authToken = data.token
}

async function ensureTag(value: string): Promise<string> {
  const handle = slugify(value)
  // Try to find existing
  const res = (await apiGet(`/admin/product-tags?q=${encodeURIComponent(value)}&limit=20`)) as {
    product_tags: Array<{ id: string; value: string }>
  }
  const existing = res.product_tags.find((t) => t.value === value)
  if (existing) return existing.id
  const created = (await apiPost("/admin/product-tags", { value })) as {
    product_tag: { id: string }
  }
  return created.product_tag.id
}

async function ensureType(label: string): Promise<string> {
  const res = (await apiGet(`/admin/product-types?q=${encodeURIComponent(label)}&limit=20`)) as {
    product_types: Array<{ id: string; value: string }>
  }
  const existing = res.product_types.find((t) => t.value === label)
  if (existing) return existing.id
  const created = (await apiPost("/admin/product-types", { value: label })) as {
    product_type: { id: string }
  }
  return created.product_type.id
}

async function main(): Promise<void> {
  console.log("═══════════════════════════════════════════")
  console.log("  Enrichment catalog: tags + tipuri produs")
  console.log("═══════════════════════════════════════════\n")

  await authenticate()
  console.log("✓ Autentificat\n")

  const csvContent = fs.readFileSync(CSV_PATH)
  const rows = parse(csvContent, { columns: true, bom: true, skip_empty_lines: true }) as WixRow[]
  const products = rows.filter((r) => r.fieldType === "Product")

  // Precreate all needed tags and types
  console.log("[1/2] Creare tags și tipuri...")

  const promoTagId = await ensureTag("PROMO 30%")
  console.log(`  ✓ Tag "PROMO 30%" → ${promoTagId}`)

  const typeIds = new Map<string, string>()
  const uniqueTypes = new Set(Object.values(CATEGORY_TO_TYPE))
  for (const label of uniqueTypes) {
    const id = await ensureType(label)
    typeIds.set(label, id)
    console.log(`  ✓ Tip "${label}" → ${id}`)
    await sleep(DELAY_MS)
  }

  // Update products
  console.log("\n[2/2] Actualizare produse...")
  let updated = 0
  let skipped = 0
  let errors = 0

  for (const product of products) {
    const handle = slugify(product.name)

    // Find product in Medusa
    const res = (await apiGet(`/admin/products?handle=${handle}&fields=id,tags`)) as {
      products: Array<{ id: string; tags: Array<{ id: string }> }>
    }
    if (!res.products?.length) {
      console.log(`  ~ ${product.name}: nu există în Medusa, skip`)
      skipped++
      continue
    }
    const medusaProduct = res.products[0]
    const productId = medusaProduct.id

    // Determine updates
    const patch: Record<string, unknown> = {}

    // Tags: accumulate existing + new
    const existingTagIds = (medusaProduct.tags || []).map((t) => ({ id: t.id }))
    const hasPromo = existingTagIds.some((t) => t.id === promoTagId)
    if (product.ribbon?.trim() === "PROMO 30%" && !hasPromo) {
      patch.tags = [...existingTagIds, { id: promoTagId }]
    }

    // Type: from collection → type map
    const colName = product.collection?.trim() || NO_COLLECTION_MAP[product.name?.trim()]
    const typeLabel = colName ? CATEGORY_TO_TYPE[colName] : undefined
    if (typeLabel) {
      patch.type_id = typeIds.get(typeLabel)
    }

    if (Object.keys(patch).length === 0) {
      skipped++
      continue
    }

    try {
      await apiPost(`/admin/products/${productId}`, patch)
      const changes = []
      if (patch.tags) changes.push("tag PROMO 30%")
      if (patch.type_id) changes.push(`tip: ${typeLabel}`)
      console.log(`  ✓ ${product.name}: ${changes.join(", ")}`)
      updated++
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error(`  ✗ ${product.name}: ${msg}`)
      errors++
    }

    await sleep(DELAY_MS)
  }

  console.log("\n═══════════════════════════════════════════")
  console.log(`  Actualizate: ${updated}`)
  console.log(`  Skip:        ${skipped}`)
  console.log(`  Erori:       ${errors}`)
  console.log("═══════════════════════════════════════════\n")
}

main().catch((e) => { console.error(e); process.exit(1) })
