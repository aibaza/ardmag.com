import { describe, it, expect } from "vitest"
import { formatPrice, getProductMinPrice } from "../format-price"
import type { HttpTypes } from "@medusajs/types"

describe("formatPrice", () => {
  it("formats 103200 to 1.032,00 RON", () => {
    expect(formatPrice(103200)).toBe("1.032,00 RON")
  })

  it("formats 11500 to 115,00 RON", () => {
    expect(formatPrice(11500)).toBe("115,00 RON")
  })

  it("formats 100 to 1,00 RON", () => {
    expect(formatPrice(100)).toBe("1,00 RON")
  })

  it("formats 100000 to 1.000,00 RON", () => {
    expect(formatPrice(100000)).toBe("1.000,00 RON")
  })

  it("formats 1000000 to 10.000,00 RON", () => {
    expect(formatPrice(1000000)).toBe("10.000,00 RON")
  })

  it("formats 999 to 9,99 RON", () => {
    expect(formatPrice(999)).toBe("9,99 RON")
  })

  it("formats with custom currency code uppercased", () => {
    expect(formatPrice(5000, "eur")).toBe("50,00 EUR")
  })

  it("formats 0 correctly", () => {
    expect(formatPrice(0)).toBe("0,00 RON")
  })
})

// Helper to build a minimal StoreProduct with calculated_price on variants
type TestVariant = Partial<HttpTypes.StoreProductVariant> & {
  calculated_price?: { calculated_amount: number | null } | null
}

function makeProduct(
  variants: TestVariant[]
): HttpTypes.StoreProduct {
  return {
    id: "prod_1",
    title: "Test",
    handle: "test",
    description: null,
    subtitle: null,
    is_giftcard: false,
    status: "published",
    thumbnail: null,
    width: null,
    weight: null,
    length: null,
    height: null,
    origin_country: null,
    hs_code: null,
    mid_code: null,
    material: null,
    collection_id: null,
    type_id: null,
    discountable: true,
    external_id: null,
    created_at: null,
    updated_at: null,
    deleted_at: null,
    metadata: null,
    tags: null,
    images: null,
    options: null,
    variants: variants as HttpTypes.StoreProductVariant[],
  }
}

describe("getProductMinPrice", () => {
  it("returns minimum calculated_amount across variants", () => {
    const product = makeProduct([
      { id: "v1", calculated_price: { calculated_amount: 5000 } },
      { id: "v2", calculated_price: { calculated_amount: 3000 } },
      { id: "v3", calculated_price: { calculated_amount: 8000 } },
    ])
    expect(getProductMinPrice(product)).toBe(3000)
  })

  it("returns null when all variants have null calculated_price", () => {
    const product = makeProduct([
      { id: "v1", calculated_price: null },
      { id: "v2", calculated_price: null },
    ])
    expect(getProductMinPrice(product)).toBeNull()
  })

  it("returns null when variants is null", () => {
    const product = makeProduct([])
    product.variants = null
    expect(getProductMinPrice(product)).toBeNull()
  })

  it("returns null when variants is empty array", () => {
    const product = makeProduct([])
    expect(getProductMinPrice(product)).toBeNull()
  })

  it("skips variants with null calculated_amount", () => {
    const product = makeProduct([
      { id: "v1", calculated_price: { calculated_amount: null } },
      { id: "v2", calculated_price: { calculated_amount: 7500 } },
    ])
    expect(getProductMinPrice(product)).toBe(7500)
  })

  it("returns null if only variant has null calculated_amount", () => {
    const product = makeProduct([
      { id: "v1", calculated_price: { calculated_amount: null } },
    ])
    expect(getProductMinPrice(product)).toBeNull()
  })

  it("returns single variant price", () => {
    const product = makeProduct([
      { id: "v1", calculated_price: { calculated_amount: 11500 } },
    ])
    expect(getProductMinPrice(product)).toBe(11500)
  })
})
