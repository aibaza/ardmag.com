import { parse } from "csv-parse/sync"
import * as fs from "fs"
import * as path from "path"

// ─── Config ───────────────────────────────────────────────────────────────────

const BACKEND_URL = "http://localhost:9000"
const ADMIN_EMAIL = "admin@ardmag.com"
const ADMIN_PASSWORD = "Admin1234!"
const CSV_PATH = path.resolve(__dirname, "../resources/Wix Products Catalog.csv")
const AUDIT_LOG_PATH = path.resolve(__dirname, "enrichment-audit.jsonl")
const DELAY_MS = 200

const DRY_RUN = !process.argv.includes("--apply")

// ─── Types ────────────────────────────────────────────────────────────────────

interface WixRow {
  handleId: string
  fieldType: string
  name: string
  description: string
  collection: string
  ribbon: string
  additionalInfoTitle1: string
  additionalInfoDescription1: string
  [key: string]: string
}

interface MedusaProduct {
  id: string
  title: string
  handle: string
  description: string | null
  tags: Array<{ id: string; value: string }>
  metadata: Record<string, unknown> | null
}

interface AuditEntry {
  product_id: string
  handle: string
  fields_updated: string[]
  tags_added: string[]
  timestamp: string
  source: string
  dry_run: boolean
}

interface EnrichStats {
  productsScanned: number
  productsUpdated: number
  productsSkipped: number
  descriptionsSet: number
  tagsCreated: number
  tagsAdded: number
  metadataSet: number
  errors: string[]
  startTime: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function isUsableDescription(html: string | undefined | null): boolean {
  if (!html) return false
  const stripped = html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, "").replace(/\s/g, "")
  return stripped.length > 20
}

function detectBrand(product: WixRow): string | null {
  const collection = product.collection?.trim()
  if (collection === "MASTICI TENAX") return "brand:tenax"

  const text = ((product.description || "") + " " + (product.name || "")).toLowerCase()
  if (/\bsait/.test(text)) return "brand:sait"
  if (/woosuk/.test(text)) return "brand:woosuk"
  if (/delta research/.test(text)) return "brand:delta-research"
  // Explicit Tenax mention outside MASTICI TENAX collection
  if (/\btenax\b/.test(text)) return "brand:tenax"
  return null
}

function detectMaterials(product: WixRow): string[] {
  // If product has TIP PIATRĂ or MATERIAL option, material is already structured
  for (let i = 1; i <= 6; i++) {
    const optName = product[`productOptionName${i}`]?.trim().toUpperCase()
    if (optName === "TIP PIATRĂ" || optName === "MATERIAL") return []
  }

  const text = ((product.description || "") + " " + (product.name || "")).toLowerCase()
  const tags: string[] = []
  if (/marmur|marmo/.test(text)) tags.push("material:marmura")
  if (/granit|granito/.test(text)) tags.push("material:granit")
  if (/cuarț|cuart|quartz/.test(text)) tags.push("material:cuart")
  if (/ceramică|ceramic/.test(text)) tags.push("material:ceramica")
  if (/andezit/.test(text)) tags.push("material:andezit")
  if (/travertin/.test(text)) tags.push("material:travertin")
  if (/piatră naturală|piatra naturala/.test(text)) tags.push("material:piatra-naturala")
  return tags
}

function appendAudit(entry: AuditEntry): void {
  fs.appendFileSync(AUDIT_LOG_PATH, JSON.stringify(entry) + "\n", "utf8")
}

// ─── API Client ───────────────────────────────────────────────────────────────

let authToken = ""

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
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`POST ${endpoint} → ${res.status}: ${text}`)
  }
  return res.json()
}

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

// ─── Tag Registry ─────────────────────────────────────────────────────────────

const tagCache = new Map<string, string>() // value → id

async function ensureTag(value: string): Promise<string> {
  if (tagCache.has(value)) return tagCache.get(value)!

  const res = (await apiGet(
    `/admin/product-tags?q=${encodeURIComponent(value)}&limit=20`
  )) as { product_tags: Array<{ id: string; value: string }> }

  const existing = res.product_tags.find((t) => t.value === value)
  if (existing) {
    tagCache.set(value, existing.id)
    return existing.id
  }

  const created = (await apiPost("/admin/product-tags", { value })) as {
    product_tag: { id: string }
  }
  tagCache.set(value, created.product_tag.id)
  return created.product_tag.id
}

// ─── Product Enrichment ───────────────────────────────────────────────────────

