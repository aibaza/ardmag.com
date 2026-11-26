interface MetaItem {
  prefix?: string
  strong: string
  label?: string
}

interface CategoryHeroProps {
  eyebrow?: string
  title: string
  description?: string
  meta?: MetaItem[]
  // Numarul de produse afisat langa titlu (o singura data pe pagina).
  count?: number
}

export function CategoryHero({ eyebrow, title, description, meta, count }: CategoryHeroProps) {
  return (
    <header className="cat-hero">
      <div>
        {eyebrow && (
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-muted)" }}>
            {eyebrow}
          </div>
        )}
        {count !== undefined ? (
          <div className="cat-hero-title">
            <h1>{title}</h1>
            <span className="cat-hero-count">{count} {count === 1 ? "produs" : "produse"}</span>
          </div>
        ) : (
          <h1>{title}</h1>
        )}
        {description && <p>{description}</p>}
        {meta && meta.length > 0 && (
          <div className="meta">
            {meta.map((item, i) => (
              <span key={i}>
                {item.prefix ? (
                  <>{item.prefix}<strong>{item.strong}</strong></>
                ) : (
                  <><strong>{item.strong}</strong>{item.label ? ` ${item.label}` : ""}</>
                )}
              </span>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
