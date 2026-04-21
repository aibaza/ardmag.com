import { Metadata } from "next"
import { SiteHeaderShell } from "@modules/layout/site-header"
import { SiteFooter } from "@modules/layout/site-footer"

export const metadata: Metadata = {
  title: "Termeni si conditii | ardmag.com",
  description: "Termeni si conditii de utilizare ardmag.com — ARC ROM DIAMONDS SRL, CUI 13828707.",
}

const UPDATED = "Aprilie 2026"

export default async function TermeniPage({
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

  return (
    <>
      <SiteHeaderShell countryCode={countryCode} />
      <main style={{ maxWidth: 780, margin: "0 auto", padding: "48px 24px" }}>
        <h1 style={{ fontFamily: "var(--f-sans)", fontWeight: 700, fontSize: "clamp(22px,4vw,32px)", marginBottom: 8 }}>
          Termeni si conditii
        </h1>
        <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 40 }}>
          Ultima actualizare: {UPDATED}
        </p>

        <p style={pStyle}>
          Prezentii termeni reglementeaza utilizarea platformei ardmag.com, operata de{" "}
          <strong>ARC ROM DIAMONDS SRL</strong>, cu sediul in Calea Baciului 1-3, Cluj-Napoca 400230,
          CUI 13828707, J12/553/2001 (denumita in continuare "Vanzatorul").
        </p>

        <h2 style={h2Style}>1. Acceptarea termenilor</h2>
        <p style={pStyle}>
          Prin utilizarea site-ului si plasarea comenzilor, Cumparatorul declara ca a luat la cunostinta
          si accepta prezentii termeni. Vanzatorul isi rezerva dreptul de a modifica termenii; modificarile
          sunt valabile de la data publicarii pe site.
        </p>

        <h2 style={h2Style}>2. Produse si preturi</h2>
        <p style={pStyle}>
          Preturile afisate includ TVA (21%) si sunt exprimate in RON. Vanzatorul isi rezerva dreptul de a
          modifica preturile fara preaviz. Pretul valabil este cel afisat la momentul plasarii comenzii.
          Disponibilitatea stocului este verificata la momentul procesarii comenzii.
        </p>

        <h2 style={h2Style}>3. Plasarea comenzii</h2>
        <p style={pStyle}>
          Comanda este confirmata prin email. Contractul de vanzare se considera incheiat la momentul
          confirmarii comenzii de catre Vanzator. Vanzatorul isi rezerva dreptul de a refuza sau anula
          comenzile cu date incorecte sau in cazul indisponibilitatii produsului.
        </p>

        <h2 style={h2Style}>4. Livrare</h2>
        <p style={pStyle}>
          Termenul standard de livrare este 1-3 zile lucratoare de la confirmarea comenzii, in limita
          stocului disponibil. Costurile de livrare sunt afistate la checkout. Livrare gratuita la comenzi
          de peste 500 RON (Fan Courier).
        </p>

        <h2 style={h2Style}>5. Dreptul de retur</h2>
        <p style={pStyle}>
          In conformitate cu OUG 34/2014, Cumparatorul persoana fizica are dreptul de a returna produsele
          in termen de 14 zile calendaristice de la primire, fara a justifica decizia. Produsele trebuie
          returnate in starea originala, neutilizate, in ambalajul original.
        </p>
        <p style={pStyle}>
          Costul returului este suportat de Cumparator, cu exceptia cazului in care produsul este defect sau
          diferit de cel comandat. Rambursarea se face in 14 zile de la primirea produsului returnat.
        </p>

        <h2 style={h2Style}>6. Garantie</h2>
        <p style={pStyle}>
          Produsele beneficiaza de garantie legala de conformitate conform Legii 449/2003 — 2 ani de la livrare
          pentru persoane fizice. Defectele de fabricatie sunt acoperite de garantie. Uzura normala, deteriorarea
          cauzata de utilizare incorecta sau modificarile aduse produsului nu sunt acoperite.
        </p>

        <h2 style={h2Style}>7. Proprietate intelectuala</h2>
        <p style={pStyle}>
          Continutul site-ului (texte, imagini, logo-uri, design) apartine ARC ROM DIAMONDS SRL sau furnizorilor
          sai si este protejat de legile dreptului de autor. Reproducerea sau utilizarea continutului fara acordul
          scris al Vanzatorului este interzisa.
        </p>

        <h2 style={h2Style}>8. Limitarea raspunderii</h2>
        <p style={pStyle}>
          Vanzatorul nu este responsabil pentru intarzieri cauzate de factori externi (conditii meteo, greve,
          probleme tehnice ale curierilor). Raspunderea totala a Vanzatorului nu poate depasi valoarea comenzii.
        </p>

        <h2 style={h2Style}>9. Solutionarea disputelor</h2>
        <p style={pStyle}>
          In cazul oricarei dispute, partile vor incerca solutionarea pe cale amiabila. In cazul in care aceasta
          nu este posibila, competenta revine instantelor din Cluj-Napoca. Consumatorii pot accesa platforma
          europeana de solutionare online a litigiilor la{" "}
          <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
            ec.europa.eu/consumers/odr
          </a>{" "}
          sau pot contacta{" "}
          <a href="https://anpc.ro" target="_blank" rel="noopener noreferrer">
            ANPC
          </a>
          .
        </p>

        <h2 style={h2Style}>10. Contact</h2>
        <p style={pStyle}>
          ARC ROM DIAMONDS SRL, Calea Baciului 1-3, Cluj-Napoca 400230<br />
          Tel: +40 722 155 441 &nbsp;|&nbsp; Email: office@arcromdiamonds.ro
        </p>
      </main>
      <SiteFooter countryCode={countryCode} />
    </>
  )
}
