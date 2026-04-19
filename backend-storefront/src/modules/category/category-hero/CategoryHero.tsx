import { ReactNode } from 'react'

interface CategoryHeroProps {
  eyebrow: string
  title: string
  description: string
  meta: ReactNode[]
}

export function CategoryHero({ eyebrow, title, description, meta }: CategoryHeroProps) {
  return (
    <header className="cat-hero">
      <div>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-muted)' }}>{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
        <div className="meta">
          {meta.map((m, i) => (
            <span key={i}>{m}</span>
          ))}
        </div>
      </div>
    </header>
  )
}
