import { runEnrichment, RunOptions } from "./orchestrator"

function parseArgs(): RunOptions {
  const args = process.argv.slice(2)

  const has = (flag: string) => args.includes(flag)
  const get = (prefix: string) => {
    const found = args.find((a) => a.startsWith(prefix))
    return found ? found.split("=")[1] : undefined
  }

  const dryRun = !has("--apply")
  const onlyStr = get("--only=")
  const forceStr = get("--force=")
  const refreshStr = get("--refresh-scrape=")
  const concStr = get("--concurrency=")

  return {
    dryRun,
    onlyHandles: onlyStr ? onlyStr.split(",").map((s) => s.trim()) : undefined,
    forceHandles: forceStr ? forceStr.split(",").map((s) => s.trim()) : undefined,
    forceAll: has("--force-all"),
    concurrency: concStr ? Math.min(Math.max(parseInt(concStr, 10), 1), 8) : 4,
    refreshScrape: refreshStr ? refreshStr.split(",").map((s) => s.trim()) : undefined,
  }
}

async function main() {
  const opts = parseArgs()

  if (opts.dryRun) {
    console.log("[DRY-RUN] Nicio modificare nu va fi scrisa in Medusa.")
  } else {
    console.log("[APPLY] Modificarile vor fi scrise in Medusa.")
  }

  if (opts.onlyHandles) {
    console.log(`[FILTER] Doar: ${opts.onlyHandles.join(", ")}`)
  }

  if (opts.forceAll) {
    console.log("[FORCE] Re-processing all products (ignoring prior completion)")
  } else if (opts.forceHandles?.length) {
    console.log(`[FORCE] Re-processing: ${opts.forceHandles.join(", ")}`)
  }

  if (opts.refreshScrape?.length) {
    console.log(`[REFRESH] Re-scraping (ignoring cache): ${opts.refreshScrape.join(", ")}`)
  }

  console.log(`[CONCURRENCY] Processing ${opts.concurrency} products in parallel`)
  console.log("")

  await runEnrichment(opts)
}

main().catch((err) => {
  console.error("Fatal error:", err)
  process.exit(1)
})
