import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function PromoBand() {
  return (
    <section style={{ background: "var(--brand-500)", padding: "48px 0" }}>
      <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between gap-6 flex-wrap">
        <div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px", color: "oklch(90% 0.06 42)" }}>
            Cel mai mare distribuitor Tenax din Romania
          </div>
          <h2 style={{ fontSize: "28px", fontWeight: 600, letterSpacing: "-0.02em", margin: 0, color: "white" }}>
            25 de ani. La milimetru.
          </h2>
          <p style={{ marginTop: "4px", fontSize: "15px", color: "oklch(90% 0.06 42)" }}>
            Din 2001, livrăm precizie pe santiere din toata Romania.
          </p>
        </div>
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
            background: "var(--stone-900)",
            color: "white",
            border: "1px solid var(--stone-800)",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          Catalog produse
        </LocalizedClientLink>
      </div>
    </section>
  )
}
