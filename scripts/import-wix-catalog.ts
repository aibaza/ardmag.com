import { parse } from "csv-parse/sync"
import * as fs from "fs"
import * as path from "path"

// ─── Config ──────────────────────────────────────────────────────────────────

const BACKEND_URL = "http://localhost:9000"
const ADMIN_EMAIL = "admin@ardmag.com"
const ADMIN_PASSWORD = "Admin1234!"
const CSV_PATH = path.resolve(__dirname, "../resources/Wix Products Catalog.csv")
const AUDIT_LOG_PATH = path.resolve(__dirname, "../docs/catalog-audit-log.md")
const ISSUES_LOG_PATH = path.resolve(__dirname, "../docs/catalog-issues.md")
const SALES_CHANNEL_ID = "sc_01KPH29TA9EXRP1ZT23JVE2AZ7"
const DELAY_MS = 300

// Decizii Faza 0: categorii pentru produsele fără collection în CSV
const NO_COLLECTION_MAP: Record<string, string> = {
  "CAROTE DIAMANTATE": "ȘLEFUIRE PIATRĂ",
  "DISC DE ȘLEFUIRE CONCAV": "ȘLEFUIRE PIATRĂ",
  "ÎNTREȚINERE ȘI CERURI": "SOLUȚII PENTRU PIATRĂ",
  "DETERGENȚI ACIZI": "SOLUȚII PENTRU PIATRĂ",
  "DETERGENȚI": "SOLUȚII PENTRU PIATRĂ",
  "TRATAMENTE SPECIFICE": "SOLUȚII PENTRU PIATRĂ",
  "IMPERMEABILIZANȚI PE BAZĂ DE APĂ": "SOLUȚII PENTRU PIATRĂ",
  "IMPERMEABILIZANȚI PE BAZĂ DE SOLVENȚI": "SOLUȚII PENTRU PIATRĂ",
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface WixRow {
  handleId: string
  fieldType: "Product" | "Variant"
  name: string
  description: string
  productImageUrl: string
  collection: string
  sku: string
  ribbon: string
  price: string
  surcharge: string
  visible: string
  discountMode: string
  discountValue: string
  inventory: string
  weight: string
  cost: string
  productOptionName1: string
  productOptionType1: string
  productOptionDescription1: string
  productOptionName2: string
  productOptionType2: string
  productOptionDescription2: string
  productOptionName3: string
  productOptionType3: string
  productOptionDescription3: string
  productOptionName4: string
  productOptionType4: string
  productOptionDescription4: string
  additionalInfoTitle1: string
  additionalInfoDescription1: string
  [key: string]: string
}

interface ImportStats {
  productsCreated: number
  variantsCreated: number
  categoriesCreated: number
  draftProducts: string[]
  warnings: string[]
  errors: string[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function buildImageUrl(mediaId: string): string {
  return `https://static.wixstatic.com/media/${mediaId.trim()}`
}

function parsePrice(basePrice: string, surcharge: string): number {
  const base = parseFloat(basePrice || "0")
  const extra = parseFloat(surcharge || "0")
  return Math.round((base + extra) * 100) // bani RON
}

// ─── API Client ───────────────────────────────────────────────────────────────

let authToken: string = ""

async function apiPost(path: string, body: unknown): Promise<unknown> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
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
  if (!res.ok) throw new Error(`Auth failed: ${res.status}`)
  const data = (await res.json()) as { token: string }
  authToken = data.token
  console.log("✓ Autentificat în Medusa admin")
}

// ─── Setup Romania Region ─────────────────────────────────────────────────────

async function ensureRomaniaRegion(): Promise<string> {
  // Verifică dacă există deja
  const res = await fetch(`${BACKEND_URL}/admin/regions?limit=50`, {
    headers: { Authorization: `Bearer ${authToken}` },
  })
  const data = (await res.json()) as { regions: Array<{ id: string; name: string }> }
  const existing = data.regions.find((r) => r.name === "Romania")
  if (existing) {
    console.log(`✓ Regiune Romania existentă: ${existing.id}`)
    return existing.id
  }

  const created = (await apiPost("/admin/regions", {
    name: "Romania",
    currency_code: "ron",
    countries: ["ro"],
  })) as { region: { id: string } }
  console.log(`✓ Regiune Romania creată: ${created.region.id}`)
  return created.region.id
}

// ─── Categories ───────────────────────────────────────────────────────────────

async function createCategories(names: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  for (const name of names) {
    const handle = slugify(name)
    try {
      const res = (await apiPost("/admin/product-categories", {
        name,
        handle,
        is_active: true,
        is_internal: false,
      })) as { product_category: { id: string } }
      map.set(name, res.product_category.id)
      console.log(`  ✓ Categorie: ${name} (${res.product_category.id})`)
    } catch (e) {
      // Poate există deja
      const existing = await fetch(
        `${BACKEND_URL}/admin/product-categories?handle=${handle}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      )
      const data = (await existing.json()) as {
        product_categories: Array<{ id: string }>
      }
      if (data.product_categories?.length > 0) {
        map.set(name, data.product_categories[0].id)
        console.log(`  ~ Categorie existentă: ${name}`)
      } else {
        throw e
      }
    }
    await sleep(DELAY_MS)
  }
  return map
}

// ─── Product Import ───────────────────────────────────────────────────────────

async function importProduct(
  product: WixRow,
  variants: WixRow[],
  categoryId: string | undefined,
  regionId: string,
  stats: ImportStats
): Promise<void> {
  const activeVariants = variants.filter((v) => v.visible === "true")
  const basePrice = parseFloat(product.price || "0")
  const images = product.productImageUrl
    .split(";")
    .map((id) => id.trim())
    .filter(Boolean)
    .map((id) => ({ url: buildImageUrl(id) }))

  // Options din Product row
  const options: Array<{ title: string; values: string[] }> = []
  for (let i = 1; i <= 4; i++) {
    const optName = product[`productOptionName${i}`]?.trim()
    if (!optName) continue
    const values = new Set<string>()
    for (const v of activeVariants) {
      const val = v[`productOptionDescription${i}`]?.trim()
      if (val) values.add(val)
    }
    if (values.size > 0) {
      options.push({ title: optName, values: Array.from(values) })
    }
  }

  // Variante
  const variantPayloads: unknown[] = []
  const isSimpleProduct = activeVariants.length === 0

  if (isSimpleProduct) {
    // Medusa v2 cere cel puțin o opțiune chiar și pe produse simple
    options.push({ title: "Title", values: ["Default Title"] })

    const price = Math.round(basePrice * 100)
    const isDraft = price === 0
    if (isDraft) {
      stats.draftProducts.push(product.name)
    }
    variantPayloads.push({
      title: "Default Title",
      sku: `${slugify(product.name)}-default`,
      options: { Title: "Default Title" },
      prices: [{ amount: price, currency_code: "ron" }],
    })
  } else {
    let variantIndex = 0
    for (const v of activeVariants) {
      variantIndex++
      const price = parsePrice(product.price, v.surcharge)
      const isDraft = price === 0

      if (isDraft) {
        stats.warnings.push(
          `${product.name} — variantă cu preț 0 (surcharge gol): ${
            v.productOptionDescription1 || ""
          } ${v.productOptionDescription2 || ""} ${v.productOptionDescription3 || ""}`.trim()
        )
      }

      const optionValues: Record<string, string> = {}
      for (let i = 1; i <= 4; i++) {
        const optName = product[`productOptionName${i}`]?.trim()
        const optVal = v[`productOptionDescription${i}`]?.trim()
        if (optName && optVal) {
          optionValues[optName] = optVal
        }
      }

      const titleParts = Object.values(optionValues)
      variantPayloads.push({
        title: titleParts.join(" / ") || `Variant ${variantIndex}`,
        sku: `${slugify(product.name)}-${variantIndex}`,
        options: optionValues,
        prices: [{ amount: price, currency_code: "ron" }],
      })
    }
  }

  // Status
  const hasZeroPrice = isSimpleProduct && Math.round(basePrice * 100) === 0
  const status = hasZeroPrice || !product.visible || product.visible === "false"
    ? "draft"
    : "published"

  // Metadata
  const metadata: Record<string, string> = {}
  if (product.ribbon?.trim()) metadata.ribbon = product.ribbon.trim()
  if (product.additionalInfoTitle1?.trim()) {
    metadata.promo_info_title = product.additionalInfoTitle1.trim()
    metadata.promo_info = product.additionalInfoDescription1?.trim() || ""
  }

  const payload: Record<string, unknown> = {
    title: product.name,
    handle: slugify(product.name),
    description: product.description?.trim() || null,
    status,
    images,
    thumbnail: images[0]?.url,
    options,
    variants: variantPayloads,
    sales_channels: [{ id: SALES_CHANNEL_ID }],
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
  }

  if (categoryId) {
    payload.categories = [{ id: categoryId }]
  }

  if (product.weight?.trim()) {
    const weightKg = parseFloat(product.weight)
    payload.weight = Math.round(weightKg * 1000) // grame
  }

  try {
    await apiPost("/admin/products", payload)
    stats.productsCreated++
    stats.variantsCreated += variantPayloads.length
    const draftNote = status === "draft" ? " [DRAFT]" : ""
    console.log(
      `  ✓ ${product.name}${draftNote} (${variantPayloads.length} variante)`
    )
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    // Produs deja există — skip silențios (import idempotent)
    if (msg.includes("already exists")) {
      console.log(`  ~ ${product.name} (deja există, skip)`)
      return
    }
    stats.errors.push(`${product.name}: ${msg}`)
    console.error(`  ✗ ${product.name}: ${msg}`)
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("═══════════════════════════════════════════")
  console.log("  Import catalog Wix → Medusa v2")
  console.log("═══════════════════════════════════════════\n")

  // 1. Autentificare
  await authenticate()

  // 2. Regiune Romania
  console.log("\n[1/4] Configurare regiune Romania...")
  const regionId = await ensureRomaniaRegion()

  // 3. Parsare CSV
  console.log("\n[2/4] Parsare CSV...")
  const csvContent = fs.readFileSync(CSV_PATH)
  const rows = parse(csvContent, {
    columns: true,
    bom: true,
    skip_empty_lines: true,
  }) as WixRow[]

  const products = rows.filter((r) => r.fieldType === "Product")
  const allVariants = rows.filter((r) => r.fieldType === "Variant")
  console.log(`  ${products.length} produse, ${allVariants.length} variante totale`)

  // Grupare variante per produs
  const variantsByHandle = new Map<string, WixRow[]>()
  for (const v of allVariants) {
    const list = variantsByHandle.get(v.handleId) || []
    list.push(v)
    variantsByHandle.set(v.handleId, list)
  }

  // 4. Categorii
  console.log("\n[3/4] Creare categorii...")
  const categoryNames = new Set<string>()
  for (const p of products) {
    const col = p.collection?.trim()
    const resolved = col || NO_COLLECTION_MAP[p.name?.trim()]
    if (resolved) categoryNames.add(resolved)
  }
  const categoryMap = await createCategories(Array.from(categoryNames))

  // 5. Produse
  console.log(`\n[4/4] Import produse (${products.length} total)...`)
  const stats: ImportStats = {
    productsCreated: 0,
    variantsCreated: 0,
    categoriesCreated: categoryNames.size,
    draftProducts: [],
    warnings: [],
    errors: [],
  }

  for (const product of products) {
    const variants = variantsByHandle.get(product.handleId) || []
    const colName =
      product.collection?.trim() || NO_COLLECTION_MAP[product.name?.trim()]
    const categoryId = colName ? categoryMap.get(colName) : undefined

    if (!colName) {
      stats.warnings.push(
        `${product.name}: fără categorie rezolvată — importat fără categorie`
      )
    }

    await importProduct(product, variants, categoryId, regionId, stats)
    await sleep(DELAY_MS)
  }

  // ─── Raport final ────────────────────────────────────────────────────────────

  console.log("\n═══════════════════════════════════════════")
  console.log("  Raport import")
  console.log("═══════════════════════════════════════════")
  console.log(`  Categorii create:  ${stats.categoriesCreated}`)
  console.log(`  Produse create:    ${stats.productsCreated} / ${products.length}`)
  console.log(`  Variante create:   ${stats.variantsCreated}`)
  console.log(`  Draft (preț 0):    ${stats.draftProducts.length}`)
  console.log(`  Warnings:          ${stats.warnings.length}`)
  console.log(`  Erori:             ${stats.errors.length}`)

  if (stats.draftProducts.length > 0) {
    console.log("\n  Produse importate ca DRAFT:")
    stats.draftProducts.forEach((n) => console.log(`    - ${n}`))
  }

  if (stats.warnings.length > 0) {
    console.log("\n  Warnings:")
    stats.warnings.forEach((w) => console.log(`    ⚠ ${w}`))
  }

  if (stats.errors.length > 0) {
    console.log("\n  ERORI:")
    stats.errors.forEach((e) => console.log(`    ✗ ${e}`))
    process.exit(1)
  }

  console.log("\n✓ Import complet.\n")
}

main().catch((e) => {
  console.error("Import eșuat:", e)
  process.exit(1)
})
