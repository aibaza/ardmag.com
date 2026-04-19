import type { HttpTypes } from "@medusajs/types"

type BadgeType = "promo" | "new" | "stock-low" | "custom"

interface Badge {
  type: BadgeType
  label: string
  dotVariant?: boolean
}

/**
 * Derives display badges from a StoreProduct.
 *
 * Rules:
 * - tag "promo:30" OR metadata.ribbon contains "PROMO" => {type: "promo", label: "-30%"}
 * - ALL variants have inventory_quantity = 0 AND manage_inventory = true => {type: "stock-low", label: "Stoc limitat"}
 */
export function productToBadges(product: HttpTypes.StoreProduct): Badge[] {
  const badges: Badge[] = []

  const tags = product.tags ?? []
  const metadata = product.metadata ?? {}

  const hasPromoTag = tags.some((t) => t.value === "promo:30")
  const ribbonValue =
    typeof metadata["ribbon"] === "string" ? metadata["ribbon"] : ""
  const hasPromoRibbon = ribbonValue.includes("PROMO")

  if (hasPromoTag || hasPromoRibbon) {
    badges.push({ type: "promo", label: "-30%" })
  }

  const variants = product.variants ?? []
  if (variants.length > 0) {
    const allOutOfStock = variants.every((v) => {
      const managed = v.manage_inventory === true
      const qty = (v as HttpTypes.StoreProductVariant & {
        inventory_quantity?: number | null
      }).inventory_quantity
      return managed && qty === 0
    })
    if (allOutOfStock) {
      badges.push({ type: "stock-low", label: "Stoc limitat" })
    }
  }

  return badges
}
