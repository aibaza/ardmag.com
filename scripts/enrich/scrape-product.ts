import * as fs from "fs"
import * as path from "path"
import * as cheerio from "cheerio"
import pLimit from "p-limit"
import type { ScrapeResult } from "./types"

export const scrapeLimit = pLimit(2)

const WORKTREE_ROOT = path.resolve(__dirname, "../..")
const CACHE_DIR = path.join(WORKTREE_ROOT, ".enrichment-cache", "scrape")

const USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"

const FETCH_TIMEOUT_MS = 8000

// -- helpers --

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
  return dp[m][n]
}

function isImageUrlWanted(url: string): boolean {
  if (!url || url.startsWith("data:")) return false
  const lower = url.toLowerCase()
  // skip icons
  if (lower.includes("favicon") || lower.includes("/logo") || lower.includes("icon")) return false
  // must be product-related host or path
  return (
    lower.includes("/media/") ||
    lower.includes("wixstatic.com") ||
    lower.includes("ardmag.ro")
  )
}

// -- cache --

function cachePath(handle: string): string {
  return path.join(CACHE_DIR, `${handle}.json`)
}

function loadCache(handle: string): ScrapeResult | null {
  const p = cachePath(handle)
  if (!fs.existsSync(p)) return null
  try {
    const raw = fs.readFileSync(p, "utf-8")
    return JSON.parse(raw) as ScrapeResult
  } catch {
    return null
  }
}

function saveCache(result: ScrapeResult): void {
  fs.mkdirSync(CACHE_DIR, { recursive: true })
  fs.writeFileSync(cachePath(result.handle), JSON.stringify(result, null, 2), "utf-8")
}

// -- sitemap --

async function fetchText(url: string): Promise<string | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xml,text/xml,*/*" },
    })
    clearTimeout(timer)
    if (!res.ok) return null
    return await res.text()
  } catch {
    clearTimeout(timer)
    return null
  }
}

function extractLocsFromXml(xml: string): string[] {
  // matches both <loc>...</loc> and nested sitemapindex -> sitemap -> loc
  const matches = [...xml.matchAll(/<loc>\s*(https?:\/\/[^\s<]+)\s*<\/loc>/gi)]
  return matches.map((m) => m[1].trim())
}

async function fetchAllProductLocs(): Promise<string[]> {
  const candidates = [
    "https://www.ardmag.ro/sitemap.xml",
    "https://www.ardmag.ro/sitemap_products.xml",
    "https://www.ardmag.ro/sitemap_index.xml",
  ]

  const locs: string[] = []

  for (const url of candidates) {
    const xml = await fetchText(url)
    if (!xml) continue

    const rawLocs = extractLocsFromXml(xml)

    // If this is a sitemap index (contains sitemap sub-entries rather than page locs),
    // follow one level of indirection for nested product sitemaps
    const subSitemapUrls = rawLocs.filter(
      (l) =>
        l.includes("sitemap") &&
        !l.includes("/product-page/") &&
        (l.endsWith(".xml") || l.includes("sitemap"))
    )

    if (subSitemapUrls.length > 0) {
      for (const sub of subSitemapUrls) {
        const subXml = await fetchText(sub)
        if (subXml) {
          locs.push(...extractLocsFromXml(subXml))
        }
      }
    }

    locs.push(...rawLocs)

    // Stop after the first sitemap that yields product-page URLs
    const hasProducts = locs.some((l) => l.includes("/product-page/"))
    if (hasProducts) break
  }

  return [...new Set(locs)]
}

export async function buildSitemapIndex(): Promise<Map<string, string>> {
  const allLocs = await fetchAllProductLocs()
  const productLocs = allLocs.filter((l) => l.includes("/product-page/"))

  // build slug -> url map from Wix URLs
  const wixEntries: Array<{ slug: string; url: string }> = productLocs.map((url) => {
    const parts = url.split("/product-page/")
    const rawSlug = parts[1]?.split("?")[0] ?? ""
    return { slug: slugify(rawSlug), url }
  })

  // The map key is the Medusa handle (passed in by caller).
  // This function returns a Map<wixSlug -> wixUrl> so the caller can do
  // a Levenshtein lookup. We return it keyed by the Wix slug directly --
  // scrapeProduct() does the matching against the Medusa handle.
  const map = new Map<string, string>()
  for (const { slug, url } of wixEntries) {
    map.set(slug, url)
  }

  return map
}

// -- page scraping --

function extractFromCheerio(html: string): { image_urls: string[]; description_text: string; hasH1: boolean } {
  const $ = cheerio.load(html)

  const image_urls: string[] = []

  // og:image first
  const ogImage = $('meta[property="og:image"]').attr("content")
  if (ogImage && isImageUrlWanted(ogImage)) image_urls.push(ogImage)

  // imgs inside product containers
  const containers = ["main", "article", ".product", "[data-testid='product']"]
  const $scope = $(containers.join(",")).first()
  const imgScope = $scope.length ? $scope : $("body")

  imgScope.find("img").each((_, el) => {
    const src = $(el).attr("src") || $(el).attr("data-src") || ""
    if (src && isImageUrlWanted(src)) image_urls.push(src)
  })

  // description text
  const descSelectors = [
    ".product-description",
    '[data-testid="description"]',
    ".description",
    "article",
  ]
  let description_text = ""
  for (const sel of descSelectors) {
    const el = $(sel).first()
    if (el.length) {
      description_text = el
        .find("p")
        .map((_, p) => $(p).text().trim())
        .get()
        .filter(Boolean)
        .join("\n")
      if (description_text) break
    }
  }

  const hasH1 = $("h1").length > 0

  return { image_urls: [...new Set(image_urls)], description_text, hasH1 }
}

async function tryPlaywright(url: string): Promise<{ image_urls: string[]; description_text: string } | null> {
  // Check if chromium is available
  const { execSync } = await import("child_process")
  let chromiumAvailable = false
  try {
    execSync(
      'which chromium-browser 2>/dev/null || ls ~/.cache/ms-playwright/chromium*/chrome-linux/chrome 2>/dev/null | head -1',
      { stdio: "pipe" }
    )
    chromiumAvailable = true
  } catch {
    chromiumAvailable = false
  }

  if (!chromiumAvailable) {
    console.warn("[scrape] playwright not available -- chromium not installed, skipping")
    return null
  }

  try {
    // dynamic import so the module doesn't hard-fail if playwright isn't installed
    const { chromium } = await import("playwright")
    const browser = await chromium.launch({ headless: true })
    const page = await browser.newPage()
    await page.setExtraHTTPHeaders({ "User-Agent": USER_AGENT })
    await page.goto(url, { waitUntil: "networkidle", timeout: FETCH_TIMEOUT_MS })

    const html = await page.content()
    await browser.close()

    const { image_urls, description_text } = extractFromCheerio(html)
    return { image_urls, description_text }
  } catch (err) {
    console.warn("[scrape] playwright error:", err instanceof Error ? err.message : String(err))
    return null
  }
}

