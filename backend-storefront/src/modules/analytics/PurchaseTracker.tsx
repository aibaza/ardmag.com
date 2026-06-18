"use client"

import { useEffect } from "react"
import { trackPurchase } from "@lib/analytics/track"

type Props = {
  orderId: string
  value: number
  currency: string
  contents: { id: string; quantity: number; price?: number; name?: string }[]
}

// Fires the Meta Pixel + GA4 purchase event once per order (dedup lives in
// trackPurchase via sessionStorage). Renders nothing.
export function PurchaseTracker({ orderId, value, currency, contents }: Props) {
  useEffect(() => {
    trackPurchase({ orderId, value, currency, contents })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  return null
}
