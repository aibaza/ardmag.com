import { HttpTypes } from "@medusajs/types"

/** URL param key prefix for option filters */
export const FILTER_PREFIX = "f_"

/** Normalize option title to a URL-safe key: "TIP PIATRĂ" -> "TIP_PIATRA" */
export function optionTitleToKey(title: string): string {
  return title
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^A-Z0-9_]/g, "")
}

/** Reverse: URL key back to display label (best-effort) */
export function keyToLabel(key: string): string {
  return key.replace(/_/g, " ")
}

export interface OptionGroup {
  title: string
  key: string
  values: string[]
}

/** Extract unique option groups from a list of products */
export function extractOptionGroups(
  products: HttpTypes.StoreProduct[]
): OptionGroup[] {
  const map = new Map<string, Set<string>>()

  for (const product of products) {
    for (const opt of product.options ?? []) {
      const title = opt.title ?? ""
      if (!map.has(title)) map.set(title, new Set())
      for (const v of opt.values ?? []) {
        if (v.value) map.get(title)!.add(v.value)
      }
    }
  }

  return Array.from(map.entries())
    .filter(([, vals]) => vals.size > 1) // single-value options are not useful as filters
    .map(([title, vals]) => ({
      title,
      key: optionTitleToKey(title),
      values: Array.from(vals).sort((a, b) => {
        // sort numerically if both are numbers, else alphabetically
        const na = parseFloat(a)
        const nb = parseFloat(b)
        if (!isNaN(na) && !isNaN(nb)) return na - nb
        return a.localeCompare(b, "ro")
      }),
    }))
}

/** Parse active filters from Next.js searchParams */
export function parseActiveFilters(
  searchParams: Record<string, string | string[] | undefined>
): Record<string, string[]> {
  const active: Record<string, string[]> = {}

  for (const [key, raw] of Object.entries(searchParams)) {
    if (!key.startsWith(FILTER_PREFIX)) continue
    const optKey = key.slice(FILTER_PREFIX.length)
    const value = Array.isArray(raw) ? raw[0] : raw
    if (!value) continue
    active[optKey] = value.split(",").filter(Boolean)
  }

  return active
}

/** Filter products against active filters (OR within group, AND across groups) */
export function applyFilters(
  products: HttpTypes.StoreProduct[],
  activeFilters: Record<string, string[]>
): HttpTypes.StoreProduct[] {
  if (Object.keys(activeFilters).length === 0) return products

  return products.filter((product) => {
    // build a map of option title key -> set of values this product supports
    const productOpts = new Map<string, Set<string>>()
    for (const opt of product.options ?? []) {
      const key = optionTitleToKey(opt.title ?? "")
      const vals = new Set((opt.values ?? []).map((v) => v.value ?? ""))
      productOpts.set(key, vals)
    }

    // every active filter group must have at least one matching value
    for (const [filterKey, selectedVals] of Object.entries(activeFilters)) {
      const productVals = productOpts.get(filterKey)
      if (!productVals) return false
      const hasMatch = selectedVals.some((v) => productVals.has(v))
      if (!hasMatch) return false
    }

    return true
  })
}
