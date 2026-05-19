import { MetadataRoute } from "next"
import { getBaseURL } from "@lib/util/env"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseURL()
  // ardmag.com pastrat pentru tranzitia 308 redirect (Google trebuie sa vada autoritatea pe ambele).
  // magazin.ardmag.com scos -- subdomain neutilizat (leftover plan lansare staging).
  const PRODUCTION_HOSTS = ["ardmag.ro", "ardmag.com", "ardmag.surcod.ro"]
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
