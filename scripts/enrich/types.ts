// Wix CSV row (product fieldType only, not variant)
export interface WixProductRow {
  handleId: string
  fieldType: "Product"
  name: string
  description: string
  productImageUrl: string
  collection: string
  ribbon: string
  price: string
  brand: string
  // additionalInfo fields
  additionalInfoTitle1: string
  additionalInfoDescription1: string
  additionalInfoTitle2: string
  additionalInfoDescription2: string
  [key: string]: string
}

// Wix CSV variant row
export interface WixVariantRow {
  handleId: string
  fieldType: "Variant"
  productOptionName1: string
  productOptionType1: string
  productOptionDescription1: string
  productOptionName2: string
  productOptionType2: string
  productOptionDescription2: string
  productOptionName3: string
  productOptionType3: string
  productOptionDescription3: string
  productOptionName4: string
  productOptionType4: string
  productOptionDescription4: string
  productOptionName5: string
  productOptionType5: string
  productOptionDescription5: string
  productOptionName6: string
  productOptionType6: string
  productOptionDescription6: string
  [key: string]: string
}

// Scraped data from live ardmag.ro
export interface ScrapeResult {
  handle: string
  url: string
  status: "OK" | "FAIL" | "NOT_FOUND" | "SKIPPED"
  image_urls: string[]
  description_text: string
  cached: boolean
}

// Evidence for a single attribute value
export interface Evidence {
  source: "collection" | "title" | "description" | "option_name" | "option_value" | "live_html" | "additional_info"
  quote: string
}

// Extracted product dossier (from LLM subagent)
export interface Dossier {
  brand: string | null
  diameters_mm: number[]
  band_types: string[]
  materials: string[]
  threads: string[]
  availability: string[]
  specs: Record<string, string>
  dimensiuni: Record<string, string>
  identificare: Record<string, string>
  aplicatii: string[]
  features: string[]
  extra_image_urls: string[]
}

// Validated clean dossier (after validator.ts processing)
export interface CleanDossier extends Dossier {
  rejected_tokens: string[]
  warnings: string[]
  sources_used: string[]
}

// Input to the LLM subagent (what we send in the prompt)
export interface SubagentInput {
  handle: string
  medusa_id: string
  title: string
  collection: string
  description_html: string
  additional_info: Array<{ title: string; body: string }>
  variant_options: Array<{ name: string; values: string[] }>
  csv_image_urls: string[]
  live_scrape: ScrapeResult
  current_medusa: {
    tags: string[]
    metadata: Record<string, unknown>
    images: string[]
    variant_count: number
  }
}

// Output from the LLM subagent (what we parse from its response)
export interface SubagentOutput {
  handle: string
  dossier: Dossier
  sources_used: string[]
  warnings: string[]
  evidence: Record<string, Evidence>
}

// Per-product enrichment state
export type ProductState =
  | "PENDING"
  | "SCRAPING"
  | "EXTRACTING"
  | "VALIDATING"
  | "IMAGES_COLLECTING"
  | "IMAGES_DERIVING"
  | "WRITING"
  | "VERIFYING"
  | "VERIFIED"
  | "FAILED"
  | "SKIPPED"

// State checkpoint entry (appended to .enrichment-state.jsonl)
export interface StateEntry {
  handle: string
  state: ProductState
  ts: string
  stage?: string
  error?: string
}

// Per-product stats (appended to enrich-run.jsonl)
export interface ProductStats {
  handle: string
  ts: string
  state: ProductState
  duration_ms: number
  scrape_status: string
  tags_added: number
  tags_kept: number
  metadata_keys_written: number
  images_added: number
  images_already_had: number
  derived_variants_produced: number
  warnings: string[]
  rejected_tokens: string[]
}

// Final aggregated report
export interface EnrichmentReport {
  run_ts: string
  duration_ms: number
  total_products: number
  by_state: Record<string, number>
  images: {
    new_downloaded: number
    already_had: number
    derived_total: number
    storage_added_bytes: number
  }
  tag_coverage: Record<string, { count: number; pct: number }>
  metadata_coverage: Record<string, { count: number; pct: number }>
  top_rejected_tokens: Array<{ token: string; count: number }>
  critical_warnings: string[]
}
