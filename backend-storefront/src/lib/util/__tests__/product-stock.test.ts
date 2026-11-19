import { describe, it, expect } from "vitest"
import {
  getPdpStockLabel,
  isProductOutOfStock,
  isVariantInStock,
  pickPdpVariant,
} from "../product"
import type { HttpTypes } from "@medusajs/types"

const untracked = { id: "v_untracked", manage_inventory: false, allow_backorder: false }
const trackedEmpty = { id: "v_empty", manage_inventory: true, allow_backorder: false, inventory_quantity: 0 }
const trackedFull = { id: "v_full", manage_inventory: true, allow_backorder: false, inventory_quantity: 3 }
const backorder = { id: "v_bo", manage_inventory: true, allow_backorder: true, inventory_quantity: 0 }

const product = (variants: object[]) => ({ variants } as unknown as HttpTypes.StoreProduct)

describe("isVariantInStock", () => {
  it("neurmarita (inventory_quantity lipsa) e disponibila", () => {
    expect(isVariantInStock(untracked)).toBe(true)
  })
  it("urmarita fara stoc e epuizata", () => {
    expect(isVariantInStock(trackedEmpty)).toBe(false)
  })
  it("urmarita cu stoc sau cu backorder e disponibila", () => {
    expect(isVariantInStock(trackedFull)).toBe(true)
    expect(isVariantInStock(backorder)).toBe(true)
  })
  it("lipsa variantei nu e disponibila", () => {
    expect(isVariantInStock(undefined)).toBe(false)
  })
})

describe("isProductOutOfStock", () => {
  it("produs cu o varianta urmarita epuizata si restul neurmarite nu e epuizat (cazul abrazivi-oala)", () => {
    expect(isProductOutOfStock(product([trackedEmpty, untracked, untracked]))).toBe(false)
  })
  it("produs cu toate variantele urmarite si fara stoc e epuizat", () => {
    expect(isProductOutOfStock(product([trackedEmpty, { ...trackedEmpty, id: "x" }]))).toBe(true)
  })
})

describe("pickPdpVariant", () => {
  it("respecta v_id cand exista", () => {
    expect(pickPdpVariant([untracked, trackedEmpty], "v_empty")?.id).toBe("v_empty")
  })
  it("fara v_id sare peste prima varianta epuizata", () => {
    expect(pickPdpVariant([trackedEmpty, untracked])?.id).toBe("v_untracked")
  })
  it("v_id necunoscut cade pe prima disponibila", () => {
    expect(pickPdpVariant([trackedEmpty, trackedFull], "nope")?.id).toBe("v_full")
  })
  it("toate epuizate -> prima varianta", () => {
    expect(pickPdpVariant([trackedEmpty])?.id).toBe("v_empty")
  })
})

describe("getPdpStockLabel", () => {
  const variants = [trackedEmpty, untracked]
  it("varianta selectata neurmarita -> Disponibil", () => {
    expect(getPdpStockLabel(variants, untracked).label).toBe("Disponibil")
  })
  it("varianta selectata urmarita cu stoc -> In stoc", () => {
    expect(getPdpStockLabel([trackedFull], trackedFull)).toEqual({ label: "In stoc", location: "Cluj-Napoca" })
  })
  it("varianta selectata epuizata -> Stoc epuizat", () => {
    expect(getPdpStockLabel(variants, trackedEmpty)).toEqual({ label: "Stoc epuizat", location: "" })
  })
  it("backorder -> Disponibil", () => {
    expect(getPdpStockLabel([backorder], backorder).label).toBe("Disponibil")
  })
  it("fara varianta selectata: epuizat doar daca nicio varianta nu e disponibila", () => {
    expect(getPdpStockLabel(variants, undefined).label).toBe("Disponibil")
    expect(getPdpStockLabel([trackedEmpty], undefined).label).toBe("Stoc epuizat")
  })
})
