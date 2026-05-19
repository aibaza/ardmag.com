import { formatPrice } from "../tokens"

describe("formatPrice", () => {
  // Lock-in: preturile in DB sunt raw decimal post migrare 18 mai 2026.
  // Daca cineva reintroduce / 100, aceste teste cad.
  it("formateaza raw decimal fara sa divida la 100", () => {
    expect(formatPrice(464)).toBe("464.00")
    expect(formatPrice(1046.5)).toBe("1046.50")
    expect(formatPrice(137)).toBe("137.00")
  })

  it("trateaza valorile lipsa ca 0", () => {
    expect(formatPrice(undefined)).toBe("0.00")
    expect(formatPrice(null)).toBe("0.00")
  })

  it("accepta string-uri numerice", () => {
    expect(formatPrice("464")).toBe("464.00")
    expect(formatPrice("0.5")).toBe("0.50")
  })
})
