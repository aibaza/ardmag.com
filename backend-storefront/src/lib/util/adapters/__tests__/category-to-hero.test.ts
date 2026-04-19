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
  it("uses category.name as title", () => {
    const result = categoryToHero(makeCategory({ name: "Mastici Tenax" }))
    expect(result.title).toBe("Mastici Tenax")
  })

  it("uses category.description", () => {
    const result = categoryToHero(makeCategory({ description: "Descriere categorie" }))
    expect(result.description).toBe("Descriere categorie")
  })

  it("returns empty string for description when category has no description", () => {
    const result = categoryToHero(makeCategory({ description: "" }))
    expect(result.description).toBe("")
  })

  it("handles long category name without crashing", () => {
    const longName = "Categorie cu un nume extrem de lung care " + "x".repeat(60)
    const result = categoryToHero(makeCategory({ name: longName }))
    expect(result.title).toBe(longName)
  })
})
