import { colors, font } from "./tokens"
import { wrapEmail } from "./layout"

export function renderPasswordReset(resetUrl: string, baseUrl: string): string {
  const body = `
    <h2 style="color:${colors.brand};margin:0 0 16px;font-size:20px">Resetare parolă</h2>
    <p style="margin:0 0 16px">Am primit o solicitare de resetare a parolei pentru contul tău de pe ardmag.ro.</p>
    <p style="margin:0 0 24px">Apasă butonul de mai jos pentru a seta o parolă nouă. Link-ul este valabil <strong>60 de minute</strong>.</p>
    <p style="margin:0 0 24px">
      <a href="${resetUrl}"
        style="background:${colors.brand};color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:600">
        Resetează parola
      </a>
    </p>
    <p style="margin:0 0 16px;font-size:${font.sizeSmall};color:${colors.mutedText}">
      Dacă butonul nu funcționează, copiază link-ul de mai jos în browser:
    </p>
    <p style="margin:0 0 24px;font-size:${font.sizeSmall};word-break:break-all">
      <a href="${resetUrl}" style="color:${colors.link}">${resetUrl}</a>
    </p>
    <p style="margin:0;font-size:${font.sizeSmall};color:${colors.mutedText}">
      Dacă nu ai solicitat resetarea parolei, ignoră acest email. Parola ta rămâne neschimbată.
    </p>`

  return wrapEmail(body, baseUrl)
}
