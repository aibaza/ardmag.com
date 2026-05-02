function CardSkeleton() {
  return (
    <div style={{ background: "var(--stone-50)", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
      <div style={{ aspectRatio: "1 / 1", background: "var(--stone-100)" }} />
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ height: 12, width: 80, background: "var(--stone-100)", borderRadius: "var(--r-sm)" }} />
        <div style={{ height: 16, width: "90%", background: "var(--stone-100)", borderRadius: "var(--r-sm)" }} />
        <div style={{ height: 16, width: "70%", background: "var(--stone-100)", borderRadius: "var(--r-sm)" }} />
        <div style={{ height: 20, width: 90, background: "var(--stone-100)", borderRadius: "var(--r-sm)", marginTop: 8 }} />
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>
      {/* titlu categorie */}
      <div style={{ height: 28, width: 220, background: "var(--stone-100)", borderRadius: "var(--r-sm)", marginBottom: 32 }} />
      {/* grilă */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 }}>
        {[...Array(12)].map((_, i) => <CardSkeleton key={i} />)}
      </div>
    </div>
  )
}
