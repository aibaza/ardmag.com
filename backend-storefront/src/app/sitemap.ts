import { MetadataRoute } from "next"
import { getBaseURL } from "@lib/util/env"
import { listProducts } from "@lib/data/products"
import { listCategories } from "@lib/data/categories"
import { listArticles } from "@lib/blog"

// Sitemap generat STATIC la build, fail-closed (incident #32: 0 articole de blog
// in sitemap-ul live, pierdere SEO tacuta).
//
// Cauza incidentului: ruta era dinamica (listProducts fara publicFetch citea
// cookies()), deci sitemap-ul se randa la runtime pe Vercel, unde content/blog
// nu exista in bundle-ul functiei; fs.readdir esua, iar .catch(() => []) inghitea
// eroarea si livra un sitemap fara blog.
//
// Remediere:
// - force-static + publicFetch/staticCache (fara cookies) => generare la build,
//   unde content/blog exista garantat.
// - fara .catch fail-open: orice eroare de generare opreste build-ul vizibil.
// - garzi anti-gol: blogul, catalogul si categoriile sunt cunoscute ne-goale;
//   o lista goala inseamna generare rupta, nu continut lipsa.
export const dynamic = "force-static"

function assertNonEmpty<T>(items: T[], what: string): T[] {
  if (items.length === 0) {
    throw new Error(
      `sitemap: 0 ${what} la generare - fail-closed, nu livram sitemap incomplet (vezi incident #32)`
    )
  }
  return items
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseURL()
  const countryCode = "ro"

  const [categories, productsResult, articles] = await Promise.all([
    listCategories(undefined, { staticCache: true }),
    listProducts({
      countryCode,
      queryParams: { limit: 500, fields: "handle,updated_at" },
      publicFetch: true,
    }),
    listArticles(),
  ])

  assertNonEmpty(categories, "categorii")
  assertNonEmpty(productsResult.response.products, "produse")
  assertNonEmpty(articles, "articole de blog")

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
