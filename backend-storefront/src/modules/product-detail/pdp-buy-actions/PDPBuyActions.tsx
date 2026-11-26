"use client"

import { useEffect, useState } from "react"
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
  // Bara fixa de pe telefon: pretul variantei alese si valorile ei („1 litru · alb”).
  stickyPrice?: string
  stickyVariantLabel?: string
}

/**
 * Bara fixa apare numai pe telefon (CSS) si numai cat timp nu se vad nici zona de cumparare
 * (variante, stoc, buton), nici subsolul: nu acopera optiunile si nu sta peste footer.
 */
function useStickyBarVisible(): boolean {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const purchase = document.querySelector(".pdp-purchase")
    const footer = document.querySelector("footer")
    if (!purchase || typeof IntersectionObserver === "undefined") return
    const seen = new Map<Element, boolean>()
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) seen.set(e.target, e.isIntersecting)
      setVisible(!Array.from(seen.values()).some(Boolean))
    })
    io.observe(purchase)
    if (footer) io.observe(footer)
    return () => io.disconnect()
  }, [])
  return visible
}

export function PDPBuyActions({ unitPrice, currencyCode = "ron", stickyPrice, stickyVariantLabel, ...props }: Props) {
  const [quantity, setQuantity] = useState(1)
  const stickyVisible = useStickyBarVisible()
  const hasUnitPrice = typeof unitPrice === "number" && Number.isFinite(unitPrice)
  const barPrice = hasUnitPrice && quantity > 1 ? formatPrice(quantity * unitPrice, currencyCode) : stickyPrice

  return (
    <div className="pdp-buy">
      <div className="pdp-quantity-price">
        <QuantityStepper onChange={setQuantity} />
        {hasUnitPrice && (
          <output className="pdp-quantity-total" aria-label="Total pentru cantitatea selectată" aria-live="polite">
            <FormattedPrice value={formatPrice(quantity * unitPrice, currencyCode)} />
          </output>
        )}
      </div>
      <PDPAddToCartButton {...props} quantity={quantity} />
      {barPrice && (
        <div className={`pdp-sticky-bar${stickyVisible ? " is-visible" : ""}`} aria-hidden={!stickyVisible} inert={!stickyVisible}>
          <div className="pdp-sticky-bar__price">
            <FormattedPrice value={barPrice} />
            {(stickyVariantLabel || quantity > 1) && (
              <small>{[stickyVariantLabel, quantity > 1 ? `${quantity} buc.` : ""].filter(Boolean).join(" · ")}</small>
            )}
          </div>
          <PDPAddToCartButton {...props} quantity={quantity} />
        </div>
      )}
    </div>
  )
}
