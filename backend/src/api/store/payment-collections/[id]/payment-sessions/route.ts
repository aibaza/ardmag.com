import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import path from "path"
import {
  getCartIdForPaymentCollection,
  getCartPolicyState,
  policyError,
} from "../../../../utils/delivery-payment-cart"

const { POST: medusaCreatePaymentSession } = require(path.join(
  process.cwd(), "node_modules", "@medusajs", "medusa", "dist", "api", "store",
  "payment-collections", "[id]", "payment-sessions", "route.js"
))

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const cartId = await getCartIdForPaymentCollection(req, req.params.id)
  if (!cartId) return res.status(404).json({ message: "Cosul asociat platii nu a fost gasit." })

  const state = await getCartPolicyState(req, cartId)
  const error = policyError(state, (req.body as { provider_id?: string }).provider_id)
  if (error) return res.status(400).json({ message: error })

  return medusaCreatePaymentSession(req as any, res as any)
}

