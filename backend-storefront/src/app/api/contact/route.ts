import { NextRequest, NextResponse } from "next/server"

const SMTP2GO_API_KEY = process.env.SMTP2GO_API_KEY
const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = parseInt(process.env.SMTP_PORT ?? "587")
const SMTP_USER = process.env.SMTP_USERNAME
const SMTP_PASS = process.env.SMTP_PASSWORD
const FROM_EMAIL = process.env.SMTP_FROM || "ardmag@surcod.ro"
const ADMIN_EMAIL = "office@arcromdiamonds.ro"

const isConfigured = !!(SMTP2GO_API_KEY || SMTP_HOST)

export async function POST(req: NextRequest) {
  if (!isConfigured) {
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

  if (SMTP2GO_API_KEY) {
    const res = await fetch("https://api.smtp2go.com/v3/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Smtp2go-Api-Key": SMTP2GO_API_KEY!,
      },
      body: JSON.stringify({
        sender: `ardmag.com contact <${FROM_EMAIL}>`,
        to: [ADMIN_EMAIL],
        subject: `Mesaj de contact de la ${name}`,
        html_body: html,
        custom_headers: [{ header: "Reply-To", value: email }],
      }),
    })
    const result = (await res.json()) as { data?: { succeeded?: number } }
    if (!res.ok || result.data?.succeeded !== 1) {
      return NextResponse.json({ error: "Failed to send" }, { status: 500 })
    }
  } else {
    // SMTP relay via nodemailer
    const nodemailer = await import("nodemailer")
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: false,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
    await transporter.sendMail({
      from: `ardmag.com contact <${FROM_EMAIL}>`,
      to: ADMIN_EMAIL,
      replyTo: email,
      subject: `Mesaj de contact de la ${name}`,
      html,
    })
  }

  return NextResponse.json({ ok: true })
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}
