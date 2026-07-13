import { describe, expect, it } from "vitest"
import { getCanonicalOrderTotal, ORDER_SUMMARY_FIELD } from "./purchase-total"

describe("contractul Purchase al comenzii", () => {
  it("cere summary din Store API", () => {
    expect(ORDER_SUMMARY_FIELD).toBe("+summary")
  })

  it.each([
    ["comanda anonimizata #12", 54.73, 130.73, 130.73],
    ["comanda anonimizata #14", 22, 102, 102],
    ["comanda anonimizata #15", 18.13, 232.13, 232.13],
    ["reducere 100% cu transport platit", 20, 20, 20],
    ["reducere 100% si transport gratuit", 999, 0, 0],
    ["transport gratuit", 0, 600, 600],
    ["taxe si ajustari", 10, 130.9, 130.9],
  ])("foloseste summary.current_order_total pentru %s", (_, total, canonical, expected) => {
    expect(
      getCanonicalOrderTotal({
        total,
        summary: { current_order_total: canonical },
      })
    ).toBe(expected)
  })

  it.each([
    ["summary absent", { total: 75 }, 75],
    ["summary incomplet", { total: "84.50", summary: {} }, 84.5],
  ])("pastreaza fallback-ul legacy cand %s", (_, order, expected) => {
    expect(getCanonicalOrderTotal(order)).toBe(expected)
  })
})
