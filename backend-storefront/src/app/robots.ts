import { MetadataRoute } from "next"
import { getBaseURL } from "@lib/util/env"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseURL()
  const isStaging = !baseUrl.includes("ardmag.com") || baseUrl.includes("surmont")

  if (isStaging) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    }
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account/", "/cart", "/checkout/", "/ro/order/", "/ro/account/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
