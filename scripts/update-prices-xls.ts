// Citeste listele de preturi din XLS si actualizeaza preturile in Medusa.
// Proba cu dry-run, aplica cu --apply.
//
// Usage:
//   npx ts-node scripts/update-prices-xls.ts            # dry-run
//   npx ts-node scripts/update-prices-xls.ts --apply    # aplica in productie

import * as XLSX from "xlsx"
import * as path from "path"

const BACKEND_URL = process.env.BACKEND_URL || "https://admin.ardmag.surmont.co"
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@ardmag.ro"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? ""
const DRY_RUN = !process.argv.includes("--apply")
const PARSE_ONLY = process.argv.includes("--parse-only")

const XLS_DIR = path.resolve(__dirname, "../docs/preturi")
const DISCURI_FILE = path.join(XLS_DIR, "Liste de preturi Discuri.xls")
const SOLUTII_FILE = path.join(XLS_DIR, "Liste de preturi Solutii DELTA.xls")

// ─── Tipuri ───────────────────────────────────────────────────────────────────

interface PriceEntry {
  productTitle: string  // titlul produsului din DB (pentru matching)
  variantTitle: string  // titlul variantei din DB (pentru matching)
  newPrice: number      // RON cu TVA, intreg
  source: string        // descriere pentru log
}

interface VariantPrice {
  productId: string
  productTitle: string
  variantId: string
  variantTitle: string
  priceId: string
  currentPrice: number  // RON cu TVA
  includesTax: boolean
}

// ─── Mapping manual Discuri Speciale ─────────────────────────────────────────
// Cheie: denumire din XLS (uppercase) -> titlu varianta din DB

const SPECIALE_MAP: Record<string, string> = {
  "DISC JBT 125 GRESIE":              "GRESIE / 125",
  "DISC JBT 125 GRESIE SB":           "GRESIE SB / 125",
  "DISC JBT 125 EDGE DRY":            "EDGE DRY / 125",
  "DISC JBT 200 HARD CERAMIC":        "HARD CERAMIC / 200",
  "DISC JBT 250 CERAMIC":             "CERAMICĂ / 250",
  "DISC JBT 250 LT39K":               "LT39K / 250",
  "DISC JBT 250 HARD CERAMIC":        "HD / 250",
  "DISC JBT 300 CERAMICA":            "CERAMICĂ / 300",
  "DISC 400 DEKTON SILENTIOS":        "DEKTON SILENȚIOS / 400",
}

// ─── Autentificare / fetch ────────────────────────────────────────────────────

let authToken = ""

async function authenticate(): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/auth/user/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })
  if (!res.ok) throw new Error(`Auth esuat: ${res.status}`)
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

// ─── Fetch preturi curente din Medusa ─────────────────────────────────────────

async function fetchVariantPrices(productIds: string[]): Promise<VariantPrice[]> {
  const result: VariantPrice[] = []

  for (const productId of productIds) {
    const data = (await apiGet(
      `/admin/products/${productId}`
    )) as { product: { id: string; title: string; variants: any[] } }

    const product = data.product
    for (const variant of product.variants ?? []) {
      const ronPrices = (variant.prices ?? []).filter((p: any) => p.currency_code === "ron")
      if (ronPrices.length === 0) continue

      // Luam primul pret RON (ar trebui sa fie unul singur per varianta)
      const price = ronPrices[0]
      result.push({
        productId: product.id,
        productTitle: product.title,
        variantId: variant.id,
        variantTitle: variant.title,
        priceId: price.id,
        currentPrice: Math.round(price.amount / 100),
        includesTax: price.includes_tax ?? false,
      })
    }
  }

  return result
}

// ─── Parsare XLS: Discuri (Marmura / Granit / Andezit) ───────────────────────
// Format sheet: [Denumire, Categorie, Pret RON(cu TVA), Greutate]
// Rândul 0 = header, de la 1 = date

