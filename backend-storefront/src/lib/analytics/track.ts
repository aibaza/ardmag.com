// Conversion tracking helper: Meta Pixel (fbq) + GA4 dataLayer (via GTM).
//
// Meta events are gated on marketing consent, mirroring the PageView gating in
// MetaPixel.tsx. GA4 ecommerce events are pushed to the dataLayer; GA Consent
// Mode v2 (configured in GoogleAnalytics.tsx) governs storage downstream.
//
// Money values are raw decimal RON (major units), matching formatPrice -- the
// catalog/order amounts are NOT in bani, so they are sent to the pixel as-is.
//
// content_ids are the product ids where available (PDP / Purchase) and the
// variant id where that is all the caller has (AddToCart). Alignment with a
// Meta product feed is a separate follow-up; for now the ids back custom
// audiences and conversion optimization.
import { getCookieConsent } from "@components/cookie-consent/CookieConsent"

function hasMarketingConsent(): boolean {
  try {
    return !!getCookieConsent()?.marketing
  } catch {
    return false
  }
}

function createEventId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined
  const prefix = `${encodeURIComponent(name)}=`
  return document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(prefix))
    ?.slice(prefix.length)
}

function fbqTrack(
  event: string,
  params: Record<string, unknown>,
  options?: { eventID?: string }
): void {
  if (typeof window === "undefined") return
  // ViewContent / Purchase fire on page mount, which can happen before the Meta
  // Pixel script (loaded afterInteractive) has defined window.fbq -- without a
  // retry the call is silently dropped by that race. Poll briefly (~10s) for
  // both consent and fbq readiness so the event is not lost. Once consent is
  // present and fbq exists, fire and stop.
  let tries = 0
  const attempt = () => {
    if (!hasMarketingConsent()) {
      if (tries++ < 40) setTimeout(attempt, 250)
      return
    }
    const fbq = (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq
    if (typeof fbq === "function") {
      if (options?.eventID) {
        // eventID lets Meta deduplicate this browser event against the
        // server-side Conversions API event that carries the same id.
        fbq("track", event, params, { eventID: options.eventID })
      } else {
        fbq("track", event, params)
      }
      return
    }
    if (tries++ < 40) setTimeout(attempt, 250)
  }
  attempt()
}

type MetaCapiContent = { id: string; quantity?: number; item_price?: number }

function metaCapiTrackWhenConsented(payload: {
  event_name: "ViewContent" | "AddToCart" | "InitiateCheckout"
  event_id: string
  contents?: MetaCapiContent[]
  value?: number
  currency?: string
}): void {
  if (typeof window === "undefined") return

  let tries = 0
  const attempt = () => {
    if (!hasMarketingConsent()) {
      if (tries++ < 40) setTimeout(attempt, 250)
      return
    }

    const body = JSON.stringify({
      ...payload,
      event_source_url: window.location.href,
      fbp: getCookie("_fbp"),
      fbc: getCookie("_fbc"),
    })

    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const sent = navigator.sendBeacon(
        "/api/meta-capi/track",
        new Blob([body], { type: "application/json" })
      )
      if (sent) return
    }

    fetch("/api/meta-capi/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => undefined)
  }

  attempt()
}

function pushDataLayer(payload: Record<string, unknown>): void {
  if (typeof window === "undefined") return
  const w = window as unknown as { dataLayer?: unknown[] }
  w.dataLayer = w.dataLayer || []
  // GA4 best practice: clear the previous ecommerce object before each event.
  w.dataLayer.push({ ecommerce: null })
  w.dataLayer.push(payload)
}

// Returns true only the first time it sees a key in this browser session.
// Used to keep Purchase / InitiateCheckout from double-firing on re-render or
// page refresh. Falls open (returns true) if sessionStorage is unavailable.
function firstTimeInSession(key: string): boolean {
  try {
    if (typeof window === "undefined") return false
    if (window.sessionStorage.getItem(key)) return false
    window.sessionStorage.setItem(key, "1")
    return true
  } catch {
    return true
  }
}

type PurchaseItem = { id: string; quantity: number; price?: number; name?: string }

export function trackViewContent(i: {
  id: string
  value?: number
  currency?: string
  name?: string
}): void {
  const currency = (i.currency ?? "RON").toUpperCase()
  const eventId = createEventId()
  fbqTrack(
    "ViewContent",
    {
      content_type: "product",
      content_ids: [i.id],
      content_name: i.name,
      value: i.value,
      currency,
    },
    { eventID: eventId }
  )
  metaCapiTrackWhenConsented({
    event_name: "ViewContent",
    event_id: eventId,
    contents: [
      { id: i.id, quantity: 1, ...(i.value !== undefined ? { item_price: i.value } : {}) },
    ],
    value: i.value,
    currency,
  })
  pushDataLayer({
    event: "view_item",
    ecommerce: {
      currency,
      value: i.value,
      items: [{ item_id: i.id, item_name: i.name, price: i.value, quantity: 1 }],
    },
  })
}

export function trackAddToCart(i: {
  id: string
  value?: number
  currency?: string
  quantity?: number
  name?: string
}): void {
  const currency = (i.currency ?? "RON").toUpperCase()
  const quantity = i.quantity ?? 1
  const eventId = createEventId()
  fbqTrack(
    "AddToCart",
    {
      content_type: "product",
      content_ids: [i.id],
      content_name: i.name,
      contents: [{ id: i.id, quantity }],
      value: i.value,
      currency,
    },
    { eventID: eventId }
  )
  metaCapiTrackWhenConsented({
    event_name: "AddToCart",
    event_id: eventId,
    contents: [
      { id: i.id, quantity, ...(i.value !== undefined ? { item_price: i.value } : {}) },
    ],
    value: i.value,
    currency,
  })
  pushDataLayer({
    event: "add_to_cart",
    ecommerce: {
      currency,
      value: i.value,
      items: [{ item_id: i.id, item_name: i.name, price: i.value, quantity }],
    },
  })
}

export function trackInitiateCheckout(i: {
  cartId?: string
  value: number
  currency?: string
  numItems?: number
  contentIds?: string[]
}): void {
  if (i.cartId && !firstTimeInSession(`ic:${i.cartId}`)) return
  const currency = (i.currency ?? "RON").toUpperCase()
  const eventId = createEventId()
  fbqTrack(
    "InitiateCheckout",
    {
      content_type: "product",
      content_ids: i.contentIds,
      num_items: i.numItems,
      value: i.value,
      currency,
    },
    { eventID: eventId }
  )
  metaCapiTrackWhenConsented({
    event_name: "InitiateCheckout",
    event_id: eventId,
    contents: i.contentIds?.map((id) => ({ id })),
    value: i.value,
    currency,
  })
  pushDataLayer({
    event: "begin_checkout",
    ecommerce: {
      currency,
      value: i.value,
      items: (i.contentIds ?? []).map((id) => ({ item_id: id })),
    },
  })
}

export function trackPurchase(i: {
  orderId: string
  value: number
  currency?: string
  contents?: PurchaseItem[]
}): void {
  if (!firstTimeInSession(`purchase:${i.orderId}`)) return
  const currency = (i.currency ?? "RON").toUpperCase()
  const contents = i.contents ?? []
  fbqTrack(
    "Purchase",
    {
      content_type: "product",
      content_ids: contents.map((c) => c.id),
      contents: contents.map((c) => ({ id: c.id, quantity: c.quantity })),
      num_items: contents.reduce((s, c) => s + (c.quantity ?? 0), 0),
      value: i.value,
      currency,
    },
    { eventID: i.orderId }
  )
  pushDataLayer({
    event: "purchase",
    ecommerce: {
      transaction_id: i.orderId,
      currency,
      value: i.value,
      items: contents.map((c) => ({
        item_id: c.id,
        item_name: c.name,
        price: c.price,
        quantity: c.quantity,
      })),
    },
  })
}
