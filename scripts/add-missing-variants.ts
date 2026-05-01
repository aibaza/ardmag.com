// Adauga variantele lipsa pentru 3 produse:
//
//   1. ABRAZIVI TANGENTIALI -- 6 variante MARMURA noi (gr. 36/46/60/80/120/180)
//   2. ABRAZIVI ANELLI      -- 3 variante TORO (FIX. DREAPTA) noi (gr. 16/24/36)
//   3. DISCURI DE SLEFUIT CU CARBURA -- 3 variante VELCROPAD (115/125/180)
//
// Preturile si greutatile vin din XLS (Preturi SAIT.xls + Lista de pret abrazivi SITE.xls).
//
// Usage:
//   npx ts-node scripts/add-missing-variants.ts            # dry-run
//   npx ts-node scripts/add-missing-variants.ts --apply    # aplica pe Railway

import * as path from "path"
import { Client } from "pg"
import { spawnSync } from "child_process"

const DRY_RUN = !process.argv.includes("--apply")
const LOCAL_DB = process.env.DATABASE_URL || "postgres://dc@localhost:5432/ardmag"
const { generateEntityId } = require("../backend/node_modules/@medusajs/utils")

const STOCK_LOCATION = "sloc_01KPH3TTXD2AD13KRV3R56ETQT"
const STOCK_QTY = 100

// ─── ID-uri confirmate din DB ─────────────────────────────────────────────────

// ABRAZIVI TANGENTIALI
const TANG = {
  prodId:  "prod_01KPH3QYK5TND63QPZ7S8TRV6W",
  handle:  "abrazivi-tangentiali",
  optTip:  "opt_01KPH3QYK5MYNZ8FV5KZ9XR380",
  optGr:   "opt_01KPH3QYK6T2ZX8YXSPW80WBK5",
  tipMarmura: "optval_01KPH3QYK58HJZVNS00T7ZDFJB",
  gr: {
    "36":  "optval_01KPH3QYK626XDG3QB1643FJEV",
    "46":  "optval_01KPH3QYK6BXKRW9FVN389EVBA",
    "60":  "optval_01KPH3QYK67VP4T7C1ZF9GTPPE",
    "80":  "optval_01KPH3QYK6V2TZT0RRV94P056Q",
    "120": "optval_01KPH3QYK5WDDV0KNGDAM7KWDB",
    "180": "optval_01KPH3QYK529B89C6J09D82DJT",
  } as Record<string, string>,
}

// ABRAZIVI ANELLI
const ANELLI = {
  prodId:  "prod_01KPH3QXE74RSJBAC2CHPTD196",
  handle:  "abrazivi-anelli",
  optTip:  "opt_01KPH3QXE80WRS0RJGQQWQ1XKX",
  optGr:   "opt_01KPH3QXE94F60NGJ3V0YNCM65",
  tipToro: "optval_01KPH3QXE7YPS42BCWNZQN0KM4",
  gr: {
    "24": "optval_01KPH3QXE8BF18A3CX04NA7FNJ",
    "36": "optval_01KPH3QXE9CB07AZH8A0EJ9A7D",
    // "16" lipseste -- va fi creat
  } as Record<string, string>,
}

