import type { HttpTypes } from "@medusajs/types"
import { formatPrice, getProductMinPriceWithOriginal } from "./format-price"
import { productToBadges } from "./product-to-badges"
import { imgUrl } from "@lib/util/img-url"

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
  defaultVariantId: string | null
  hasMultipleRealVariants: boolean
}

function validUrl(url: string | null | undefined): string | null {
  if (!url || !url.startsWith('http')) return null
  return url
}

function capitalizeBrandSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

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
 * was price is derived from real original_amount (set by a Price List),
 * not from a hardcoded tag or math.
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

  const rawImage =
    validUrl(product.thumbnail) ||
    validUrl(product.images?.[0]?.url) ||
    ''
  const image = imgUrl(rawImage, 'card')

  const href = `/${countryCode}/products/${product.handle}`

  const firstVariant =
    product.variants && product.variants.length > 0
      ? product.variants[0]
      : null
  const priceInfo = getProductMinPriceWithOriginal(product)

  let priceNow: string
  let priceWas: string | undefined

  if (priceInfo === null) {
    priceNow = "Preț la cerere"
  } else {
    priceNow = formatPrice(priceInfo.calculated)
    if (priceInfo.original > priceInfo.calculated) {
      priceWas = formatPrice(priceInfo.original)
    }
  }

  // specs: unique option titles from first variant's options, max 3
  const specs: string[] = []
  if (firstVariant?.options) {
    const seen = new Set<string>()
    for (const opt of firstVariant.options) {
      const title = opt.option?.title
      if (title && title.toLowerCase() !== "title" && !seen.has(title) && specs.length < 3) {
        seen.add(title)
        specs.push(title)
      }
    }
  }

  const defaultVariantId = product.variants?.[0]?.id ?? null
  const hasMultipleRealVariants =
    product.variants != null && product.variants.length > 1

  return {
    id: product.id,
    title: product.title ?? "",
    sku: product.variants?.[0]?.sku ?? "",
    brand,
    brandHref,
    image,
    imageAlt: product.title ?? "",
    href,
    price: { now: priceNow, was: priceWas },
    badges: productToBadges(product),
    specs: specs.length > 0 ? specs : undefined,
    defaultVariantId,
    hasMultipleRealVariants,
  }
}
