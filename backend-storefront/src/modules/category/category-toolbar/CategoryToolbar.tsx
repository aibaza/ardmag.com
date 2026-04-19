"use client"

import { useRouter, useSearchParams } from 'next/navigation'

const DEFAULT_SORT = "Relevanță"
const DEFAULT_PER_PAGE = 20

interface CategoryToolbarProps {
  count: number
  sortOptions: string[]
  perPageOptions: number[]
  baseUrl?: string
  currentSort?: string
  currentPerPage?: number
}

export function CategoryToolbar({
  count,
  sortOptions,
  perPageOptions,
  baseUrl,
  currentSort = DEFAULT_SORT,
  currentPerPage = DEFAULT_PER_PAGE,
}: CategoryToolbarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function buildUrl(key: string, value: string): string {
    const params = new URLSearchParams(searchParams.toString())
    if (
      (key === "sortBy" && value === DEFAULT_SORT) ||
      (key === "perPage" && value === String(DEFAULT_PER_PAGE))
    ) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete("page")
    const qs = params.toString()
    return qs ? `${baseUrl}?${qs}` : (baseUrl ?? "")
  }

  function handleSortChange(value: string) {
    if (!baseUrl) return
    router.push(buildUrl("sortBy", value))
  }

  function handlePerPageChange(value: string) {
    if (!baseUrl) return
    router.push(buildUrl("perPage", value))
  }

  return (
    <div className="cat-toolbar">
      <div className="count"><strong>{count}</strong> produse</div>
      <div className="spacer"></div>
      <div className="tbl"><label htmlFor="sort">Sortare:</label>
        <select
          id="sort"
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value)}
        >
          {sortOptions.map((o, i) => <option key={i} value={o}>{o}</option>)}
        </select>
      </div>
      <div className="tbl"><label htmlFor="per-page">Pe pagină:</label>
        <select
          id="per-page"
          value={String(currentPerPage)}
          onChange={(e) => handlePerPageChange(e.target.value)}
        >
          {perPageOptions.map((o, i) => <option key={i} value={String(o)}>{o}</option>)}
        </select>
      </div>
      <div className="view-toggle" role="tablist">
        <button className="on" aria-label="grid"><svg viewBox="0 0 16 16"><rect x="1" y="1" width="6" height="6"/><rect x="9" y="1" width="6" height="6"/><rect x="1" y="9" width="6" height="6"/><rect x="9" y="9" width="6" height="6"/></svg></button>
        <button aria-label="list"><svg viewBox="0 0 16 16"><path d="M2 4h12M2 8h12M2 12h12"/></svg></button>
      </div>
    </div>
  )
}
