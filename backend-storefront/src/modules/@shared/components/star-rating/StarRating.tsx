interface StarRatingProps {
  score: number
  reviewCount: number
  reviewsHref?: string
}

export function StarRating({ score, reviewCount, reviewsHref = "#reviews" }: StarRatingProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
      <span style={{ color: "var(--brand-500)", letterSpacing: "1px" }}>★★★★★</span>
      <strong>{score}</strong>
      <span style={{ color: "var(--fg-muted)" }}>· {reviewCount} recenzii</span>
      <span style={{ color: "var(--fg-muted)" }}>·</span>
      <a href={reviewsHref} style={{ color: "var(--brand-700)", textDecoration: "none", fontSize: "12px" }}>
        Vezi recenziile →
      </a>
    </div>
  )
}
