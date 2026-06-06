import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

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
    const orderService = container.resolve(Modules.ORDER)
    const order = await orderService.retrieveOrder(orderId, {
      select: ["id", "total", "currency_code"],
    })

    await fetch(`${collectorUrl}/a`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        site: "ardmag.ro",
        event: "purchase",
        value: Number(order?.total ?? 0),
        extra: {
          order_id: orderId,
          currency: order?.currency_code || "ron",
        },
      }),
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
