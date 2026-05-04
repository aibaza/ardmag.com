import { NextRequest, NextResponse } from "next/server"
import { wrapEmail, escapeHtml } from "@lib/email/layout"

const SMTP2GO_API_KEY = process.env.SMTP2GO_API_KEY
const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = parseInt(process.env.SMTP_PORT ?? "587")
const SMTP_USER = process.env.SMTP_USERNAME
const SMTP_PASS = process.env.SMTP_PASSWORD
const FROM_CONTACT = process.env.SMTP_FROM_CONTACT || "contact@ardmag.ro"
const FROM_NOREPLY = process.env.SMTP_FROM_NOREPLY || "no-reply@ardmag.ro"
const REPLY_TO = process.env.SMTP_REPLY_TO || "office@ardmag.ro"
const ADMIN_EMAIL = process.env.CONTACT_NOTIFY_EMAIL || "office@ardmag.ro"

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

  const adminHtml = wrapEmail(`
    <h2 style="margin:0 0 20px;font-size:18px">Mesaj nou de pe ardmag.ro</h2>
    <table cellpadding="0" cellspacing="0" style="margin-bottom:20px">
      <tr><td style="padding:4px 16px 4px 0;color:#64748b">Nume:</td><td><strong>${escapeHtml(name)}</strong></td></tr>
      <tr><td style="padding:4px 16px 4px 0;color:#64748b">Email:</td><td><a href="mailto:${escapeHtml(email)}" style="color:#0f766e">${escapeHtml(email)}</a></td></tr>
      ${phone ? `<tr><td style="padding:4px 16px 4px 0;color:#64748b">Telefon:</td><td>${escapeHtml(phone)}</td></tr>` : ""}
    </table>
    <p style="color:#64748b;font-size:13px;margin:0 0 8px">Mesaj:</p>
    <div style="background:#f8fafc;border-radius:6px;padding:16px;white-space:pre-wrap;font-size:15px">${escapeHtml(message)}</div>
  `)

  const autoReplyHtml = wrapEmail(`
    <h2 style="margin:0 0 16px;font-size:18px">Am primit mesajul tău</h2>
    <p style="margin:0 0 16px">Bună ziua, <strong>${escapeHtml(name)}</strong>,</p>
    <p style="margin:0 0 16px">Am înregistrat mesajul tău și îți vom răspunde în cel mai scurt timp (Luni-Vineri, 08:00-16:00).</p>
    <p style="margin:0 0 24px">Dacă ai nevoie urgent, ne poți contacta direct la <strong>+40 722 155 441</strong>.</p>
    <p style="margin:0;font-size:13px;color:#64748b">Echipa ardmag.ro</p>
  `)

  // Trimite email catre admin
  await sendEmail({
    to: ADMIN_EMAIL,
    from: `ardmag.ro contact <${FROM_CONTACT}>`,
    replyTo: email,
    subject: `Mesaj de contact de la ${name}`,
    html: adminHtml,
  })

  // Auto-reply catre vizitator (best-effort)
  try {
    await sendEmail({
      to: email,
      from: `ardmag.ro <${FROM_NOREPLY}>`,
      replyTo: REPLY_TO,
      subject: "Am primit mesajul tău — ardmag.ro",
      html: autoReplyHtml,
    })
  } catch {
    // nu blocam daca auto-reply esueaza
  }

  return NextResponse.json({ ok: true })
}

interface MailPayload {
  to: string
  from: string
  replyTo: string
  subject: string
  html: string
}

async function sendEmail(mail: MailPayload): Promise<void> {
  if (SMTP2GO_API_KEY) {
    const res = await fetch("https://api.smtp2go.com/v3/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Smtp2go-Api-Key": SMTP2GO_API_KEY!,
      },
      body: JSON.stringify({
        sender: mail.from,
        to: [mail.to],
        subject: mail.subject,
        html_body: mail.html,
        custom_headers: [{ header: "Reply-To", value: mail.replyTo }],
      }),
    })
    const result = (await res.json()) as { data?: { succeeded?: number } }
    if (!res.ok || result.data?.succeeded !== 1) {
      throw new Error(`smtp2go failed: ${JSON.stringify(result)}`)
    }
    return
  }

  const nodemailer = await import("nodemailer")
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST, port: SMTP_PORT, secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })
  await transporter.sendMail({
    from: mail.from, to: mail.to, replyTo: mail.replyTo,
    subject: mail.subject, html: mail.html,
  })
}
