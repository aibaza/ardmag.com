import { cleanAddressPart, normalizeCourierDestination } from "../address"

describe("normalizeCourierDestination", () => {
  it.each([
    [{ province: "Maramureș", city: "Baia Mare" }, { county: "Maramures", locality: "Baia Mare" }],
    [{ province: "Caraș-Severin", city: "Reșița" }, { county: "Caras-Severin", locality: "Resita" }],
    [{ province: "Cluj", city: "Cluj - Napoca" }, { county: "Cluj", locality: "Cluj-Napoca" }],
    [{ province: " Cluj ", city: "  Mun.  Turda " }, { county: "Cluj", locality: "Turda" }],
    [{ province: "București", city: "Sector 3" }, { county: "Bucuresti", locality: "Bucuresti" }],
    [{ province: "RO-B", city: "București" }, { county: "Bucuresti", locality: "Bucuresti" }],
    [{ province: "Satu Mare", city: "Satu Mare" }, { county: "Satu Mare", locality: "Satu Mare" }],
  ])("%j -> %j", (input, expected) => {
    expect(normalizeCourierDestination(input)).toEqual(expected)
  })

  it("nu mai presupune Cluj cand lipseste judetul sau localitatea", () => {
    expect(normalizeCourierDestination({ province: "", city: "Turda" })).toBeNull()
    expect(normalizeCourierDestination({ province: "Cluj", city: " " })).toBeNull()
    expect(normalizeCourierDestination(undefined)).toBeNull()
  })

  it("curata spatiile si diacriticele", () => {
    expect(cleanAddressPart("  Bistrița -  Năsăud ")).toBe("Bistrita-Nasaud")
  })
})
