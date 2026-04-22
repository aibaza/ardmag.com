import { sdk, staticSdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions, getCacheOptionsStatic } from "./cookies"

export const listCategories = async (
  query?: Record<string, any>,
  { staticCache = false }: { staticCache?: boolean } = {}
) => {
  const next = staticCache
    ? getCacheOptionsStatic("categories")
    : { ...(await getCacheOptions("categories")) }

  const limit = query?.limit || 100

  return (staticCache ? staticSdk : sdk).client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: {
          fields:
            "*category_children, *products, *parent_category, *parent_category.parent_category",
          limit,
          order: "rank",
          ...query,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories)
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  const handle = `${categoryHandle.join("/")}`

  const next = {
    ...(await getCacheOptions("categories")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        query: {
          fields: "*category_children, *products",
          handle,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories[0])
}
