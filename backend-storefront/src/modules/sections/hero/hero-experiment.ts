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
      title: 'Piatra rămâne udă ore bune după ploaie? E semnul că vrea tratament nou.',
      description: 'Semnele după care se recunoaște, și tratamentul potrivit gradului de absorbție.',
      primaryCta: { label: 'Vezi tratamentele', href: DELTA_HREF },
      ghostCta: { label: 'Toate produsele →', href: TOATE_HREF },
      stats: STATS_GAMA,
      promoImage: '/design-temp/hero-delta-diagnostic.jpg',
    },
    {
      id: 'ph',
      kicker: 'Detergenți Delta Research',
      title: 'pH-ul potrivit face curățenia să țină.',
      description: 'Neutru pentru întreținere, acid pentru reziduuri de montaj, alcalin înainte de tratament. Marmura, travertinul și celelalte pietre calcaroase cer detergent fără acid.',
      primaryCta: { label: 'Vezi detergenții', href: DELTA_HREF },
      ghostCta: { label: 'Toate produsele →', href: TOATE_HREF },
      stats: STATS_GAMA,
      promoImage: '/design-temp/hero-delta-ph.jpg',
    },
    // Statutul gamei Delta e confirmat: Andrei Rinzis a validat varianta asta pe
    // 5 august 2026, la revizuirea bannerului, dupa ce o confirmase deja in iulie
    // ("gama Delta Research, produsa de noi"). CLAUDE.md-ul site-ului, care o
    // listase gresit printre furnizori, a fost corectat in aceeasi zi.
    // Formularea publica se opreste la proprietate; NU se afirma unde se produce.
    {
      id: 'productie',
      kicker: 'Delta Research',
      title: 'Gama Delta o facem noi. Tot noi răspundem pentru ea.',
      description: 'Întrebi despre un produs și primești răspunsul de la cine l-a formulat.',
      primaryCta: { label: 'Vezi gama Delta Research', href: DELTA_HREF },
      ghostCta: { label: 'Toate produsele →', href: TOATE_HREF },
      stats: STATS_FURNIZOR,
      promoImage: '/design-temp/hero-delta-productie.jpg',
    },
    {
      id: 'spalare',
      kicker: 'Regulă de atelier',
      title: 'Detergentul neutru păstrează protecția aplicată.',
      description: 'Clean Stone e făcut pentru întreținerea zilnică a suprafețelor tratate.',
      primaryCta: { label: 'Detergenți pentru suprafețe tratate', href: DELTA_HREF },
      ghostCta: { label: 'Toate produsele →', href: TOATE_HREF },
      stats: STATS_FURNIZOR,
      promoImage: '/design-temp/hero-delta-spalare.jpg',
    },
    {
      id: 'absorbtie',
      kicker: 'Înainte de tratament',
      title: 'Absorbția îți spune câți litri cumperi.',
      description: 'Un test pe o zonă mică arată dacă e nevoie de un strat sau de două.',
      primaryCta: { label: 'Cum alegi tratamentul', href: DELTA_HREF },
      ghostCta: { label: 'Toate produsele →', href: TOATE_HREF },
      stats: STATS_GAMA,
      promoImage: '/design-temp/hero-delta-absorbtie.jpg',
    },
    {
      id: 'criteriu',
      kicker: 'Recomandare tehnică',
      title: 'Spune-ne piatra, îți spunem cantitatea.',
      description: 'Tipul pietrei, locul unde e montată și efectul dorit — de acolo pleacă recomandarea.',
      primaryCta: { label: 'Cere recomandarea', href: '/contact' },
      ghostCta: { label: 'Vezi gama Delta →', href: DELTA_HREF },
      stats: STATS_GAMA,
      promoImage: '/design-temp/hero-delta-criteriu.jpg',
    },
  ] as HeroExperimentVariant[],
}
