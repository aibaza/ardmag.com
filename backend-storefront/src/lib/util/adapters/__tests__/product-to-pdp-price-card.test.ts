import { describe, it, expect } from "vitest"
import { productToPdpPriceCard } from "../product-to-pdp-price-card"
import type { HttpTypes } from "@medusajs/types"

type TestVariant = Partial<HttpTypes.StoreProductVariant> & {
  calculated_price?: {
    calculated_amount: number | null
    original_amount?: number | null
    currency_code?: string | null
  } | null
  inventory_quantity?: number | null
}

function makeProduct(
  overrides: Partial<HttpTypes.StoreProduct>
): HttpTypes.StoreProduct {
  return {
    id: "prod_1",
    title: "Mastic Tenax",
    handle: "mastic-tenax",
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
    variants: null,
    ...overrides,
  }
}

function makeVariant(overrides: TestVariant): HttpTypes.StoreProductVariant {
  return {
    id: "v1",
    title: "Default",
    sku: "SKU-001",
    barcode: null,
    ean: null,
    upc: null,
    thumbnail: null,
    allow_backorder: false,
    manage_inventory: true,
    hs_code: null,
    origin_country: null,
    mid_code: null,
    material: null,
    weight: null,
    length: null,
    height: null,
    width: null,
    metadata: null,
    created_at: "",
    updated_at: "",
    deleted_at: null,
    variant_rank: null,
    product_id: "prod_1",
    options: null,
    prices: null,
    ...overrides,
  } as HttpTypes.StoreProductVariant
}

describe("productToPdpPriceCard", () => {
  it("formats price from calculated_amount", () => {
    const variant = makeVariant({
      calculated_price: { calculated_amount: 103200 },
    })
    const result = productToPdpPriceCard(variant, makeProduct({}))
    expect(result.price).toBe("1.032,00 RON")
  })

  it("returns Preț la cerere when calculated_price is null", () => {
    const variant = makeVariant({ calculated_price: null })
    const result = productToPdpPriceCard(variant, makeProduct({}))
    expect(result.price).toBe("Preț la cerere")
    expect(result.was).toBeUndefined()
    expect(result.priceNoTax).toBeUndefined()
  })

  it("returns Preț la cerere when calculated_amount is null", () => {
    const variant = makeVariant({
      calculated_price: { calculated_amount: null },
    })
    const result = productToPdpPriceCard(variant, makeProduct({}))
    expect(result.price).toBe("Preț la cerere")
  })

  it("sets priceNoTax without 19% VAT", () => {
    const variant = makeVariant({
      calculated_price: { calculated_amount: 11900 },
    })
    const result = productToPdpPriceCard(variant, makeProduct({}))
    // 11900 / 1.19 = 10000 => "100,00 RON"
    expect(result.priceNoTax).toBe("100,00 RON")
  })

  it("sets was, save, promoLabel, promoDate for promo:30 product", () => {
    const variant = makeVariant({
      calculated_price: { calculated_amount: 7000 },
    })
    const product = makeProduct({
      tags: [{ id: "t1", value: "promo:30" }],
    })
    const result = productToPdpPriceCard(variant, product)

    expect(result.price).toBe("70,00 RON")
    // was = round(7000 / 0.7) = 10000 => "100,00 RON"
    expect(result.was).toBe("100,00 RON")
    // save = 10000 - 7000 = 3000 => "Economisești 30,00 RON"
    expect(result.save).toBe("Economisești 30,00 RON")
    expect(result.promoLabel).toBe("Promoție activă - expiră: ")
    expect(result.promoDate).toBe("31 mai 2025")
  })

  it("does NOT set was/save when no promo tag", () => {
    const variant = makeVariant({
      calculated_price: { calculated_amount: 15000 },
    })
    const result = productToPdpPriceCard(variant, makeProduct({}))
    expect(result.was).toBeUndefined()
    expect(result.save).toBeUndefined()
    expect(result.promoLabel).toBeUndefined()
    expect(result.promoDate).toBeUndefined()
  })

  it("does NOT set was/save when tags is null", () => {
    const variant = makeVariant({
      calculated_price: { calculated_amount: 15000 },
    })
    const result = productToPdpPriceCard(variant, makeProduct({ tags: null }))
    expect(result.was).toBeUndefined()
  })

  it("includes priceNoTax for promo product too", () => {
    const variant = makeVariant({
      calculated_price: { calculated_amount: 11900 },
    })
    const product = makeProduct({
      tags: [{ id: "t1", value: "promo:30" }],
    })
    const result = productToPdpPriceCard(variant, product)
    expect(result.priceNoTax).toBeDefined()
    expect(result.priceNoTax).toBe("100,00 RON")
  })
})
