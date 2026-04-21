"use client"
import { useEffect } from "react"
import Script from "next/script"
import { getCookieConsent } from "./CookieConsent"

const GA4_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID

export function GoogleAnalytics() {
  useEffect(() => {
    const check = () => {
      const consent = getCookieConsent()
      if (consent?.analytics && GA4_ID && typeof window.gtag !== "undefined") {
        window.gtag("consent", "update", {
          analytics_storage: "granted",
        })
      }
    }

    check()
    window.addEventListener("ardmag-consent-update", check)
    return () => window.removeEventListener("ardmag-consent-update", check)
  }, [])

  if (!GA4_ID) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('consent', 'default', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
          });
          gtag('config', '${GA4_ID}', { send_page_view: true });
        `}
      </Script>
    </>
  )
}

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    dataLayer: unknown[]
  }
}
