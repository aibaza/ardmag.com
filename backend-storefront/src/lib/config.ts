import { getLocaleHeader } from "@lib/util/get-locale-header"
import Medusa, { FetchArgs, FetchInput } from "@medusajs/js-sdk"

import { medusaBackendUrl, medusaPublishableKey } from "@lib/util/medusa-env"

export const sdk = new Medusa({
  baseUrl: medusaBackendUrl,
  debug: process.env.NODE_ENV === "development",
  publishableKey: medusaPublishableKey,
})

/** Static SDK - no locale header, no cookies() read. Use for ISR/static pages. */
export const staticSdk = new Medusa({
  baseUrl: medusaBackendUrl,
  debug: false,
  publishableKey: medusaPublishableKey,
})

const originalFetch = sdk.client.fetch.bind(sdk.client)

sdk.client.fetch = async <T>(
  input: FetchInput,
  init?: FetchArgs
): Promise<T> => {
  const headers = init?.headers ?? {}
  let localeHeader: Record<string, string | null> | undefined
  try {
    localeHeader = await getLocaleHeader()
    headers["x-medusa-locale"] ??= localeHeader["x-medusa-locale"]
  } catch {}

  const newHeaders = {
    ...localeHeader,
    ...headers,
  }
  init = {
    ...init,
    headers: newHeaders,
  }
  return originalFetch(input, init)
}
