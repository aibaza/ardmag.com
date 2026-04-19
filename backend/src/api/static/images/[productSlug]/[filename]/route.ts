import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import * as path from "path"
import * as fs from "fs"

// After running scripts/optimize-images.sh, originals are copied here
const IMAGES_DIR = path.join(process.cwd(), "static", "images")
// Fallback to resources/images/ during migration (before script is run)
const FALLBACK_DIR = path.join(process.cwd(), "..", "resources", "images")

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { productSlug, filename } = req.params as { productSlug: string; filename: string }

  let filePath = path.join(IMAGES_DIR, productSlug, filename)
  if (!filePath.startsWith(IMAGES_DIR)) return res.status(403).end()

  if (!fs.existsSync(filePath)) {
    const fallback = path.join(FALLBACK_DIR, productSlug, filename)
    if (!fallback.startsWith(FALLBACK_DIR) || !fs.existsSync(fallback)) {
      return res.status(404).end()
    }
    filePath = fallback
  }

  res.setHeader("Cache-Control", "public, max-age=31536000, immutable")
  res.sendFile(filePath)
}
