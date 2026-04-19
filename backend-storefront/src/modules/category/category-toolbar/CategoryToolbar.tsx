interface CategoryToolbarProps {
  count: number
  sortOptions: string[]
  perPageOptions: number[]
}

export function CategoryToolbar({ count, sortOptions, perPageOptions }: CategoryToolbarProps) {
  return (
    <div className="cat-toolbar">
      <div className="count"><strong>{count}</strong> produse</div>
      <div className="spacer"></div>
      <div className="tbl"><label htmlFor="sort">Sortare:</label>
        <select id="sort">
          {sortOptions.map((o, i) => <option key={i}>{o}</option>)}
        </select>
      </div>
      <div className="tbl"><label>Pe pagină:</label>
        <select>{perPageOptions.map((o, i) => <option key={i}>{o}</option>)}</select>
      </div>
      <div className="view-toggle" role="tablist">
        <button className="on" aria-label="grid"><svg viewBox="0 0 16 16"><rect x="1" y="1" width="6" height="6"/><rect x="9" y="1" width="6" height="6"/><rect x="1" y="9" width="6" height="6"/><rect x="9" y="9" width="6" height="6"/></svg></button>
        <button aria-label="list"><svg viewBox="0 0 16 16"><path d="M2 4h12M2 8h12M2 12h12"/></svg></button>
      </div>
    </div>
  )
}
