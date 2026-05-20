"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
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
  viewMode?: "grid" | "list"
}

const STORAGE_PREFIX = "ardmag:catalog-state:"

function buildStorageKey(pathname: string, searchString: string): string {
  const params = new URLSearchParams(searchString)
  params.delete("page")
  const entries: Array<[string, string]> = []
  params.forEach((value, key) => entries.push([key, value]))
  entries.sort((a, b) => a[0].localeCompare(b[0]))
  const qs = new URLSearchParams(entries).toString()
  return `${STORAGE_PREFIX}${pathname}${qs ? "?" + qs : ""}`
}

interface SavedState {
  visibleCount: number
  scrollY: number
}

function readSaved(key: string): SavedState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SavedState
    if (typeof parsed.visibleCount !== "number" || typeof parsed.scrollY !== "number") return null
    return parsed
  } catch {
    return null
  }
}

export function InfiniteProductGrid({
  allFiltered,
  countryCode,
  pageSize = 24,
  viewMode = "grid",
}: InfiniteProductGridProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const storageKey = buildStorageKey(pathname, searchParams.toString())

  // Restore visibleCount on first mount (clamped to current item count).
  const [visibleCount, setVisibleCount] = useState(() => {
    const saved = readSaved(storageKey)
    if (!saved) return pageSize
    const clamped = Math.min(saved.visibleCount, allFiltered.length || saved.visibleCount)
    return clamped >= pageSize ? clamped : pageSize
  })

  const sentinelRef = useRef<HTMLDivElement>(null)
  const isSentinelVisible = useIntersection(sentinelRef, "0px")

  useEffect(() => {
    if (isSentinelVisible && visibleCount < allFiltered.length) {
      setVisibleCount((c) => c + pageSize)
    }
  }, [isSentinelVisible, visibleCount, allFiltered.length, pageSize])

  // Reset only when the storage key actually changes (i.e. filters/sort/perPage moved).
  // Plain back-navigation re-mounts the component with the same key, so we keep the restored count.
  const prevKey = useRef(storageKey)
  useEffect(() => {
    if (prevKey.current !== storageKey) {
      prevKey.current = storageKey
      setVisibleCount(pageSize)
    }
  }, [storageKey, pageSize])

  // Restore scroll position once, after the restored item count has rendered.
  // Two rAFs ensure layout (grid heights, image placeholders) settles before we scroll.
  const didRestoreScroll = useRef(false)
  useEffect(() => {
    if (didRestoreScroll.current) return
    didRestoreScroll.current = true
    const saved = readSaved(storageKey)
    if (!saved || saved.scrollY < 100) return
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, saved.scrollY)
      })
    })
  }, [storageKey])

  // Persist scroll on every scroll (throttled), and once at click time. Then freeze: Next.js
  // scrolls the window to 0 right after a Link click as part of its routing, and we must not
  // let that scroll-to-0 overwrite the position the user was at when they clicked.
  useEffect(() => {
    if (typeof window === "undefined") return
    let ticking = false
    let frozen = false
    const save = (y: number) => {
      try {
        sessionStorage.setItem(
          storageKey,
          JSON.stringify({ visibleCount, scrollY: y })
        )
      } catch {
        // sessionStorage may be unavailable (private mode, quota); silently ignore.
      }
    }
    const onScroll = () => {
      if (frozen || ticking) return
      ticking = true
      requestAnimationFrame(() => {
        save(window.scrollY)
        ticking = false
      })
    }
    const onClickCapture = (e: Event) => {
      const t = e.target
      if (!(t instanceof Element)) return
      const anchor = t.closest('a[href]')
      if (!anchor) return
      save(window.scrollY)
      frozen = true
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    document.addEventListener("click", onClickCapture, true)
    return () => {
      window.removeEventListener("scroll", onScroll)
      document.removeEventListener("click", onClickCapture, true)
    }
  }, [storageKey, visibleCount])

  if (allFiltered.length === 0) {
    return null
  }

  const visibleProducts = allFiltered.slice(0, visibleCount)
  const hasMore = visibleCount < allFiltered.length

  return (
    <div aria-live="polite">
      <ProductGrid variant="cat" products={visibleProducts} countryCode={countryCode} viewMode={viewMode} />
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
