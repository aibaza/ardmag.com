import { AbstractNotificationProviderService } from "@medusajs/framework/utils"
import { Logger } from "@medusajs/framework/types"
import { NotificationTypes } from "@medusajs/types"
import * as nodemailer from "nodemailer"
import { renderOrderCustomer } from "./templates/order-customer"
import { renderOrderAdmin } from "./templates/order-admin"
import { renderCustomerWelcome } from "./templates/customer-welcome"
import { renderPasswordReset } from "./templates/password-reset"
import { renderOrderShipped } from "./templates/order-shipped"
import { renderNewsletterConfirm } from "./templates/newsletter-confirm"
import { renderCartAbandoned } from "./templates/cart-abandoned"

type InjectedDependencies = {
  logger: Logger
}

type Options = {
  // HTTP API mode
  apiKey?: string
  // SMTP mode (fallback)
  smtpHost?: string
  smtpPort?: number
  smtpUser?: string
  smtpPass?: string
  // From addresses per rol
  fromEmailTransactional?: string  // comenzi@ardmag.ro
  fromEmailContact?: string        // contact@ardmag.ro
  fromEmailNoreply?: string        // no-reply@ardmag.ro
  replyTo?: string                 // office@ardmag.ro
  fromName?: string
  siteBaseUrl?: string
}

export class Smtp2goNotificationService extends AbstractNotificationProviderService {
  static identifier = "smtp2go"

  private logger_: Logger
  private options_: Options
  private transporter_: nodemailer.Transporter | null = null

  constructor({ logger }: InjectedDependencies, options: Options) {
    super()
    this.logger_ = logger
    this.options_ = options

    if (!options.apiKey && options.smtpHost) {
      this.transporter_ = nodemailer.createTransport({
        host: options.smtpHost,
        port: options.smtpPort ?? 587,
        secure: false,
        auth: { user: options.smtpUser, pass: options.smtpPass },
      })
    }

    const mode = options.apiKey ? "HTTP API" : (options.smtpHost ? "SMTP relay" : "DISABLED")
    const senders = [
      options.fromEmailTransactional ?? "comenzi@ardmag.ro",
      options.fromEmailContact ?? "contact@ardmag.ro",
      options.fromEmailNoreply ?? "office@ardmag.ro",
    ].join(", ")
    this.logger_.info(`[smtp2go] Notification provider initialized: mode=${mode}, senders=[${senders}], replyTo=${options.replyTo ?? "office@ardmag.ro"}`)
  }

  static validateOptions(options: Record<string, unknown>) {
    if (!options.apiKey && !options.smtpHost) {
      throw new Error("smtp2go: set either apiKey (HTTP API) or smtpHost+smtpUser+smtpPass (SMTP relay)")
    }
    const hasFrom = options.fromEmailTransactional || options.fromEmailNoreply
    if (!hasFrom) {
      throw new Error("smtp2go: set at least SMTP_FROM_TRANSACTIONAL or SMTP_FROM_NOREPLY")
    }
  }

  async send(
    notification: NotificationTypes.ProviderSendNotificationDTO
  ): Promise<NotificationTypes.ProviderSendNotificationResultsDTO> {
    const { to, template, data } = notification

    const subject = (data as Record<string, unknown>)?.subject as string | undefined
      ?? this.subjectFromTemplate(template)
    const htmlBody = (data as Record<string, unknown>)?.html as string | undefined
      ?? this.renderTemplate(template, data as Record<string, unknown>)

    const ccRaw = (data as Record<string, unknown>)?.cc
    const cc = Array.isArray(ccRaw)
      ? (ccRaw as unknown[]).filter((v): v is string => typeof v === "string" && v.length > 0)
      : typeof ccRaw === "string" && ccRaw.length > 0
        ? [ccRaw]
        : undefined

    const fromEmail = this.getFromEmail(template)
    const fromName = this.options_.fromName ?? "ardmag.ro"
    const from = `${fromName} <${fromEmail}>`
    const replyTo = this.options_.replyTo ?? "office@ardmag.ro"

    if (this.options_.apiKey) {
      return this.sendViaApi(to, subject, htmlBody, from, replyTo, cc)
    }
    return this.sendViaSmtp(to, subject, htmlBody, from, replyTo, cc)
  }

  private getFromEmail(template: string): string {
    if (template.startsWith("order.") || template.startsWith("cart.")) {
      return this.options_.fromEmailTransactional ?? "comenzi@ardmag.ro"
    }
    if (template.startsWith("contact.")) {
      return this.options_.fromEmailContact ?? "contact@ardmag.ro"
    }
    return this.options_.fromEmailNoreply ?? "office@ardmag.ro"
  }

