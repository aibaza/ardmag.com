import type { HttpTypes } from "@medusajs/types"

export const SHIPPING_PHONE_REQUIRED_MESSAGE =
  "Telefonul de livrare este obligatoriu."

export function hasShippingPhone(
  address?: Pick<HttpTypes.StoreCartAddress, "phone"> | null
): boolean {
  return typeof address?.phone === "string" && address.phone.trim().length > 0
}

export function assertShippingPhone(
  address?: Pick<HttpTypes.StoreCartAddress, "phone"> | null
) {
  if (!hasShippingPhone(address)) {
    throw new Error(SHIPPING_PHONE_REQUIRED_MESSAGE)
  }
}
