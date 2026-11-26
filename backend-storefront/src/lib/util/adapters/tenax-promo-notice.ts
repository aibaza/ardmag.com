import type { HttpTypes } from "@medusajs/types"

/** Oferta Tenax pe cantitate, impartita pentru afisarea compacta (titlu + detaliu). */
export interface TenaxPromoOffer {
  headline: string
  detail: string
  /** Textul complet, aceeasi formulare ca nota initiala. */
  text: string
}

const TENAX_PROMO_TEXT =
  "Solido 1 L alb/bej/negru/Jura: reducere 20% în coș de la 12 bucăți, culori combinate. Valabilă până la 31.12.2026."

export function tenaxPromoOffer(product: HttpTypes.StoreProduct, variantId?: string, now = Date.now()): TenaxPromoOffer | undefined {
  const promo = product.metadata?.tenax_promotion as Record<string, unknown> | undefined
  if (!promo || promo.discount_percent !== 20 || promo.min_quantity !== 12 || !Array.isArray(promo.quantity_variant_ids)) return
  const start = Date.parse(String(promo.starts_at)), end = Date.parse(String(promo.ends_at))
  if (!Number.isFinite(start) || !Number.isFinite(end) || now < start || now >= end) return
  if (variantId && !promo.quantity_variant_ids.includes(variantId)) return
  return {
    headline: "Reducere 20% în coș de la 12 bucăți",
    detail: "Solido 1 L alb/bej/negru/Jura, culori combinate · până la 31.12.2026",
    text: TENAX_PROMO_TEXT,
  }
}

export function tenaxPromoNotice(product: HttpTypes.StoreProduct, variantId?: string, now = Date.now()): string | undefined {
  return tenaxPromoOffer(product, variantId, now)?.text
}
