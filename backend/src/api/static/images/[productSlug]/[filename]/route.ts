import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import * as path from "path"
import * as fs from "fs"

const IMAGES_DIR = path.join(process.cwd(), "..", "resources", "images")

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { productSlug, filename } = req.params as { productSlug: string; filename: string }

  const filePath = path.join(IMAGES_DIR, productSlug, filename)
  if (!filePath.startsWith(IMAGES_DIR)) return res.status(403).end()
  if (!fs.existsSync(filePath)) return res.status(404).end()

  res.sendFile(filePath)
}