function parseDiscuriSheet(wb: XLSX.WorkBook, sheetName: string, dbProductTitle: string): PriceEntry[] {
  const ws = wb.Sheets[sheetName]
  if (!ws) {
    console.warn(`  WARN: sheet "${sheetName}" negasit in fisier.`)
    return []
  }

  const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 }) as string[][]
  const entries: PriceEntry[] = []

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.length < 3) continue

    const sizeRaw = String(row[0] ?? "").trim()   // "Disc 300"
    const categRaw = String(row[1] ?? "").trim()   // "Nou" | "Silentios"
    const priceRaw = row[2]

    if (!sizeRaw || !categRaw || priceRaw == null) continue

    const sizeParts = sizeRaw.split(" ")
    const size = sizeParts[sizeParts.length - 1]  // "300"

    // Normalizare categorie la titlul din DB
    let categDB: string
    if (categRaw.toLowerCase() === "nou") {
      categDB = "NOU"
    } else if (categRaw.toLowerCase().includes("silentios") || categRaw.toLowerCase().includes("silențios")) {
      categDB = "SILENȚIOS"
    } else {
      // Repastilat sau altceva - nu e in XLS nou, sarim
      continue
    }

    const variantTitle = `${size} / ${categDB}`
    const newPrice = Math.round(Number(priceRaw))

    if (isNaN(newPrice) || newPrice <= 0) continue

    entries.push({
      productTitle: dbProductTitle,
      variantTitle,
      newPrice,
      source: `${sheetName} / Disc ${size} ${categRaw}`,
    })
  }

  return entries
}

// ─── Parsare XLS: Discuri Speciale ────────────────────────────────────────────
// Format sheet: [Denumire, Pret RON(cu TVA), Greutate] - fara coloana Categorie

function parseDiscuriSpeciale(wb: XLSX.WorkBook): PriceEntry[] {
  const ws = wb.Sheets["Discuri Speciale"]
  if (!ws) {
    console.warn('  WARN: sheet "Discuri Speciale" negasit.')
    return []
  }

  const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 }) as string[][]
  const entries: PriceEntry[] = []

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.length < 2) continue

    const denumire = String(row[0] ?? "").trim().toUpperCase()
    const priceRaw = row[1]

    if (!denumire || priceRaw == null) continue

    const variantTitle = SPECIALE_MAP[denumire]
    if (!variantTitle) {
      // Nu e mapat - e un produs nou (Distar, Slider etc.) sau ambigu
      continue
    }

    const newPrice = Math.round(Number(priceRaw))
    if (isNaN(newPrice) || newPrice <= 0) continue

    entries.push({
      productTitle: "DISCURI SPECIALE",
      variantTitle,
      newPrice,
      source: `Discuri Speciale / ${denumire}`,
    })
  }

  return entries
}

// ─── Parsare XLS: Solutii Delta ───────────────────────────────────────────────
// Format: [Denumire Produs, Cantitate, Pret RON(cu TVA), Greutate]
// Denumire e goala pe randurile de 5L (continua din randul de deasupra)

function parseSolutiiDelta(wb: XLSX.WorkBook): PriceEntry[] {
  const entries: PriceEntry[] = []

  const sheetProductMap: Record<string, string> = {
    "Impermeabilizanti pe baza de solvent": "IMPERMEABILIZANȚI PE BAZĂ DE SOLVENȚI",
    "Impermeabilizanti pe baza de apa":     "IMPERMEABILIZANȚI PE BAZĂ DE APĂ",
    "Produse specifice si de intretinere":  "SOLUȚII DELTA",
    "Detergenti":                           "SOLUȚII DELTA",
  }

  // Mapare varianta DB: "PRODUS / VOLUM" -> titlu din DB
  // Toate produsele din aceste sheet-uri sunt sub "SOLUȚII DELTA" sau ca produse individuale.
  // Pastram structura curenta: cautam dupa titlu variant care contine produsul + volumul.

  for (const [sheetName, dbProductTitle] of Object.entries(sheetProductMap)) {
    const ws = wb.Sheets[sheetName]
    if (!ws) continue

    const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 }) as string[][]
    let currentProduct = ""

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      if (!row || row.length < 3) continue

      const denumire = String(row[0] ?? "").trim()
      const cantitate = String(row[1] ?? "").trim()
      const priceRaw = row[2]

      if (denumire) currentProduct = denumire.toUpperCase()
      if (!currentProduct || !cantitate || priceRaw == null) continue

      // Normalizam cantitatea: "1 L" -> "1 LITRU", "5 L" -> "5 LITRI", "700 gr" -> "700 GR", etc.
      const cantNorm = normalizeCantitate(cantitate)
      const variantTitle = `${currentProduct} / ${cantNorm}`

      const newPrice = Math.round(Number(priceRaw))
      if (isNaN(newPrice) || newPrice <= 0) continue

      entries.push({
        productTitle: dbProductTitle,
        variantTitle,
        newPrice,
        source: `${sheetName} / ${currentProduct} ${cantitate}`,
      })
    }
  }

  return entries
}

