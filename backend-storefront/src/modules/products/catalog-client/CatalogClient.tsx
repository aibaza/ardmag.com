"use client"

import { Suspense, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { CategoryToolbar } from "@modules/category/category-toolbar"
import { CategoryLayoutClient } from "@modules/category/category-layout-client"
import { InfiniteProductGrid } from "@modules/products/infinite-product-grid/InfiniteProductGrid"

type BadgeType = "promo" | "new" | "stock-low" | "custom"

interface ProductGridItem {
  id: string
  title: string
  sku: string
  brand: string
  brandHref: string
  image: string
  imageAlt: string
  href: string
  price: { now: string; was?: string }
  badges?: Array<{ type: BadgeType; label: string; dotVariant?: boolean }>
  specs?: string[]
  defaultVariantId: string | null
  hasMultipleRealVariants: boolean
}

export interface CatalogItem {
  card: ProductGridItem
  meta: {
    brandSlugs: string[]
    materialSlugs: string[]
    minPriceRon: number | null
    createdAtMs: number
  }
}

interface FilterGroup {
  type: string
  paramKey?: string
  options?: Array<{ value: string; label: string }>
  [key: string]: unknown
}

interface HelpCard {
  label: string
  description: string
  phone: string
  hours: string
}

interface Props {
  items: CatalogItem[]
  filterGroups: FilterGroup[]
  helpCard: HelpCard
  baseUrl: string
  countryCode: string
  sortOptions: string[]
  perPageOptions: number[]
  defaultPerPage: number
  emptyMessage?: string
}

const SORT_MAP: Record<string, "price_asc" | "price_desc" | "created_at"> = {
  "Preț ascendent": "price_asc",
  "Preț descendent": "price_desc",
  "Cele mai noi": "created_at",
}

export function CatalogClient({
  items,
  filterGroups,
  helpCard,
  baseUrl,
  countryCode,
  sortOptions,
  perPageOptions,
  defaultPerPage,
  emptyMessage = "Niciun produs nu corespunde filtrelor selectate.",
}: Props) {
  const searchParams = useSearchParams()

  const sortLabel = searchParams.get("sortBy") ?? "Relevanță"
  const perPageParam = parseInt(searchParams.get("perPage") ?? "", 10)
  const perPage = perPageOptions.includes(perPageParam) ? perPageParam : defaultPerPage
  const activeBrands = (searchParams.get("brand") ?? "").split(",").filter(Boolean)
  const activeMaterials = (searchParams.get("material") ?? "").split(",").filter(Boolean)
  const activePriceMin = parseInt(searchParams.get("priceMin") ?? "", 10)
  const activePriceMax = parseInt(searchParams.get("priceMax") ?? "", 10)

  const filteredCards = useMemo(() => {
    let result = items

    if (activeBrands.length > 0) {
      result = result.filter((it) =>
        it.meta.brandSlugs.some((b) => activeBrands.includes(b))
      )
    }
    if (activeMaterials.length > 0) {
      result = result.filter((it) =>
        it.meta.materialSlugs.some((m) => activeMaterials.includes(m))
      )
    }
    if (!isNaN(activePriceMin) || !isNaN(activePriceMax)) {
      result = result.filter((it) => {
        if (it.meta.minPriceRon === null) return false
        if (!isNaN(activePriceMin) && it.meta.minPriceRon < activePriceMin) return false
        if (!isNaN(activePriceMax) && it.meta.minPriceRon > activePriceMax) return false
        return true
      })
    }

    const sortBy = SORT_MAP[sortLabel]
    if (sortBy === "price_asc") {
      result = [...result].sort((a, b) => (a.meta.minPriceRon ?? Infinity) - (b.meta.minPriceRon ?? Infinity))
    } else if (sortBy === "price_desc") {
      result = [...result].sort((a, b) => (b.meta.minPriceRon ?? -Infinity) - (a.meta.minPriceRon ?? -Infinity))
    } else if (sortBy === "created_at") {
      result = [...result].sort((a, b) => b.meta.createdAtMs - a.meta.createdAtMs)
    }

    return result.map((it) => it.card)
  }, [
    items,
    activeBrands.join(","),
    activeMaterials.join(","),
    activePriceMin,
    activePriceMax,
    sortLabel,
  ])

  const totalFiltered = filteredCards.length

  const filterGroupsWithChecked = useMemo(() => {
    return filterGroups.map((g: any) => {
      if (g.type !== "checkboxes" || !g.options) return g
      const activeSet =
        g.paramKey === "brand"
          ? new Set(activeBrands)
          : g.paramKey === "material"
            ? new Set(activeMaterials)
            : new Set<string>()
      return {
        ...g,
        options: g.options.map((o: any) => ({
          ...o,
          checked: activeSet.has(o.value),
        })),
      }
    })
  }, [filterGroups, activeBrands.join(","), activeMaterials.join(",")])

  const activeFilters: Array<{ label: string; paramKey: "brand" | "material" | "price"; value?: string }> = []
  for (const b of activeBrands) {
    const brandGroup = filterGroups.find((g) => g.type === "checkboxes" && g.paramKey === "brand")
    const label =
      (brandGroup?.options?.find((o) => o.value === b)?.label) || b
    activeFilters.push({ label, paramKey: "brand", value: b })
  }
  for (const m of activeMaterials) {
    const materialGroup = filterGroups.find((g) => g.type === "checkboxes" && g.paramKey === "material")
    const label =
      (materialGroup?.options?.find((o) => o.value === m)?.label) || m
    activeFilters.push({ label, paramKey: "material", value: m })
  }
  if (!isNaN(activePriceMin) || !isNaN(activePriceMax)) {
    const minStr = !isNaN(activePriceMin) ? String(activePriceMin) : "-"
    const maxStr = !isNaN(activePriceMax) ? String(activePriceMax) : "-"
    activeFilters.push({ label: `Pret ${minStr}-${maxStr} Lei`, paramKey: "price" })
  }

  const filterActiveCount =
    activeBrands.length +
    activeMaterials.length +
    (!isNaN(activePriceMin) || !isNaN(activePriceMax) ? 1 : 0)

  return (
    <CategoryLayoutClient
      filterGroups={filterGroupsWithChecked as any}
      applyCount={filterActiveCount}
      helpCard={helpCard}
      baseUrl={baseUrl}
      activeCount={filterActiveCount}
      sortOptions={sortOptions}
      currentSort={sortLabel}
      activeFilters={activeFilters}
    >
      <Suspense fallback={<div className="cat-toolbar" />}>
        <CategoryToolbar
          count={totalFiltered}
          sortOptions={sortOptions}
          perPageOptions={perPageOptions}
          baseUrl={baseUrl}
          currentSort={sortLabel}
          currentPerPage={perPage}
        />
      </Suspense>
      {filteredCards.length === 0 ? (
        <div style={{ padding: "48px 0", textAlign: "center", color: "var(--fg-muted)" }}>
          {emptyMessage}
        </div>
      ) : (
        <InfiniteProductGrid allFiltered={filteredCards} countryCode={countryCode} />
      )}
    </CategoryLayoutClient>
  )
}
