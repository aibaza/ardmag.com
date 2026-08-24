import { getCanonicalOrderTotal } from "../order-total"
import type { OrderWithCanonicalTotal } from "../order-total"

export type AttributionVia = "fbclid" | "gclid" | "utm" | "referral" | "direct"

export type PurchaseAttribution = {
  resolved_source?: string
  resolved_medium?: string
  resolved_campaign?: string
  resolved_via?: AttributionVia
  first_touch?: unknown
  last_touch?: unknown
  fbclid?: string
  gclid?: string
  fbc?: string
  fbp?: string
  landing_url?: string
  captured_at?: string
  attribution_window_days?: number
}

export function attributionFromMetadata(
  metadata?: Record<string, unknown> | null
): PurchaseAttribution | undefined {
  const attribution = metadata?.attribution
  if (!attribution || typeof attribution !== "object") return undefined
  return attribution as PurchaseAttribution
}

export function buildPurchasePayload(
  order: OrderWithCanonicalTotal & {
    id: string
    currency_code?: string | null
    metadata?: Record<string, unknown> | null
  }
) {
  const attribution = attributionFromMetadata(order.metadata)
  const resolvedSource = attribution?.resolved_source || "direct"
  const resolvedMedium = attribution?.resolved_medium || "none"
  const resolvedCampaign = attribution?.resolved_campaign || ""
  const resolvedVia = attribution?.resolved_via || "direct"

  return {
    site: "ardmag.ro",
    event: "purchase",
    event_id: order.id,
    value: getCanonicalOrderTotal(order),
    currency: (order.currency_code || "ron").toUpperCase(),
    utm_source: resolvedSource,
    utm_medium: resolvedMedium,
    utm_campaign: resolvedCampaign,
    resolved_via: resolvedVia,
  }
}

export async function verifyCollectorPurchaseResponse(response: Response): Promise<void> {
  if (!response.ok) throw new Error(`collector_http_${response.status}`)
  let body: unknown
  try {
    body = await response.json()
  } catch {
    throw new Error("collector_invalid_json")
  }
  const result = body as { ok?: unknown; written?: unknown }
  if (result.ok !== true || result.written !== 1) throw new Error("collector_write_not_acknowledged")
}
