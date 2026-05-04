/**
 * Backfill script: generates -tiny, -small, -large variants for all images already in R2.
 * Idempotent: skips originals that already have all 3 variants (checked via HeadObject).
 *
 * Env vars (from backend/.env):
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY
 *   R2_BUCKET (default: ardmag-media)
 *   R2_PUBLIC_URL
 *
 * Usage:
 *   npx ts-node scripts/generate-image-variants.ts           # dry-run
 *   npx ts-node scripts/generate-image-variants.ts --apply   # generate + upload
 */

import * as fs from "fs"
import * as path from "path"
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3"
import sharp from "sharp"
import pLimit from "p-limit"

// Load backend/.env into process.env (non-destructive)
const envPath = path.resolve(__dirname, "../backend/.env")
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].trim()
  }
}

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || ""
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || ""
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || ""
const R2_BUCKET = process.env.R2_BUCKET || "ardmag-media"

const DRY_RUN = !process.argv.includes("--apply")
const FORCE = process.argv.includes("--force")
const VARIANT_SUFFIXES = ["tiny", "small", "large"] as const
const RASTER_RE = /\.(jpe?g|png|webp|gif|tiff?)$/i

type VariantSpec = { suffix: string; buffer: Buffer; contentType: "image/jpeg" }

async function generateVariants(src: Buffer, key: string): Promise<VariantSpec[]> {
  if (!RASTER_RE.test(key)) return []

  const base = sharp(src)
    .trim({ threshold: 15 })
    .flatten({ background: { r: 255, g: 255, b: 255 } })

  const [tiny, small, large] = await Promise.all([
    base.clone().resize(150, 150, { fit: "contain", background: { r: 255, g: 255, b: 255 } })
      .jpeg({ quality: 80, progressive: true, mozjpeg: true }).toBuffer(),
    base.clone().resize(400, 400, { fit: "contain", background: { r: 255, g: 255, b: 255 } })
      .jpeg({ quality: 82, progressive: true, mozjpeg: true }).toBuffer(),
    base.clone().resize(1200, undefined, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85, progressive: true, mozjpeg: true }).toBuffer(),
  ])

  return [
    { suffix: "tiny", buffer: tiny, contentType: "image/jpeg" },
    { suffix: "small", buffer: small, contentType: "image/jpeg" },
    { suffix: "large", buffer: large, contentType: "image/jpeg" },
  ]
}

function variantKey(key: string, suffix: string): string {
  return key.replace(/\.(jpe?g|png|webp)$/i, `-${suffix}.$1`)
}

async function objectExists(s3: S3Client, bucket: string, key: string): Promise<boolean> {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
    return true
  } catch {
    return false
  }
}

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of stream as AsyncIterable<Buffer>) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

async function listAllObjects(s3: S3Client, bucket: string, prefix: string): Promise<string[]> {
  const keys: string[] = []
  let continuationToken: string | undefined

  do {
    const res = await s3.send(new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    }))
    for (const obj of res.Contents ?? []) {
      if (obj.Key) keys.push(obj.Key)
    }
    continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined
  } while (continuationToken)

  return keys
}

async function main() {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.error("EROARE: seteaza R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY in backend/.env")
    process.exit(1)
  }

  const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
    forcePathStyle: true,
  })

  console.log(`\nGenerare variante imagini R2 — ${DRY_RUN ? "DRY RUN" : "LIVE MODE"}\n`)

  // List all objects
  const allKeys = await listAllObjects(s3, R2_BUCKET, "images/")
  console.log(`Total obiecte in R2/images/: ${allKeys.length}`)

  // Filter: only originals (no suffix -tiny/-small/-large) that are raster images
  const variantSuffixRe = /-(tiny|small|large)\.(jpe?g|png|webp)$/i
  const originals = allKeys.filter((k) => RASTER_RE.test(k) && !variantSuffixRe.test(k))
  console.log(`Originale raster (fara variante): ${originals.length}`)

  const limit = pLimit(5)
  let processed = 0
  let skipped = 0
  const failed: string[] = []

  await Promise.all(
    originals.map((key) =>
      limit(async () => {
        // Check if all variants already exist (skip unless --force)
        const existChecks = await Promise.all(
          VARIANT_SUFFIXES.map((s) => objectExists(s3, R2_BUCKET, variantKey(key, s)))
        )
        if (!FORCE && existChecks.every(Boolean)) {
          skipped++
          return
        }

        if (DRY_RUN) {
          console.log(`[DRY] ${key}`)
          VARIANT_SUFFIXES.forEach((s) => console.log(`      -> ${variantKey(key, s)}`))
          processed++
          return
        }

        try {
          // Download original
          const res = await s3.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }))
          const srcBuffer = await streamToBuffer(res.Body as NodeJS.ReadableStream)

          // Generate variants
          const variants = await generateVariants(srcBuffer, key)
          if (variants.length === 0) { skipped++; return }

          // Upload missing variants (or all if --force)
          await Promise.all(
            variants.map(async (v, i) => {
              if (!FORCE && existChecks[i]) return // already exists
              const vKey = variantKey(key, v.suffix)
              await s3.send(new PutObjectCommand({
                Bucket: R2_BUCKET,
                Key: vKey,
                Body: v.buffer,
                ContentType: v.contentType,
                CacheControl: "public, max-age=31536000, immutable",
              }))
            })
          )
          processed++
          if ((processed + skipped) % 10 === 0) {
            process.stdout.write(`  Progress: ${processed + skipped}/${originals.length}\r`)
          }
        } catch (err) {
          console.error(`\nEROARE ${key}: ${err}`)
          failed.push(key)
        }
      })
    )
  )

  console.log(`\n\n--- Sumar ---`)
  console.log(`Procesate: ${processed}`)
  console.log(`Skip (variante deja existente): ${skipped}`)
  console.log(`Erori: ${failed.length}`)
  if (failed.length > 0) {
    console.log("Esuate:")
    failed.forEach((k) => console.log(`  ${k}`))
  }

  // Save report
  const reportsDir = path.resolve(__dirname, "../reports")
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true })
  const reportPath = path.join(reportsDir, "image-variants-backfill.json")
  fs.writeFileSync(reportPath, JSON.stringify({ processed, skipped, failed, dryRun: DRY_RUN }, null, 2))
  console.log(`\nRaport: ${reportPath}`)

  if (DRY_RUN) {
    console.log("\nRuleaza cu --apply pentru a face efectiv upload-ul:")
    console.log("  npx ts-node scripts/generate-image-variants.ts --apply")
  }
}

main().catch(console.error)
