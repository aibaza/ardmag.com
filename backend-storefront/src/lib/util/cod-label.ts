import { HttpTypes } from "@medusajs/types"

type CartLike = Pick<HttpTypes.StoreCart, "shipping_methods"> | null | undefined

export function isPickupCart(cart: CartLike): boolean {
  const name = cart?.shipping_methods?.[0]?.name ?? ""
  return /ridicare|pickup/i.test(name)
}

// Plata la ramburs: la ridicarea personală se plătește la sediu, nu curierului.
export function codLabel(cart: CartLike): string {
  return isPickupCart(cart) ? "Plata la ridicare" : "Ramburs la livrare"
}
