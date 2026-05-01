// Citeste TOATE listele de pret din docs/preturi/ si actualizeaza pretul + greutatea
// in baza de date Railway prin SQL via `railway connect Postgres`.
//
// Usage:
//   npx ts-node scripts/update-all-prices-weights.ts            # dry-run
//   npx ts-node scripts/update-all-prices-weights.ts --apply    # aplica in productie

import * as XLSX from "xlsx"
import * as path from "path"
import { Client } from "pg"
import { execSync, spawnSync } from "child_process"

const DRY_RUN = !process.argv.includes("--apply")
const XLS_DIR = path.resolve(__dirname, "../docs/preturi")
const LOCAL_DB = process.env.DATABASE_URL || "postgres://dc@localhost:5432/ardmag"

// ─── Tipuri ───────────────────────────────────────────────────────────────────

interface Entry {
  productTitle: string
  variantTitle: string
  price: number      // RON cu TVA, intreg
  weightKg: number   // kg
  source: string
}

interface DBVariant {
  variantId: string
  variantTitle: string
  productId: string
  productTitle: string
  priceId: string | null
  currentPrice: number | null
  currentWeight: number | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function norm(s: string): string {
  return s
    .toUpperCase()
    .replace(/Ș/g, "S").replace(/Ț/g, "T").replace(/Ă/g, "A")
    .replace(/Î/g, "I").replace(/Â/g, "A").replace(/ș/g, "s")
    .replace(/ț/g, "t").replace(/ă/g, "a").replace(/î/g, "i")
    .replace(/â/g, "a")
    .replace(/\s+/g, " ")
    .trim()
}

function parseNum(v: unknown): number {
  if (v == null || v === "") return 0
  let s = String(v).trim()
  // Format romanesc: "1.100,00" (punct=mii, virgula=zecimala)
  // vs. "1,5" (virgula=zecimala) vs. "1100.00" (punct=zecimala)
  const hasDot = s.includes(".")
  const hasComma = s.includes(",")
  if (hasDot && hasComma) {
    const lastDot = s.lastIndexOf(".")
    const lastComma = s.lastIndexOf(",")
    if (lastComma > lastDot) {
      // "1.100,00" → format romanesc: elimina punct, virgula→punct
      s = s.replace(/\./g, "").replace(",", ".")
    } else {
      // "1,100.00" → format anglosaxon: elimina virgula
      s = s.replace(/,/g, "")
    }
  } else if (hasComma) {
    s = s.replace(",", ".")
  }
  s = s.replace(/\s/g, "")
  return parseFloat(s) || 0
}

function cellStr(ws: XLSX.WorkSheet, r: number, c: number): string {
  const cell = ws[XLSX.utils.encode_cell({ r, c })]
  if (!cell) return ""
  if (cell.t === "n") {
    const v = cell.v as number
    return v === Math.floor(v) ? String(Math.floor(v)) : String(v)
  }
  return String(cell.v ?? "").trim()
}

function cellNum(ws: XLSX.WorkSheet, r: number, c: number): number {
  const cell = ws[XLSX.utils.encode_cell({ r, c })]
  if (!cell) return 0
  return parseNum(cell.v)
}

// ─── Parsere per fisier/sheet ─────────────────────────────────────────────────

function parseDiscuri(): Entry[] {
  const wb = XLSX.readFile(path.join(XLS_DIR, "Liste de preturi Discuri.xls"))
  const entries: Entry[] = []

  const discuriSheets: [string, string][] = [
    ["Discuri Marmura",  "DISCURI MARMURĂ"],
    ["Discuri Granit",   "DISCURI DE GRANIT"],
    ["Discuri Andezit",  "DISCURI DE ANDEZIT"],
  ]

  for (const [sheet, productTitle] of discuriSheets) {
    const ws = wb.Sheets[sheet]
    if (!ws) continue
    const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 }) as any[][]
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r]
      if (!row || !row[0]) continue
      const sizeRaw = String(row[0]).trim()
      const categRaw = String(row[1] ?? "").trim()
      const price = parseNum(row[2])
      const weightKg = parseNum(row[3])
      if (!price) continue
      const size = sizeRaw.split(" ").pop() ?? sizeRaw
      const categ = categRaw.toLowerCase() === "nou" ? "NOU"
                  : categRaw.toLowerCase().includes("silentios") ? "SILENȚIOS"
                  : null
      if (!categ) continue
      entries.push({ productTitle, variantTitle: `${size} / ${categ}`, price, weightKg, source: `${sheet} R${r}` })
    }
  }

  // Discuri Speciale
  const wsS = wb.Sheets["Discuri Speciale"]
  const SPECIALE: Record<string, string> = {
    "DISC JBT 125 GRESIE": "GRESIE / 125",
    "DISC JBT 125 GRESIE SB": "GRESIE SB / 125",
    "DISC JBT 125 EDGE DRY": "EDGE DRY / 125",
    "DISC JBT 200 HARD CERAMIC": "HARD CERAMIC / 200",
    "DISC JBT 250 CERAMIC": "CERAMICĂ / 250",
    "DISC JBT 250 LT39K": "LT39K / 250",
    "DISC JBT 250 HARD CERAMIC": "HD / 250",
    "DISC JBT 300 CERAMICA": "CERAMICĂ / 300",
    "DISC 400 DEKTON SILENTIOS": "DEKTON SILENȚIOS / 400",
  }
  if (wsS) {
    const rows = XLSX.utils.sheet_to_json<any[]>(wsS, { header: 1 }) as any[][]
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r]
      if (!row || !row[0]) continue
      const den = String(row[0]).trim().toUpperCase()
      const vt = SPECIALE[den]
      if (!vt) continue
      const price = parseNum(row[1])
      const weightKg = parseNum(row[2])
      if (!price) continue
      entries.push({ productTitle: "DISCURI SPECIALE", variantTitle: vt, price, weightKg, source: `Discuri Speciale R${r}` })
    }
  }

  return entries
}

