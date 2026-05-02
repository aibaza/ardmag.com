"use client"

import { useEffect, useState } from "react"

function Spinner() {
  return (
    <div style={{
      width: 36, height: 36,
      border: "3px solid #e5e5e4",
      borderTopColor: "#e86c2c",
      borderRadius: "50%",
      animation: "ge-spin 700ms linear infinite",
    }}>
      <style>{`@keyframes ge-spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

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

    if (isChunkError) {
      window.location.reload()
      return
    }

    const isAbort = error.name === "AbortError"
    if (isAbort) { reset(); return }

    console.error("[global-error]", error)
    // Give reset a chance first; only show error UI after 1.5s if still failing
    const t = setTimeout(() => setShowError(true), 1500)
    const r = setTimeout(reset, 400)
    return () => { clearTimeout(t); clearTimeout(r) }
  }, [error, reset])

  if (!showError) {
    return (
      <html lang="ro">
        <body style={{ margin: 0, background: "#fafaf9", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
          <Spinner />
        </body>
      </html>
    )
  }

  return (
    <html lang="ro">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#fafaf9", color: "#1c1c1c" }}>
        <main style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: 12 }}>A aparut o eroare</h1>
          <p style={{ fontSize: "0.875rem", color: "#737373", marginBottom: 24 }}>
            Reincarca pagina sau revino mai tarziu.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: "10px 20px", background: "#e86c2c", color: "#fff", border: "none", borderRadius: 2, cursor: "pointer", fontSize: "0.875rem" }}
            >
              Reincarca
            </button>
            <button
              onClick={reset}
              style={{ padding: "10px 20px", background: "transparent", color: "#555", border: "1px solid #d4d4d4", borderRadius: 2, cursor: "pointer", fontSize: "0.875rem" }}
            >
              Incearca din nou
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
