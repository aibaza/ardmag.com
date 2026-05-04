import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { NEWSLETTER_MODULE } from "../../../../modules/newsletter"
import type NewsletterModuleService from "../../../../modules/newsletter/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const token = (req.query as Record<string, string>).token
  if (!token) return res.status(400).json({ error: "Token lipsă" })

  const newsletterService = req.scope.resolve<NewsletterModuleService>(NEWSLETTER_MODULE)
  const unsubscribed = await newsletterService.unsubscribe(token)

  if (!unsubscribed) {
    return res.status(404).json({ error: "Token invalid" })
  }

  return res.json({ ok: true, status: "unsubscribed" })
}
