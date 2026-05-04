import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

type ShipmentPayload = {
  id: string
  no_notification?: boolean
}

export default async function orderShipmentCreated({
  event,
  container,
}: SubscriberArgs<ShipmentPayload>) {
  const fulfillmentId = event.data?.id
  const noNotification = event.data?.no_notification

  if (!fulfillmentId || noNotification) return

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  let notificationModuleService: any
  try {
    notificationModuleService = container.resolve(Modules.NOTIFICATION)
  } catch {
    logger.warn("[shipment-notify] Notification module not available")
    return
  }

  try {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: fulfillments } = await query.graph({
      entity: "fulfillment",
      filters: { id: fulfillmentId },
      fields: [
        "id",
        "tracking_links.*",
        "order.id",
        "order.display_id",
        "order.email",
        "order.shipping_address.*",
      ],
    })

    const fulfillment = fulfillments?.[0] as Record<string, unknown> | undefined
    const order = fulfillment?.order as Record<string, unknown> | undefined

    if (!order?.email) {
      logger.warn(`[shipment-notify] No order email for fulfillment ${fulfillmentId}`)
      return
    }

    await notificationModuleService.createNotifications({
      to: order.email as string,
      channel: "email",
      template: "order.shipped",
      data: { fulfillment, order },
    })

    logger.info(`[shipment-notify] Sent shipping notification for fulfillment ${fulfillmentId} to ${order.email}`)
  } catch (err) {
    logger.error(`[shipment-notify] Failed for fulfillment ${fulfillmentId}: ${err}`)
  }
}

export const config: SubscriberConfig = {
  event: "shipment.created",
  context: { subscriberId: "order-shipment-created-notify" },
}
