import { describe, expect, it } from "vitest"
import { getDisplayTotals } from "./display-totals"

describe("customer-facing totals", () => {
  it("shows SOLIDO before discount without subtracting twice", () => {
    expect(getDisplayTotals({ item_total: 729.6, discount_total: 182.4, total: 729.6 }))
      .toMatchObject({ subtotal: 912, discount_total: 182.4, total: 729.6 })
  })
  it("keeps shipping discounts separate from product discounts", () => {
    const result = getDisplayTotals({ item_total: 96.8, item_discount_total: 24.2,
      discount_total: 34.2, shipping_discount_total: 10, shipping_total: 14.2,
      total: 111, tax_total: 19.26 })
    expect(result).toEqual({ subtotal: 121, discount_total: 24.2,
      shipping_total: 14.2, tax_total: 19.26, total: 111 })
    expect(result.subtotal - result.discount_total + result.shipping_total).toBe(result.total)
  })
  it("falls back to the total minus net shipping", () => {
    expect(getDisplayTotals({ total: 110, shipping_total: 10, discount_total: 20,
      shipping_discount_total: 5 })).toMatchObject({ subtotal: 115, discount_total: 15 })
  })
})
