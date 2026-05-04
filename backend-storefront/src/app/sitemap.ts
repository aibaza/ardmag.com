import { MetadataRoute } from "next"
import { getBaseURL } from "@lib/util/env"
import { listProducts } from "@lib/data/products"
import { listCategories } from "@lib/data/categories"
import { listArticles } from "@lib/blog"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseURL()
  const countryCode = "ro"

  const [categories, productsResult, articles] = await Promise.all([
    listCategories().catch(() => []),
    listProducts({
      countryCode,
      queryParams: { limit: 500, fields: "handle,updated_at" },
    }).catch(() => ({ response: { products: [], count: 0 }, nextPage: null })),
    listArticles().catch(() => []),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/produse`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/promotii`, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/blog`, changeFrequency: "weekly", priority: 0.7 },
  ]

  const categoryRoutes: MetadataRoute.Sitemap = categories
    .filter((cat) => cat.handle)
    .map((cat) => ({
      url: `${baseUrl}/categories/${cat.handle}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))

  const productRoutes: MetadataRoute.Sitemap = productsResult.response.products
    .filter((p) => p.handle)
    .map((p) => ({
      url: `${baseUrl}/products/${p.handle}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))

  const blogRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${baseUrl}/blog/${a.slug}`,
    lastModified: a.updatedAt ? new Date(a.updatedAt) : new Date(a.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...blogRoutes]
}
