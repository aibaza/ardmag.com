// Contor de aterizare la edge: numara cererile HTTP care poarta markeri de
// campanie (fbclid / utm_source), inainte de JS, de consent si de bounce.
//
// De ce exista. Meta raporteaza doua cifre care par sa se raporteze una la alta,
// dar masoara lucruri diferite:
//   - "link click"          = tap pe linkul reclamei (numara tap-uri, nu oameni,
//                             nu cereri HTTP; un tap dublu = 2)
//   - "landing page view"   = pixelul a trimis PageView din browser
// Pe ardmag.ro pixelul e consent-gated (MetaPixel.tsx face fbq('consent','revoke')
// la init si trimite PageView doar dupa acceptul de marketing), deci LPV nu poate
// depasi structural rata de accept a consimtamantului. Raportul link click -> LPV
// nu masoara oameni pierduti pe pagina.
//
// Contorul asta livreaza veriga lipsa si neutra fata de consent: cate cereri au
// ajuns efectiv la serverul nostru. Cu el, cele patru cifre pot fi citite fara sa
// fie amestecate - vezi tools/analytics/scripts/paid-landing-readback.js.
//
// Privacy / GDPR. Nu citeste si nu scrie cookies sau storage pe dispozitiv, deci
// nu intra sub art. 5(3) ePrivacy (nu e nevoie de consent). Nu trimite IP, nu
// trimite user-agent, nu trimite fbclid si niciun alt identificator de click sau
// de persoana: din fbclid pastram doar faptul ca a existat. utm_* descriu
// campania, nu persoana. Tara e coarse (nivel de tara), aceeasi dimensiune pe
// care colectorul o pastreaza prin design.

export const EDGE_LANDING_EVENT = "edge_landing"

// Trebuie sa ramana identic cu data-site din src/app/layout.tsx, altfel
// evenimentele de edge si pageview-urile din browser ajung pe site-uri diferite
// in colector si readback-ul compara mere cu pere.
export const SITE_KEY = "ardmag.ro"

export type LandingMarker = "fbclid" | "utm"

export type EdgeLandingEvent = {
  site: string
  event: string
  path: string
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_content: string
  utm_term: string
  ref: string
  resolved_via: string
  extra: { marker: LandingMarker; country?: string }
}

function param(url: URL, name: string): string {
  return (url.searchParams.get(name) ?? "").trim()
}

// Un marker inseamna doar "cererea vine dintr-o campanie". fbclid castiga in fata
// utm pentru ca e pus de Meta chiar si cand reclama nu poarta utm-uri.
export function detectLandingMarker(url: URL): LandingMarker | null {
  if (param(url, "fbclid")) return "fbclid"
  if (param(url, "utm_source")) return "utm"
  return null
}

// Cereri care nu sunt aterizari umane. Le taiem inainte de a numara, altfel
// contorul isi pierde sensul de comparatie cu link-click-urile Meta.
//
// UA-ul e folosit doar aici, ca filtru in memorie; nu pleaca nicaieri si nu se
// stocheaza. Prefetch-urile Next si cererile non-GET nu sunt aterizari.
const BOT_UA = /bot|crawler|spider|facebookexternalhit|preview|headless|lighthouse|pingdom|curl|wget/i

export function isCountableLanding({
  method,
  userAgent,
  isPrefetch,
}: {
  method: string
  userAgent?: string | null
  isPrefetch: boolean
}): boolean {
  if (method !== "GET") return false
  if (isPrefetch) return false
  if (userAgent && BOT_UA.test(userAgent)) return false
  return true
}

export function buildEdgeLandingEvent({
  url,
  marker,
  referrer,
  country,
}: {
  url: URL
  marker: LandingMarker
  referrer?: string | null
  country?: string | null
}): EdgeLandingEvent {
  let refDomain = ""
  try {
    refDomain = referrer ? new URL(referrer).hostname : ""
  } catch {
    refDomain = ""
  }

  return {
    site: SITE_KEY,
    event: EDGE_LANDING_EVENT,
    // path fara query: query-ul poarta fbclid, iar fbclid nu are ce cauta in depozit.
    path: url.pathname,
    utm_source: param(url, "utm_source"),
    utm_medium: param(url, "utm_medium"),
    utm_campaign: param(url, "utm_campaign"),
    utm_content: param(url, "utm_content"),
    utm_term: param(url, "utm_term"),
    ref: refDomain,
    resolved_via: "edge_middleware",
    // Colectorul deriva country din request.cf al POST-ului, care aici e regiunea
    // Vercel, nu a omului. Tara reala vine din x-vercel-ip-country si o purtam in
    // extra ca sa nu ne bazam pe dimensiunea gresita la citire.
    extra: { marker, ...(country ? { country } : {}) },
  }
}
