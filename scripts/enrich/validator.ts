import type { SubagentOutput, CleanDossier } from "./types"
import { BRANDS, BAND_TYPES, MATERIALS, THREADS, normalize } from "./vocab"

// Checks whether a quote appears (diacritic-insensitive substring) in any source text.
function evidenced(quote: string, sourcesText: string[]): boolean {
  if (!quote || quote.trim().length < 2) return false
  const normQuote = normalize(quote)
  return sourcesText.some((s) => normalize(s).includes(normQuote))
}

// Returns the evidence quote for a given key, or null if missing/empty.
function getQuote(
  evidence: SubagentOutput["evidence"],
  key: string
): string | null {
  const entry = evidence[key]
  if (!entry || !entry.quote || entry.quote.trim().length < 2) return null
  return entry.quote
}

// Validates a SubagentOutput and produces a CleanDossier.
// sourcesText: all raw source texts to check evidence against
// (title, description_html, option values, collection, scraped_html)
export function validateDossier(
  raw: SubagentOutput,
  sourcesText: string[]
): CleanDossier {
  const rejected: string[] = []

  // --- brand ---
  let cleanBrand: string | null = null
  if (raw.dossier.brand !== null && raw.dossier.brand !== undefined) {
    const val = raw.dossier.brand
    const key = `brand:${val}`
    if (!(BRANDS as readonly string[]).includes(val)) {
      rejected.push(`not_in_vocab:${val}`)
    } else {
      const quote = getQuote(raw.evidence, key)
      if (quote === null) {
        rejected.push(`no_evidence:${key}`)
      } else if (!evidenced(quote, sourcesText)) {
        rejected.push(`evidence_not_found:${key}`)
      } else {
        cleanBrand = val
      }
    }
  }

  // --- diameters_mm ---
  const cleanDiameters: number[] = []
  for (const d of raw.dossier.diameters_mm) {
    if (d < 50 || d > 3000) {
      rejected.push(`out_of_range:diameter:${d}`)
      continue
    }
    const ds = String(d)
    const found = sourcesText.some((s) => {
      const norm = normalize(s)
      return (
        norm.includes(ds + "mm") ||
        norm.includes(ds + " mm") ||
        norm.includes("\u00f8" + ds) ||    // ø (already lowercased by normalize)
        norm.includes("o" + ds) ||          // ø renders as 'o' after NFD strip
        norm.includes(ds)                   // bare number as fallback
      )
    })
    if (!found) {
      rejected.push(`evidence_not_found:diameter:${d}`)
    } else {
      cleanDiameters.push(d)
    }
  }

  // --- band_types ---
  const cleanBandTypes: string[] = []
  for (const val of raw.dossier.band_types) {
    const key = `band-type:${val}`
    if (!(BAND_TYPES as readonly string[]).includes(val)) {
      rejected.push(`not_in_vocab:${val}`)
      continue
    }
    const quote = getQuote(raw.evidence, key)
    if (quote === null) {
      rejected.push(`no_evidence:${key}`)
      continue
    }
    if (!evidenced(quote, sourcesText)) {
      rejected.push(`evidence_not_found:${key}`)
      continue
    }
    cleanBandTypes.push(val)
  }

  // --- materials ---
  const cleanMaterials: string[] = []
  for (const val of raw.dossier.materials) {
    const key = `material:${val}`
    if (!(MATERIALS as readonly string[]).includes(val)) {
      rejected.push(`not_in_vocab:${val}`)
      continue
    }
    const quote = getQuote(raw.evidence, key)
    if (quote === null) {
      rejected.push(`no_evidence:${key}`)
      continue
    }
    if (!evidenced(quote, sourcesText)) {
      rejected.push(`evidence_not_found:${key}`)
      continue
    }
    cleanMaterials.push(val)
  }

  // --- threads ---
  const cleanThreads: string[] = []
  for (const val of raw.dossier.threads) {
    const key = `thread:${val}`
    if (!(THREADS as readonly string[]).includes(val)) {
      rejected.push(`not_in_vocab:${val}`)
      continue
    }
    const quote = getQuote(raw.evidence, key)
    if (quote === null) {
      rejected.push(`no_evidence:${key}`)
      continue
    }
    if (!evidenced(quote, sourcesText)) {
      rejected.push(`evidence_not_found:${key}`)
      continue
    }
    cleanThreads.push(val)
  }

  // --- availability ---
  // No evidence check -- derived from inventory state, not text.
  const cleanAvailability = [...raw.dossier.availability]

  // --- specs / dimensiuni / identificare ---
  // No vocab check. Keep entries with non-empty, meaningful values.
  const SENTINEL = new Set(["null", "undefined", "n/a"])
  function sanitizeRecord(rec: Record<string, string>): Record<string, string> {
    const out: Record<string, string> = {}
    for (const [k, v] of Object.entries(rec)) {
      if (!v) continue
      const trimmed = v.trim()
      if (!trimmed) continue
      if (SENTINEL.has(trimmed.toLowerCase())) continue
      out[k] = trimmed
    }
    return out
  }

  const cleanSpecs = sanitizeRecord(raw.dossier.specs)
  const cleanDimensiuni = sanitizeRecord(raw.dossier.dimensiuni)
  const cleanIdentificare = sanitizeRecord(raw.dossier.identificare)

  // --- aplicatii ---
  const cleanAplicatii: string[] = []
  for (const val of raw.dossier.aplicatii) {
    const key = `aplicatie:${val}`
    const quote = getQuote(raw.evidence, key)
    if (quote === null) {
      // No evidence entry -- check val itself directly in sources.
      if (!evidenced(val, sourcesText)) {
        rejected.push(`no_evidence:${key}`)
        continue
      }
    } else if (!evidenced(quote, sourcesText)) {
      rejected.push(`evidence_not_found:${key}`)
      continue
    }
    cleanAplicatii.push(val)
  }

  // --- features ---
  const cleanFeatures: string[] = []
  for (const val of raw.dossier.features) {
    const key = `feature:${val}`
    const quote = getQuote(raw.evidence, key)
    if (quote === null) {
      // No evidence entry -- check val itself directly in sources.
      if (!evidenced(val, sourcesText)) {
        rejected.push(`no_evidence:${key}`)
        continue
      }
    } else if (!evidenced(quote, sourcesText)) {
      rejected.push(`evidence_not_found:${key}`)
      continue
    }
    cleanFeatures.push(val)
  }

  // --- extra_image_urls ---
  const URL_RE = /^https?:\/\/.+/i
  const cleanImageUrls: string[] = []
  for (const url of raw.dossier.extra_image_urls) {
    if (!URL_RE.test(url.trim())) {
      rejected.push(`invalid_url:${url}`)
    } else {
      cleanImageUrls.push(url.trim())
    }
  }

  return {
    brand: cleanBrand,
    diameters_mm: cleanDiameters,
    band_types: cleanBandTypes,
    materials: cleanMaterials,
    threads: cleanThreads,
    availability: cleanAvailability,
    specs: cleanSpecs,
    dimensiuni: cleanDimensiuni,
    identificare: cleanIdentificare,
    aplicatii: cleanAplicatii,
    features: cleanFeatures,
    extra_image_urls: cleanImageUrls,
    rejected_tokens: rejected,
    warnings: [...raw.warnings, ...rejected],
    sources_used: raw.sources_used,
  }
}