function parseSolutiiDelta(): Entry[] {
  const wb = XLSX.readFile(path.join(XLS_DIR, "Liste de preturi Solutii DELTA.xls"))
  const entries: Entry[] = []

  const NORM_CANT: Record<string, string> = {
    "1 L": "1 LITRU", "5 L": "5 LITRI", "10 L": "10 LITRI", "25 L": "25 LITRI",
  }
  const normCant = (s: string) => {
    const u = s.trim().toUpperCase()
    if (NORM_CANT[u]) return NORM_CANT[u]
    if (u.endsWith(" L")) return u.replace(" L", "") + " LITRI"
    return u
  }

  const sheetMap: Record<string, string> = {
    "Impermeabilizanti pe baza de solvent": "IMPERMEABILIZANȚI PE BAZĂ DE SOLVENȚI",
    "Impermeabilizanti pe baza de apa":     "IMPERMEABILIZANȚI PE BAZĂ DE APĂ",
    "Produse specifice si de intretinere":  "SOLUȚII DELTA",
    "Detergenti":                           "SOLUȚII DELTA",
  }

  for (const [sheet, productTitle] of Object.entries(sheetMap)) {
    const ws = wb.Sheets[sheet]
    if (!ws) continue
    const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 }) as any[][]
    let curProd = ""
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r]
      if (!row) continue
      const den = String(row[0] ?? "").trim()
      const cant = String(row[1] ?? "").trim()
      const price = parseNum(row[2])
      const weightKg = parseNum(row[3])
      if (den) curProd = den.toUpperCase().replace(/\s+/g, " ").trim()
      if (!curProd || !cant || !price) continue
      let cantNorm = normCant(cant)
      // SABBIATORE AX/F vine ca "5 LITRI" in XLS dar DB are "5 KG" (acelasi produs)
      if (curProd.startsWith("SABBIATORE") && cantNorm === "5 LITRI") cantNorm = "5 KG"
      // ECO DRY in XLS = ECO DRY + in DB (omis semnul + in lista de preturi)
      if (curProd === "ECO DRY") curProd = "ECO DRY +"
      const variantTitle = `${curProd} / ${cantNorm}`
      entries.push({ productTitle, variantTitle, price, weightKg, source: `${sheet} R${r}` })
    }
  }

  return entries
}

function parseAbrazivi(): Entry[] {
  const wb = XLSX.readFile(path.join(XLS_DIR, "Lista de pret abrazivi SITE.xls"))
  const entries: Entry[] = []

  // ── Frankfurt ──────────────────────────────────────────────────────────────
  // F1 M XX        (16-320)  → MAGNEZIT GRANIT / XX     (same price as marmura)
  // F1 M XXP       (16P-320P)→ MAGNEZIT MARMURĂ / XX
  // F1 M 3/4 (360)           → SINTETIC MARMURĂ / 360
  // F1 M 400-1200            → SINTETIC MARMURĂ / XX
  // F1 M 5 EXTRA {D|DD|M|T} → MARMURĂ 5 EXTRA / {D|DD|M|T}
  // F1 SUPORT                → SUPORT FRANKFURT (produs separat)
  // F1 PERIE ANTICARE XX     → PERIE ANTICARE / XX
  // F1 PERIE OTEL/INOX       → PERIE OȚEL | PERIE INOX / STANDARD
  // F1 PERIE DIAMANTATA XX   → PERIE DIAMANTATĂ / XX
  // F1 REZINOIDICI XX        → DIAMANTAT / XX (sau SINTETIC MARMURĂ / XX)
  {
    const ws = wb.Sheets["Abrazivi Frankfurt"]
    if (ws) {
      const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 }) as any[][]
      for (let r = 1; r < rows.length; r++) {
        const row = rows[r]
        if (!row || !row[0]) continue
        const den = String(row[0]).trim().toUpperCase()
        const price = parseNum(row[2])
        const weightKg = parseNum(row[3])
        if (!price) continue
        const src = `Frankfurt R${r}`

        if (den.startsWith("F1 SUPORT")) {
          entries.push({ productTitle: "SUPORT FRANKFURT", variantTitle: "DEFAULT", price, weightKg, source: src })

        } else if (den.startsWith("F1 PERIE ANTICARE ")) {
          const n = den.replace("F1 PERIE ANTICARE ", "").trim()
          entries.push({ productTitle: "ABRAZIVI ȘI PERII FRANKFURT", variantTitle: `PERIE ANTICARE / ${n}`, price, weightKg, source: src })

        } else if (den === "F1 PERIE OTEL" || den === "F1 PERIE INOX") {
          // DB combina PERIE OTEL si PERIE INOX intr-o singura varianta
          entries.push({ productTitle: "ABRAZIVI ȘI PERII FRANKFURT", variantTitle: "PERIE OȚEL/INOX / STANDARD", price, weightKg, source: src })

        } else if (den.startsWith("F1 PERIE DIAMANTATA ")) {
          const n = den.replace("F1 PERIE DIAMANTATA ", "").trim()
          entries.push({ productTitle: "ABRAZIVI ȘI PERII FRANKFURT", variantTitle: `PERIE DIAMANTATĂ / ${n}`, price, weightKg, source: src })

        } else if (den.startsWith("F1 M 5 EXTRA ")) {
          const suffix = den.replace("F1 M 5 EXTRA ", "").trim()
          entries.push({ productTitle: "ABRAZIVI ȘI PERII FRANKFURT", variantTitle: `MARMURĂ 5 EXTRA / ${suffix}`, price, weightKg, source: src })

        } else if (den === "F1 M 3/4 (360)") {
          entries.push({ productTitle: "ABRAZIVI ȘI PERII FRANKFURT", variantTitle: "SINTETIC MARMURĂ / 360", price, weightKg, source: src })

        } else if (den.startsWith("F1 REZINOIDICI ")) {
          // Rezinoidici nu au corespondent clar in DB — skip

        } else if (den.startsWith("F1 M ")) {
          const rest = den.replace("F1 M ", "").trim()
          if (rest.endsWith("P")) {
            const n = rest.slice(0, -1)
            entries.push({ productTitle: "ABRAZIVI ȘI PERII FRANKFURT", variantTitle: `MAGNEZIT MARMURĂ / ${n}`, price, weightKg, source: src })
          } else {
            const n = rest
            const gran = parseInt(n)
            if (gran >= 400) {
              // granulații mari = SINTETIC MARMURĂ
              entries.push({ productTitle: "ABRAZIVI ȘI PERII FRANKFURT", variantTitle: `SINTETIC MARMURĂ / ${n}`, price, weightKg, source: src })
            } else {
              // granulații mici = MAGNEZIT GRANIT
              entries.push({ productTitle: "ABRAZIVI ȘI PERII FRANKFURT", variantTitle: `MAGNEZIT GRANIT / ${n}`, price, weightKg, source: src })
            }
          }
        } else if (den.startsWith("GRANIT SUPERLUX")) {
          entries.push({ productTitle: "ABRAZIVI ȘI PERII FRANKFURT", variantTitle: "GRANIT SUPERLUX / STANDARD", price, weightKg, source: src })
        }
      }
    }
  }

  // ── Tangentiali ────────────────────────────────────────────────────────────
  {
    const ws = wb.Sheets["Abrazivi tangentiali"]
    if (ws) {
      const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 }) as any[][]
      for (let r = 1; r < rows.length; r++) {
        const row = rows[r]
        if (!row || !row[0]) continue
        const den = String(row[0]).trim().toUpperCase()
        const price = parseNum(row[2])
        const weightKg = parseNum(row[3])
        if (!price) continue
        const src = `Tangentiali R${r}`

        if (den.startsWith("TANGENTIALI GRANIT SUPERLUX")) {
          entries.push({ productTitle: "ABRAZIVI TANGENȚIALI", variantTitle: "GRANIT SUPERLUX / STANDARD", price, weightKg, source: src })
        } else if (den.startsWith("TANGENTIALI GRANIT ")) {
          const n = den.replace("TANGENTIALI GRANIT ", "").trim()
          entries.push({ productTitle: "ABRAZIVI TANGENȚIALI", variantTitle: `GRANIT / ${n}`, price, weightKg, source: src })
        } else if (den === "TANGENTIALI MARMURA PRESAT") {
          entries.push({ productTitle: "ABRAZIVI TANGENȚIALI", variantTitle: "MARMURĂ PRESAT / STANDARD", price, weightKg, source: src })
        } else if (den.startsWith("TANGENTIALI MARMURA ")) {
          const n = den.replace("TANGENTIALI MARMURA ", "").trim()
          entries.push({ productTitle: "ABRAZIVI TANGENȚIALI", variantTitle: `MARMURĂ / ${n}`, price, weightKg, source: src })
        }
      }
    }
  }

  // ── Anelli ─────────────────────────────────────────────────────────────────
  {
    const ws = wb.Sheets["Abrazivi anelli"]
    if (ws) {
      const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 }) as any[][]
      for (let r = 1; r < rows.length; r++) {
        const row = rows[r]
        if (!row || !row[0]) continue
        const den = String(row[0]).trim().toUpperCase()
        const price = parseNum(row[2])
        const weightKg = parseNum(row[3])
        if (!price) continue
        const src = `Anelli R${r}`

        if (den === "ANELLI EXTRA") {
          entries.push({ productTitle: "ABRAZIVI ANELLI", variantTitle: "EXTRA / STANDARD", price, weightKg, source: src })
        } else if (den === "ANELLI SUPERLUX") {
          entries.push({ productTitle: "ABRAZIVI ANELLI", variantTitle: "SUPERLUX / STANDARD", price, weightKg, source: src })
        } else if (den === "ANELLI DX TORO 5 EXTRA") {
          entries.push({ productTitle: "ABRAZIVI ANELLI", variantTitle: "TORO 5 EXTRA (DREAPTA) / STANDARD", price, weightKg, source: src })
        } else if (den === "ANELLI DX TORO SUPERLUX") {
          entries.push({ productTitle: "ABRAZIVI ANELLI", variantTitle: "TORO SUPERLUX / STANDARD", price, weightKg, source: src })
        } else if (den.startsWith("ANELLI DX TORO ")) {
          const n = den.replace("ANELLI DX TORO ", "").trim()
          entries.push({ productTitle: "ABRAZIVI ANELLI", variantTitle: `TORO (FIX. DREAPTA) / ${n}`, price, weightKg, source: src })
        } else if (den.startsWith("ANELLI FRONTAL ")) {
          const n = den.replace("ANELLI FRONTAL ", "").trim()
          entries.push({ productTitle: "ABRAZIVI ANELLI", variantTitle: `FIXARE FRONTALĂ / ${n}`, price, weightKg, source: src })
        } else if (den.startsWith("ANELLI DX ")) {
          const n = den.replace("ANELLI DX ", "").trim()
          entries.push({ productTitle: "ABRAZIVI ANELLI", variantTitle: `FIXARE DREAPTA / ${n}`, price, weightKg, source: src })
        } else if (den.startsWith("ANELLI DIAMANTAT ")) {
          // Nu exista in DB ca ABRAZIVI ANELLI — skip cu log
          // console.log(`  SKIP Anelli Diamantat (no DB match): ${den}`)
        }
      }
    }
  }

  // ── Oala ───────────────────────────────────────────────────────────────────
  {
    const ws = wb.Sheets["Abrazivi Oala"]
    if (ws) {
      const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 }) as any[][]
      for (let r = 1; r < rows.length; r++) {
        const row = rows[r]
        if (!row || !row[0]) continue
        const den = String(row[0]).trim().toUpperCase()
        const price = parseNum(row[2])
        const weightKg = parseNum(row[3])
        if (!price) continue
        const src = `Oala R${r}`

        if (den.startsWith("MINIOALA ")) {
          const n = den.replace("MINIOALA ", "").trim()
          entries.push({ productTitle: "ABRAZIVI OALĂ", variantTitle: `MINIOALĂ / ${n}`, price, weightKg, source: src })
        } else if (den.startsWith("OALA ")) {
          const n = den.replace("OALA ", "").trim()
          entries.push({ productTitle: "ABRAZIVI OALĂ", variantTitle: `OALĂ / ${n}`, price, weightKg, source: src })
        }
      }
    }
  }

  return entries
}

