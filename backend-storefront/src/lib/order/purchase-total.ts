export const ORDER_SUMMARY_FIELD = "+summary"

export type OrderWithCanonicalTotal = {
  total?: unknown
  summary?: { current_order_total?: unknown } | null
}

function finiteNumber(value: unknown): number | undefined {
  if (value == null || value === "") return undefined
  const number = Number(value)
  return Number.isFinite(number) ? number : undefined
}

export function getCanonicalOrderTotal(order: OrderWithCanonicalTotal): number {
  return finiteNumber(order.summary?.current_order_total) ?? finiteNumber(order.total) ?? 0
}
