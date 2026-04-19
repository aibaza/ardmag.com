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
 * - Fallback: metadata.ribbon contains "PROMO" => {type:"promo", label:"-30%"} (legacy decorative)
 * - ALL variants have inventory_quantity = 0 AND manage_inventory = true => {type:"stock-low", label:"Stoc limitat"}
 */
export function productToBadges(product: HttpTypes.StoreProduct): Badge[] {
  const badges: Badge[] = []
  const variants = (product.variants ?? []) as VariantWithCalcPrice[]
  const metadata = product.metadata ?? {}

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
  } else {
    // Legacy fallback: ribbon metadata (cosmetic, no real price difference)
    const ribbonValue =
      typeof metadata["ribbon"] === "string" ? metadata["ribbon"] : ""
    if (ribbonValue.includes("PROMO")) {
      badges.push({ type: "promo", label: "-30%" })
    }
  }

  // Stock-low badge
  if (variants.length > 0) {
    const allOutOfStock = variants.every((v) => {
      return v.manage_inventory === true && v.inventory_quantity === 0
    })
    if (allOutOfStock) {
      badges.push({ type: "stock-low", label: "Stoc limitat" })
    }
  }

  return badges
}
