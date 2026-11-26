"use client"

// Coloana dreapta a hero-ului cu recenziile Google: sus un singur card de
// articol (in rotatie, HeroSideTicker slots=1), jos cardul de recenzii.
// Fara cheie/Place ID, ori daca Google da eroare sau nu raspunde la timp,
// coloana revine exact la forma de dinainte (2 articole), fara spatiu gol.
// Prima randare e aceeasi pe server si client: starea porneste din
// constantele NEXT_PUBLIC_*, iar cererea pleaca numai din efect.

import { useEffect, useState } from 'react'
import { HeroSide } from './HeroSide'
import { HeroSideTicker } from './HeroSideTicker'
import {
  HeroReviewCard,
  RECENZII_CONFIGURATE,
  cereRecenziiHero,
  type RecenziiHero,
} from '@modules/sections/google-reviews/HeroReviewCard'

interface HeroSideCard {
  kicker: string
  title: string
  description: string
  image: string
  imageAlt: string
  ctaLabel: string
  ctaHref: string
}

type Stare = 'incarcare' | 'afisat' | 'eroare'

export function HeroSideReviews({ cards }: { cards: HeroSideCard[] }) {
  const [stare, setStare] = useState<Stare>(RECENZII_CONFIGURATE ? 'incarcare' : 'eroare')
  const [date, setDate] = useState<RecenziiHero | null>(null)

  useEffect(() => {
    if (!RECENZII_CONFIGURATE) return
    let anulat = false
    cereRecenziiHero()
      .then((d) => { if (!anulat) { setDate(d); setStare('afisat') } })
      .catch(() => { if (!anulat) setStare('eroare') })
    return () => { anulat = true }
  }, [])

  if (stare === 'eroare' || cards.length === 0) {
    return cards.length >= 3
      ? <HeroSideTicker key="doua" cards={cards} />
      : <HeroSide cards={cards.slice(0, 2)} />
  }

  return (
    <div className="hero-side hero-side--reviews">
      <HeroSideTicker key="unu" cards={cards} slots={1} />
      <div className="hrc-slot">
        {stare === 'afisat' && date ? <HeroReviewCard date={date} /> : <div className="hrc hrc--skel" aria-hidden="true" />}
      </div>
    </div>
  )
}
