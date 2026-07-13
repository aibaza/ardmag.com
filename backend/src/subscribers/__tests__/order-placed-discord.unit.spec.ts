import { buildOrderDiscordMessage } from "../order-placed-discord"

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

describe("buildOrderDiscordMessage", () => {
  it.each([
    {
      display_id: 14,
      itemTotal: 80,
      shippingTotal: 22,
      expectedTotal: "102.00 RON",
      productTitle: "Produs 80 RON",
    },
    {
      display_id: 15,
      itemTotal: 214,
      shippingTotal: 18.13,
      expectedTotal: "232.13 RON",
      productTitle: "Produs 214 RON",
    },
  ])(
    "afiseaza totalul real si cantitatea pentru comanda #$display_id",
    ({ display_id, itemTotal, shippingTotal, expectedTotal, productTitle }) => {
      const message = buildOrderDiscordMessage({
        ...orderBase,
        display_id,
        total: shippingTotal,
        item_total: itemTotal,
        shipping_total: shippingTotal,
        items: [
          {
            product_title: productTitle,
            variant_title: "Default Title",
            detail: { quantity: 1 },
          },
        ],
      }) as any

      expect(message.content).toContain(expectedTotal)
      expect(message.embeds[0].title).toContain(expectedTotal)
      expect(message.embeds[0].description).toBe(`1x ${productTitle}`)
      expect(JSON.stringify(message)).not.toContain("undefinedx")
    }
  )
})
