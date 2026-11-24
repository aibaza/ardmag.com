import { describe, expect, it } from "vitest"
import {
  cargusNeedsRequote,
  deliveryKind,
  deliveryPaymentError,
  paymentModeForProvider,
} from "./delivery-payment-policy"

const fan = { name: "Fan Courier", provider_id: "fan-courier_fan-courier" }
const cargus = (payment?: string) => ({ name: "Cargus", provider_id: "cargus_cargus", data: payment ? { payment } : {} })
const pickup = { name: "Ridicare personală de la sediul ARDmag", provider_id: "manual_manual" }

describe("delivery-payment-policy (storefront)", () => {
  it("recunoaste curierii si ridicarea", () => {
    expect(deliveryKind(fan)).toBe("fan-courier")
    expect(deliveryKind(cargus())).toBe("cargus")
    expect(deliveryKind(pickup)).toBe("pickup")
  })

  it("Fan si Cargus accepta card si ramburs", () => {
    expect(deliveryPaymentError(fan, "pp_system_default")).toBeNull()
    expect(deliveryPaymentError(fan, "pp_stripe_stripe")).toBeNull()
    expect(deliveryPaymentError(cargus("cod"), "pp_system_default")).toBeNull()
    expect(deliveryPaymentError(cargus("card"), "pp_stripe_stripe")).toBeNull()
    expect(deliveryPaymentError(cargus(), "pp_stripe_stripe")).toBeNull()
  })

  it("Cargus se recoteaza cand plata nu corespunde cotatiei", () => {
    expect(cargusNeedsRequote(cargus(), "pp_system_default")).toBe(true)
    expect(cargusNeedsRequote(cargus("cod"), "pp_stripe_stripe")).toBe(true)
    expect(cargusNeedsRequote(cargus("cod"), "pp_system_default")).toBe(false)
    expect(cargusNeedsRequote(fan, "pp_system_default")).toBe(false)
    expect(deliveryPaymentError(cargus(), "pp_system_default")).toContain("Cargus")
  })

  it("ridicarea personala nu are restrictii", () => {
    expect(deliveryPaymentError(pickup, "pp_system_default")).toBeNull()
    expect(deliveryPaymentError(pickup, "pp_stripe_stripe")).toBeNull()
  })

  it("modul de plata dupa provider", () => {
    expect(paymentModeForProvider("pp_system_default")).toBe("cod")
    expect(paymentModeForProvider("pp_stripe_stripe")).toBe("card")
    expect(paymentModeForProvider("pp_stripe-ideal_stripe")).toBeNull()
  })
})
