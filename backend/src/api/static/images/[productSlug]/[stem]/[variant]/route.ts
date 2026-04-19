import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import * as path from "path"
import * as fs from "fs"

const IMAGES_DIR = path.join(process.cwd(), "static", "images")

const MIME: Record<string, string> = {
  avif: "image/avif",
  webp: "image/webp",
  jpg:  "image/jpeg",
  jpeg: "image/jpeg",
  png:  "image/png",
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { productSlug, stem, variant } = req.params as {
    productSlug: string
    stem: string
    variant: string
  }

  const filePath = path.join(IMAGES_DIR, productSlug, stem, variant)
  if (!filePath.startsWith(IMAGES_DIR)) return res.status(403).end()
  if (!fs.existsSync(filePath)) return res.status(404).end()

  const ext = path.extname(variant).slice(1).toLowerCase()
  const mime = MIME[ext]
  if (mime) res.setHeader("Content-Type", mime)
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable")

  res.sendFile(filePath)
}
