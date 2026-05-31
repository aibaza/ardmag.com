const CANONICAL_PUBLIC_BASE_URL = "https://ardmag.ro"
const LEGACY_PUBLIC_HOSTS = new Set(["ardmag.surcod.ro", "ardmag.com", "www.ardmag.com"])

function normalizePublicBaseURL(url: string) {
  try {
    const parsed = new URL(url)

    if (LEGACY_PUBLIC_HOSTS.has(parsed.hostname)) {
      return CANONICAL_PUBLIC_BASE_URL
    }

    parsed.pathname = parsed.pathname.replace(/\/$/, "")
    parsed.search = ""
    parsed.hash = ""
    return parsed.toString().replace(/\/$/, "")
  } catch {
    return CANONICAL_PUBLIC_BASE_URL
  }
}

export const getBaseURL = () => {
  const configuredBaseURL =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.NODE_ENV === "development" ? "http://localhost:8000" : CANONICAL_PUBLIC_BASE_URL)

  return normalizePublicBaseURL(configuredBaseURL)
}

export const getPublicShareURL = (url: string) => {
  try {
    const parsed = new URL(url)
    const canonicalBaseURL = new URL(getBaseURL())

    if (LEGACY_PUBLIC_HOSTS.has(parsed.hostname)) {
      parsed.protocol = canonicalBaseURL.protocol
      parsed.host = canonicalBaseURL.host
    }

    return parsed.toString()
  } catch {
    return getBaseURL()
  }
}
