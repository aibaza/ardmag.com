"use client"
import { useEffect } from "react"
import Script from "next/script"
import { getCookieConsent } from "./CookieConsent"

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

export function MetaPixel() {
  useEffect(() => {
    const check = () => {
      const consent = getCookieConsent()
      if (consent?.marketing && PIXEL_ID && typeof window.fbq !== "undefined") {
        window.fbq("consent", "grant")
      }
    }

    check()
    window.addEventListener("ardmag-consent-update", check)
    return () => window.removeEventListener("ardmag-consent-update", check)
  }, [])

  if (!PIXEL_ID) return null

  return (
    <>
      <Script id="meta-pixel-init" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('consent', 'revoke');
          fbq('init', '${PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
    </>
  )
}

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void
    _fbq: unknown
  }
}
