// Importa 5 produse SAIT noi cu variante, preturi (din XLS Preturi SAIT.xls) si imagini.
//
// Produse:
//   SAITRON 125  -- 5 granulații × BUC + CUTIE 10 = 10 variante
//   SAITRON 180  -- 5 granulații × BUC + CUTIE 10 = 10 variante
//   SAITRIS 180  -- 4 granulații × BUC = 4 variante
//   EK WIENNER   -- 3 dimensiuni (125/180/230mm) × BUC = 3 variante
//   SUPORT VELCROPAD -- 3 dimensiuni (115/125/180mm) × BUC = 3 variante
//
// Preturi: din XLS (cu TVA inclus) → divizate la 1.21 pentru DB (fara TVA)
// Imagini: extrase via og:image de la paginile producatorului → uploadate in R2
// Categorie: slefuire-piatra (pcat_01KPH384DGCVZX1QRDNMJ1CHYE)
//
// Usage:
//   npx ts-node scripts/import-missing-products.ts           # dry-run
//   npx ts-node scripts/import-missing-products.ts --apply  # aplica pe Railway + R2

import * as path from "path"
import * as https from "https"
import * as http from "http"
import { spawnSync } from "child_process"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

const DRY_RUN = !process.argv.includes("--apply")
const LOCAL_DB = process.env.DATABASE_URL || "postgres://dc@localhost:5432/ardmag"

// Backend .env pentru R2
const envPath = path.resolve(__dirname, "../backend/.env")
if (require("fs").existsSync(envPath)) {
  for (const line of require("fs").readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2]
  }
}

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || ""
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || ""
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || ""
const R2_BUCKET = process.env.R2_BUCKET || "adrmag"
const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL || "https://pub-28d7a4f80d924560ae8c2fe111240e4a.r2.dev").replace(/\/$/, "")

const STOCK_LOCATION = "sloc_01KPH3TTXD2AD13KRV3R56ETQT"
const CATEGORY_ID = "pcat_01KPH384DGCVZX1QRDNMJ1CHYE" // slefuire-piatra
const STOCK_QTY = 100
const TVA = 1.21

const { generateEntityId } = require("../backend/node_modules/@medusajs/utils")

// ─── Helpers ─────────────────────────────────────────────────────────────────

function q(s: string) { return `'${s.replace(/'/g, "''")}'` }
function newId(prefix: string): string { return generateEntityId(undefined, prefix) as string }
function netBani(grossRon: number): number { return Math.round(grossRon / TVA * 100) }

function fetchUrl(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http
    const req = client.get(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; ardmag-bot/1.0)" } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        const loc = res.headers.location
        if (loc) return resolve(fetchUrl(loc))
        return reject(new Error("Redirect fara Location"))
      }
      if (!res.statusCode || res.statusCode >= 400) {
        return reject(new Error(`HTTP ${res.statusCode} la ${url}`))
      }
      const chunks: Buffer[] = []
      res.on("data", (c: Buffer) => chunks.push(c))
      res.on("end", () => resolve(Buffer.concat(chunks)))
      res.on("error", reject)
    })
    req.on("error", reject)
    req.setTimeout(10000, () => { req.destroy(); reject(new Error("Timeout")) })
  })
}

async function extractOgImage(html: string): Promise<string | null> {
  const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
             || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
  return m ? m[1] : null
}

