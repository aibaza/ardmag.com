import type { TenaxPromoOffer } from "@lib/util/adapters/tenax-promo-notice"

export interface PromoOfferNoteProps {
  offer: Pick<TenaxPromoOffer, "headline" | "detail">
}

/** Nota de oferta: o eticheta de pret (iconita) + beneficiul pe un rand + conditiile mai jos. */
export function PromoOfferNote({ offer }: PromoOfferNoteProps) {
  return (
    <p className="tenax-promo-note">
      <svg className="tenax-promo-note__icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
        <path d="M8.6 1.75H13.5a.75.75 0 0 1 .75.75v4.9a.75.75 0 0 1-.22.53l-6.1 6.1a.75.75 0 0 1-1.06 0L2 9.18a.75.75 0 0 1 0-1.06l6.1-6.15a.75.75 0 0 1 .5-.22Z" />
        <circle cx="11" cy="5" r="1.1" fill="currentColor" stroke="none" />
      </svg>
      <span className="tenax-promo-note__text">
        <strong className="tenax-promo-note__headline">{offer.headline}</strong>
        <span className="tenax-promo-note__detail">{offer.detail}</span>
      </span>
    </p>
  )
}
