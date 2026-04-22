"use client"

import { useEffect } from "react"

export default function ProduseError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[produse] page error:", error)
  }, [error])

  return (
    <main className="page-inner" style={{ padding: "64px 24px", textAlign: "center" }}>
      <h1 style={{ fontSize: "1.25rem", marginBottom: "12px" }}>Nu am putut incarca catalogul</h1>
      <p style={{ color: "var(--fg-muted)", marginBottom: "24px" }}>
        Eroare temporara de server. Incearca din nou.
      </p>
      <button
        onClick={reset}
        style={{
          padding: "10px 24px",
          background: "var(--accent)",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "0.95rem",
        }}
      >
        Incearca din nou
      </button>
    </main>
  )
}