function parseTenaxDiverse(): Entry[] {
  const wb = XLSX.readFile(path.join(XLS_DIR, "Lista pret TENAX + Diverse.xls"))
  const entries: Entry[] = []

  // ── Mastic TENAX ──────────────────────────────────────────────────────────
  // Mapare explicita: XLS denumire → {productTitle, variantTitle}
  const TENAX_MAP: Record<string, { p: string; v: string }> = {
    "TENAX SOLIDO 1 L ALB":    { p: "MASTIC SOLID", v: "ALB / 1 LITRU" },
    "TENAX SOLIDO 1 L BEJ":    { p: "MASTIC SOLID", v: "BEJ / 1 LITRU" },
    "TENAX SOLIDO 1 L NEGRU":  { p: "MASTIC SOLID", v: "NEGRU / 1 LITRU" },
    "TENAX SOLIDO 4 L ALB":    { p: "MASTIC SOLID", v: "ALB / 4 LITRI" },
    "TENAX SOLIDO 4 L BEJ":    { p: "MASTIC SOLID", v: "BEJ / 4 LITRI" },
    "TENAX SOLIDO 18 L BEJ":   { p: "MASTIC SOLID", v: "BEJ / 18 LITRI" },
    "TENAX SOLIDO 18 L JURA":  { p: "MASTIC SOLID", v: "JURA / 18 LITRI" },
    "TENAX SEMISOLIDO  18 L ALB":  { p: "MASTIC SEMISOLID", v: "ALB / 18 LITRI" },
    "TENAX SEMISOLIDO  18 L BEJ":  { p: "MASTIC SEMISOLID", v: "BEJ / 18 LITRI" },
    "TENAX SEMISOLIDO  18 L JURA": { p: "MASTIC SEMISOLID", v: "JURA / 18 LITRI" },
    "TENAX SEMISOLIDO WET 18 L BEJ": { p: "MASTIC SEMISOLID WET", v: "DEFAULT" },
    "TENAX LICHID TRANSPARENT 1L": { p: "MASTIC LICHID", v: "TRANSPARENT / 1 LITRU" },
    "TENAX LICHID BEJ 1L":         { p: "MASTIC LICHID", v: "BEJ / 1 LITRU" },
    "TENAX TIXO XE POLIESTERIC TRANSPARENT 1 L": { p: "TIXO XE TRANSPARENT", v: "1 LITRU" },
    "TENAX TIXO XE POLIESTERIC TRANSPARENT 4 L": { p: "TIXO XE TRANSPARENT", v: "4 LITRI" },
    "TENAX DOMO ALB 10 A 1L +B 1L":         { p: "DOMO 10 EPOXY SOLID", v: "A (1 L) + B (1 L)" },
    "TENAX DOMO 10 ALB A 4L +B 4L":         { p: "DOMO 10 EPOXY SOLID", v: "A (4 L) + B (4 L)" },
    "TENAX ELIOX TRANSPARENT - A 1,5KG + B 0,75KG": { p: "ELIOX EPOXY SOLID EXTRA CLEAR", v: "DEFAULT" },
    "KIT COLLA GLAXS TRANSPARENT – A 1KG + B 0,45KG": { p: "KIT COLLA GLAXS TRANSPARENT", v: "DEFAULT" },
    "TENAX FAST GLAXS CARTUSE ALB 2 X 215 ML":         { p: "FAST GLAXS GLUE CARTUȘ", v: "DEFAULT" },
    "TENAX FAST GLAXS CARTUSE NEGRU 2 X 215 ML":        { p: "FAST GLAXS GLUE CARTUȘ", v: "DEFAULT" },
    "TENAX FAST GLAXS CARTUSE TRANSPARENT 2 X 215 ML":  { p: "FAST GLAXS GLUE CARTUȘ", v: "DEFAULT" },
    "TENAX GLAXS EASY TRANSPARENT A+B 300 GR": { p: "GLAXS EASY", v: "DEFAULT" },
    "TENAX FIXTOP A+B BEJ EPOXIDIC 1 L":      { p: "FIXTOP EPOXY SOLID", v: "DEFAULT" },
    "TENAX RIVO BEJ A+B EXPOXIDIC 1 L":       { p: "RIVO EPOXY SOLID", v: "DEFAULT" },
    "TENAX STRONGEDGE 45 TRANSPARENT EPOXIDIC –  A 1KG + B 0,5 KG": { p: "STRONGEDGE 45 EPOXY SOLID TRANSPARENT", v: "DEFAULT" },
    "TENAX GRAVITY TRANSPARENT 1 L": { p: "GRAVITY SOLID EXTRA CLEAR", v: "DEFAULT" },
    "TENAX MASTIC THASSOS": { p: "MASTIC THASSOS", v: "DEFAULT" },
    "TENAX RESIN T8":       { p: "TITANIUM SOLID TRANSPARENT", v: "DEFAULT" },
    "APLICATOR FAST GLAXS": { p: "APLICATOR FAST GLAXS", v: "DEFAULT" },
    "SET PIGMENTI TENAX 6 CULORI": { p: "SET PIGMENȚI", v: "DEFAULT" },
    "ÎNTĂRITOR MIC":   { p: "ÎNTĂRITOR MASTIC", v: "MIC" },
    "ÎNTĂRITOR MEDIU": { p: "ÎNTĂRITOR MASTIC", v: "MEDIU" },
    "ÎNTĂRITOR MARE":  { p: "ÎNTĂRITOR MASTIC", v: "MARE" },
    // XLS are "ÎNT?RITOR" (encoding issue) → same keys cu diacritice corecte
    "ÎNT?RITOR MIC":   { p: "ÎNTĂRITOR MASTIC", v: "MIC" },
    "ÎNT?RITOR MEDIU": { p: "ÎNTĂRITOR MASTIC", v: "MEDIU" },
    "ÎNT?RITOR MARE":  { p: "ÎNTĂRITOR MASTIC", v: "MARE" },
  }

  {
    const ws = wb.Sheets["Mastic TENAX"]
    if (ws) {
      const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 }) as any[][]
      for (let r = 1; r < rows.length; r++) {
        const row = rows[r]
        if (!row || !row[0]) continue
        const den = String(row[0]).trim()
        const price = parseNum(row[2])
        const weightKg = parseNum(row[3])
        if (!price) continue

        const key = den.toUpperCase().replace(/\s+/g, " ").trim()
        const mapped = TENAX_MAP[key]
        if (mapped) {
          entries.push({ productTitle: mapped.p, variantTitle: mapped.v, price, weightKg, source: `Mastic TENAX R${r}` })
        } else {
          // Try normalizing
          const keyNorm = norm(den)
          const found = Object.entries(TENAX_MAP).find(([k]) => norm(k) === keyNorm)
          if (found) {
            entries.push({ productTitle: found[1].p, variantTitle: found[1].v, price, weightKg, source: `Mastic TENAX R${r}` })
          }
        }
      }
    }
  }

  // ── Tratamente TENAX ──────────────────────────────────────────────────────
  const TRATAMENTE_MAP: Record<string, { p: string; v: string }> = {
    "TENAX AGER 1 L":     { p: "AGER", v: "DEFAULT" },
    "TENAX HYDREX":       { p: "HYDREX", v: "DEFAULT" },
    "TENAX PROSEAL":      { p: "PROSEAL", v: "DEFAULT" },
    "TENAX SKUDO":        { p: "SKUDO", v: "DEFAULT" },
    "TENAX TONER BLACK":  { p: "TONER BLACK", v: "DEFAULT" },
  }

  {
    const ws = wb.Sheets["Tratamente TENAX"]
    if (ws) {
      const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 }) as any[][]
      for (let r = 1; r < rows.length; r++) {
        const row = rows[r]
        if (!row || !row[0]) continue
        const den = String(row[0]).trim()
        const price = parseNum(row[2])
        const weightKg = parseNum(row[3])
        if (!price) continue
        const key = den.toUpperCase().replace(/\s+/g, " ").trim()
        const mapped = TRATAMENTE_MAP[key]
        if (mapped) {
          entries.push({ productTitle: mapped.p, variantTitle: mapped.v, price, weightKg, source: `Tratamente R${r}` })
        }
      }
    }
  }

  // ── Diverse ───────────────────────────────────────────────────────────────
  const DIVERSE_MAP: Record<string, { p: string; v: string }> = {
    "PASLA 125":          { p: "PÂSLĂ", v: "PÂSLĂ / 125" },
    "PASLA 180":          { p: "PÂSLĂ", v: "PÂSLĂ / 180" },
    "PASLA PERIE VELCRO 125": { p: "PÂSLĂ", v: "PÂSLĂ PERIE VELCRO / 125" },
    "ACID OXALIC":        { p: "ACID OXALIC", v: "DEFAULT" },
    // ELECTROCORINDON: produs separat, nu exista in DB — skip
    "POTEN MARMURA":      { p: "POTEN", v: "MARMURĂ" },
    "POTEN GRANIT":       { p: "POTEN", v: "GRANIT" },
    "MATERIAL DEZANCRASANT": { p: "MATERIAL DEZANCRASANT", v: "DEFAULT" },
    "BATON MARMURA":      { p: "BATON", v: "MARMURĂ" },
    "BATON GRANIT":       { p: "BATON", v: "GRANIT" },
    "CREION":             { p: "CREION", v: "DEFAULT" },
    "LANA DE OTEL (ROLA 5 KG) GR. 0": { p: "LÂNĂ DE OȚEL", v: "0" },
    "LANA DE OTEL (ROLA 5 KG) GR. 1": { p: "LÂNĂ DE OȚEL", v: "1" },
    "LANA DE OTEL (ROLA 5 KG) GR. 2": { p: "LÂNĂ DE OȚEL", v: "2" },
    "LANA DE OTEL (ROLA 5 KG) GR. 3": { p: "LÂNĂ DE OȚEL", v: "3" },
    "LANA DE O?EL (ROLA 5 KG) GR. 0": { p: "LÂNĂ DE OȚEL", v: "0" },
    "LANA DE O?EL (ROLA 5 KG) GR. 1": { p: "LÂNĂ DE OȚEL", v: "1" },
    "LANA DE O?EL (ROLA 5 KG) GR. 2": { p: "LÂNĂ DE OȚEL", v: "2" },
    "LANA DE O?EL (ROLA 5 KG) GR. 3": { p: "LÂNĂ DE OȚEL", v: "3" },
    "SUPORT FRANKFURT":   { p: "SUPORT FRANKFURT", v: "DEFAULT" },
    // SUPORT BASETTE și SUPORT VELCRO: nu exista ca produse separate in DB — skip
  }

  {
    const ws = wb.Sheets["Diverse"]
    if (ws) {
      const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 }) as any[][]
      for (let r = 1; r < rows.length; r++) {
        const row = rows[r]
        if (!row || !row[0]) continue
        const den = String(row[0]).trim()
        const price = parseNum(row[2])
        const weightKg = parseNum(row[3])
        if (!price) continue
        const key = den.toUpperCase().replace(/\s+/g, " ").trim()
        const mapped = DIVERSE_MAP[key]
        if (mapped) {
          entries.push({ productTitle: mapped.p, variantTitle: mapped.v, price, weightKg, source: `Diverse R${r}` })
        }
      }
    }
  }

  return entries
}

