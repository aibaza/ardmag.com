import type { HttpTypes } from "@medusajs/types"
import { formatPrice } from "./format-price"

interface PDPPriceCardProps {
  price: string
  was?: string
  save?: string
  priceNoTax?: string
  promoLabel?: string
}

type VariantWithCalcPrice = HttpTypes.StoreProductVariant & {
  calculated_price?: {
    calculated_amount: number | null
    original_amount?: number | null
    currency_code?: string | null
  } | null
}

// Romanian standard VAT since 2025-08-01; catalog amounts already include VAT.
const VAT_RATE = 0.21

/**
 * Converts a single variant into PDPPriceCard props.
 *
 * - price: formatPrice(calculated_amount)
 * - was/save/promoLabel: populated when original_amount > calculated_amount (real Price List discount)
 * - priceNoTax: price without 21% TVA
 */
export function productToPdpPriceCard(
  variant: HttpTypes.StoreProductVariant,
  _product: HttpTypes.StoreProduct
): PDPPriceCardProps {
  const typedVariant = variant as VariantWithCalcPrice
  const cp = typedVariant.calculated_price
  const amount = cp?.calculated_amount ?? null

  if (amount === null) {
    return { price: "Preț la cerere" }
  }

  const currencyCode = cp?.currency_code ?? "ron"
  const price = formatPrice(amount, currencyCode)
  const amountWithoutTax = Math.round((amount / (1 + VAT_RATE)) * 100) / 100
  const priceNoTax = formatPrice(amountWithoutTax, currencyCode)

  const originalAmount = cp?.original_amount ?? null
  if (originalAmount == null || originalAmount <= amount) {
    return { price, priceNoTax }
  }

  const was = formatPrice(originalAmount, currencyCode)
  const saveAmount = originalAmount - amount
  const save = `Economisești ${formatPrice(saveAmount, currencyCode)}`
  const discountPct = Math.round((1 - amount / originalAmount) * 100)

  return {
    price,
    was,
    save,
    priceNoTax,
    promoLabel: `Promotie activa -${discountPct}%`,
  }
}
