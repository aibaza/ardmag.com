import type { HttpTypes } from "@medusajs/types"

export function tenaxPromoNotice(product: HttpTypes.StoreProduct, variantId?: string, now = Date.now()): string | undefined {
  const promo = product.metadata?.tenax_promotion as Record<string, unknown> | undefined
  if (!promo || promo.discount_percent !== 20 || promo.min_quantity !== 12 || !Array.isArray(promo.quantity_variant_ids)) return
  const start = Date.parse(String(promo.starts_at)), end = Date.parse(String(promo.ends_at))
  if (!Number.isFinite(start) || !Number.isFinite(end) || now < start || now >= end) return
  if (variantId && !promo.quantity_variant_ids.includes(variantId)) return
  return "Solido 1 L alb/bej/negru/Jura: reducere 20% în coș de la 12 bucăți, culori combinate. Valabilă până la 31.12.2026."
}
