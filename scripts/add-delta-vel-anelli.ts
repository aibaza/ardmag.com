// Adauga 27 variante lipsa:
//   - IMPERMEABILIZANTI PE BAZA DE SOLVENTI: HL50, Q-SHINE, Q-PROTEK, SAF SEAL, TOTAL WET (10 variante)
//   - IMPERMEABILIZANTI PE BAZA DE APA: ECO DRY/10L, RAPID COTTO/1L+5L (3 variante)
//   - SOLUTII DELTA: REFLEX NERA+NEUTRA, WALL WASH, DERUX, AX CLEANER (8 variante)
//   - DISCHETE CU CARBURA: VEL 180/600 + VEL 115/180 CUTIE+BAX (4 variante)
//   - ABRAZIVI ANELLI: SUPORT/125 + SUPORT/100 (2 variante)
//
// Usage:
//   npx ts-node scripts/add-delta-vel-anelli.ts            # dry-run
//   npx ts-node scripts/add-delta-vel-anelli.ts --apply

import * as path from "path"
import { Client } from "pg"
import { spawnSync } from "child_process"
const { generateEntityId } = require("../backend/node_modules/@medusajs/utils")

const DRY_RUN  = !process.argv.includes("--apply")
const LOCAL_DB = process.env.DATABASE_URL || "postgres://dc@localhost:5432/ardmag"
const STOCK_LOC = "sloc_01KPH3TTXD2AD13KRV3R56ETQT"
const STOCK_QTY = 100

// ─── ID-uri confirmate ─────────────────────────────────────────────────────────

// IMPERMEABILIZANTI PE BAZA DE SOLVENTI
const SOLV = {
  prodId: "prod_01KPH3R9VW7KGZ5MZ1CBHP8R8J",
  handle: "impermeabilizanti-pe-baza-de-solventi",
  optDen: "opt_01KPH3R9VXBB395005J4HV67XS",  // DENUMIRE
  optCnt: "opt_01KPH3R9VXXY1ZN7FXTKBMAW41",  // CANTITATE
  cnt: {
    "1 LITRU": "optval_01KPH3R9VXCE9P1YKK5K12FXMX",
    "5 LITRI": "optval_01KPH3R9VXMCJD1C8PQME95J5Y",
  } as Record<string, string>,
}

// IMPERMEABILIZANTI PE BAZA DE APA
const APA = {
  prodId: "prod_01KPH3R9EK98FDQGPJ5SGQF9ES",
  handle: "impermeabilizanti-pe-baza-de-apa",
  optDen: "opt_01KPH3R9EMC24HPNGYWQW7QQKE",  // DENUMIRE
  optCnt: "opt_01KPH3R9EMFX8C1BNVCH7X6CZ1",  // CANTITATE
  cnt: {
    "1 LITRU": "optval_01KPH3R9EMP3Z5G2F97JMAY1C4",
    "5 LITRI": "optval_01KPH3R9EMK15XZZ0XTNCSXMKM",
    // "10 LITRI" — creat mai jos
  } as Record<string, string>,
  denEcoDry: "optval_01KPH3R9EMET6RQSWNBAJYZA64",  // ECO DRY + (existent)
}

// SOLUTII DELTA
const DELTA = {
  prodId: "prod_01KPH3Q9JSKVX7ZEDC7F3SQ520",
  handle: "solutii-delta",
  optDen: "opt_01KPH3Q9JV29K5MKWJSXVB5R9J",  // DENUMIRE
  optCnt: "opt_01KPH3Q9JW6HH6J30DPX03VKRG",  // CANTITATE
  cnt: {
    "1 LITRU": "optval_01KPH3Q9JVDE7F78T4ESHC8G17",
    "5 LITRI": "optval_01KPH3Q9JVEQ1MM8HSKB4MBEKE",
    "5 KG":    "optval_01KPH3Q9JWEEJY3EVX275WS3YE",
    // "700 GR" — creat mai jos
  } as Record<string, string>,
}

