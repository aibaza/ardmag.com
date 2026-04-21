import { Metadata } from "next"
import { SiteHeaderShell } from "@modules/layout/site-header"
import { SiteFooter } from "@modules/layout/site-footer"

export const metadata: Metadata = {
  title: "Politica de cookies | ardmag.com",
  description: "Lista cookie-urilor utilizate pe ardmag.com si modul de gestionare a preferintelor.",
}

const UPDATED = "Aprilie 2026"

export default async function CookiePolicyPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params

  const h2Style: React.CSSProperties = {
    fontFamily: "var(--f-sans)",
    fontWeight: 600,
    fontSize: 20,
    marginTop: 36,
    marginBottom: 12,
  }
  const pStyle: React.CSSProperties = { lineHeight: 1.7, marginBottom: 14 }
  const tableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse" as const, marginBottom: 24 }
  const thStyle: React.CSSProperties = { padding: "8px 10px", textAlign: "left" as const, borderBottom: "2px solid var(--rule)", fontSize: 13, fontWeight: 600 }
  const tdStyle: React.CSSProperties = { padding: "8px 10px", borderBottom: "1px solid var(--rule)", fontSize: 13 }

  return (
    <>
      <SiteHeaderShell countryCode={countryCode} />
      <main style={{ maxWidth: 780, margin: "0 auto", padding: "48px 24px" }}>
        <h1 style={{ fontFamily: "var(--f-sans)", fontWeight: 700, fontSize: "clamp(22px,4vw,32px)", marginBottom: 8 }}>
          Politica de cookies
        </h1>
        <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 40 }}>
          Ultima actualizare: {UPDATED}
        </p>

        <p style={pStyle}>
          Aceasta pagina explica ce cookie-uri folosim pe ardmag.com, de ce si cum poti controla utilizarea lor.
        </p>

        <h2 style={h2Style}>Cookie-uri necesare (nu necesita consimtamant)</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Nume</th>
              <th style={thStyle}>Scop</th>
              <th style={thStyle}>Durata</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}><code>medusa_cart_id</code></td>
              <td style={tdStyle}>Pastreaza continutul cosului de cumparaturi</td>
              <td style={tdStyle}>30 zile</td>
            </tr>
            <tr>
              <td style={tdStyle}><code>medusa_session</code></td>
              <td style={tdStyle}>Sesiunea autentificata a contului de client</td>
              <td style={tdStyle}>Sesiune</td>
            </tr>
            <tr>
              <td style={tdStyle}><code>ardmag-consent</code></td>
              <td style={tdStyle}>Salveaza preferintele tale de cookie-uri</td>
              <td style={tdStyle}>1 an</td>
            </tr>
          </tbody>
        </table>

        <h2 style={h2Style}>Cookie-uri analitice (necesita consimtamant)</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Furnizor</th>
              <th style={thStyle}>Scop</th>
              <th style={thStyle}>Durata</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}>Google Analytics 4 (GA4)</td>
              <td style={tdStyle}>Analiza traficului si comportamentului utilizatorilor (pagini vizitate, timp petrecut)</td>
              <td style={tdStyle}>2 ani</td>
            </tr>
          </tbody>
        </table>

        <h2 style={h2Style}>Cookie-uri de marketing (necesita consimtamant)</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Furnizor</th>
              <th style={thStyle}>Scop</th>
              <th style={thStyle}>Durata</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}>Meta Pixel (Facebook / Instagram)</td>
              <td style={tdStyle}>Masurarea eficientei campaniilor publicitare si retargetare</td>
              <td style={tdStyle}>90 zile</td>
            </tr>
            <tr>
              <td style={tdStyle}>Stripe</td>
              <td style={tdStyle}>Detectarea fraudelor la plata cu cardul</td>
              <td style={tdStyle}>Sesiune / 1 an</td>
            </tr>
          </tbody>
        </table>

        <h2 style={h2Style}>Cum gestionezi preferintele</h2>
        <p style={pStyle}>
          La prima vizita pe site ti se afiseaza un banner prin care poti accepta sau refuza categoriile
          de cookie-uri. Poti modifica preferintele oricand din link-ul "Setari cookies" din footer.
        </p>
        <p style={pStyle}>
          Poti de asemenea dezactiva cookie-urile direct din setarile browser-ului, insa unele functionalitati
          ale site-ului (cosul de cumparaturi, contul de client) pot fi afectate.
        </p>

        <h2 style={h2Style}>Contact</h2>
        <p style={pStyle}>
          Intrebari despre cookies:{" "}
          <a href="mailto:office@arcromdiamonds.ro">office@arcromdiamonds.ro</a>
        </p>
      </main>
      <SiteFooter countryCode={countryCode} />
    </>
  )
}
