import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"
import { OrganizationJsonLd, WebSiteJsonLd } from "@lib/util/json-ld"
import { CookieConsentBanner } from "@components/cookie-consent/CookieConsent"
import { GoogleAnalytics } from "@components/cookie-consent/GoogleAnalytics"
import { MetaPixel } from "@components/cookie-consent/MetaPixel"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: "ARDMAG — Scule si consumabile pentru prelucrarea pietrei",
    template: "%s · ARDMAG",
  },
  description: "Distribuitor autorizat Tenax in Romania. Scule diamantate, mastici, abrazive si consumabile pentru ateliere de piatra naturala. 25 de ani. La milimetru.",
  applicationName: "ARDMAG",
  keywords: ["scule piatra naturala", "Tenax Romania", "discuri diamantate", "mastic piatra", "ARDMAG", "Arcrom Diamonds"],
  authors: [{ name: "Arcrom Diamonds" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "ro_RO",
    siteName: "ARDMAG",
    url: getBaseURL(),
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="ro" data-mode="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,300..700;1,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        {props.children}
        <CookieConsentBanner />
        <GoogleAnalytics />
        <MetaPixel />
      </body>
    </html>
  )
}
