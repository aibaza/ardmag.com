import type { HttpTypes } from '@medusajs/types'
import type { Hero } from './Hero'

type HeroProps = Parameters<typeof Hero>[0]

export function productToHero(
  product: HttpTypes.StoreProduct,
  countryCode: string
): HeroProps {
  const meta = (product.metadata ?? {}) as Record<string, unknown>
  const heroMeta = (typeof meta.hero === 'object' && meta.hero !== null ? meta.hero : {}) as Record<string, unknown>

  const kicker =
    typeof heroMeta.kicker === 'string' ? heroMeta.kicker : "Promo"

  const title =
    typeof heroMeta.title === 'string'
      ? heroMeta.title
      : (product.title ?? "")

  const description =
    typeof heroMeta.description === 'string'
      ? heroMeta.description
      : (product.description?.slice(0, 200) ?? "")

  const primaryCtaLabel =
    typeof heroMeta.primaryCtaLabel === 'string'
      ? heroMeta.primaryCtaLabel
      : "Vezi produsul"

  const primaryCtaHref =
    typeof heroMeta.primaryCtaHref === 'string'
      ? heroMeta.primaryCtaHref
      : `/${countryCode}/products/${product.handle}`

  const ghostCtaLabel =
    typeof heroMeta.ghostCtaLabel === 'string'
      ? heroMeta.ghostCtaLabel
      : "Toate produsele →"

  const ghostCtaHref =
    typeof heroMeta.ghostCtaHref === 'string'
      ? heroMeta.ghostCtaHref
      : `/${countryCode}/store`

  const stats = Array.isArray(heroMeta.stats)
    ? (heroMeta.stats as Array<{ value: string; label: string }>)
    : [
        { value: "480+", label: "produse în stoc" },
        { value: "7", label: "furnizori autorizați" },
        { value: "24h", label: "livrare Cluj" },
      ]

  // sideCards: not derivable from a single product — leave empty
  const sideCards: HeroProps['sideCards'] = Array.isArray(heroMeta.sideCards)
    ? (heroMeta.sideCards as HeroProps['sideCards'])
    : []

  return {
    kicker,
    title,
    description,
    primaryCta: { label: primaryCtaLabel, href: primaryCtaHref },
    ghostCta: { label: ghostCtaLabel, href: ghostCtaHref },
    stats,
    sideCards,
    headingLevel: "h1",
  }
}
