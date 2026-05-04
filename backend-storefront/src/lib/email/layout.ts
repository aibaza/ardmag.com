const c = {
  brand: "#1e293b",
  brandSubtle: "#94a3b8",
  surface: "#f8fafc",
  border: "#e2e8f0",
  bodyText: "#334155",
  mutedText: "#64748b",
  legalText: "#94a3b8",
  link: "#0f766e",
}
const fontStack = "system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://ardmag.ro"
const year = new Date().getFullYear()

function header(): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${c.brand}">
    <tr>
      <td style="padding:24px;text-align:center">
        <a href="${baseUrl}" style="text-decoration:none;display:inline-block">
          <img src="${baseUrl}/logo-white.png" alt="ardmag.ro" width="200" height="30"
            style="display:block;margin:0 auto;max-width:200px;height:auto" />
        </a>
        <p style="color:${c.brandSubtle};font-family:${fontStack};font-size:13px;margin:6px 0 0">
          Experți în piatră de peste 25 de ani
        </p>
      </td>
    </tr>
  </table>`
}

function footer(): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${c.border};margin-top:24px">
    <tr>
      <td style="padding:20px;text-align:center;font-family:${fontStack};font-size:13px;color:${c.mutedText}">
        <p style="margin:0 0 6px">
          <strong>+40 722 155 441</strong> ·
          <a href="mailto:office@ardmag.ro" style="color:${c.mutedText};text-decoration:none">office@ardmag.ro</a> ·
          Luni-Vineri 08:00-16:00
        </p>
        <p style="margin:0 0 6px;font-size:11px;color:${c.legalText}">
          ARC ROM DIAMONDS SRL · CUI 13828707 · Calea Baciului 1-3 · Cluj-Napoca 400230
        </p>
        <p style="margin:0;font-size:11px;color:${c.legalText}">
          <a href="${baseUrl}/termeni" style="color:${c.legalText}">Termeni</a> ·
          <a href="${baseUrl}/confidentialitate" style="color:${c.legalText}">Confidențialitate</a> ·
          <a href="https://anpc.ro" style="color:${c.legalText}">ANPC</a><br>
          © 2001–${year} Arcrom Diamonds SRL
        </p>
      </td>
    </tr>
  </table>`
}

export function wrapEmail(body: string): string {
  return `<!DOCTYPE html>
<html lang="ro">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:${fontStack};font-size:15px;color:${c.bodyText}">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%">
          <tr><td>${header()}</td></tr>
          <tr><td style="padding:28px 32px 4px">${body}</td></tr>
          <tr><td style="padding:0 32px 28px">${footer()}</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

export { c as colors, fontStack, baseUrl }
