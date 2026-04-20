import type { HttpTypes } from "@medusajs/types"
import { getProductMinPrice } from "./format-price"

const FILTER_LABELS: Record<string, string> = {
  "tenax": "Tenax", "sait": "Sait", "woosuk": "Woosuk", "diatex": "Diatex",
  "delta-research": "Delta Research", "vbt": "VBT", "fox-ironstone": "Fox Ironstone",
  "granit": "Granit", "marmura": "Marmură", "beton": "Beton", "beton-armat": "Beton armat",
  "ceramica": "Ceramică", "travertin": "Travertin", "cuart": "Cuarț", "andezit": "Andezit",
  "piatra-naturala": "Piatră naturală", "universal": "Universal",
}

export interface ActiveFilter {
  label: string
  paramKey: "brand" | "material" | "price"
  value?: string
}

export interface CheckboxOption {
  label: string
  value: string
  count?: number
  checked?: boolean
}

export type FilterGroup =
  | {
      type: "checkboxes"
      title: string
      paramKey: "brand" | "material"
      badge?: string
      open?: boolean
      options: CheckboxOption[]
    }
  | {
      type: "swatches"
      title: string
      badge?: string
      open?: boolean
      options: Array<{ label: string; active?: boolean }>
    }
  | {
      type: "price-range"
      title: string
      badge?: string
      open?: boolean
      min: number
      max: number
    }

interface ActiveFilters {
  brands?: string[]
  materials?: string[]
}

/**
 * Capitalizes a slug: "tenax" => "Tenax", "delta-research" => "Delta Research"
 */
function labelForSlug(slug: string): string {
  return FILTER_LABELS[slug] ?? slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
}

/**
 * Builds filter groups for the FilterSidebar from a list of products.
 *
 * Groups:
 * 1. Brand (checkboxes) - from "brand:*" tags, sorted by count desc
 * 2. Material (checkboxes) - from "material:*" tags, sorted by count desc
 * 3. Price range - min/max from getProductMinPrice across all products
 *
 * Only includes groups with >= 1 option.
 */
export function productsToFilterGroups(
  products: HttpTypes.StoreProduct[],
  activeFilters?: ActiveFilters
): FilterGroup[] {
  const brandCounts = new Map<string, number>()
  const materialCounts = new Map<string, number>()

  for (const product of products) {
    const tags = product.tags ?? []
    const seenBrands = new Set<string>()
    const seenMaterials = new Set<string>()

    for (const tag of tags) {
      if (tag.value.startsWith("brand:")) {
        const slug = tag.value.slice("brand:".length)
        if (!seenBrands.has(slug)) {
          seenBrands.add(slug)
          brandCounts.set(slug, (brandCounts.get(slug) ?? 0) + 1)
        }
      } else if (tag.value.startsWith("material:")) {
        const slug = tag.value.slice("material:".length)
        if (!seenMaterials.has(slug)) {
          seenMaterials.add(slug)
          materialCounts.set(slug, (materialCounts.get(slug) ?? 0) + 1)
        }
      }
    }
  }

  const groups: FilterGroup[] = []

  // Brand group
  if (brandCounts.size > 0) {
    const brandOptions: CheckboxOption[] = Array.from(brandCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([slug, count]) => ({
        label: labelForSlug(slug),
        value: slug,
        count,
        checked: activeFilters?.brands?.includes(slug) ?? false,
      }))

    groups.push({
      type: "checkboxes",
      title: "Brand",
      paramKey: "brand",
      open: true,
      options: brandOptions,
    })
  }

  // Material group
  if (materialCounts.size > 0) {
    const materialOptions: CheckboxOption[] = Array.from(
      materialCounts.entries()
    )
      .sort((a, b) => b[1] - a[1])
      .map(([slug, count]) => ({
        label: labelForSlug(slug),
        value: slug,
        count,
        checked: activeFilters?.materials?.includes(slug) ?? false,
      }))

    groups.push({
      type: "checkboxes",
      title: "Material",
      paramKey: "material",
      open: true,
      options: materialOptions,
    })
  }

  // Price range group
  let priceMin: number | null = null
  let priceMax: number | null = null

  for (const product of products) {
    const minPrice = getProductMinPrice(product)
    if (minPrice === null) continue
    if (priceMin === null || minPrice < priceMin) priceMin = minPrice
    if (priceMax === null || minPrice > priceMax) priceMax = minPrice
  }

  if (priceMin !== null && priceMax !== null) {
    groups.push({
      type: "price-range",
      title: "Preț",
      open: true,
      min: Math.floor(priceMin / 100),
      max: Math.ceil(priceMax / 100),
    })
  }

  return groups
}
