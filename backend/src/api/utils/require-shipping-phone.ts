import type { Request, Response, NextFunction } from "express"

export const SHIPPING_PHONE_REQUIRED_MESSAGE =
  "Telefonul de livrare este obligatoriu."

export function hasShippingPhone(address?: { phone?: unknown } | null): boolean {
  return typeof address?.phone === "string" && address.phone.trim().length > 0
}

export function requiresShippingPhoneError(body: unknown): string | null {
  if (!body || typeof body !== "object") return null
  if (!Object.prototype.hasOwnProperty.call(body, "shipping_address")) return null

  const shippingAddress = (body as { shipping_address?: unknown }).shipping_address
  if (shippingAddress && typeof shippingAddress === "object" && hasShippingPhone(shippingAddress as any)) {
    return null
  }

  return SHIPPING_PHONE_REQUIRED_MESSAGE
}

function isStoreCartUpdatePath(req: Request): boolean {
  const path = (req.originalUrl || req.path || "").split("?")[0]

  return /^\/store\/carts\/[^/]+\/?$/.test(path)
}

export function requireShippingPhoneOnCartUpdate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.method !== "POST") return next()
  if (!isStoreCartUpdatePath(req)) return next()

  const error = requiresShippingPhoneError(req.body)
  if (!error) return next()

  return res.status(400).json({ message: error })
}
