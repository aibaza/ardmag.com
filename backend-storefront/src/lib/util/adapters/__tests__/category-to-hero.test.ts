import { describe, it, expect } from "vitest"
import { categoryToHero } from "../category-to-hero"
import type { HttpTypes } from "@medusajs/types"

function makeCategory(
  overrides: Partial<HttpTypes.StoreProductCategory>
): HttpTypes.StoreProductCategory {
  return {
    id: "cat_1",
    name: "Discuri Diamantate",
    description: "Discuri pentru taierea pietrei naturale",
    handle: "discuri-diamantate",
    rank: null,
    parent_category_id: null,
    parent_category: null,
    category_children: [],
    created_at: "",
    updated_at: "",
    ...overrides,
  } as unknown as HttpTypes.StoreProductCategory
}

function makeProducts(count: number, brandTags: string[] = []): HttpTypes.StoreProduct[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `prod_${i}`,
    title: `Product ${i}`,
    handle: `product-${i}`,
    tags: brandTags.map((v) => ({ id: `tag_${v}`, value: v, created_at: "", updated_at: "" })),
    variants: [],
    options: [],
    images: [],
    status: "published" as const,
    created_at: "",
    updated_at: "",
  } as unknown as HttpTypes.StoreProduct))
}

describe("categoryToHero", () => {
  it("uses category.name as title", () => {
    const result = categoryToHero(makeCategory({ name: "Mastici Tenax" }), makeProducts(5))
    expect(result.title).toBe("Mastici Tenax")
  })

  it("uses category.description", () => {
    const result = categoryToHero(makeCategory({ description: "Descriere categorie" }), makeProducts(3))
    expect(result.description).toBe("Descriere categorie")
  })

  it("returns empty string for description when category has no description", () => {
    const result = categoryToHero(makeCategory({ description: "" }), makeProducts(2))
    expect(result.description).toBe("")
  })

  it("handles long category name without crashing", () => {
    const longName = "Categorie cu un nume extrem de lung care " + "x".repeat(60)
    const result = categoryToHero(makeCategory({ name: longName }), makeProducts(1))
    expect(result.title).toBe(longName)
  })

  it("sets eyebrow with product count", () => {
    const result = categoryToHero(makeCategory({}), makeProducts(10))
    expect(result.eyebrow).toBe("Categorie · 10 produse")
  })

  it("includes brand count in meta when brands present", () => {
    const products = makeProducts(4, ["brand:Tenax", "brand:Sait"])
    const result = categoryToHero(makeCategory({}), products)
    const brandItem = result.meta.find((m) => m.label === "branduri" || m.label === "brand")
    expect(brandItem?.strong).toBe("2")
  })

  it("omits brand meta item when no brands", () => {
    const result = categoryToHero(makeCategory({}), makeProducts(3))
    const hasBrandItem = result.meta.some((m) => m.label === "branduri" || m.label === "brand")
    expect(hasBrandItem).toBe(false)
  })

  it("always includes Cluj-Napoca stock meta", () => {
    const result = categoryToHero(makeCategory({}), makeProducts(5))
    const stockItem = result.meta.find((m) => m.prefix === "Stoc ")
    expect(stockItem?.strong).toBe("Cluj-Napoca")
  })
})
