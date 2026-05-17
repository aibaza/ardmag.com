import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// When an order is placed with COD (pp_system_default / ramburs), log it for
// manual processing. The pp_system_default provider keeps payment in "not_paid"
// state until manually captured in admin — which is correct for COD.
// This subscriber notifies the admin that a COD order needs physical collection.
export default async function orderPlacedCod({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = event.data?.id
  if (!orderId) return

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "total",
        "payment_collections.payments.provider_id",
      ],
      filters: { id: orderId },
    })
    const order = orders?.[0]
    if (!order) return

    const orderAny = order as any
    const hasCodPayment = orderAny.payment_collections?.some((pc: any) =>
      pc.payments?.some((p: any) => p.provider_id?.includes("pp_system_default"))
    )

    if (!hasCodPayment) return

    logger.info(
      `[COD] Comanda ${order.display_id} (${orderId}) plasata cu Ramburs — ` +
      `client: ${order.email}, total: ${order.total} bani. ` +
      `Necesita colectare la livrare.`
    )
  } catch (err) {
    logger.error(`[COD subscriber] Eroare la procesarea comenzii ${orderId}: ${err}`)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
  context: { subscriberId: "order-placed-cod" },
}
