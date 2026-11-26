"use client"

import { useEffect, useRef, useState } from "react"
import { googleMapsProfileUrl } from "./google-maps-link"
import { incarcaPlaces } from "./places"

// Recenziile Google Maps ale locației din Cluj, cerute de la Google (Places, Maps JS API)
// la fiecare afișare și desenate în stilul site-ului. Nu se stochează și nu se filtrează:
// arătăm primele recenzii în ordinea întoarsă de Google, cu autorul și atribuirea Google Maps.
// Cererea pleacă numai când blocul ajunge aproape de ecran (cost per afișare la Google).
// Fără cheie sau Place ID, ori dacă Google refuză, rămâne linkul spre profil.

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
const PLACE_ID = process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID
const CARDURI = 3

type Recenzie = {
  autor: string
  autorUrl?: string
  poza?: string
  nota: number
  text: string
  cand: string
  url?: string
}
type Date = { nota?: number; total?: number; url?: string; recenzii: Recenzie[] }
type Stare = "asteapta" | "incarcare" | "afisat" | "eroare"

async function cereRecenzii(): Promise<Date> {
  const { Place } = await incarcaPlaces(API_KEY!)
  const loc = new Place({ id: PLACE_ID, requestedLanguage: "ro" })
  await loc.fetchFields({ fields: ["rating", "userRatingCount", "reviews", "googleMapsURI"] })
  const recenzii: Recenzie[] = (loc.reviews || [])
    .filter((r: any) => (r.text || "").trim())
    .slice(0, CARDURI)
    .map((r: any) => ({
      autor: r.authorAttribution?.displayName || "Client Google",
      autorUrl: r.authorAttribution?.uri || undefined,
      poza: r.authorAttribution?.photoURI || undefined,
      nota: Number(r.rating) || 0,
      text: String(r.text || "").trim(),
      cand: r.relativePublishTimeDescription || "",
      url: r.googleMapsURI || undefined,
    }))
  return { nota: loc.rating ?? undefined, total: loc.userRatingCount ?? undefined, url: loc.googleMapsURI, recenzii }
}

function Stele({ nota, mare }: { nota: number; mare?: boolean }) {
  const pline = Math.round(nota)
  return (
    <span className={mare ? "google-reviews__stars google-reviews__stars--lg" : "google-reviews__stars"} aria-label={`${nota} din 5 stele`}>
      {"★★★★★".slice(0, pline)}
      <span className="google-reviews__stars-off">{"★★★★★".slice(pline)}</span>
    </span>
  )
}

function Atribuire() {
  return <span className="google-reviews__gm" translate="no">Google Maps</span>
}

export function GoogleReviews() {
  const [stare, setStare] = useState<Stare>("asteapta")
  const [date, setDate] = useState<Date | null>(null)
  const sectiune = useRef<HTMLElement | null>(null)
  const configurat = Boolean(API_KEY && PLACE_ID)
  const profil = date?.url || googleMapsProfileUrl(PLACE_ID)

  useEffect(() => {
    if (!configurat || !sectiune.current) return
    const el = sectiune.current
    let pornit = false
    const porneste = () => {
      if (pornit) return
      pornit = true
      setStare("incarcare")
      cereRecenzii()
        .then((d) => { setDate(d); setStare(d.recenzii.length ? "afisat" : "eroare") })
        .catch(() => setStare("eroare"))
    }
    if (!("IntersectionObserver" in window)) { porneste(); return }
    const obs = new IntersectionObserver((intrari) => {
      if (intrari.some((i) => i.isIntersecting)) { obs.disconnect(); porneste() }
    }, { rootMargin: "300px 0px" })
    obs.observe(el)
    return () => obs.disconnect()
  }, [configurat])

  return (
    <section ref={sectiune} className="google-reviews" aria-labelledby="google-reviews-title">
      <div className="google-reviews__head">
        <div>
          <div className="google-reviews__eyebrow">Recenzii Google</div>
          <h2 id="google-reviews-title" className="google-reviews__title">Ce spun clienții despre Arc Rom Diamonds</h2>
          {date?.nota != null && date?.total != null ? (
            <div className="google-reviews__summary">
              <strong>{date.nota.toLocaleString("ro-RO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</strong>
              <Stele nota={date.nota} mare />
              <span>{date.total} recenzii pe <Atribuire /></span>
            </div>
          ) : null}
        </div>
        <a className="google-reviews__link" href={profil} target="_blank" rel="noopener noreferrer">
          Toate recenziile pe Google Maps →
        </a>
      </div>

      {configurat && stare === "incarcare" && (
        <div className="google-reviews__grid" aria-hidden="true">
          {Array.from({ length: CARDURI }).map((_, i) => <div key={i} className="google-reviews__card google-reviews__card--skel" />)}
        </div>
      )}

      {stare === "afisat" && date && (
        <ul className="google-reviews__grid">
          {date.recenzii.map((r, i) => (
            <li key={i} className="google-reviews__card">
              <div className="google-reviews__card-top">
                <Stele nota={r.nota} />
                <span className="google-reviews__when">{r.cand}</span>
              </div>
              <p className="google-reviews__text">{r.text}</p>
              <div className="google-reviews__author">
                {r.poza ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.poza} alt="" width={28} height={28} referrerPolicy="no-referrer" loading="lazy" />
                ) : (
                  <span className="google-reviews__avatar">{r.autor.slice(0, 1)}</span>
                )}
                {r.autorUrl ? (
                  <a href={r.autorUrl} target="_blank" rel="noopener noreferrer">{r.autor}</a>
                ) : (
                  <span>{r.autor}</span>
                )}
                {r.url ? (
                  <a className="google-reviews__src" href={r.url} target="_blank" rel="noopener noreferrer"><Atribuire /></a>
                ) : (
                  <span className="google-reviews__src"><Atribuire /></span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
