"use client"

import { useEffect, useRef, useState } from "react"
import { useIntersection } from "@lib/hooks/use-in-view"
import { ProductGrid } from "@modules/products/product-grid"

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

interface InfiniteProductGridProps {
  allFiltered: ProductGridItem[]
  countryCode: string
  pageSize?: number
}

export function InfiniteProductGrid({
  allFiltered,
  countryCode,
  pageSize = 24,
}: InfiniteProductGridProps) {
  const [visibleCount, setVisibleCount] = useState(pageSize)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const isSentinelVisible = useIntersection(sentinelRef, "0px")

  useEffect(() => {
    if (isSentinelVisible && visibleCount < allFiltered.length) {
      setVisibleCount((c) => c + pageSize)
    }
  }, [isSentinelVisible, visibleCount, allFiltered.length, pageSize])

  // Reset visible count when filtered list changes (filter/sort applied)
  useEffect(() => {
    setVisibleCount(pageSize)
  }, [allFiltered, pageSize])

  if (allFiltered.length === 0) {
    return null
  }

  const visibleProducts = allFiltered.slice(0, visibleCount)
  const hasMore = visibleCount < allFiltered.length

  return (
    <div aria-live="polite">
      <ProductGrid variant="cat" products={visibleProducts} countryCode={countryCode} />
      {hasMore && (
        <>
          <div ref={sentinelRef} style={{ height: 1 }} aria-hidden="true" />
          <div role="status" style={{ padding: "24px 0", textAlign: "center", color: "var(--fg-muted)", fontSize: "var(--text-sm)" }}>
            Se incarca...
          </div>
        </>
      )}
    </div>
  )
}
