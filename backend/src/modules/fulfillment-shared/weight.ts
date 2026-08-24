import { fetchVariantWeights } from "../fulfillment-fan-courier/lib/variant-weights"

export const DEFAULT_ITEM_WEIGHT_G = 1000

export type ShippingContextItem = {
  quantity: number
  variant_id?: string | null
  variant?: { weight?: number | null } | null
  unit_price?: number | string | null
  subtotal?: number | string | null
}

export async function computeTotalWeightKg(
  items: ShippingContextItem[],
  onLookupError?: (error: Error) => void
): Promise<number> {
  const ids = items
    .filter((item) => typeof item.variant?.weight !== "number" && item.variant_id)
    .map((item) => item.variant_id as string)

  let storedWeights = new Map<string, number>()
  if (ids.length) {
    try {
      storedWeights = await fetchVariantWeights(ids)
    } catch (error) {
      onLookupError?.(error as Error)
    }
  }

  return items.reduce((grams, item) => {
    const weight = typeof item.variant?.weight === "number"
      ? item.variant.weight
      : (item.variant_id ? storedWeights.get(item.variant_id) : undefined) ?? DEFAULT_ITEM_WEIGHT_G
    return grams + weight * (item.quantity || 0)
  }, 0) / 1000
}

export function getItemsTotalRon(items: ShippingContextItem[]): number {
  return items.reduce((sum, item) => {
    const subtotal = item.subtotal == null ? 0 : Number(item.subtotal)
    if (subtotal > 0) return sum + subtotal
    return sum + (item.unit_price == null ? 0 : Number(item.unit_price)) * (item.quantity || 0)
  }, 0)
}

