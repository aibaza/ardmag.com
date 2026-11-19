import { describe, expect, it } from "vitest"
import { codLabel, isPickupCart } from "./cod-label"

describe("eticheta plății ramburs", () => {
  it("la ridicarea personală spune plata la ridicare", () => {
    const cart = { shipping_methods: [{ name: "Ridicare personală de la sediul ARDmag" }] } as any
    expect(isPickupCart(cart)).toBe(true)
    expect(codLabel(cart)).toBe("Plata la ridicare")
  })
  it("la curier rămâne ramburs la livrare", () => {
    expect(codLabel({ shipping_methods: [{ name: "Fan Courier" }] } as any)).toBe("Ramburs la livrare")
  })
  it("fără metodă de livrare aleasă rămâne ramburs la livrare", () => {
    expect(codLabel({ shipping_methods: [] } as any)).toBe("Ramburs la livrare")
    expect(codLabel(null)).toBe("Ramburs la livrare")
  })
})
