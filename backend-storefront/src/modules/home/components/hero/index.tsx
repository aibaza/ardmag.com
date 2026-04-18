import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function Hero() {
  return (
    <section style={{ background: "var(--stone-900)", color: "white" }}>
      <style>{`
        .hero-grid { grid-template-columns: 1fr 1fr; }
        @media (max-width: 900px) { .hero-grid { grid-template-columns: 1fr; } }
      `}</style>
      <div
        className="hero-grid max-w-[1400px] mx-auto"
        style={{
          display: "grid",
          minHeight: "520px",
        }}
      >
        {/* Main panel */}
        <div
          className="flex flex-col justify-between p-12"
          style={{ borderRight: "1px solid var(--stone-800)" }}
        >
          <div>
            <div
              className="mb-4"
              style={{
                fontFamily: "var(--f-mono)",
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--brand-400)",
              }}
            >
              Distribuitor autorizat Tenax - Romania
            </div>
            <h1
              style={{
                fontSize: "44px",
                lineHeight: "1.05",
                letterSpacing: "-0.025em",
                fontWeight: 600,
                margin: 0,
                maxWidth: "560px",
              }}
            >
              Scule profesionale pentru piatra naturala
            </h1>
            <p
              style={{
                marginTop: "16px",
                fontSize: "15px",
                lineHeight: "1.6",
                maxWidth: "480px",
                color: "var(--stone-300)",
              }}
            >
              Discuri diamantate, adezivi Tenax, mase de slefuit, scule de pozare.
              Stoc permanent. Livrare in 24h.
            </p>
          </div>

          <div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <LocalizedClientLink
                href="/store"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "48px",
                  padding: "0 24px",
                  fontSize: "15px",
                  fontWeight: 500,
                  borderRadius: "var(--r-sm)",
                  background: "var(--brand-500)",
                  color: "white",
                  border: "1px solid var(--brand-600)",
                  textDecoration: "none",
                }}
              >
                Catalog produse
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/categories/discuri-de-taiere"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "48px",
                  padding: "0 24px",
                  fontSize: "15px",
                  fontWeight: 500,
                  borderRadius: "var(--r-sm)",
                  background: "white",
                  color: "var(--stone-900)",
                  border: "1px solid white",
                  textDecoration: "none",
                }}
              >
                Discuri diamantate
              </LocalizedClientLink>
            </div>

            <div style={{ display: "flex", gap: "32px", marginTop: "20px", flexWrap: "wrap" }}>
              {[
                { value: "25+", label: "Ani experienta" },
                { value: "500+", label: "Produse in stoc" },
                { value: "90", label: "Produse unice" },
              ].map(({ value, label }) => (
                <div key={label} style={{ display: "flex", flexDirection: "column" }}>
                  <strong style={{ fontFamily: "var(--f-mono)", fontSize: "22px", fontWeight: 500, color: "white" }}>
                    {value}
                  </strong>
                  <span style={{ fontFamily: "var(--f-mono)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "2px", color: "var(--stone-500)" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side: 2 category highlight cards */}
        <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", padding: "24px", gap: "16px" }}>
          {[
            {
              href: "/categories/discuri-de-taiere",
              kicker: "7 produse in stoc",
              title: "Discuri diamantate de taiere",
              desc: "Pentru marmura, granit, andezit, gresie. Diametre 100-2000mm.",
            },
            {
              href: "/categories/mastici-tenax",
              kicker: "20 produse in stoc",
              title: "Mastici si adezivi Tenax",
              desc: "Bicomponenti, epoxidici, poliesterici. Set A+B inclus.",
            },
          ].map(({ href, kicker, title, desc }) => (
            <LocalizedClientLink
              key={href}
              href={href}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "24px",
                borderRadius: "var(--r-sm)",
                background: "var(--stone-800)",
                border: "1px solid var(--stone-700)",
                textDecoration: "none",
              }}
            >
              <span style={{ fontFamily: "var(--f-mono)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px", color: "var(--brand-600)" }}>
                {kicker}
              </span>
              <h3 style={{ fontSize: "20px", lineHeight: "1.2", letterSpacing: "-0.015em", margin: 0, maxWidth: "80%", color: "white", fontWeight: 600 }}>
                {title}
              </h3>
              <p style={{ fontSize: "13px", marginTop: "8px", margin: "8px 0 0", color: "var(--stone-400)" }}>
                {desc}
              </p>
              <span style={{ marginTop: "auto", paddingTop: "16px", fontFamily: "var(--f-mono)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--brand-700)" }}>
                Vezi produsele &rarr;
              </span>
            </LocalizedClientLink>
          ))}
        </div>
      </div>
    </section>
  )
}
