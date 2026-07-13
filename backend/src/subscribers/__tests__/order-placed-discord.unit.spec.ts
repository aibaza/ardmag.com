import { buildOrderDiscordMessage, getOrderDiscordTotal } from "../order-placed-discord"

const orderBase = {
  currency_code: "ron",
  email: "client@example.com",
  created_at: "2026-07-13T10:00:00.000Z",
  shipping_address: {
    first_name: "Client",
    last_name: "ARDmag",
    city: "Cluj-Napoca",
    province: "Cluj",
  },
}

describe("getOrderDiscordTotal", () => {
  it.each([
    {
      name: "comanda #14",
      order: {
        total: 22,
        item_total: 0,
        shipping_total: 22,
        summary: { current_order_total: 102 },
      },
      expected: 102,
    },
    {
      name: "comanda #15",
      order: {
        total: 18.13,
        item_total: 0,
        shipping_total: 18.13,
        summary: { current_order_total: 232.13 },
      },
      expected: 232.13,
    },
    {
      name: "reducere 100% cu total valid egal cu transportul",
      order: {
        total: 20,
        item_total: 0,
        shipping_total: 20,
        discount_total: 100,
        summary: { current_order_total: 20 },
      },
      expected: 20,
    },
    {
      name: "transport gratuit in proiectia Graph Query afectata",
      order: {
        total: 0,
        item_total: 0,
        shipping_total: 0,
        summary: { current_order_total: 600 },
      },
      expected: 600,
    },
    {
      name: "taxe, discounturi si ajustari",
      order: {
        total: 10,
        item_total: 0,
        shipping_total: 10,
        tax_total: 20.9,
        discount_total: 20,
        summary: { current_order_total: 130.9 },
      },
      expected: 130.9,
    },
    {
      name: "payload normal fara summary",
      order: { total: 75, item_total: 55, shipping_total: 20 },
      expected: 75,
    },
  ])("foloseste totalul corect pentru $name", ({ order, expected }) => {
    expect(getOrderDiscordTotal(order)).toBe(expected)
  })
})

describe("buildOrderDiscordMessage", () => {
  it.each([
    { display_id: 14, projectedTotal: 22, canonicalTotal: 102, detailQuantity: 1 },
    { display_id: 15, projectedTotal: 18.13, canonicalTotal: 232.13, detailQuantity: 1 },
    { display_id: 16, projectedTotal: 0, canonicalTotal: 600, quantity: 1 },
  ])(
    "afiseaza totalul canonic si 1x fara undefined pentru #$display_id",
    ({ display_id, projectedTotal, canonicalTotal, detailQuantity, quantity }) => {
      const productTitle = `Produs comanda ${display_id}`
      const message = buildOrderDiscordMessage({
        ...orderBase,
        display_id,
        total: projectedTotal,
        summary: { current_order_total: canonicalTotal },
        items: [
          {
            product_title: productTitle,
            variant_title: "Default Title",
            quantity,
            detail: detailQuantity == null ? undefined : { quantity: detailQuantity },
          },
        ],
      }) as any

      const expectedTotal = `${canonicalTotal.toFixed(2)} RON`
      expect(message.content).toContain(expectedTotal)
      expect(message.embeds[0].title).toContain(expectedTotal)
      expect(message.embeds[0].description).toBe(`1x ${productTitle}`)
      expect(JSON.stringify(message)).not.toContain("undefined")
    }
  )

  it("foloseste 1x defensiv cand proiectia nu contine cantitatea", () => {
    const message = buildOrderDiscordMessage({
      ...orderBase,
      display_id: 17,
      total: 75,
      items: [{ product_title: "Payload normal" }],
    }) as any

    expect(message.embeds[0].description).toBe("1x Payload normal")
    expect(JSON.stringify(message)).not.toContain("undefined")
  })
})
