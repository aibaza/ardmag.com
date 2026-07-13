import { buildMetaPurchaseEvent } from "../meta-purchase"

describe("buildMetaPurchaseEvent", () => {
  it.each([
    ["#12", 54.73, 130.73],
    ["#14", 22, 102],
    ["#15", 18.13, 232.13],
    ["reducere 100%", 20, 20],
    ["transport gratuit", 0, 600],
    ["taxe si ajustari", 10, 130.9],
  ])("trimite totalul canonic pentru %s", (_, projectedTotal, canonicalTotal) => {
    const event = buildMetaPurchaseEvent(
      {
        id: "order_anonymized",
        total: projectedTotal,
        summary: { current_order_total: canonicalTotal },
        currency_code: "ron",
        items: [{ product_id: "prod_anon", quantity: 2, unit_price: 10 }],
      },
      {},
      "https://ardmag.ro",
      1234567890
    )

    expect(event).toMatchObject({
      event_name: "Purchase",
      event_time: 1234567890,
      event_id: "order_anonymized",
      custom_data: {
        currency: "RON",
        value: canonicalTotal,
        num_items: 2,
      },
    })
  })

  it("pastreaza fallback-ul legacy, moneda si event_id pentru deduplicare", () => {
    const event = buildMetaPurchaseEvent(
      { id: "order_legacy", total: 75, currency_code: "eur" },
      {},
      "https://ardmag.ro",
      1234567890
    )

    expect(event.event_id).toBe("order_legacy")
    expect(event.custom_data.value).toBe(75)
    expect(event.custom_data.currency).toBe("EUR")
  })
})
