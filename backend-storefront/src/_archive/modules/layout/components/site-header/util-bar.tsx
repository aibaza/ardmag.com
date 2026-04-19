// Server component — no "use client"

export default function UtilBar() {
  return (
    <div className="util-bar" style={{ background: "var(--stone-900)" }}>
      <style>{`
        .util-bar-link { color: var(--stone-200); text-decoration: none; }
        .util-bar-link:hover { color: var(--brand-300); }
      `}</style>
      <div
        className="mx-auto flex items-center gap-5 flex-wrap"
        style={{
          maxWidth: "1400px",
          padding: "8px 24px",
          fontFamily: "var(--f-mono)",
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--stone-200)",
        }}
      >
        {/* Left cluster */}
        <div className="flex items-center gap-3">
          <span
            style={{
              display: "inline-block",
              width: "6px",
              height: "6px",
              borderRadius: "9999px",
              background: "var(--brand-500)",
              flexShrink: 0,
            }}
          />
          <span>
            <span style={{ color: "#ffffff", fontWeight: 600 }}>
              Transport gratuit
            </span>{" "}
            la comenzi peste 500 lei
          </span>
          <span style={{ color: "var(--stone-600)" }}>|</span>
          <span>Lun - Vin: 8 - 17</span>
          <span style={{ color: "var(--stone-600)" }}>|</span>
          <span>Cluj-Napoca</span>
        </div>

        {/* Right cluster */}
        <div className="ml-auto flex gap-4">
          <a href="tel:+40722155441" className="util-bar-link">
            +40 722 155 441
          </a>
          <a
            href="mailto:office@arcromdiamonds.ro"
            className="util-bar-link"
          >
            office@arcromdiamonds.ro
          </a>
        </div>
      </div>
    </div>
  )
}
