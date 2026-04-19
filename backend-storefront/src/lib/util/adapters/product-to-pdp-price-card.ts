import type { HttpTypes } from "@medusajs/types"
import { formatPrice } from "./format-price"

interface PDPPriceCardProps {
  price: string
  was?: string
  save?: string
  priceNoTax?: string
  unitLabel?: string
  promoLabel?: string
  promoDate?: string
}

type VariantWithCalcPrice = HttpTypes.StoreProductVariant & {
  calculated_price?: {
    calculated_amount: number | null
    original_amount?: number | null
    currency_code?: string | null
  } | null
}

const VAT_RATE = 0.19

/**
 * Converts a single variant + product into PDPPriceCard props.
 *
 * - price: formatPrice(calculated_amount)
 * - was: if promo:30, was = price / 0.7
 * - save: if promo:30, "Economisești <amount>"
 * - priceNoTax: price without 19% TVA
 * - promoLabel/promoDate: if promo:30
 */
export function productToPdpPriceCard(
  variant: HttpTypes.StoreProductVariant,
  product: HttpTypes.StoreProduct
): PDPPriceCardProps {
  const typedVariant = variant as VariantWithCalcPrice
  const cp = typedVariant.calculated_price
  const amount = cp?.calculated_amount ?? null

  if (amount === null) {
    return { price: "Preț la cerere" }
  }

  const currencyCode = cp?.currency_code ?? "ron"
  const price = formatPrice(amount, currencyCode)

  const hasPromo = (product.tags ?? []).some((t) => t.value === "promo:30")

  // Price without 19% VAT
  const amountWithoutTax = Math.round(amount / (1 + VAT_RATE))
  const priceNoTax = formatPrice(amountWithoutTax, currencyCode)

  if (!hasPromo) {
    return { price, priceNoTax }
  }

  // was = current price / 0.7 (product already has 30% off applied)
  const wasAmount = Math.round(amount / 0.7)
  const was = formatPrice(wasAmount, currencyCode)

  // save = was - now
  const saveAmount = wasAmount - amount
  const save = `Economisești ${formatPrice(saveAmount, currencyCode)}`

  return {
    price,
    was,
    save,
    priceNoTax,
    promoLabel: "Promoție activă - expiră: ",
    promoDate: "31 mai 2025",
  }
}
