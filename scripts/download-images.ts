import { parse } from "csv-parse/sync"
import * as fs from "fs"
import * as path from "path"
import * as https from "https"

const CSV_PATH = path.resolve(__dirname, "../resources/Wix Products Catalog.csv")
const OUTPUT_DIR = path.resolve(__dirname, "../resources/images")
const DELAY_MS = 400
const BACKEND_URL = "http://localhost:9000"
const ADMIN_EMAIL = "admin@ardmag.com"
const ADMIN_PASSWORD = "Admin1234!"

interface WixRow {
  handleId: string
  fieldType: string
  name: string
  productImageUrl: string
  [key: string]: string
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[șş]/g, "s")
    .replace(/[țţ]/g, "t")
    .replace(/[ăâ]/g, "a")
    .replace(/[î]/g, "i")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) {
      resolve()
      return
    }
    const file = fs.createWriteStream(dest)
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close()
        fs.unlinkSync(dest)
        downloadFile(res.headers.location!, dest).then(resolve).catch(reject)
        return
      }
      if (res.statusCode !== 200) {
        file.close()
        fs.unlinkSync(dest)
        reject(new Error(`HTTP ${res.statusCode} for ${url}`))
        return
      }
      res.pipe(file)
      file.on("finish", () => file.close(() => resolve()))
      file.on("error", (e) => { fs.unlinkSync(dest); reject(e) })
    }).on("error", (e) => { fs.unlinkSync(dest); reject(e) })
  })
}

async function authenticate(): Promise<string> {
  const res = await fetch(`${BACKEND_URL}/auth/user/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })
  const data = (await res.json()) as { token: string }
  return data.token
}

async function updateProductImages(
  token: string,
  productHandle: string,
  imageUrls: string[]
): Promise<void> {
  // Găsim produsul după handle
  const res = await fetch(
    `${BACKEND_URL}/admin/products?handle=${productHandle}&fields=id`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const data = (await res.json()) as { products: Array<{ id: string }> }
  if (!data.products?.length) return

  const productId = data.products[0].id
  await fetch(`${BACKEND_URL}/admin/products/${productId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      images: imageUrls.map((url) => ({ url })),
      thumbnail: imageUrls[0],
    }),
  })
}

async function main(): Promise<void> {
  console.log("═══════════════════════════════════════════")
  console.log("  Download imagini din Wix CDN")
  console.log("═══════════════════════════════════════════\n")

  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  const csvContent = fs.readFileSync(CSV_PATH)
  const rows = parse(csvContent, { columns: true, bom: true, skip_empty_lines: true }) as WixRow[]
  const products = rows.filter((r) => r.fieldType === "Product")

  console.log("Autentificare Medusa...")
  const token = await authenticate()

  let downloaded = 0
  let skipped = 0
  let failed = 0

  for (const product of products) {
    const productSlug = slugify(product.name)
    const productDir = path.join(OUTPUT_DIR, productSlug)
    fs.mkdirSync(productDir, { recursive: true })

    const imageIds = product.productImageUrl
      .split(";")
      .map((id) => id.trim())
      .filter(Boolean)

    if (imageIds.length === 0) continue

    const localUrls: string[] = []
    let productFailed = false

    for (let i = 0; i < imageIds.length; i++) {
      const mediaId = imageIds[i]
      const ext = mediaId.includes(".") ? path.extname(mediaId) : ".jpg"
      // Normalize: strip ~mv2 qualifier, keep original media ID as filename
      const baseName = path.basename(mediaId, ext).replace(/~mv\d+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_")
      const filename = `${baseName}${ext}`
      const localPath = path.join(productDir, filename)
      const wixUrl = `https://static.wixstatic.com/media/${mediaId}`

      try {
        await downloadFile(wixUrl, localPath)
        // URL local pentru Medusa (servit static din backend)
        localUrls.push(`/static/images/${productSlug}/${filename}`)
        downloaded++
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        console.error(`  ✗ ${product.name} img ${i + 1}: ${msg}`)
        failed++
        productFailed = true
        // Păstrăm URL-ul Wix ca fallback
        localUrls.push(wixUrl)
      }

      await sleep(DELAY_MS)
    }

    if (!productFailed) {
      // Actualizăm imaginile produsului în Medusa cu path-urile locale
      await updateProductImages(token, productSlug, localUrls)
    }

    const status = productFailed ? "⚠" : "✓"
    console.log(`  ${status} ${product.name} (${imageIds.length} imagini)`)
  }

  console.log("\n═══════════════════════════════════════════")
  console.log(`  Descărcate: ${downloaded}`)
  console.log(`  Eșuate:     ${failed}`)
  console.log(`  Skip:       ${skipped}`)
  console.log("═══════════════════════════════════════════\n")
  console.log(`Imagini salvate în: ${OUTPUT_DIR}`)
  console.log("Următor pas: configurează Medusa să servească fișiere statice din resources/images/")
}

main().catch((e) => { console.error(e); process.exit(1) })
