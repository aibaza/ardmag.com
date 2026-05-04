import { colors, font } from "./tokens"
import { wrapEmail } from "./layout"

function formatPrice(value: unknown): string {
  return (Number(value ?? 0) / 100).toFixed(2)
}

export function renderCartAbandoned(cart: Record<string, unknown>, baseUrl: string): string {
  const items = (cart.items as Array<Record<string, unknown>>) ?? []
  const total = formatPrice(cart.total)
  const totalNum = Number(cart.total ?? 0) / 100
  const freeShippingNote = totalNum > 0 && totalNum < 500
    ? `<p style="margin:0 0 16px;font-size:${font.sizeSmall};color:#0f766e">
         Adaugă produse pentru a ajunge la 500 RON și beneficiezi de <strong>livrare gratuită</strong>.
       </p>`
    : ""

  const itemsHtml = items.slice(0, 3).map((item) => `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid ${colors.border}">
        ${item.title ?? item.product_title ?? "Produs"}
        <span style="color:${colors.mutedText};font-size:${font.sizeSmall}"> × ${item.quantity}</span>
      </td>
      <td style="padding:10px 8px;border-bottom:1px solid ${colors.border};text-align:right;white-space:nowrap">
        ${formatPrice(Number(item.unit_price ?? 0) * Number(item.quantity ?? 1))} RON
      </td>
    </tr>`).join("")

  const moreItems = items.length > 3
    ? `<tr><td colspan="2" style="padding:8px;font-size:${font.sizeSmall};color:${colors.mutedText}">+${items.length - 3} produse în coș</td></tr>`
    : ""

  const body = `
    <h2 style="color:${colors.brand};margin:0 0 8px;font-size:20px">Ai lăsat ceva în coș</h2>
    <p style="margin:0 0 24px;color:${colors.mutedText}">Produsele tale te așteaptă pe ardmag.ro.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:16px">
      <tbody>
        ${itemsHtml}
        ${moreItems}
      </tbody>
      <tfoot>
        <tr>
          <td style="padding:10px 8px;font-weight:700">Total coș:</td>
          <td style="padding:10px 8px;text-align:right;font-weight:700;color:${colors.brand}">${total} RON</td>
        </tr>
      </tfoot>
    </table>

    ${freeShippingNote}

    <p style="margin:0 0 24px">
      <a href="${baseUrl}/cos"
        style="background:${colors.brand};color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:600">
        Finalizează comanda
      </a>
    </p>

    <p style="font-size:${font.sizeSmall};color:${colors.mutedText};margin:0">
      Întrebări? <a href="mailto:office@ardmag.ro" style="color:${colors.link}">office@ardmag.ro</a> | +40 722 155 441 (Luni-Vineri 08:00-16:00)
    </p>`

  return wrapEmail(body, baseUrl)
}
