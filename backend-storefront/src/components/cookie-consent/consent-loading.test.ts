import { describe, expect, it } from "vitest"
import { trackingLoadState } from "./consent-loading"

describe("trackingLoadState", () => {
  it("fails closed before the visitor chooses", () => {
    expect(trackingLoadState(null)).toEqual({ analytics: false, marketing: false })
  })

  it("keeps both providers disabled after rejection", () => {
    expect(trackingLoadState({ analytics: false, marketing: false })).toEqual({
      analytics: false,
      marketing: false,
    })
  })

  it("enables only the providers explicitly accepted", () => {
    expect(trackingLoadState({ analytics: true, marketing: false })).toEqual({
      analytics: true,
      marketing: false,
    })
    expect(trackingLoadState({ analytics: true, marketing: true })).toEqual({
      analytics: true,
      marketing: true,
    })
  })
})
