import * as fs from "fs"
import * as path from "path"

const BACKEND_URL = "http://localhost:9000"
const ADMIN_EMAIL = "admin@ardmag.com"
const ADMIN_PASSWORD = "Admin1234!"
const DRY_RUN = !process.argv.includes("--apply")

// Source of truth from Wix CSV: products that belong to Delta Research
// (extracted from SOLUȚII DELTA aggregate product variants)
const DELTA_RESEARCH_HANDLES = [
  "eco-dry",        // ECO DRY+
  "eco-stone-pro",  // ECO STONE PRO
  "eco-toner",      // ECO TONER
  "wet-seal",       // WET SEAL
  "total-black",    // TOTAL BLACK
  "silwax",         // SILWAX
  "de-graub",       // DE GRAUB
  "tergon",         // TERGON
  "solvente-gamma", // SOLVENTE GAMMA
  "mac-mud",        // MAC MUD
  "clean-stone",    // CLEAN STONE
  "stone-wet",      // STONE WET
  "res-1001",       // RES 1001
  "prolux",         // PROLUX
  "sabbiatore-axf", // SABBIATORE AX/F
  // Already correct, but include for completeness:
  "idrorep",        // IDROREP
  "nano-wet",       // NANO WET
  "quasar",         // QUASAR
  "seal",           // SEAL
]

async function getAuthToken(): Promise<string> {
  const res = await fetch(`${BACKEND_URL}/auth/user/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })
  if (!res.ok) throw new Error(`Auth failed: ${res.status}`)
  const data = (await res.json()) as { token: string }
  return data.token
}

async function getAllProducts(token: string): Promise<Array<{ id: string; handle: string; title: string; tags: Array<{ id: string; value: string }> }>> {
  const res = await fetch(`${BACKEND_URL}/admin/products?limit=200`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`)
  const data = (await res.json()) as { products: Array<{ id: string; handle: string; title: string; tags: Array<{ id: string; value: string }> }> }
  return data.products
}

async function getOrCreateTag(token: string, value: string): Promise<string> {
  const res = await fetch(`${BACKEND_URL}/admin/product-tags?q=${encodeURIComponent(value)}&limit=20`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = (await res.json()) as { product_tags: Array<{ id: string; value: string }> }
  const existing = data.product_tags.find((t) => t.value === value)
  if (existing) return existing.id

  const created = await fetch(`${BACKEND_URL}/admin/product-tags`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  })
  const createdData = (await created.json()) as { product_tag: { id: string } }
  return createdData.product_tag.id
}

async function updateProductTags(token: string, productId: string, newTagIds: string[]): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/admin/products/${productId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ tags: newTagIds.map((id) => ({ id })) }),
  })
  if (!res.ok) throw new Error(`Failed to update product ${productId}: ${res.status}`)
}

async function main() {
  console.log(`\nFix Brand Tags — ${DRY_RUN ? "DRY RUN (adaugă --apply pentru aplicare)" : "LIVE MODE"}\n`)

  const token = await getAuthToken()
  const products = await getAllProducts(token)

  const deltaTagId = DRY_RUN ? "dry-run-id" : await getOrCreateTag(token, "brand:delta-research")
  let fixedCount = 0
  let alreadyOkCount = 0
  let skippedCount = 0

  const results: Array<{ handle: string; title: string; action: string; oldBrand: string; newBrand: string }> = []

  for (const product of products) {
    const handle = product.handle
    const isDelta = DELTA_RESEARCH_HANDLES.includes(handle)
    if (!isDelta) {
      skippedCount++
      continue
    }

    const currentBrandTag = product.tags.find((t) => t.value.startsWith("brand:"))
    const currentBrand = currentBrandTag?.value ?? "none"

    if (currentBrand === "brand:delta-research") {
      alreadyOkCount++
      results.push({ handle, title: product.title, action: "OK", oldBrand: currentBrand, newBrand: currentBrand })
      continue
    }

    // Build new tag list: remove old brand tag, add delta-research
    const nonBrandTagIds = product.tags
      .filter((t) => !t.value.startsWith("brand:"))
      .map((t) => t.id)
    const newTagIds = [...nonBrandTagIds, deltaTagId]

    console.log(`  ${DRY_RUN ? "[DRY]" : "[FIX]"} ${product.title} — ${currentBrand} → brand:delta-research`)
    if (!DRY_RUN) {
      await updateProductTags(token, product.id, newTagIds)
      await new Promise((r) => setTimeout(r, 150))
    }

    fixedCount++
    results.push({ handle, title: product.title, action: DRY_RUN ? "would-fix" : "fixed", oldBrand: currentBrand, newBrand: "brand:delta-research" })
  }

  console.log(`\n--- Sumar ---`)
  console.log(`Produse Delta Research de corectat: ${fixedCount}`)
  console.log(`Deja corecte (brand:delta-research): ${alreadyOkCount}`)
  console.log(`Alte produse (netinse): ${skippedCount}`)

  const logPath = path.resolve(__dirname, "brand-fix-audit.jsonl")
  fs.writeFileSync(logPath, results.map((r) => JSON.stringify(r)).join("\n") + "\n")
  console.log(`\nLog salvat: ${logPath}`)

  if (DRY_RUN) {
    console.log("\nRuleaza cu --apply pentru a aplica fix-urile: npx ts-node scripts/fix-brand-tags.ts --apply")
  }
}

main().catch(console.error)
