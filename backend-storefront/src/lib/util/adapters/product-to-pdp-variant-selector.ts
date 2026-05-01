import type { HttpTypes } from "@medusajs/types"

interface VariantOption {
  label: string
  variantId: string
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
  calculated_price?: {
    calculated_amount: number | null
    original_amount?: number | null
  } | null
  inventory_quantity?: number | null
}

// Cauta varianta care pastreaza cat mai multe optiuni din activeVariant,
// dar schimba dimensiunea specificata la noua valoare.
function bestMatchingVariant(
  candidates: VariantWithCalcPrice[],
  activeVariant: VariantWithCalcPrice,
  changedDimension: string
): VariantWithCalcPrice {
  const activeOpts = new Map(
    (activeVariant.options ?? [])
      .filter((o) => o.option?.title !== changedDimension)
      .map((o) => [o.option?.title, o.value])
  )
  let best = candidates[0]
  let bestScore = -1
  for (const v of candidates) {
    let score = 0
    for (const [dim, val] of activeOpts) {
      if ((v.options ?? []).some((o) => o.option?.title === dim && o.value === val)) score++
    }
    if (score > bestScore) { bestScore = score; best = v }
  }
  return best
}

function isOutOfStock(variant: VariantWithCalcPrice): boolean {
  return variant.manage_inventory === true && variant.inventory_quantity === 0
}

function variantDiscountLabel(variant: VariantWithCalcPrice): string | undefined {
  const cp = variant.calculated_price
  if (!cp) return undefined
  const calc = cp.calculated_amount
  const orig = cp.original_amount
  if (calc == null || orig == null || orig <= calc) return undefined
  const pct = Math.round((1 - calc / orig) * 100)
  return pct > 0 ? `-${pct}%` : undefined
}

/**
 * Converts a StoreProduct into VariantGroup[] for PDPVariantSelector.
 *
 * - Returns [] if product has a single variant with no meaningful options.
 * - Groups variants by option dimension (option.title).
 * - Marks active option value for selectedVariantId (or first variant).
 * - Marks unavailable if ALL variants sharing that option value are out of stock.
 * - Shows discount label derived from real calculated_price discount (original > calculated).
 */
export function productToPdpVariantSelector(
  product: HttpTypes.StoreProduct,
  selectedVariantId?: string
): VariantGroup[] {
  const variants = (product.variants ?? []) as VariantWithCalcPrice[]

  if (variants.length <= 1) {
    const singleVariant = variants[0]
    if (!singleVariant) return []
    const opts = singleVariant.options ?? []
    if (opts.length === 0) return []
    // Medusa placeholder for products without real options
    const isDefaultPlaceholder =
      opts.length === 1 &&
      opts[0].option?.title === "Title" &&
      opts[0].value === "Default Title"
    if (isDefaultPlaceholder) return []
  }

  const activeVariant =
    variants.find((v) => v.id === selectedVariantId) ?? variants[0]

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

    const activeOptValue =
      activeVariant.options?.find((o) => o.option?.title === dimensionTitle)
        ?.value ?? values[0]

    const options: VariantOption[] = values.map((value) => {
      const variantsWithValue = variants.filter((v) =>
        (v.options ?? []).some(
          (o) => o.option?.title === dimensionTitle && o.value === value
        )
      )

      const unavailable =
        variantsWithValue.length > 0 &&
        variantsWithValue.every((v) => isOutOfStock(v))

      const firstMatchingVariant = variantsWithValue.length > 0
        ? bestMatchingVariant(variantsWithValue, activeVariant, dimensionTitle)
        : undefined
      const variantId = firstMatchingVariant?.id ?? variants[0]?.id ?? ""
      const discount = firstMatchingVariant
        ? variantDiscountLabel(firstMatchingVariant)
        : undefined

      const option: VariantOption = { label: value, variantId }
      if (value === activeOptValue) option.active = true
      if (unavailable) option.unavailable = true
      if (discount) option.discount = discount

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
