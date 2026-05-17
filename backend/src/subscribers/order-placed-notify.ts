import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

const ADMIN_EMAIL = process.env.ORDER_NOTIFY_EMAIL || "comenzi@ardmag.ro"

export default async function orderPlacedNotify({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = event.data?.id
  if (!orderId) return

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  // Skip if smtp2go module not configured
  let notificationModuleService: any
  try {
    notificationModuleService = container.resolve(Modules.NOTIFICATION)
  } catch {
    logger.warn("[order-notify] Notification module not available — set SMTP2GO_API_KEY to enable emails")
    return
  }

  try {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "total",
        "subtotal",
        "tax_total",
        "shipping_total",
        "discount_total",
        "currency_code",
        "created_at",
        "items.*",
        "items.product.*",
        "items.variant.*",
        "items.thumbnail",
        "shipping_address.*",
        "billing_address.*",
        "shipping_methods.*",
        "payment_collections.*",
        "payment_collections.payments.*",
      ],
      filters: { id: orderId },
    })
    const order = orders?.[0]
    if (!order) {
      logger.warn(`[order-notify] Order ${orderId} not found via Query`)
      return
    }

    // Email catre admin
    await notificationModuleService.createNotifications({
      to: ADMIN_EMAIL,
      channel: "email",
      template: "order.confirmation.admin",
      data: { order, subject: `Comanda noua #${order.display_id} — ${order.email}` },
    })

    // Email confirmare catre client
    if (order.email) {
      await notificationModuleService.createNotifications({
        to: order.email,
        channel: "email",
        template: "order.confirmation.customer",
        data: { order },
      })
    }

    logger.info(`[order-notify] Sent order confirmation emails for order ${order.display_id}`)
  } catch (err) {
    logger.error(`[order-notify] Failed to send emails for order ${orderId}: ${err}`)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
  context: { subscriberId: "order-placed-notify" },
}
