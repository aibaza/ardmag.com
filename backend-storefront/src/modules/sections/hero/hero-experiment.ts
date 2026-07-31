// Experiment inchis la finalul promotiei Tenax, 2026-07-31 EOD Europe/Bucharest.
// Lista goala este kill-switch-ul canonic folosit de homepage pentru fallback.

export interface HeroExperimentVariant {
  id: 'stoc' | 'calcul' | 'sezon' | 'expert'
  kicker: string
  title: string
  description: string
  primaryCta: { label: string; href: string }
  ghostCta: { label: string; href: string }
  stats: { value: string; label: string }[]
  promoImage: string
}

export const HERO_EXPERIMENT = {
  name: 'hero_tenax30_v1',
  rotateMs: 10000,
  variants: [] as HeroExperimentVariant[],
}
