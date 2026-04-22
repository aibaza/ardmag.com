import type { CSSProperties } from 'react'
import type { Hero } from './Hero'

type HeroProps = Parameters<typeof Hero>[0]

// Extracted verbatim from page.tsx static Hero props - no copy invented here
export function getHeroFallback(countryCode: string): HeroProps {
  return {
    kicker: "Promo luna aprilie · până pe 30",
    title: "Mastici Tenax la -30% reducere",
    description: "Toată gama de mastici poliesterici și epoxidici Tenax la -30%. Stoc complet în Cluj, livrare 24-48h în toată țara.",
    primaryCta: { label: "Vezi promoția", href: `/promotii` },
    ghostCta: {
      label: "Toate produsele →",
      href: `/categories/solutii-pentru-piatra`,
      style: { color: "#fff", borderColor: "var(--stone-700)" } as CSSProperties,
    },
    stats: [
      { value: "480+", label: "produse în stoc" },
      { value: "7", label: "furnizori autorizați" },
      { value: "24h", label: "livrare Cluj" },
    ],
    sideCards: [
      {
        kicker: "Nou · Sait Abrazivi",
        title: "Pad-uri Velcro 7 gradații",
        description: "Set complet pentru polish granit de la grit 50 la 3000.",
        image: "/design-temp/hero-paduri.jpg",
        imageAlt: "Pad-uri Velcro",
        ctaLabel: "Descoperă setul →",
        ctaHref: `/categories/slefuire-piatra`,
      },
      {
        kicker: "Ghid tehnic",
        title: "Cum alegi discul corect",
        description: "Granit dur vs. marmura vs. beton armat -- cheatsheet PDF.",
        image: "/design-temp/hero-ghid.jpg",
        imageAlt: "Ghid discuri",
        ctaLabel: "Toate discurile →",
        ctaHref: `/categories/discuri-de-taiere`,
      },
    ],
    headingLevel: "h1",
  }
}
