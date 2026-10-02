import { describe, expect, it } from "vitest"
import { availablePaymentProviders } from "./available-payment-providers"

describe("available payment providers", () => {
  it("retains cash on delivery when staging contains a missing provider", () => {
    expect(availablePaymentProviders([null, { id: "pp_system_default", is_enabled: true }]))
      .toEqual([{ id: "pp_system_default", is_enabled: true }])
  })
  it("excludes disabled providers and sorts a copy", () => {
    const providers = [{ id: "z", is_enabled: true }, { id: "a", is_enabled: true }, { id: "off", is_enabled: false }]
    expect(availablePaymentProviders(providers).map(p => p.id)).toEqual(["a", "z"])
    expect(providers[0].id).toBe("z")
  })
})
