import type { HttpTypes } from "@medusajs/types"
import { formatPrice, getProductMinPriceWithOriginal } from "./format-price"
import { tenaxPromoOffer, type TenaxPromoOffer } from "./tenax-promo-notice"
import { productToBadges } from "./product-to-badges"
import { imageVariant } from "@lib/util/image-variant"
import { isContactToOrderVariant, isVariantInStock, productUnitLabel } from "@lib/util/product"

type BadgeType = "promo" | "new" | "stock-low" | "custom"

/** Eticheta de pe card ("4 culori") si valorile ei, afisate in tooltip. */
export interface CardSpec {
  label: string
  values: string[]
}

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
  promoOffer?: TenaxPromoOffer
  specs?: CardSpec[]
  defaultVariantId: string | null
  hasMultipleRealVariants: boolean
  defaultVariantSoldOut: boolean
  // Varianta implicita se comanda numai telefonic: cardul nu adauga in cos.
  contactToOrder: boolean
  // Unitatea pretului afisat (ex. "kg"), doar cand exista pret.
  priceUnit?: string
}

// Plural in romana pentru axele de varianta cunoscute (din DB).
// Folosit pentru "{count} {plural}" in specs.
const AXIS_PLURAL: Record<string, string> = {
  // Valorile reale: litri, kg, grame, bucată/cutie/bax, kituri A+B -> toate sunt ambalaje.
  "CANTITATE": "ambalaje",
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

// Unitati scrise lizibil in tooltip ("1 LITRU" -> "1 L").
const UNIT_TOKENS: Record<string, string> = {
  "LITRU": "L", "LITRI": "L", "KG": "kg", "GRAME": "g", "GRAM": "g", "BUC.": "buc.", "BUC": "buc",
}
// Acronime de 3+ litere care raman majuscule.
const KEEP_UPPER = new Set(["TLS"])

/** "ALB" -> "Alb", "5 LITRI" -> "5 L", "CERAMICĂ CC" -> "Ceramică CC". */
export function formatOptionValue(raw: string): string {
  const out = raw.trim().split(/\s+/).map((tok) => {
    const m = tok.match(/^(\(?)(.*?)(\)?,?)$/)
    const [, pre, core, post] = m ?? ["", "", tok, ""]
    const upper = core.toUpperCase()
    let w: string
    if (UNIT_TOKENS[upper] !== undefined) w = UNIT_TOKENS[upper]
    else if (/\d/.test(core) || core.replace(/[^A-Za-z\u00C0-\u024F]/g, "").length <= 2 || KEEP_UPPER.has(upper)) w = core
    else w = core.toLocaleLowerCase("ro-RO")
    return pre + w + post
  }).join(" ")
  return out.charAt(0).toLocaleUpperCase("ro-RO") + out.slice(1)
}

/** Valorile care incep cu un numar se ordoneaza crescator; celelalte pastreaza ordinea din catalog, dupa ele. */
function orderValues(values: string[]): string[] {
  const num = (v: string) => { const m = v.match(/^\s*(\d+(?:[.,]\d+)?)/); return m ? parseFloat(m[1].replace(",", ".")) : null }
  const numeric = values.filter((v) => num(v) !== null).sort((a, b) => num(a)! - num(b)!)
  return [...numeric, ...values.filter((v) => num(v) === null)]
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
  // Procentul de reducere al cardului vine din ACEEASI varianta ca pretul afisat
  // (cea mai ieftina), ca banderola, pretul nou si cel taiat sa fie coerente.
  // Daca reducerea exista doar pe alte variante (ex. Mastic Solid: 1 L la pret
  // intreg, 4 L/18 L cu -20%), cardul nu afiseaza reducere.
  let discountPct = 0

  if (priceInfo === null) {
    priceNow = "Preț la cerere"
  } else {
    priceNow = formatPrice(priceInfo.calculated)
    if (priceInfo.original > priceInfo.calculated) {
      priceWas = formatPrice(priceInfo.original)
      discountPct = Math.round((1 - priceInfo.calculated / priceInfo.original) * 100)
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
  const specs: CardSpec[] = []
  for (const [title, values] of Array.from(axisValues.entries())) {
    if (values.size <= 1) continue
    if (specs.length >= 3) break
    specs.push({
      label: axisLabel(title, values.size),
      values: orderValues(Array.from(values)).map(formatOptionValue),
    })
  }

  const defaultVariantId = product.variants?.[0]?.id ?? null
  const hasMultipleRealVariants =
    product.variants != null && product.variants.length > 1
  // Relevant doar cand cardul adauga direct in cos (o singura varianta).
  const defaultVariantSoldOut =
    !hasMultipleRealVariants && firstVariant != null && !isVariantInStock(firstVariant)
  const contactToOrder = !hasMultipleRealVariants && isContactToOrderVariant(firstVariant)
  const priceUnit = priceInfo === null ? undefined : productUnitLabel(product)

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
    badges: [
      ...productToBadges(product).filter((b) => b.type !== "promo"),
      ...(discountPct > 0 ? [{ type: "promo" as const, label: `-${discountPct}%` }] : []),
    ],
    promoOffer: tenaxPromoOffer(product),
    specs: specs.length > 0 ? specs : undefined,
    defaultVariantId,
    hasMultipleRealVariants,
    defaultVariantSoldOut,
    contactToOrder,
    priceUnit,
  }
}
