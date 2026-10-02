export const SOLIDO_1L_VARIANTS = [
  "variant_01KPH3PYSJY1G8S1KE2G9SA8MB",
  "variant_01KPH3PYSKFPXZ81T31FZJ9VE1",
  "variant_01KPH3PYSJP6GAXGY3XEVE55V0",
  "variant_01KZ73H3215CZ0RK5MVDQ88Y9A",
] as const
export const TENAX_QUANTITY_ATTRIBUTE = "ardmag_tenax_solido_1l_quantity"
export const TENAX_START = "2026-09-30T21:00:00.000Z"
export const TENAX_END = "2026-12-31T22:00:00.000Z"

const eligible = new Set<string>(SOLIDO_1L_VARIANTS)
export function solidoQuantity(items: Array<{ variant_id?: string | null; quantity?: unknown }>): number {
  return items.reduce((sum, item) => {
    const quantity = Number(item.quantity)
    return eligible.has(item.variant_id ?? "") && Number.isSafeInteger(quantity) && quantity > 0
      ? sum + quantity : sum
  }, 0)
}

export function assertTenaxEnvironment(environment: string | undefined): void {
  if (!["c47689f6-eaf2-48ac-8eae-bdcf11e7c27c", "7f5d3fcc-e6f7-4196-8dd5-20c28faf3ee7"].includes(environment ?? "")) {
    throw new Error("Tenax extension restricted to verified ARDmag environments")
  }
}
