import { colors, font } from "./tokens"

export function renderHeader(baseUrl: string): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${colors.brand}">
    <tr>
      <td style="padding:24px;text-align:center">
        <a href="${baseUrl}" style="text-decoration:none;display:inline-block">
          <img src="${baseUrl}/logo-white.png" alt="ardmag.ro" width="200" height="30"
            style="display:block;margin:0 auto;max-width:200px;height:auto" />
        </a>
        <p style="color:${colors.brandSubtle};font-family:${font.family};font-size:${font.sizeSmall};margin:6px 0 0">
          Experți în piatră de peste 25 de ani
        </p>
      </td>
    </tr>
  </table>`
}

interface FooterOptions {
  baseUrl: string
  unsubscribeUrl?: string
}

export function renderFooter({ baseUrl, unsubscribeUrl }: FooterOptions): string {
  const year = new Date().getFullYear()
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${colors.border};margin-top:32px">
    <tr>
      <td style="padding:24px;text-align:center;font-family:${font.family};font-size:${font.sizeSmall};color:${colors.mutedText}">
        <p style="margin:0 0 8px">
          <strong>+40 722 155 441</strong> ·
          <a href="mailto:office@ardmag.ro" style="color:${colors.mutedText};text-decoration:none">office@ardmag.ro</a> ·
          Luni-Vineri 08:00-16:00
        </p>
        <p style="margin:0 0 8px;font-size:${font.sizeLegal};color:${colors.legalText}">
          ARC ROM DIAMONDS SRL · CUI 13828707 · Calea Baciului 1-3 · Cluj-Napoca 400230
        </p>
        <p style="margin:0 0 8px;font-size:${font.sizeLegal};color:${colors.legalText}">
          <a href="${baseUrl}/termeni" style="color:${colors.legalText}">Termeni și condiții</a> ·
          <a href="${baseUrl}/confidentialitate" style="color:${colors.legalText}">Confidențialitate</a> ·
          <a href="${baseUrl}/cookie-policy" style="color:${colors.legalText}">Cookie</a> ·
          <a href="https://anpc.ro" style="color:${colors.legalText}">ANPC</a> ·
          <a href="https://ec.europa.eu/consumers/odr" style="color:${colors.legalText}">ODR</a>
        </p>
        ${unsubscribeUrl
          ? `<p style="margin:0;font-size:${font.sizeLegal};color:${colors.legalText}">
               <a href="${unsubscribeUrl}" style="color:${colors.legalText}">Dezabonare newsletter</a>
             </p>`
          : ""
        }
        <p style="margin:8px 0 0;font-size:${font.sizeLegal};color:${colors.legalText}">
          © 2001–${year} Arcrom Diamonds SRL
        </p>
      </td>
    </tr>
  </table>`
}

export function wrapEmail(body: string, baseUrl: string, unsubscribeUrl?: string): string {
  return `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:${font.family};font-size:${font.sizeBase};color:${colors.bodyText}">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%">
          <tr><td>${renderHeader(baseUrl)}</td></tr>
          <tr><td style="padding:32px 32px 8px">${body}</td></tr>
          <tr><td style="padding:0 32px 32px">${renderFooter({ baseUrl, unsubscribeUrl })}</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
