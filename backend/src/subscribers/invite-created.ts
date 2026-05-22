import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function inviteCreatedNotify({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const inviteId = event.data?.id
  if (!inviteId) return

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  let notificationModuleService: any
  try {
    notificationModuleService = container.resolve(Modules.NOTIFICATION)
  } catch {
    logger.warn("[invite-notify] Notification module not available")
    return
  }

  try {
    const userModuleService = container.resolve(Modules.USER)
    const invite = await userModuleService.retrieveInvite(inviteId)

    if (!invite?.email || !invite?.token) {
      logger.warn(`[invite-notify] Invite ${inviteId} missing email or token`)
      return
    }

    const adminUrl = process.env.MEDUSA_ADMIN_URL || "https://api.ardmag.ro/app"
    const inviteUrl = `${adminUrl}/invite?token=${invite.token}`

    await notificationModuleService.createNotifications({
      to: invite.email,
      channel: "email",
      template: "admin.invite",
      data: {
        inviteUrl,
        email: invite.email,
      },
    })

    logger.info(`[invite-notify] Sent admin invite email to ${invite.email}`)
  } catch (err) {
    logger.error(`[invite-notify] Failed for invite ${inviteId}: ${err}`)
  }
}

export const config: SubscriberConfig = {
  event: "invite.created",
  context: { subscriberId: "invite-created-notify" },
}
