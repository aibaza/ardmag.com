// Experimentul A/B de hero pentru campania Mastici Tenax -30% (hero_tenax30_v1).
// 4 variante de copy rotite client-side (ordine random per pageload), masurate
// prin beacon-ul first-party (vezi HeroRotator + ab-track).
// Copy strict pe date business confirmate (site CLAUDE.md): -30% mastici Tenax
// aplicat la checkout, livrare 24-48h, 25 ani experienta, distribuitor Tenax.

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
  variants: [
    {
      id: 'stoc',
      kicker: 'Mastici Tenax · Stoc complet Cluj',
      title: 'Mastici Tenax: stoc complet, preț -30% până pe 31 iulie',
      description:
        'Comanzi azi, montezi poimâine. Mastici poliesterici și epoxidici în stoc în depozitul din Cluj, livrare 24-48h în toată țara.',
      primaryCta: { label: 'Vezi promoția', href: '/promotii' },
      ghostCta: { label: 'Toate produsele →', href: '/categories/solutii-pentru-piatra' },
      stats: [
        { value: '20', label: 'produse mastici' },
        { value: '24-48h', label: 'livrare în țară' },
        { value: '25+', label: 'ani experiență' },
      ],
      promoImage: '/promo/tenax/stoc.webp',
    },
    {
      id: 'calcul',
      kicker: 'Promo Mastici Tenax · Redus la checkout',
      title: '-30% la mastici Tenax. La un bidon de 1 kg, diferența se vede pe factură.',
      description:
        'Reducerea se aplică automat la checkout, la toată gama de mastici poliesterici și epoxidici. Stoc în Cluj, livrare 24-48h.',
      primaryCta: { label: 'Vezi promoția', href: '/promotii' },
      ghostCta: { label: 'Toate produsele →', href: '/categories/solutii-pentru-piatra' },
      stats: [
        { value: '-30%', label: 'la toată gama' },
        { value: '24-48h', label: 'livrare în țară' },
        { value: '500 lei', label: 'transport gratuit peste' },
      ],
      promoImage: '/promo/tenax/calcul.webp',
    },
    {
      id: 'sezon',
      kicker: 'Sezon de montaj · Până pe 31 iulie',
      title: 'Sezonul de montaj e în plin. Masticii Tenax, la -30% până pe 31 iulie.',
      description:
        'Aprovizionează atelierul pentru lucrările verii. Toată gama de mastici Tenax la -30%, cu livrare 24-48h în toată țara.',
      primaryCta: { label: 'Vezi promoția', href: '/promotii' },
      ghostCta: { label: 'Toate produsele →', href: '/categories/solutii-pentru-piatra' },
      stats: [
        { value: '480+', label: 'produse în stoc' },
        { value: '7', label: 'furnizori autorizați' },
        { value: '24h', label: 'livrare Cluj' },
      ],
      promoImage: '/promo/tenax/sezon.webp',
    },
    {
      id: 'expert',
      kicker: 'Ghid + Promo · Mastici Tenax',
      title: 'Masticul potrivit pentru lucrarea ta, la -30%',
      description:
        'Culoare, consistență, ambalaj: alegi corect din toată gama Tenax, cu reducerea aplicată automat la checkout.',
      primaryCta: { label: 'Vezi promoția', href: '/promotii' },
      ghostCta: { label: 'Ghidul masticilor →', href: '/blog/mastici-tenax-culori-cantitati' },
      stats: [
        { value: '20', label: 'produse mastici' },
        { value: '25+', label: 'ani experiență' },
        { value: '24-48h', label: 'livrare în țară' },
      ],
      promoImage: '/promo/tenax/expert.webp',
    },
  ] as HeroExperimentVariant[],
}
