import { colors, font } from "./tokens"

function formatPrice(value: unknown): string {
  return (Number(value ?? 0) / 100).toFixed(2)
}

export function renderOrderAdmin(order: Record<string, unknown> | undefined): string {
  if (!order) return "<p>Detalii comandă indisponibile.</p>"

  const displayId = order.display_id ?? ""
  const total = formatPrice(order.total)
  const email = order.email ?? ""
  const items = (order.items as Array<Record<string, unknown>>) ?? []
  const addr = order.shipping_address as Record<string, unknown> | undefined
  const address = addr
    ? `${addr.first_name ?? ""} ${addr.last_name ?? ""}, ${addr.address_1 ?? ""}, ${addr.city ?? ""}`
    : "N/A"

  const sessions = (order?.payment_collections as Array<Record<string, unknown>>)
    ?.flatMap((pc) => (pc.payment_sessions as Array<Record<string, unknown>>)?.map((ps) => ps.provider_id) ?? []) ?? []
  const paymentMethod = sessions[0]?.toString().includes("pp_system_default") ? "Ramburs (la curier)" : "Card (Stripe)"

  const itemsHtml = items.map((item) => `
    <tr>
      <td style="padding:7px 8px;border-bottom:1px solid ${colors.border}">${item.title ?? item.product_title ?? ""}</td>
      <td style="padding:7px 8px;border-bottom:1px solid ${colors.border};text-align:center">${item.quantity}</td>
      <td style="padding:7px 8px;border-bottom:1px solid ${colors.border};text-align:right">${formatPrice(item.unit_price)} RON</td>
    </tr>`).join("")

  return `<!DOCTYPE html>
<html lang="ro">
<head><meta charset="UTF-8"></head>
<body style="font-family:${font.family};font-size:${font.sizeBase};color:${colors.bodyText};max-width:600px;margin:0 auto;padding:16px">
  <h2 style="color:${colors.brand};margin:0 0 16px">Comandă nouă #${displayId}</h2>
  <table cellpadding="0" cellspacing="0" style="margin-bottom:16px">
    <tr><td style="padding:3px 8px 3px 0;color:${colors.mutedText}">Client:</td><td><strong>${email}</strong></td></tr>
    <tr><td style="padding:3px 8px 3px 0;color:${colors.mutedText}">Adresă:</td><td>${address}</td></tr>
    <tr><td style="padding:3px 8px 3px 0;color:${colors.mutedText}">Plată:</td><td><strong>${paymentMethod}</strong></td></tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:16px">
    <thead>
      <tr style="background:${colors.surface}">
        <th style="padding:7px 8px;text-align:left;border-bottom:2px solid ${colors.border}">Produs</th>
        <th style="padding:7px 8px;text-align:center;border-bottom:2px solid ${colors.border}">Cant.</th>
        <th style="padding:7px 8px;text-align:right;border-bottom:2px solid ${colors.border}">Preț</th>
      </tr>
    </thead>
    <tbody>${itemsHtml}</tbody>
  </table>
  <p style="font-size:18px;font-weight:700">Total: ${total} RON</p>
</body>
</html>`
}
