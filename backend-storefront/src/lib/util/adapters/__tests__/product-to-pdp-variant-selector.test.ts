import { describe, it, expect } from "vitest"
import { productToPdpVariantSelector } from "../product-to-pdp-variant-selector"
import type { HttpTypes } from "@medusajs/types"

type TestVariant = Partial<HttpTypes.StoreProductVariant> & {
  inventory_quantity?: number | null
}

function makeOpt(
  value: string,
  optionTitle: string,
  optionId: string
): HttpTypes.StoreProductOptionValue {
  return {
    id: `ov-${value}-${optionId}`,
    value,
    option_id: optionId,
    option: { id: optionId, title: optionTitle, product_id: "prod_1" },
  }
}

function makeProduct(
  overrides: Partial<HttpTypes.StoreProduct> & { variants?: TestVariant[] }
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
    variants: [],
    ...(overrides as Partial<HttpTypes.StoreProduct>),
  }
}

describe("productToPdpVariantSelector", () => {
  it("returns [] for single variant with no options (default variant)", () => {
    const product = makeProduct({
      variants: [{ id: "v1", title: "Default", options: [] }],
    })
    expect(productToPdpVariantSelector(product)).toEqual([])
  })

  it("returns [] for empty variants array", () => {
    const product = makeProduct({ variants: [] })
    expect(productToPdpVariantSelector(product)).toEqual([])
  })

  it("groups variants by option dimension", () => {
    const product = makeProduct({
      variants: [
        {
          id: "v1",
          title: "TRANSPARENT / 1 LITRU",
          manage_inventory: true,
          inventory_quantity: 100,
          options: [
            makeOpt("TRANSPARENT", "CULOARE", "o1"),
            makeOpt("1 LITRU", "CANTITATE", "o2"),
          ],
        },
        {
          id: "v2",
          title: "BEJ / 1 LITRU",
          manage_inventory: true,
          inventory_quantity: 100,
          options: [
            makeOpt("BEJ", "CULOARE", "o1"),
            makeOpt("1 LITRU", "CANTITATE", "o2"),
          ],
        },
        {
          id: "v3",
          title: "TRANSPARENT / 5 LITRI",
          manage_inventory: true,
          inventory_quantity: 100,
          options: [
            makeOpt("TRANSPARENT", "CULOARE", "o1"),
            makeOpt("5 LITRI", "CANTITATE", "o2"),
          ],
        },
      ],
    })
    const groups = productToPdpVariantSelector(product)
    expect(groups).toHaveLength(2)
    expect(groups[0].title).toBe("CULOARE")
    expect(groups[1].title).toBe("CANTITATE")
  })

  it("marks active option for selectedVariantId", () => {
    const product = makeProduct({
      variants: [
        {
          id: "v1",
          options: [makeOpt("TRANSPARENT", "CULOARE", "o1")],
          manage_inventory: true,
          inventory_quantity: 100,
        },
        {
          id: "v2",
          options: [makeOpt("BEJ", "CULOARE", "o1")],
          manage_inventory: true,
          inventory_quantity: 100,
        },
      ],
    })
    const groups = productToPdpVariantSelector(product, "v2")
    const culoareGroup = groups[0]
    const bejOpt = culoareGroup.options.find((o) => o.label === "BEJ")
    const transpOpt = culoareGroup.options.find((o) => o.label === "TRANSPARENT")
    expect(bejOpt?.active).toBe(true)
    expect(transpOpt?.active).toBeUndefined()
  })

  it("marks first variant as active when no selectedVariantId", () => {
    const product = makeProduct({
      variants: [
        {
          id: "v1",
          options: [makeOpt("TRANSPARENT", "CULOARE", "o1")],
          manage_inventory: true,
          inventory_quantity: 100,
        },
        {
          id: "v2",
          options: [makeOpt("BEJ", "CULOARE", "o1")],
          manage_inventory: true,
          inventory_quantity: 100,
        },
      ],
    })
    const groups = productToPdpVariantSelector(product)
    const activeOpt = groups[0].options.find((o) => o.active)
    expect(activeOpt?.label).toBe("TRANSPARENT")
  })

  it("marks unavailable when all variants with that value are out of stock", () => {
    const product = makeProduct({
      variants: [
        {
          id: "v1",
          options: [makeOpt("BEJ", "CULOARE", "o1")],
          manage_inventory: true,
          inventory_quantity: 0,
        },
        {
          id: "v2",
          options: [makeOpt("TRANSPARENT", "CULOARE", "o1")],
          manage_inventory: true,
          inventory_quantity: 10,
        },
      ],
    })
    const groups = productToPdpVariantSelector(product)
    const bejOpt = groups[0].options.find((o) => o.label === "BEJ")
    const transpOpt = groups[0].options.find((o) => o.label === "TRANSPARENT")
    expect(bejOpt?.unavailable).toBe(true)
    expect(transpOpt?.unavailable).toBeUndefined()
  })

  it("does NOT mark unavailable when manage_inventory=false", () => {
    const product = makeProduct({
      variants: [
        {
          id: "v1",
          options: [makeOpt("BEJ", "CULOARE", "o1")],
          manage_inventory: false,
          inventory_quantity: 0,
        },
      ],
    })
    const groups = productToPdpVariantSelector(product)
    const bejOpt = groups[0].options.find((o) => o.label === "BEJ")
    expect(bejOpt?.unavailable).toBeUndefined()
  })

  it("shows discount on options when variant has real Price List discount", () => {
    const product = makeProduct({
      variants: [
        {
          id: "v1",
          options: [makeOpt("1 LITRU", "CANTITATE", "o2")],
          manage_inventory: true,
          inventory_quantity: 100,
          calculated_price: { calculated_amount: 7000, original_amount: 10000 },
        } as any,
      ],
    })
    const groups = productToPdpVariantSelector(product)
    const opt = groups[0].options[0]
    expect(opt.discount).toBe("-30%")
  })

  it("does NOT show discount when calculated_amount equals original_amount", () => {
    const product = makeProduct({
      variants: [
        {
          id: "v1",
          options: [makeOpt("1 LITRU", "CANTITATE", "o2")],
          manage_inventory: true,
          inventory_quantity: 100,
          calculated_price: { calculated_amount: 10000, original_amount: 10000 },
        } as any,
      ],
    })
    const groups = productToPdpVariantSelector(product)
    const opt = groups[0].options[0]
    expect(opt.discount).toBeUndefined()
  })

  it("does NOT show discount when no calculated_price", () => {
    const product = makeProduct({
      tags: null,
      variants: [
        {
          id: "v1",
          options: [makeOpt("1 LITRU", "CANTITATE", "o2")],
          manage_inventory: true,
          inventory_quantity: 100,
        },
      ],
    })
    const groups = productToPdpVariantSelector(product)
    const opt = groups[0].options[0]
    expect(opt.discount).toBeUndefined()
  })

  it("handles single variant with visible option (not a default variant)", () => {
    const product = makeProduct({
      variants: [
        {
          id: "v1",
          options: [makeOpt("5 LITRI", "CANTITATE", "o2")],
          manage_inventory: true,
          inventory_quantity: 100,
        },
      ],
    })
    const groups = productToPdpVariantSelector(product)
    // Single variant but has options - should still show
    expect(groups).toHaveLength(1)
    expect(groups[0].title).toBe("CANTITATE")
  })

  it("each option carries variantId of the first matching variant", () => {
    const product = makeProduct({
      variants: [
        {
          id: "v1",
          title: "TRANSPARENT / 1 LITRU",
          manage_inventory: true,
          inventory_quantity: 100,
          options: [
            makeOpt("TRANSPARENT", "CULOARE", "o1"),
            makeOpt("1 LITRU", "CANTITATE", "o2"),
          ],
        },
        {
          id: "v2",
          title: "BEJ / 1 LITRU",
          manage_inventory: true,
          inventory_quantity: 100,
          options: [
            makeOpt("BEJ", "CULOARE", "o1"),
            makeOpt("1 LITRU", "CANTITATE", "o2"),
          ],
        },
        {
          id: "v3",
          title: "TRANSPARENT / 5 LITRI",
          manage_inventory: true,
          inventory_quantity: 100,
          options: [
            makeOpt("TRANSPARENT", "CULOARE", "o1"),
            makeOpt("5 LITRI", "CANTITATE", "o2"),
          ],
        },
      ],
    })
    const groups = productToPdpVariantSelector(product)
    expect(groups[0].options.find((o) => o.label === "TRANSPARENT")?.variantId).toBe("v1")
    expect(groups[0].options.find((o) => o.label === "BEJ")?.variantId).toBe("v2")
    expect(groups[1].options.find((o) => o.label === "1 LITRU")?.variantId).toBe("v1")
    expect(groups[1].options.find((o) => o.label === "5 LITRI")?.variantId).toBe("v3")
  })

  it("variantId is present on all options when single visible variant", () => {
    const product = makeProduct({
      variants: [
        {
          id: "v1",
          options: [makeOpt("5 LITRI", "CANTITATE", "o2")],
          manage_inventory: true,
          inventory_quantity: 100,
        },
      ],
    })
    const groups = productToPdpVariantSelector(product)
    expect(groups[0].options[0].variantId).toBe("v1")
  })
})
