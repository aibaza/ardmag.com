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

export function buildPurchasePayload(order: {
  id: string
  total?: number | null
  currency_code?: string | null
  metadata?: Record<string, unknown> | null
}) {
  const attribution = attributionFromMetadata(order.metadata)
  const resolvedSource = attribution?.resolved_source || "direct"
  const resolvedMedium = attribution?.resolved_medium || "none"
  const resolvedCampaign = attribution?.resolved_campaign || ""
  const resolvedVia = attribution?.resolved_via || "direct"

  return {
    site: "ardmag.ro",
    event: "purchase",
    event_id: order.id,
    order_id: order.id,
    value: Number(order.total ?? 0),
    currency: order.currency_code || "ron",
    utm_source: resolvedSource,
    utm_medium: resolvedMedium,
    utm_campaign: resolvedCampaign,
    utm_content: resolvedVia,
    resolved_via: resolvedVia,
    extra: {
      order_id: order.id,
      currency: order.currency_code || "ron",
      attribution: attribution
        ? {
            resolved_source: resolvedSource,
            resolved_medium: resolvedMedium,
            resolved_campaign: resolvedCampaign,
            resolved_via: resolvedVia,
            first_touch: attribution.first_touch,
            last_touch: attribution.last_touch,
            fbclid: attribution.fbclid,
            gclid: attribution.gclid,
            fbc: attribution.fbc,
            fbp: attribution.fbp,
            attribution_window_days: attribution.attribution_window_days,
          }
        : {
            resolved_source: "direct",
            resolved_medium: "none",
            resolved_campaign: "",
            resolved_via: resolvedVia,
            attribution_window_days: 90,
          },
    },
  }
}
