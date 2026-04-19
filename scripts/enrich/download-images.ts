import * as fs from "fs"
import * as path from "path"
import * as crypto from "crypto"

const TIMEOUT_MS = 10000
const USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function deriveFilename(url: string): string {
  try {
    const u = new URL(url)
    const seg = u.pathname.split("/").filter(Boolean).pop() || "img"
    return seg
      .replace(/~/g, "_")
      .replace(/[^a-z0-9._-]/gi, "_")
      .toLowerCase()
  } catch {
    return "img.bin"
  }
}

function computeSHA1(data: Buffer): string {
  return crypto.createHash("sha1").update(data).digest("hex")
}

async function fetchWithTimeout(
  url: string,
  timeoutMs: number = TIMEOUT_MS
): Promise<Buffer> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
      },
    })

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }

    const contentType = res.headers.get("content-type") || ""
    if (
      !contentType.startsWith("image/") &&
      !contentType.startsWith("application/octet-stream")
    ) {
      throw new Error(`Invalid content-type: ${contentType}`)
    }

    const buffer = Buffer.from(await res.arrayBuffer())
    return buffer
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function downloadImages(
  slug: string,
  urls: string[],
  opts?: { delayMs?: number }
): Promise<{ downloaded: string[]; skipped: string[]; failed: string[] }> {
  const delayMs = opts?.delayMs ?? 300
  const projectRoot = path.resolve(__dirname, "../..")
  const imagesDir = path.join(projectRoot, "resources/images", slug)

  fs.mkdirSync(imagesDir, { recursive: true })

  const downloaded: string[] = []
  const skipped: string[] = []
  const failed: string[] = []

  const sha1Cache = new Map<string, string>() // sha1 -> filename

  for (const url of urls) {
    const derivedFilename = deriveFilename(url)
    const destPath = path.join(imagesDir, derivedFilename)

    try {
      if (fs.existsSync(destPath)) {
        skipped.push(destPath)
        continue
      }

      const buffer = await fetchWithTimeout(url, TIMEOUT_MS)
      const sha1 = computeSHA1(buffer)

      const existing = sha1Cache.get(sha1)
      if (existing) {
        skipped.push(existing)
        continue
      }

      const existingWithSha = Array.from(sha1Cache.entries()).find(
        ([, name]) => name === derivedFilename
      )
      if (existingWithSha) {
        sha1Cache.set(sha1, destPath)
        skipped.push(destPath)
        continue
      }

      fs.writeFileSync(destPath, buffer)
      sha1Cache.set(sha1, destPath)
      downloaded.push(destPath)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error(
        `[download-images] ${slug}: failed to download ${url}: ${msg}`
      )
      failed.push(url)
    }

    await sleep(delayMs)
  }

  return { downloaded, skipped, failed }
}
