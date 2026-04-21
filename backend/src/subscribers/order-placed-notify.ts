import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

const ADMIN_EMAIL = process.env.ORDER_NOTIFY_EMAIL || "office@arcromdiamonds.ro"

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
    const orderModuleService = container.resolve(Modules.ORDER)
    const order = await orderModuleService.retrieveOrder(orderId, {
      relations: [
        "items",
        "shipping_address",
        "billing_address",
        "payment_collections.payment_sessions",
      ],
    })

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
  event: "order.created",
  context: { subscriberId: "order-placed-notify" },
}