function normalizeCantitate(raw: string): string {
  const s = raw.trim().toUpperCase()
  if (s === "1 L")    return "1 LITRU"
  if (s === "5 L")    return "5 LITRI"
  if (s === "10 L")   return "10 LITRI"
  if (s === "25 L")   return "25 LITRI"
  if (s.endsWith(" L")) {
    const n = s.replace(" L", "").trim()
    return `${n} LITRI`
  }
  if (s.endsWith("KG")) return s
  if (s.endsWith(" GR")) return s
  if (s.endsWith("GR")) return s
  return s
}

// ─── Diff & apply ─────────────────────────────────────────────────────────────

interface PriceDiff {
  entry: PriceEntry
  variant: VariantPrice
  changed: boolean
}

function buildDiff(entries: PriceEntry[], dbPrices: VariantPrice[]): {
  diffs: PriceDiff[]
  unmatched: PriceEntry[]
} {
  const diffs: PriceDiff[] = []
  const unmatched: PriceEntry[] = []

  for (const entry of entries) {
    // Cauta varianta in DB dupa titlu produs + titlu varianta (case-insensitive)
    const variant = dbPrices.find(
      (v) =>
        v.productTitle.trim().toUpperCase() === entry.productTitle.trim().toUpperCase() &&
        v.variantTitle.trim().toUpperCase() === entry.variantTitle.trim().toUpperCase()
    )

    if (!variant) {
      unmatched.push(entry)
      continue
    }

    diffs.push({
      entry,
      variant,
      changed: variant.currentPrice !== entry.newPrice,
    })
  }

  return { diffs, unmatched }
}

function printDiffTable(diffs: PriceDiff[], title: string) {
  const changed = diffs.filter((d) => d.changed)
  const same    = diffs.filter((d) => !d.changed)

  console.log(`\n── ${title} ──`)
  console.log(`   Total variante XLS: ${diffs.length} | De actualizat: ${changed.length} | Neschimbate: ${same.length}`)

  if (changed.length === 0) {
    console.log("   Toate preturile sunt deja corecte.")
    return
  }

  const sorted = changed.sort((a, b) => a.entry.variantTitle.localeCompare(b.entry.variantTitle))

  const maxVariant = Math.max(...sorted.map((d) => d.entry.variantTitle.length), 20)
  const header = `   ${"Varianta".padEnd(maxVariant)}  ${"Actual".padStart(8)}  ${"Nou".padStart(8)}  Diferenta`
  console.log(header)
  console.log("   " + "─".repeat(header.length - 3))

  for (const d of sorted) {
    const diff = d.entry.newPrice - d.variant.currentPrice
    const sign = diff > 0 ? "+" : ""
    const flag = d.variant.currentPrice > d.entry.newPrice * 5 ? " ⚠ EROARE IMPORT" : ""
    console.log(
      `   ${d.entry.variantTitle.padEnd(maxVariant)}  ${String(d.variant.currentPrice).padStart(8)} RON  ${String(d.entry.newPrice).padStart(5)} RON  ${sign}${diff} RON${flag}`
    )
  }
}

