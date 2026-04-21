import { AbstractNotificationProviderService } from "@medusajs/framework/utils"
import { Logger } from "@medusajs/framework/types"
import { NotificationTypes } from "@medusajs/types"

type InjectedDependencies = {
  logger: Logger
}

type Options = {
  apiKey: string
  fromEmail: string
  fromName?: string
}

export class Smtp2goNotificationService extends AbstractNotificationProviderService {
  static identifier = "smtp2go"

  private logger_: Logger
  private options_: Options

  constructor({ logger }: InjectedDependencies, options: Options) {
    super()
    this.logger_ = logger
    this.options_ = options
  }

  static validateOptions(options: Record<string, unknown>) {
    if (!options.apiKey) throw new Error("smtp2go: apiKey is required")
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

    const payload = {
      api_key: this.options_.apiKey,
      to: [{ email: to, name: to }],
      sender: `${this.options_.fromName ?? "ardmag.com"} <${this.options_.fromEmail}>`,
      subject,
      html_body: htmlBody,
    }

    const res = await fetch("https://api.smtp2go.com/v3/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const result = (await res.json()) as { data?: { succeeded?: number }; error?: string }

    if (!res.ok || result.data?.succeeded !== 1) {
      this.logger_.error(`smtp2go: failed to send to ${to} — ${JSON.stringify(result)}`)
      return {}
    }

    this.logger_.info(`smtp2go: sent "${template}" to ${to}`)
    return { id: `smtp2go-${Date.now()}` }
  }

  private subjectFromTemplate(template: string): string {
    const map: Record<string, string> = {
      "order.confirmation.customer": "Confirmare comanda — ardmag.com",
      "order.confirmation.admin": "Comanda noua pe ardmag.com",
    }
    return map[template] ?? `Notificare ardmag.com`
  }

  private renderTemplate(template: string, data: Record<string, unknown>): string {
    const order = data?.order as Record<string, unknown> | undefined

    if (template === "order.confirmation.customer") {
      return this.renderCustomerConfirmation(order)
    }
    if (template === "order.confirmation.admin") {
      return this.renderAdminNotification(order)
    }
    return `<p>Notificare: ${template}</p>`
  }

  private renderCustomerConfirmation(order?: Record<string, unknown>): string {
    const displayId = order?.display_id ?? ""
    const total = order?.total ? (Number(order.total) / 100).toFixed(2) : "0.00"
    const email = order?.email ?? ""
    const items = (order?.items as Array<Record<string, unknown>>) ?? []

    const itemsHtml = items.map((item) =>
      `<tr>
        <td style="padding:8px;border-bottom:1px solid #eee">${item.title ?? item.product_title ?? ""}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${((Number(item.unit_price ?? 0)) / 100).toFixed(2)} RON</td>
      </tr>`
    ).join("")

    return `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">
  <div style="background:#1e293b;padding:24px;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:20px">ardmag.com</h1>
    <p style="color:#94a3b8;margin:4px 0 0">PRECIZIE SOLIDA</p>
  </div>
  <div style="padding:32px 24px">
    <h2 style="color:#1e293b">Comanda confirmata #${displayId}</h2>
    <p>Multumim pentru comanda! Am primit comanda ta si o vom procesa in cel mai scurt timp.</p>
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
    <p style="color:#64748b;font-size:14px">Intrebari? Ne gasesti la <a href="mailto:office@arcromdiamonds.ro">office@arcromdiamonds.ro</a> sau +40 722 155 441</p>
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
    const shippingAddress = order?.shipping_address as Record<string, unknown> | undefined
    const paymentProviders = (order?.payment_collections as Array<Record<string, unknown>>)
      ?.flatMap((pc) => (pc.payment_sessions as Array<Record<string, unknown>>)?.map((ps) => ps.provider_id) ?? [])
      ?? []
    const paymentMethod = paymentProviders[0]?.toString().includes("pp_system_default") ? "Ramburs" : "Card (Stripe)"

    const itemsHtml = items.map((item) =>
      `<tr>
        <td style="padding:6px 8px;border-bottom:1px solid #eee">${item.title ?? item.product_title ?? ""}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${((Number(item.unit_price ?? 0)) / 100).toFixed(2)} RON</td>
      </tr>`
    ).join("")

    const address = shippingAddress
      ? `${shippingAddress.first_name ?? ""} ${shippingAddress.last_name ?? ""}, ${shippingAddress.address_1 ?? ""}, ${shippingAddress.city ?? ""}, ${shippingAddress.postal_code ?? ""}`
      : "N/A"

    return `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">
  <h2>Comanda noua #${displayId}</h2>
  <p><strong>Client:</strong> ${email}</p>
  <p><strong>Adresa livrare:</strong> ${address}</p>
  <p><strong>Metoda plata:</strong> ${paymentMethod}</p>
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
