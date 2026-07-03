import { validateAndTransformBody, validateAndTransformQuery } from "@medusajs/framework"
import type {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import path from "path"
import { requiresShippingPhoneError } from "../../../utils/require-shipping-phone"

const medusaStoreCartsPath = path.join(
  process.cwd(),
  "node_modules",
  "@medusajs",
  "medusa",
  "dist",
  "api",
  "store",
  "carts"
)

const { GET: medusaGetCart, POST: medusaUpdateCart } = require(path.join(
  medusaStoreCartsPath,
  "[id]",
  "route.js"
))
const { retrieveTransformQueryConfig } = require(path.join(
  medusaStoreCartsPath,
  "query-config.js"
))
const { StoreGetCartsCart, StoreUpdateCart } = require(path.join(
  medusaStoreCartsPath,
  "validators.js"
))

async function runMedusaMiddleware(
  middleware: (
    req: MedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
  ) => unknown,
  req: MedusaRequest,
  res: MedusaResponse
) {
  await new Promise<void>((resolve, reject) => {
    middleware(req, res, (error?: unknown) => {
      if (error) return reject(error)
      resolve()
    })
  })
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  await runMedusaMiddleware(
    validateAndTransformQuery(StoreGetCartsCart, retrieveTransformQueryConfig),
    req,
    res
  )

  return medusaGetCart(req as any, res as any)
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const error = requiresShippingPhoneError(req.body)
  if (error) {
    return res.status(400).json({ message: error })
  }

  await runMedusaMiddleware(validateAndTransformBody(StoreUpdateCart), req, res)
  await runMedusaMiddleware(
    validateAndTransformQuery(StoreGetCartsCart, retrieveTransformQueryConfig),
    req,
    res
  )

  return medusaUpdateCart(req as any, res as any)
}
