/**
 * One-shot fix: actualizeaza thumbnail-ul produselor care inca au /static/ URL.
 * Ia primul URL din images[] array (deja pe R2) si il seteaza ca thumbnail.
 *
 * Usage:
 *   npx ts-node scripts/fix-thumbnails-r2.ts              # dry-run
 *   npx ts-node scripts/fix-thumbnails-r2.ts --apply      # live fix pe Railway
 */

import * as fs from "fs"
import * as path from "path"

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
const DRY_RUN = !process.argv.includes("--apply")

async function getAuthToken(): Promise<string> {
  const res = await fetch(`${BACKEND_URL}/auth/user/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })
  if (!res.ok) throw new Error(`Auth failed: ${res.status} ${await res.text()}`)
  const data = (await res.json()) as { token: string }
  return data.token
}

async function getAllProducts(token: string) {
  const res = await fetch(`${BACKEND_URL}/admin/products?limit=200&expand=images`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Fetch products failed: ${res.status}`)
  const data = (await res.json()) as {
    products: Array<{
      id: string
      handle: string
      thumbnail: string | null
      images: Array<{ id: string; url: string }>
    }>
  }
  return data.products
}

async function updateThumbnail(token: string, productId: string, thumbnail: string, retries = 4) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(`${BACKEND_URL}/admin/products/${productId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ thumbnail }),
    })
    if (res.ok) return
    if (res.status === 502 && attempt < retries) {
      const wait = (attempt + 1) * 5000
      process.stdout.write(`    502, retry in ${wait / 1000}s...`)
      await new Promise((r) => setTimeout(r, wait))
      continue
    }
    throw new Error(`Update thumbnail failed for ${productId}: ${res.status} ${await res.text()}`)
  }
}

async function main() {
  console.log(`\nFix Thumbnails R2 -- ${DRY_RUN ? "DRY RUN" : "LIVE"}\n`)
  console.log(`Backend: ${BACKEND_URL}\n`)

  const token = await getAuthToken()
  const products = await getAllProducts(token)

  let fixed = 0
  let skipped = 0
  let noImages = 0
  let errors = 0

  for (const p of products) {
    const hasStaticThumb = p.thumbnail?.startsWith("/static/")
    if (!hasStaticThumb) {
      skipped++
      continue
    }

    const r2Image = p.images?.find((img) => img.url.includes("r2.dev"))
    if (!r2Image) {
      console.log(`  NO R2 IMAGE: ${p.handle} -- thumbnail=${p.thumbnail}`)
      noImages++
      continue
    }

    if (DRY_RUN) {
      console.log(`  [DRY] ${p.handle}:`)
      console.log(`        ${p.thumbnail}`)
      console.log(`     -> ${r2Image.url}`)
    } else {
      try {
        await updateThumbnail(token, p.id, r2Image.url)
        console.log(`  OK: ${p.handle}`)
        await new Promise((r) => setTimeout(r, 400))
      } catch (err) {
        console.error(`  EROARE: ${p.handle}: ${err}`)
        errors++
      }
    }
    fixed++
  }

  console.log(`\n--- Sumar ---`)
  console.log(`Thumbnails de actualizat: ${fixed}`)
  console.log(`Deja pe R2 (skip): ${skipped}`)
  console.log(`Fara imagini R2 in images[]: ${noImages}`)
  if (!DRY_RUN) console.log(`Erori: ${errors}`)

  if (DRY_RUN && fixed > 0) {
    console.log("\nRuleaza cu --apply pentru a actualiza pe productie:")
    console.log(`  MEDUSA_BACKEND_URL=https://api.ardmag.surcod.ro npx ts-node scripts/fix-thumbnails-r2.ts --apply`)
  }
}

main().catch(console.error)
