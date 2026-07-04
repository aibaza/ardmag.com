export const ATTRIBUTION_COOKIE = "ard_attr"
export const ATTRIBUTION_WINDOW_DAYS = 90
export const ATTRIBUTION_MAX_AGE = 60 * 60 * 24 * ATTRIBUTION_WINDOW_DAYS

export type AttributionVia = "fbclid" | "gclid" | "utm" | "referral" | "direct"

export type AttributionTouch = {
  source: string
  medium: string
  campaign?: string
  content?: string
  term?: string
  ts: string
  via: Exclude<AttributionVia, "direct">
}

export type AttributionCookie = {
  first_touch?: AttributionTouch
  last_touch?: AttributionTouch
  fbclid?: string
  gclid?: string
  landing_url?: string
  captured_at?: string
}

export type AttributionSnapshot = {
  resolved_source: string
  resolved_medium: string
  resolved_campaign: string
  resolved_via: AttributionVia
  first_touch?: AttributionTouch
  last_touch?: AttributionTouch
  fbclid?: string
  gclid?: string
  fbc?: string
  fbp?: string
  landing_url?: string
  captured_at?: string
  attribution_window_days: number
}

const OWN_DOMAINS = ["ardmag.ro", "ardmag.com"]

function clean(value?: string | null) {
  const trimmed = (value ?? "").trim()
  return trimmed || undefined
}

function externalReferrerHost(referrer?: string | null) {
  const value = clean(referrer)
  if (!value) return undefined

  try {
    const host = new URL(value).hostname.toLowerCase()
    return OWN_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`))
      ? undefined
      : host
  } catch {
    return undefined
  }
}

export function classifyAttributionTouch({
  url,
  referrer,
  now = new Date(),
}: {
  url: string | URL
  referrer?: string | null
  now?: Date
}): AttributionTouch | null {
  const parsedUrl = typeof url === "string" ? new URL(url) : url
  const params = parsedUrl.searchParams
  const ts = now.toISOString()
  const fbclid = clean(params.get("fbclid"))
  const gclid = clean(params.get("gclid"))
  const utmSource = clean(params.get("utm_source"))

  if (fbclid) {
    return {
      source: "facebook",
      medium: "cpc",
      campaign: clean(params.get("utm_campaign")),
      content: clean(params.get("utm_content")),
      term: clean(params.get("utm_term")),
      ts,
      via: "fbclid",
    }
  }

  if (gclid) {
    return {
      source: "google",
      medium: "cpc",
      campaign: clean(params.get("utm_campaign")),
      content: clean(params.get("utm_content")),
      term: clean(params.get("utm_term")),
      ts,
      via: "gclid",
    }
  }

  if (utmSource) {
    return {
      source: utmSource,
      medium: clean(params.get("utm_medium")) || "(unknown)",
      campaign: clean(params.get("utm_campaign")),
      content: clean(params.get("utm_content")),
      term: clean(params.get("utm_term")),
      ts,
      via: "utm",
    }
  }

  const referrerHost = externalReferrerHost(referrer)
  if (referrerHost) {
    return {
      source: referrerHost,
      medium: "referral",
      ts,
      via: "referral",
    }
  }

  return null
}

export function parseAttributionCookie(value?: string | null): AttributionCookie {
  if (!value) return {}

  try {
    const decoded = decodeURIComponent(value)
    const parsed = JSON.parse(decoded)
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

export function serializeAttributionCookie(value: AttributionCookie) {
  return encodeURIComponent(JSON.stringify(value))
}

export function buildFbc(fbclid: string, now = new Date()) {
  return `fb.1.${now.getTime()}.${fbclid}`
}

export function updateAttributionCookie({
  current,
  url,
  referrer,
  now = new Date(),
}: {
  current?: AttributionCookie
  url: string | URL
  referrer?: string | null
  now?: Date
}): AttributionCookie {
  const parsedUrl = typeof url === "string" ? new URL(url) : url
  const touch = classifyAttributionTouch({ url: parsedUrl, referrer, now })
  const existing = current ?? {}

  if (!touch) {
    return existing
  }

  const fbclid = clean(parsedUrl.searchParams.get("fbclid")) || existing.fbclid
  const gclid = clean(parsedUrl.searchParams.get("gclid")) || existing.gclid

  return {
    ...existing,
    first_touch: existing.first_touch || touch,
    last_touch: touch,
    fbclid,
    gclid,
    landing_url: existing.landing_url || parsedUrl.toString(),
    captured_at: existing.captured_at || now.toISOString(),
  }
}

export function resolveAttributionSnapshot({
  cookie,
  fbc,
  fbp,
  now = new Date(),
}: {
  cookie?: AttributionCookie
  fbc?: string
  fbp?: string
  now?: Date
}): AttributionSnapshot {
  const attr = cookie ?? {}
  const resolved = attr.last_touch || attr.first_touch
  const resolvedTs = resolved?.ts ? Date.parse(resolved.ts) : NaN
  const expired =
    Number.isFinite(resolvedTs) &&
    now.getTime() - resolvedTs > ATTRIBUTION_MAX_AGE * 1000

  if (expired) {
    return {
      resolved_source: "direct",
      resolved_medium: "none",
      resolved_campaign: "",
      resolved_via: "direct",
      fbc,
      fbp,
      attribution_window_days: ATTRIBUTION_WINDOW_DAYS,
    }
  }

  return {
    resolved_source: resolved?.source || "direct",
    resolved_medium: resolved?.medium || "none",
    resolved_campaign: resolved?.campaign || "",
    resolved_via: resolved?.via || "direct",
    first_touch: attr.first_touch,
    last_touch: attr.last_touch,
    fbclid: attr.fbclid,
    gclid: attr.gclid,
    fbc,
    fbp,
    landing_url: attr.landing_url,
    captured_at: attr.captured_at,
    attribution_window_days: ATTRIBUTION_WINDOW_DAYS,
  }
}
