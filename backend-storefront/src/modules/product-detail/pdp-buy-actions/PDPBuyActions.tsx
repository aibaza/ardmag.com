"use client"

import { useState } from "react"
import { formatPrice } from "@lib/util/adapters/format-price"
import { FormattedPrice } from "@modules/@shared/components/formatted-price"
import { QuantityStepper } from "@modules/@shared/components/quantity-stepper"
import { PDPAddToCartButton } from "@modules/product-detail/pdp-add-to-cart-button"

interface Props {
  variantId: string | null
  countryCode: string
  label: string
  canAddToCart: boolean
  unitPrice?: number
  currencyCode?: string
}

export function PDPBuyActions({ unitPrice, currencyCode = "ron", ...props }: Props) {
  const [quantity, setQuantity] = useState(1)

  return (
    <div className="pdp-buy">
      <div className="pdp-quantity-price">
        <QuantityStepper onChange={setQuantity} />
        {typeof unitPrice === "number" && Number.isFinite(unitPrice) && (
          <output className="pdp-quantity-total" aria-label="Total pentru cantitatea selectată" aria-live="polite">
            <FormattedPrice value={formatPrice(quantity * unitPrice, currencyCode)} />
          </output>
        )}
      </div>
      <PDPAddToCartButton {...props} quantity={quantity} />
    </div>
  )
}
