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
  max: number
): string[] {
  return (product.options ?? [])
    .filter((o) => o.title !== "Title")
    .slice(0, max)
    .map((o) => {
      const firstValue = o.values?.[0]?.value ?? ""
      return `${o.title?.toUpperCase() ?? ""}: ${firstValue}`
    })
}