import { formatPrice } from "./tokens"
import { getCanonicalOrderTotal } from "../../../lib/order-total"

export type OrderShippingSummary = {
  name: string
  amount: number | null
  costLabel: string
  isPickup: boolean
  itemsTotal: number | null
}

function finiteNumber(value: unknown): number | undefined {
  if (value == null || value === "") return undefined
  const number = Number(value)
  return Number.isFinite(number) ? number : undefined
}

// Costul vine din shipping_methods[].amount (coloana salvata pe comanda; Fan Courier
// pune 0 peste pragul de livrare gratuita), cu shipping_total ca rezerva.
export function getOrderShippingSummary(order: Record<string, unknown>): OrderShippingSummary | null {
  const methods = (order.shipping_methods as Array<Record<string, unknown>> | undefined) ?? []
  if (methods.length === 0) return null

  const name = methods
    .map((m) => (typeof m.name === "string" ? m.name.trim() : ""))
    .filter(Boolean)
    .join(", ") || "Necunoscută"

  const amounts = methods.map((m) => finiteNumber(m.amount))
  const amount = amounts.every((a) => a !== undefined)
    ? (amounts as number[]).reduce((sum, a) => sum + a, 0)
    : finiteNumber(order.shipping_total) ?? null

  const total = getCanonicalOrderTotal(order as Parameters<typeof getCanonicalOrderTotal>[0])
  const itemsTotal = amount !== null && total >= amount ? total - amount : null

  return {
    name,
    amount,
    costLabel: amount === null ? "cost necunoscut" : amount === 0 ? "Gratuit" : `${formatPrice(amount)} RON`,
    isPickup: /ridicare|pickup/i.test(name),
    itemsTotal,
  }
}
