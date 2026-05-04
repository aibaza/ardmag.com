import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function customerCreatedWelcome({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const customerId = event.data?.id
  if (!customerId) return

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  let notificationModuleService: any
  try {
    notificationModuleService = container.resolve(Modules.NOTIFICATION)
  } catch {
    logger.warn("[welcome-notify] Notification module not available")
    return
  }

  try {
    const customerModuleService = container.resolve(Modules.CUSTOMER)
    const customer = await customerModuleService.retrieveCustomer(customerId)

    if (!customer.email) return

    await notificationModuleService.createNotifications({
      to: customer.email,
      channel: "email",
      template: "customer.welcome",
      data: {
        customer,
        firstName: customer.first_name,
      },
    })

    logger.info(`[welcome-notify] Sent welcome email to ${customer.email}`)
  } catch (err) {
    logger.error(`[welcome-notify] Failed for customer ${customerId}: ${err}`)
  }
}

export const config: SubscriberConfig = {
  event: "customer.created",
  context: { subscriberId: "customer-created-welcome" },
}
