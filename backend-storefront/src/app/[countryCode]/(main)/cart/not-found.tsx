import { Metadata } from "next"

export const metadata: Metadata = {
  title: "404 | ardmag.com",
}

export default function NotFound() {
  return (
    <div style={{ padding: "48px 24px", textAlign: "center" }}>
      <h1>Pagina nu a fost găsită</h1>
      <p style={{ color: "var(--fg-muted)", margin: "16px 0" }}>
        Coșul nu a putut fi accesat. <a href="/">Înapoi la pagina principală</a>
      </p>
    </div>
  )
}
