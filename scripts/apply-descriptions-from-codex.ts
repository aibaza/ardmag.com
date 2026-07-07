/**
 * apply-descriptions-from-codex.ts
 *
 * Citeste fisierele .md din backend-storefront/codex-copy-proposals/, extrage
 * sectiunea "## Descriere propusa (HTML simplu)" si actualizeaza descrierea
 * produsului Medusa cu acelasi handle ca numele fisierului.
 *
 * Usage:
 *   # dry-run (default, doar afiseaza diff-urile):
 *   npx ts-node scripts/apply-descriptions-from-codex.ts
 *
 *   # productie (pe Railway):
 *   MEDUSA_BACKEND_URL=https://api.ardmag.ro \
 *     ADMIN_EMAIL=ciprian.dobrea@gmail.com \
 *     ADMIN_PASSWORD=... \
 *     npx ts-node scripts/apply-descriptions-from-codex.ts --apply
 *
 *   # filtrare la un singur handle:
 *   npx ts-node scripts/apply-descriptions-from-codex.ts --only=creion
 */

import * as fs from "fs"
import * as path from "path"

// ─── Config ───────────────────────────────────────────────────────────────────

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@ardmag.ro"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? ""
const CODEX_DIR = path.resolve(__dirname, "../backend-storefront/codex-copy-proposals")
const AUDIT_LOG_PATH = path.resolve(__dirname, "apply-descriptions-audit.jsonl")
const DELAY_MS = 150

const DRY_RUN = !process.argv.includes("--apply")
const ONLY_HANDLE = process.argv.find((a) => a.startsWith("--only="))?.split("=")[1] || null

// ─── Types ────────────────────────────────────────────────────────────────────

interface CodexEntry {
  handle: string
  filePath: string
  description: string
}

interface AuditEntry {
  handle: string
  product_id: string | null
  status: "updated" | "skipped" | "missing" | "identical" | "error"
  reason?: string
  timestamp: string
  dry_run: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function readCodexEntries(): CodexEntry[] {
  const entries: CodexEntry[] = []
  for (const file of fs.readdirSync(CODEX_DIR)) {
    if (!file.endsWith(".md")) continue
    const handle = file.replace(/\.md$/, "")
    if (ONLY_HANDLE && handle !== ONLY_HANDLE) continue

    const filePath = path.join(CODEX_DIR, file)
    const content = fs.readFileSync(filePath, "utf8")
    const description = extractDescription(content)
    if (!description) {
      console.warn(`  [skip] ${file}: lipseste sectiunea "Descriere propusa (HTML simplu)"`)
      continue
    }
    entries.push({ handle, filePath, description })
  }
  return entries
}

function extractDescription(markdown: string): string | null {
  // Caut blocul intre "## Descriere propusa (HTML simplu)" si urmatorul "## " (sau EOF)
  const startRe = /^##\s+Descriere\s+propusa\s*\(HTML\s+simplu\)\s*$/m
  const startMatch = markdown.match(startRe)
  if (!startMatch || startMatch.index === undefined) return null

  const after = markdown.slice(startMatch.index + startMatch[0].length)
  const endMatch = after.match(/^##\s+/m)
  const block = endMatch && endMatch.index !== undefined ? after.slice(0, endMatch.index) : after

  return block.trim()
}

function appendAudit(entry: AuditEntry): void {
  fs.appendFileSync(AUDIT_LOG_PATH, JSON.stringify(entry) + "\n", "utf8")
}

// ─── API Client ───────────────────────────────────────────────────────────────

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
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`POST ${endpoint} -> ${res.status}: ${text}`)
  }
  return res.json()
}

// ─── Product Lookup ───────────────────────────────────────────────────────────

interface MedusaProductLite {
  id: string
  handle: string
  description: string | null
}

async function findProductByHandle(handle: string): Promise<MedusaProductLite | null> {
  const data = await apiGet(`/admin/products?handle=${encodeURIComponent(handle)}&fields=id,handle,description&limit=1`)
  const products = (data.products ?? []) as MedusaProductLite[]
  return products[0] ?? null
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("─".repeat(70))
  console.log("apply-descriptions-from-codex.ts")
  console.log(`mode: ${DRY_RUN ? "DRY RUN (foloseste --apply pentru a executa)" : "APPLY (modifica DB)"}`)
  console.log(`backend: ${BACKEND_URL}`)
  console.log(`codex dir: ${CODEX_DIR}`)
  if (ONLY_HANDLE) console.log(`filter: handle=${ONLY_HANDLE}`)
  console.log("─".repeat(70))

  // 1. Auth
  console.log("\n[1/3] Autentificare admin Medusa...")
  await authenticate()
  console.log("      OK")

  // 2. Read codex
  console.log("\n[2/3] Citire fisiere .md din codex...")
  const entries = readCodexEntries()
  console.log(`      ${entries.length} fisiere cu descriere propusa`)

  // 3. Apply / preview
  console.log("\n[3/3] Procesare entries:")
  const stats = { updated: 0, identical: 0, missing: 0, error: 0 }

  for (const entry of entries) {
    process.stdout.write(`  ${entry.handle.padEnd(40, " ")} `)
    try {
      const product = await findProductByHandle(entry.handle)
      if (!product) {
        console.log("MISSING (produsul nu exista in DB)")
        appendAudit({
          handle: entry.handle,
          product_id: null,
          status: "missing",
          timestamp: new Date().toISOString(),
          dry_run: DRY_RUN,
        })
        stats.missing++
        continue
      }

      const currentDesc = (product.description || "").trim()
      const newDesc = entry.description.trim()

      if (currentDesc === newDesc) {
        console.log("IDENTICAL (skip)")
        appendAudit({
          handle: entry.handle,
          product_id: product.id,
          status: "identical",
          timestamp: new Date().toISOString(),
          dry_run: DRY_RUN,
        })
        stats.identical++
        continue
      }

      // Update
      if (DRY_RUN) {
        console.log(`WOULD UPDATE (${currentDesc.length} -> ${newDesc.length} chars)`)
      } else {
        await apiPost(`/admin/products/${product.id}`, { description: newDesc })
        console.log(`UPDATED (${currentDesc.length} -> ${newDesc.length} chars)`)
      }

      appendAudit({
        handle: entry.handle,
        product_id: product.id,
        status: "updated",
        reason: `${currentDesc.length} -> ${newDesc.length} chars`,
        timestamp: new Date().toISOString(),
        dry_run: DRY_RUN,
      })
      stats.updated++

      await sleep(DELAY_MS)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.log(`ERROR: ${message}`)
      appendAudit({
        handle: entry.handle,
        product_id: null,
        status: "error",
        reason: message,
        timestamp: new Date().toISOString(),
        dry_run: DRY_RUN,
      })
      stats.error++
    }
  }

  // Summary
  console.log("\n" + "─".repeat(70))
  console.log(`SUMMARY (${DRY_RUN ? "DRY RUN" : "APPLIED"}):`)
  console.log(`  updated/would-update: ${stats.updated}`)
  console.log(`  identical (skip):     ${stats.identical}`)
  console.log(`  missing in DB:        ${stats.missing}`)
  console.log(`  errors:               ${stats.error}`)
  console.log(`  audit log:            ${AUDIT_LOG_PATH}`)
  if (DRY_RUN && stats.updated > 0) {
    console.log("\nRuleaza din nou cu --apply pentru a aplica modificarile.")
  }
}

main().catch((err) => {
  console.error("\nFATAL:", err)
  process.exit(1)
})
