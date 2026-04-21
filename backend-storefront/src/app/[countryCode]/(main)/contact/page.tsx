import { Metadata } from "next"
import { SiteHeaderShell } from "@modules/layout/site-header"
import { SiteFooter } from "@modules/layout/site-footer"
import { ContactForm } from "./ContactForm"

export const metadata: Metadata = {
  title: "Contact | ardmag.com",
  description:
    "Contacteaza-ne: +40 722 155 441, office@arcromdiamonds.ro. Calea Baciului 1-3, Cluj-Napoca. Program L-V 08-16.",
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params

  return (
    <>
      <SiteHeaderShell countryCode={countryCode} />
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
        <h1 style={{ fontFamily: "var(--f-sans)", fontWeight: 700, fontSize: "clamp(24px,4vw,36px)", marginBottom: 40 }}>
          Contact
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 48 }}>
          <section>
            <h2 style={{ fontFamily: "var(--f-sans)", fontWeight: 600, fontSize: 18, marginBottom: 16 }}>
              Date de contact
            </h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, lineHeight: 2.2 }}>
              <li>
                <strong>Telefon:</strong>{" "}
                <a href="tel:+40722155441" style={{ color: "var(--brand-600)" }}>+40 722 155 441</a>
              </li>
              <li>
                <strong>Email:</strong>{" "}
                <a href="mailto:office@arcromdiamonds.ro" style={{ color: "var(--brand-600)" }}>
                  office@arcromdiamonds.ro
                </a>
              </li>
              <li><strong>Adresa:</strong> Calea Baciului 1-3, Cluj-Napoca 400230</li>
              <li><strong>Program:</strong> Luni-Vineri, 08:00-16:00</li>
            </ul>

            <div style={{ marginTop: 24, background: "var(--surface-raised)", borderRadius: "var(--r-md)", padding: "16px 20px" }}>
              <p style={{ margin: 0, fontSize: 14, color: "var(--fg-muted)" }}>
                ARC ROM DIAMONDS SRL<br />
                CUI: 13828707 &nbsp;|&nbsp; J12/553/2001
              </p>
            </div>
          </section>

          <ContactForm />
        </div>

        <div style={{ borderRadius: "var(--r-lg)", overflow: "hidden", height: 350 }}>
          <iframe
            title="Locatie ARC ROM DIAMONDS Cluj-Napoca"
            src="https://maps.google.com/maps?q=Calea+Baciului+1-3+Cluj-Napoca&output=embed"
            width="100%"
            height="350"
            style={{ border: 0, display: "block" }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </main>
      <SiteFooter countryCode={countryCode} />
    </>
  )
}
