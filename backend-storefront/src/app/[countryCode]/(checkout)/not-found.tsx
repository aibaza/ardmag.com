import { Metadata } from "next"

export const metadata: Metadata = {
  title: "404 | ardmag.com",
}

export default function NotFound() {
  return (
    <div style={{ padding: "48px 24px", textAlign: "center" }}>
      <h1 style={{ fontFamily: "var(--f-sans)", fontWeight: 600 }}>Pagina nu a fost găsită</h1>
      <p style={{ color: "var(--fg-muted)", margin: "16px 0" }}>
        Pagina pe care ai încercat să o accesezi nu există. <a href="/">Înapoi la pagina principală</a>
      </p>
    </div>
  )
}
