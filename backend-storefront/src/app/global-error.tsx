"use client"

import { useEffect, useState } from "react"
import { SimpleLoader } from "@modules/@shared/components/disc-loader/SimpleLoader"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    const isChunkError =
      error.name === "ChunkLoadError" ||
      error.message?.includes("Loading chunk") ||
      error.message?.includes("Failed to fetch dynamically imported module") ||
      error.message?.includes("Importing a module script failed")

    if (isChunkError) { window.location.reload(); return }
    if (error.name === "AbortError") { reset(); return }
    if (error.message?.includes("input stream")) {
      const t = setTimeout(reset, 1200)
      return () => clearTimeout(t)
    }

    console.error("[global-error]", error)
    const t = setTimeout(() => setShowError(true), 1500)
    const r = setTimeout(reset, 400)
    return () => { clearTimeout(t); clearTimeout(r) }
  }, [error, reset])

  if (!showError) {
    return (
      <html lang="ro">
        <body style={{ margin: 0, background: "#fafaf9", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
          <SimpleLoader size={80} />
        </body>
      </html>
    )
  }

  return (
    <html lang="ro">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#fafaf9", color: "#1c1c1c" }}>
        <main style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px", textAlign: "center" }}>
          <SimpleLoader size={64} />
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: 12, marginTop: 24 }}>A aparut o eroare</h1>
          <p style={{ fontSize: "0.875rem", color: "#737373", marginBottom: 24 }}>
            Reincarca pagina sau revino mai tarziu.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => window.location.reload()} style={{ padding: "10px 20px", background: "#e86c2c", color: "#fff", border: "none", borderRadius: 2, cursor: "pointer", fontSize: "0.875rem" }}>
              Reincarca
            </button>
            <button onClick={reset} style={{ padding: "10px 20px", background: "transparent", color: "#555", border: "1px solid #d4d4d4", borderRadius: 2, cursor: "pointer", fontSize: "0.875rem" }}>
              Incearca din nou
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
