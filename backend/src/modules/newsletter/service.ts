import { MedusaService } from "@medusajs/framework/utils"
import crypto from "node:crypto"
import NewsletterSubscriber from "./models/newsletter-subscriber"

type SubscriberStatus = "pending" | "confirmed" | "unsubscribed"

class NewsletterModuleService extends MedusaService({ NewsletterSubscriber }) {
  async subscribe(email: string): Promise<{ id: string; status: SubscriberStatus; confirm_token: string | null; isNew: boolean }> {
    const normalized = email.trim().toLowerCase()

    const existing = await this.listNewsletterSubscribers({ email: normalized })

    if (existing.length > 0) {
      const sub = existing[0]
      if (sub.status === "confirmed") {
        return { id: sub.id, status: "confirmed", confirm_token: null, isNew: false }
      }
      // Pending sau unsubscribed — regeneram tokenul si retrimitem
      const confirmToken = crypto.randomBytes(32).toString("hex")
      await this.updateNewsletterSubscribers(
        { id: sub.id },
        { status: "pending", confirm_token: confirmToken, unsubscribed_at: null }
      )
      return { id: sub.id, status: "pending", confirm_token: confirmToken, isNew: false }
    }

    const confirmToken = crypto.randomBytes(32).toString("hex")
    const unsubToken = crypto.randomBytes(32).toString("hex")
    const [created] = await this.createNewsletterSubscribers([{
      email: normalized,
      status: "pending" as SubscriberStatus,
      confirm_token: confirmToken,
      unsubscribe_token: unsubToken,
      subscribed_at: new Date(),
    }])

    return { id: created.id, status: "pending", confirm_token: confirmToken, isNew: true }
  }

  async confirm(token: string): Promise<boolean> {
    const subs = await this.listNewsletterSubscribers({ confirm_token: token })
    if (subs.length === 0) return false

    const sub = subs[0]
    if (sub.status === "confirmed") return true

    await this.updateNewsletterSubscribers(
      { id: sub.id },
      { status: "confirmed" as SubscriberStatus, confirmed_at: new Date(), confirm_token: null }
    )
    return true
  }

  async unsubscribe(token: string): Promise<boolean> {
    const subs = await this.listNewsletterSubscribers({ unsubscribe_token: token })
    if (subs.length === 0) return false

    const sub = subs[0]
    if (sub.status === "unsubscribed") return true

    await this.updateNewsletterSubscribers(
      { id: sub.id },
      { status: "unsubscribed" as SubscriberStatus, unsubscribed_at: new Date() }
    )
    return true
  }
}

export default NewsletterModuleService
