// Experimentul de hero al homepage-ului. Lista goala este kill-switch-ul
// canonic: cand `variants` e goala, pagina cade pe getHeroFallback().
//
// Istoric: experimentul Tenax (hero_tenax30_v1) s-a inchis la finalul promotiei,
// 2026-07-31, iar homepage-ul a ramas pe fallback-ul care anunta o campanie
// incheiata.
//
// Rotatia curenta porneste de la un diagnostic al palniei, nu de la dorinta de a
// arata gama: traficul se opreste (CTR 2,43%), dar din 3064 de vizite au iesit
// 43 de cosuri. Pierderea e la ALEGERE, nu la atentie - iar un banner care
// "prezinta gama" adauga optiuni exact acolo unde omul deja nu poate alege. Deci
// fiecare varianta pleaca de la un simptom sau de la un criteriu tehnic si duce
// in raftul potrivit.
//
// Propunerea completa, cu mecanismul fiecarei variante:
// clients/ardmag.com/proposals/hero-homepage-delta-2026-08.json

export interface HeroExperimentVariant {
  id: 'diagnostic' | 'ph' | 'productie' | 'spalare' | 'absorbtie' | 'criteriu'
  kicker: string
  title: string
  description: string
  primaryCta: { label: string; href: string }
  ghostCta: { label: string; href: string }
  stats: { value: string; label: string }[]
  promoImage: string
}

const DELTA_HREF = '/categories/solutii-pentru-piatra?brand=delta-research'
const TOATE_HREF = '/produse'

// Cifre verificate pe catalogul live la 2026-08-04: 25 de produse Delta Research
// in categoria Solutii pentru piatra. Cele 3 valori de pH ale detergentilor vin
// din materialul tehnic confirmat de Andrei Rinzis (inbox 2026-05-21). Regula
// copy integrity din CLAUDE.md: nicio cifra fara sursa.
const STATS_GAMA = [
  { value: '25', label: 'produse Delta Research' },
  { value: '3', label: 'valori de pH la detergenți' },
  { value: '24h', label: 'livrare Cluj' },
]

const STATS_FURNIZOR = [
  { value: 'din 2001', label: 'pe piață' },
  { value: 'Cluj-Napoca', label: 'stoc și suport tehnic' },
  { value: '24h', label: 'livrare' },
]

export const HERO_EXPERIMENT = {
  name: 'hero_delta_rutare_v1',
  rotateMs: 10000,
  variants: [
    {
      id: 'diagnostic',
      kicker: 'Tratamente Delta Research',
      title: 'Piatra rămâne udă ore bune după ploaie? Tratamentul s-a consumat.',
      description: 'Semnele că protecția a expirat și tratamentul potrivit gradului de absorbție.',
      primaryCta: { label: 'Vezi tratamentele', href: DELTA_HREF },
      ghostCta: { label: 'Toate produsele →', href: TOATE_HREF },
      stats: STATS_GAMA,
      promoImage: '/design-temp/hero-delta-diagnostic.png',
    },
    {
      id: 'ph',
      kicker: 'Detergenți Delta Research',
      title: 'Alegi după pH, nu după etichetă.',
      description: 'Neutru pentru întreținere, acid pentru reziduuri de montaj, alcalin înainte de tratament. Acid pe marmură — niciodată.',
      primaryCta: { label: 'Vezi detergenții', href: DELTA_HREF },
      ghostCta: { label: 'Toate produsele →', href: TOATE_HREF },
      stats: STATS_GAMA,
      promoImage: '/design-temp/hero-delta-ph.png',
    },
    // ATENTIE, de clarificat inainte de productie: aceasta varianta afirma ca
    // gama Delta e facuta de firma. Sursele se contrazic. In favoarea ei:
    // clients/arc-rom-diamonds/brands/delta-research/brand.json declara
    // legal_owner = Arc Rom Diamonds SRL, iar o lectie aprobata cu sursa Andrei
    // Rinzis (2026-07-10) spune "gama Delta Research, produsa de noi". Impotriva:
    // CLAUDE.md-ul acestui site listeaza Delta Research printre FURNIZORI, la
    // datele business confirmate. Una dintre cele doua e stale. Pe test poate
    // rula; inainte de master cere confirmarea scrisa a lui DC.
    {
      id: 'productie',
      kicker: 'Delta Research',
      title: 'Tratamentul nu e adus de noi. E făcut de noi.',
      description: 'Când nu se comportă cum scrie în fișă, răspunsul vine de la cine l-a formulat, nu de la un importator.',
      primaryCta: { label: 'Vezi gama Delta Research', href: DELTA_HREF },
      ghostCta: { label: 'Toate produsele →', href: TOATE_HREF },
      stats: STATS_FURNIZOR,
      promoImage: '/design-temp/hero-delta-productie.png',
    },
    {
      id: 'spalare',
      kicker: 'Regulă de atelier',
      title: 'Detergentul alcalin după tratament îți ia protecția pe care tocmai ai plătit-o.',
      description: 'Ce speli cu ce, ca tratamentul să țină un sezon în plus.',
      primaryCta: { label: 'Detergenți pentru suprafețe tratate', href: DELTA_HREF },
      ghostCta: { label: 'Toate produsele →', href: TOATE_HREF },
      stats: STATS_FURNIZOR,
      promoImage: '/design-temp/hero-delta-spalare.png',
    },
    {
      id: 'absorbtie',
      kicker: 'Înainte de tratament',
      title: 'Absorbția decide cantitatea, nu finisajul.',
      description: 'Testul pe 10×10 cm îți spune câți litri cumperi. Fiamat sau lustruit contează abia după.',
      primaryCta: { label: 'Cum alegi tratamentul', href: DELTA_HREF },
      ghostCta: { label: 'Toate produsele →', href: TOATE_HREF },
      stats: STATS_GAMA,
      promoImage: '/design-temp/hero-delta-absorbtie.png',
    },
    {
      id: 'criteriu',
      kicker: 'Ce nu avem',
      title: 'Nu avem un produs care merge pe orice piatră.',
      description: 'Avem 25 și un criteriu: absorbție, poziție, efect dorit. Spune-ne piatra, îți spunem litrii.',
      primaryCta: { label: 'Cere recomandarea', href: '/contact' },
      ghostCta: { label: 'Vezi gama Delta →', href: DELTA_HREF },
      stats: STATS_GAMA,
      promoImage: '/design-temp/hero-delta-criteriu.png',
    },
  ] as HeroExperimentVariant[],
}
