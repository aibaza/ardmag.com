"use client"
import { useEffect, useRef, useState } from "react"
import Script from "next/script"
import { usePathname } from "next/navigation"
import { getCookieConsent } from "./CookieConsent"
import { trackingLoadState } from "./consent-loading"

const GA4_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID

function getContentGroup(pathname: string) {
  if (pathname.includes("/products/")) return "product"
  if (pathname.includes("/categories/") || pathname.includes("/collections/")) return "category"
  if (pathname.includes("/blog/")) return "article"
  if (pathname.includes("/cart")) return "cart"
  if (pathname.includes("/checkout")) return "checkout"
  if (pathname === "/" || /^\/[a-z]{2}$/.test(pathname)) return "home"
  return "page"
}

export function GoogleAnalytics() {
  const pathname = usePathname() ?? "/"
  const lastTrackedUrl = useRef<string | null>(null)
  const [consentState, setConsentState] = useState({ analytics: false, marketing: false })

  useEffect(() => {
    const check = () => {
      setConsentState(trackingLoadState(getCookieConsent()))
    }

    check()
    window.addEventListener("ardmag-consent-update", check)
    return () => window.removeEventListener("ardmag-consent-update", check)
  }, [])

  useEffect(() => {
    if (!consentState.analytics) return
    if (!GA4_ID && !GTM_ID) return
    if (typeof window === "undefined") return

    const pagePath = `${pathname}${window.location.search}`
    const pageLocation = `${window.location.origin}${pagePath}`

    if (lastTrackedUrl.current === pageLocation) return
    lastTrackedUrl.current = pageLocation

    const eventPayload = {
      event: "page_view",
      page_path: pagePath,
      page_location: pageLocation,
      page_title: document.title,
      content_group: getContentGroup(pathname),
    }

    window.dataLayer = window.dataLayer || []
    window.dataLayer.push(eventPayload)

    if (!GTM_ID && typeof window.gtag !== "undefined") {
      window.gtag("event", "page_view", eventPayload)
    }
  }, [consentState.analytics, pathname])

  if ((!GA4_ID && !GTM_ID) || !consentState.analytics) return null

  return (
    <>
      <Script id="ga-consent-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            analytics_storage: 'granted',
            ad_storage: '${consentState.marketing ? "granted" : "denied"}',
            ad_user_data: '${consentState.marketing ? "granted" : "denied"}',
            ad_personalization: '${consentState.marketing ? "granted" : "denied"}'
          });
          gtag('set', 'ads_data_redaction', true);
          ${GA4_ID && !GTM_ID ? `gtag('js', new Date()); gtag('config', '${GA4_ID}', { send_page_view: false });` : ""}
        `}
      </Script>
      {GTM_ID ? (
        <Script id="gtm-loader" strategy="lazyOnload">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `}
        </Script>
      ) : (
        GA4_ID && <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} strategy="lazyOnload" />
      )}
    </>
  )
}

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    dataLayer: unknown[]
  }
}
