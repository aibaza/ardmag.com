import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  attributionFromMetadata,
  buildPurchasePayload,
} from "../lib/attribution/purchase-payload"

// Server-to-server purchase event into the central portfolio collector
// (Cloudflare Worker + Analytics Engine). Runs on order.placed in the
// backend, so it is immune to adblockers by definition: the browser is
// never involved.
//
// Fail-open: any failure here is logged and swallowed - order processing
// never depends on analytics. COLLECTOR_URL unset = clean no-op.
export default async function orderPlacedAnalytics({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = event.data?.id
  if (!orderId) return

  const collectorUrl = (process.env.COLLECTOR_URL || "").replace(/\/$/, "")
  if (!collectorUrl) return

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "total",
        "currency_code",
        "metadata",
        "cart.id",
        "cart.metadata",
      ],
      filters: { id: orderId },
    })

    const order = orders?.[0]
    if (!order) return

    const orderMetadata = ((order as any).metadata ?? {}) as Record<string, unknown>
    const cartMetadata = ((order as any).cart?.metadata ?? {}) as Record<string, unknown>
    const cartAttribution = attributionFromMetadata(cartMetadata)

    if (!attributionFromMetadata(orderMetadata) && cartAttribution) {
      const metadata = { ...orderMetadata, attribution: cartAttribution }

      try {
        const orderService = container.resolve(Modules.ORDER) as any
        await orderService.updateOrders(order.id, { metadata })
      } catch (err) {
        logger.warn(
          `order-placed-analytics: could not persist cart attribution on order ${orderId} (fail-open): ${err}`
        )
      }

      ;(order as any).metadata = metadata
    }

    await fetch(`${collectorUrl}/a`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPurchasePayload(order as any)),
      signal: AbortSignal.timeout(5000),
    })
  } catch (err) {
    logger.warn(
      `order-placed-analytics: failed to record purchase for ${orderId} (fail-open): ${err}`
    )
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
