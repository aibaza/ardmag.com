import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import path from "path"
import { getCartPolicyState, policyError } from "../../../../utils/delivery-payment-cart"

const { POST: medusaCompleteCart } = require(path.join(
  process.cwd(), "node_modules", "@medusajs", "medusa", "dist", "api", "store",
  "carts", "[id]", "complete", "route.js"
))

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const state = await getCartPolicyState(req, req.params.id)
  const error = policyError(state)
  if (error) return res.status(400).json({ message: error })

  return medusaCompleteCart(req as any, res as any)
}