function parseSait(): Entry[] {
  const wb = XLSX.readFile(path.join(XLS_DIR, "Preturi SAIT.xls"))
  const entries: Entry[] = []
  const ws = wb.Sheets["Sheet1"]
  if (!ws) return entries

  const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 }) as any[][]
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

    const src = `SAIT R${r}`

    // VEL 125/115/180 → DISCHETE DE ȘLEFUIT CU CARBURĂ
    // XLS col2 = pret per BUCATA. DB stocheaza pretul per pachet.
    // Multiplica: CUTIE (50 BUC.) = pret × 50, BAX (400 BUC.) = pret × 400
    // NU exista varianta BUC. singulara in DB — skip
    if (curProduct.startsWith("VEL 125") || curProduct.startsWith("VEL 115") || curProduct.startsWith("VEL 180")) {
      const size = curProduct.startsWith("VEL 125") ? "125"
                 : curProduct.startsWith("VEL 115") ? "115"
                 : "180"

      const grMatch = curProduct.match(/GR\.\s*(\d+)/)
      const gr = grMatch ? grMatch[1] : null
      if (!gr) continue

      let um: string | null = null
      let finalPrice = 0
      if (col1.startsWith("BUC.")) {
        um = "BUC."
        finalPrice = price
      } else if (col1.startsWith("CUTIE 50")) {
        um = "CUTIE (50 BUC.)"
        finalPrice = price * 50
      } else if (col1.startsWith("BAX 400")) {
        um = "BAX (400 BUC.)"
        finalPrice = price * 400
      }
      if (!um) continue

      const variantTitle = `VEL / ${size} / ${gr} / ${um}`
      entries.push({ productTitle: "DISCHETE DE ȘLEFUIT CU CARBURĂ", variantTitle, price: finalPrice, weightKg, source: src })
    }

    // SAITDISC 125/180 → DISCHETE DE ȘLEFUIT CU CARBURĂ
    // XLS col2 = pret per BUCATA → multiplica per pachet
    else if (curProduct.startsWith("SAITDISC 125") || curProduct.startsWith("SAITDISC 180")) {
      const size = curProduct.startsWith("SAITDISC 125") ? "125" : "180"
      const grMatch = curProduct.match(/GR\.\s*(\d+)/)
      const gr = grMatch ? grMatch[1] : null
      if (!gr) continue

      let um: string | null = null
      let finalPrice = 0
      if (col1.startsWith("BUC.")) {
        um = "BUC."
        finalPrice = price
      } else if (col1.startsWith("CUTIE 25")) {
        um = "CUTIE (25 BUC.)"
        finalPrice = price * 25
      } else if (col1.startsWith("BAX 100")) {
        um = "BAX (100 BUC.)"
        finalPrice = price * 100
      }
      if (!um) continue

      const variantTitle = `SAITDISC / ${size} / ${gr} / ${um}`
      entries.push({ productTitle: "DISCHETE DE ȘLEFUIT CU CARBURĂ", variantTitle, price: finalPrice, weightKg, source: src })
    }

    // SAITRON 125/180 → DISCURI DE ȘLEFUIT CU CARBURĂ
    // DB format: "SAITRON / {size} / {gr} / BUCATĂ (1 BUC.)" | "SAITRON / {size} / {gr} / CUTIE (10 BUC.)"
    else if (curProduct.startsWith("SAITRON 125") || curProduct.startsWith("SAITRON 180")) {
      const size = curProduct.startsWith("SAITRON 125") ? "125" : "180"
      const grMatch = curProduct.match(/GR\.\s*(\d+)/)
      const gr = grMatch ? grMatch[1] : null
      if (!gr) continue

      let cant: string | null = null
      if (col1 === "BUC.") cant = "BUCATĂ (1 BUC.)"
      else if (col1.startsWith("CUTIE 10")) cant = "CUTIE (10 BUC.)"
      if (!cant) continue

      const variantTitle = `SAITRON / ${size} / ${gr} / ${cant}`
      entries.push({ productTitle: "DISCURI DE ȘLEFUIT CU CARBURĂ", variantTitle, price, weightKg, source: src })
    }

    // SAITRIS 180 → DISCURI DE ȘLEFUIT CU CARBURĂ
    // DB format: "SAITRIS / 180 / {gr} / BUCATĂ (1 BUC.)"
    else if (curProduct.startsWith("SAITRIS 180")) {
      const grMatch = curProduct.match(/GR\.\s*(\d+)/)
      const gr = grMatch ? grMatch[1] : null
      if (!gr) continue
      if (col1 !== "BUC.") continue
      const variantTitle = `SAITRIS / 180 / ${gr} / BUCATĂ (1 BUC.)`
      entries.push({ productTitle: "DISCURI DE ȘLEFUIT CU CARBURĂ", variantTitle, price, weightKg, source: src })
    }

    // EK WIENNER → DISCURI DE ȘLEFUIT CU CARBURĂ
    // DB format: "EK WIENNER / {size} / STANDARD / BUCATĂ (1 BUC.)"
    else if (curProduct.startsWith("EK WIENNER")) {
      const sizeMatch = curProduct.match(/EK WIENNER (\d+)/)
      const size = sizeMatch ? sizeMatch[1] : null
      if (!size) continue
      if (col1 !== "buc." && col1.toUpperCase() !== "BUC.") continue
      const variantTitle = `EK WIENNER / ${size} / STANDARD / BUCATĂ (1 BUC.)`
      entries.push({ productTitle: "DISCURI DE ȘLEFUIT CU CARBURĂ", variantTitle, price, weightKg, source: src })
    }

    // SAITPOL 430 → SAITPOL 430, ALB/NEGRU/ROȘU/VERDE
    else if (curProduct.startsWith("SAITPOL 430")) {
      const colorMatch = curProduct.match(/SAITPOL 430 (\w+)/)
      const color = colorMatch ? colorMatch[1] : null
      if (!color) continue
      // Map color: ROSU→ROȘU
      const colorDB = color === "ROSU" ? "ROȘU" : color
      entries.push({ productTitle: "SAITPOL 430, ALB/NEGRU/ROȘU/VERDE", variantTitle: colorDB, price, weightKg, source: src })
    }

    // SUPORT BZ 180 → SAITPAD SUPORT BZ 180
    else if (curProduct === "SUPORT BZ 180") {
      entries.push({ productTitle: "SAITPAD SUPORT BZ 180", variantTitle: "DEFAULT", price, weightKg, source: src })
    }

    // SUPORT PAD DQ 125 → SAITPAD-DQ
    else if (curProduct === "SUPORT PAD DQ 125") {
      entries.push({ productTitle: "SAITPAD-DQ", variantTitle: "DEFAULT", price, weightKg, source: src })
    }

    // SUPORT VELCROPAD 115/125/180 → produs nou
    else if (curProduct.startsWith("SUPORT VELCROPAD")) {
      const sizeMatch = curProduct.match(/SUPORT VELCROPAD (\d+)/)
      const size = sizeMatch ? sizeMatch[1] : null
      if (!size) continue
      entries.push({ productTitle: "DISCURI DE ȘLEFUIT CU CARBURĂ", variantTitle: `VELCROPAD / ${size} / STANDARD / BUCATĂ (1 BUC.)`, price, weightKg, source: src })
    }
  }

  return entries
}

