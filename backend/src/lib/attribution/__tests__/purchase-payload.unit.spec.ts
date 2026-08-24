import { buildPurchasePayload, verifyCollectorPurchaseResponse } from "../purchase-payload"

describe("buildPurchasePayload", () => {
  it("maps order metadata attribution into collector purchase payload", () => {
    const payload = buildPurchasePayload({
      id: "order_123",
      total: 349,
      currency_code: "ron",
      metadata: {
        attribution: {
          resolved_source: "facebook",
          resolved_medium: "cpc",
          resolved_campaign: "summer",
          resolved_via: "fbclid",
          first_touch: {
            source: "facebook",
            medium: "cpc",
            campaign: "summer",
          },
          last_touch: { source: "facebook", medium: "cpc", campaign: "summer" },
          fbclid: "fb123",
          gclid: "g123",
          fbc: "fb.1.1783166400000.fb123",
          attribution_window_days: 90,
        },
      },
    })

    expect(payload).toMatchObject({
      site: "ardmag.ro",
      event: "purchase",
      event_id: "order_123",
      value: 349,
      currency: "RON",
      utm_source: "facebook",
      utm_medium: "cpc",
      utm_campaign: "summer",
      resolved_via: "fbclid",
    })
    expect(JSON.stringify(payload)).not.toContain("fb123")
    expect(JSON.stringify(payload)).not.toContain("first_touch")
  })

  it.each([
    ["#12", 54.73, 130.73],
    ["#14", 22, 102],
    ["#15", 18.13, 232.13],
    ["reducere 100%", 20, 20],
    ["transport gratuit", 0, 600],
    ["taxe si ajustari", 10, 130.9],
  ])("foloseste totalul canonic pentru %s", (_, projectedTotal, canonicalTotal) => {
    const payload = buildPurchasePayload({
      id: "order_anonymized",
      total: projectedTotal,
      summary: { current_order_total: canonicalTotal },
      currency_code: "ron",
    })

    expect(payload.value).toBe(canonicalTotal)
    expect(payload.currency).toBe("RON")
    expect(payload.event_id).toBe("order_anonymized")
  })

  it("pastreaza fallback-ul legitim pentru collectorul legacy", () => {
    const payload = buildPurchasePayload({
      id: "order_legacy",
      total: 75,
      currency_code: "eur",
    })

    expect(payload.value).toBe(75)
    expect(payload.currency).toBe("EUR")
  })

  it("verifica acknowledgement-ul exact al collectorului", async () => {
    await expect(verifyCollectorPurchaseResponse(new Response(JSON.stringify({ ok: true, written: 1 }), { status: 202 }))).resolves.toBeUndefined()
    await expect(verifyCollectorPurchaseResponse(new Response(JSON.stringify({ ok: true, written: 0 }), { status: 202 }))).rejects.toThrow("collector_write_not_acknowledged")
    await expect(verifyCollectorPurchaseResponse(new Response("unauthorized", { status: 401 }))).rejects.toThrow("collector_http_401")
  })
})
