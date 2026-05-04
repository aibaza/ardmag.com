import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

const ABANDON_HOURS_MIN = 24
const ABANDON_HOURS_MAX = 72

export default async function abandonedCartReminderJob(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  let notificationService: any
  try {
    notificationService = container.resolve(Modules.NOTIFICATION)
  } catch {
    logger.warn("[abandoned-cart] Notification module not available")
    return
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const now = new Date()
  const minUpdated = new Date(now.getTime() - ABANDON_HOURS_MAX * 60 * 60 * 1000)
  const maxUpdated = new Date(now.getTime() - ABANDON_HOURS_MIN * 60 * 60 * 1000)

  try {
    const { data: carts } = await query.graph({
      entity: "cart",
      filters: {
        completed_at: null,
        email: { $ne: null },
        updated_at: { $gte: minUpdated, $lte: maxUpdated },
      },
      fields: [
        "id", "email", "total", "updated_at", "metadata",
        "items.id", "items.title", "items.quantity", "items.unit_price",
      ],
    }) as { data: Array<Record<string, unknown>> }

    let sent = 0
    for (const cart of carts) {
      const metadata = (cart.metadata as Record<string, unknown>) ?? {}
      if (metadata.abandoned_email_sent) continue
      if (!cart.email) continue

      const items = (cart.items as unknown[]) ?? []
      if (items.length === 0) continue

      try {
        await notificationService.createNotifications({
          to: cart.email as string,
          channel: "email",
          template: "cart.abandoned",
          data: { cart },
        })

        // Marcam metadata via cartModuleService
        const cartModuleService = container.resolve(Modules.CART)
        await cartModuleService.updateCarts(String(cart.id), {
          metadata: { ...metadata, abandoned_email_sent: now.toISOString() },
        })

        sent++
      } catch (err) {
        logger.error(`[abandoned-cart] Failed for cart ${cart.id}: ${err}`)
      }
    }

    if (sent > 0) {
      logger.info(`[abandoned-cart] Sent ${sent} abandoned cart reminder(s)`)
    }
  } catch (err) {
    logger.error(`[abandoned-cart] Job failed: ${err}`)
  }
}

export const config = {
  name: "abandoned-cart-reminder",
  schedule: "0 9 * * *",
}
