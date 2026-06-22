"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { getCookieConsent } from "./CookieConsent"

// Metricool web analytics. The official tracker is the be.js script + a
// beTracker.t({hash}) call -- the bare c3po.jpg image is only a no-JS fallback
// and does not populate Metricool's Web Analytics. Gated on analytics consent
// (GDPR/ePrivacy: opt-in for non-essential tracking) and re-fired on every SPA
// route change, since the App Router root layout does not reload on navigation.

const HASH = "bab49d7c00dc8f48c6e6eabd19ba8b6a"

export function MetricoolTracker() {
  const pathname = usePathname() ?? "/"
  const loaded = useRef(false)

  // Load be.js once, as soon as analytics consent is present.
  useEffect(() => {
    const tryLoad = () => {
      if (loaded.current) return
      if (!getCookieConsent()?.analytics) return
      loaded.current = true
      const head = document.getElementsByTagName("head")[0]
      const s = document.createElement("script")
      s.type = "text/javascript"
      s.async = true
      s.src = "https://tracker.metricool.com/resources/be.js"
      const onReady = () => {
        try {
          window.beTracker?.t({ hash: HASH })
        } catch {}
      }
      s.onload = onReady
      ;(s as unknown as { onreadystatechange: () => void }).onreadystatechange = onReady
      head.appendChild(s)
    }

    tryLoad()
    window.addEventListener("ardmag-consent-update", tryLoad)
    return () => window.removeEventListener("ardmag-consent-update", tryLoad)
  }, [])

  // Register a page hit on client-side navigation (once be.js is loaded).
  useEffect(() => {
    if (!getCookieConsent()?.analytics) return
    if (typeof window.beTracker?.t === "function") {
      window.beTracker.t({ hash: HASH })
    }
  }, [pathname])

  return null
}

declare global {
  interface Window {
    beTracker?: { t: (opts: { hash: string }) => void }
  }
}
