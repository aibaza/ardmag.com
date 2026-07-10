// Blocul .hero-side extras verbatim din Hero.tsx: side-cards raman
// server-rendered si ne-rotative (override-ul cu ultimele 2 articole de blog
// din page.tsx se aplica neschimbat), in timp ce .hero-main e inlocuit de
// HeroRotator pe durata experimentului A/B.

interface HeroSideCard {
  kicker: string
  title: string
  description: string
  image: string
  imageAlt: string
  ctaLabel: string
  ctaHref: string
}

export function HeroSide({ cards }: { cards: HeroSideCard[] }) {
  return (
    <div className="hero-side">
      {cards.map((card, i) => (
        <a key={i} className="hero-card with-img" href={card.ctaHref} aria-label={`${card.kicker}: ${card.title}`}>
          <img className="hcard-bg" src={card.image} alt="" aria-hidden="true" width={800} height={450} loading="lazy" />
          <span className="hcard-fade" aria-hidden="true" />
          <span className="kicker">{card.kicker}</span>
          <h3>{card.title}</h3>
          <p>{card.description}</p>
          <span className="hcard-cta">{card.ctaLabel}</span>
        </a>
      ))}
    </div>
  )
}
