"use client"

import { useEffect } from "react"
import { trackInitiateCheckout } from "@lib/analytics/track"

type Props = {
  cartId?: string
  value: number
  currency: string
  numItems: number
  contentIds: string[]
}

// Fires InitiateCheckout / begin_checkout once per cart (dedup in the helper).
// Mounted on the checkout page; renders nothing.
export function CheckoutTracker({ cartId, value, currency, numItems, contentIds }: Props) {
  useEffect(() => {
    trackInitiateCheckout({ cartId, value, currency, numItems, contentIds })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartId])

  return null
}
