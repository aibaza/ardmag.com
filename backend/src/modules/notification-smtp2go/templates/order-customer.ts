import { colors, font } from "./tokens"
import { wrapEmail } from "./layout"

function formatPrice(value: unknown): string {
  return (Number(value ?? 0) / 100).toFixed(2)
}

function getPaymentLabel(order: Record<string, unknown>): { label: string; instructions: string } {
  const sessions = (order?.payment_collections as Array<Record<string, unknown>>)
    ?.flatMap((pc) => (pc.payment_sessions as Array<Record<string, unknown>>)?.map((ps) => ps.provider_id) ?? []) ?? []
  const providerId = sessions[0]?.toString() ?? ""
  if (providerId.includes("pp_system_default")) {
    const total = Number(order?.total ?? 0) / 100
    const freeShipping = total >= 500
    return {
      label: "Ramburs",
      instructions: `Pregătiți suma de <strong>${total.toFixed(2)} RON</strong> la primirea coletului.${freeShipping ? " Livrare gratuită (comandă peste 500 RON)." : ""}`,
    }
  }
  return {
    label: "Card (Stripe)",
    instructions: "Plata a fost procesată. Nu este necesară nicio acțiune suplimentară.",
  }
}

export function renderOrderCustomer(order: Record<string, unknown> | undefined, baseUrl: string): string {
  if (!order) return "<p>Detalii comandă indisponibile.</p>"

  const displayId = order.display_id ?? ""
  const total = formatPrice(order.total)
  const items = (order.items as Array<Record<string, unknown>>) ?? []
  const payment = getPaymentLabel(order)

  const itemsHtml = items.map((item) => `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid ${colors.border};font-size:${font.sizeBase}">${item.title ?? item.product_title ?? ""}</td>
      <td style="padding:10px 8px;border-bottom:1px solid ${colors.border};text-align:center;white-space:nowrap">${item.quantity}</td>
      <td style="padding:10px 8px;border-bottom:1px solid ${colors.border};text-align:right;white-space:nowrap">${formatPrice(item.unit_price)} RON</td>
    </tr>`).join("")

  const body = `
    <h2 style="color:${colors.brand};margin:0 0 8px;font-size:20px">Confirmare comandă #${displayId}</h2>
    <p style="margin:0 0 24px;color:${colors.mutedText}">Mulțumim! Comanda ta a fost înregistrată și o vom procesa în cel mai scurt timp.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px">
      <thead>
        <tr style="background:${colors.surface}">
          <th style="padding:10px 8px;text-align:left;border-bottom:2px solid ${colors.border};font-size:${font.sizeSmall}">Produs</th>
          <th style="padding:10px 8px;text-align:center;border-bottom:2px solid ${colors.border};font-size:${font.sizeSmall}">Cant.</th>
          <th style="padding:10px 8px;text-align:right;border-bottom:2px solid ${colors.border};font-size:${font.sizeSmall}">Preț</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    <p style="text-align:right;font-size:18px;font-weight:700;margin:0 0 24px">
      Total: <span style="color:${colors.brand}">${total} RON</span>
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:${colors.surface};border-radius:6px;margin-bottom:24px">
      <tr>
        <td style="padding:16px">
          <p style="margin:0 0 6px;font-size:${font.sizeSmall};color:${colors.mutedText}">METODĂ DE PLATĂ</p>
          <p style="margin:0 0 4px;font-weight:600">${payment.label}</p>
          <p style="margin:0;font-size:${font.sizeSmall};color:${colors.mutedText}">${payment.instructions}</p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 24px">
      <a href="${baseUrl}/cont/comenzi"
        style="background:${colors.brand};color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:600">
        Vezi comanda online
      </a>
    </p>

    <p style="font-size:${font.sizeSmall};color:${colors.mutedText};margin:0">
      Ai întrebări? Scrie la
      <a href="mailto:office@ardmag.ro" style="color:${colors.link}">office@ardmag.ro</a>
      sau sună la <strong>+40 722 155 441</strong> (Luni-Vineri 08:00-16:00).
    </p>`

  return wrapEmail(body, baseUrl)
}
