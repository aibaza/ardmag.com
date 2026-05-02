"use client"

import { useEffect, useRef, useState } from "react"
import { DiscLoader } from "@modules/@shared/components/disc-loader/DiscLoader"

export default function ProduseError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const retries = useRef(0)
  const [exhausted, setExhausted] = useState(false)

  useEffect(() => {
    if (error.name === "AbortError") { reset(); return }

    console.error("[produse] page error:", error)

    if (retries.current < 3) {
      retries.current += 1
      const t = setTimeout(reset, 800)
      return () => clearTimeout(t)
    }

    setExhausted(true)
  }, [error, reset])

  if (exhausted) {
    return (
      <main className="page-inner" style={{ padding: "64px 24px", textAlign: "center" }}>
        <h1 style={{ fontSize: "1.25rem", marginBottom: "12px" }}>Nu am putut incarca catalogul</h1>
        <p style={{ color: "var(--fg-muted)", marginBottom: "24px", fontSize: "0.875rem" }}>
          Eroare temporara de server. Incearca din nou.
        </p>
        <button onClick={() => { retries.current = 0; setExhausted(false); reset() }} className="btn primary md">
          Incearca din nou
        </button>
      </main>
    )
  }

  return (
    <main className="page-inner" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "40vh" }}>
      <DiscLoader size={72} />
    </main>
  )
}
