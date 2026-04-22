/**
 * One-time script: uploads product images from backend/static/images/ to Cloudflare R2,
 * then rewrites Medusa image URLs from /static/images/... to https://media.ardmag.com/images/...
 *
 * Prerequisites:
 *   - R2 bucket "ardmag-media" created in Cloudflare
 *   - Custom domain media.ardmag.com pointed at bucket
 *   - R2 API token with Object:Write permissions
 *
 * Env vars required (add to backend/.env or export):
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY
 *   Optional: R2_BUCKET (default: ardmag-media), R2_PUBLIC_URL (default: https://media.ardmag.com)
 *
 * Usage:
 *   npx ts-node scripts/upload-images-to-r2.ts              # dry-run
 *   npx ts-node scripts/upload-images-to-r2.ts --apply      # upload + update DB
 *   npx ts-node scripts/upload-images-to-r2.ts --skip-upload --apply  # only update DB URLs
 */

import * as fs from "fs"
import * as path from "path"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

// Load backend/.env into process.env (non-destructive)
const envPath = path.resolve(__dirname, "../backend/.env")
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2]
  }
}

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
const ADMIN_EMAIL = "admin@ardmag.com"
const ADMIN_PASSWORD = "Admin1234!"
const IMAGES_DIR = path.resolve(__dirname, "../backend/static/images")
const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL || "https://media.ardmag.com").replace(/\/$/, "")
const R2_BUCKET = process.env.R2_BUCKET || "ardmag-media"
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || ""
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || ""
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || ""

const DRY_RUN = !process.argv.includes("--apply")
const SKIP_UPLOAD = process.argv.includes("--skip-upload")

async function getAuthToken(): Promise<string> {
  const res = await fetch(`${BACKEND_URL}/auth/user/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })
  if (!res.ok) throw new Error(`Auth failed: ${res.status}`)
  const data = (await res.json()) as { token: string }
  return data.token
}

async function getAllProducts(token: string) {
  const res = await fetch(`${BACKEND_URL}/admin/products?limit=200`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`)
  const data = (await res.json()) as {
    products: Array<{
      id: string
      handle: string
      title: string
      images: Array<{ id: string; url: string }>
    }>
  }
  return data.products
}

async function updateProductImages(
  token: string,
  productId: string,
  images: Array<{ id: string; url: string }>
): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/admin/products/${productId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ images: images.map((img) => ({ id: img.id, url: img.url })) }),
  })
  if (!res.ok) {
    throw new Error(`Failed to update images for ${productId}: ${res.status}`)
  }
}

function contentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg"
  if (ext === ".png") return "image/png"
  if (ext === ".webp") return "image/webp"
  return "application/octet-stream"
}

function localUrlToR2Url(localUrl: string): string {
  // /static/images/eco-dry/file.jpg -> https://media.ardmag.com/images/eco-dry/file.jpg
  const key = localUrl.replace(/^\/static\//, "")
  return `${R2_PUBLIC_URL}/${key}`
}

async function main() {
  console.log(`\nUpload Images to R2 — ${DRY_RUN ? "DRY RUN" : "LIVE MODE"}${SKIP_UPLOAD ? " (skip upload, update URLs only)" : ""}\n`)

  // Collect local image files
  const localFiles: string[] = []
  for (const slug of fs.readdirSync(IMAGES_DIR)) {
    const slugDir = path.join(IMAGES_DIR, slug)
    if (!fs.statSync(slugDir).isDirectory()) continue
    for (const file of fs.readdirSync(slugDir)) {
      if (/\.(jpg|jpeg|png|webp)$/i.test(file)) {
        localFiles.push(path.join(slug, file))
      }
    }
  }
  console.log(`Imagini locale: ${localFiles.length} fisiere in ${IMAGES_DIR}`)

  // Upload phase
  if (!DRY_RUN && !SKIP_UPLOAD) {
    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
      console.error("\nERORE: seteaza R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY in backend/.env")
      process.exit(1)
    }

    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
      forcePathStyle: true,
    })

    let uploaded = 0
    let errors = 0
    for (const relPath of localFiles) {
      const key = `images/${relPath.replace(/\\/g, "/")}`
      const filePath = path.join(IMAGES_DIR, relPath)
      try {
        await s3.send(new PutObjectCommand({
          Bucket: R2_BUCKET,
          Key: key,
          Body: fs.readFileSync(filePath),
          ContentType: contentType(filePath),
          CacheControl: "public, max-age=31536000, immutable",
        }))
        uploaded++
        if (uploaded % 10 === 0) process.stdout.write(`  Upload: ${uploaded}/${localFiles.length}\r`)
      } catch (err) {
        console.error(`  EROARE upload ${key}: ${err}`)
        errors++
      }
      await new Promise((r) => setTimeout(r, 50))
    }
    console.log(`\nUpload: ${uploaded} OK, ${errors} erori`)
    if (errors > 0) {
      console.log("Ruleaza cu --skip-upload --apply pentru a retesta numai update-ul URL-urilor")
    }
  } else if (DRY_RUN) {
    console.log(`[DRY] Ar uploada ${localFiles.length} fisiere in s3://${R2_BUCKET}/images/`)
    console.log(`[DRY] Exemplu: /static/images/eco-dry/file.jpg -> ${R2_PUBLIC_URL}/images/eco-dry/file.jpg`)
  }

  // URL rewrite phase
  console.log("\nActualizare URL-uri imagini in Medusa...")
  const token = await getAuthToken()
  const products = await getAllProducts(token)

  let updated = 0
  let alreadyOk = 0
  let noImages = 0

  for (const product of products) {
    if (!product.images?.length) { noImages++; continue }

    const hasLocal = product.images.some((img) => img.url.startsWith("/static/"))
    if (!hasLocal) { alreadyOk++; continue }

    const newImages = product.images.map((img) => ({
      id: img.id,
      url: img.url.startsWith("/static/") ? localUrlToR2Url(img.url) : img.url,
    }))

    if (DRY_RUN) {
      console.log(`  [DRY] ${product.handle}: ${product.images[0].url}`)
      console.log(`         -> ${newImages[0].url}`)
    } else {
      await updateProductImages(token, product.id, newImages)
      await new Promise((r) => setTimeout(r, 100))
    }
    updated++
  }

  console.log(`\n--- Sumar ---`)
  console.log(`URL-uri actualizate: ${updated}`)
  console.log(`Deja cu URL R2: ${alreadyOk}`)
  console.log(`Fara imagini: ${noImages}`)

  if (DRY_RUN) {
    console.log("\nRuleaza cu --apply pentru a face upload si a actualiza DB:")
    console.log("  npx ts-node scripts/upload-images-to-r2.ts --apply")
  } else {
    console.log("\nDupa verificare, sterge imaginile locale din repo:")
    console.log("  git rm -r backend/static/images/")
    console.log("  git commit -m 'chore: remove static images migrated to R2'")
  }
}

main().catch(console.error)
