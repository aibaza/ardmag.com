import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "ro"

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: 0,
}

async function getRegionMap(cacheId: string) {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (!BACKEND_URL) {
    throw new Error(
      "Middleware.ts: Error fetching regions. Did you set up regions in your Medusa Admin and define a MEDUSA_BACKEND_URL environment variable?"
    )
  }

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    const { regions } = await fetch(`${BACKEND_URL}/store/regions`, {
      headers: { "x-publishable-api-key": PUBLISHABLE_API_KEY! },
      next: { revalidate: 3600, tags: [`regions-${cacheId}`] },
      cache: "force-cache",
    }).then(async (response) => {
      const json = await response.json()
      if (!response.ok) throw new Error(json.message)
      return json
    })

    if (!regions?.length) {
      throw new Error("No regions found. Please set up regions in your Medusa Admin.")
    }

    regions.forEach((region: HttpTypes.StoreRegion) => {
      region.countries?.forEach((c) => {
        regionMapCache.regionMap.set(c.iso_2 ?? "", region)
      })
    })

    regionMapCache.regionMapUpdated = Date.now()
  }

  return regionMapCache.regionMap
}

async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion | number>
) {
  try {
    const vercelCountryCode = request.headers.get("x-vercel-ip-country")?.toLowerCase()
    const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase()

    if (urlCountryCode && regionMap.has(urlCountryCode)) return urlCountryCode
    if (vercelCountryCode && regionMap.has(vercelCountryCode)) return vercelCountryCode
    if (regionMap.has(DEFAULT_REGION)) return DEFAULT_REGION
    return regionMap.keys().next().value
  } catch {
    if (process.env.NODE_ENV === "development") {
      console.error("Middleware.ts: Error getting country code.")
    }
  }
}

const MAINTENANCE_HTML = `<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ardmag.ro - mentenanta programata</title><style>body{font-family:system-ui,-apple-system,sans-serif;background:#0f1115;color:#e6e8eb;display:grid;place-items:center;min-height:100vh;margin:0;padding:24px;text-align:center}main{max-width:480px}h1{font-size:24px;margin:0 0 12px;font-weight:600}p{margin:8px 0;color:#a3a8b3;line-height:1.5}.logo{font-size:32px;font-weight:700;letter-spacing:.5px;margin-bottom:24px;color:#e6e8eb}</style></head><body><main><div class="logo">ARDMAG</div><h1>Mentenanta programata</h1><p>Aducem cateva imbunatatiri pe site. Revenim in cateva minute.</p><p style="margin-top:24px;font-size:14px">Pentru urgente: <a href="tel:+40722155441" style="color:#e6e8eb">+40 722 155 441</a></p></main></body></html>`

export async function middleware(request: NextRequest) {
  if (process.env.MAINTENANCE_MODE === "on") {
    const pathname = request.nextUrl.pathname
    // Allow static asset requests through so the 503 page itself (no assets needed)
    // and any future status page can load. Block everything else.
    if (!pathname.includes(".")) {
      return new NextResponse(MAINTENANCE_HTML, {
        status: 503,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
          "Retry-After": "300",
        },
      })
    }
  }

  const cacheIdCookie = request.cookies.get("_medusa_cache_id")
  const cacheId = cacheIdCookie?.value || crypto.randomUUID()

  const regionMap = await getRegionMap(cacheId)
  const countryCode = regionMap && (await getCountryCode(request, regionMap))

  if (!countryCode) {
    return new NextResponse(
      "No valid regions configured. Please set up regions with countries in your Medusa Admin.",
      { status: 500 }
    )
  }

  const pathname = request.nextUrl.pathname

  // pass through static file requests (by extension) - e.g. _next/image origin fetches
  if (pathname.includes(".")) {
    return NextResponse.next()
  }

  // Routes that need per-user cache cookie (cart, account, checkout, orders)
  const isUserRoute = /\/(cart|account|checkout|order)(\/|$)/.test(pathname)

  const urlFirstSegment = pathname.split("/")[1]?.toLowerCase()
  const urlHasCountryCode = urlFirstSegment === countryCode

  // URL already has a country code prefix:
  // - if it's the default region, redirect to clean URL without prefix (301)
  //   EXCEPT for non-GET requests (Server Actions are POSTs to the current URL;
  //   a 301 would convert them to GET and silently drop the action)
  // - if it's another region, pass through normally
  if (urlHasCountryCode) {
    if (countryCode === DEFAULT_REGION && request.method === "GET") {
      const cleanPath = pathname.replace(`/${countryCode}`, "") || "/"
      const cleanUrl = `${request.nextUrl.origin}${cleanPath}${request.nextUrl.search}`
      return NextResponse.redirect(cleanUrl, 301)
    }

    const response = NextResponse.next()
    if (!cacheIdCookie && isUserRoute) {
      response.cookies.set("_medusa_cache_id", cacheId, { maxAge: 60 * 60 * 24 })
    }
    return response
  }

  // No country code in URL - rewrite internally to /{countryCode}/path so Next.js
  // routing works, while keeping the clean URL visible to the user.
  const rewritePath = pathname === "/" ? `/${countryCode}` : `/${countryCode}${pathname}`
  const rewriteUrl = new URL(`${rewritePath}${request.nextUrl.search}`, request.url)
  const response = NextResponse.rewrite(rewriteUrl)

  if (!cacheIdCookie && isUserRoute) {
    response.cookies.set("_medusa_cache_id", cacheId, { maxAge: 60 * 60 * 24 })
  }

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
