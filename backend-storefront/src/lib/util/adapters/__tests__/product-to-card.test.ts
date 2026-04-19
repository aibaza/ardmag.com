import { describe, it, expect } from "vitest"
import { productToCard } from "../product-to-card"
import type { HttpTypes } from "@medusajs/types"

type TestVariant = Partial<HttpTypes.StoreProductVariant> & {
  calculated_price?: {
    calculated_amount: number | null
    original_amount?: number | null
  } | null
  inventory_quantity?: number | null
}

function makeProduct(
  overrides: Partial<HttpTypes.StoreProduct> & { variants?: TestVariant[] }
): HttpTypes.StoreProduct {
  return {
    id: "prod_1",
    title: "Mastic Tenax Transparente",
    handle: "mastic-tenax-transparente",
    description: null,
    subtitle: null,
    is_giftcard: false,
    status: "published",
    thumbnail: "https://cdn.example.com/thumb.jpg",
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
    tags: [{ id: "t1", value: "brand:tenax" }],
    images: null,
    options: null,
    variants: [
      {
        id: "v1",
        sku: "TEN-TRANSP-1L",
        calculated_price: { calculated_amount: 11500, original_amount: null },
        options: [
          {
            id: "ov1",
            value: "TRANSPARENT",
            option: { id: "o1", title: "CULOARE", product_id: "prod_1" },
          },
          {
            id: "ov2",
            value: "1 LITRU",
            option: { id: "o2", title: "CANTITATE", product_id: "prod_1" },
          },
        ],
      },
    ] as TestVariant[],
    ...(overrides as Partial<HttpTypes.StoreProduct>),
  }
}

describe("productToCard", () => {
  it("extracts brand from tags", () => {
    const card = productToCard(makeProduct({}))
    expect(card.brand).toBe("Tenax")
  })

  it("capitalizes hyphenated brand slug", () => {
    const card = productToCard(
      makeProduct({ tags: [{ id: "t1", value: "brand:delta-research" }] })
    )
    expect(card.brand).toBe("Delta Research")
  })

  it("sets brandHref with country code", () => {
    const card = productToCard(makeProduct({}))
    expect(card.brandHref).toBe("/ro/search?brand=tenax")
  })

  it("uses custom countryCode", () => {
    const card = productToCard(makeProduct({}), "en")
    expect(card.href).toBe("/en/products/mastic-tenax-transparente")
    expect(card.brandHref).toBe("/en/search?brand=tenax")
  })

  it("uses thumbnail as image", () => {
    const card = productToCard(makeProduct({}))
    expect(card.image).toBe("https://cdn.example.com/thumb.jpg")
  })

  it("falls back to first image URL when no thumbnail", () => {
    const product = makeProduct({
      thumbnail: null,
      images: [
        { id: "img1", url: "https://cdn.example.com/img1.jpg", rank: 0 },
      ],
    })
    const card = productToCard(product)
    expect(card.image).toBe("https://cdn.example.com/img1.jpg")
  })

  it("uses placeholder when no thumbnail AND no images", () => {
    const product = makeProduct({ thumbnail: null, images: null })
    const card = productToCard(product)
    expect(card.image).toBe("/static/images/placeholder.jpg")
  })

  it("uses placeholder when thumbnail null and images is empty array", () => {
    const product = makeProduct({ thumbnail: null, images: [] })
    const card = productToCard(product)
    expect(card.image).toBe("/static/images/placeholder.jpg")
  })

  it("formats price from calculated_amount", () => {
    const card = productToCard(makeProduct({}))
    expect(card.price.now).toBe("115,00 RON")
  })

  it("returns Preț la cerere when no calculated_price", () => {
    const product = makeProduct({
      variants: [{ id: "v1", sku: "SKU1", calculated_price: null }],
    })
    const card = productToCard(product)
    expect(card.price.now).toBe("Preț la cerere")
    expect(card.price.was).toBeUndefined()
  })

  it("sets was price from real original_amount (Price List discount)", () => {
    const product = makeProduct({
      variants: [
        {
          id: "v1",
          sku: "SKU1",
          calculated_price: { calculated_amount: 7000, original_amount: 10000 },
        },
      ],
    })
    const card = productToCard(product)
    expect(card.price.now).toBe("70,00 RON")
    expect(card.price.was).toBe("100,00 RON")
  })

  it("does NOT set was price when original_amount equals calculated_amount", () => {
    const product = makeProduct({
      variants: [
        {
          id: "v1",
          sku: "SKU1",
          calculated_price: { calculated_amount: 10000, original_amount: 10000 },
        },
      ],
    })
    const card = productToCard(product)
    expect(card.price.was).toBeUndefined()
  })

  it("does NOT set was price when original_amount is null", () => {
    const card = productToCard(makeProduct({}))
    expect(card.price.was).toBeUndefined()
  })

  it("extracts sku from first variant", () => {
    const card = productToCard(makeProduct({}))
    expect(card.sku).toBe("TEN-TRANSP-1L")
  })

  it("returns empty sku when no variants", () => {
    const product = makeProduct({ variants: [] })
    const card = productToCard(product)
    expect(card.sku).toBe("")
  })

  it("extracts specs from first variant options", () => {
    const card = productToCard(makeProduct({}))
    expect(card.specs).toEqual(["CULOARE", "CANTITATE"])
  })

  it("limits specs to max 3", () => {
    const product = makeProduct({
      variants: [
        {
          id: "v1",
          sku: "SKU1",
          calculated_price: { calculated_amount: 5000, original_amount: null },
          options: [
            { id: "ov1", value: "A", option: { id: "o1", title: "OPT1", product_id: "prod_1" } },
            { id: "ov2", value: "B", option: { id: "o2", title: "OPT2", product_id: "prod_1" } },
            { id: "ov3", value: "C", option: { id: "o3", title: "OPT3", product_id: "prod_1" } },
            { id: "ov4", value: "D", option: { id: "o4", title: "OPT4", product_id: "prod_1" } },
          ],
        },
      ],
    })
    const card = productToCard(product)
    expect(card.specs).toHaveLength(3)
  })

  it("sets empty string brand when no brand tag", () => {
    const product = makeProduct({
      tags: [{ id: "t1", value: "material:granit" }],
    })
    const card = productToCard(product)
    expect(card.brand).toBe("")
  })

  it("handles null tags gracefully", () => {
    const product = makeProduct({ tags: null })
    const card = productToCard(product)
    expect(card.brand).toBe("")
  })

  it("handles long title without crashing", () => {
    const longTitle = "A".repeat(100)
    const product = makeProduct({ title: longTitle })
    const card = productToCard(product)
    expect(card.title).toBe(longTitle)
    expect(card.imageAlt).toBe(longTitle)
  })

  it("includes promo badge when calculated_amount < original_amount", () => {
    const product = makeProduct({
      variants: [
        {
          id: "v1",
          sku: "SKU1",
          calculated_price: { calculated_amount: 7000, original_amount: 10000 },
        },
      ],
    })
    const card = productToCard(product)
    expect(card.badges?.some((b) => b.type === "promo")).toBe(true)
  })

  it("does NOT include promo badge when no price discount", () => {
    const card = productToCard(makeProduct({}))
    expect(card.badges?.some((b) => b.type === "promo")).toBe(false)
  })
})
