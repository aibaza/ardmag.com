import { renderOrderCustomer } from "../order-customer"

const baseOrder = {
  display_id: 21,
  email: "client@example.com",
  items: [{ product_title: "MASTIC LICHID", variant_title: "BEJ / 1 LITRU", quantity: 1, unit_price: 80 }],
  payment_collections: [{ payments: [{ provider_id: "pp_system_default" }] }],
}

describe("renderOrderCustomer - metoda de livrare", () => {
  it("arata curierul, costul si separarea produse/transport", () => {
    const html = renderOrderCustomer(
      { ...baseOrder, total: 102, summary: { current_order_total: 102 }, shipping_methods: [{ name: "Fan Courier", amount: 22 }] } as any,
      "https://ardmag.ro"
    )
    expect(html).toContain("METODĂ DE LIVRARE")
    expect(html).toContain("Fan Courier - 22.00 RON")
    expect(html).toContain("Produse: 80.00 RON")
    expect(html).toContain("Transport: 22.00 RON")
    expect(html).toContain("la primirea coletului")
  })

  it("la ridicare personala nu vorbeste de colet", () => {
    const html = renderOrderCustomer(
      { ...baseOrder, total: 80, shipping_methods: [{ name: "Ridicare personală de la sediul ARDmag", amount: 0 }] } as any,
      "https://ardmag.ro"
    )
    expect(html).toContain("Ridicare personală de la sediul ARDmag - Gratuit")
    expect(html).toContain("la ridicarea comenzii")
    expect(html).not.toContain("la primirea coletului")
    expect(html).not.toContain("Transport:")
  })

  it("nu promite livrare gratuita cand transportul s-a platit, chiar daca totalul trece de 500", () => {
    const html = renderOrderCustomer(
      { ...baseOrder, total: 512, shipping_methods: [{ name: "Fan Courier", amount: 22 }] } as any,
      "https://ardmag.ro"
    )
    expect(html).toContain("Fan Courier - 22.00 RON")
    expect(html).not.toContain("Livrare gratuită")
  })

  it("livrare Fan Courier gratuita peste prag -> mentiunea de livrare gratuita", () => {
    const html = renderOrderCustomer(
      { ...baseOrder, total: 620, shipping_methods: [{ name: "Fan Courier", amount: 0 }] } as any,
      "https://ardmag.ro"
    )
    expect(html).toContain("Fan Courier - Gratuit")
    expect(html).toContain("Livrare gratuită")
  })
})
