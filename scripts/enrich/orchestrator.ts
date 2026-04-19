import * as fs from "fs"
import * as path from "path"
import { execSync } from "child_process"
import { parse } from "csv-parse/sync"
import Anthropic from "@anthropic-ai/sdk"

import { loadState, transition, isAlreadyDone } from "./state"
import { appendStats, buildReport, printReport } from "./stats"
import { authenticate, getAllProducts, patchProduct, storeGetProduct, ensureTag } from "./medusa-client"
import type { AdminProduct, ProductPatch } from "./medusa-client"
import { buildSitemapIndex, scrapeProduct } from "./scrape-product"
import { downloadImages } from "./download-images"
import { validateDossier } from "./validator"
import { buildSubagentPrompt } from "./subagent-prompt"
import type {
  SubagentInput,
  SubagentOutput,
  CleanDossier,
  WixProductRow,
  WixVariantRow,
  ProductStats,
} from "./types"

const CSV_PATH = path.resolve(__dirname, "../../resources/Wix Products Catalog.csv")
const PROJECT_ROOT = path.resolve(__dirname, "../..")

const anthropic = new Anthropic()

// ─── CSV loading ──────────────────────────────────────────────────────────────

function loadCsv(): { products: Map<string, WixProductRow>; variants: Map<string, WixVariantRow[]> } {
  const raw = parse(fs.readFileSync(CSV_PATH, "utf8"), {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  }) as Array<Record<string, string>>

  const products = new Map<string, WixProductRow>()
  const variants = new Map<string, WixVariantRow[]>()

  for (const row of raw) {
    if (row.fieldType === "Product") {
      products.set(row.handleId, row as unknown as WixProductRow)
    } else if (row.fieldType === "Variant" && row.visible === "true") {
      const arr = variants.get(row.handleId) || []
      arr.push(row as unknown as WixVariantRow)
      variants.set(row.handleId, arr)
    }
  }

  return { products, variants }
}

// ─── LLM extraction ───────────────────────────────────────────────────────────

async function extractWithLLM(input: SubagentInput): Promise<SubagentOutput | null> {
  const { systemPrompt, userPrompt } = buildSubagentPrompt(input)
  try {
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    })
    const text = msg.content.find((b) => b.type === "text")?.text || ""
    const jsonMatch = text.match(/```json\n?([\s\S]+?)\n?```/) || text.match(/(\{[\s\S]+\})/)
    if (!jsonMatch) return null
    return JSON.parse(jsonMatch[1]) as SubagentOutput
  } catch (e) {
    console.error(`LLM extraction failed for ${input.handle}:`, e)
    return null
  }
}

// ─── Image derivation ─────────────────────────────────────────────────────────

function deriveImages(): number {
  try {
    const output = execSync("bash scripts/optimize-images.sh 2>&1", {
      cwd: PROJECT_ROOT,
      timeout: 120_000,
      encoding: "utf8",
    })
    const m = output.match(/Generated:\s+(\d+)\s+files/)
    return m ? parseInt(m[1], 10) : 0
  } catch {
    return 0
  }
}

// ─── Patch builder ────────────────────────────────────────────────────────────

async function buildPatch(
  current: AdminProduct,
  cleanDossier: CleanDossier,
  newImageUrls: string[]
): Promise<ProductPatch> {
  const existingTagValues = new Set(current.tags.map((t) => t.value))
  const desiredTagValues: string[] = [...existingTagValues]

  if (cleanDossier.brand) desiredTagValues.push(`brand:${cleanDossier.brand}`)
  for (const m of cleanDossier.materials) desiredTagValues.push(`material:${m}`)
  for (const b of cleanDossier.band_types) desiredTagValues.push(`band-type:${b}`)
  for (const d of cleanDossier.diameters_mm) desiredTagValues.push(`diameter:${d}`)
  for (const t of cleanDossier.threads) desiredTagValues.push(`thread:${t}`)

  const uniqueTagValues = [...new Set(desiredTagValues)]
  const tagIds = await Promise.all(uniqueTagValues.map((v) => ensureTag(v)))
  const tags = tagIds.map((id) => ({ id }))

  const existingMeta = current.metadata || {}
  const metadata: Record<string, unknown> = {
    ...existingMeta,
    enrichment: {
      version: 1,
      written_at: new Date().toISOString(),
      sources: cleanDossier.sources_used,
    },
  }
  if (Object.keys(cleanDossier.specs).length > 0) metadata.specs = cleanDossier.specs
  if (Object.keys(cleanDossier.dimensiuni).length > 0) metadata.dimensiuni = cleanDossier.dimensiuni
  if (Object.keys(cleanDossier.identificare).length > 0) metadata.identificare = cleanDossier.identificare
  if (cleanDossier.aplicatii.length > 0) metadata.aplicatii = cleanDossier.aplicatii
  if (cleanDossier.features.length > 0) metadata.features = cleanDossier.features

  const existingUrls = new Set(current.images.map((i) => i.url))
  const allUrls = [...current.images.map((i) => i.url)]
  for (const url of newImageUrls) {
    if (!existingUrls.has(url)) allUrls.push(url)
  }

  return {
    tags,
    metadata,
    images: allUrls.map((url) => ({ url })),
  }
}