async function downloadAndUploadImage(
  pageUrl: string,
  handle: string,
  s3: S3Client | null
): Promise<string | null> {
  try {
    const pageHtml = await fetchUrl(pageUrl)
    const ogImage = await extractOgImage(pageHtml.toString("utf8"))
    if (!ogImage) {
      console.log(`    ⚠ Nu am gasit og:image pe ${pageUrl}`)
      return null
    }
    console.log(`    → og:image: ${ogImage}`)

    const imgBuf = await fetchUrl(ogImage)
    const ext = ogImage.split(".").pop()?.split("?")[0]?.toLowerCase() || "jpg"
    const key = `images/${handle}/sait-${Date.now()}.${ext}`
    const contentType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg"

    if (s3) {
      await s3.send(new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: imgBuf,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      }))
      const r2Url = `${R2_PUBLIC_URL}/${key}`
      console.log(`    ✓ Upload R2: ${r2Url}`)
      return r2Url
    } else {
      console.log(`    [DRY] Ar uploada ${imgBuf.length} bytes la r2://${R2_BUCKET}/${key}`)
      return `${R2_PUBLIC_URL}/${key}`
    }
  } catch (err) {
    console.log(`    ⚠ Imagine esuata (${(err as Error).message}) -- produs fara imagine`)
    return null
  }
}

// ─── Definitie produse ────────────────────────────────────────────────────────

interface ProductDef {
  handle: string
  title: string
  description: string
  sourceImagePage: string
  options: { name: string; values: string[] }[]
  variants: {
    title: string
    optionValues: string[] // in aceeasi ordine ca options[]
    grossRon: number
    weightGr: number
  }[]
}

