interface CategoryHeroProps {
  title: string
  description: string
}

export function CategoryHero({ title, description }: CategoryHeroProps) {
  return (
    <header className="cat-hero">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
    </header>
  )
}
