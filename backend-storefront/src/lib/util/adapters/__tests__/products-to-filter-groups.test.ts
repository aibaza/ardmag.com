import { describe, it, expect } from "vitest"
import { productsToFilterGroups } from "../products-to-filter-groups"
import type { HttpTypes } from "@medusajs/types"

type TestVariant = Partial<HttpTypes.StoreProductVariant> & {
  calculated_price?: { calculated_amount: number | null } | null
}

function makeProduct(
  id: string,
  tags: Array<{ id: string; value: string }> | null,
  variants: TestVariant[] = []
): HttpTypes.StoreProduct {
  return {
    id,
    title: `Product ${id}`,
    handle: `product-${id}`,
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
    tags,
    images: null,
    options: null,
    variants: variants as HttpTypes.StoreProductVariant[],
  }
}

describe("productsToFilterGroups", () => {
  it("creates brand checkboxes group from brand: tags", () => {
    const products = [
      makeProduct("p1", [{ id: "t1", value: "brand:tenax" }]),
      makeProduct("p2", [{ id: "t2", value: "brand:sait" }]),
      makeProduct("p3", [{ id: "t3", value: "brand:tenax" }]),
    ]
    const groups = productsToFilterGroups(products)
    const brandGroup = groups.find((g) => g.title === "Brand")
    expect(brandGroup).toBeDefined()
    expect(brandGroup?.type).toBe("checkboxes")
    if (brandGroup?.type === "checkboxes") {
      expect(brandGroup.options).toHaveLength(2)
      const tenaxOpt = brandGroup.options.find((o) => o.label === "Tenax")
      expect(tenaxOpt?.count).toBe(2)
    }
  })

  it("creates material checkboxes group from material: tags", () => {
    const products = [
      makeProduct("p1", [{ id: "t1", value: "material:granit" }]),
      makeProduct("p2", [{ id: "t2", value: "material:marmura" }]),
      makeProduct("p3", [{ id: "t3", value: "material:granit" }]),
    ]
    const groups = productsToFilterGroups(products)
    const matGroup = groups.find((g) => g.title === "Material")
    expect(matGroup).toBeDefined()
    if (matGroup?.type === "checkboxes") {
      const granitOpt = matGroup.options.find((o) => o.label === "Granit")
      expect(granitOpt?.count).toBe(2)
    }
  })

  it("sorts brand options by count descending", () => {
    const products = [
      makeProduct("p1", [{ id: "t1", value: "brand:sait" }]),
      makeProduct("p2", [{ id: "t2", value: "brand:tenax" }]),
      makeProduct("p3", [{ id: "t3", value: "brand:tenax" }]),
      makeProduct("p4", [{ id: "t4", value: "brand:tenax" }]),
    ]
    const groups = productsToFilterGroups(products)
    const brandGroup = groups.find((g) => g.title === "Brand")
    if (brandGroup?.type === "checkboxes") {
      expect(brandGroup.options[0].label).toBe("Tenax")
      expect(brandGroup.options[1].label).toBe("Sait")
    }
  })

  it("capitalizes hyphenated brand slug", () => {
    const products = [
      makeProduct("p1", [{ id: "t1", value: "brand:delta-research" }]),
    ]
    const groups = productsToFilterGroups(products)
    const brandGroup = groups.find((g) => g.title === "Brand")
    if (brandGroup?.type === "checkboxes") {
      expect(brandGroup.options[0].label).toBe("Delta Research")
    }
  })

  it("marks checked when brand in activeFilters.brands", () => {
    const products = [
      makeProduct("p1", [{ id: "t1", value: "brand:tenax" }]),
      makeProduct("p2", [{ id: "t2", value: "brand:sait" }]),
    ]
    const groups = productsToFilterGroups(products, { brands: ["tenax"] })
    const brandGroup = groups.find((g) => g.title === "Brand")
    if (brandGroup?.type === "checkboxes") {
      const tenaxOpt = brandGroup.options.find((o) => o.label === "Tenax")
      const saitOpt = brandGroup.options.find((o) => o.label === "Sait")
      expect(tenaxOpt?.checked).toBe(true)
      expect(saitOpt?.checked).toBe(false)
    }
  })

  it("omits brand group when no brand tags exist", () => {
    const products = [
      makeProduct("p1", null),
      makeProduct("p2", [{ id: "t1", value: "material:granit" }]),
    ]
    const groups = productsToFilterGroups(products)
    expect(groups.find((g) => g.title === "Brand")).toBeUndefined()
  })

  it("omits material group when no material tags exist", () => {
    const products = [
      makeProduct("p1", [{ id: "t1", value: "brand:tenax" }]),
    ]
    const groups = productsToFilterGroups(products)
    expect(groups.find((g) => g.title === "Material")).toBeUndefined()
  })

  it("creates price range group from product prices", () => {
    const products = [
      makeProduct("p1", null, [
        { id: "v1", calculated_price: { calculated_amount: 5000 } },
      ]),
      makeProduct("p2", null, [
        { id: "v2", calculated_price: { calculated_amount: 30000 } },
      ]),
    ]
    const groups = productsToFilterGroups(products)
    const priceGroup = groups.find((g) => g.type === "price-range")
    expect(priceGroup).toBeDefined()
    if (priceGroup?.type === "price-range") {
      expect(priceGroup.min).toBe(50)   // 5000 / 100
      expect(priceGroup.max).toBe(300)  // 30000 / 100
    }
  })

  it("omits price group when all products have null prices", () => {
    const products = [
      makeProduct("p1", null, [{ id: "v1", calculated_price: null }]),
    ]
    const groups = productsToFilterGroups(products)
    expect(groups.find((g) => g.type === "price-range")).toBeUndefined()
  })

  it("returns empty array for empty products list", () => {
    const groups = productsToFilterGroups([])
    expect(groups).toHaveLength(0)
  })

  it("handles all null tags gracefully", () => {
    const products = [
      makeProduct("p1", null),
      makeProduct("p2", null),
    ]
    const groups = productsToFilterGroups(products)
    expect(groups.find((g) => g.title === "Brand")).toBeUndefined()
    expect(groups.find((g) => g.title === "Material")).toBeUndefined()
  })

  it("does not double-count a brand on the same product", () => {
    // Product has duplicate brand tags (edge case)
    const products = [
      makeProduct("p1", [
        { id: "t1", value: "brand:tenax" },
        { id: "t2", value: "brand:tenax" }, // duplicate
      ]),
    ]
    const groups = productsToFilterGroups(products)
    const brandGroup = groups.find((g) => g.title === "Brand")
    if (brandGroup?.type === "checkboxes") {
      const tenaxOpt = brandGroup.options.find((o) => o.label === "Tenax")
      expect(tenaxOpt?.count).toBe(1)
    }
  })
})