function parseWoosuk(): Entry[] {
  const wb = XLSX.readFile(path.join(XLS_DIR, "Preturi Woosuk SITE.xls"))
  const entries: Entry[] = []
  const ws = wb.Sheets["Sheet1"]
  if (!ws) return entries

  const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 }) as any[][]
  let curProduct = ""

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    if (!row) continue

    const col0 = String(row[0] ?? "").trim().toUpperCase()
    const col1 = String(row[1] ?? "").trim().toUpperCase()
    const price = parseNum(row[2])
    const weightKg = parseNum(row[3])

    if (col0) curProduct = col0
    if (!curProduct || !price) continue

    const src = `Woosuk R${r}`

    // DISC MARMURA/GRANIT W → DISCURI DE TĂIERE DIAMANTATE
    // DB format: "DISC {stone} / {model} / {size} / {CU FLANȘĂ|FĂRĂ FLANȘĂ}"
    if (curProduct.startsWith("DISC MARMURA W") || curProduct.startsWith("DISC GRANIT W")
        || curProduct.startsWith("DISC ANDEZIT W") || curProduct.startsWith("DISC GRANIT 125 TURBO")) {
      const DISC_MAP: Record<string, { model: string; flanso: string }> = {
        "COBRA":            { model: "VANITY",            flanso: "CU FLANȘĂ" },
        "ELD FF":           { model: "ELECTROPLATED",     flanso: "FĂRĂ FLANȘĂ" },
        "ELD CF":           { model: "ELECTROPLATED",     flanso: "CU FLANȘĂ" },
        "CURB":             { model: "CURB",              flanso: "CU FLANȘĂ" },
        "TURBO FF":         { model: "TURBO",             flanso: "FĂRĂ FLANȘĂ" },
        "TURBO CF":         { model: "TURBO",             flanso: "CU FLANȘĂ" },
        "TURBO EXTRA CLASS":{ model: "TURBO EXTRA CLASS", flanso: "CU FLANȘĂ" },
        "TURBO CURB":       { model: "TURBO CURB",        flanso: "CU FLANȘĂ" },
      }
      // "DISC MARMURA W 115 COBRA" or "DISC GRANIT 125 TURBO EXTRA CLASS"
      const m = curProduct.match(/DISC (MARMURA|GRANIT|ANDEZIT)(?:\s+W)?\s+(\d+)\s+(.+)/)
      if (m) {
        const stone = m[1] === "MARMURA" ? "MARMURĂ" : m[1] === "ANDEZIT" ? "ANDEZIT" : "GRANIT"
        const size = m[2]
        const modelKey = m[3].trim()
        const mapped = DISC_MAP[modelKey]
        if (mapped) {
          const variantTitle = `DISC ${stone} / ${mapped.model} / ${size} / ${mapped.flanso}`
          entries.push({ productTitle: "DISCURI DE TĂIERE DIAMANTATE", variantTitle, price, weightKg, source: src })
        }
      }
    }

    // DISC W CONCAV → DISC DE ȘLEFUIRE CONCAV
    else if (curProduct.startsWith("DISC W CONCAV")) {
      const m = curProduct.match(/DISC W CONCAV (\d+)/)
      if (m) entries.push({ productTitle: "DISC DE ȘLEFUIRE CONCAV", variantTitle: m[1], price, weightKg, source: src })
    }

    // K100/K80/K125/K150 → DISCHETE DE ȘLEFUIT DIAMANTATE
    // XLS poate avea "K 100" (cu spatiu) sau "K100" (fara)
    else if (curProduct.match(/^K\s*(100|80|125|150)/)) {
      // Normalizeaza "K 100 MARM 50" → "K100 MARM 50"
      const normalized = curProduct.replace(/^K\s+/, "K")
      const m = normalized.match(/^(K\d+)\s+(.+?)\s+(\d+(?:BUFF|BLACK|WHITE)?)/)
        || normalized.match(/^(K\d+)\s+(.+?)\s+(BUFF\s+\w+)/)
      if (m) {
        const type = m[1]
        const variantRaw = m[2].trim()
        const grit = m[3].trim()

        // Mapare variante XLS → DB
        const VARIANT_MAP: Record<string, (type: string) => string | null> = {
          "MARM":    () => "MARMURĂ DRY",
          "PAV":     () => "PODELE",
          "EDGE":    (t) => t === "K125" ? "PREMIUM EDGE" : "PRESTIGE EDGE",
          "ENG":     () => null,  // nou, nu exista in DB — skip
        }
        const mapFn = VARIANT_MAP[variantRaw]
        const variantDB = mapFn ? mapFn(type) : variantRaw

        if (variantDB === null) {
          // ENG sau alte variante noi — skip silentios
        } else {
          const variantTitle = `${type} / ${variantDB} / ${grit}`
          entries.push({ productTitle: "DISCHETE DE ȘLEFUIT DIAMANTATE", variantTitle, price, weightKg, source: src })
        }
      }
    }

    // PAD POLIMASTER → PAD POLIMASTER + HEX
    // DB format: "PAD POLIMASTER / 17" / STEP N" | "PAD POLIMASTER HEX / 13" / STEP N"
    // Size 13" = HEX variant
    else if (curProduct.startsWith("PAD 17 POLIMASTER") || curProduct.startsWith("PAD 13 POLIMASTER") || curProduct.startsWith("PAD 125 POLIMASTER")) {
      const mPad = curProduct.match(/PAD (\d+) POLIMASTER\s+(\d)$/)
      if (mPad) {
        const size = mPad[1]
        const step = mPad[2]
        const isHex = size === "13"
        const prefix = isHex ? "PAD POLIMASTER HEX" : "PAD POLIMASTER"
        const variantTitle = `${prefix} / ${size}" / STEP ${step}`
        entries.push({ productTitle: "PAD POLIMASTER + HEX", variantTitle, price, weightKg, source: src })
      }
    }

    // BURETE DIAMANTAT → BURETE DIAMANTAT
    else if (curProduct.startsWith("BURETE W DIAMANTAT")) {
      const m = curProduct.match(/BURETE W DIAMANTAT (\d+)/)
      if (m) entries.push({ productTitle: "BURETE DIAMANTAT", variantTitle: m[1], price, weightKg, source: src })
    }

    // VEL W 125 → separate produs?
    else if (curProduct.startsWith("VEL W 125")) {
      const m = curProduct.match(/VEL W 125 GR\.\s*(\d+)/)
      if (m) entries.push({ productTitle: "DISCHETE DE ȘLEFUIT DIAMANTATE", variantTitle: `VEL W 125 / ${m[1]}`, price, weightKg, source: src })
    }

    // PAD CAUCIUC
    else if (curProduct === "PAD CAUCIUC") {
      entries.push({ productTitle: "PAD CAUCIUC", variantTitle: "DEFAULT", price, weightKg, source: src })
    }

    // CAROTE
    // DB format: "20", "25" etc. (fara prefix D)
    else if (curProduct.startsWith("CAROTA W D")) {
      const m = curProduct.match(/CAROTA W D(\d+)/)
      if (m) entries.push({ productTitle: "CAROTE DIAMANTATE", variantTitle: m[1], price, weightKg, source: src })
    }

    // BURGHIU
    // DB format: "6 mm", "8 mm" etc.
    else if (curProduct.startsWith("BURGHIU W")) {
      const m = curProduct.match(/BURGHIU W (\d+)/)
      if (m) entries.push({ productTitle: "BURGHIU", variantTitle: `${m[1]} mm`, price, weightKg, source: src })
    }

    // FREZE
    // DB format: "SEMIBASTON MARMURĂ / STANDARD / R10", "TALER / 100 / STANDARD", "BASTON MARMURĂ / STANDARD / V20"
    else if (curProduct.startsWith("FREZA W")) {
      const suffix = curProduct.replace(/^FREZA W\s+/, "").trim()
      const FREZE_MAP: Record<string, string> = {
        "BRAZED 100 DUR":        "TALER / 100 / STANDARD",
        "BRAZED 125 DUR":        "TALER / 125 / STANDARD",
        "CARACATITA 100 DUR":    "TURBO PIATRĂ (CARACATIȚĂ) / 100 / STANDARD",
        "CARACATITA 100 MEDIU":  "TURBO BETON/MOZAIC (CARACATIȚĂ) / 100 / STANDARD",
        "CARACATITA 125 DUR":    "TURBO PIATRĂ (CARACATIȚĂ) / 125 / STANDARD",
        "CARACATITA 125 MEDIU":  "TURBO BETON/MOZAIC (CARACATIȚĂ) / 125 / STANDARD",
        "CANT R10 MARMURA":      "SEMIBASTON MARMURĂ / STANDARD / R10",
        "CANT R15 MARMURA":      "SEMIBASTON MARMURĂ / STANDARD / R15",
        "CANT R20 MARMURA":      "SEMIBASTON MARMURĂ / STANDARD / R20",
        "CANT R10 GRANIT":       "SEMIBASTON GRANIT / STANDARD / R10",
        "CANT R15 GRANIT":       "SEMIBASTON GRANIT / STANDARD / R15",
        "CANT R20 GRANIT":       "SEMIBASTON GRANIT / STANDARD / R20",
        "V20":                   "BASTON MARMURĂ / STANDARD / V20",
        "V30":                   "BASTON MARMURĂ / STANDARD / V30",
        // BRAZED MEDIU = aceeasi varianta DB ca DUR → deduplicata intentionat (update idempotent)
        "BRAZED 100 MEDIU":      "TALER / 100 / STANDARD",
        "BRAZED 125 MEDIU":      "TALER / 125 / STANDARD",
        // CB si OG nu au corespondent clar in DB → skip
      }
      const vt = FREZE_MAP[suffix]
      if (vt) entries.push({ productTitle: "FREZE DIAMANTATE", variantTitle: vt, price, weightKg, source: src })
    }

    // SUPORT ANELLI
    else if (curProduct.startsWith("SUPORT ANELLI")) {
      const m = curProduct.match(/SUPORT ANELLI (\d+) M14/)
      if (m) entries.push({ productTitle: "ABRAZIVI ANELLI", variantTitle: `SUPORT / ${m[1]}`, price, weightKg, source: src })
    }
  }

  return entries
}

