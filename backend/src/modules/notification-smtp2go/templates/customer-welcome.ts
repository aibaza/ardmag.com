import { colors, font } from "./tokens"
import { wrapEmail } from "./layout"

export function renderCustomerWelcome(firstName: string | undefined, baseUrl: string): string {
  const greeting = firstName ? `Bună ziua, ${firstName},` : "Bună ziua,"

  const body = `
    <h2 style="color:${colors.brand};margin:0 0 16px;font-size:20px">Bun venit la ardmag.ro!</h2>
    <p style="margin:0 0 16px">${greeting}</p>
    <p style="margin:0 0 16px">Contul tău a fost creat cu succes. Acum poți:</p>
    <ul style="margin:0 0 24px;padding-left:20px;line-height:1.8;color:${colors.bodyText}">
      <li>Urmări comenzile și descărca facturile</li>
      <li>Salva adrese de livrare pentru comenzi rapide</li>
      <li>Accesa istoricul complet al achizițiilor</li>
    </ul>
    <p style="margin:0 0 24px">
      <a href="${baseUrl}/cont"
        style="background:${colors.brand};color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:600">
        Accesează contul
      </a>
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:${colors.surface};border-radius:6px;margin-bottom:0">
      <tr>
        <td style="padding:16px">
          <p style="margin:0 0 8px;font-size:${font.sizeSmall};color:${colors.mutedText};font-weight:600">DE CE ARDMAG.RO</p>
          <ul style="margin:0;padding-left:16px;font-size:${font.sizeSmall};color:${colors.mutedText};line-height:1.8">
            <li>Distribuitor autorizat Tenax, Sait, Woosuk</li>
            <li>Livrare în 24-48h în toată țara</li>
            <li>Livrare gratuită la comenzi peste 500 RON</li>
            <li>Retur în 14 zile, fără întrebări</li>
            <li>Suport tehnic Luni-Vineri 08:00-16:00</li>
          </ul>
        </td>
      </tr>
    </table>`

  return wrapEmail(body, baseUrl)
}
