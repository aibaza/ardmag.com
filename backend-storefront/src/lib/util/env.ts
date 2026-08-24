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
  // Deployment-urile de preview (validare cu clientul, tools/preview/preview-deploy.sh)
  // trebuie sa se auto-referentieze: og:image, canonical si JSON-LD pleaca de la baza
  // asta. Fara ea cad pe domeniul de productie, unde un articol inca nevalidat nu
  // exista - si linkul trimis clientului ajunge cu previzualizare rupta (404 pe
  // og.png). Cheie separata de NEXT_PUBLIC_BASE_URL pentru ca aceea e definita
  // "sensitive" la nivel de proiect in Vercel si nu poate fi suprascrisa per deploy.
  // Build-urile de productie nu o primesc niciodata, deci productia e neatinsa.
  const previewBaseURL = process.env.NEXT_PUBLIC_PREVIEW_BASE_URL
  if (previewBaseURL) {
    return normalizePublicBaseURL(previewBaseURL)
  }

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
