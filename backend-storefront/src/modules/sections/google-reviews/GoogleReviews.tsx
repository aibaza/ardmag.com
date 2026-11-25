"use client"

import { createElement, useEffect, useRef, useState } from "react"
import { googleMapsProfileUrl } from "./google-maps-link"

// Recenziile Google Maps ale locației din Cluj, afișate prin componenta oficială Google
// (Places UI Kit). Conținutul vine direct de la Google la afișare; site-ul nu copiază
// și nu filtrează recenziile. Scriptul Google se încarcă numai după apăsarea butonului.
// Fără cheie sau Place ID, ori dacă Google refuză, rămâne linkul spre profil.

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
const PLACE_ID = process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID

type Stare = "inchis" | "incarcare" | "afisat" | "eroare"

let scriptPromise: Promise<void> | null = null

function incarcaPlaces(key: string): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("fără browser"))
  const w = window as any
  if (w.google?.maps?.importLibrary) return w.google.maps.importLibrary("places").then(() => undefined)
  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      const cb = "__ardmagPlacesReady"
      w[cb] = () => resolve()
      const s = document.createElement("script")
      s.src = `https://maps.googleapis.com/maps/api/js?${new URLSearchParams({
        key, v: "weekly", libraries: "places", language: "ro", region: "RO", loading: "async", callback: cb,
      }).toString()}`
      s.async = true
      s.onerror = () => { scriptPromise = null; reject(new Error("scriptul Google nu s-a încărcat")) }
      document.head.appendChild(s)
    }).then(() => w.google.maps.importLibrary("places"))
  }
  return scriptPromise
}

export function GoogleReviews() {
  const [stare, setStare] = useState<Stare>("inchis")
  const gazda = useRef<HTMLElement | null>(null)
  const profil = googleMapsProfileUrl(PLACE_ID)
  const configurat = Boolean(API_KEY && PLACE_ID)

  useEffect(() => {
    if (stare !== "afisat" || !gazda.current) return
    const el = gazda.current
    const peEroare = () => setStare("eroare")
    el.addEventListener("gmp-error", peEroare)
    return () => el.removeEventListener("gmp-error", peEroare)
  }, [stare])

  const arata = async () => {
    if (!API_KEY) return
    setStare("incarcare")
    try {
      await incarcaPlaces(API_KEY)
      setStare("afisat")
    } catch {
      setStare("eroare")
    }
  }

  return (
    <section className="google-reviews" aria-labelledby="google-reviews-title">
      <div className="google-reviews__head">
        <div>
          <div className="google-reviews__eyebrow">Recenzii Google Maps</div>
          <h2 id="google-reviews-title" className="google-reviews__title">Ce spun clienții despre Arc Rom Diamonds</h2>
          <p className="google-reviews__note">
            Recenziile sunt despre firma și magazinul nostru din Cluj-Napoca. Le afișează Google, așa cum apar pe profil; noi nu le alegem.
          </p>
        </div>
        <a className="google-reviews__link" href={profil} target="_blank" rel="noopener noreferrer">
          Vezi toate recenziile pe Google Maps →
        </a>
      </div>

      {configurat && stare !== "afisat" && (
        <button type="button" className="google-reviews__btn" onClick={arata} disabled={stare === "incarcare"}>
          {stare === "incarcare" ? "Se încarcă recenziile…" : "Arată recenziile aici"}
        </button>
      )}
      {stare === "eroare" && (
        <p className="google-reviews__note">Recenziile nu s-au putut încărca acum. Le găsești pe Google Maps, la linkul de mai sus.</p>
      )}
      {stare === "afisat" && PLACE_ID &&
        createElement(
          "gmp-place-details",
          { ref: gazda, class: "google-reviews__widget" },
          createElement("gmp-place-details-place-request", { place: PLACE_ID }),
          createElement("gmp-place-rating"),
          createElement("gmp-place-reviews"),
          createElement("gmp-place-attribution", { "light-scheme-color": "gray", "dark-scheme-color": "white" })
        )}
    </section>
  )
}