const PRODUCTS: ProductDef[] = [
  {
    handle: "saitron-125",
    title: "SAITRON 125",
    description: "// COPY PENDING: SAITRON 125 -- pad velcro pentru slefuire si finisare piatra naturala. Disponibil in 5 granulozitati, bucata sau cutie 10 bucati.",
    sourceImagePage: "https://www.sait-abr.com/en/acclucidatura-sait/2982-45900-saitac-pad-vel.html",
    options: [
      { name: "Granulatie", values: ["24", "36", "60", "80", "120"] },
      { name: "Cantitate", values: ["BUC.", "CUTIE 10 BUC."] },
    ],
    variants: [
      // BUC: 25 RON → 2066 bani, 100g
      { title: "GR. 24 / BUC.", optionValues: ["24", "BUC."], grossRon: 25, weightGr: 100 },
      { title: "GR. 36 / BUC.", optionValues: ["36", "BUC."], grossRon: 25, weightGr: 100 },
      { title: "GR. 60 / BUC.", optionValues: ["60", "BUC."], grossRon: 25, weightGr: 100 },
      { title: "GR. 80 / BUC.", optionValues: ["80", "BUC."], grossRon: 25, weightGr: 100 },
      { title: "GR. 120 / BUC.", optionValues: ["120", "BUC."], grossRon: 25, weightGr: 100 },
      // CUTIE 10: 22.5 RON → 1860 bani, 1000g
      { title: "GR. 24 / CUTIE 10 BUC.", optionValues: ["24", "CUTIE 10 BUC."], grossRon: 22.5, weightGr: 1000 },
      { title: "GR. 36 / CUTIE 10 BUC.", optionValues: ["36", "CUTIE 10 BUC."], grossRon: 22.5, weightGr: 1000 },
      { title: "GR. 60 / CUTIE 10 BUC.", optionValues: ["60", "CUTIE 10 BUC."], grossRon: 22.5, weightGr: 1000 },
      { title: "GR. 80 / CUTIE 10 BUC.", optionValues: ["80", "CUTIE 10 BUC."], grossRon: 22.5, weightGr: 1000 },
      { title: "GR. 120 / CUTIE 10 BUC.", optionValues: ["120", "CUTIE 10 BUC."], grossRon: 22.5, weightGr: 1000 },
    ],
  },
  {
    handle: "saitron-180",
    title: "SAITRON 180",
    description: "// COPY PENDING: SAITRON 180 -- pad velcro pentru slefuire si finisare piatra naturala. Disponibil in 5 granulozitati, bucata sau cutie 10 bucati.",
    sourceImagePage: "https://www.sait-abr.com/en/acclucidatura-sait/2982-45900-saitac-pad-vel.html",
    options: [
      { name: "Granulatie", values: ["24", "36", "60", "80", "120"] },
      { name: "Cantitate", values: ["BUC.", "CUTIE 10 BUC."] },
    ],
    variants: [
      // BUC: 33 RON → 2727 bani, 200g
      { title: "GR. 24 / BUC.", optionValues: ["24", "BUC."], grossRon: 33, weightGr: 200 },
      { title: "GR. 36 / BUC.", optionValues: ["36", "BUC."], grossRon: 33, weightGr: 200 },
      { title: "GR. 60 / BUC.", optionValues: ["60", "BUC."], grossRon: 33, weightGr: 200 },
      { title: "GR. 80 / BUC.", optionValues: ["80", "BUC."], grossRon: 33, weightGr: 200 },
      { title: "GR. 120 / BUC.", optionValues: ["120", "BUC."], grossRon: 33, weightGr: 200 },
      // CUTIE 10: 29.7 RON → 2455 bani, 2000g
      { title: "GR. 24 / CUTIE 10 BUC.", optionValues: ["24", "CUTIE 10 BUC."], grossRon: 29.7, weightGr: 2000 },
      { title: "GR. 36 / CUTIE 10 BUC.", optionValues: ["36", "CUTIE 10 BUC."], grossRon: 29.7, weightGr: 2000 },
      { title: "GR. 60 / CUTIE 10 BUC.", optionValues: ["60", "CUTIE 10 BUC."], grossRon: 29.7, weightGr: 2000 },
      { title: "GR. 80 / CUTIE 10 BUC.", optionValues: ["80", "CUTIE 10 BUC."], grossRon: 29.7, weightGr: 2000 },
      { title: "GR. 120 / CUTIE 10 BUC.", optionValues: ["120", "CUTIE 10 BUC."], grossRon: 29.7, weightGr: 2000 },
    ],
  },
  {
    handle: "saitris-180",
    title: "SAITRIS 180",
    description: "// COPY PENDING: SAITRIS 180 SFC -- disc abraziv lamelar pentru slefuire piatra naturala.",
    sourceImagePage: "https://www.sait-abrasives.co.uk/product-catalogue/2623-42331-sait-premium-saitris-sfc.html",
    options: [
      { name: "Granulatie", values: ["36", "60", "100", "180"] },
    ],
    variants: [
      // BUC: 49 RON → 4050 bani, 200g
      { title: "GR. 36 / BUC.", optionValues: ["36"], grossRon: 49, weightGr: 200 },
      { title: "GR. 60 / BUC.", optionValues: ["60"], grossRon: 49, weightGr: 200 },
      { title: "GR. 100 / BUC.", optionValues: ["100"], grossRon: 49, weightGr: 200 },
      { title: "GR. 180 / BUC.", optionValues: ["180"], grossRon: 49, weightGr: 200 },
    ],
  },
  {
    handle: "ek-wienner",
    title: "EK WIENNER",
    description: "// COPY PENDING: EK WIENNER DT C30P -- disc diamantat turbo pentru slefuire uscata piatra.",
    sourceImagePage: "https://www.sait-abrasives.co.uk/product-catalogue/70-42289-sait-ekwinner-dt-c30p.html",
    options: [
      { name: "Diametru", values: ["125 mm", "180 mm", "230 mm"] },
    ],
    variants: [
      { title: "125 mm / BUC.", optionValues: ["125 mm"], grossRon: 11, weightGr: 100 },
      { title: "180 mm / BUC.", optionValues: ["180 mm"], grossRon: 16, weightGr: 200 },
      { title: "230 mm / BUC.", optionValues: ["230 mm"], grossRon: 19, weightGr: 300 },
    ],
  },
  {
    handle: "suport-velcropad",
    title: "SUPORT VELCROPAD",
    description: "// COPY PENDING: Suport rotativ velcro pentru pad-uri de slefuire. Compatibil cu pad-urile SAITRON.",
    sourceImagePage: "https://www.sait-abrasives.co.uk/product-catalogue/2769-42997-pad-vel-rotativa.html",
    options: [
      { name: "Diametru", values: ["115 mm", "125 mm", "180 mm"] },
    ],
    variants: [
      { title: "115 mm / BUC.", optionValues: ["115 mm"], grossRon: 72, weightGr: 120 },
      { title: "125 mm / BUC.", optionValues: ["125 mm"], grossRon: 80, weightGr: 120 },
      { title: "180 mm / BUC.", optionValues: ["180 mm"], grossRon: 101, weightGr: 120 },
    ],
  },
]

