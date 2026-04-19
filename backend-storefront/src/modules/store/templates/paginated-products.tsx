import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { applyFilters } from "@lib/util/filter-options"
import ProductCard from "@modules/products/components/product-card"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
  activeFilters = {},
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
  activeFilters?: Record<string, string[]>
}) {
  const queryParams: PaginatedProductsParams = {
    limit: 12,
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const {
    response: { products: allProducts },
  } = await listProductsWithSort({
    page,
    queryParams,
    sortBy,
    countryCode,
  })

  const products = applyFilters(allProducts, activeFilters)
  const count = products.length
  const totalPages = Math.ceil(count / PRODUCT_LIMIT)
  const offset = (page - 1) * PRODUCT_LIMIT
  const pageProducts = products.slice(offset, offset + PRODUCT_LIMIT)

  return (
    <>
      <style>{`
        .store-product-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--s-6, 24px); }
        @media (max-width: 860px) { .store-product-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 520px) { .store-product-grid { grid-template-columns: 1fr; } }
      `}</style>
      {count === 0 ? (
        <p
          style={{
            fontFamily: "var(--f-mono)",
            fontSize: "13px",
            color: "var(--stone-500)",
            padding: "32px 0",
          }}
        >
          Niciun produs nu corespunde filtrelor selectate.
        </p>
      ) : (
        <div
          className="store-product-grid"
          style={{ display: "grid" }}
          data-testid="products-list"
        >
          {pageProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  )
}
