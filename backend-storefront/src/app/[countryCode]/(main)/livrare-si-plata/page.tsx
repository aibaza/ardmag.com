import { Metadata } from "next"
import { SiteHeaderShell } from "@modules/layout/site-header"
import { SiteFooter } from "@modules/layout/site-footer"

export const metadata: Metadata = {
  title: "Livrare si plata | ARDmag.ro",
  description:
    "Livrare în toată România prin Fan Courier sau Cargus, ori ridicare din Cluj-Napoca. Livrare gratuită peste 500 lei. Plata cu cardul sau ramburs.",
}

export default async function LivrareSimPlataPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params

  const h2Style: React.CSSProperties = {
    fontFamily: "var(--f-sans)",
    fontWeight: 600,
    fontSize: 22,
    marginBottom: 16,
    marginTop: 40,
  }
  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse" as const,
    marginBottom: 24,
  }
  const thStyle: React.CSSProperties = {
    padding: "10px 12px",
    textAlign: "left" as const,
    borderBottom: "2px solid var(--rule)",
    fontFamily: "var(--f-sans)",
    fontWeight: 600,
    fontSize: 13,
  }
  const tdStyle: React.CSSProperties = {
    padding: "10px 12px",
    borderBottom: "1px solid var(--rule)",
    fontSize: 14,
  }

  return (
    <>
      <SiteHeaderShell countryCode={countryCode} />
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
        <h1 style={{ fontFamily: "var(--f-sans)", fontWeight: 700, fontSize: "clamp(24px,4vw,36px)", marginBottom: 8 }}>
          Livrare si plata
        </h1>
        <p style={{ color: "var(--fg-muted)", marginBottom: 40 }}>
          Livram in toata Romania. Livrare gratuita la comenzi de peste 500 Lei.
        </p>

        <h2 style={h2Style}>Optiuni de livrare</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Livrare</th>
              <th style={thStyle}>Cost</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}>Fan Courier</td>
              <td style={tdStyle}>Calculat în coș, după greutatea coletului și adresa de livrare</td>
            </tr>
            <tr>
              <td style={tdStyle}>Cargus</td>
              <td style={tdStyle}>Calculat în coș, după greutatea coletului, adresa de livrare și metoda de plată</td>
            </tr>
            <tr>
              <td style={tdStyle}>Ridicare personală din depozitul Cluj-Napoca</td>
              <td style={tdStyle}><strong>Gratuit</strong></td>
            </tr>
          </tbody>
        </table>

        <div style={{ background: "var(--brand-50, #f0f9ff)", border: "1px solid var(--brand-200, #bae6fd)", borderRadius: "var(--r-md)", padding: "16px 20px", marginBottom: 32 }}>
          <strong>Livrare gratuită la comenzi de peste 500 lei</strong> (valoarea produselor), cu Fan Courier sau Cargus. Se aplică automat în coș.
        </div>

        <p style={{ lineHeight: 1.7, marginBottom: 16 }}>
          Costul exact apare în coș, la pasul Livrare, înainte să plasezi comanda. Pentru localitățile
          din afara orașelor, curierii pot adăuga un cost pentru kilometrii suplimentari; și acesta
          este inclus în prețul afișat în coș.
        </p>

        <h2 style={h2Style}>Procesare comanda</h2>
        <p style={{ lineHeight: 1.7, marginBottom: 16 }}>
          Comenzile plasate pana la ora 13:00 in zilele lucratoare sunt procesate in aceeasi zi, in limita stocului disponibil.
          Comenzile plasate dupa 13:00 sau in weekend sunt procesate in urmatoarea zi lucratoare.
        </p>
        <p style={{ lineHeight: 1.7 }}>
          Dupa expediere primesti un email de confirmare cu numarul AWB pentru urmarire colet.
        </p>

        <h2 style={h2Style}>Metode de plata</h2>
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={tdStyle}><strong>Card bancar (Visa / Mastercard)</strong></td>
              <td style={tdStyle}>Plata securizata prin Stripe cu 3DSecure. Suma este retinuta la finalizarea comenzii.</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Ramburs la livrare</strong></td>
              <td style={tdStyle}>
                Plătești curierului la primirea coletului. Ramburs se poate plăti la Fan Courier și la Cargus.
                La Cargus, costul livrării cu ramburs include comisionul curierului pentru suma încasată;
                îl vezi în coș când alegi plata ramburs.
              </td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Plata la ridicare</strong></td>
              <td style={tdStyle}>La ridicarea personală din depozitul Cluj-Napoca poți plăti online cu cardul sau la sediu, când ridici comanda.</td>
            </tr>
          </tbody>
        </table>

        <h2 style={h2Style}>Retur si garantie</h2>
        <p style={{ lineHeight: 1.7, marginBottom: 16 }}>
          Ai dreptul sa returnezi produsele in termen de <strong>14 zile calendaristice</strong> de la primire,
          fara a fi necesar sa justifici decizia (conform OUG 34/2014).
        </p>
        <p style={{ lineHeight: 1.7, marginBottom: 16 }}>
          Produsele trebuie returnate in ambalajul original, neutilizate, cu toate accesoriile incluse.
          Costul returului este suportat de client, exceptand cazul in care produsul este defect sau gresit livrat.
        </p>
        <p style={{ lineHeight: 1.7 }}>
          Pentru initializarea unui retur, contacteaza-ne la <a href="mailto:office@ardmag.ro">office@ardmag.ro</a> sau +40 722 155 441.
        </p>
      </main>
      <SiteFooter countryCode={countryCode} />
    </>
  )
}
