"use client"

import { useRouter, useSearchParams } from "next/navigation"

interface ActiveFilter {
  label: string
  paramKey: "brand" | "material" | "price"
  value?: string
}

interface MobileFilterBarProps {
  activeCount: number
  sortOptions: string[]
  currentSort: string
  baseUrl: string
  activeFilters: ActiveFilter[]
  onOpenFilters: () => void
}

export function MobileFilterBar({
  activeCount,
  sortOptions,
  currentSort,
  baseUrl,
  activeFilters,
  onOpenFilters,
}: MobileFilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString())
    const value = e.target.value
    if (value === "Relevanță") params.delete("sortBy")
    else params.set("sortBy", value)
    params.delete("page")
    const qs = params.toString()
    router.push(qs ? `${baseUrl}?${qs}` : baseUrl)
  }

  function removeFilter(filter: ActiveFilter) {
    const params = new URLSearchParams(searchParams.toString())
    if (filter.paramKey === "price") {
      params.delete("priceMin")
      params.delete("priceMax")
    } else {
      const current = (params.get(filter.paramKey) ?? "").split(",").filter(Boolean)
      const next = current.filter((v) => v !== filter.value)
      if (next.length === 0) params.delete(filter.paramKey)
      else params.set(filter.paramKey, next.join(","))
    }
    params.delete("page")
    const qs = params.toString()
    router.push(qs ? `${baseUrl}?${qs}` : baseUrl)
  }

  function clearAllFilters() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("brand")
    params.delete("material")
    params.delete("priceMin")
    params.delete("priceMax")
    params.delete("page")
    const qs = params.toString()
    router.push(qs ? `${baseUrl}?${qs}` : baseUrl)
  }

  return (
    <>
      <div className="mobile-filter-bar">
        <button className="btn secondary md" onClick={onOpenFilters}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 4h12M4 8h8M6 12h4" />
          </svg>
          Filtre ({activeCount} active)
        </button>
        <select
          className="btn secondary md"
          style={{ appearance: 'auto', padding: '0 12px' }}
          value={currentSort}
          onChange={handleSortChange}
        >
          {sortOptions.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>
      {activeFilters.length > 0 && (
        <div className="active-filters">
          <span className="lbl">Filtre active:</span>
          {activeFilters.map((f, i) => (
            <span key={i} className="chip">
              {f.label}{' '}
              <button
                type="button"
                className="x"
                aria-label="sterge"
                onClick={() => removeFilter(f)}
              >
                &times;
              </button>
            </span>
          ))}
          <button type="button" className="chip clear" onClick={clearAllFilters}>
            Sterge tot
          </button>
        </div>
      )}
    </>
  )
}