  private async sendViaApi(
    to: string, subject: string, html: string, from: string, replyTo: string, cc?: string[]
  ): Promise<NotificationTypes.ProviderSendNotificationResultsDTO> {
    const body: Record<string, unknown> = {
      sender: from,
      to: [to],
      subject,
      html_body: html,
      custom_headers: [{ header: "Reply-To", value: replyTo }],
    }
    if (cc && cc.length > 0) {
      body.cc = cc
    }
    const res = await fetch("https://api.smtp2go.com/v3/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Smtp2go-Api-Key": this.options_.apiKey!,
      },
      body: JSON.stringify(body),
    })
    const result = (await res.json()) as { data?: { succeeded?: number; error?: string; error_code?: string } }
    if (!res.ok || result.data?.succeeded !== 1) {
      this.logger_.error(`smtp2go API: failed to send to ${to} — ${JSON.stringify(result)}`)
      return {}
    }
    const ccLog = cc && cc.length > 0 ? ` (cc: ${cc.join(", ")})` : ""
    this.logger_.info(`smtp2go: sent "${subject}" to ${to}${ccLog} from ${from}`)
    return { id: `smtp2go-${Date.now()}` }
  }

  private async sendViaSmtp(
    to: string, subject: string, html: string, from: string, replyTo: string, cc?: string[]
  ): Promise<NotificationTypes.ProviderSendNotificationResultsDTO> {
    if (!this.transporter_) {
      this.logger_.error("smtp2go: no transporter configured")
      return {}
    }
    try {
      const info = await this.transporter_.sendMail({
        from, to, replyTo, subject, html,
        ...(cc && cc.length > 0 ? { cc } : {}),
      })
      const ccLog = cc && cc.length > 0 ? ` (cc: ${cc.join(", ")})` : ""
      this.logger_.info(`smtp2go SMTP: sent to ${to}${ccLog} — messageId: ${info.messageId}`)
      return { id: info.messageId }
    } catch (err) {
      this.logger_.error(`smtp2go SMTP: failed to send to ${to}: ${err}`)
      return {}
    }
  }

  private get siteBaseUrl(): string {
    return this.options_.siteBaseUrl ?? "https://ardmag.ro"
  }

  private subjectFromTemplate(template: string): string {
    const map: Record<string, string> = {
      "order.confirmation.customer": "Confirmare comandă — ardmag.ro",
      "order.confirmation.admin": "Comandă nouă pe ardmag.ro",
      "order.shipped": "Comanda ta a fost expediată",
      "customer.welcome": "Bun venit la ardmag.ro",
      "password.reset": "Resetare parolă ardmag.ro",
      "newsletter.confirm": "Confirmă abonarea la ardmag.ro",
      "cart.abandoned": "Coșul tău te așteaptă pe ardmag.ro",
      "contact.admin": "Mesaj nou de pe ardmag.ro",
      "contact.autoreply": "Am primit mesajul tău — ardmag.ro",
    }
    return map[template] ?? "Notificare ardmag.ro"
  }

  private renderTemplate(template: string, data: Record<string, unknown>): string {
    const order = data?.order as Record<string, unknown> | undefined
    const baseUrl = this.siteBaseUrl

    if (template === "order.confirmation.customer") return renderOrderCustomer(order, baseUrl)
    if (template === "order.confirmation.admin") return renderOrderAdmin(order)
    if (template === "customer.welcome") return renderCustomerWelcome(data?.firstName as string | undefined, baseUrl)
    if (template === "password.reset") return renderPasswordReset(data?.resetUrl as string ?? baseUrl + "/cont/resetare-parola", baseUrl)
    if (template === "order.shipped") return renderOrderShipped({ fulfillment: data?.fulfillment as Record<string, unknown>, order }, baseUrl)
    if (template === "cart.abandoned") return renderCartAbandoned(data?.cart as Record<string, unknown> ?? {}, baseUrl)
    if (template === "newsletter.confirm") return renderNewsletterConfirm(
      data?.confirmUrl as string ?? `${baseUrl}/newsletter/confirmat`,
      data?.unsubscribeUrl as string ?? `${baseUrl}/newsletter/dezabonat`,
      baseUrl
    )
    return `<p>Notificare: ${template}</p>`
  }
}

export default Smtp2goNotificationService
