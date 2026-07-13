import { getCanonicalOrderTotal } from "../order-total"

describe("getCanonicalOrderTotal", () => {
  it.each([
    {
      name: "comanda anonimizata #12",
      order: { total: 54.73, summary: { current_order_total: 130.73 } },
      expected: 130.73,
    },
    {
      name: "comanda anonimizata #14",
      order: { total: 22, summary: { current_order_total: 102 } },
      expected: 102,
    },
    {
      name: "comanda anonimizata #15",
      order: { total: 18.13, summary: { current_order_total: 232.13 } },
      expected: 232.13,
    },
    {
      name: "reducere 100% cu transport platit",
      order: { total: 20, summary: { current_order_total: 20 } },
      expected: 20,
    },
    {
      name: "reducere 100% si transport gratuit",
      order: { total: 999, summary: { current_order_total: 0 } },
      expected: 0,
    },
    {
      name: "transport gratuit",
      order: { total: 0, summary: { current_order_total: 600 } },
      expected: 600,
    },
    {
      name: "taxe si ajustari",
      order: { total: 10, summary: { current_order_total: 130.9 } },
      expected: 130.9,
    },
    {
      name: "payload legacy fara summary",
      order: { total: 75 },
      expected: 75,
    },
    {
      name: "payload legacy cu summary incomplet",
      order: { total: "84.50", summary: {} },
      expected: 84.5,
    },
  ])("foloseste totalul corect pentru $name", ({ order, expected }) => {
    expect(getCanonicalOrderTotal(order)).toBe(expected)
  })
})
