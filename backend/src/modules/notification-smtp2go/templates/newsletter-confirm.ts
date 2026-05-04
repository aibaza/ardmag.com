import { colors, font } from "./tokens"
import { wrapEmail } from "./layout"

export function renderNewsletterConfirm(confirmUrl: string, unsubscribeUrl: string, baseUrl: string): string {
  const body = `
    <h2 style="color:${colors.brand};margin:0 0 16px;font-size:20px">Confirmă abonarea la newsletter</h2>
    <p style="margin:0 0 16px">Mulțumim că te-ai abonat la newsletter-ul ardmag.ro!</p>
    <p style="margin:0 0 24px;color:${colors.mutedText}">
      Vei primi maxim 2 emailuri pe lună cu promoții, stocuri noi și ghiduri tehnice pentru prelucrarea pietrei naturale.
    </p>
    <p style="margin:0 0 24px">
      <a href="${confirmUrl}"
        style="background:${colors.brand};color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:600">
        Confirmă abonarea
      </a>
    </p>
    <p style="margin:0 0 16px;font-size:${font.sizeSmall};color:${colors.mutedText}">
      Dacă butonul nu funcționează, copiază link-ul în browser:
    </p>
    <p style="margin:0 0 24px;font-size:${font.sizeSmall};word-break:break-all">
      <a href="${confirmUrl}" style="color:${colors.link}">${confirmUrl}</a>
    </p>
    <p style="margin:0;font-size:${font.sizeSmall};color:${colors.mutedText}">
      Nu ai solicitat abonarea? <a href="${unsubscribeUrl}" style="color:${colors.mutedText}">Click aici pentru a anula</a>.
    </p>`

  return wrapEmail(body, baseUrl, unsubscribeUrl)
}
