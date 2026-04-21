import { NextRequest, NextResponse } from "next/server"

const SMTP2GO_API_KEY = process.env.SMTP2GO_API_KEY
const FROM_EMAIL = process.env.SMTP_FROM || "office@arcromdiamonds.ro"
const ADMIN_EMAIL = "office@arcromdiamonds.ro"

export async function POST(req: NextRequest) {
  if (!SMTP2GO_API_KEY) {
    return NextResponse.json({ error: "Email not configured" }, { status: 503 })
  }

  let body: { name?: string; email?: string; phone?: string; message?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const { name, email, phone, message } = body
  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const html = `
    <h3>Mesaj nou de pe ardmag.com</h3>
    <p><strong>Nume:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    ${phone ? `<p><strong>Telefon:</strong> ${escapeHtml(phone)}</p>` : ""}
    <p><strong>Mesaj:</strong></p>
    <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
  `

  const res = await fetch("https://api.smtp2go.com/v3/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: SMTP2GO_API_KEY,
      to: [{ email: ADMIN_EMAIL }],
      sender: `ardmag.com contact <${FROM_EMAIL}>`,
      subject: `Mesaj de contact de la ${name}`,
      html_body: html,
      reply_to: email,
    }),
  })

  const result = (await res.json()) as { data?: { succeeded?: number } }

  if (!res.ok || result.data?.succeeded !== 1) {
    return NextResponse.json({ error: "Failed to send" }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}
