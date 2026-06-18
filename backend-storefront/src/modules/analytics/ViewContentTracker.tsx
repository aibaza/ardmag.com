"use client"

import { useEffect } from "react"
import { trackViewContent } from "@lib/analytics/track"

type Props = {
  id: string
  value?: number
  currency?: string
  name?: string
}

// Fires ViewContent / view_item when a product page is shown. Re-fires when the
// product id changes (client navigation between PDPs). Renders nothing.
export function ViewContentTracker({ id, value, currency, name }: Props) {
  useEffect(() => {
    trackViewContent({ id, value, currency, name })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  return null
}