// ─── SQL builder ─────────────────────────────────────────────────────────────

function buildProductSql(
  prod: ProductDef,
  imageUrl: string | null
): string[] {
  const sqls: string[] = []

  const prodId = newId("prod")
  const now = "NOW()"

  // product
  const thumbnail = imageUrl ? q(imageUrl) : "NULL"
  sqls.push(
    `INSERT INTO product(id,title,handle,description,status,thumbnail,created_at,updated_at)` +
    ` VALUES (${q(prodId)},${q(prod.title)},${q(prod.handle)},${q(prod.description)},'published',${thumbnail},${now},${now})` +
    ` ON CONFLICT(id) DO NOTHING;`
  )

  // category link
  sqls.push(
    `INSERT INTO product_category_product(product_id,product_category_id)` +
    ` SELECT ${q(prodId)},${q(CATEGORY_ID)} WHERE EXISTS(SELECT 1 FROM product WHERE id=${q(prodId)})` +
    ` ON CONFLICT (product_id,product_category_id) DO NOTHING;`
  )

  // image record
  if (imageUrl) {
    const imgId = newId("img")
    sqls.push(
      `INSERT INTO image(id,url,product_id,rank,created_at,updated_at)` +
      ` SELECT ${q(imgId)},${q(imageUrl)},${q(prodId)},0,${now},${now} WHERE EXISTS(SELECT 1 FROM product WHERE id=${q(prodId)})` +
      ` ON CONFLICT(id) DO NOTHING;`
    )
  }

  // options
  const optionIds: string[] = []
  for (const opt of prod.options) {
    const optId = newId("opt")
    optionIds.push(optId)
    sqls.push(
      `INSERT INTO product_option(id,title,product_id,created_at,updated_at)` +
      ` SELECT ${q(optId)},${q(opt.name)},${q(prodId)},${now},${now} WHERE EXISTS(SELECT 1 FROM product WHERE id=${q(prodId)})` +
      ` ON CONFLICT(id) DO NOTHING;`
    )
  }

  // option values: Map<optionIndex, Map<value, optionValueId>>
  const optValIds: Map<number, Map<string, string>> = new Map()
  for (let oi = 0; oi < prod.options.length; oi++) {
    const opt = prod.options[oi]
    const valMap = new Map<string, string>()
    for (const val of opt.values) {
      const ovId = newId("optval")
      valMap.set(val, ovId)
      sqls.push(
        `INSERT INTO product_option_value(id,value,option_id,created_at,updated_at)` +
        ` SELECT ${q(ovId)},${q(val)},${q(optionIds[oi])},${now},${now} WHERE EXISTS(SELECT 1 FROM product_option WHERE id=${q(optionIds[oi])})` +
        ` ON CONFLICT(id) DO NOTHING;`
      )
    }
    optValIds.set(oi, valMap)
  }

  // variants
  for (let vi = 0; vi < prod.variants.length; vi++) {
    const v = prod.variants[vi]
    const vId = newId("variant")
    const psId = newId("pset")
    const pvpsId = newId("pvps")
    const prId = newId("price")
    const iiId = newId("iitem")
    const pviiId = newId("pvitem")
    const ilevId = newId("ilev")
    const sku = `${prod.handle}-v${vi + 1}`
    const bani = netBani(v.grossRon)
    const rawAmt = `{"value": "${bani}", "precision": 20}`

    // variant
    sqls.push(
      `INSERT INTO product_variant(id,title,sku,product_id,manage_inventory,allow_backorder,variant_rank,weight,created_at,updated_at)` +
      ` SELECT ${q(vId)},${q(v.title)},${q(sku)},${q(prodId)},true,false,${vi},${v.weightGr},${now},${now}` +
      ` WHERE EXISTS(SELECT 1 FROM product WHERE id=${q(prodId)})` +
      ` ON CONFLICT(id) DO NOTHING;`
    )

    // option value links
    for (let oi = 0; oi < v.optionValues.length; oi++) {
      const ovId = optValIds.get(oi)?.get(v.optionValues[oi])
      if (ovId) {
        sqls.push(
          `INSERT INTO product_variant_option(variant_id,option_value_id)` +
          ` SELECT ${q(vId)},${q(ovId)} WHERE EXISTS(SELECT 1 FROM product_variant WHERE id=${q(vId)})` +
          ` ON CONFLICT(variant_id,option_value_id) DO NOTHING;`
        )
      }
    }

    // price_set
    sqls.push(`INSERT INTO price_set(id,created_at,updated_at) VALUES (${q(psId)},${now},${now}) ON CONFLICT(id) DO NOTHING;`)

    // product_variant_price_set
    sqls.push(
      `INSERT INTO product_variant_price_set(id,variant_id,price_set_id,created_at,updated_at)` +
      ` SELECT ${q(pvpsId)},${q(vId)},${q(psId)},${now},${now} WHERE EXISTS(SELECT 1 FROM product_variant WHERE id=${q(vId)})` +
      ` ON CONFLICT(variant_id,price_set_id) DO NOTHING;`
    )

    // price
    sqls.push(
      `INSERT INTO price(id,price_set_id,currency_code,amount,raw_amount,rules_count,created_at,updated_at)` +
      ` VALUES (${q(prId)},${q(psId)},'ron',${bani},'${rawAmt}',0,${now},${now}) ON CONFLICT(id) DO NOTHING;`
    )

    // inventory_item
    sqls.push(
      `INSERT INTO inventory_item(id,sku,title,requires_shipping,created_at,updated_at)` +
      ` VALUES (${q(iiId)},${q(sku)},${q(v.title)},true,${now},${now}) ON CONFLICT(id) DO NOTHING;`
    )

    // product_variant_inventory_item
    sqls.push(
      `INSERT INTO product_variant_inventory_item(id,variant_id,inventory_item_id,required_quantity,created_at,updated_at)` +
      ` SELECT ${q(pviiId)},${q(vId)},${q(iiId)},1,${now},${now} WHERE EXISTS(SELECT 1 FROM product_variant WHERE id=${q(vId)})` +
      ` ON CONFLICT(variant_id,inventory_item_id) DO NOTHING;`
    )

    // inventory_level
    sqls.push(
      `INSERT INTO inventory_level(id,inventory_item_id,location_id,stocked_quantity,reserved_quantity,incoming_quantity,created_at,updated_at)` +
      ` VALUES (${q(ilevId)},${q(iiId)},${q(STOCK_LOCATION)},${STOCK_QTY},0,0,${now},${now}) ON CONFLICT(id) DO NOTHING;`
    )
  }

  return sqls
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n=== import-missing-products.ts | ${DRY_RUN ? "DRY RUN" : "APPLY → PRODUCTIE"} ===\n`)

  // Verifica produse deja existente in DB
  const existRes = spawnSync("railway", ["connect", "Postgres"], {
    input: `SELECT handle FROM product WHERE handle IN (${PRODUCTS.map(p => q(p.handle)).join(",")}) AND deleted_at IS NULL;`,
    encoding: "utf8",
    cwd: path.resolve(__dirname, "../backend"),
    timeout: 30_000,
  })
  const existingHandles = new Set(
    (existRes.stdout || "").split("\n").map((l: string) => l.trim()).filter((l: string) => l && !l.startsWith("handle") && !l.startsWith("-"))
  )

  const toImport = PRODUCTS.filter(p => !existingHandles.has(p.handle))
  const skipped = PRODUCTS.length - toImport.length

  console.log(`Produse definite:    ${PRODUCTS.length}`)
  console.log(`Deja in DB (skip):   ${skipped}`)
  console.log(`De importat:         ${toImport.length}`)

  if (existingHandles.size > 0) {
    console.log(`  Skip: ${[...existingHandles].join(", ")}`)
  }

  if (toImport.length === 0) {
    console.log("\nNimic de importat. Toate produsele exista deja.")
    return
  }

  console.log("\n── PRODUSE DE IMPORTAT ──")
  for (const p of toImport) {
    const totalVariante = p.variants.length
    const totalBani = p.variants.map(v => netBani(v.grossRon))
    console.log(`  ${p.handle}:`)
    console.log(`    ${totalVariante} variante, pret ${Math.min(...totalBani)/100}–${Math.max(...totalBani)/100} RON (net, fara TVA)`)
    console.log(`    imagine sursa: ${p.sourceImagePage}`)
  }

  if (DRY_RUN) {
    console.log("\nRuleaza cu --apply pentru a importa pe Railway.")
    console.log("Include upload imagini pe R2 si creare SQL in DB.\n")
    return
  }

  // S3 client pentru R2
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.error("\nERORE: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY lipsesc din backend/.env")
    process.exit(1)
  }
  const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
    forcePathStyle: true,
  })

  const allSqls: string[] = ["BEGIN;"]

  for (const prod of toImport) {
    console.log(`\n── ${prod.handle} ──`)
    console.log(`  Descarcare imagine de pe ${prod.sourceImagePage}...`)
    const imageUrl = await downloadAndUploadImage(prod.sourceImagePage, prod.handle, s3)

    const sqls = buildProductSql(prod, imageUrl)
    allSqls.push(...sqls)
    console.log(`  SQL generat: ${sqls.length} instructiuni`)
    console.log(`  Variante: ${prod.variants.length}`)
    prod.variants.forEach(v => {
      console.log(`    ${v.title} -- ${netBani(v.grossRon)/100} RON net, ${v.weightGr}g`)
    })
  }

  allSqls.push(`SELECT 'importat: ${toImport.length} produse' as status;`)
  allSqls.push("COMMIT;")

  const sql = allSqls.join("\n")

  console.log(`\nAplic pe Railway (${allSqls.length} linii SQL)...`)
  const railwayRes = spawnSync("railway", ["connect", "Postgres"], {
    input: sql, encoding: "utf8",
    cwd: path.resolve(__dirname, "../backend"),
    timeout: 120_000,
  })

  if (railwayRes.error) { console.error("Eroare Railway:", railwayRes.error); process.exit(1) }

  const out = railwayRes.stdout || ""
  const err = railwayRes.stderr || ""
  if (err && !err.includes("psql")) console.error("STDERR:", err.slice(0, 500))

  const inserts = (out.match(/INSERT 0 \d+/g) || []).length
  const errors  = (out.match(/ERROR:/g) || []).length
  console.log(`Railway: ${inserts} insert-uri, ${errors} erori`)

  if (errors > 0) {
    console.error("\nDetalii erori:")
    console.error(out.slice(0, 1000))
    process.exit(1)
  }

  console.log(`\nAplic si local (${LOCAL_DB})...`)
  const localRes = spawnSync("psql", [LOCAL_DB], {
    input: sql, encoding: "utf8", timeout: 60_000,
  })
  if (localRes.error) console.warn("  WARN local:", localRes.error.message)
  else console.log(`  Local: ${(localRes.stdout?.match(/INSERT 0 \d+/g) || []).length} insert-uri`)

  console.log(`\n✅ Import complet: ${toImport.length} produse, ${toImport.reduce((s, p) => s + p.variants.length, 0)} variante totale`)
  console.log(`\nVerifica in admin:`)
  console.log(`  http://localhost:9000/app/products`)
  console.log(`  sau: railway connect Postgres << 'SELECT handle, title FROM product ORDER BY created_at DESC LIMIT 10;'`)
}

main().catch(e => { console.error("\nEROARE:", e.message || e); process.exit(1) })
