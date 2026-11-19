import { describe, it, expect } from "vitest"
import { isPickupShippingOption, pickDefaultShippingOptionId } from "../default-shipping-option"

const pickup = { id: "so_pickup", name: "Ridicare personală de la sediul ARDmag", provider_id: "manual_manual", type: { code: "pickup-cluj" } }
const fan = { id: "so_fan", name: "Fan Courier", provider_id: "fan-courier_fan-courier", type: { code: "fan-courier" } }
const cargus = { id: "so_cargus", name: "Cargus", provider_id: "cargus_cargus", type: { code: "cargus" } }

describe("pickDefaultShippingOptionId", () => {
  it("nu preselecteaza ridicarea personala cand e prima in lista", () => {
    expect(pickDefaultShippingOptionId([pickup, fan])).toBe("so_fan")
  })
  it("prefera Fan Courier si cand exista alt curier", () => {
    expect(pickDefaultShippingOptionId([pickup, cargus, fan])).toBe("so_fan")
  })
  it("fara Fan Courier alege primul curier, nu ridicarea", () => {
    expect(pickDefaultShippingOptionId([pickup, cargus])).toBe("so_cargus")
  })
  it("pastreaza alegerea deja salvata pe cos, inclusiv ridicarea", () => {
    expect(pickDefaultShippingOptionId([pickup, fan], "so_pickup")).toBe("so_pickup")
  })
  it("ignora o alegere salvata care nu mai e disponibila", () => {
    expect(pickDefaultShippingOptionId([pickup, fan], "so_vechi")).toBe("so_fan")
  })
  it("doar ridicare -> ridicare; lista goala -> null", () => {
    expect(pickDefaultShippingOptionId([pickup])).toBe("so_pickup")
    expect(pickDefaultShippingOptionId([])).toBeNull()
  })
  it("recunoaste ridicarea dupa nume si cod", () => {
    expect(isPickupShippingOption({ id: "a", name: "Ridicare Cluj" })).toBe(true)
    expect(isPickupShippingOption({ id: "b", name: "X", type: { code: "pickup-cluj" } })).toBe(true)
    expect(isPickupShippingOption(fan)).toBe(false)
  })
})
