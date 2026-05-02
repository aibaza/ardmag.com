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
  if (state.analytics || state.marketing) {
    document.cookie = `${CONSENT_KEY}=${JSON.stringify(state)};max-age=${60 * 60 * 24 * 365};path=/;SameSite=Lax`
  } else {
    document.cookie = `${CONSENT_KEY}=;max-age=0;path=/`
  }
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
    <div role="dialog" aria-label="Setari cookie-uri" className="cookie-banner">
      <div className="cookie-banner__body">
        <p className="cookie-banner__title">Setari cookie-uri</p>
        <p className="cookie-banner__text">
          Folosim cookie-uri pentru a-ti imbunatati experienta pe site.
        </p>
        <a href="/cookie-policy" className="cookie-banner__link" style={{ display: "block", marginTop: 6, fontSize: 13 }}>
          Afla mai mult
        </a>

        {showCustomize && (
          <div className="cookie-banner__options">
            <label>
              <input type="checkbox" checked disabled />
              <span>Necesare (intotdeauna active)</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
              />
              <span>Analitice (Google Analytics 4)</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
              />
              <span>Marketing (Meta Pixel)</span>
            </label>
          </div>
        )}
      </div>

      <div className="cookie-banner__actions">
        <div className="cookie-banner__row-main">
          <button type="button" className="btn primary md" onClick={acceptAll}>
            Accepta toate
          </button>
          {showCustomize ? (
            <button type="button" className="btn secondary md" onClick={saveCustom}>
              Salveaza
            </button>
          ) : (
            <button type="button" className="btn secondary md" onClick={rejectAll}>
              Refuza
            </button>
          )}
        </div>
        {!showCustomize && (
          <div className="cookie-banner__row-secondary">
            <button
              type="button"
              className="btn ghost sm"
              onClick={() => setShowCustomize(true)}
            >
              Personalizeaza
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
