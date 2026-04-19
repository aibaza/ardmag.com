import type { HttpTypes } from "@medusajs/types"
import { formatPrice, getProductMinPrice } from "./format-price"
import { productToBadges } from "./product-to-badges"

type BadgeType = "promo" | "new" | "stock-low" | "custom"

interface ProductCardProduct {
  id: string
  title: string
  sku: string
  brand: string
  brandHref: string
  image: string
  imageAlt: string
  href: string
  price: { now: string; was?: string }
  badges?: Array<{ type: BadgeType; label: string; dotVariant?: boolean }>
  specs?: string[]
}

const PLACEHOLDER = "/static/images/placeholder.jpg"

/**
 * Capitalizes a brand slug: "tenax" => "Tenax", "delta-research" => "Delta Research"
 */
function capitalizeBrandSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

/**
 * Extracts the brand tag value (part after "brand:") or returns null.
 */
function extractBrandSlug(
  tags: Array<{ value: string }> | null | undefined
): string | null {
  if (!tags) return null
  for (const tag of tags) {
    if (tag.value.startsWith("brand:")) {
      return tag.value.slice("brand:".length)
    }
  }
  return null
}

/**
 * Converts a StoreProduct to the shape expected by ProductCard.
 */
export function productToCard(
  product: HttpTypes.StoreProduct,
  countryCode = "ro"
): ProductCardProduct {
  const brandSlug = extractBrandSlug(product.tags)
  const brand = brandSlug ? capitalizeBrandSlug(brandSlug) : ""
  const brandHref = brandSlug
    ? `/${countryCode}/search?brand=${brandSlug}`
    : `/${countryCode}/search`

  const image =
    product.thumbnail ||
    (product.images && product.images.length > 0
      ? product.images[0].url
      : null) ||
    PLACEHOLDER

  const href = `/${countryCode}/products/${product.handle}`

  const firstVariant =
    product.variants && product.variants.length > 0
      ? product.variants[0]
      : null
  const sku = firstVariant?.sku ?? ""

  const minPrice = getProductMinPrice(product)
  const hasTags = product.tags ?? []
  const hasPromo = hasTags.some((t) => t.value === "promo:30")

  let priceNow: string
  let priceWas: string | undefined

  if (minPrice === null) {
    priceNow = "Preț la cerere"
  } else {
    priceNow = formatPrice(minPrice)
    if (hasPromo) {
      // was = now / 0.7 (product already has 30% discount applied)
      const wasAmount = Math.round(minPrice / 0.7)
      priceWas = formatPrice(wasAmount)
    }
  }

  // specs: unique option titles from first variant's options, max 3
  const specs: string[] = []
  if (firstVariant?.options) {
    const seen = new Set<string>()
    for (const opt of firstVariant.options) {
      const title = opt.option?.title
      if (title && !seen.has(title) && specs.length < 3) {
        seen.add(title)
        specs.push(title)
      }
    }
  }

  return {
    id: product.id,
    title: product.title ?? "",
    sku,
    brand,
    brandHref,
    image,
    imageAlt: product.title ?? "",
    href,
    price: { now: priceNow, was: priceWas },
    badges: productToBadges(product),
    specs: specs.length > 0 ? specs : undefined,
  }
}
