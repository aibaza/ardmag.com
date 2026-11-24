import { describe, expect, it } from "vitest"
import { canonicalProvince, cleanCity } from "./address-province"

describe("judetul adresei de livrare", () => {
  it("accepta judetul scris fara diacritice sau cu prefix", () => {
    expect(canonicalProvince("Maramures")).toBe("Maramureș")
    expect(canonicalProvince(" caras severin ")).toBe("Caraș-Severin")
    expect(canonicalProvince("Jud. Cluj")).toBe("Cluj")
    expect(canonicalProvince("Bucuresti")).toBe("București")
    expect(canonicalProvince("Iași")).toBe("Iași")
  })
  it("refuza judetul lipsa sau necunoscut", () => {
    expect(canonicalProvince("")).toBeNull()
    expect(canonicalProvince(null)).toBeNull()
    expect(canonicalProvince("Clu")).toBeNull()
    expect(canonicalProvince("Bavaria")).toBeNull()
  })
  it("curata orasul", () => {
    expect(cleanCity("  Cluj  -  Napoca ")).toBe("Cluj-Napoca")
    expect(cleanCity("Baia   Mare")).toBe("Baia Mare")
  })
})