async function applyUpdates(diffs: PriceDiff[]): Promise<void> {
  const changed = diffs.filter((d) => d.changed)
  let ok = 0
  let errs = 0

  for (const d of changed) {
    try {
      await apiPost(
        `/admin/products/${d.variant.productId}/variants/${d.variant.variantId}`,
        {
          prices: [
            {
              id: d.variant.priceId,
              amount: d.entry.newPrice * 100,
              currency_code: "ron",
              includes_tax: true,
            },
          ],
        }
      )
      console.log(
        `   ✓ ${d.variant.productTitle} / ${d.variant.variantTitle}: ${d.variant.currentPrice} → ${d.entry.newPrice} RON`
      )
      ok++
    } catch (e: any) {
      console.error(`   ✗ ${d.variant.variantTitle}: ${e.message}`)
      errs++
    }
  }

  console.log(`\n   Actualizate: ${ok} | Erori: ${errs}`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const mode = PARSE_ONLY ? "PARSE ONLY" : DRY_RUN ? "DRY RUN" : "APPLY → PRODUCTIE"
  console.log(`\n=== update-prices-xls.ts | ${mode} ===\n`)
  if (!PARSE_ONLY) console.log(`Backend: ${BACKEND_URL}`)

  // 1. Parseaza XLS
  console.log("Parsez fisierele XLS...")
  const discuriWb  = XLSX.readFile(DISCURI_FILE)
  const solutiiWb  = XLSX.readFile(SOLUTII_FILE)

  const xlsEntries: PriceEntry[] = [
    ...parseDiscuriSheet(discuriWb, "Discuri Marmura",  "DISCURI MARMURĂ"),
    ...parseDiscuriSheet(discuriWb, "Discuri Granit",   "DISCURI DE GRANIT"),
    ...parseDiscuriSheet(discuriWb, "Discuri Andezit",  "DISCURI DE ANDEZIT"),
    ...parseDiscuriSpeciale(discuriWb),
    ...parseSolutiiDelta(solutiiWb),
  ]
  console.log(`Intrari parsate din XLS: ${xlsEntries.length}`)

  if (PARSE_ONLY) {
    console.log("\nIntrari parsate (productTitle | variantTitle | newPrice):")
    for (const e of xlsEntries) {
      console.log(`  ${e.productTitle.padEnd(45)} | ${e.variantTitle.padEnd(30)} | ${e.newPrice} RON`)
    }
    return
  }

  // 2. Autentificare
  console.log("\nAutentificare Medusa...")
  await authenticate()
  console.log("OK")

  // 3. Fetch preturi curente
  // Produsele afectate (IDs hardcodate pentru siguranta - nu se schimba)
  const PRODUCT_IDS = [
    "prod_01KPH3QS2YNHWSA8JX304GNF0N",  // DISCURI MARMURA
    "prod_01KPH3QQZRY2ZCRXP4W8RPW2YP",  // DISCURI DE GRANIT
    "prod_01KPH3QQ9QY8RZKG2MMMJCM223",  // DISCURI DE ANDEZIT
    "prod_01KPH3QPBX71ASJF208VPW24RP",  // DISCURI SPECIALE
    "prod_01KPH3Q9JSKVX7ZEDC7F3SQ520",  // SOLUTII DELTA (grupat)
    "prod_01KPH3R9VW7KGZ5MZ1CBHP8R8J",  // IMPERMEABILIZANTI SOLVENTI
    "prod_01KPH3R9EK98FDQGPJ5SGQF9ES",  // IMPERMEABILIZANTI APA
    "prod_01KPH3Q2D364XAXC7YSA2RJE26",  // CLEAN STONE
    "prod_01KPH3Q1AEZRD6HGKTGAGDS4TQ",  // TERGON
    "prod_01KPH3Q3FKYAGTKYKWBTBZSPY2",  // PROLUX
    "prod_01KPH3Q5MKH3YMPJBMBAYG5RTJ",  // SEAL
    "prod_01KPH3Q4XP1BFAA7CJTMX6M92J",  // WET SEAL
    "prod_01KPH3Q6BEHHV6HVWVMZQ5TW5X",  // NANO WET
    "prod_01KPH3Q4J4TZT61YMQD14GC537",  // ECO DRY+
  ]

  console.log(`\nFetch preturi curente pentru ${PRODUCT_IDS.length} produse...`)
  const dbPrices = await fetchVariantPrices(PRODUCT_IDS)
  console.log(`Variante cu pret RON gasite: ${dbPrices.length}`)

  // 4. Diff
  const { diffs, unmatched } = buildDiff(xlsEntries, dbPrices)

  const discuriDiffs  = diffs.filter((d) => d.entry.source.startsWith("Discuri"))
  const solutiiDiffs  = diffs.filter((d) => !d.entry.source.startsWith("Discuri"))

  printDiffTable(discuriDiffs, "DISCURI")
  printDiffTable(solutiiDiffs, "SOLUTII DELTA")

  if (unmatched.length > 0) {
    console.log(`\n── NEGATITE IN DB (${unmatched.length}) ──`)
    console.log("   Produse din XLS care nu au varianta corespondenta in Medusa:")
    for (const e of unmatched) {
      console.log(`   - ${e.source} → "${e.productTitle} / ${e.variantTitle}" (${e.newPrice} RON)`)
    }
  }

  const totalChanged = diffs.filter((d) => d.changed).length
  console.log(`\n${"─".repeat(50)}`)
  console.log(`De actualizat: ${totalChanged} preturi`)
  console.log(`Neschimbate:   ${diffs.length - totalChanged} preturi`)
  console.log(`Negate:        ${unmatched.length} intrari XLS`)

  if (totalChanged === 0) {
    console.log("\nNicio modificare necesara.")
    return
  }

  if (DRY_RUN) {
    console.log("\nRuleaza cu --apply pentru a aplica in productie.")
    return
  }

  // 5. Apply
  console.log("\nAplicare actualizari...\n")
  await applyUpdates(diffs)
  console.log("\nGata. Verifica preturile in admin Medusa.")
}

main().catch((err) => {
  console.error("\nEROARE:", err.message)
  process.exit(1)
})
