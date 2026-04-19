import type { HttpTypes } from "@medusajs/types"

interface VariantOption {
  label: string
  active?: boolean
  unavailable?: boolean
  discount?: string
}

interface VariantGroup {
  title: string
  selectedValue: string
  options: VariantOption[]
}

type VariantWithCalcPrice = HttpTypes.StoreProductVariant & {
  calculated_price?: { calculated_amount: number | null } | null
  inventory_quantity?: number | null
}

/**
 * Returns true if a variant is considered out of stock.
 * Only applies when manage_inventory = true AND inventory_quantity = 0.
 */
function isOutOfStock(variant: VariantWithCalcPrice): boolean {
  return variant.manage_inventory === true && variant.inventory_quantity === 0
}

/**
 * Converts a StoreProduct into VariantGroup[] for PDPVariantSelector.
 *
 * - Returns [] if product has a single variant with no meaningful options.
 * - Groups variants by option dimension (option.title).
 * - Marks active option value for selectedVariantId (or first variant).
 * - Marks unavailable if ALL variants sharing that option value are out of stock.
 * - Shows discount "-30%" if product has promo:30 tag.
 */
export function productToPdpVariantSelector(
  product: HttpTypes.StoreProduct,
  selectedVariantId?: string
): VariantGroup[] {
  const variants = (product.variants ?? []) as VariantWithCalcPrice[]

  // Single variant with no options => default variant, return []
  if (variants.length <= 1) {
    const singleVariant = variants[0]
    if (!singleVariant) return []
    const opts = singleVariant.options ?? []
    if (opts.length === 0) return []
  }

  const hasPromo = (product.tags ?? []).some((t) => t.value === "promo:30")

  // Determine the active variant
  const activeVariant =
    variants.find((v) => v.id === selectedVariantId) ?? variants[0]

  // Collect all unique option dimensions in the order they first appear
  const dimensionOrder: string[] = []
  const dimensionMap = new Map<string, Set<string>>()

  for (const variant of variants) {
    for (const opt of variant.options ?? []) {
      const title = opt.option?.title
      const value = opt.value
      if (!title || value === undefined) continue
      if (!dimensionMap.has(title)) {
        dimensionMap.set(title, new Set())
        dimensionOrder.push(title)
      }
      dimensionMap.get(title)!.add(value)
    }
  }

  if (dimensionOrder.length === 0) return []

  const groups: VariantGroup[] = []

  for (const dimensionTitle of dimensionOrder) {
    const values = Array.from(dimensionMap.get(dimensionTitle)!)

    // Determine the selected value for this dimension from the active variant
    const activeOptValue =
      activeVariant.options?.find((o) => o.option?.title === dimensionTitle)
        ?.value ?? values[0]

    const options: VariantOption[] = values.map((value) => {
      // All variants that have this value for this dimension
      const variantsWithValue = variants.filter((v) =>
        (v.options ?? []).some(
          (o) => o.option?.title === dimensionTitle && o.value === value
        )
      )

      const unavailable =
        variantsWithValue.length > 0 &&
        variantsWithValue.every((v) => isOutOfStock(v))

      const option: VariantOption = { label: value }
      if (value === activeOptValue) option.active = true
      if (unavailable) option.unavailable = true
      if (hasPromo) option.discount = "-30%"

      return option
    })

    groups.push({
      title: dimensionTitle,
      selectedValue: activeOptValue,
      options,
    })
  }

  return groups
}
