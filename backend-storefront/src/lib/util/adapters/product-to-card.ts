import type { HttpTypes } from "@medusajs/types"
import { formatPrice, getProductMinPriceWithOriginal } from "./format-price"
import { productToBadges } from "./product-to-badges"
import { imageVariant } from "@lib/util/image-variant"

type BadgeType = "promo" | "new" | "stock-low" | "custom"

interface ProductCardProduct {
  id: string
  title: string
  sku: string
  brand: string
  brandHref: string
  brandLogo?: string
  image: string
  imageAlt: string
  href: string
  price: { now: string; was?: string }
  badges?: Array<{ type: BadgeType; label: string; dotVariant?: boolean }>
  specs?: string[]
  defaultVariantId: string | null
  hasMultipleRealVariants: boolean
}

// Plural in romana pentru axele de varianta cunoscute (din DB).
// Folosit pentru "{count} {plural}" in specs.
const AXIS_PLURAL: Record<string, string> = {
  "CANTITATE": "cantități",
  "DIAMETRU": "diametre",
  "GRANULAȚIE": "granulații",
  "DENUMIRE": "denumiri",
  "TIP PIATRĂ": "tipuri piatră",
  "CULOARE": "culori",
  "CATEGORIE": "categorii",
  "SPECIALIZARE": "specializări",
  "TIP DISCHETĂ": "tipuri dischetă",
  "TIP DISC": "tipuri disc",
  "MODEL MASĂ": "modele masă",
  "DIMENSIUNE": "dimensiuni",
  "FIXARE DISC": "fixări disc",
  "LUNGIME TĂIERE": "lungimi tăiere",
  "MĂRIME": "mărimi",
  "CABLU": "cabluri",
  "TIP ANELLI": "tipuri anelli",
  "TIP FRANKFURT": "tipuri frankfurt",
  "TIP FREZĂ": "tipuri freză",
  "TIP MASTIC": "tipuri mastic",
  "TIP OALĂ": "tipuri oală",
  "TIP PAD": "tipuri pad",
  "TIP POMPĂ": "tipuri pompă",
  "TIP TANGENȚIAL": "tipuri tangențial",
}

function axisLabel(axis: string, count: number): string {
  const plural = AXIS_PLURAL[axis.toUpperCase()] ?? axis.toLowerCase()
  return `${count} ${plural}`
}

// Brand slug -> path PNG/WEBP logo (transparent bg, /public/design-temp/)
const BRAND_LOGO_MAP: Record<string, string> = {
  "tenax": "/design-temp/dist-tenax.webp",
  "delta-research": "/design-temp/dist-delta.webp",
  "sait": "/design-temp/dist-sait.webp",
  "woosuk": "/design-temp/dist-woosuk.webp",
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
    ? `/search?brand=${brandSlug}`
    : `/search`

  const rawImage =
    validUrl(product.thumbnail) ||
    validUrl(product.images?.[0]?.url) ||
    ''
  const image = imageVariant(rawImage, "small")

  const href = `/products/${product.handle}`

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

  // specs: pentru fiecare axa de varianta (option title), afiseaza "{count} {plural}"
  // unde count = nr valori unice in catalog. Skip axe cu 1 valoare (info inutila) si
  // skip "Title" placeholder Medusa. Max 3 specs.
  const axisValues = new Map<string, Set<string>>()
  for (const variant of product.variants ?? []) {
    for (const opt of variant.options ?? []) {
      const title = opt.option?.title
      const value = opt.value
      if (!title || title.toLowerCase() === "title" || value === undefined || value === null) continue
      if (!axisValues.has(title)) axisValues.set(title, new Set())
      axisValues.get(title)!.add(String(value))
    }
  }
  const specs: string[] = []
  for (const [title, values] of axisValues) {
    if (values.size <= 1) continue
    if (specs.length >= 3) break
    specs.push(axisLabel(title, values.size))
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
    brandLogo: brandSlug ? BRAND_LOGO_MAP[brandSlug] : undefined,
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
