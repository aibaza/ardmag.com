export default function Loading() {
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>
      {/* breadcrumb */}
      <div style={{ height: 18, width: 240, background: "var(--stone-100)", borderRadius: "var(--r-sm)", marginBottom: 32 }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
        {/* imagine produs */}
        <div style={{ aspectRatio: "1 / 1", background: "var(--stone-100)", borderRadius: "var(--r-lg)" }} />

        {/* detalii produs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ height: 14, width: 100, background: "var(--stone-100)", borderRadius: "var(--r-sm)" }} />
          <div style={{ height: 32, width: "80%", background: "var(--stone-100)", borderRadius: "var(--r-sm)" }} />
          <div style={{ height: 24, width: 120, background: "var(--stone-100)", borderRadius: "var(--r-sm)", marginTop: 8 }} />
          <div style={{ height: 1, background: "var(--stone-100)", marginTop: 8 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ height: 14, width: `${85 - i * 10}%`, background: "var(--stone-100)", borderRadius: "var(--r-sm)" }} />
            ))}
          </div>
          <div style={{ height: 48, background: "var(--stone-100)", borderRadius: "var(--r-md)", marginTop: 16 }} />
        </div>
      </div>
    </div>
  )
}
