import { Metadata } from "next"
import { SiteHeaderShell } from "@modules/layout/site-header"
import { SiteFooter } from "@modules/layout/site-footer"

export const metadata: Metadata = {
  title: "Despre noi | ardmag.com",
  description:
    "ARC ROM DIAMONDS SRL — distribuitor autorizat Tenax, producator Delta Research. 25 de ani pe piata pietrei naturale din Romania.",
}

export default async function DespreNoiPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params

  return (
    <>
      <SiteHeaderShell countryCode={countryCode} />
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
        <h1 style={{ fontFamily: "var(--f-sans)", fontWeight: 700, fontSize: "clamp(24px,4vw,36px)", marginBottom: 8 }}>
          Despre noi
        </h1>
        <p style={{ color: "var(--fg-muted)", fontFamily: "var(--f-mono)", marginBottom: 40 }}>
          ARC ROM DIAMONDS SRL — activi din 2001
        </p>

        <section style={{ marginBottom: 40 }}>
          <p style={{ lineHeight: 1.7, marginBottom: 16 }}>
            Suntem prezenti pe piata consumabilelor pentru prelucrarea pietrei naturale din 2001.
            Compania ofera solutii tehnice complete in domeniul extragerii, prelucrarii, montarii,
            tratarii, curatarii si intretinerii pietrelor ornamentale — marmura, travertin, andezit.
          </p>
          <p style={{ lineHeight: 1.7, marginBottom: 16 }}>
            <strong>CEL MAI MARE DISTRIBUITOR TENAX DIN ROMANIA.</strong>{" "}
            Distributie in 12-18 tari. Sediu: Calea Baciului 1-3, Cluj-Napoca.
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: "var(--f-sans)", fontWeight: 600, fontSize: 22, marginBottom: 16 }}>
            Divizia Delta Research
          </h2>
          <p style={{ lineHeight: 1.7, marginBottom: 16 }}>
            Delta Research a fost preluata de Arc Rom Diamonds in 2011. Firma a fost fondata in 1984
            in Italia si produce impermeabilizanti si detergenti speciali pentru piatra naturala.
            Suntem primii producatori de chimicale adresate pietei pentru piatra din Europa de Est.
          </p>
          <p style={{ lineHeight: 1.7 }}>
            Produsele Delta Research respecta cele mai exigente standarde impuse de normativele
            internationale. Peste 40 de ani de cercetare-dezvoltare in domeniu.
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: "var(--f-sans)", fontWeight: 600, fontSize: 22, marginBottom: 16 }}>
            Furnizori oficiali
          </h2>
          <p style={{ lineHeight: 1.7 }}>
            Tenax · Delta Research · Sait · Woosuk · Diatex · Fox Ironstone · VBT · SuperSelva
          </p>
        </section>

        <section style={{ background: "var(--surface-raised)", borderRadius: "var(--r-lg)", padding: "24px 28px" }}>
          <h2 style={{ fontFamily: "var(--f-sans)", fontWeight: 600, fontSize: 18, marginBottom: 16 }}>
            Date de contact
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, lineHeight: 2 }}>
            <li><strong>Telefon:</strong> +40 722 155 441</li>
            <li><strong>Email:</strong> office@arcromdiamonds.ro</li>
            <li><strong>Adresa:</strong> Calea Baciului 1-3, Cluj-Napoca 400230</li>
            <li><strong>Program:</strong> Luni-Vineri, 08:00-16:00</li>
            <li><strong>CUI:</strong> 13828707 &nbsp;|&nbsp; <strong>Reg. Com.:</strong> J12/553/2001</li>
          </ul>
        </section>
      </main>
      <SiteFooter countryCode={countryCode} />
    </>
  )
}
