import * as fs from "fs"
import * as path from "path"
import type { ProductStats, EnrichmentReport } from "./types"

const STATS_FILE = path.resolve(__dirname, "../enrich-run.jsonl")

export function appendStats(stats: ProductStats): void {
  fs.appendFileSync(STATS_FILE, JSON.stringify(stats) + "\n", "utf8")
}

export function loadStats(): ProductStats[] {
  if (!fs.existsSync(STATS_FILE)) return []
  return fs
    .readFileSync(STATS_FILE, "utf8")
    .split("\n")
    .filter(Boolean)
    .map(line => {
      try {
        return JSON.parse(line) as ProductStats
      } catch {
        return null
      }
    })
    .filter((x): x is ProductStats => x !== null)
}

export function buildReport(
  stats: ProductStats[],
  runStartMs: number,
  totalProducts: number
): EnrichmentReport {
  const now = new Date().toISOString()
  const byState: Record<string, number> = {}
  const rejectedMap: Map<string, number> = new Map()
  const warnings: string[] = []

  for (const s of stats) {
    byState[s.state] = (byState[s.state] || 0) + 1
    for (const tok of s.rejected_tokens) {
      rejectedMap.set(tok, (rejectedMap.get(tok) || 0) + 1)
    }
    for (const w of s.warnings) {
      if (w.startsWith("CRITICAL:")) warnings.push(`${s.handle}: ${w}`)
    }
  }

  const topRejected = [...rejectedMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([token, count]) => ({ token, count }))

  return {
    run_ts: now,
    duration_ms: Date.now() - runStartMs,
    total_products: totalProducts,
    by_state: byState,
    images: {
      new_downloaded: stats.reduce((s, p) => s + p.images_added, 0),
      already_had: stats.reduce((s, p) => s + p.images_already_had, 0),
      derived_total: stats.reduce((s, p) => s + p.derived_variants_produced, 0),
      storage_added_bytes: 0, // filled in by orchestrator after disk check
    },
    tag_coverage: {}, // filled in by orchestrator from Medusa data
    metadata_coverage: {},
    top_rejected_tokens: topRejected,
    critical_warnings: warnings.slice(0, 20),
  }
}

export function printReport(report: EnrichmentReport): void {
  const { by_state, total_products, images, top_rejected_tokens, critical_warnings } = report
  const verified = by_state["VERIFIED"] || 0
  const failed = by_state["FAILED"] || 0
  const skipped = by_state["SKIPPED"] || 0

  console.log("\n=== ENRICHMENT RUN REPORT ===")
  console.log(`Total produse:           ${total_products}`)
  console.log(`  VERIFIED:              ${verified}`)
  console.log(`  FAILED:                ${failed}`)
  console.log(`  SKIPPED (deja done):   ${skipped}`)
  const other = total_products - verified - failed - skipped
  if (other > 0) console.log(`  ALTE STARI:            ${other}`)

  console.log(`\nImagini:`)
  console.log(`  URL-uri noi descarcate:  ${images.new_downloaded}`)
  console.log(`  Deja existente:          ${images.already_had}`)
  console.log(`  Variante derivate:       ${images.derived_total}`)
  if (images.storage_added_bytes > 0) {
    console.log(`  Storage adaugat:         ${(images.storage_added_bytes / 1024 / 1024).toFixed(1)} MB`)
  }

  if (Object.keys(report.tag_coverage).length > 0) {
    console.log(`\nTag coverage:`)
    for (const [prefix, { count, pct }] of Object.entries(report.tag_coverage)) {
      const bar = pct >= 50 ? "" : " <- filtru probabil ascuns"
      console.log(`  ${prefix.padEnd(16)} ${count}/${total_products} (${pct.toFixed(1)}%)${bar}`)
    }
  }

  if (top_rejected_tokens.length > 0) {
    console.log(`\nTop rejected tokens (pentru vocab review):`)
    for (const { token, count } of top_rejected_tokens) {
      console.log(`  ${token.padEnd(20)} ${count} produse`)
    }
  }

  if (critical_warnings.length > 0) {
    console.log(`\nWarnings critice (${critical_warnings.length}):`)
    for (const w of critical_warnings.slice(0, 5)) console.log(`  ${w}`)
  }

  const durationSec = (report.duration_ms / 1000).toFixed(0)
  console.log(`\nDurata totala: ${durationSec}s`)
  console.log("=============================\n")
}
