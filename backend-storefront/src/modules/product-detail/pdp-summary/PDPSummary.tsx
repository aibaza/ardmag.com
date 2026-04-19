import { ReactNode } from 'react'
import { StarRating } from '@modules/@shared/components/star-rating'
import { QuantityStepper } from '@modules/@shared/components/quantity-stepper'
import { PDPPriceCard } from '@modules/product-detail/pdp-price-card'
import { PDPVariantSelector } from '@modules/product-detail/pdp-variant-selector'

interface PDPPerk {
  icon: ReactNode
  label: string
  sub: string
}

interface VariantOption {
  label: string
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
  sku: string
  ean: string
  rating: { score: number; reviewCount: number }
  price: string
  was?: string
  save?: string
  priceNoTax?: string
  unitLabel?: string
  promoLabel?: string
  promoDate?: string
  variantGroups: VariantGroup[]
  stockLabel: string
  stockLocation: string
  addToCartLabel: string
  perks: PDPPerk[]
}

export function PDPSummary({ brand, brandHref, title, sku, ean, rating, price, was, save, priceNoTax, unitLabel, promoLabel, promoDate, variantGroups, stockLabel, stockLocation, addToCartLabel, perks }: PDPSummaryProps) {
  return (
    <aside className="pdp-summary">

      <div className="pdp-brand"><a href={brandHref} style={{ color: "inherit", textDecoration: "none" }}>{brand}</a></div>
      <h1 className="pdp-title">{title}</h1>
      <div className="pdp-sku">
        <span>SKU <strong>{sku}</strong></span>
        <span>EAN <strong>{ean}</strong></span>
      </div>

      {/* Rating */}
      <StarRating score={rating.score} reviewCount={rating.reviewCount} />

      {/* Price card */}
      <PDPPriceCard price={price} was={was} save={save} priceNoTax={priceNoTax} unitLabel={unitLabel} promoLabel={promoLabel} promoDate={promoDate} />

      {/* Variants */}
      <PDPVariantSelector groups={variantGroups} />

      {/* Stock */}
      <div className="pdp-stock">
        <span className="dot"></span>
        <strong>{stockLabel}</strong>
        <span className="loc">{stockLocation}</span>
      </div>

      {/* Buy */}
      <div className="pdp-buy">
        <QuantityStepper />
        <button className="btn primary lg">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M2 3h2l1 9h10l1-6H5"/><circle cx="7" cy="15" r="1.3"/><circle cx="14" cy="15" r="1.3"/></svg>
          {addToCartLabel}
        </button>
      </div>

      {/* Extras */}
      <div className="pdp-extras">
        <button className="btn ghost md">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 14s-5-3-5-7a3 3 0 0 1 5-2 3 3 0 0 1 5 2c0 4-5 7-5 7z"/></svg>
          Favorite
        </button>
        <button className="btn ghost md">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3h10v10H3zM6 7h4M6 10h4"/></svg>
          Cere ofertă
        </button>
      </div>

      {/* Perks */}
      <div className="pdp-perks">
        {perks.map((perk, i) => (
          <div key={i} className="row">
            {perk.icon}
            <div><strong>{perk.label}</strong> · <span className="sub">{perk.sub}</span></div>
          </div>
        ))}
      </div>

    </aside>
  )
}
