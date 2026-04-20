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
}

export function CategoryHero({ eyebrow, title, description, meta }: CategoryHeroProps) {
  return (
    <header className="cat-hero">
      <div>
        {eyebrow && (
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-muted)" }}>
            {eyebrow}
          </div>
        )}
        <h1>{title}</h1>
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
