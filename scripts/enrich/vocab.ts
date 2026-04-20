// Canonical brand tokens (lowercase)
export const BRANDS = [
  "tenax", "sait", "woosuk", "diatex", "delta-research", "vbt", "fox-ironstone"
] as const

// Band type tokens
export const BAND_TYPES = [
  "turbo-curb",       // more specific first
  "turbo-extra-class",
  "turbo",
  "continua",
  "segmentata",
  "vanity",
  "electroplated",
  "curb",
] as const

// Material tokens
export const MATERIALS = [
  "beton-armat",      // more specific first
  "piatra-naturala",
  "granit",
  "marmura",
  "beton",
  "ceramica",
  "travertin",
  "cuart",
  "andezit",
  "universal",
] as const

// Thread/mounting tokens
export const THREADS = ["m14", "22-23mm", "5-8-inch"] as const

// Availability tokens
export const AVAILABILITY = ["in-stoc", "la-comanda", "promo"] as const

// Display labels in Romanian
export const LABEL: Record<string, string> = {
  "brand:tenax": "Tenax",
  "brand:sait": "Sait",
  "brand:woosuk": "Woosuk",
  "brand:diatex": "Diatex",
  "brand:delta-research": "Delta Research",
  "brand:vbt": "VBT",
  "brand:fox-ironstone": "Fox Ironstone",
  "band-type:turbo": "Turbo",
  "band-type:turbo-curb": "Turbo Curb",
  "band-type:turbo-extra-class": "Turbo Extra Class",
  "band-type:continua": "Continuă",
  "band-type:segmentata": "Segmentată",
  "band-type:vanity": "Vanity",
  "band-type:electroplated": "Electroplacată",
  "band-type:curb": "Curb",
  "material:granit": "Granit",
  "material:marmura": "Marmură",
  "material:beton": "Beton",
  "material:beton-armat": "Beton armat",
  "material:ceramica": "Ceramică",
  "material:travertin": "Travertin",
  "material:cuart": "Cuarț",
  "material:andezit": "Andezit",
  "material:piatra-naturala": "Piatră naturală",
  "material:universal": "Universal",
  "thread:m14": "M14",
  "thread:22-23mm": "22.23 mm",
  "thread:5-8-inch": "5/8\"",
  "availability:in-stoc": "În stoc",
  "availability:la-comanda": "Livrare la comandă",
  "availability:promo": "Promoție",
}

// Normalize text for diacritic-insensitive matching
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[șş]/g, "s")
    .replace(/[țţ]/g, "t")
    .replace(/[ăâ]/g, "a")
    .replace(/[î]/g, "i")
}

// Regex patterns for each vocab category (applied to normalized text)
export const BRAND_MATCHERS: Array<{ token: string; pattern: RegExp }> = [
  { token: "delta-research", pattern: /\bdelta[\s-]?research\b/ },
  { token: "fox-ironstone", pattern: /\bfox[\s-]?ironstone\b/ },
  { token: "tenax", pattern: /\btenax\b/ },
  { token: "sait", pattern: /\bsait(?:disc|ron|ris|abr)?\b/ },
  { token: "woosuk", pattern: /\bwoosuk\b/ },
  { token: "diatex", pattern: /\bdiatex\b/ },
  { token: "vbt", pattern: /\bvbt\b/ },
]

export const BAND_TYPE_MATCHERS: Array<{ token: string; pattern: RegExp }> = [
  { token: "turbo-extra-class", pattern: /\bturbo[\s-]?extra[\s-]?class\b/ },
  { token: "turbo-curb", pattern: /\bturbo[\s-]?curb\b/ },
  { token: "turbo", pattern: /\bturbo\b/ },
  { token: "continua", pattern: /\bcontinuu?\b|\bcontinua\b/ },
  { token: "segmentata", pattern: /\bsegmentat[ae]?\b/ },
  { token: "vanity", pattern: /\bvanity\b/ },
  { token: "electroplated", pattern: /\belectroplacat[ae]?\b|\belectroplated\b/ },
  { token: "curb", pattern: /\bcurb\b/ },
]

export const MATERIAL_MATCHERS: Array<{ token: string; pattern: RegExp }> = [
  { token: "beton-armat", pattern: /\bbeton[\s-]?armat\b/ },
  { token: "piatra-naturala", pattern: /\bpiatr[ae][\s-]?natural[ae]\b|\bstone\b/ },
  { token: "granit", pattern: /\bgranit[eo]?\b/ },
  { token: "marmura", pattern: /\bmarmur[ae]\b|\bmarmo\b/ },
  { token: "beton", pattern: /\bbeton\b/ },
  { token: "ceramica", pattern: /\bceramic[ae]?\b/ },
  { token: "travertin", pattern: /\btravertin[eo]?\b/ },
  { token: "cuart", pattern: /\bcuart[z]?\b|\bquartz\b/ },
  { token: "andezit", pattern: /\bandezit\b/ },
  { token: "universal", pattern: /\buniversal\b/ },
]

export const THREAD_MATCHERS: Array<{ token: string; pattern: RegExp }> = [
  { token: "m14", pattern: /\bm[\s]?14\b/ },
  { token: "22-23mm", pattern: /\b22[.,]23\b/ },
  { token: "5-8-inch", pattern: /\b5\/8["]?\b/ },
]

// Extract all diameters from a text (returns sorted unique mm values)
export function extractDiameters(text: string): number[] {
  const norm = normalize(text)
  const matches = new Set<number>()
  // Pattern: Ø followed by number, or number followed by mm with typical disc sizes
  const patterns = [
    /[øo]\s*(\d{2,4})/g,      // Ø115 (ø after lowercase, o from Ø via NFD on some systems)
    /(\d{2,4})\s*mm\b/g,
  ]
  for (const pat of patterns) {
    let m: RegExpExecArray | null
    while ((m = pat.exec(norm)) !== null) {
      const n = parseInt(m[1], 10)
      // Only realistic disc/pad diameters: 50-3000mm
      if (n >= 50 && n <= 3000) matches.add(n)
    }
  }
  return [...matches].sort((a, b) => a - b)
}

// Apply a list of matchers to normalized text, return matched tokens (first match per token)
export function matchAll<T extends string>(
  text: string,
  matchers: Array<{ token: T; pattern: RegExp }>
): T[] {
  const norm = normalize(text)
  const found: T[] = []
  for (const { token, pattern } of matchers) {
    if (found.includes(token)) continue
    if (pattern.test(norm)) found.push(token)
  }
  return found
}
