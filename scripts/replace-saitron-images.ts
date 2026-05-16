/**
 * One-shot: inlocuieste imaginile saitron-125 si saitron-180 cu poza corecta
 * (sait-abrasive-semirigid-fibre-backed-disc-saitron-c.jpg).
 *
 * Genereaza variante (large 1200, small 400, tiny 150) cu acelasi pipeline ca
 * backend/src/modules/file-r2-variants/variants.ts (trim + flatten + jpeg mozjpeg).
 * Upload pe R2, apoi update DB image.url + product.thumbnail.
 *
 * Usage:
 *   npx ts-node scripts/replace-saitron-images.ts             # dry-run
 *   npx ts-node scripts/replace-saitron-images.ts --apply
 */

import * as fs from "fs"
import * as path from "path"
import sharp from "sharp"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { Pool } from "pg"

const envPath = path.resolve(__dirname, "../backend/.env")
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2]
  }
}

const APPLY = process.argv.includes("--apply")
const SOURCE = "/home/dc/Downloads/sait-abrasive-semirigid-fibre-backed-disc-saitron-c.jpg"
const PRODUCTS = [
  { handle: "saitron-125", dir: "images/saitron-125" },
  { handle: "saitron-180", dir: "images/saitron-180" },
]

const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL || "").replace(/\/$/, "")
const R2_BUCKET = process.env.R2_BUCKET!
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
})

async function generateVariants(buf: Buffer) {
  const base = sharp(buf)
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
  return { tiny, small, large }
}

async function putR2(key: string, buf: Buffer) {
  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: buf,
    ContentType: "image/jpeg",
    CacheControl: "public, max-age=31536000, immutable",
  }))
}

async function main() {
  if (!fs.existsSync(SOURCE)) {
    console.error(`source not found: ${SOURCE}`); process.exit(1)
  }
  const src = fs.readFileSync(SOURCE)
  const variants = await generateVariants(src)
  console.log(`[gen] tiny=${variants.tiny.byteLength}B small=${variants.small.byteLength}B large=${variants.large.byteLength}B`)

  const ts = Date.now()
  const filename = `saitron-${ts}.jpg`
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })

  for (const p of PRODUCTS) {
    const baseKey = `${p.dir}/${filename}`
    const url = `${R2_PUBLIC_URL}/${baseKey}`
    const urlSmall = url.replace(/\.jpg$/, "-small.jpg")
    const urlTiny = url.replace(/\.jpg$/, "-tiny.jpg")
    console.log(`\n[${p.handle}]`)
    console.log(`  upload: ${baseKey}`)
    console.log(`  upload: ${baseKey.replace(".jpg","-small.jpg")}`)
    console.log(`  upload: ${baseKey.replace(".jpg","-tiny.jpg")}`)

    if (APPLY) {
      await Promise.all([
        putR2(baseKey, variants.large),
        putR2(baseKey.replace(".jpg","-small.jpg"), variants.small),
        putR2(baseKey.replace(".jpg","-tiny.jpg"), variants.tiny),
      ])
      const r1 = await pool.query(
        `UPDATE image SET url=$1, updated_at=NOW() WHERE product_id=(SELECT id FROM product WHERE handle=$2 AND deleted_at IS NULL) AND deleted_at IS NULL`,
        [url, p.handle]
      )
      const r2 = await pool.query(
        `UPDATE product SET thumbnail=$1, updated_at=NOW() WHERE handle=$2 AND deleted_at IS NULL`,
        [url, p.handle]
      )
      console.log(`  DB: image rows=${r1.rowCount} product rows=${r2.rowCount}`)
    }
  }

  await pool.end()
  console.log(APPLY ? "\nDONE." : "\nDRY-RUN. Adauga --apply pentru a scrie efectiv.")
}

main().catch((e) => { console.error(e); process.exit(1) })
