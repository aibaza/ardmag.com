const DEFAULT_WEIGHT_G = 1000

export function totalWeightGrams(items: Array<{ quantity: number; variant?: { weight?: number | null } | null }> = []): number {
  return items.reduce((sum, item) => {
    const w = item.variant?.weight ?? DEFAULT_WEIGHT_G
    return sum + w * item.quantity
  }, 0)
}