// ─── Verification ─────────────────────────────────────────────────────────────

async function verifyProduct(
  handle: string,
  expectedTagValues: string[],
  newImageUrls: string[]
): Promise<{ passed: boolean; issues: string[] }> {
  const product = await storeGetProduct(handle)
  if (!product) return { passed: false, issues: ["product not found in store API"] }

  const issues: string[] = []
  const storeTags = new Set(product.tags.map((t: { value: string }) => t.value))

  for (const tv of expectedTagValues) {
    if (!storeTags.has(tv)) issues.push(`missing tag: ${tv}`)
  }

  const meta = product.metadata as Record<string, unknown> | null
  if (!meta?.enrichment) issues.push("missing metadata.enrichment")

  // Only verify new URLs that were explicitly written (not historical ones)
  for (const url of newImageUrls) {
    const found = product.images.some((i: { url: string }) => i.url === url)
    if (!found) issues.push(`missing image: ${url}`)
  }

  return { passed: issues.length === 0, issues }
}

// ─── Empty dossier fallback ───────────────────────────────────────────────────

function emptyCleanDossier(): CleanDossier {
  return {
    brand: null,
    diameters_mm: [],
    band_types: [],
    materials: [],
    threads: [],
    availability: [],
    specs: {},
    dimensiuni: {},
    identificare: {},
    aplicatii: [],
    features: [],
    extra_image_urls: [],
    rejected_tokens: [],
    warnings: ["LLM extraction returned null -- skipped extraction"],
    sources_used: [],
  }
}

// ─── Main loop ────────────────────────────────────────────────────────────────

export interface RunOptions {
  dryRun: boolean
  onlyHandles?: string[]
  forceHandles?: string[]
  forceAll?: boolean
  concurrency?: number
  refreshScrape?: string[]
}

