import { colors, font, formatPrice } from "./tokens"

function renderItemCell(item: Record<string, unknown>): string {
  const title = item.product_title ?? item.title ?? ""
  const identifier = item.variant_sku ?? item.product_handle ?? ""
  const variantTitle = (item.variant_title as string | undefined) ?? ""
  const showVariant = variantTitle && variantTitle !== "Default Title"
  const lineStyle = `font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;font-size:11px;color:${colors.mutedText};margin-top:2px`
  return `
    <div>${title}</div>
    ${identifier ? `<div style="${lineStyle}">${identifier}</div>` : ""}
    ${showVariant ? `<div style="${lineStyle};text-transform:uppercase">${variantTitle}</div>` : ""}
  `
}

export function renderOrderAdmin(order: Record<string, unknown> | undefined): string {
  if (!order) return "<p>Detalii comandă indisponibile.</p>"

  const displayId = order.display_id ?? ""
  const total = formatPrice(order.total)
  const email = order.email ?? ""
  const items = (order.items as Array<Record<string, unknown>>) ?? []
  const addr = order.shipping_address as Record<string, unknown> | undefined
  const shippingPhone = typeof addr?.phone === "string" ? addr.phone.trim() : ""
  const address = addr
    ? `${addr.first_name ?? ""} ${addr.last_name ?? ""}, ${addr.address_1 ?? ""}, ${addr.city ?? ""}`
    : "N/A"

  // Citim provider-ul din pc.payments (snapshot-at pe order line items), NU din
  // pc.payment_sessions (ephemeral checkout state, nu este in query).
  const providers = (order?.payment_collections as Array<Record<string, unknown>>)
    ?.flatMap((pc) => (pc.payments as Array<Record<string, unknown>>)?.map((p) => p.provider_id) ?? []) ?? []
  const providerId = (providers[0] ?? "").toString().toLowerCase()
  const paymentMethod = providerId.includes("pp_system_default") || providerId.includes("manual")
    ? "Ramburs (la curier)"
    : providerId.includes("stripe")
      ? "Card (Stripe)"
      : providerId || "Necunoscut"

  const itemsHtml = items.map((item) => `
    <tr>
      <td style="padding:7px 8px;border-bottom:1px solid ${colors.border};vertical-align:top">${renderItemCell(item)}</td>
      <td style="padding:7px 8px;border-bottom:1px solid ${colors.border};text-align:center;vertical-align:top">${item.quantity}</td>
      <td style="padding:7px 8px;border-bottom:1px solid ${colors.border};text-align:right;vertical-align:top;white-space:nowrap">${formatPrice(item.unit_price)} RON</td>
    </tr>`).join("")

  return `<!DOCTYPE html>
<html lang="ro">
<head><meta charset="UTF-8"></head>
<body style="font-family:${font.family};font-size:${font.sizeBase};color:${colors.bodyText};max-width:600px;margin:0 auto;padding:16px">
  <h2 style="color:${colors.brand};margin:0 0 16px">Comandă nouă #${displayId}</h2>
  <table cellpadding="0" cellspacing="0" style="margin-bottom:16px">
    <tr><td style="padding:3px 8px 3px 0;color:${colors.mutedText}">Client:</td><td><strong>${email}</strong></td></tr>
    <tr><td style="padding:3px 8px 3px 0;color:${colors.mutedText}">Adresă:</td><td>${address}</td></tr>
    <tr><td style="padding:3px 8px 3px 0;color:${colors.mutedText}">Telefon livrare:</td><td><strong>${shippingPhone || "N/A"}</strong></td></tr>
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
