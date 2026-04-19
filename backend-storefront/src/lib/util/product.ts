import { HttpTypes } from "@medusajs/types";

export const isSimpleProduct = (product: HttpTypes.StoreProduct): boolean => {
    return product.options?.length === 1 && product.options[0].values?.length === 1;
}

export function isProductOutOfStock(product: HttpTypes.StoreProduct): boolean {
  const variants = product.variants ?? []
  if (variants.length === 0) return false
  return variants.every((v) => (v.inventory_quantity ?? 0) === 0)
}

export function getProductSpecsPreview(
  product: HttpTypes.StoreProduct,
  max: number,
  activeFilters?: Record<string, string[]>
): string[] {
  return (product.options ?? [])
    .filter((o) => o.title !== "Title")
    .slice(0, max)
    .map((o) => {
      const titleKey = o.title?.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_").replace(/[^A-Z0-9_]/g, "") ?? ""
      const activeVals = activeFilters?.[titleKey]
      const allVals = (o.values ?? []).map((v) => v.value ?? "").filter(Boolean)
      let display: string
      if (activeVals?.length) {
        display = activeVals.join(", ")
      } else if (allVals.length <= 2) {
        display = allVals.join(", ")
      } else {
        display = `${allVals.slice(0, 2).join(", ")} +${allVals.length - 2}`
      }
      return `${o.title?.toUpperCase() ?? ""}: ${display}`
    })
}