export async function runEnrichment(opts: RunOptions): Promise<void> {
  const runStartMs = Date.now()

  await authenticate()

  const { products: csvProducts, variants: csvVariants } = loadCsv()
  const stateMap = loadState()
  const allProducts = await getAllProducts()

  let sitemapIndex = new Map<string, string>()
  try {
    sitemapIndex = await buildSitemapIndex()
    console.log(`[sitemap] indexed ${sitemapIndex.size} product URLs`)
  } catch (e) {
    console.warn("[sitemap] failed to build index, continuing with empty map:", e)
  }

  // Filter products to process
  const toProcess = allProducts.filter((p) => {
    if (opts.onlyHandles && !opts.onlyHandles.includes(p.handle)) return false
    if (opts.forceAll) return true
    if (opts.forceHandles?.includes(p.handle)) return true
    if (isAlreadyDone(stateMap, p.handle)) return false
    return true
  })

  const total = toProcess.length
  const sessionStats: ProductStats[] = []
  let done = 0

  console.log(`[orchestrator] processing ${total} products (${allProducts.length} total, ${allProducts.length - total} skipped as done)`)

  for (const product of toProcess) {
    const handle = product.handle
    const productStartMs = Date.now()

    let scrapeStatus = "SKIPPED"
    let tagsAdded = 0
    let tagsKept = 0
    let metadataKeysWritten = 0
    let imagesAdded = 0
    let imagesAlreadyHad = 0
    let derivedCount = 0
    let finalState: "VERIFIED" | "FAILED" = "FAILED"
    let warnings: string[] = []
    let rejectedTokens: string[] = []

    try {
      // Step a: transition to SCRAPING
      transition(handle, "SCRAPING")

      // Step b: scrape
      const scrapeResult = await scrapeProduct(
        handle,
        sitemapIndex,
        opts.refreshScrape?.includes(handle) ?? false
      )
      scrapeStatus = scrapeResult.status

      // Step c: transition to EXTRACTING
      transition(handle, "EXTRACTING")

      // Step d: build SubagentInput
      const csvRow = csvProducts.get(handle)
      const csvVariantRows = csvVariants.get(handle) || []

      // Collect option names and their unique values from variants
      const optionMap = new Map<string, Set<string>>()
      for (const v of csvVariantRows) {
        for (let i = 1; i <= 6; i++) {
          const name = v[`productOptionName${i}`]
          const val = v[`productOptionDescription${i}`]
          if (name && val) {
            if (!optionMap.has(name)) optionMap.set(name, new Set())
            optionMap.get(name)!.add(val)
          }
        }
      }

      const variantOptions = Array.from(optionMap.entries()).map(([name, valSet]) => ({
        name,
        values: [...valSet],
      }))

      // CSV image URLs: split by comma/semicolon if multiple
      const csvImageUrls: string[] = []
      if (csvRow?.productImageUrl) {
        for (const url of csvRow.productImageUrl.split(/[,;]/)) {
          const trimmed = url.trim()
          if (trimmed) csvImageUrls.push(trimmed)
        }
      }

      // Additional info fields
      const additionalInfo: Array<{ title: string; body: string }> = []
      if (csvRow) {
        for (let i = 1; i <= 5; i++) {
          const title = csvRow[`additionalInfoTitle${i}`]
          const body = csvRow[`additionalInfoDescription${i}`]
          if (title && body) additionalInfo.push({ title, body })
        }
      }

      const subagentInput: SubagentInput = {
        handle,
        medusa_id: product.id,
        title: product.title,
        collection: csvRow?.collection || "",
        description_html: csvRow?.description || "",
        additional_info: additionalInfo,
        variant_options: variantOptions,
        csv_image_urls: csvImageUrls,
        live_scrape: scrapeResult,
        current_medusa: {
          tags: product.tags.map((t) => t.value),
          metadata: (product.metadata as Record<string, unknown>) || {},
          images: product.images.map((i) => i.url),
          variant_count: product.variants.length,
        },
      }

      // Step e: LLM extraction
      const rawOutput = await extractWithLLM(subagentInput)
      if (!rawOutput) {
        console.warn(`[orchestrator] ${handle}: LLM returned null, using empty dossier`)
      }

      // Step f: transition to VALIDATING
      transition(handle, "VALIDATING")

      // Step g: build sourcesText
      const sourcesText = [
        product.title,
        csvRow?.description || "",
        csvRow?.collection || "",
        variantOptions.flatMap((o) => [o.name, ...o.values]).join(" "),
        scrapeResult.description_text,
        ...additionalInfo.map((a) => `${a.title} ${a.body}`),
      ].filter(Boolean)

      // Step h: validate dossier
      let cleanDossier: CleanDossier
      if (rawOutput) {
        cleanDossier = validateDossier(rawOutput, sourcesText)
      } else {
        cleanDossier = emptyCleanDossier()
      }
      warnings = cleanDossier.warnings
      rejectedTokens = cleanDossier.rejected_tokens

      // Step i: transition to IMAGES_COLLECTING
      transition(handle, "IMAGES_COLLECTING")

      // Step j: collect all image URLs
      const allImageUrls: string[] = [
        ...csvImageUrls,
        ...scrapeResult.image_urls,
        ...cleanDossier.extra_image_urls,
      ]
      const uniqueImageUrls = [...new Set(allImageUrls.filter(Boolean))]

      // Step k: download images
      let downloadedPaths: string[] = []
      let skippedPaths: string[] = []
      if (!opts.dryRun) {
        const dlResult = await downloadImages(handle, uniqueImageUrls)
        downloadedPaths = dlResult.downloaded
        skippedPaths = dlResult.skipped
        imagesAdded = downloadedPaths.length
        imagesAlreadyHad = skippedPaths.length
      }

      // Step l: transition to IMAGES_DERIVING
      transition(handle, "IMAGES_DERIVING")

      // Step m: derive images if any new ones downloaded
      if (!opts.dryRun && downloadedPaths.length > 0) {
        derivedCount = deriveImages()
      }

      // Step n: build local image URLs for Medusa
      // Transform resources/images/<slug>/<stem>.<ext> -> /static/images/<slug>/<stem>/card.webp
      const newLocalUrls = downloadedPaths.map((p) => {
        const rel = path.relative(path.join(PROJECT_ROOT, "resources/images"), p)
        const parts = rel.split(path.sep)
        // parts[0] = slug, parts[1] = filename
        const stem = path.basename(parts[1] || "", path.extname(parts[1] || ""))
        return `/static/images/${parts[0]}/${stem}/card.webp`
      })

      // Step o: transition to WRITING
      transition(handle, "WRITING")

      // Compute tag delta for stats
      const existingTagCount = product.tags.length
      const patch = await buildPatch(product, cleanDossier, newLocalUrls)
      const newTagCount = patch.tags?.length ?? existingTagCount
      tagsAdded = Math.max(0, newTagCount - existingTagCount)
      tagsKept = existingTagCount
      metadataKeysWritten = Object.keys(patch.metadata || {}).length

      // Step p/q: write or dry-run
      if (!opts.dryRun) {
        await patchProduct(product.id, patch)
      } else {
        console.log(`[dry-run] ${handle}: would write ${newTagCount} tags, ${metadataKeysWritten} metadata keys, ${newLocalUrls.length} new image URLs`)
        if (cleanDossier.brand) console.log(`  brand: ${cleanDossier.brand}`)
        if (cleanDossier.materials.length) console.log(`  materials: ${cleanDossier.materials.join(", ")}`)
        if (cleanDossier.diameters_mm.length) console.log(`  diameters: ${cleanDossier.diameters_mm.join(", ")}mm`)
      }

      // Step r: transition to VERIFYING
      transition(handle, "VERIFYING")

      // Step s: verify
      // Build expected tag value list from dossier directly
      const expectedTagValueList: string[] = []
      if (cleanDossier.brand) expectedTagValueList.push(`brand:${cleanDossier.brand}`)
      for (const m of cleanDossier.materials) expectedTagValueList.push(`material:${m}`)
      for (const b of cleanDossier.band_types) expectedTagValueList.push(`band-type:${b}`)
      for (const d of cleanDossier.diameters_mm) expectedTagValueList.push(`diameter:${d}`)
      for (const t of cleanDossier.threads) expectedTagValueList.push(`thread:${t}`)

      let passed = false
      if (!opts.dryRun) {
        const result = await verifyProduct(handle, expectedTagValueList, newLocalUrls)
        passed = result.passed
        if (!result.passed) {
          warnings.push(...result.issues)
        }
        // Step t: transition
        transition(handle, passed ? "VERIFIED" : "FAILED", {
          stage: "VERIFY",
          error: result.issues.join("; ") || undefined,
        })
        finalState = passed ? "VERIFIED" : "FAILED"
      } else {
        // dry-run always counts as verified for reporting
        transition(handle, "VERIFIED")
        finalState = "VERIFIED"
        passed = true
      }

      done++
      console.log(`[${done}/${total}] ${finalState}: ${handle}`)
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e)
      console.error(`[orchestrator] ${handle}: error: ${errMsg}`)
      transition(handle, "FAILED", { stage: "PROCESSING", error: errMsg })
      finalState = "FAILED"
      done++
      console.log(`[${done}/${total}] FAILED: ${handle}`)
    }

    // Step u: append stats
    const statsRow: ProductStats = {
      handle,
      ts: new Date().toISOString(),
      state: finalState,
      duration_ms: Date.now() - productStartMs,
      scrape_status: scrapeStatus,
      tags_added: tagsAdded,
      tags_kept: tagsKept,
      metadata_keys_written: metadataKeysWritten,
      images_added: imagesAdded,
      images_already_had: imagesAlreadyHad,
      derived_variants_produced: derivedCount,
      warnings,
      rejected_tokens: rejectedTokens,
    }
    appendStats(statsRow)
    sessionStats.push(statsRow)
  }

  // Step 8: print final report
  const report = buildReport(sessionStats, runStartMs, total)
  printReport(report)
}
