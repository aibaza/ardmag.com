import { describe, it, expect } from "vitest"
import { productToPdpGallery } from "../product-to-pdp-gallery"
import type { HttpTypes } from "@medusajs/types"

type TestVariant = Partial<HttpTypes.StoreProductVariant> & {
  inventory_quantity?: number | null
}

function makeProduct(
  overrides: Partial<HttpTypes.StoreProduct> & { variants?: TestVariant[] }
): HttpTypes.StoreProduct {
  return {
    id: "prod_1",
    title: "Diamond Blade 350mm",
    handle: "diamond-blade-350",
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
    tags: null,
    images: null,
    options: null,
    variants: [],
    ...(overrides as Partial<HttpTypes.StoreProduct>),
  }
}

describe("productToPdpGallery", () => {
  it("uses first image as mainImage", () => {
    const product = makeProduct({
      images: [
        { id: "img1", url: "https://cdn.example.com/img1.jpg", rank: 0 },
        { id: "img2", url: "https://cdn.example.com/img2.jpg", rank: 1 },
      ],
    })
    const result = productToPdpGallery(product)
    expect(result.mainImage.src).toBe("https://cdn.example.com/img1.jpg")
  })

  it("falls back to thumbnail when no images", () => {
    const product = makeProduct({ images: null })
    const result = productToPdpGallery(product)
    expect(result.mainImage.src).toBe("https://cdn.example.com/thumb.jpg")
  })

  it("uses placeholder when no thumbnail AND no images", () => {
    const product = makeProduct({ thumbnail: null, images: null })
    const result = productToPdpGallery(product)
    expect(result.mainImage.src).toBe("/static/images/placeholder.jpg")
  })

  it("uses placeholder when images is empty array and no thumbnail", () => {
    const product = makeProduct({ thumbnail: null, images: [] })
    const result = productToPdpGallery(product)
    expect(result.mainImage.src).toBe("/static/images/placeholder.jpg")
  })

  it("marks first thumb as active", () => {
    const product = makeProduct({
      images: [
        { id: "img1", url: "https://cdn.example.com/img1.jpg", rank: 0 },
        { id: "img2", url: "https://cdn.example.com/img2.jpg", rank: 1 },
      ],
    })
    const result = productToPdpGallery(product)
    expect(result.thumbs[0].active).toBe(true)
    expect(result.thumbs[1].active).toBeUndefined()
  })

  it("shows all thumbs when <= 4 images", () => {
    const product = makeProduct({
      images: [
        { id: "img1", url: "https://cdn.example.com/img1.jpg", rank: 0 },
        { id: "img2", url: "https://cdn.example.com/img2.jpg", rank: 1 },
        { id: "img3", url: "https://cdn.example.com/img3.jpg", rank: 2 },
        { id: "img4", url: "https://cdn.example.com/img4.jpg", rank: 3 },
      ],
    })
    const result = productToPdpGallery(product)
    expect(result.thumbs).toHaveLength(4)
    expect(result.thumbs.every((t) => t.extraCount === undefined)).toBe(true)
  })

  it("shows 4 thumbs with extraCount when > 4 images", () => {
    const product = makeProduct({
      images: [
        { id: "img1", url: "https://cdn.example.com/img1.jpg", rank: 0 },
        { id: "img2", url: "https://cdn.example.com/img2.jpg", rank: 1 },
        { id: "img3", url: "https://cdn.example.com/img3.jpg", rank: 2 },
        { id: "img4", url: "https://cdn.example.com/img4.jpg", rank: 3 },
        { id: "img5", url: "https://cdn.example.com/img5.jpg", rank: 4 },
        { id: "img6", url: "https://cdn.example.com/img6.jpg", rank: 5 },
      ],
    })
    const result = productToPdpGallery(product)
    expect(result.thumbs).toHaveLength(4)
    const lastThumb = result.thumbs[3]
    expect(lastThumb.extraCount).toBe(3) // 6 - 3 visible = 3 extra
  })

  it("includes promo badge from promo:30 tag", () => {
    const product = makeProduct({
      tags: [{ id: "t1", value: "promo:30" }],
    })
    const result = productToPdpGallery(product)
    expect(result.badges.some((b) => b.type === "promo")).toBe(true)
  })

  it("badges do not have dotVariant property (PDP context)", () => {
    const product = makeProduct({
      tags: [{ id: "t1", value: "promo:30" }],
    })
    const result = productToPdpGallery(product)
    result.badges.forEach((b) => {
      expect("dotVariant" in b).toBe(false)
    })
  })

  it("returns empty badges for normal product", () => {
    const product = makeProduct({
      tags: [{ id: "t1", value: "brand:sait" }],
    })
    const result = productToPdpGallery(product)
    expect(result.badges).toHaveLength(0)
  })

  it("single thumb with placeholder when no images and no thumbnail", () => {
    const product = makeProduct({ thumbnail: null, images: null })
    const result = productToPdpGallery(product)
    expect(result.thumbs).toHaveLength(1)
    expect(result.thumbs[0].src).toBe("/static/images/placeholder.jpg")
    expect(result.thumbs[0].active).toBe(true)
  })

  it("sets mainImage alt to product title", () => {
    const product = makeProduct({})
    const result = productToPdpGallery(product)
    expect(result.mainImage.alt).toBe("Diamond Blade 350mm")
  })
})
