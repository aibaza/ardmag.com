import { MetadataRoute } from "next"
import { getBaseURL } from "@lib/util/env"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseURL()
  const PRODUCTION_HOSTS = ["ardmag.com", "magazin.ardmag.com", "ardmag.surcod.ro"]
  const isStaging = !PRODUCTION_HOSTS.some((h) => baseUrl.includes(h))

  if (isStaging) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    }
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account/", "/cart", "/checkout/", "/order/", "/account/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
