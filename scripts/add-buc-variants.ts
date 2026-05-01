// Adauga 51 variante BUC. (per bucata) pentru produsul DISCHETE DE SLEFUIT CU CARBURA.
// VEL si SAITDISC sunt vandute si individual, nu doar la CUTIE/BAX.
//
// Usage:
//   npx ts-node scripts/add-buc-variants.ts            # dry-run
//   npx ts-node scripts/add-buc-variants.ts --apply    # aplica pe Railway

import * as XLSX from "xlsx"
import * as path from "path"
import { Client } from "pg"
import { spawnSync } from "child_process"
const { generateEntityId } = require("../backend/node_modules/@medusajs/utils")

const DRY_RUN = !process.argv.includes("--apply")
const XLS_DIR = path.resolve(__dirname, "../docs/preturi")
const LOCAL_DB = process.env.DATABASE_URL || "postgres://dc@localhost:5432/ardmag"

// ─── Constante DB (confirmate din explorare) ──────────────────────────────────

const PRODUCT_ID = "prod_01KPH3RCJVCAM46HKQWBP24XVT"
const PRODUCT_HANDLE = "dischete-de-slefuit-cu-carbura"

const OPT_TIP      = "opt_01KPH3RCJVJDA2MDE2Y2Q9MH42"
const OPT_DIAMETRU = "opt_01KPH3RCJWPTE5JJGN9CE80EXY"
const OPT_GR       = "opt_01KPH3RCJW0YHR0H0ZENY4E5AD"
const OPT_CANT     = "opt_01KPH3RCJX3DNXQAJG06M3CG4J"

const STOCK_LOCATION = "sloc_01KPH3TTXD2AD13KRV3R56ETQT"
const STOCKED_QTY    = 100

// ─── Helpers ─────────────────────────────────────────────────────────────────

function newId(prefix: string): string {
  return generateEntityId(undefined, prefix)
}

function parseNum(v: unknown): number {
  if (v == null || v === "") return 0
  let s = String(v).trim()
  const hasDot = s.includes(".")
  const hasComma = s.includes(",")
  if (hasDot && hasComma) {
    const lastDot = s.lastIndexOf(".")
    const lastComma = s.lastIndexOf(",")
    if (lastComma > lastDot) {
      s = s.replace(/\./g, "").replace(",", ".")
    } else {
      s = s.replace(/,/g, "")
    }
  } else if (hasComma) {
    s = s.replace(",", ".")
  }
  return parseFloat(s.replace(/\s/g, "")) || 0
}

function q(s: string): string {
  return `'${s.replace(/'/g, "''")}'`
}

// ─── Citire XLS ───────────────────────────────────────────────────────────────

interface BucEntry {
  tip: string        // VEL | SAITDISC
  diametru: string   // 115 | 125 | 180
  gr: string         // granulatie
  price: number      // RON per bucata
  weightKg: number
}

function readBucEntries(): BucEntry[] {
  const wb = XLSX.readFile(path.join(XLS_DIR, "Preturi SAIT.xls"))
  const ws = wb.Sheets["Sheet1"]
  if (!ws) throw new Error("Sheet1 missing in Preturi SAIT.xls")

  const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 }) as any[][]
  const entries: BucEntry[] = []
  let curProduct = ""

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    if (!row) continue

    const col0 = String(row[0] ?? "").trim().toUpperCase()
    const col1 = String(row[1] ?? "").trim().toUpperCase()
    const price = parseNum(row[2])
    const weightKg = parseNum(row[3])

    if (col0) curProduct = col0
    if (!curProduct || !col1 || !price) continue

    // Vrem numai randul BUC. singular (nu CUTIE, nu BAX)
    if (!col1.startsWith("BUC.")) continue

    let tip: string | null = null
    let diametru: string | null = null
    let gr: string | null = null

    if (curProduct.startsWith("VEL 125") || curProduct.startsWith("VEL 115") || curProduct.startsWith("VEL 180")) {
      tip = "VEL"
      diametru = curProduct.startsWith("VEL 125") ? "125"
               : curProduct.startsWith("VEL 115") ? "115"
               : "180"
      const m = curProduct.match(/GR\.\s*(\d+)/)
      gr = m ? m[1] : null
    } else if (curProduct.startsWith("SAITDISC")) {
      tip = "SAITDISC"
      const mSz = curProduct.match(/SAITDISC\s+(\d+)/)
      diametru = mSz ? mSz[1] : null
      const m = curProduct.match(/GR\.\s*(\d+)/)
      gr = m ? m[1] : null
    }

    if (!tip || !diametru || !gr) continue
    entries.push({ tip, diametru, gr, price, weightKg })
  }

  return entries
}

// ─── Query DB ─────────────────────────────────────────────────────────────────

interface OptValMap {
  tip:  Record<string, string>  // "VEL" → optval_id
  dim:  Record<string, string>  // "125" → optval_id
  gr:   Record<string, string>  // "40"  → optval_id
  cant: Record<string, string>  // "BUC." → optval_id (null dacă nu e creat)
}

