"use client"

interface CheckboxOption {
  label: string
  count?: number
  checked?: boolean
}

interface SwatchOption {
  label: string
  active?: boolean
}

type FilterGroup =
  | { type: 'checkboxes'; title: string; badge?: string; open?: boolean; options: CheckboxOption[] }
  | { type: 'swatches'; title: string; badge?: string; open?: boolean; options: SwatchOption[] }
  | { type: 'price-range'; title: string; badge?: string; open?: boolean; min: number; max: number }

interface HelpCard {
  label: string
  description: string
  phone: string
  hours: string
}

interface FilterSidebarProps {
  groups: FilterGroup[]
  applyCount: number
  helpCard: HelpCard
}

export function FilterSidebar({ groups, applyCount, helpCard }: FilterSidebarProps) {
  return (
    <aside className="filters" id="filters">
      <div className="filter-card">
        {groups.map((group, i) => {
          if (group.type === 'checkboxes') {
            return (
              <details key={i} open={group.open}>
                <summary>{group.title}{group.badge !== undefined && <> <span className="fcount">{group.badge}</span></>}</summary>
                <div className="filter-body">
                  {group.options.map((option, j) => (
                    <label key={j} className="chk"><input type="checkbox" defaultChecked={option.checked} />{option.label}{option.count !== undefined && <span className="cnt">{option.count}</span>}</label>
                  ))}
                </div>
              </details>
            )
          }
          if (group.type === 'swatches') {
            return (
              <details key={i} open={group.open}>
                <summary>{group.title}{group.badge !== undefined && <> <span className="fcount">{group.badge}</span></>}</summary>
                <div className="filter-body"><div className="swatches">
                  {group.options.map((option, j) => (
                    <button key={j} className={`swatch${option.active ? ' on' : ''}`}>{option.label}</button>
                  ))}
                </div></div>
              </details>
            )
          }
          if (group.type === 'price-range') {
            return (
              <details key={i} open={group.open}>
                <summary>{group.title}{group.badge !== undefined && <> <span className="fcount">{group.badge}</span></>}</summary>
                <div className="filter-body">
                  <div className="price-range">
                    <div className="bar"></div>
                    <div className="inputs">
                      <input type="number" placeholder="Min" defaultValue={group.min} />
                      <input type="number" placeholder="Max" defaultValue={group.max} />
                    </div>
                  </div>
                </div>
              </details>
            )
          }
          return null
        })}
        <div className="filter-actions">
          <button className="btn secondary sm">Resetează</button>
          <button className="btn primary sm">Aplică ({applyCount})</button>
        </div>
      </div>

      <div className="filter-card">
        <div style={{ padding: '16px 18px' }}>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-muted)', marginBottom: '8px' }}>{helpCard.label}</div>
          <div style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--stone-700)', marginBottom: '12px' }}>{helpCard.description}</div>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: '14px', fontWeight: 500, color: 'var(--fg)' }}>{helpCard.phone}</div>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)', marginTop: '2px' }}>{helpCard.hours}</div>
        </div>
      </div>
    </aside>
  )
}
