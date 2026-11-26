import { describe, it, expect } from "vitest"
import { productToCard, formatOptionValue } from "../product-to-card"
import { imageVariant } from "../../image-variant"
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
    expect(card.brandHref).toBe("/search?brand=tenax")
  })

  it("uses custom countryCode", () => {
    const card = productToCard(makeProduct({}), "en")
    expect(card.href).toBe("/products/mastic-tenax-transparente")
    expect(card.brandHref).toBe("/search?brand=tenax")
  })

  it("uses thumbnail as image (small variant)", () => {
    const card = productToCard(makeProduct({}))
    expect(card.image).toBe(imageVariant("https://cdn.example.com/thumb.jpg", "small"))
  })

  it("falls back to first image URL when no thumbnail (small variant)", () => {
    const product = makeProduct({
      thumbnail: null,
      images: [
        { id: "img1", url: "https://cdn.example.com/img1.jpg", rank: 0 },
      ],
    })
    const card = productToCard(product)
    expect(card.image).toBe(imageVariant("https://cdn.example.com/img1.jpg", "small"))
  })

  it("returns empty string when no thumbnail AND no images", () => {
    const product = makeProduct({ thumbnail: null, images: null })
    const card = productToCard(product)
    expect(card.image).toBe("")
  })

  it("returns empty string when thumbnail null and images is empty array", () => {
    const product = makeProduct({ thumbnail: null, images: [] })
    const card = productToCard(product)
    expect(card.image).toBe("")
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

  function variant(id: string, opts: Array<[string, string]>): TestVariant {
    return {
      id,
      sku: id,
      calculated_price: { calculated_amount: 5000, original_amount: null },
      options: opts.map(([title, value], i) => ({
        id: `${id}-ov${i}`,
        value,
        option: { id: `o-${title}`, title, product_id: "prod_1" },
      })),
    } as TestVariant
  }

  it("builds variant specs with readable values for the tooltip (Solido)", () => {
    const colors = ["ALB", "BEJ", "NEGRU", "JURA"]
    const sizes = ["4 LITRI", "1 LITRU", "18 LITRI"]
    const variants = colors.flatMap((c) => sizes.map((q) => variant(`${c}-${q}`, [["CULOARE", c], ["CANTITATE", q]])))
    const card = productToCard(makeProduct({ variants }))
    expect(card.specs).toEqual([
      { label: "4 culori", values: ["Alb", "Bej", "Negru", "Jura"] },
      { label: "3 ambalaje", values: ["1 L", "4 L", "18 L"] },
    ])
  })

  it("skips axes with a single value", () => {
    const card = productToCard(makeProduct({}))
    expect(card.specs).toBeUndefined()
  })

  it("limits specs to max 3", () => {
    const product = makeProduct({
      variants: ["A", "B"].map((v) => variant(v, [["OPT1", v], ["OPT2", v], ["OPT3", v], ["OPT4", v]])),
    })
    const card = productToCard(product)
    expect(card.specs).toHaveLength(3)
  })

  it.each([
    ["BUCATĂ (1 BUC.)", "Bucată (1 buc.)"],
    ["CUTIE (10 BUC.)", "Cutie (10 buc.)"],
    ["A (1 L) + B (1 L)", "A (1 L) + B (1 L)"],
    ["700 GRAME", "700 g"],
    ["5 KG", "5 kg"],
    ["CERAMICĂ CC", "Ceramică CC"],
    ["6 mm", "6 mm"],
    ["SILENȚIOS TLS", "Silențios TLS"],
  ])("formats option value %s -> %s", (raw, expected) => {
    expect(formatOptionValue(raw)).toBe(expected)
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

describe("productToCard - stoc pentru adaugarea directa", () => {
  it("single tracked variant fara stoc si fara backorder -> defaultVariantSoldOut", () => {
    const card = productToCard(
      makeProduct({
        variants: [{ id: "v1", manage_inventory: true, allow_backorder: false, inventory_quantity: 0 }],
      })
    )
    expect(card.defaultVariantSoldOut).toBe(true)
  })

  it("single variant neurmarita (inventory_quantity lipsa) ramane disponibila", () => {
    const card = productToCard(
      makeProduct({ variants: [{ id: "v1", manage_inventory: false }] })
    )
    expect(card.defaultVariantSoldOut).toBe(false)
  })

  it("single tracked variant cu backorder ramane disponibila", () => {
    const card = productToCard(
      makeProduct({
        variants: [{ id: "v1", manage_inventory: true, allow_backorder: true, inventory_quantity: 0 }],
      })
    )
    expect(card.defaultVariantSoldOut).toBe(false)
  })

  it("produs cu mai multe variante nu e marcat epuizat pe card (duce la PDP)", () => {
    const card = productToCard(
      makeProduct({
        variants: [
          { id: "v1", manage_inventory: true, inventory_quantity: 0 },
          { id: "v2", manage_inventory: false },
        ],
      })
    )
    expect(card.hasMultipleRealVariants).toBe(true)
    expect(card.defaultVariantSoldOut).toBe(false)
  })
})