// DISCHETE CU CARBURA
const DISC = {
  prodId: "prod_01KPH3RCJVCAM46HKQWBP24XVT",
  handle: "dischete-de-slefuit-cu-carbura",
  optTip:  "opt_01KPH3RCJVJDA2MDE2Y2Q9MH42",
  optDiam: "opt_01KPH3RCJWPTE5JJGN9CE80EXY",
  optGr:   "opt_01KPH3RCJW0YHR0H0ZENY4E5AD",
  optCnt:  "opt_01KPH3RCJX3DNXQAJG06M3CG4J",
  tipVel:  "optval_01KPH3RCJV0J78D5WD7A345B3X",
  diam115: "optval_01KPH3RCJWBQXHPEEHWQDA6EZH",
  diam180: "optval_01KPH3RCJV2V15W6T08HPT9TNY",
  gr180:   "optval_01KPH3RCJWPJZS8T5YTYFBC1P0",
  gr600:   "optval_01KPH3RCJW2SAKSQDP1XZBMCBG",
  cutie50: "optval_01KPH3RCJWXYC84JCZE4ZWR8QH",
  bax400:  "optval_01KPH3RCJW5GGJKQMGQ7K81M2V",
}

// ABRAZIVI ANELLI
const ANELLI = {
  prodId: "prod_01KPH3QXE74RSJBAC2CHPTD196",
  handle: "abrazivi-anelli",
  optTip: "opt_01KPH3QXE80WRS0RJGQQWQ1XKX",
  optGr:  "opt_01KPH3QXE94F60NGJ3V0YNCM65",
  grStd:  "optval_01KPH3QXE90JD5S92BPZJX3FZ7",  // STANDARD (fallback)
  // SUPORT tip + gr 125/100 — create mai jos
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function q(s: string) { return `'${s.replace(/'/g, "''")}'` }
function newId(p: string) { return generateEntityId(undefined, p) as string }

function variantSQL(
  prodId: string, handle: string, skuN: number,
  title: string, optvals: string[],
  bani: number, gr: number
): string[] {
  const vId = newId("variant"), psId = newId("pset"), pvpsId = newId("pvps")
  const prId = newId("price"), iiId = newId("iitem")
  const pviiId = newId("pvitem"), ilevId = newId("ilev")
  const sku = `${handle}-${skuN}`
  return [
    `INSERT INTO product_variant(id,title,sku,product_id,manage_inventory,allow_backorder,variant_rank,weight,created_at,updated_at) VALUES (${q(vId)},${q(title)},${q(sku)},${q(prodId)},true,false,0,${gr},NOW(),NOW()) ON CONFLICT(id) DO NOTHING;`,
    ...optvals.map(ov => `INSERT INTO product_variant_option(variant_id,option_value_id) VALUES (${q(vId)},${q(ov)}) ON CONFLICT(variant_id,option_value_id) DO NOTHING;`),
    `INSERT INTO price_set(id,created_at,updated_at) VALUES (${q(psId)},NOW(),NOW()) ON CONFLICT(id) DO NOTHING;`,
    `INSERT INTO product_variant_price_set(id,variant_id,price_set_id,created_at,updated_at) VALUES (${q(pvpsId)},${q(vId)},${q(psId)},NOW(),NOW()) ON CONFLICT(variant_id,price_set_id) DO NOTHING;`,
    `INSERT INTO price(id,price_set_id,currency_code,amount,raw_amount,rules_count,created_at,updated_at) VALUES (${q(prId)},${q(psId)},'ron',${bani},'{"value":"${bani}","precision":20}',0,NOW(),NOW()) ON CONFLICT(id) DO NOTHING;`,
    `INSERT INTO inventory_item(id,sku,title,requires_shipping,created_at,updated_at) VALUES (${q(iiId)},${q(sku)},${q(title)},true,NOW(),NOW()) ON CONFLICT(id) DO NOTHING;`,
    `INSERT INTO product_variant_inventory_item(id,variant_id,inventory_item_id,required_quantity,created_at,updated_at) VALUES (${q(pviiId)},${q(vId)},${q(iiId)},1,NOW(),NOW()) ON CONFLICT(variant_id,inventory_item_id) DO NOTHING;`,
    `INSERT INTO inventory_level(id,inventory_item_id,location_id,stocked_quantity,reserved_quantity,incoming_quantity,created_at,updated_at) VALUES (${q(ilevId)},${q(iiId)},${q(STOCK_LOC)},${STOCK_QTY},0,0,NOW(),NOW()) ON CONFLICT(id) DO NOTHING;`,
  ]
}

function optvalSQL(id: string, value: string, optionId: string): string {
  return `INSERT INTO product_option_value(id,value,option_id,created_at,updated_at) VALUES (${q(id)},${q(value)},${q(optionId)},NOW(),NOW()) ON CONFLICT(id) DO NOTHING;`
}

// ─── Plan ─────────────────────────────────────────────────────────────────────

interface Entry { title: string; bani: number; grGram: number; optvals: string[]; prodId: string; handle: string; skuN: number }

function buildPlan(
  cnt10l: string, cnt700gr: string,
  solv: Record<string, string>,  // DENUMIRE noi pt solvent
  apa: Record<string, string>,   // DENUMIRE noi pt apa
  deltaD: Record<string, string>, // DENUMIRE noi pt delta
  anelliSuportTip: string, gr125: string, gr100: string
): Entry[] {
  const entries: Entry[] = []

  // ── SOLVENTI: HL50, Q-SHINE, Q-PROTEK, SAF SEAL, TOTAL WET ────────────────
  const solvData: [string, string, number, number][] = [
    ["HL50",      "1 LITRU", 8000,  1000],
    ["HL50",      "5 LITRI", 32700, 5000],
    ["Q-SHINE",   "1 LITRU", 14900, 1000],
    ["Q-SHINE",   "5 LITRI", 65500, 5000],
    ["Q-PROTEK",  "1 LITRU", 14900, 1000],
    ["Q-PROTEK",  "5 LITRI", 65500, 5000],
    ["SAF SEAL",  "1 LITRU", 13400, 1000],
    ["SAF SEAL",  "5 LITRI", 59500, 5000],
    ["TOTAL WET", "1 LITRU", 12800, 1000],
    ["TOTAL WET", "5 LITRI", 56500, 5000],
  ]
  let solvSku = 17
  for (const [den, cant, bani, grGram] of solvData) {
    solvSku++
    entries.push({
      prodId: SOLV.prodId, handle: SOLV.handle, skuN: solvSku,
      title: `${den} / ${cant}`, bani, grGram,
      optvals: [solv[den], SOLV.cnt[cant]],
    })
  }

  // ── APA: ECO DRY/10L, RAPID COTTO/1L+5L ──────────────────────────────────
  let apaSku = 7
  apaSku++
  entries.push({
    prodId: APA.prodId, handle: APA.handle, skuN: apaSku,
    title: "ECO DRY + / 10 LITRI", bani: 59500, grGram: 10500,
    optvals: [APA.denEcoDry, cnt10l],
  })
  const rapCottoData: [string, number, number][] = [
    ["1 LITRU", 10400, 1200],
    ["5 LITRI", 46100, 5200],
  ]
  for (const [cant, bani, grGram] of rapCottoData) {
    apaSku++
    entries.push({
      prodId: APA.prodId, handle: APA.handle, skuN: apaSku,
      title: `RAPID COTTO / ${cant}`, bani, grGram,
      optvals: [apa["RAPID COTTO"], APA.cnt[cant]],
    })
  }

  // ── SOLUTII DELTA ─────────────────────────────────────────────────────────
  const deltaData: [string, string, number, number][] = [
    ["REFLEX NERA",   "700 GR", 6000,  800],
    ["REFLEX NEUTRA", "700 GR", 6000,  800],
    ["WALL WASH",     "1 LITRU",  7700, 1200],
    ["WALL WASH",     "5 LITRI", 32700, 5200],
    ["DERUX",         "1 LITRU",  5400, 1200],
    ["DERUX",         "5 LITRI", 23800, 5200],
    ["AX CLEANER",    "5 LITRI", 23800, 5200],
    // SABBIATORE AX/F / 5 LITRI → mapata la varianta existenta 5 KG, nu se adauga
  ]
  const cntDelta: Record<string, string> = {
    "1 LITRU": DELTA.cnt["1 LITRU"],
    "5 LITRI": DELTA.cnt["5 LITRI"],
    "700 GR":  cnt700gr,
  }
  let deltaSku = 36
  for (const [den, cant, bani, grGram] of deltaData) {
    deltaSku++
    entries.push({
      prodId: DELTA.prodId, handle: DELTA.handle, skuN: deltaSku,
      title: `${den} / ${cant}`, bani, grGram,
      optvals: [deltaD[den], cntDelta[cant]],
    })
  }

  // ── VEL lipsuri: 180/600 si 115/180 ──────────────────────────────────────
  // SKU continua de la 202 (max_sku DISCHETE era 151, dar am adaugat BUC. deja la 151)
  // Nu stim exact max SKU curent -- punem un offset sigur
  const discData: [string, string, string, string, number, number, number][] = [
    // [tip, diam_id, gr_id, cant_id, bani, grGram, skuOffset]
    ["VEL", DISC.diam180, DISC.gr600, DISC.cutie50, 19000,  500, 152],
    ["VEL", DISC.diam180, DISC.gr600, DISC.bax400,  120000, 7000, 153],
    ["VEL", DISC.diam115, DISC.gr180, DISC.cutie50, 8000,   500, 154],
    ["VEL", DISC.diam115, DISC.gr180, DISC.bax400,  60000,  7000, 155],
  ]
  for (const [, diamId, grId, cantId, bani, grGram, skuN] of discData) {
    const cantLabel = cantId === DISC.cutie50 ? "CUTIE (50 BUC.)" : "BAX (400 BUC.)"
    const diamLabel = diamId === DISC.diam180 ? "180" : "115"
    const grLabel   = grId   === DISC.gr600   ? "600" : "180"
    entries.push({
      prodId: DISC.prodId, handle: DISC.handle, skuN,
      title: `VEL / ${diamLabel} / ${grLabel} / ${cantLabel}`, bani, grGram,
      optvals: [DISC.tipVel, diamId, grId, cantId],
    })
  }

  // ── ABRAZIVI ANELLI: SUPORT/125 + SUPORT/100 ─────────────────────────────
  entries.push({
    prodId: ANELLI.prodId, handle: ANELLI.handle, skuN: 56,
    title: "SUPORT / 125", bani: 59500, grGram: 500,
    optvals: [anelliSuportTip, gr125],
  })
  entries.push({
    prodId: ANELLI.prodId, handle: ANELLI.handle, skuN: 57,
    title: "SUPORT / 100", bani: 41700, grGram: 300,
    optvals: [anelliSuportTip, gr100],
  })

  return entries
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n=== add-delta-vel-anelli.ts | ${DRY_RUN ? "DRY RUN" : "APPLY → PRODUCTIE"} ===\n`)

  // Verifica existente
  const client = new Client({ connectionString: LOCAL_DB })
  await client.connect()
  const res = await client.query(`
    SELECT v.title, v.product_id FROM product_variant v
    WHERE v.product_id IN ($1,$2,$3,$4,$5) AND v.deleted_at IS NULL
  `, [SOLV.prodId, APA.prodId, DELTA.prodId, DISC.prodId, ANELLI.prodId])
  const existing = new Set(res.rows.map((r: any) => `${r.product_id}::${r.title}`))
  await client.end()

  // IDs noi pentru optvals lipsa
  const cnt10l = newId("optval")         // CANTITATE: 10 LITRI (apa)
  const cnt700gr = newId("optval")       // CANTITATE: 700 GR (delta)
  const solvDenIds: Record<string,string> = {}
  for (const d of ["HL50","Q-SHINE","Q-PROTEK","SAF SEAL","TOTAL WET"]) solvDenIds[d] = newId("optval")
  const apaDenIds: Record<string,string> = { "RAPID COTTO": newId("optval") }
  const deltaDenIds: Record<string,string> = {}
  for (const d of ["REFLEX NERA","REFLEX NEUTRA","WALL WASH","DERUX","AX CLEANER"]) deltaDenIds[d] = newId("optval")
  const anelliSuportTip = newId("optval")  // TIP ANELLI: SUPORT
  const gr125 = newId("optval")            // GRANULATIE: 125
  const gr100 = newId("optval")            // GRANULATIE: 100

  const plan = buildPlan(cnt10l, cnt700gr, solvDenIds, apaDenIds, deltaDenIds, anelliSuportTip, gr125, gr100)
  const toInsert = plan.filter(e => !existing.has(`${e.prodId}::${e.title}`))
  const skipped = plan.length - toInsert.length

  console.log(`Planificate: ${plan.length}  |  Deja in DB: ${skipped}  |  De inserat: ${toInsert.length}`)
  console.log()

  const groups: Record<string, Entry[]> = {}
  for (const e of toInsert) {
    const label = e.prodId === SOLV.prodId ? "SOLVENTI"
                : e.prodId === APA.prodId  ? "APA"
                : e.prodId === DELTA.prodId? "DELTA"
                : e.prodId === DISC.prodId ? "DISCHETE"
                : "ANELLI"
    ;(groups[label] = groups[label] || []).push(e)
  }
  for (const [g, entries] of Object.entries(groups)) {
    console.log(`── ${g} (${entries.length}) ──`)
    for (const e of entries) console.log(`  ${e.title}  →  ${e.bani/100} RON, ${e.grGram}g`)
  }

  if (toInsert.length === 0) { console.log("\nNimic de adaugat."); return }
  if (DRY_RUN) { console.log("\nRuleaza cu --apply pentru a aplica."); return }

  // Genereaza SQL
  const sqls: string[] = ["BEGIN;"]

  // Optvals noi (CANTITATE)
  sqls.push(optvalSQL(cnt10l,   "10 LITRI", APA.optCnt))
  sqls.push(optvalSQL(cnt700gr, "700 GR",   DELTA.optCnt))

  // DENUMIRE noi solventi
  for (const [d, id] of Object.entries(solvDenIds))  sqls.push(optvalSQL(id, d, SOLV.optDen))
  // DENUMIRE noi apa
  for (const [d, id] of Object.entries(apaDenIds))   sqls.push(optvalSQL(id, d, APA.optDen))
  // DENUMIRE noi delta
  for (const [d, id] of Object.entries(deltaDenIds)) sqls.push(optvalSQL(id, d, DELTA.optDen))
  // TIP ANELLI: SUPORT
  sqls.push(optvalSQL(anelliSuportTip, "SUPORT", ANELLI.optTip))
  // GRANULATIE: 125, 100
  sqls.push(optvalSQL(gr125, "125", ANELLI.optGr))
  sqls.push(optvalSQL(gr100, "100", ANELLI.optGr))

  // Variante
  for (const e of toInsert) {
    sqls.push(...variantSQL(e.prodId, e.handle, e.skuN, e.title, e.optvals, e.bani, e.grGram))
  }

  sqls.push(`SELECT 'inserat: ${toInsert.length}' as status;`)
  sqls.push("COMMIT;")

  const sql = sqls.join("\n")

  console.log("\nAplic pe Railway...")
  const r = spawnSync("railway", ["connect", "Postgres"], {
    input: sql, encoding: "utf8",
    cwd: path.resolve(__dirname, "../backend"),
    timeout: 60_000,
  })
  if (r.error) { console.error("Eroare Railway:", r.error); process.exit(1) }
  const rErr = r.stderr || ""
  if (rErr && !rErr.includes("psql")) console.error("STDERR:", rErr.slice(0, 300))
  console.log(`  Insert-uri Railway: ${(r.stdout?.match(/INSERT 0 \d+/g) || []).length}`)

  console.log("Aplic pe local DB...")
  const l = spawnSync("psql", [LOCAL_DB], { input: sql, encoding: "utf8", timeout: 30_000 })
  if (l.error) console.warn("  WARN local:", l.error.message)
  else console.log(`  Insert-uri locale: ${(l.stdout?.match(/INSERT 0 \d+/g) || []).length}`)

  console.log("\nGata!")
}

main().catch(e => { console.error("\nEROARE:", e.message); process.exit(1) })