async function enrichProduct(
  wixProduct: WixRow,
  medusaProduct: MedusaProduct,
  stats: EnrichStats
): Promise<void> {
  const patch: Record<string, unknown> = {}
  const fieldsUpdated: string[] = []
  const tagsAdded: string[] = []

  // --- Description ---
  const csvDesc = wixProduct.description?.trim()
  if (isUsableDescription(csvDesc) && !isUsableDescription(medusaProduct.description)) {
    patch.description = csvDesc
    fieldsUpdated.push("description")
    stats.descriptionsSet++
  }

  // --- Tags ---
  const desiredTagValues: string[] = []

  const brand = detectBrand(wixProduct)
  if (brand) desiredTagValues.push(brand)

  const materials = detectMaterials(wixProduct)
  desiredTagValues.push(...materials)

  if (wixProduct.ribbon?.trim() === "PROMO 30%") {
    desiredTagValues.push("promo:30")
  }

  if (desiredTagValues.length > 0) {
    const existingValues = new Set((medusaProduct.tags || []).map((t) => t.value))
    const newValues = desiredTagValues.filter((v) => !existingValues.has(v))

    if (newValues.length > 0) {
      // Resolve IDs for new tags (create if needed)
      const newTagIds: Array<{ id: string }> = []
      for (const value of newValues) {
        const id = DRY_RUN ? `dry-run-${slugify(value)}` : await ensureTag(value)
        newTagIds.push({ id })
        tagsAdded.push(value)
        if (!DRY_RUN) stats.tagsCreated++
        await sleep(50)
      }

      // Merge existing + new tag IDs
      const existingTagIds = (medusaProduct.tags || []).map((t) => ({ id: t.id }))
      patch.tags = [...existingTagIds, ...newTagIds]
      fieldsUpdated.push(`tags(${tagsAdded.join(", ")})`)
      stats.tagsAdded += newValues.length
    }
  }

  // --- Metadata: promo_bulk ---
  if (
    wixProduct.additionalInfoTitle1?.trim() &&
    wixProduct.additionalInfoDescription1?.trim()
  ) {
    const existingMeta = medusaProduct.metadata || {}
    if (!existingMeta.promo_bulk) {
      patch.metadata = {
        ...existingMeta,
        promo_bulk_title: wixProduct.additionalInfoTitle1.trim(),
        promo_bulk: wixProduct.additionalInfoDescription1.trim(),
      }
      fieldsUpdated.push("metadata.promo_bulk")
      stats.metadataSet++
    }
  }

  // No changes needed
  if (fieldsUpdated.length === 0) {
    stats.productsSkipped++
    return
  }

  const label = DRY_RUN ? "[DRY-RUN]" : "[APPLY]"

  if (!DRY_RUN) {
    await apiPost(`/admin/products/${medusaProduct.id}`, patch)
  }

  console.log(`  ${label} ${wixProduct.name}: ${fieldsUpdated.join(" | ")}`)

  appendAudit({
    product_id: medusaProduct.id,
    handle: medusaProduct.handle,
    fields_updated: fieldsUpdated,
    tags_added: tagsAdded,
    timestamp: new Date().toISOString(),
    source: "enrich-products.ts",
    dry_run: DRY_RUN,
  })

  stats.productsUpdated++
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("═══════════════════════════════════════════")
  console.log("  Enrichment produse: descrieri + taguri")
  console.log(`  Mod: ${DRY_RUN ? "DRY-RUN (fără scriere)" : "APPLY (scriere reală)"}`)
  console.log("═══════════════════════════════════════════\n")

  if (!DRY_RUN) {
    const confirm = process.argv.includes("--apply")
    if (!confirm) {
      console.error("Adaugă --apply pentru scriere reală.")
      process.exit(1)
    }
  }

  await authenticate()
  console.log("✓ Autentificat în Medusa\n")

  // Parse CSV
  const csvContent = fs.readFileSync(CSV_PATH)
  const rows = parse(csvContent, {
    columns: true,
    bom: true,
    skip_empty_lines: true,
  }) as WixRow[]

  const wixProducts = rows.filter((r) => r.fieldType === "Product")
  console.log(`✓ CSV: ${wixProducts.length} produse citite\n`)

  const stats: EnrichStats = {
    productsScanned: wixProducts.length,
    productsUpdated: 0,
    productsSkipped: 0,
    descriptionsSet: 0,
    tagsCreated: 0,
    tagsAdded: 0,
    metadataSet: 0,
    errors: [],
    startTime: Date.now(),
  }

  console.log(`Procesare ${wixProducts.length} produse...\n`)

  for (const wixProduct of wixProducts) {
    const handle = slugify(wixProduct.name)

    try {
      // Fetch product from Medusa with needed fields
      const res = (await apiGet(
        `/admin/products?handle=${encodeURIComponent(handle)}`
      )) as { products: MedusaProduct[] }

      if (!res.products?.length) {
        console.log(`  ~ ${wixProduct.name}: nu există în Medusa (skip)`)
        stats.productsSkipped++
        continue
      }

      await enrichProduct(wixProduct, res.products[0], stats)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      stats.errors.push(`${wixProduct.name}: ${msg}`)
      console.error(`  ✗ ${wixProduct.name}: ${msg}`)
    }

    await sleep(DELAY_MS)
  }

  // ─── Raport final ─────────────────────────────────────────────────────────

  const elapsed = ((Date.now() - stats.startTime) / 1000).toFixed(1)

  console.log("\n═══════════════════════════════════════════")
  console.log(`  Raport enrichment${DRY_RUN ? " [DRY-RUN]" : ""}`)
  console.log("═══════════════════════════════════════════")
  console.log(`  Produse scanate:      ${stats.productsScanned}`)
  console.log(`  Produse cu update:    ${stats.productsUpdated}`)
  console.log(`  Produse fără update:  ${stats.productsSkipped}`)
  console.log(`  Descrieri populate:   ${stats.descriptionsSet}`)
  console.log(`  Taguri adăugate:      ${stats.tagsAdded}`)
  console.log(`  Metadata populate:    ${stats.metadataSet}`)
  console.log(`  Erori:                ${stats.errors.length}`)
  console.log(`  Timp total:           ${elapsed}s`)

  if (stats.errors.length > 0) {
    console.log("\n  ERORI:")
    stats.errors.forEach((e) => console.log(`    ✗ ${e}`))
  }

  if (DRY_RUN) {
    console.log("\n  Rulează cu --apply pentru a aplica modificările.")
  } else {
    console.log(`\n  Audit log scris în: ${AUDIT_LOG_PATH}`)
  }

  console.log("═══════════════════════════════════════════\n")

  if (stats.errors.length > 0) process.exit(1)
}

main().catch((e) => {
  console.error("Enrichment eșuat:", e)
  process.exit(1)
})
