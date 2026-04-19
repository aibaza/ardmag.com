import { describe, it, expect } from "vitest"
import { productToBadges } from "../product-to-badges"
import type { HttpTypes } from "@medusajs/types"

type TestVariant = Partial<HttpTypes.StoreProductVariant> & {
  inventory_quantity?: number | null
  calculated_price?: {
    calculated_amount: number | null
    original_amount?: number | null
  } | null
}

function makeProduct(
  overrides: Partial<HttpTypes.StoreProduct> & { variants?: TestVariant[] }
): HttpTypes.StoreProduct {
  return {
    id: "prod_1",
    title: "Test Product",
    handle: "test-product",
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

describe("productToBadges", () => {
  it("returns promo badge when calculated_amount < original_amount (real Price List discount)", () => {
    const product = makeProduct({
      variants: [
        {
          id: "v1",
          calculated_price: { calculated_amount: 7000, original_amount: 10000 },
        },
      ],
    })
    const badges = productToBadges(product)
    expect(badges).toContainEqual({ type: "promo", label: "-30%" })
  })

  it("computes discount percentage from real amounts", () => {
    const product = makeProduct({
      variants: [
        {
          id: "v1",
          calculated_price: { calculated_amount: 8000, original_amount: 10000 },
        },
      ],
    })
    const badges = productToBadges(product)
    expect(badges).toContainEqual({ type: "promo", label: "-20%" })
  })

  it("uses the highest discount across variants", () => {
    const product = makeProduct({
      variants: [
        {
          id: "v1",
          calculated_price: { calculated_amount: 9000, original_amount: 10000 }, // 10%
        },
        {
          id: "v2",
          calculated_price: { calculated_amount: 5000, original_amount: 10000 }, // 50%
        },
      ],
    })
    const badges = productToBadges(product)
    expect(badges).toContainEqual({ type: "promo", label: "-50%" })
  })

  it("does NOT return promo badge when calculated_amount === original_amount", () => {
    const product = makeProduct({
      variants: [
        {
          id: "v1",
          calculated_price: { calculated_amount: 10000, original_amount: 10000 },
        },
      ],
    })
    const badges = productToBadges(product)
    expect(badges.some((b) => b.type === "promo")).toBe(false)
  })

  it("does NOT return promo badge when original_amount is null (no price list)", () => {
    const product = makeProduct({
      variants: [
        {
          id: "v1",
          calculated_price: { calculated_amount: 10000, original_amount: null },
        },
      ],
    })
    const badges = productToBadges(product)
    expect(badges.some((b) => b.type === "promo")).toBe(false)
  })

  it("falls back to metadata.ribbon for legacy decorative promo (no price list active)", () => {
    const product = makeProduct({
      metadata: { ribbon: "PROMO 30%" },
      variants: [
        {
          id: "v1",
          calculated_price: { calculated_amount: 10000, original_amount: null },
        },
      ],
    })
    const badges = productToBadges(product)
    expect(badges).toContainEqual({ type: "promo", label: "-30%" })
  })

  it("real price list discount takes priority over ribbon metadata", () => {
    const product = makeProduct({
      metadata: { ribbon: "PROMO 30%" },
      variants: [
        {
          id: "v1",
          calculated_price: { calculated_amount: 8000, original_amount: 10000 }, // 20%
        },
      ],
    })
    const badges = productToBadges(product)
    // Should show real discount, not ribbon value
    expect(badges).toContainEqual({ type: "promo", label: "-20%" })
    expect(badges.filter((b) => b.type === "promo")).toHaveLength(1)
  })

  it("returns stock-low badge when ALL variants have inventory_quantity=0 and manage_inventory=true", () => {
    const product = makeProduct({
      variants: [
        { id: "v1", manage_inventory: true, inventory_quantity: 0 },
        { id: "v2", manage_inventory: true, inventory_quantity: 0 },
      ],
    })
    const badges = productToBadges(product)
    expect(badges).toContainEqual({ type: "stock-low", label: "Stoc limitat" })
  })

  it("does NOT return stock-low when at least one variant has stock", () => {
    const product = makeProduct({
      variants: [
        { id: "v1", manage_inventory: true, inventory_quantity: 0 },
        { id: "v2", manage_inventory: true, inventory_quantity: 5 },
      ],
    })
    const badges = productToBadges(product)
    expect(badges.some((b) => b.type === "stock-low")).toBe(false)
  })

  it("does NOT return stock-low when manage_inventory=false even if quantity=0", () => {
    const product = makeProduct({
      variants: [
        { id: "v1", manage_inventory: false, inventory_quantity: 0 },
      ],
    })
    const badges = productToBadges(product)
    expect(badges.some((b) => b.type === "stock-low")).toBe(false)
  })

  it("returns empty array for normal product with stock and no promo", () => {
    const product = makeProduct({
      tags: [{ id: "t1", value: "brand:sait" }, { id: "t2", value: "material:granit" }],
      variants: [
        {
          id: "v1",
          manage_inventory: true,
          inventory_quantity: 100,
          calculated_price: { calculated_amount: 10000, original_amount: null },
        },
      ],
    })
    const badges = productToBadges(product)
    expect(badges).toHaveLength(0)
  })

  it("can return both promo and stock-low badges simultaneously", () => {
    const product = makeProduct({
      variants: [
        {
          id: "v1",
          manage_inventory: true,
          inventory_quantity: 0,
          calculated_price: { calculated_amount: 7000, original_amount: 10000 },
        },
      ],
    })
    const badges = productToBadges(product)
    expect(badges.some((b) => b.type === "promo")).toBe(true)
    expect(badges.some((b) => b.type === "stock-low")).toBe(true)
  })

  it("does NOT return stock-low when variants array is empty", () => {
    const product = makeProduct({ variants: [] })
    const badges = productToBadges(product)
    expect(badges.some((b) => b.type === "stock-low")).toBe(false)
  })

  it("does NOT return stock-low when inventory_quantity is null (untracked)", () => {
    const product = makeProduct({
      variants: [
        { id: "v1", manage_inventory: true, inventory_quantity: null },
      ],
    })
    const badges = productToBadges(product)
    expect(badges.some((b) => b.type === "stock-low")).toBe(false)
  })
})