// ─── Citire toate variantele din DB local ─────────────────────────────────────

async function fetchAllVariants(client: Client): Promise<DBVariant[]> {
  const res = await client.query(`
    SELECT
      p.title  AS product_title,
      v.id     AS variant_id,
      v.title  AS variant_title,
      v.weight AS current_weight,
      pr.id    AS price_id,
      pr.amount AS current_price
    FROM product_variant v
    JOIN product p ON v.product_id = p.id
    LEFT JOIN product_variant_price_set pvps ON pvps.variant_id = v.id
    LEFT JOIN price pr ON pr.price_set_id = pvps.price_set_id
      AND pr.currency_code = 'ron' AND pr.deleted_at IS NULL
    WHERE v.deleted_at IS NULL AND p.deleted_at IS NULL
    ORDER BY p.title, v.title
  `)
  return res.rows.map(r => ({
    productId: "",
    productTitle: r.product_title,
    variantId: r.variant_id,
    variantTitle: r.variant_title,
    priceId: r.price_id,
    currentPrice: r.current_price ? Math.round(r.current_price / 100) : null,
    currentWeight: r.current_weight,
  }))
}

// ─── Matching ─────────────────────────────────────────────────────────────────

function findVariant(
  entry: Entry,
  variants: DBVariant[]
): DBVariant | null {
  // DEFAULT variantTitle = orice singura varianta din produsul respectiv
  if (entry.variantTitle === "DEFAULT") {
    const byProduct = variants.filter(v => norm(v.productTitle) === norm(entry.productTitle))
    if (byProduct.length === 1) return byProduct[0]
    // Cauta "Default Title"
    const def = byProduct.find(v => v.variantTitle.toLowerCase().includes("default"))
    if (def) return def
    return byProduct[0] ?? null
  }

  // Exact match (case-insensitive)
  const exact = variants.find(v =>
    norm(v.productTitle) === norm(entry.productTitle) &&
    norm(v.variantTitle) === norm(entry.variantTitle)
  )
  if (exact) return exact

  return null
}