async function fetchOptVals(client: Client): Promise<OptValMap> {
  const res = await client.query(`
    SELECT po.id as opt_id, pov.value, pov.id as optval_id
    FROM product_option_value pov
    JOIN product_option po ON pov.option_id = po.id
    WHERE po.product_id = $1
    AND po.deleted_at IS NULL AND pov.deleted_at IS NULL
  `, [PRODUCT_ID])

  const map: OptValMap = { tip: {}, dim: {}, gr: {}, cant: {} }
  for (const row of res.rows) {
    if (row.opt_id === OPT_TIP)      map.tip[row.value]  = row.optval_id
    else if (row.opt_id === OPT_DIAMETRU) map.dim[row.value]  = row.optval_id
    else if (row.opt_id === OPT_GR)       map.gr[row.value]   = row.optval_id
    else if (row.opt_id === OPT_CANT)     map.cant[row.value] = row.optval_id
  }
  return map
}

async function fetchExistingBucVariants(client: Client): Promise<Set<string>> {
  const res = await client.query(`
    SELECT v.title FROM product_variant v
    WHERE v.product_id = $1 AND v.deleted_at IS NULL
    AND v.title LIKE '% / BUC.'
  `, [PRODUCT_ID])
  return new Set(res.rows.map((r: any) => r.title))
}

async function fetchMaxSkuN(client: Client): Promise<number> {
  const res = await client.query(`
    SELECT MAX(CAST(SUBSTRING(sku FROM $2) AS INT)) as max_n
    FROM product_variant WHERE product_id = $1 AND deleted_at IS NULL
  `, [PRODUCT_ID, `${PRODUCT_HANDLE}-(\\d+)$`])
  return res.rows[0]?.max_n ?? 100
}

// ─── Generare SQL ─────────────────────────────────────────────────────────────

interface NewVariant {
  entry: BucEntry
  title: string
  sku: string
  variantId: string
  priceSetId: string
  pvpsId: string
  priceId: string
  iitemId: string
  pvitemId: string
  ilevId: string
  bani: number
  grame: number
}

function buildVariants(entries: BucEntry[], optVals: OptValMap, existing: Set<string>, maxSkuN: number): NewVariant[] {
  const variants: NewVariant[] = []
  let skuN = maxSkuN

  for (const e of entries) {
    const title = `${e.tip} / ${e.diametru} / ${e.gr} / BUC.`
    if (existing.has(title)) {
      console.log(`  SKIP (exista deja): ${title}`)
      continue
    }
    skuN++
    variants.push({
      entry: e,
      title,
      sku: `${PRODUCT_HANDLE}-${skuN}`,
      variantId: newId("variant"),
      priceSetId: newId("pset"),
      pvpsId: newId("pvps"),
      priceId: newId("price"),
      iitemId: newId("iitem"),
      pvitemId: newId("pvitem"),
      ilevId: newId("ilev"),
      bani: Math.round(e.price * 100),
      grame: Math.round(e.weightKg * 1000),
    })
  }
  return variants
}

