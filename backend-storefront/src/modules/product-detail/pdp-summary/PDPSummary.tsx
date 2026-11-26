import { ReactNode } from 'react'
import { StarRating } from '@modules/@shared/components/star-rating'
import { PDPBuyActions } from '@modules/product-detail/pdp-buy-actions/PDPBuyActions'
import { PDPPriceCard } from '@modules/product-detail/pdp-price-card'
import { PDPVariantSelector } from '@modules/product-detail/pdp-variant-selector'
import { PDPContactOrderButton } from '@modules/product-detail/pdp-contact-order'

interface PDPPerk {
  icon: ReactNode
  label: string
  sub?: string
}

interface VariantOption {
  label: string
  variantId: string
  active?: boolean
  unavailable?: boolean
  discount?: string
}

interface VariantGroup {
  title: string
  selectedValue: string
  options: VariantOption[]
}

interface PDPSummaryProps {
  brand: string
  brandHref: string
  title: string
  subtitle?: string
  ean: string
  rating: { score: number; reviewCount: number }
  price: string
  unitPrice?: number
  currencyCode?: string
  was?: string
  save?: string
  priceNoTax?: string
  unitLabel?: string
  priceUnit?: string
  promotionOffer?: { headline: string; detail: string }
  promoLabel?: string
  promoDate?: string
  variantGroups: VariantGroup[]
  stockLabel: string
  stockLocation: string
  addToCartLabel: string
  variantId: string | null
  countryCode: string
  canAddToCart: boolean
  perks: PDPPerk[]
  contactToOrder?: boolean
}

export function PDPSummary({ brand, brandHref, title, subtitle, ean, rating, price, unitPrice, currencyCode, was, save, priceNoTax, unitLabel, priceUnit, promotionOffer, promoLabel, promoDate, variantGroups, stockLabel, stockLocation, addToCartLabel, variantId, countryCode, canAddToCart, perks, contactToOrder }: PDPSummaryProps) {
  return (
    <aside className="pdp-summary">

      {/* Pe telefon blocul acesta urca deasupra pozei (vezi .pdp-head in CSS). */}
      <div className="pdp-head">
        <div className="pdp-brand"><a href={brandHref} style={{ color: "inherit", textDecoration: "none" }}>{brand}</a></div>
        <h1 className="pdp-title">{title}</h1>
        {subtitle ? <p className="pdp-subtitle">{subtitle}</p> : null}
        {ean ? (
          <div className="pdp-sku">
            <span>EAN <strong>{ean}</strong></span>
          </div>
        ) : null}
      </div>

      <div className="pdp-summary-body">
        {/* Rating */}
        {/* 25.11.2026: fără recenzii reale, nu afișăm cinci stele cu „0 recenzii” */}
        {rating.reviewCount > 0 ? <StarRating score={rating.score} reviewCount={rating.reviewCount} /> : null}

        {/* Price card */}
        <PDPPriceCard price={price} was={was} save={save} priceNoTax={priceNoTax} unitLabel={unitLabel} priceUnit={priceUnit} promoLabel={promoLabel} promoDate={promoDate} promotionOffer={promotionOffer} />

        {/* Variante, stoc si cumparare: bara fixa de pe telefon se ascunde cat timp zona asta se vede. */}
        <div className="pdp-purchase">
          <PDPVariantSelector groups={variantGroups} />

          {/* Stock */}
          <div className="pdp-stock">
            <span className="dot"></span>
            <strong>{stockLabel}</strong>
            <span className="loc">{stockLocation}</span>
          </div>

          {/* Buy / Contact */}
          {contactToOrder ? (
            <PDPContactOrderButton
              productTitle={title}
              variantLabel={variantGroups.map(g => `${g.title} ${g.selectedValue}`).join(', ')}
            />
          ) : (
            <PDPBuyActions
              key={variantId}
              unitPrice={unitPrice}
              currencyCode={currencyCode}
              variantId={variantId}
              countryCode={countryCode}
              label={addToCartLabel}
              canAddToCart={canAddToCart}
              stickyPrice={price}
              priceUnit={priceUnit}
              stickyVariantLabel={variantGroups.map(g => g.selectedValue).filter(Boolean).join(' · ')}
            />
          )}
        </div>

        {/* Garantiile, pe un rand (fara subtexte). „Favorite” si „Cere oferta” au fost scoase: nu aveau nicio actiune. */}
        <div className="pdp-perks">
          {perks.map((perk, i) => (
            <div key={i} className="row">
              {perk.icon}
              <strong>{perk.label}</strong>
            </div>
          ))}
        </div>
      </div>

    </aside>
  )
}
