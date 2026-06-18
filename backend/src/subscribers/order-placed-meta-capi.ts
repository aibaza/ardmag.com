import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import crypto from "crypto"

// Meta Conversions API (server-side Purchase).
//
// Fires a server-side Purchase to Meta on order.placed. This is the reliable
// half of the pixel: not lost to ad-blockers, iOS, or declined cookies. The
// browser pixel still fires its own Purchase; Meta deduplicates the two by the
// shared event_id (= order.id, also sent as `eventID` from the storefront).
//
// No-op unless META_PIXEL_ID and META_CAPI_ACCESS_TOKEN are set, so it is safe
// to ship before the token exists. Set META_CAPI_TEST_EVENT_CODE while
// validating in Events Manager > Test Events, then remove it for production.

const PIXEL_ID = process.env.META_PIXEL_ID
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN
const TEST_EVENT_CODE = process.env.META_CAPI_TEST_EVENT_CODE
const GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v21.0"
const SOURCE_URL = process.env.STOREFRONT_URL || "https://ardmag.ro"

// SHA-256 of a normalized value, per Meta's Advanced Matching spec. Returns
// undefined for empty input so the key is omitted rather than sent as a hash
// of "".
function hash(value?: string | null): string | undefined {
  if (!value) return undefined
  const normalized = value.trim().toLowerCase()
  if (!normalized) return undefined
  return crypto.createHash("sha256").update(normalized).digest("hex")
}

function hashPhone(value?: string | null): string | undefined {
  if (!value) return undefined
  // Meta wants digits only, including country code, no leading "+".
  const digits = value.replace(/[^0-9]/g, "")
  if (!digits) return undefined
  return crypto.createHash("sha256").update(digits).digest("hex")
}

export default async function orderPlacedMetaCapi({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = event.data?.id
  if (!orderId) return

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  if (!PIXEL_ID || !ACCESS_TOKEN) {
    logger.debug?.(
      "[meta-capi] Skipped — set META_PIXEL_ID and META_CAPI_ACCESS_TOKEN to enable server-side Purchase"
    )
    return
  }

  try {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "email",
        "total",
        "currency_code",
        "items.product_id",
        "items.variant_id",
        "items.quantity",
        "items.unit_price",
        "shipping_address.first_name",
        "shipping_address.last_name",
        "shipping_address.phone",
        "shipping_address.city",
        "shipping_address.postal_code",
        "shipping_address.country_code",
      ],
      filters: { id: orderId },
    })

    const order = orders?.[0]
    if (!order) {
      logger.warn(`[meta-capi] Order ${orderId} not found via Query`)
      return
    }

    const addr = order.shipping_address ?? {}
    const userData: Record<string, string[] | string> = {}
    const em = hash(order.email)
    const ph = hashPhone((addr as any).phone)
    const fn = hash((addr as any).first_name)
    const ln = hash((addr as any).last_name)
    const ct = hash(((addr as any).city ?? "").replace(/\s+/g, ""))
    const zp = hash((addr as any).postal_code)
    const country = hash((addr as any).country_code)
    if (em) userData.em = [em]
    if (ph) userData.ph = [ph]
    if (fn) userData.fn = [fn]
    if (ln) userData.ln = [ln]
    if (ct) userData.ct = [ct]
    if (zp) userData.zp = [zp]
    if (country) userData.country = [country]

    const items = (order.items ?? []) as any[]
    const contents = items.map((it) => ({
      id: String(it.product_id ?? it.variant_id ?? ""),
      quantity: it.quantity,
      item_price: it.unit_price,
    }))

    const payload = {
      data: [
        {
          event_name: "Purchase",
          event_time: Math.floor(Date.now() / 1000),
          event_id: String(order.id),
          action_source: "website",
          event_source_url: SOURCE_URL,
          user_data: userData,
          custom_data: {
            currency: (order.currency_code ?? "ron").toUpperCase(),
            value: order.total ?? 0,
            content_type: "product",
            content_ids: contents.map((c) => c.id),
            contents,
            num_items: contents.reduce((s, c) => s + (c.quantity ?? 0), 0),
          },
        },
      ],
      ...(TEST_EVENT_CODE ? { test_event_code: TEST_EVENT_CODE } : {}),
    }

    const url = `https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(
      ACCESS_TOKEN
    )}`
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => "")
      logger.error(`[meta-capi] Purchase for ${order.id} failed: HTTP ${res.status} ${text.slice(0, 300)}`)
      return
    }

    logger.info(`[meta-capi] Sent server-side Purchase for order ${order.id} (value ${order.total})`)
  } catch (err) {
    logger.error(`[meta-capi] Error sending Purchase for ${orderId}: ${err}`)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
  context: { subscriberId: "order-placed-meta-capi" },
}
