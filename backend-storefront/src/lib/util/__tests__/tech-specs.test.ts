import { describe, it, expect } from "vitest"
import { splitTechSpecs } from "../tech-specs"

const SOLID =
  '<p><strong>MASTIC POLIESTER COLORAT</strong></p><p><strong>PLUS</strong></p><ul>\t<li>Aderență puternică</li></ul>' +
  '<p><strong>CARACTERISTICI TEHNICE</strong></p><ul>\t<li>Aspect: pastă colorată</li>\t<li>Raport de amestec: 100 + 2/3</li>' +
  '\t<li>Timp de gel (25°C): 4 – 5 min</li></ul>'

describe("splitTechSpecs", () => {
  it("scoate lista cheie: valoare si lasa restul descrierii neatins", () => {
    const r = splitTechSpecs(SOLID)!
    expect(r.heading).toBe("Caracteristici tehnice")
    expect(r.rows).toEqual([
      ["Aspect", "pastă colorată"],
      ["Raport de amestec", "100 + 2/3"],
      ["Timp de gel (25°C)", "4 – 5 min"],
    ])
    expect(r.rest).toBe('<p><strong>MASTIC POLIESTER COLORAT</strong></p><p><strong>PLUS</strong></p><ul>\t<li>Aderență puternică</li></ul>')
  })

  it("nu atinge descrierile fara sectiune", () => {
    expect(splitTechSpecs("<p>Disc diamantat</p>")).toBeNull()
    expect(splitTechSpecs("")).toBeNull()
    expect(splitTechSpecs(null)).toBeNull()
  })

  it("renunta daca un rand nu e cheie: valoare", () => {
    expect(splitTechSpecs('<p><strong>CARACTERISTICI TEHNICE</strong></p><ul><li>Aspect: pastă</li><li>Rezistent la UV</li></ul>')).toBeNull()
  })

  it("renunta daca un rand are formatare sau doua separatoare", () => {
    expect(splitTechSpecs('<p><strong>CARACTERISTICI TEHNICE</strong></p><ul><li><strong>Aspect</strong>: pastă</li></ul>')).toBeNull()
    expect(splitTechSpecs('<p><strong>CARACTERISTICI TEHNICE</strong></p><ul><li>Timp: gel: 4 min</li></ul>')).toBeNull()
  })

  it("renunta daca intre randuri exista alt continut", () => {
    expect(splitTechSpecs('<p><strong>CARACTERISTICI TEHNICE</strong></p><ul><li>Aspect: pastă</li><p>nota</p></ul>')).toBeNull()
  })
})
