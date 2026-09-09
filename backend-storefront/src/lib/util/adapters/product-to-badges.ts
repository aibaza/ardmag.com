import type { HttpTypes } from "@medusajs/types"

type BadgeType = "promo" | "new" | "stock-low" | "custom"

interface Badge {
  type: BadgeType
  label: string
  dotVariant?: boolean
}

type VariantWithCalcPrice = HttpTypes.StoreProductVariant & {
  calculated_price?: {
    calculated_amount: number | null
    original_amount?: number | null
  } | null
  inventory_quantity?: number | null
}

/**
 * Derives display badges from a StoreProduct.
 *
 * Rules:
 * - Any variant with original_amount > calculated_amount => {type:"promo", label:"-X%"} (real price list discount)
 * - An out-of-stock product does not receive a low-stock badge; its PDP stock
 *   status is the authoritative availability message.
 */
export function productToBadges(product: HttpTypes.StoreProduct): Badge[] {
  const badges: Badge[] = []
  const variants = (product.variants ?? []) as VariantWithCalcPrice[]

  // Detect real price list discount from calculated_price
  let maxDiscountPct = 0
  for (const v of variants) {
    const cp = v.calculated_price
    if (!cp) continue
    const calc = cp.calculated_amount
    const orig = cp.original_amount
    if (calc == null || orig == null || orig <= calc) continue
    const pct = Math.round((1 - calc / orig) * 100)
    if (pct > maxDiscountPct) maxDiscountPct = pct
  }

  if (maxDiscountPct > 0) {
    badges.push({ type: "promo", label: `-${maxDiscountPct}%` })
  }

  return badges
}
