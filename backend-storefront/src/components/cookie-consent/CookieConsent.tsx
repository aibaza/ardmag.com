"use client"
import { useState, useEffect } from "react"

type ConsentState = {
  analytics: boolean
  marketing: boolean
}

const CONSENT_KEY = "ardmag-consent"

export function getCookieConsent(): ConsentState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    return raw ? (JSON.parse(raw) as ConsentState) : null
  } catch {
    return null
  }
}

function saveConsent(state: ConsentState) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify(state))
  document.cookie = `${CONSENT_KEY}=${JSON.stringify(state)};max-age=${60 * 60 * 24 * 365};path=/;SameSite=Lax`
  window.dispatchEvent(new CustomEvent("ardmag-consent-update", { detail: state }))
}

export function CookieConsentBanner() {
  const [show, setShow] = useState(false)
  const [showCustomize, setShowCustomize] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    if (!getCookieConsent()) {
      setShow(true)
    }
  }, [])

  if (!show) return null

  function acceptAll() {
    saveConsent({ analytics: true, marketing: true })
    setShow(false)
  }

  function rejectAll() {
    saveConsent({ analytics: false, marketing: false })
    setShow(false)
  }

  function saveCustom() {
    saveConsent({ analytics, marketing })
    setShow(false)
  }

  return (
    <div
      role="dialog"
      aria-label="Setari cookie-uri"
      style={{
        position: "fixed",
        bottom: 24,
        left: 24,
        right: 24,
        maxWidth: 520,
        background: "var(--surface-base, #fff)",
        border: "1px solid var(--rule, #e2e8f0)",
        borderRadius: "var(--r-lg, 12px)",
        padding: "24px 28px",
        boxShadow: "0 8px 32px rgba(0,0,0,.12)",
        zIndex: 9999,
        fontFamily: "var(--f-sans, system-ui)",
      }}
    >
      <p style={{ margin: "0 0 12px", fontWeight: 600 }}>Setari cookie-uri</p>
      <p style={{ margin: "0 0 16px", fontSize: 14, color: "var(--fg-muted, #64748b)", lineHeight: 1.6 }}>
        Folosim cookie-uri pentru a-ti imbunatati experienta pe site.{" "}
        <a
          href="/ro/cookie-policy"
          style={{ color: "var(--brand-600, #0284c7)", textDecoration: "underline" }}
        >
          Afla mai mult
        </a>
      </p>

      {showCustomize && (
        <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, cursor: "pointer" }}>
            <input type="checkbox" checked disabled style={{ width: 16, height: 16 }} />
            <span>Necesare (intotdeauna active)</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
              style={{ width: 16, height: 16 }}
            />
            <span>Analitice (Google Analytics 4)</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
              style={{ width: 16, height: 16 }}
            />
            <span>Marketing (Meta Pixel)</span>
          </label>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          className="btn primary"
          style={{ flex: 1, minWidth: 120 }}
          onClick={acceptAll}
        >
          Accepta toate
        </button>
        <button
          type="button"
          className="btn secondary"
          style={{ flex: 1, minWidth: 120 }}
          onClick={rejectAll}
        >
          Refuza
        </button>
        {showCustomize ? (
          <button
            type="button"
            className="btn secondary"
            style={{ flex: 1, minWidth: 120 }}
            onClick={saveCustom}
          >
            Salveaza
          </button>
        ) : (
          <button
            type="button"
            className="btn ghost"
            style={{ fontSize: 13 }}
            onClick={() => setShowCustomize(true)}
          >
            Personalizeaza
          </button>
        )}
      </div>
    </div>
  )
}
