import { colors, font } from "./tokens"
import { wrapEmail } from "./layout"

interface TrackingLink {
  tracking_number?: string
  url?: string
}

interface OrderShippedData {
  fulfillment?: Record<string, unknown>
  order?: Record<string, unknown>
}

export function renderOrderShipped(data: OrderShippedData, baseUrl: string): string {
  const { fulfillment, order } = data
  const displayId = order?.display_id ?? ""
  const trackingLinks = (fulfillment?.tracking_links as TrackingLink[]) ?? []
  const trackingNumber = trackingLinks[0]?.tracking_number ?? ""
  const trackingUrl = trackingLinks[0]?.url ?? ""

  const trackingHtml = trackingNumber
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="background:${colors.surface};border-radius:6px;margin-bottom:24px">
        <tr>
          <td style="padding:16px">
            <p style="margin:0 0 6px;font-size:${font.sizeSmall};color:${colors.mutedText};font-weight:600">AWB / TRACKING</p>
            <p style="margin:0;font-size:18px;font-weight:700;font-family:monospace">${trackingNumber}</p>
            ${trackingUrl
              ? `<p style="margin:8px 0 0"><a href="${trackingUrl}" style="color:${colors.link};font-size:${font.sizeSmall}">Urmărește coletul online</a></p>`
              : '<p style="margin:8px 0 0;font-size:' + font.sizeSmall + ';color:' + colors.mutedText + '">Urmărește coletul pe site-ul Fan Courier cu numărul de mai sus.</p>'
            }
          </td>
        </tr>
      </table>`
    : `<p style="margin:0 0 24px;font-size:${font.sizeSmall};color:${colors.mutedText}">Detaliile de urmărire vor fi disponibile în scurt timp.</p>`

  const body = `
    <h2 style="color:${colors.brand};margin:0 0 8px;font-size:20px">Comanda ta a fost expediată!</h2>
    <p style="margin:0 0 24px;color:${colors.mutedText}">Comanda #${displayId} este în drum spre tine.</p>

    ${trackingHtml}

    <p style="margin:0 0 16px;font-size:${font.sizeSmall};color:${colors.mutedText}">
      Dacă nu ești acasă la momentul livrării, curierul va lăsa un aviz. Poți suna la numărul de pe aviz pentru reprogramare.
    </p>

    <p style="margin:0 0 24px">
      <a href="${baseUrl}/cont/comenzi"
        style="background:${colors.brand};color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:600">
        Vezi detalii comandă
      </a>
    </p>

    <p style="font-size:${font.sizeSmall};color:${colors.mutedText};margin:0">
      Întrebări? <a href="mailto:office@ardmag.ro" style="color:${colors.link}">office@ardmag.ro</a> | +40 722 155 441 (Luni-Vineri 08:00-16:00)
    </p>`

  return wrapEmail(body, baseUrl)
}
