import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Dezabonare newsletter — ardmag.ro",
  robots: { index: false },
}

type Props = {
  searchParams: Promise<{ token?: string }>
}

async function unsubscribeNewsletter(token: string): Promise<boolean> {
  const backendUrl = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
  const key = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
  try {
    const res = await fetch(`${backendUrl}/store/newsletter/unsubscribe?token=${encodeURIComponent(token)}`, {
      headers: { "x-publishable-api-key": key },
      cache: "no-store",
    })
    const data = await res.json()
    return data.ok === true
  } catch {
    return false
  }
}

export default async function NewsletterUnsubscribePage({ searchParams }: Props) {
  const { token } = await searchParams

  const unsubscribed = token ? await unsubscribeNewsletter(token) : false

  return (
    <main style={{ maxWidth: 560, margin: "64px auto", padding: "0 24px", fontFamily: "system-ui, sans-serif", color: "#334155" }}>
      {unsubscribed ? (
        <>
          <h1 style={{ fontSize: 24, marginBottom: 16 }}>Ai fost dezabonat</h1>
          <p style={{ marginBottom: 24, color: "#64748b" }}>
            Adresa ta de email a fost eliminată din lista noastră de newsletter. Nu vei mai primi mesaje de la ardmag.ro.
          </p>
        </>
      ) : (
        <>
          <h1 style={{ fontSize: 24, marginBottom: 16 }}>Link invalid</h1>
          <p style={{ marginBottom: 24, color: "#64748b" }}>
            Link-ul de dezabonare este invalid. Dacă dorești să te dezabonezi, contactează-ne la{" "}
            <a href="mailto:office@ardmag.ro" style={{ color: "#0f766e" }}>office@ardmag.ro</a>.
          </p>
        </>
      )}
      <Link href="/" style={{ color: "#0f766e", textDecoration: "none" }}>
        &larr; Înapoi la ardmag.ro
      </Link>
    </main>
  )
}
