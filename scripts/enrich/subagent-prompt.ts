import type { SubagentInput } from "./types"

export interface PromptMessages {
  systemPrompt: string
  userPrompt: string
}

function htmlToText(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gis, "")
    .replace(/<script[^>]*>.*?<\/script>/gis, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim()
}

const SYSTEM_PROMPT = `You are a product data extractor for an e-commerce catalog of stone-working tools and supplies (ardmag.com).

MISSION: Extract structured product attributes from provided raw data. Output a single JSON object matching the SubagentOutput schema. No other text.

ZERO INVENTION RULE: Every value you output must be traceable to exact text in the provided sources. If a token does not appear verbatim (diacritic-insensitive) in the title, description, collection name, option values, or scraped HTML -- omit it. Do not infer, do not generalize. When in doubt, omit.

OUTPUT FORMAT: A single JSON object with this structure:
{
  "handle": "<same as input handle>",
  "dossier": {
    "brand": "<one token from BRANDS or null>",
    "diameters_mm": [<number array, e.g. [115, 125]>],
    "band_types": ["<tokens from BAND_TYPES>"],
    "materials": ["<tokens from MATERIALS>"],
    "threads": ["<tokens from THREADS>"],
    "availability": ["in-stoc"],
    "specs": {"<key_snake_case>": "<verbatim value>"},
    "dimensiuni": {"diametru_extern_mm": "115", "filet_montare": "22.23 mm"},
    "identificare": {"origine": "Italia", "ambalare": "1 litru"},
    "aplicatii": ["<material or application verbatim from description>"],
    "features": ["<feature bullet verbatim from description>"],
    "extra_image_urls": ["<URLs from scraped page if any>"]
  },
  "sources_used": ["csv_description", "live_html"],
  "warnings": [],
  "evidence": {
    "brand:tenax": {"source": "collection", "quote": "MASTICI TENAX"},
    "material:granit": {"source": "description", "quote": "granit"},
    "band-type:turbo": {"source": "option_value", "quote": "TURBO"}
  }
}

EVIDENCE RULES:
- For each extracted value, add an entry to "evidence" with key format "<prefix>:<canonical_token>".
- Valid source values: "collection", "title", "description", "option_name", "option_value", "live_html", "additional_info".
- For "aplicatii": key format is "aplicatie:<text>", quote the exact verbatim text.
- For "features": key format is "feature:<text>", quote the exact verbatim text.
- For diameters: key format is "diameter:<number>", quote the text containing that diameter.
- For specs/dimensiuni/identificare keys: key format is "spec:<key>", quote the source text.

EXTRACTION RULES:
- If the product collection is "MASTICI TENAX", brand is always tenax -- quote the collection name as evidence.
- If the product has a "DIAMETRU" option, its values are the most reliable source for diameters -- prefer those over description text.
- Only output brand tokens from BRANDS, band_types from BAND_TYPES, materials from MATERIALS, threads from THREADS.
- "availability" defaults to ["in-stoc"] unless the description explicitly states otherwise.
- "specs" is for raw key-value pairs found in the source (e.g. "grosime_segment": "10 mm"). Keys must be snake_case.
- "dimensiuni" is specifically for physical dimensions. "identificare" is for origin, packaging, certifications.
- "extra_image_urls" should contain any image URLs found in the scraped HTML that are not already in csv_image_urls.
- Output ONLY valid JSON. No markdown fences, no explanation text before or after the JSON.`

export function buildSubagentPrompt(input: SubagentInput): PromptMessages {
  const descriptionText = htmlToText(input.description_html)

  const additionalInfoText =
    input.additional_info.length > 0
      ? input.additional_info
          .map((ai) => `  ${ai.title}: ${htmlToText(ai.body)}`)
          .join("\n")
      : "  (none)"

  const variantOptionsText =
    input.variant_options.length > 0
      ? input.variant_options
          .map((opt) => `  ${opt.name}: ${opt.values.join(", ")}`)
          .join("\n")
      : "  (none)"

  const scrapedText =
    input.live_scrape.status === "OK" && input.live_scrape.description_text
      ? input.live_scrape.description_text.trim().slice(0, 1500)
      : `(status: ${input.live_scrape.status})`

  const scrapeImagesList =
    input.live_scrape.image_urls.length > 0
      ? input.live_scrape.image_urls.join("\n  ")
      : "(none)"

  const csvImagesList =
    input.csv_image_urls.length > 0
      ? input.csv_image_urls.join("\n  ")
      : "(none)"

  const userPrompt = `## Product to extract

Handle: ${input.handle}
Title: ${input.title}
Collection: ${input.collection}
Variant count: ${input.current_medusa.variant_count}

Description (plain text):
${descriptionText || "(empty)"}

Additional info:
${additionalInfoText}

Variant options:
${variantOptionsText}

CSV image URLs:
  ${csvImagesList}

Scraped page text (from live site):
${scrapedText}

Scraped page image URLs:
  ${scrapeImagesList}

---

## Controlled vocabulary (only these tokens are valid)

BRANDS: ${["tenax", "sait", "woosuk", "diatex", "delta-research", "vbt", "fox-ironstone"].join(", ")}
BAND_TYPES: ${["turbo-curb", "turbo-extra-class", "turbo", "continua", "segmentata", "vanity", "electroplated", "curb"].join(", ")}
MATERIALS: ${["beton-armat", "piatra-naturala", "granit", "marmura", "beton", "ceramica", "travertin", "cuart", "andezit", "universal"].join(", ")}
THREADS: ${["m14", "22-23mm", "5-8-inch"].join(", ")}

---

## Task

Extract product attributes from the sources above. Return a single JSON object matching the SubagentOutput schema.

Evidence example:
{
  "brand:tenax": {"source": "collection", "quote": "MASTICI TENAX"},
  "material:granit": {"source": "description", "quote": "granit"},
  "band-type:turbo": {"source": "option_value", "quote": "TURBO"},
  "diameter:115": {"source": "option_value", "quote": "115"}
}

Output ONLY valid JSON. No markdown, no explanation.`

  return {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
  }
}
