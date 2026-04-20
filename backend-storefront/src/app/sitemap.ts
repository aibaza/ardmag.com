import { MetadataRoute } from "next"
import { getBaseURL } from "@lib/util/env"
import { listProducts } from "@lib/data/products"
import { listCategories } from "@lib/data/categories"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseURL()
  const countryCode = "ro"

  const [categories, productsResult] = await Promise.all([
    listCategories().catch(() => []),
    listProducts({
      countryCode,
      queryParams: { limit: 500, fields: "handle,updated_at" },
    }).catch(() => ({ response: { products: [], count: 0 }, nextPage: null })),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/ro`, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/ro/produse`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/ro/promotii`, changeFrequency: "daily", priority: 0.8 },
  ]

  const categoryRoutes: MetadataRoute.Sitemap = categories
    .filter((cat) => cat.handle)
    .map((cat) => ({
      url: `${baseUrl}/ro/categories/${cat.handle}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))

  const productRoutes: MetadataRoute.Sitemap = productsResult.response.products
    .filter((p) => p.handle)
    .map((p) => ({
      url: `${baseUrl}/ro/products/${p.handle}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))

  return [...staticRoutes, ...categoryRoutes, ...productRoutes]
}
