"use client"

// Cardul de recenzii Google din hero (macheta L2 aprobată de DC, 26.11.2026):
// sus stelele după nota agregată + nota, numărul și atribuirea „Google Maps";
// la mijloc avatarul autorului și textul recenziei; jos navigarea manuală și autorul.
// Datele vin live din Places (fetchFields) la fiecare afișare; nu se stochează și nu
// se filtrează: recenziile cu text, în ordinea întoarsă de Google (maximum 5).
// Fără dată și fără marcaj „verificat": nu verificăm recenziile.

import { useEffect, useId, useState } from "react"
import { incarcaPlaces } from "./places"

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
const PLACE_ID = process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID

export const RECENZII_CONFIGURATE = Boolean(API_KEY && PLACE_ID)

export type RecenzieHero = { autor: string; autorUrl?: string; poza?: string; text: string }
export type RecenziiHero = { nota: number; total: number; recenzii: RecenzieHero[] }

const TERMEN_MS = 8000

// Aruncă dacă Google nu răspunde în termen ori nu are ce arăta: apelantul revine la articol.
export async function cereRecenziiHero(): Promise<RecenziiHero> {
  const cerere = (async () => {
    const { Place } = await incarcaPlaces(API_KEY!)
    const loc = new Place({ id: PLACE_ID, requestedLanguage: "ro" })
    await loc.fetchFields({ fields: ["rating", "userRatingCount", "reviews"] })
    const recenzii: RecenzieHero[] = (loc.reviews || [])
      .filter((r: any) => String(r.text || "").trim())
      .slice(0, 5)
      .map((r: any) => ({
        autor: r.authorAttribution?.displayName || "Client Google",
        autorUrl: r.authorAttribution?.uri || undefined,
        poza: r.authorAttribution?.photoURI || undefined,
        text: String(r.text).trim().replace(/\s+/g, " "),
      }))
    const nota = Number(loc.rating)
    const total = Number(loc.userRatingCount)
    if (!recenzii.length || !(nota > 0) || !(total > 0)) throw new Error("fără recenzii de afișat")
    return { nota, total, recenzii }
  })()
  let timer: ReturnType<typeof setTimeout> | undefined
  const termen = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("Google nu a răspuns la timp")), TERMEN_MS)
  })
  try {
    return await Promise.race([cerere, termen])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

const STEA = "12 1.6 15.1 8.3 22.4 9 16.9 14 18.5 21.3 12 17.6 5.5 21.3 7.1 14 1.6 9 8.9 8.3"
const FATA_DREAPTA = "12 17.6 18.5 21.3 16.9 14 22.4 9 15.1 8.3 12 1.6"

// Stea fațetată: jumătatea stângă deschisă, dreapta închisă; `plin` = cât e umplută (0..1).
function Stea({ plin, id }: { plin: number; id: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={id}><rect x="0" y="0" width={24 * plin} height="24" /></clipPath>
      </defs>
      <polygon points={STEA} fill="#D9D6D0" />
      <polygon points={FATA_DREAPTA} fill="#C9C5BE" />
      <g clipPath={`url(#${id})`}>
        <polygon points={STEA} fill="#FFC21A" />
        <polygon points={FATA_DREAPTA} fill="#F0A800" />
      </g>
    </svg>
  )
}

function Stele({ nota, eticheta }: { nota: number; eticheta: string }) {
  const baza = useId().replace(/:/g, "")
  return (
    <span className="hrc-stars" role="img" aria-label={eticheta}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Stea key={i} id={`${baza}s${i}`} plin={Math.max(0, Math.min(1, nota - i))} />
      ))}
    </span>
  )
}

const CULORI_INITIALA = ["#0B7A75", "#8E5B2A", "#3D5A80", "#7A4B8C", "#A23B2A", "#4F6D3A"]

function Avatar({ r }: { r: RecenzieHero }) {
  const [stricata, setStricata] = useState(false)
  useEffect(() => setStricata(false), [r.poza])
  if (r.poza && !stricata) {
    return (
      <span className="hrc-av">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={r.poza} alt="" width={64} height={64} referrerPolicy="no-referrer" onError={() => setStricata(true)} />
      </span>
    )
  }
  let cod = 0
  for (let k = 0; k < r.autor.length; k++) cod += r.autor.charCodeAt(k)
  return (
    <span className="hrc-av" aria-hidden="true">
      <span className="hrc-initiala" style={{ background: CULORI_INITIALA[cod % CULORI_INITIALA.length] }}>
        {r.autor.trim().slice(0, 1).toUpperCase()}
      </span>
    </span>
  )
}

export function HeroReviewCard({ date }: { date: RecenziiHero }) {
  const [i, setI] = useState(0)
  const n = date.recenzii.length
  const r = date.recenzii[i % n]
  const nota = date.nota.toLocaleString("ro-RO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  // română: 1 recenzie, 2–19 recenzii, 20+ (și 101–119 nu) „de recenzii”
  const r100 = date.total % 100
  const recenziiText = date.total === 1 ? "recenzie" : (date.total >= 20 && (r100 === 0 || r100 >= 20)) ? "de recenzii" : "recenzii"

  return (
    <section className="hrc" aria-label="Recenzii Google">
      <div className="hrc-top">
        <Stele nota={date.nota} eticheta={`Nota ${nota} din 5`} />
        <span className="hrc-agg">
          <span><b>{nota}</b> {date.total} {recenziiText}</span>
          <span className="hrc-gm" translate="no">Google Maps</span>
        </span>
      </div>
      <div className="hrc-mid" aria-live="polite">
        <Avatar r={r} />
        <p className="hrc-q">„{r.text}”</p>
      </div>
      <div className="hrc-bot">
        {n > 1 ? (
          <div className="hrc-nav">
            <button type="button" aria-label="Recenzia anterioară" onClick={() => setI((x) => (x - 1 + n) % n)}>‹</button>
            <button type="button" aria-label="Recenzia următoare" onClick={() => setI((x) => (x + 1) % n)}>›</button>
          </div>
        ) : <span />}
        {r.autorUrl ? (
          <a className="hrc-n" href={r.autorUrl} target="_blank" rel="noopener noreferrer">{r.autor}</a>
        ) : (
          <span className="hrc-n">{r.autor}</span>
        )}
      </div>
    </section>
  )
}