// ─── Generare SQL ─────────────────────────────────────────────────────────────

function genSQL(entry: Entry, variant: DBVariant): string[] {
  const sqls: string[] = []
  const bani = Math.round(entry.price * 100)
  const grame = Math.round(entry.weightKg * 1000)

  // Update weight
  if (grame > 0) {
    sqls.push(`UPDATE product_variant SET weight=${grame}, updated_at=NOW() WHERE id='${variant.variantId}';`)
  }

  // Update price (daca difera sau e null)
  if (variant.priceId && bani > 0 && variant.currentPrice !== entry.price) {
    sqls.push(`UPDATE price SET amount=${bani}, raw_amount=jsonb_build_object('value','${bani}','precision',20), updated_at=NOW() WHERE id='${variant.priceId}';`)
  }

  return sqls
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n=== update-all-prices-weights.ts | ${DRY_RUN ? "DRY RUN" : "APPLY → PRODUCTIE"} ===\n`)

  // 1. Citeste toate XLS-urile
  console.log("Parsez XLS-urile...")
  const allEntries: Entry[] = [
    ...parseDiscuri(),
    ...parseSolutiiDelta(),
    ...parseAbrazivi(),
    ...parseTenaxDiverse(),
    ...parseSait(),
    ...parseWoosuk(),
  ]
  console.log(`Total intrari XLS: ${allEntries.length}`)

  // 2. Conectare la DB local
  console.log("\nConectare DB local...")
  const client = new Client({ connectionString: LOCAL_DB })
  await client.connect()
  const variants = await fetchAllVariants(client)
  await client.end()
  console.log(`Variante in DB: ${variants.length}`)

  // 3. Matching si diff
  const matched: { entry: Entry; variant: DBVariant; sqls: string[] }[] = []
  const unmatched: Entry[] = []
  let priceChanges = 0
  let weightChanges = 0

  for (const entry of allEntries) {
    const variant = findVariant(entry, variants)
    if (!variant) {
      unmatched.push(entry)
      continue
    }

    const sqls = genSQL(entry, variant)
    if (sqls.some(s => s.includes("price"))) priceChanges++
    if (sqls.some(s => s.includes("weight"))) weightChanges++
    matched.push({ entry, variant, sqls })
  }

  // 4. Raport
  console.log(`\n── STATISTICI ──`)
  console.log(`  Potrivite:      ${matched.length}`)
  console.log(`  Nepotrivite:    ${unmatched.length}`)
  console.log(`  Preturi schimb: ${priceChanges}`)
  console.log(`  Greutati set:   ${weightChanges}`)

  // Diff preturi
  const priceChangedEntries = matched.filter(m => m.sqls.some(s => s.includes("price")))
  if (priceChangedEntries.length > 0) {
    console.log(`\n── PRETURI SCHIMBATE (${priceChangedEntries.length}) ──`)
    for (const { entry, variant } of priceChangedEntries) {
      const cur = variant.currentPrice ?? "?"
      console.log(`  ${variant.productTitle} / ${variant.variantTitle}`)
      console.log(`    ${cur} RON → ${entry.price} RON  (${entry.source})`)
    }
  }

  // Nepotrivite
  if (unmatched.length > 0) {
    console.log(`\n── NEPOTRIVITE (${unmatched.length}) ──`)
    for (const e of unmatched) {
      console.log(`  ${e.source}: "${e.productTitle}" / "${e.variantTitle}" — ${e.price} RON, ${e.weightKg} kg`)
    }
  }

  if (DRY_RUN) {
    console.log(`\nRuleaza cu --apply pentru a aplica in productie via Railway.`)
    return
  }

  // 5. Genereaza SQL si aplica via railway connect Postgres
  console.log(`\nGenerez SQL-ul si aplic via Railway...`)
  const allSqls: string[] = ["BEGIN;"]
  for (const { sqls } of matched) allSqls.push(...sqls)
  allSqls.push("SELECT 'weights set: ' || COUNT(*) FROM product_variant WHERE weight IS NOT NULL AND deleted_at IS NULL AND updated_at > NOW() - INTERVAL '5 seconds';")
  allSqls.push("COMMIT;")

  const sqlText = allSqls.join("\n")

  // Pipe SQL via railway connect Postgres
  const result = spawnSync(
    "railway", ["connect", "Postgres"],
    {
      input: sqlText,
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

  // Parse rezultate
  const updates = (out.match(/UPDATE (\d+)/g) || [])
    .map(s => parseInt(s.replace("UPDATE ", "")))
    .reduce((a, b) => a + b, 0)
  console.log(`\nRanduri actualizate: ${updates}`)

  const weightLine = out.match(/weights set: (\d+)/)
  if (weightLine) console.log(`Variante cu greutate acum: ${weightLine[1]}`)

  console.log("\nGata!")
}

main().catch(e => { console.error("\nEROARE:", e.message); process.exit(1) })
