import type { HttpTypes } from "@medusajs/types"

/**
 * Formats a minor-unit RON amount to Romanian locale string.
 * 103200 => "1.032,00 RON", 11500 => "115,00 RON"
 */
export function formatPrice(amount: number, currencyCode = "ron"): string {
  const value = amount / 100

  // Romanian format: thousands separator = ".", decimal separator = ","
  const parts = value.toFixed(2).split(".")
  const intPart = parts[0]
  const decPart = parts[1]

  // Insert "." as thousands separator
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".")

  const upper = currencyCode.toUpperCase()
  return `${intFormatted},${decPart} ${upper}`
}

/**
 * Returns the minimum calculated_amount across all variants that have a
 * non-null calculated_price. Returns null if none exist.
 */
export function getProductMinPrice(
  product: HttpTypes.StoreProduct
): number | null {
  const variants = product.variants
  if (!variants || variants.length === 0) return null

  let min: number | null = null
  for (const variant of variants) {
    const cp = (variant as HttpTypes.StoreProductVariant & {
      calculated_price?: { calculated_amount: number | null } | null
    }).calculated_price

    if (cp == null) continue
    const amount = cp.calculated_amount
    if (amount == null) continue
    if (min === null || amount < min) {
      min = amount
    }
  }
  return min
}
