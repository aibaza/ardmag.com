"use client"

import { useRouter, useSearchParams } from 'next/navigation'

const DEFAULT_SORT = "Relevanță"

// Numarul de produse sta langa titlul paginii, iar lista se incarca la derulare (fara „Pe pagina”).
// Bara apare numai pe desktop; pe telefon sortarea sta langa „Filtre”, in MobileFilterBar.
interface CategoryToolbarProps {
  sortOptions: string[]
  baseUrl?: string
  currentSort?: string
}

export function CategoryToolbar({
  sortOptions,
  baseUrl,
  currentSort = DEFAULT_SORT,
}: CategoryToolbarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function buildUrl(key: string, value: string): string {
    const params = new URLSearchParams(searchParams.toString())
    if (key === "sortBy" && value === DEFAULT_SORT) {
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
    router.replace(buildUrl("sortBy", value))
  }

  const isListView = searchParams.get("view") === "list"

  function handleViewChange(view: "grid" | "list") {
    if (!baseUrl) return
    const params = new URLSearchParams(searchParams.toString())
    if (view === "list") {
      params.set("view", "list")
    } else {
      params.delete("view")
    }
    const qs = params.toString()
    router.replace(qs ? `${baseUrl}?${qs}` : (baseUrl ?? ""))
  }

  return (
    <div className="cat-toolbar">
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
      <div className="view-toggle" role="group" aria-label="Mod afișare produse">
        <button aria-label="grilă" aria-pressed={!isListView} className={!isListView ? "on" : ""} onClick={() => handleViewChange("grid")}><svg viewBox="0 0 16 16"><rect x="1" y="1" width="6" height="6"/><rect x="9" y="1" width="6" height="6"/><rect x="1" y="9" width="6" height="6"/><rect x="9" y="9" width="6" height="6"/></svg></button>
        <button aria-label="listă" aria-pressed={isListView} className={isListView ? "on" : ""} onClick={() => handleViewChange("list")}><svg viewBox="0 0 16 16"><path d="M2 4h12M2 8h12M2 12h12"/></svg></button>
      </div>
    </div>
  )
}
