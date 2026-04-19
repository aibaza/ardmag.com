/**
 * One-time idempotent script: rewrites Wix CDN image URLs in Medusa DB
 * to local /static/images/{slug}/{stem}/{variant}.{fmt} URLs.
 *
 * Usage:
 *   npx ts-node scripts/rewrite-image-urls.ts [--dry-run] [--apply]
 *
 * --dry-run (default): shows what would change, no writes
 * --apply: actually patches products in Medusa
 */

import * as fs from "fs"
import * as path from "path"

const BACKEND_URL = "http://localhost:9000"
const ADMIN_EMAIL = "admin@ardmag.com"
const ADMIN_PASSWORD = "Admin1234!"
const STATIC_IMAGES_DIR = path.resolve(__dirname, "../backend/static/images")
const DRY_RUN = !process.argv.includes("--apply")

const PREFERRED_VARIANT = "card" // Use card.webp as thumbnail
const PREFERRED_FMT = "webp"

async function getAdminToken(): Promise<string> {
  const res = await fetch(`${BACKEND_URL}/auth/user/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })
  const data = await res.json() as { token: string }
  return data.token
}

async function fetchAllProducts(token: string): Promise<any[]> {
  const products: any[] = []
  let offset = 0
  const limit = 50

  while (true) {
    const res = await fetch(
      `${BACKEND_URL}/admin/products?limit=${limit}&offset=${offset}&fields=id,handle,title,thumbnail,images`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const data = await res.json() as { products: any[]; count: number }
    products.push(...data.products)
    offset += limit
    if (offset >= data.count) break
  }

  return products
}

function findLocalImage(slug: string, variant: string, fmt: string): string | null {
  const dir = path.join(STATIC_IMAGES_DIR, slug)
  if (!fs.existsSync(dir)) return null

  // Find any stem that has the variant.fmt file
  const stems = fs.readdirSync(dir).filter(f => !f.includes("."))
  for (const stem of stems) {
    const variantPath = path.join(dir, stem, `${variant}.${fmt}`)
    if (fs.existsSync(variantPath)) {
      return `/static/images/${slug}/${stem}/${variant}.${fmt}`
    }
  }

  // Fallback: any .jpg or .png directly in the slug dir
  const directFiles = fs.readdirSync(dir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
  if (directFiles.length > 0) {
    return `/static/images/${slug}/${directFiles[0]}`
  }

  return null
}

function isWixUrl(url: string): boolean {
  return url.includes("wixstatic.com") || url.includes("wix.com")
}

async function patchProduct(token: string, productId: string, thumbnail: string | null, images: Array<{id: string; url: string}>): Promise<void> {
  const body: Record<string, unknown> = {}
  if (thumbnail) body.thumbnail = thumbnail
  if (images.length > 0) body.images = images

  const res = await fetch(`${BACKEND_URL}/admin/products/${productId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to patch product ${productId}: ${err}`)
  }
}

async function main() {
  console.log(`\nImage URL Rewriter — ${DRY_RUN ? "DRY RUN" : "APPLY MODE"}`)
  console.log("=".repeat(50))

  if (!fs.existsSync(STATIC_IMAGES_DIR)) {
    console.error(`ERROR: Static images dir not found: ${STATIC_IMAGES_DIR}`)
    process.exit(1)
  }

  const token = await getAdminToken()
  console.log("✓ Admin authenticated")

  const products = await fetchAllProducts(token)
  console.log(`✓ Fetched ${products.length} products`)

  let patched = 0
  let skipped = 0
  let notFound = 0

  for (const product of products) {
    const slug = product.handle
    if (!slug) { skipped++; continue }

    const newThumbnail = findLocalImage(slug, PREFERRED_VARIANT, PREFERRED_FMT)
      ?? findLocalImage(slug, "detail", "jpg")

    const currentThumbnailIsWix = product.thumbnail && isWixUrl(product.thumbnail)
    const needsThumbnailUpdate = currentThumbnailIsWix && newThumbnail

    // Remap images array
    const newImages: Array<{id: string; url: string}> = []
    let needsImagesUpdate = false

    for (const img of (product.images ?? [])) {
      if (isWixUrl(img.url)) {
        const stems = fs.existsSync(path.join(STATIC_IMAGES_DIR, slug))
          ? fs.readdirSync(path.join(STATIC_IMAGES_DIR, slug)).filter(f => !f.includes("."))
          : []

        // Try to find a matching local image for this position
        const idx = (product.images ?? []).indexOf(img)
        const stemForIdx = stems[idx] ?? stems[0]
        if (stemForIdx) {
          const localUrl = findLocalImage(slug, PREFERRED_VARIANT, PREFERRED_FMT)
          if (localUrl) {
            newImages.push({ id: img.id, url: localUrl })
            needsImagesUpdate = true
          } else {
            newImages.push(img)
          }
        } else {
          newImages.push(img)
        }
      } else {
        newImages.push(img)
      }
    }

    if (!needsThumbnailUpdate && !needsImagesUpdate) {
      skipped++
      continue
    }

    if (!newThumbnail) {
      console.log(`  WARN: No local image found for slug "${slug}" — skipping thumbnail`)
      notFound++
      skipped++
      continue
    }

    console.log(`  ${DRY_RUN ? "[DRY]" : "[PATCH]"} ${product.title} (${slug})`)
    if (needsThumbnailUpdate) {
      console.log(`    thumbnail: ${product.thumbnail?.substring(0, 60)}... → ${newThumbnail}`)
    }

    if (!DRY_RUN) {
      await patchProduct(
        token,
        product.id,
        needsThumbnailUpdate ? newThumbnail : null,
        needsImagesUpdate ? newImages : []
      )
    }

    patched++
  }

  console.log("\n" + "=".repeat(50))
  console.log(`Patched:   ${patched}`)
  console.log(`Skipped:   ${skipped} (already local or no slug)`)
  console.log(`Not found: ${notFound} (no local image for slug)`)
  console.log(`\nVERDICT: ${DRY_RUN ? "DRY RUN COMPLETE — run with --apply to apply" : "DONE"}`)
}

main().catch(err => {
  console.error("FATAL:", err)
  process.exit(1)
})
