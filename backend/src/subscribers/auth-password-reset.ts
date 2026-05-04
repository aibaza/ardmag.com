import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

type PasswordResetPayload = {
  entity_id: string   // email address
  actor_type: string  // "customer" | "user"
  token: string
  metadata?: Record<string, unknown>
}

export default async function authPasswordReset({
  event,
  container,
}: SubscriberArgs<PasswordResetPayload>) {
  const { entity_id: email, actor_type, token } = event.data ?? {}
  if (!email || !token) return

  // Trimitem resetare doar pentru clienti, nu pentru admin users
  if (actor_type && actor_type !== "customer") return

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  let notificationModuleService: any
  try {
    notificationModuleService = container.resolve(Modules.NOTIFICATION)
  } catch {
    logger.warn("[password-reset-notify] Notification module not available")
    return
  }

  try {
    const siteBaseUrl = process.env.SITE_BASE_URL || "https://ardmag.ro"
    const resetUrl = `${siteBaseUrl}/cont/resetare-parola?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`

    await notificationModuleService.createNotifications({
      to: email,
      channel: "email",
      template: "password.reset",
      data: { resetUrl, email, token },
    })

    logger.info(`[password-reset-notify] Sent password reset email to ${email}`)
  } catch (err) {
    logger.error(`[password-reset-notify] Failed for ${email}: ${err}`)
  }
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
  context: { subscriberId: "auth-password-reset-notify" },
}
