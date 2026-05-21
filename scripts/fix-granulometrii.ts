/**
 * fix-granulometrii.ts
 *
 * Inlocuieste "granulometr*" (granulometrii, granulometrie, granulometriei, etc)
 * cu "granulaț*" (granulații, granulație, ...) cu diacritice in title, subtitle,
 * description si material la toate produsele Medusa.
 *
 * Usage:
 *   # dry-run (default, doar afiseaza ce s-ar schimba):
 *   MEDUSA_BACKEND_URL=https://api.ardmag.ro \
 *     ADMIN_EMAIL=ciprian.dobrea@gmail.com \
 *     ADMIN_PASSWORD=... \
 *     npx ts-node scripts/fix-granulometrii.ts
 *
 *   # productie:
 *   MEDUSA_BACKEND_URL=https://api.ardmag.ro \
 *     ADMIN_EMAIL=ciprian.dobrea@gmail.com \
 *     ADMIN_PASSWORD=... \
 *     npx ts-node scripts/fix-granulometrii.ts --apply
 */

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@ardmag.ro"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ""

const DRY_RUN = !process.argv.includes("--apply")
const DELAY_MS = 100

const FIELDS_TO_SCAN = ["title", "subtitle", "description", "material"] as const
type ScannedField = (typeof FIELDS_TO_SCAN)[number]

interface MedusaProduct {
  id: string
  handle: string
  title: string | null
  subtitle: string | null
  description: string | null
  material: string | null
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function transform(value: string): string {
  return value.replace(/granulometr/g, "granulaț").replace(/Granulometr/g, "Granulaț")
}

let authToken = ""

async function authenticate(): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/auth/user/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })
  if (!res.ok) throw new Error(`Auth failed: ${res.status} ${await res.text()}`)
  const data = (await res.json()) as { token: string }
  authToken = data.token
}

async function apiGet(endpoint: string): Promise<any> {
  const res = await fetch(`${BACKEND_URL}${endpoint}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  })
  if (!res.ok) throw new Error(`GET ${endpoint} -> ${res.status}: ${await res.text()}`)
  return res.json()
}

async function apiPost(endpoint: string, body: unknown): Promise<any> {
  const res = await fetch(`${BACKEND_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`POST ${endpoint} -> ${res.status}: ${await res.text()}`)
  return res.json()
}

async function listAllProducts(): Promise<MedusaProduct[]> {
  const all: MedusaProduct[] = []
  let offset = 0
  const limit = 100
  while (true) {
    const data = await apiGet(
      `/admin/products?fields=id,handle,title,subtitle,description,material&limit=${limit}&offset=${offset}`
    )
    const batch = (data.products ?? []) as MedusaProduct[]
    all.push(...batch)
    if (batch.length < limit) break
    offset += limit
  }
  return all
}

function snippet(value: string, needle: RegExp, before = 30, after = 30): string {
  const m = value.match(needle)
  if (!m || m.index === undefined) return ""
  const start = Math.max(0, m.index - before)
  const end = Math.min(value.length, m.index + m[0].length + after)
  const prefix = start > 0 ? "..." : ""
  const suffix = end < value.length ? "..." : ""
  return prefix + value.slice(start, end).replace(/\s+/g, " ") + suffix
}

async function main(): Promise<void> {
  if (!ADMIN_PASSWORD) {
    console.error("ADMIN_PASSWORD env var lipseste")
    process.exit(1)
  }

  console.log("─".repeat(70))
  console.log("fix-granulometrii.ts")
  console.log(`mode: ${DRY_RUN ? "DRY RUN (foloseste --apply pentru a executa)" : "APPLY"}`)
  console.log(`backend: ${BACKEND_URL}`)
  console.log("─".repeat(70))

  console.log("\n[1/3] Autentificare admin Medusa...")
  await authenticate()
  console.log("      OK")

  console.log("\n[2/3] Listare produse...")
  const products = await listAllProducts()
  console.log(`      ${products.length} produse`)

  console.log("\n[3/3] Scanare granulometr*:")
  const needle = /[Gg]ranulometr/
  const stats = { found: 0, updated: 0, error: 0 }

  for (const p of products) {
    const changes: { field: ScannedField; before: string; after: string }[] = []
    for (const field of FIELDS_TO_SCAN) {
      const value = p[field]
      if (!value || typeof value !== "string") continue
      if (!needle.test(value)) continue
      const updated = transform(value)
      if (updated === value) continue
      changes.push({ field, before: value, after: updated })
    }
    if (changes.length === 0) continue

    stats.found++
    console.log(`\n  ${p.handle} (${p.id})`)
    for (const c of changes) {
      console.log(`    [${c.field}]`)
      console.log(`      - ${snippet(c.before, needle)}`)
      console.log(`      + ${snippet(c.after, /[Gg]ranulaț/)}`)
    }

    if (!DRY_RUN) {
      const payload: Record<string, string> = {}
      for (const c of changes) payload[c.field] = c.after
      try {
        await apiPost(`/admin/products/${p.id}`, payload)
        stats.updated++
        console.log(`    -> UPDATED`)
      } catch (e: any) {
        stats.error++
        console.log(`    -> ERROR: ${e.message}`)
      }
      await sleep(DELAY_MS)
    }
  }

  console.log("\n─".repeat(70))
  console.log(`Rezultat: ${stats.found} produse cu match`)
  if (!DRY_RUN) {
    console.log(`         ${stats.updated} actualizate, ${stats.error} erori`)
  } else {
    console.log(`         (dry run; foloseste --apply pentru a aplica)`)
  }
  console.log("─".repeat(70))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
