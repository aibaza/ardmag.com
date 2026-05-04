import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { NEWSLETTER_MODULE } from "../../../modules/newsletter"
import type NewsletterModuleService from "../../../modules/newsletter/service"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { email } = (req.body ?? {}) as { email?: string }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Email invalid" })
  }

  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const newsletterService = req.scope.resolve<NewsletterModuleService>(NEWSLETTER_MODULE)
  const notificationService = req.scope.resolve(Modules.NOTIFICATION)

  const result = await newsletterService.subscribe(email)

  if (result.status === "confirmed") {
    return res.json({ ok: true, status: "already_confirmed" })
  }

  const siteBaseUrl = process.env.SITE_BASE_URL || "https://ardmag.ro"
  const confirmUrl = `${siteBaseUrl}/newsletter/confirma?token=${result.confirm_token}`

  // Lookup unsubscribe token
  const subs = await newsletterService.listNewsletterSubscribers({ id: result.id })
  const unsubToken = subs[0]?.unsubscribe_token ?? ""
  const unsubscribeUrl = `${siteBaseUrl}/newsletter/dezaboneaza?token=${unsubToken}`

  try {
    await notificationService.createNotifications({
      to: email,
      channel: "email",
      template: "newsletter.confirm",
      data: { confirmUrl, unsubscribeUrl },
    })
  } catch (err) {
    logger.error(`[newsletter] Failed to send confirm email to ${email}: ${err}`)
    return res.status(500).json({ error: "Failed to send confirmation email" })
  }

  return res.json({ ok: true, status: "pending" })
}
