import "server-only"
import { cookies as nextCookies } from "next/headers"
import {
  ATTRIBUTION_COOKIE,
  parseAttributionCookie,
  resolveAttributionSnapshot,
} from "@lib/attribution/attribution"

export const getAuthHeaders = async (): Promise<
  { authorization: string } | {}
> => {
  try {
    const cookies = await nextCookies()
    const token = cookies.get("_medusa_jwt")?.value

    if (!token) {
      return {}
    }

    return { authorization: `Bearer ${token}` }
  } catch {
    return {}
  }
}

export const getCacheTag = async (tag: string): Promise<string> => {
  try {
    const cookies = await nextCookies()
    const cacheId = cookies.get("_medusa_cache_id")?.value

    if (!cacheId) {
      return ""
    }

    return `${tag}-${cacheId}`
  } catch (error) {
    return ""
  }
}

export const getCacheOptions = async (
  tag: string
): Promise<{ tags: string[] } | {}> => {
  if (typeof window !== "undefined") {
    return {}
  }

  const cacheTag = await getCacheTag(tag)

  // Always include the global tag so admin-triggered revalidateTag(tag)
  // can invalidate caches even for anonymous requests (no _medusa_cache_id cookie).
  // For logged-in users the per-user tag still allows scoped invalidation.
  if (!cacheTag) {
    return { tags: [tag] }
  }

  return { tags: [cacheTag, tag] }
}

/** Static variant - no cookies() read, uses a global tag for CDN/ISR cache. */
export const getCacheOptionsStatic = (tag: string): { tags: string[] } => ({
  tags: [tag],
})

export const setAuthToken = async (token: string) => {
  const cookies = await nextCookies()
  cookies.set("_medusa_jwt", token, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

export const removeAuthToken = async () => {
  const cookies = await nextCookies()
  cookies.set("_medusa_jwt", "", {
    maxAge: -1,
  })
}

export const getCartId = async () => {
  const cookies = await nextCookies()
  return cookies.get("_medusa_cart_id")?.value
}

export const setCartId = async (cartId: string) => {
  const cookies = await nextCookies()
  cookies.set("_medusa_cart_id", cartId, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

export const removeCartId = async () => {
  const cookies = await nextCookies()
  cookies.set("_medusa_cart_id", "", {
    maxAge: -1,
  })
}

export const getAttributionSnapshot = async () => {
  try {
    const cookies = await nextCookies()
    const attr = parseAttributionCookie(cookies.get(ATTRIBUTION_COOKIE)?.value)
    return resolveAttributionSnapshot({
      cookie: attr,
      fbc: cookies.get("_fbc")?.value,
      fbp: cookies.get("_fbp")?.value,
    })
  } catch {
    return resolveAttributionSnapshot({})
  }
}
