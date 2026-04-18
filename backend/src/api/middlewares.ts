import { defineMiddlewares } from "@medusajs/framework/http"
import * as fs from "fs"
import * as path from "path"
import type { Request, Response, NextFunction } from "express"

const IMAGES_DIR = path.join(process.cwd(), "..", "resources", "images")
const STATIC_PREFIX = "/static/images/"

function serveStaticImages(req: Request, res: Response, next: NextFunction) {
  const relative = req.path.slice(STATIC_PREFIX.length)
  const filePath = path.join(IMAGES_DIR, relative)
  if (!filePath.startsWith(IMAGES_DIR)) return res.status(403).end()
  if (!fs.existsSync(filePath)) return res.status(404).end()
  res.sendFile(filePath)
}

export default defineMiddlewares({
  routes: [
    {
      matcher: "/static/images/**",
      middlewares: [serveStaticImages],
    },
  ],
})
