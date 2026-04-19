interface PaginationPage {
  label: string
  href: string
  active?: boolean
}

interface PaginationProps {
  prevHref: string
  nextHref: string
  pages: PaginationPage[]
  resultsLabel: string
}

export function Pagination({ prevHref, nextHref, pages, resultsLabel }: PaginationProps) {
  return (
    <>
      <div className="pagination">
        <span className="prev"><a href={prevHref} aria-label="prev">←</a></span>
        {pages.map((p, i) =>
          p.label === '…'
            ? <span key={i} className="dots">…</span>
            : <a key={i} href={p.href} className={p.active ? 'on' : undefined}>{p.label}</a>
        )}
        <a href={nextHref} className="next">→</a>
      </div>
      <div className="results-foot">{resultsLabel}</div>
    </>
  )
}
