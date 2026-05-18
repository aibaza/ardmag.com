import type { HttpTypes } from "@medusajs/types"

/**
 * Formats a raw decimal RON amount to Romanian locale string.
 * 1032 => "1.032,00 Lei", 115 => "115,00 Lei"
 * For currency_code "ron" the display is "Lei" (consumer-facing); for any
 * other currency the ISO code is shown uppercase.
 */
export function formatPrice(amount: number, currencyCode = "ron"): string {
  // Romanian format: thousands separator = ".", decimal separator = ","
  const parts = amount.toFixed(2).split(".")
  const intPart = parts[0]
  const decPart = parts[1]

  // Insert "." as thousands separator
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".")

  const label = currencyCode.toLowerCase() === "ron" ? "Lei" : currencyCode.toUpperCase()
  return `${intFormatted},${decPart} ${label}`
}

type VariantWithPrice = HttpTypes.StoreProductVariant & {
  calculated_price?: {
    calculated_amount: number | null
    original_amount?: number | null
  } | null
}

/**
 * Returns the minimum calculated_amount across all variants that have a
 * non-null calculated_price. Returns null if none exist.
 */
export function getProductMinPrice(
  product: HttpTypes.StoreProduct
): number | null {
  const result = getProductMinPriceWithOriginal(product)
  return result?.calculated ?? null
}

/**
 * Returns the calculated and original amounts for the variant with the
 * lowest calculated_amount. Returns null if no variant has a price.
 * original falls back to calculated when the API does not return original_amount.
 */
export function getProductMinPriceWithOriginal(
  product: HttpTypes.StoreProduct
): { calculated: number; original: number } | null {
  const variants = product.variants
  if (!variants || variants.length === 0) return null

  let result: { calculated: number; original: number } | null = null
  for (const variant of variants) {
    const cp = (variant as VariantWithPrice).calculated_price
    if (cp == null) continue
    const amount = cp.calculated_amount
    if (amount == null) continue
    if (result === null || amount < result.calculated) {
      result = {
        calculated: amount,
        original: cp.original_amount ?? amount,
      }
    }
  }
  return result
}