function genSQL(bucOptvalId: string | null, newBucOptvalId: string, variants: NewVariant[], optVals: OptValMap): string {
  const sqls: string[] = ["BEGIN;"]

  // 1 — optval BUC. (o singura data)
  const optvalId = bucOptvalId ?? newBucOptvalId
  if (!bucOptvalId) {
    sqls.push(`INSERT INTO product_option_value(id, value, option_id, created_at, updated_at) VALUES (${q(newBucOptvalId)}, 'BUC.', ${q(OPT_CANT)}, NOW(), NOW());`)
  }

  for (const v of variants) {
    const tipId  = optVals.tip[v.entry.tip]
    const dimId  = optVals.dim[v.entry.diametru]
    const grId   = optVals.gr[v.entry.gr]

    if (!tipId || !dimId || !grId) {
      console.warn(`  WARN: optval lipsa pentru ${v.title} — skip`)
      continue
    }

    // product_variant
    sqls.push(`INSERT INTO product_variant(id, title, sku, product_id, manage_inventory, allow_backorder, variant_rank, created_at, updated_at) VALUES (${q(v.variantId)}, ${q(v.title)}, ${q(v.sku)}, ${q(PRODUCT_ID)}, true, false, 0, NOW(), NOW());`)

    // product_variant_option (4 randuri)
    sqls.push(`INSERT INTO product_variant_option(variant_id, option_value_id) VALUES (${q(v.variantId)}, ${q(tipId)});`)
    sqls.push(`INSERT INTO product_variant_option(variant_id, option_value_id) VALUES (${q(v.variantId)}, ${q(dimId)});`)
    sqls.push(`INSERT INTO product_variant_option(variant_id, option_value_id) VALUES (${q(v.variantId)}, ${q(grId)});`)
    sqls.push(`INSERT INTO product_variant_option(variant_id, option_value_id) VALUES (${q(v.variantId)}, ${q(optvalId)});`)

    // weight
    if (v.grame > 0) {
      sqls.push(`UPDATE product_variant SET weight = ${v.grame} WHERE id = ${q(v.variantId)};`)
    }

    // price_set
    sqls.push(`INSERT INTO price_set(id, created_at, updated_at) VALUES (${q(v.priceSetId)}, NOW(), NOW());`)

    // product_variant_price_set
    sqls.push(`INSERT INTO product_variant_price_set(id, variant_id, price_set_id) VALUES (${q(v.pvpsId)}, ${q(v.variantId)}, ${q(v.priceSetId)});`)

    // price
    const rawAmt = `{"value": "${v.bani}", "precision": 20}`
    sqls.push(`INSERT INTO price(id, price_set_id, currency_code, amount, raw_amount, rules_count, created_at, updated_at) VALUES (${q(v.priceId)}, ${q(v.priceSetId)}, 'ron', ${v.bani}, '${rawAmt}', 0, NOW(), NOW());`)

    // inventory_item
    sqls.push(`INSERT INTO inventory_item(id, sku, title, requires_shipping, created_at, updated_at) VALUES (${q(v.iitemId)}, ${q(v.sku)}, ${q(v.title)}, true, NOW(), NOW());`)

    // product_variant_inventory_item
    sqls.push(`INSERT INTO product_variant_inventory_item(id, variant_id, inventory_item_id, required_quantity, created_at, updated_at) VALUES (${q(v.pvitemId)}, ${q(v.variantId)}, ${q(v.iitemId)}, 1, NOW(), NOW());`)

    // inventory_level
    sqls.push(`INSERT INTO inventory_level(id, inventory_item_id, location_id, stocked_quantity, reserved_quantity, incoming_quantity, created_at, updated_at) VALUES (${q(v.ilevId)}, ${q(v.iitemId)}, ${q(STOCK_LOCATION)}, ${STOCKED_QTY}, 0, 0, NOW(), NOW());`)
  }

  // Verificare finala
  sqls.push(`SELECT 'variante BUC. create: ' || COUNT(*) FROM product_variant WHERE product_id = ${q(PRODUCT_ID)} AND title LIKE '% / BUC.' AND deleted_at IS NULL;`)
  sqls.push("COMMIT;")
  return sqls.join("\n")
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n=== add-buc-variants.ts | ${DRY_RUN ? "DRY RUN" : "APPLY → PRODUCTIE"} ===\n`)

  console.log("Citesc XLS...")
  const entries = readBucEntries()
  console.log(`Randuri BUC. gasite in XLS: ${entries.length}`)

  console.log("Conectare DB local...")
  const client = new Client({ connectionString: LOCAL_DB })
  await client.connect()

  const optVals   = await fetchOptVals(client)
  const existing  = await fetchExistingBucVariants(client)
  const maxSkuN   = await fetchMaxSkuN(client)
  await client.end()

  console.log(`optval BUC. exista: ${!!optVals.cant["BUC."]}`)
  console.log(`Variante BUC. deja in DB: ${existing.size}`)
  console.log(`Max SKU index curent: ${maxSkuN}`)

  const newBucOptvalId = newId("optval")
  const variants = buildVariants(entries, optVals, existing, maxSkuN)

  console.log(`\n── VARIANTE NOI PLANIFICATE (${variants.length}) ──`)
  for (const v of variants) {
    console.log(`  ${v.title}  →  ${v.entry.price} RON, ${v.entry.weightKg} kg`)
  }

  if (variants.length === 0) {
    console.log("\nNimic de adaugat.")
    return
  }

  if (DRY_RUN) {
    console.log(`\nRuleaza cu --apply pentru a aplica pe Railway.`)
    return
  }

  console.log("\nGenerez SQL si aplic via Railway...")
  const sql = genSQL(optVals.cant["BUC."] ?? null, newBucOptvalId, variants, optVals)

  const result = spawnSync(
    "railway", ["connect", "Postgres"],
    {
      input: sql,
      encoding: "utf8",
      cwd: path.resolve(__dirname, "../backend"),
      timeout: 120_000,
    }
  )

  if (result.error) {
    console.error("Eroare railway connect:", result.error)
    process.exit(1)
  }

  const out = result.stdout || ""
  const err = result.stderr || ""
  if (err && !err.includes("psql")) console.error("STDERR:", err.slice(0, 500))

  const inserts = (out.match(/INSERT 0 \d+/g) || []).length
  const verif = out.match(/variante BUC\. create: (\d+)/)
  console.log(`\nInsert-uri executate pe Railway: ${inserts}`)
  if (verif) console.log(`Variante BUC. pe Railway acum: ${verif[1]}`)

  // Aplica acelasi SQL si pe local DB (mentine sincronizarea pentru scriptul de update preturi)
  console.log("\nAplica si pe local DB...")
  const localResult = spawnSync(
    "psql", [LOCAL_DB],
    { input: sql, encoding: "utf8", timeout: 30_000 }
  )
  if (localResult.error) {
    console.warn("  WARN: local DB apply esuat:", localResult.error.message)
  } else {
    const localInserts = (localResult.stdout?.match(/INSERT 0 \d+/g) || []).length
    console.log(`  Insert-uri locale: ${localInserts}`)
  }

  console.log("\nGata!")
}

main().catch(e => { console.error("\nEROARE:", e.message); process.exit(1) })
