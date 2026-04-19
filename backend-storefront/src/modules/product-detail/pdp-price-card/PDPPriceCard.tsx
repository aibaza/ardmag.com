interface PDPPriceCardProps {
  price: string
  was?: string
  save?: string
  priceNoTax?: string
  unitLabel?: string
  promoLabel?: string
  promoDate?: string
}

export function PDPPriceCard({ price, was, save, priceNoTax, unitLabel, promoLabel, promoDate }: PDPPriceCardProps) {
  return (
    <div className="pdp-price-card">
      <div className="pdp-price-row">
        <span className="pdp-price">{price}</span>
        {was && <span className="pdp-was">{was}</span>}
        {save && <span className="pdp-save">{save}</span>}
      </div>
      {priceNoTax && (
        <div style={{ display: "flex", gap: "14px", alignItems: "center", fontSize: "12px", color: "var(--fg-muted)", fontFamily: "var(--f-mono)" }}>
          <span>Fără TVA: <strong style={{ color: "var(--fg)" }}>{priceNoTax}</strong></span>
          {unitLabel && <><span>·</span><span>{unitLabel}</span></>}
        </div>
      )}
      {promoLabel && promoDate && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", background: "var(--brand-50)", borderRadius: "var(--r-sm)", fontSize: "12.5px", color: "var(--brand-800)", lineHeight: "1.3" }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ flexShrink: 0 }}><circle cx="8" cy="8" r="6"/><path d="M5 8l2 2 4-4"/></svg>
          {promoLabel}<strong>{promoDate}</strong>
        </div>
      )}
    </div>
  )
}
