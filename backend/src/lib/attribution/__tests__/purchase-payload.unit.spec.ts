import { buildPurchasePayload } from "../purchase-payload"

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
          first_touch: { source: "facebook", medium: "cpc", campaign: "summer" },
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
      order_id: "order_123",
      value: 349,
      currency: "ron",
      utm_source: "facebook",
      utm_medium: "cpc",
      utm_campaign: "summer",
      resolved_via: "fbclid",
      extra: {
        order_id: "order_123",
        currency: "ron",
        attribution: {
          resolved_source: "facebook",
          resolved_medium: "cpc",
          resolved_campaign: "summer",
          resolved_via: "fbclid",
          fbclid: "fb123",
          gclid: "g123",
          fbc: "fb.1.1783166400000.fb123",
          attribution_window_days: 90,
        },
      },
    })
  })
})
