import { renderOrderAdmin } from "../order-admin"

// Mock order matching what query.graph returns when called with
// `payment_collections.*, payment_collections.payments.*` in fields list
// (real shape verified in DB pentru comanda #3 ciprian 19 mai 2026).
const mockBaseOrder = {
  display_id: 3,
  email: "ciprian.dobrea@gmail.com",
  total: 147.76,
  items: [
    {
      product_title: "MASTIC LICHID",
      product_handle: "mastic-lichid-2",
      variant_title: "BEJ / 1 LITRU",
      quantity: 1,
      unit_price: 80,
    },
  ],
  shipping_address: {
    first_name: "Ciprian",
    last_name: "Dobrea",
    address_1: "Vanatorului 6",
    city: "Baciu",
    phone: "0722155441",
  },
}

describe("renderOrderAdmin - metoda de plata", () => {
  it("RAMBURS (pp_system_default) afiseaza 'Ramburs (la curier)' nu 'Card (Stripe)'", () => {
    const order = {
      ...mockBaseOrder,
      payment_collections: [
        {
          payments: [{ provider_id: "pp_system_default" }],
        },
      ],
    }
    const html = renderOrderAdmin(order as any)
    expect(html).toContain("Ramburs")
    expect(html).not.toMatch(/Card \(Stripe\)/)
  })

  it("Stripe (pp_stripe_stripe) afiseaza 'Card (Stripe)'", () => {
    const order = {
      ...mockBaseOrder,
      payment_collections: [
        {
          payments: [{ provider_id: "pp_stripe_stripe" }],
        },
      ],
    }
    const html = renderOrderAdmin(order as any)
    expect(html).toContain("Card (Stripe)")
    expect(html).not.toContain("Ramburs")
  })

  it("Provider necunoscut afiseaza explicit provider_id (nu defaulteaza la Card)", () => {
    const order = {
      ...mockBaseOrder,
      payment_collections: [
        {
          payments: [{ provider_id: "pp_paypal_paypal" }],
        },
      ],
    }
    const html = renderOrderAdmin(order as any)
    expect(html).not.toContain("Card (Stripe)")
    expect(html).not.toContain("Ramburs")
  })

  it("afiseaza telefonul de livrare din shipping_address.phone", () => {
    const html = renderOrderAdmin(mockBaseOrder as any)
    expect(html).toContain("Telefon livrare:")
    expect(html).toContain("0722155441")
  })
})

describe("renderOrderAdmin - metoda de livrare", () => {
  const cod = { payment_collections: [{ payments: [{ provider_id: "pp_system_default" }] }] }

  it("afiseaza curierul si costul, cu produse/transport separat", () => {
    const html = renderOrderAdmin({
      ...mockBaseOrder,
      ...cod,
      total: 102,
      summary: { current_order_total: 102 },
      shipping_methods: [{ name: "Fan Courier", amount: 22 }],
    } as any)
    expect(html).toContain("Livrare:")
    expect(html).toContain("Fan Courier - 22.00 RON")
    expect(html).toContain("Produse: 80.00 RON")
    expect(html).toContain("Transport: 22.00 RON")
    expect(html).toContain("Total: 102.00 RON")
    expect(html).toContain("Ramburs (la curier)")
  })

  it("ridicarea personala e vizibila si gratuita, fara rand de transport", () => {
    const html = renderOrderAdmin({
      ...mockBaseOrder,
      ...cod,
      total: 80,
      shipping_methods: [{ name: "Ridicare personală de la sediul ARDmag", amount: 0 }],
    } as any)
    expect(html).toContain("Ridicare personală de la sediul ARDmag - Gratuit")
    expect(html).toContain("Ramburs (la ridicare)")
    expect(html).not.toContain("Transport:")
  })

  it("foloseste totalul canonic cand proiectia intoarce total = transport (cazul #14)", () => {
    const html = renderOrderAdmin({
      ...mockBaseOrder,
      ...cod,
      total: 22,
      summary: { current_order_total: 102 },
      shipping_methods: [{ name: "Fan Courier", amount: 22 }],
    } as any)
    expect(html).toContain("Total: 102.00 RON")
    expect(html).toContain("Produse: 80.00 RON")
  })

  it("fara metoda de livrare pe comanda afiseaza Nespecificata", () => {
    const html = renderOrderAdmin(mockBaseOrder as any)
    expect(html).toContain("Nespecificată")
  })
})
