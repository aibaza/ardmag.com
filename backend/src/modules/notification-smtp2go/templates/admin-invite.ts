import { colors, font } from "./tokens"
import { wrapEmail } from "./layout"

export function renderAdminInvite(inviteUrl: string, email: string, baseUrl: string): string {
  const body = `
    <h2 style="color:${colors.brand};margin:0 0 16px;font-size:20px">Acces administrare ardmag.ro</h2>
    <p style="margin:0 0 16px">Ai fost invitat să administrezi magazinul ardmag.ro.</p>
    <p style="margin:0 0 16px">Adresa de email pentru cont: <strong>${email}</strong>.</p>
    <p style="margin:0 0 24px">Apasă butonul de mai jos ca să îți setezi parola și să intri în panoul de administrare. Link-ul este valabil <strong>24 de ore</strong>.</p>
    <p style="margin:0 0 24px">
      <a href="${inviteUrl}"
        style="background:${colors.brand};color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:600">
        Activează contul
      </a>
    </p>
    <p style="margin:0 0 16px;font-size:${font.sizeSmall};color:${colors.mutedText}">
      Dacă butonul nu funcționează, copiază link-ul de mai jos în browser:
    </p>
    <p style="margin:0 0 24px;font-size:${font.sizeSmall};word-break:break-all">
      <a href="${inviteUrl}" style="color:${colors.link}">${inviteUrl}</a>
    </p>
    <p style="margin:0;font-size:${font.sizeSmall};color:${colors.mutedText}">
      Dacă nu te aștepți la această invitație, ignoră acest email. Contul nu va fi creat decât după ce setezi tu parola.
    </p>`

  return wrapEmail(body, baseUrl)
}
