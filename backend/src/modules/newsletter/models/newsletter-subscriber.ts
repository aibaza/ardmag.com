import { model } from "@medusajs/framework/utils"

const NewsletterSubscriber = model.define("newsletter_subscriber", {
  id: model.id().primaryKey(),
  email: model.text(),
  status: model.enum(["pending", "confirmed", "unsubscribed"]).default("pending"),
  confirm_token: model.text().nullable(),
  unsubscribe_token: model.text().nullable(),
  subscribed_at: model.dateTime(),
  confirmed_at: model.dateTime().nullable(),
  unsubscribed_at: model.dateTime().nullable(),
})

export default NewsletterSubscriber
