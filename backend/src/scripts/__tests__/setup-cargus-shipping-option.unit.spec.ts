jest.mock("@medusajs/medusa/core-flows", () => ({ createShippingOptionsWorkflow: jest.fn() }))
import { planCargusOption } from "../setup-cargus-shipping-option"

const fan = { id: "so_fan", service_zone_id: "serzo_ro", shipping_profile_id: "sp_default", rules: [{ attribute: "enabled_in_store", operator: "eq", value: "true" }] }
const base = { fanOptions: [fan], cargusOptions: [], providerEnabled: true, zoneLocationIds: ["sloc_cluj"], locationsWithCargus: [] as string[] }

describe("planCargusOption", () => {
  it("creeaza optiunea in zona si profilul Fan, cu regulile Fan si legatura de depozit", () => {
    expect(planCargusOption(base)).toEqual({ action: "create", serviceZoneId: "serzo_ro", shippingProfileId: "sp_default", rules: fan.rules, linkLocations: ["sloc_cluj"] })
  })
  it("nu dubleaza legatura de depozit existenta", () => {
    expect(planCargusOption({ ...base, locationsWithCargus: ["sloc_cluj"] })).toMatchObject({ action: "create", linkLocations: [] })
  })
  it("este idempotent cand optiunea calculata exista", () => {
    expect(planCargusOption({ ...base, cargusOptions: [{ id: "so_c", service_zone_id: "serzo_ro", price_type: "calculated" }] })).toEqual({ action: "noop", optionId: "so_c" })
  })
  it("ignora optiunile Cargus din alte zone", () => {
    expect(planCargusOption({ ...base, cargusOptions: [{ id: "so_c", service_zone_id: "serzo_eu", price_type: "calculated" }] })).toMatchObject({ action: "create" })
  })
  it.each([
    [{ providerEnabled: false }, "CARGUS_CHECKOUT_ENABLED"],
    [{ fanOptions: [] }, "Fan"],
    [{ fanOptions: [fan, { ...fan, id: "so_fan2" }] }, "Fan"],
    [{ cargusOptions: [{ id: "a", service_zone_id: "serzo_ro", price_type: "flat" }] }, "calculata"],
    [{ cargusOptions: [{ id: "a", service_zone_id: "serzo_ro", price_type: "calculated" }, { id: "b", service_zone_id: "serzo_ro", price_type: "calculated" }] }, "curata"],
    [{ zoneLocationIds: [] }, "depozit"],
  ])("se opreste fara sa scrie: %j", (patch, reason) => {
    const plan = planCargusOption({ ...base, ...(patch as any) })
    expect(plan.action).toBe("abort")
    expect((plan as any).reason).toContain(reason)
  })
})
