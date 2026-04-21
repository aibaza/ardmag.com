import { Metadata } from "next"
import { SiteHeaderShell } from "@modules/layout/site-header"
import { SiteFooter } from "@modules/layout/site-footer"

export const metadata: Metadata = {
  title: "Politica de confidentialitate | ardmag.com",
  description:
    "Politica de prelucrare a datelor cu caracter personal — ARC ROM DIAMONDS SRL, conform GDPR (Regulamentul UE 2016/679).",
}

const UPDATED = "Aprilie 2026"

export default async function ConfidentialitatePage({
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
          Politica de confidentialitate
        </h1>
        <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 40 }}>
          Ultima actualizare: {UPDATED}
        </p>

        <p style={pStyle}>
          ARC ROM DIAMONDS SRL ("Operatorul"), cu sediul in Calea Baciului 1-3, Cluj-Napoca 400230,
          CUI 13828707, prelucreaza datele cu caracter personal in conformitate cu Regulamentul (UE)
          2016/679 (GDPR) si legislatia nationala aplicabila.
        </p>

        <h2 style={h2Style}>1. Ce date colectam</h2>
        <p style={pStyle}>Colectam urmatoarele categorii de date:</p>
        <ul style={{ lineHeight: 2, paddingLeft: 20, marginBottom: 14 }}>
          <li><strong>Date de identificare:</strong> nume, prenume, adresa de email, numar de telefon</li>
          <li><strong>Date de livrare:</strong> adresa de livrare/facturare</li>
          <li><strong>Date tranzactionale:</strong> istoricul comenzilor, metoda de plata (nu stocam datele cardului)</li>
          <li><strong>Date tehnice:</strong> adresa IP, tipul browser-ului, cookies (conform Politicii de cookies)</li>
        </ul>

        <h2 style={h2Style}>2. Scopul prelucrarii</h2>
        <p style={pStyle}>Datele sunt prelucrate pentru:</p>
        <ul style={{ lineHeight: 2, paddingLeft: 20, marginBottom: 14 }}>
          <li>Procesarea si livrarea comenzilor (temei: executarea contractului)</li>
          <li>Comunicatii tranzactionale — confirmare comanda, actualizari livrare (temei: executarea contractului)</li>
          <li>Suport client (temei: interesul legitim al Operatorului)</li>
          <li>Newsletter / comunicari comerciale (temei: consimtamantul tau — retractabil oricand)</li>
          <li>Obligatii legale — facturare, raportari fiscale (temei: obligatie legala)</li>
        </ul>

        <h2 style={h2Style}>3. Drepturile tale</h2>
        <p style={pStyle}>In conformitate cu GDPR, ai urmatoarele drepturi:</p>
        <ul style={{ lineHeight: 2, paddingLeft: 20, marginBottom: 14 }}>
          <li>Dreptul de acces la datele tale</li>
          <li>Dreptul la rectificare</li>
          <li>Dreptul la stergere ("dreptul de a fi uitat")</li>
          <li>Dreptul la restrictionarea prelucrarii</li>
          <li>Dreptul la portabilitatea datelor</li>
          <li>Dreptul de opozitie</li>
          <li>Dreptul de a retrage consimtamantul (pentru prelucrarea bazata pe consimtamant)</li>
        </ul>
        <p style={pStyle}>
          Pentru exercitarea drepturilor, contacteaza-ne la{" "}
          <a href="mailto:office@arcromdiamonds.ro">office@arcromdiamonds.ro</a>.
          Raspundem in maximum 30 de zile. Ai si dreptul de a depune o plangere la{" "}
          <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer">
            ANSPDCP
          </a>
          .
        </p>

        <h2 style={h2Style}>4. Retentia datelor</h2>
        <p style={pStyle}>
          Datele comenzilor sunt pastrate 10 ani conform legislatiei fiscale romane. Datele contului
          de client sunt sterse la 2 ani de la ultima activitate, la cerere sau la stergerea contului.
          Datele de newsletter sunt sterse la retragerea consimtamantului.
        </p>

        <h2 style={h2Style}>5. Partajarea datelor</h2>
        <p style={pStyle}>
          Nu vindem datele tale. Le partajam doar cu:
        </p>
        <ul style={{ lineHeight: 2, paddingLeft: 20, marginBottom: 14 }}>
          <li>Curierii parteneri (Fan Courier, Sameday, Cargus, Posta Romana) — date necesare livrarii</li>
          <li>Procesatorul de plati Stripe — date necesare tranzactiei (nu stocam datele cardului)</li>
          <li>Furnizori de servicii tehnice (hosting, email) — sub acorduri de prelucrare a datelor</li>
          <li>Autoritati publice — cand suntem obligati legal</li>
        </ul>

        <h2 style={h2Style}>6. Cookies</h2>
        <p style={pStyle}>
          Utilizam cookies conform <a href={`/${countryCode}/cookie-policy`}>Politicii de cookies</a>.
          Poti gestiona preferintele de cookies din banner-ul afisat la prima vizita.
        </p>

        <h2 style={h2Style}>7. Securitate</h2>
        <p style={pStyle}>
          Implementam masuri tehnice si organizatorice adecvate pentru protectia datelor (HTTPS/SSL,
          acces restrictionat la date, autentificare cu doi factori pentru sisteme interne).
        </p>

        <h2 style={h2Style}>8. Contact</h2>
        <p style={pStyle}>
          Operator: ARC ROM DIAMONDS SRL<br />
          Adresa: Calea Baciului 1-3, Cluj-Napoca 400230<br />
          Email: <a href="mailto:office@arcromdiamonds.ro">office@arcromdiamonds.ro</a><br />
          Tel: +40 722 155 441
        </p>
      </main>
      <SiteFooter countryCode={countryCode} />
    </>
  )
}