export async function scrapePage(handle: string, url: string, refresh = false): Promise<ScrapeResult> {
  if (!refresh) {
    const cached = loadCache(handle)
    if (cached) return { ...cached, cached: true }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  let html: string
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
    })
    clearTimeout(timer)
    if (!res.ok) {
      const result: ScrapeResult = { handle, url, status: "FAIL", image_urls: [], description_text: "", cached: false }
      saveCache(result)
      return result
    }
    html = await res.text()
  } catch {
    clearTimeout(timer)
    const result: ScrapeResult = { handle, url, status: "FAIL", image_urls: [], description_text: "", cached: false }
    saveCache(result)
    return result
  }

  // jitter after fetch
  await sleep(300 + Math.random() * 200)

  let { image_urls, description_text, hasH1 } = extractFromCheerio(html)

  // Playwright fallback if no h1 found (JS-rendered page)
  if (!hasH1) {
    console.warn(`[scrape] ${handle}: no h1 in static HTML, trying playwright fallback`)
    const pw = await tryPlaywright(url)
    if (pw) {
      image_urls = [...new Set([...image_urls, ...pw.image_urls])]
      if (!description_text && pw.description_text) description_text = pw.description_text
    }
  }

  const result: ScrapeResult = {
    handle,
    url,
    status: "OK",
    image_urls,
    description_text,
    cached: false,
  }

  saveCache(result)
  return result
}

export async function scrapeProduct(
  handle: string,
  sitemapIndex: Map<string, string>,
  refresh = false
): Promise<ScrapeResult> {
  if (!refresh) {
    const cached = loadCache(handle)
    if (cached) return { ...cached, cached: true }
  }

  // Find best-matching Wix URL for this Medusa handle
  const medusaSlug = slugify(handle)

  let bestUrl: string | null = null
  let bestDistance = Infinity

  for (const [wixSlug, url] of sitemapIndex.entries()) {
    const dist = levenshtein(medusaSlug, wixSlug)
    if (dist < bestDistance) {
      bestDistance = dist
      bestUrl = url
    }
  }

  if (!bestUrl || bestDistance > 3) {
    const result: ScrapeResult = {
      handle,
      url: "",
      status: "NOT_FOUND",
      image_urls: [],
      description_text: "",
      cached: false,
    }
    saveCache(result)
    return result
  }

  return scrapePage(handle, bestUrl, refresh)
}
