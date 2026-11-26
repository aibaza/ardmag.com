import { HttpTypes } from "@medusajs/types";

export const isSimpleProduct = (product: HttpTypes.StoreProduct): boolean => {
    return product.options?.length === 1 && product.options[0].values?.length === 1;
}

type StockFields = Pick<
  HttpTypes.StoreProductVariant,
  "manage_inventory" | "allow_backorder" | "inventory_quantity"
>

// Store API-ul intoarce inventory_quantity doar pentru variantele cu stoc urmarit;
// la cele neurmarite lipseste (null/undefined) si nu inseamna stoc 0.
export function isVariantInStock(variant: Partial<StockFields> | null | undefined): boolean {
  if (!variant) return false
  if (variant.manage_inventory !== true) return true
  if (variant.allow_backorder === true) return true
  return (variant.inventory_quantity ?? 0) > 0
}

export function isProductOutOfStock(product: HttpTypes.StoreProduct): boolean {
  const variants = product.variants ?? []
  if (variants.length === 0) return false
  return !variants.some((v) => isVariantInStock(v))
}

// Fara v_id, PDP-ul porneste pe prima varianta disponibila, ca un produs cu
// variante in stoc sa nu se deschida pe o varianta epuizata.
export function pickPdpVariant<T extends Partial<StockFields> & { id?: string }>(
  variants: T[],
  selectedVariantId?: string
): T | undefined {
  if (selectedVariantId) {
    const match = variants.find((v) => v.id === selectedVariantId)
    if (match) return match
  }
  return variants.find((v) => isVariantInStock(v)) ?? variants[0]
}

export function getPdpStockLabel(
  variants: Array<Partial<StockFields>>,
  selectedVariant?: Partial<StockFields> | null
): { label: string; location: string } {
  const available = { label: "Disponibil", location: "Cluj-Napoca" }
  const soldOut = { label: "Stoc epuizat", location: "" }

  if (!selectedVariant) {
    if (variants.length > 0 && !variants.some((v) => isVariantInStock(v))) return soldOut
    return available
  }
  if (!isVariantInStock(selectedVariant)) return soldOut
  if (selectedVariant.manage_inventory === true && (selectedVariant.inventory_quantity ?? 0) > 0) {
    return { label: "In stoc", location: "Cluj-Napoca" }
  }
  return available
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
// Varianta se comanda numai telefonic (metadata.contact_to_order setat din admin):
// fara adaugare in cos pe card, pe PDP si in addToCart.
export function isContactToOrderVariant(
  variant: { metadata?: Record<string, unknown> | null } | null | undefined
): boolean {
  return variant?.metadata?.contact_to_order === true
}

// Unitatea la care se refera pretul (product.metadata.unit_label, ex. "kg").
// undefined cand produsul se vinde la bucata.
export function productUnitLabel(
  product: { metadata?: Record<string, unknown> | null } | null | undefined
): string | undefined {
  const raw = product?.metadata?.unit_label
  if (typeof raw !== "string") return undefined
  const unit = raw.trim()
  return unit.length > 0 ? unit : undefined
}
