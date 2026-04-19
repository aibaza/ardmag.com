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
  }
}

describe("categoryToHero", () => {
  it("sets eyebrow to CATEGORIE", () => {
    const result = categoryToHero(makeCategory({}), 12)
    expect(result.eyebrow).toBe("CATEGORIE")
  })

  it("uses category.name as title", () => {
    const result = categoryToHero(makeCategory({ name: "Mastici Tenax" }), 5)
    expect(result.title).toBe("Mastici Tenax")
  })

  it("uses category.description", () => {
    const result = categoryToHero(
      makeCategory({ description: "Descriere categorie" }),
      3
    )
    expect(result.description).toBe("Descriere categorie")
  })

  it("returns empty string for description when category has no description", () => {
    // StoreProductCategory has description as string (not optional in base type)
    // but we handle empty string
    const result = categoryToHero(makeCategory({ description: "" }), 0)
    expect(result.description).toBe("")
  })

  it("includes productCount in meta", () => {
    const result = categoryToHero(makeCategory({}), 25)
    expect(result.meta).toContain("25 produse")
  })

  it("handles 0 products", () => {
    const result = categoryToHero(makeCategory({}), 0)
    expect(result.meta).toContain("0 produse")
  })

  it("handles 1 product", () => {
    const result = categoryToHero(makeCategory({}), 1)
    expect(result.meta).toContain("1 produse")
  })

  it("handles long category name without crashing", () => {
    const longName = "Categorie cu un nume extrem de lung care " + "x".repeat(60)
    const result = categoryToHero(makeCategory({ name: longName }), 5)
    expect(result.title).toBe(longName)
  })
})
