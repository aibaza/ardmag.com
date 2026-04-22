import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google"
import "styles/globals.css"

const plexSans = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-plex-sans",
  preload: true,
})

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-plex-mono",
  preload: false,
})
import { OrganizationJsonLd, WebSiteJsonLd } from "@lib/util/json-ld"
import { CookieConsentBanner } from "@components/cookie-consent/CookieConsent"
import { GoogleAnalytics } from "@components/cookie-consent/GoogleAnalytics"
import { MetaPixel } from "@components/cookie-consent/MetaPixel"
import { FastNav } from "@components/nav/FastNav"

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
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ARDMAG — Experți în piatră de peste 25 de ani" }],
  },
  twitter: { card: "summary_large_image", images: ["/og-image.png"] },
  robots: { index: true, follow: true },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="ro" data-mode="light" className={`${plexSans.variable} ${plexMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://pub-28d7a4f80d924560ae8c2fe111240e4a.r2.dev" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pub-28d7a4f80d924560ae8c2fe111240e4a.r2.dev" />
      </head>
      <body>
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        {props.children}
        <CookieConsentBanner />
        <GoogleAnalytics />
        <MetaPixel />
        <FastNav />
      </body>
    </html>
  )
}
