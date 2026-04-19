interface ActiveFilter {
  label: string
}

interface MobileFilterBarProps {
  activeCount: number
  sortOptions: string[]
  activeFilters: ActiveFilter[]
  onOpenFilters: () => void
}

export function MobileFilterBar({ activeCount, sortOptions, activeFilters, onOpenFilters }: MobileFilterBarProps) {
  return (
    <>
      <div className="mobile-filter-bar">
        <button className="btn secondary md" onClick={onOpenFilters}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h12M4 8h8M6 12h4"/></svg>
          Filtre ({activeCount} active)
        </button>
        <select className="btn secondary md" style={{ appearance: 'auto', padding: '0 12px' }}>
          {sortOptions.map((o, i) => <option key={i}>{o}</option>)}
        </select>
      </div>
      <div className="active-filters">
        <span className="lbl">Filtre active:</span>
        {activeFilters.map((f, i) => (
          <span key={i} className="chip">{f.label} <button className="x" aria-label="șterge">×</button></span>
        ))}
        <button className="chip clear">Șterge tot</button>
      </div>
    </>
  )
}
