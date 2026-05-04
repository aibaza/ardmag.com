import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Newsletter confirmat — ardmag.ro",
  robots: { index: false },
}

type Props = {
  searchParams: Promise<{ token?: string }>
}

async function confirmNewsletter(token: string): Promise<boolean> {
  const backendUrl = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
  const key = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
  try {
    const res = await fetch(`${backendUrl}/store/newsletter/confirm?token=${encodeURIComponent(token)}`, {
      headers: { "x-publishable-api-key": key },
      cache: "no-store",
    })
    const data = await res.json()
    return data.ok === true
  } catch {
    return false
  }
}

export default async function NewsletterConfirmPage({ searchParams }: Props) {
  const { token } = await searchParams

  const confirmed = token ? await confirmNewsletter(token) : false

  return (
    <main style={{ maxWidth: 560, margin: "64px auto", padding: "0 24px", fontFamily: "system-ui, sans-serif", color: "#334155" }}>
      {confirmed ? (
        <>
          <h1 style={{ fontSize: 24, marginBottom: 16 }}>Abonare confirmată!</h1>
          <p style={{ marginBottom: 24, color: "#64748b" }}>
            Ești acum abonat la newsletter-ul ardmag.ro. Vei primi maxim 2 emailuri pe lună
            cu promoții, stocuri noi și ghiduri tehnice.
          </p>
        </>
      ) : (
        <>
          <h1 style={{ fontSize: 24, marginBottom: 16 }}>Link invalid</h1>
          <p style={{ marginBottom: 24, color: "#64748b" }}>
            Link-ul de confirmare este invalid sau a expirat. Te rugăm să reîncerci abonarea de pe pagina principală.
          </p>
        </>
      )}
      <Link href="/" style={{ color: "#0f766e", textDecoration: "none" }}>
        &larr; Înapoi la ardmag.ro
      </Link>
    </main>
  )
}
