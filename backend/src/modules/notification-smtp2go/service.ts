import { AbstractNotificationProviderService } from "@medusajs/framework/utils"
import { Logger } from "@medusajs/framework/types"
import { NotificationTypes } from "@medusajs/types"
import * as nodemailer from "nodemailer"

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
  // Common
  fromEmail: string
  fromName?: string
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
  }

  static validateOptions(options: Record<string, unknown>) {
    if (!options.apiKey && !options.smtpHost) {
      throw new Error("smtp2go: set either apiKey (HTTP API) or smtpHost+smtpUser+smtpPass (SMTP relay)")
    }
    if (!options.fromEmail) throw new Error("smtp2go: fromEmail is required")
  }

  async send(
    notification: NotificationTypes.ProviderSendNotificationDTO
  ): Promise<NotificationTypes.ProviderSendNotificationResultsDTO> {
    const { to, template, data } = notification

    const subject = (data as Record<string, unknown>)?.subject as string | undefined
      ?? this.subjectFromTemplate(template)
    const htmlBody = (data as Record<string, unknown>)?.html as string | undefined
      ?? this.renderTemplate(template, data as Record<string, unknown>)

    const from = `${this.options_.fromName ?? "ardmag.com"} <${this.options_.fromEmail}>`

    if (this.options_.apiKey) {
      return this.sendViaApi(to, subject, htmlBody, from)
    }
    return this.sendViaSmtp(to, subject, htmlBody, from)
  }

  private async sendViaApi(
    to: string, subject: string, html: string, from: string
  ): Promise<NotificationTypes.ProviderSendNotificationResultsDTO> {
    const res = await fetch("https://api.smtp2go.com/v3/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Smtp2go-Api-Key": this.options_.apiKey!,
      },
      body: JSON.stringify({
        sender: from,
        to: [to],
        subject,
        html_body: html,
      }),
    })
    const result = (await res.json()) as { data?: { succeeded?: number; error?: string; error_code?: string } }
    if (!res.ok || result.data?.succeeded !== 1) {
      this.logger_.error(`smtp2go API: failed to send to ${to} — ${JSON.stringify(result)}`)
      return {}
    }
    this.logger_.info(`smtp2go: sent to ${to}`)
    return { id: `smtp2go-${Date.now()}` }
  }

  private async sendViaSmtp(
    to: string, subject: string, html: string, from: string
  ): Promise<NotificationTypes.ProviderSendNotificationResultsDTO> {
    if (!this.transporter_) {
      this.logger_.error("smtp2go: no transporter configured")
      return {}
    }
    try {
      const info = await this.transporter_.sendMail({ from, to, subject, html })
      this.logger_.info(`smtp2go SMTP: sent to ${to} — messageId: ${info.messageId}`)
      return { id: info.messageId }
    } catch (err) {
      this.logger_.error(`smtp2go SMTP: failed to send to ${to}: ${err}`)
      return {}
    }
  }

  private subjectFromTemplate(template: string): string {
    const map: Record<string, string> = {
      "order.confirmation.customer": "Confirmare comanda — ardmag.com",
      "order.confirmation.admin": "Comanda noua pe ardmag.com",
    }
    return map[template] ?? "Notificare ardmag.com"
  }

  private renderTemplate(template: string, data: Record<string, unknown>): string {
    const order = data?.order as Record<string, unknown> | undefined
    if (template === "order.confirmation.customer") return this.renderCustomerConfirmation(order)
    if (template === "order.confirmation.admin") return this.renderAdminNotification(order)
    return `<p>Notificare: ${template}</p>`
  }

  private renderCustomerConfirmation(order?: Record<string, unknown>): string {
    const displayId = order?.display_id ?? ""
    const total = order?.total ? (Number(order.total) / 100).toFixed(2) : "0.00"
    const items = (order?.items as Array<Record<string, unknown>>) ?? []
    const itemsHtml = items.map((item) =>
      `<tr>
        <td style="padding:8px;border-bottom:1px solid #eee">${item.title ?? item.product_title ?? ""}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${(Number(item.unit_price ?? 0) / 100).toFixed(2)} RON</td>
      </tr>`
    ).join("")

    return `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">
  <div style="background:#1e293b;padding:24px;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:20px">ardmag.com</h1>
    <p style="color:#94a3b8;margin:4px 0 0">Experți în piatră de peste 25 de ani</p>
  </div>
  <div style="padding:32px 24px">
    <h2 style="color:#1e293b">Comanda confirmata #${displayId}</h2>
    <p>Multumim pentru comanda! O vom procesa in cel mai scurt timp.</p>
    <table style="width:100%;border-collapse:collapse;margin:24px 0">
      <thead>
        <tr style="background:#f8fafc">
          <th style="padding:8px;text-align:left;border-bottom:2px solid #e2e8f0">Produs</th>
          <th style="padding:8px;text-align:center;border-bottom:2px solid #e2e8f0">Cant.</th>
          <th style="padding:8px;text-align:right;border-bottom:2px solid #e2e8f0">Pret</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <p style="text-align:right;font-size:18px;font-weight:bold">Total: ${total} RON</p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
    <p style="color:#64748b;font-size:14px">Intrebari? <a href="mailto:office@arcromdiamonds.ro">office@arcromdiamonds.ro</a> | +40 722 155 441</p>
    <p style="color:#64748b;font-size:14px">Program: Luni-Vineri 08:00-16:00</p>
  </div>
</body>
</html>`
  }

  private renderAdminNotification(order?: Record<string, unknown>): string {
    const displayId = order?.display_id ?? ""
    const total = order?.total ? (Number(order.total) / 100).toFixed(2) : "0.00"
    const email = order?.email ?? ""
    const items = (order?.items as Array<Record<string, unknown>>) ?? []
    const addr = order?.shipping_address as Record<string, unknown> | undefined
    const address = addr
      ? `${addr.first_name ?? ""} ${addr.last_name ?? ""}, ${addr.address_1 ?? ""}, ${addr.city ?? ""}`
      : "N/A"
    const paymentSessions = (order?.payment_collections as Array<Record<string, unknown>>)
      ?.flatMap((pc) => (pc.payment_sessions as Array<Record<string, unknown>>)?.map((ps) => ps.provider_id) ?? []) ?? []
    const paymentMethod = paymentSessions[0]?.toString().includes("pp_system_default") ? "Ramburs" : "Card (Stripe)"

    const itemsHtml = items.map((item) =>
      `<tr>
        <td style="padding:6px 8px;border-bottom:1px solid #eee">${item.title ?? item.product_title ?? ""}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${(Number(item.unit_price ?? 0) / 100).toFixed(2)} RON</td>
      </tr>`
    ).join("")

    return `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">
  <h2>Comanda noua #${displayId}</h2>
  <p><strong>Client:</strong> ${email}</p>
  <p><strong>Adresa:</strong> ${address}</p>
  <p><strong>Plata:</strong> ${paymentMethod}</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    <thead>
      <tr style="background:#f8fafc">
        <th style="padding:6px 8px;text-align:left;border-bottom:2px solid #e2e8f0">Produs</th>
        <th style="padding:6px 8px;text-align:center;border-bottom:2px solid #e2e8f0">Cant.</th>
        <th style="padding:6px 8px;text-align:right;border-bottom:2px solid #e2e8f0">Pret</th>
      </tr>
    </thead>
    <tbody>${itemsHtml}</tbody>
  </table>
  <p style="font-size:18px;font-weight:bold">Total: ${total} RON</p>
</body>
</html>`
  }
}

export default Smtp2goNotificationService