// DISCURI DE SLEFUIT CU CARBURA
const DISCURI = {
  prodId:  "prod_01KPH3RBM763TMFWDA371ZQAJM",
  handle:  "discuri-de-slefuit-cu-carbura",
  optTip:  "opt_01KPH3RBM80MQKY188FJGWPD3E",
  optDiam: "opt_01KPH3RBM8MY081AMMXXXNR8PY",
  optGr:   "opt_01KPH3RBM8P91TWQ8HTBBAAENA",
  optCant: "opt_01KPH3RBM8EKXPQKFHDFS0TZ8W",
  grStandard:  "optval_01KPH3RBM82DQM3SJSYACCTSGA",
  cantBucata:  "optval_01KPH3RBM8R17CHXDFWDM82SKR",
  diam: {
    "125": "optval_01KPH3RBM8B28XZNB7PANSJT3S",
    "180": "optval_01KPH3RBM8NVZ10R1NC7X3NCZ0",
    "230": "optval_01KPH3RBM82JEMDEHB299KNW0F",
    // "115" lipseste -- va fi creat
  } as Record<string, string>,
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function q(s: string) { return `'${s.replace(/'/g, "''")}'` }
function newId(prefix: string) { return generateEntityId(undefined, prefix) as string }

function insertVariant(
  prodId: string, handle: string,
  title: string, skuN: number,
  optvals: string[],  // [optval_id1, optval_id2, ...]
  priceBani: number, weightGr: number
): string[] {
  const vId   = newId("variant")
  const psId  = newId("pset")
  const pvpsId = newId("pvps")
  const prId  = newId("price")
  const iiId  = newId("iitem")
  const pviiId = newId("pvitem")
  const ilevId = newId("ilev")
  const sku = `${handle}-${skuN}`
  const rawAmt = `{"value": "${priceBani}", "precision": 20}`

  const sqls: string[] = [
    `INSERT INTO product_variant(id,title,sku,product_id,manage_inventory,allow_backorder,variant_rank,weight,created_at,updated_at) VALUES (${q(vId)},${q(title)},${q(sku)},${q(prodId)},true,false,0,${weightGr},NOW(),NOW()) ON CONFLICT(id) DO NOTHING;`,
    ...optvals.map(ov => `INSERT INTO product_variant_option(variant_id,option_value_id) VALUES (${q(vId)},${q(ov)}) ON CONFLICT(variant_id,option_value_id) DO NOTHING;`),
    `INSERT INTO price_set(id,created_at,updated_at) VALUES (${q(psId)},NOW(),NOW()) ON CONFLICT(id) DO NOTHING;`,
    `INSERT INTO product_variant_price_set(id,variant_id,price_set_id,created_at,updated_at) VALUES (${q(pvpsId)},${q(vId)},${q(psId)},NOW(),NOW()) ON CONFLICT(variant_id,price_set_id) DO NOTHING;`,
    `INSERT INTO price(id,price_set_id,currency_code,amount,raw_amount,rules_count,created_at,updated_at) VALUES (${q(prId)},${q(psId)},'ron',${priceBani},'${rawAmt}',0,NOW(),NOW()) ON CONFLICT(id) DO NOTHING;`,
    `INSERT INTO inventory_item(id,sku,title,requires_shipping,created_at,updated_at) VALUES (${q(iiId)},${q(sku)},${q(title)},true,NOW(),NOW()) ON CONFLICT(id) DO NOTHING;`,
    `INSERT INTO product_variant_inventory_item(id,variant_id,inventory_item_id,required_quantity,created_at,updated_at) VALUES (${q(pviiId)},${q(vId)},${q(iiId)},1,NOW(),NOW()) ON CONFLICT(variant_id,inventory_item_id) DO NOTHING;`,
    `INSERT INTO inventory_level(id,inventory_item_id,location_id,stocked_quantity,reserved_quantity,incoming_quantity,created_at,updated_at) VALUES (${q(ilevId)},${q(iiId)},${q(STOCK_LOCATION)},${STOCK_QTY},0,0,NOW(),NOW()) ON CONFLICT(id) DO NOTHING;`,
  ]
  return sqls
}

// ─── Definire variante noi ────────────────────────────────────────────────────

interface NewVariant {
  productId: string
  handle: string
  title: string
  skuN: number
  optvals: string[]
  priceBani: number
  weightGr: number
  newOptvals?: { optionId: string; value: string }[]
}

function buildPlan(anelliGr16Id: string, velcropAdTipId: string, diam115Id: string): NewVariant[] {
  const variants: NewVariant[] = []

  // 1. ABRAZIVI TANGENTIALI -- MARMURA / {gr} -- 16 RON, 1000g
  let tangSku = 23
  for (const [gr, grId] of Object.entries(TANG.gr)) {
    tangSku++
    variants.push({
      productId: TANG.prodId, handle: TANG.handle,
      title: `MARMURĂ / ${gr}`, skuN: tangSku,
      optvals: [TANG.tipMarmura, grId],
      priceBani: 1600, weightGr: 1000,
    })
  }

  // 2. ABRAZIVI ANELLI -- TORO (FIX. DREAPTA) / {16|24|36} -- 41 RON, 1000g
  const anelliGrMap: Record<string, string> = {
    "16": anelliGr16Id,
    "24": ANELLI.gr["24"],
    "36": ANELLI.gr["36"],
  }
  let anelliSku = 52
  for (const [gr, grId] of Object.entries(anelliGrMap)) {
    anelliSku++
    variants.push({
      productId: ANELLI.prodId, handle: ANELLI.handle,
      title: `TORO (FIX. DREAPTA) / ${gr}`, skuN: anelliSku,
      optvals: [ANELLI.tipToro, grId],
      priceBani: 4100, weightGr: 1000,
    })
  }

  // 3. VELCROPAD -- 115/125/180 -- pret diferit per marime
  const velcropData: [string, string, number, number][] = [
    ["115", diam115Id,                          7200, 120],
    ["125", DISCURI.diam["125"],                8000, 120],
    ["180", DISCURI.diam["180"],               10100, 120],
  ]
  let discuriSku = 27
  for (const [diam, diamId, priceBani, weightGr] of velcropData) {
    discuriSku++
    variants.push({
      productId: DISCURI.prodId, handle: DISCURI.handle,
      title: `VELCROPAD / ${diam} / STANDARD / BUCATĂ (1 BUC.)`, skuN: discuriSku,
      optvals: [velcropAdTipId, diamId, DISCURI.grStandard, DISCURI.cantBucata],
      priceBani, weightGr,
    })
  }

  return variants
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n=== add-missing-variants.ts | ${DRY_RUN ? "DRY RUN" : "APPLY → PRODUCTIE"} ===\n`)

  // Verifica ce exista deja in DB
  const client = new Client({ connectionString: LOCAL_DB })
  await client.connect()

  const existRes = await client.query(`
    SELECT v.title, p.id as prod_id FROM product_variant v
    JOIN product p ON p.id = v.product_id
    WHERE p.id IN ($1,$2,$3) AND v.deleted_at IS NULL
  `, [TANG.prodId, ANELLI.prodId, DISCURI.prodId])
  const existingTitles = new Set(existRes.rows.map((r: any) => `${r.prod_id}::${r.title}`))
  await client.end()

  // IDs pentru optvals noi (generate o singura data, idempotent prin ON CONFLICT)
  const anelliGr16Id   = newId("optval")
  const velcropTipId   = newId("optval")
  const diam115Id      = newId("optval")

  const plan = buildPlan(anelliGr16Id, velcropTipId, diam115Id)

  // Filtreaza cele deja existente
  const toInsert = plan.filter(v => !existingTitles.has(`${v.productId}::${v.title}`))
  const skipped  = plan.length - toInsert.length

  console.log(`Variante planificate:  ${plan.length}`)
  console.log(`Deja in DB (skip):     ${skipped}`)
  console.log(`De inserat:            ${toInsert.length}`)

  if (toInsert.length === 0) {
    console.log("\nNimic de adaugat.")
    return
  }

  console.log("\n── VARIANTE NOI ──")
  for (const v of toInsert) {
    const prod = v.productId === TANG.prodId ? "TANGENTIALI"
               : v.productId === ANELLI.prodId ? "ANELLI"
               : "DISCURI"
    console.log(`  [${prod}] ${v.title}  →  ${v.priceBani / 100} RON, ${v.weightGr}g`)
  }

  if (DRY_RUN) {
    console.log("\nRuleaza cu --apply pentru a aplica pe Railway.")
    return
  }

  // Genereaza SQL
  const sqls: string[] = ["BEGIN;"]

  // Optvals noi (intotdeauna inserate -- ON CONFLICT ignore daca exista deja)
  sqls.push(`INSERT INTO product_option_value(id,value,option_id,created_at,updated_at) VALUES (${q(anelliGr16Id)},'16',${q(ANELLI.optGr)},NOW(),NOW()) ON CONFLICT(id) DO NOTHING;`)
  sqls.push(`INSERT INTO product_option_value(id,value,option_id,created_at,updated_at) VALUES (${q(velcropTipId)},'VELCROPAD',${q(DISCURI.optTip)},NOW(),NOW()) ON CONFLICT(id) DO NOTHING;`)
  sqls.push(`INSERT INTO product_option_value(id,value,option_id,created_at,updated_at) VALUES (${q(diam115Id)},'115',${q(DISCURI.optDiam)},NOW(),NOW()) ON CONFLICT(id) DO NOTHING;`)

  for (const v of toInsert) {
    sqls.push(...insertVariant(v.productId, v.handle, v.title, v.skuN, v.optvals, v.priceBani, v.weightGr))
  }

  sqls.push(`SELECT 'ok: ' || ${toInsert.length} as status;`)
  sqls.push("COMMIT;")

  const sql = sqls.join("\n")

  console.log("\nAplic pe Railway...")
  const res = spawnSync("railway", ["connect", "Postgres"], {
    input: sql, encoding: "utf8",
    cwd: path.resolve(__dirname, "../backend"),
    timeout: 60_000,
  })

  if (res.error) { console.error("Eroare:", res.error); process.exit(1) }
  const out = res.stdout || ""
  const err = res.stderr || ""
  if (err && !err.includes("psql")) console.error("STDERR:", err.slice(0, 300))

  const inserts = (out.match(/INSERT 0 \d+/g) || []).length
  console.log(`Insert-uri Railway: ${inserts}`)

  console.log("\nAplic pe local DB...")
  const local = spawnSync("psql", [LOCAL_DB], {
    input: sql, encoding: "utf8", timeout: 30_000,
  })
  if (local.error) console.warn("  WARN local:", local.error.message)
  else console.log(`  Insert-uri locale: ${(local.stdout?.match(/INSERT 0 \d+/g) || []).length}`)

  console.log("\nGata!")
}

main().catch(e => { console.error("\nEROARE:", e.message); process.exit(1) })
