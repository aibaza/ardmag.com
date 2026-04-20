"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface CheckboxOption {
  label: string
  value: string
  count?: number
  checked?: boolean
}

interface SwatchOption {
  label: string
  active?: boolean
}

type FilterGroup =
  | { type: 'checkboxes'; title: string; paramKey: string; badge?: string; open?: boolean; options: CheckboxOption[] }
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
  baseUrl: string
  isOpen?: boolean
  onClose?: () => void
}

export function FilterSidebar({ groups, applyCount, helpCard, baseUrl, isOpen, onClose }: FilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const priceGroup = groups.find((g): g is Extract<FilterGroup, { type: 'price-range' }> => g.type === 'price-range')
  const absMin = priceGroup?.min ?? 0
  const absMax = priceGroup?.max ?? 9999

  const urlMin = searchParams.get("priceMin")
  const urlMax = searchParams.get("priceMax")

  const [localMin, setLocalMin] = useState(urlMin ?? String(absMin))
  const [localMax, setLocalMax] = useState(urlMax ?? String(absMax))

  // Sync local price state when URL changes (e.g. after reset)
  useEffect(() => {
    setLocalMin(urlMin ?? String(absMin))
    setLocalMax(urlMax ?? String(absMax))
  }, [urlMin, urlMax, absMin, absMax])

  function buildCheckboxUrl(paramKey: string, value: string, isChecked: boolean): string {
    const params = new URLSearchParams(searchParams.toString())
    const current = (params.get(paramKey) ?? "").split(",").filter(Boolean)
    const next = isChecked
      ? Array.from(new Set([...current, value]))
      : current.filter((v) => v !== value)
    if (next.length === 0) params.delete(paramKey)
    else params.set(paramKey, next.join(","))
    params.delete("page")
    const qs = params.toString()
    return qs ? `${baseUrl}?${qs}` : baseUrl
  }

  function buildApplyUrl(): string {
    const params = new URLSearchParams(searchParams.toString())
    if (priceGroup) {
      const min = parseInt(localMin, 10)
      const max = parseInt(localMax, 10)
      if (!isNaN(min) && min > absMin) params.set("priceMin", String(min))
      else params.delete("priceMin")
      if (!isNaN(max) && max < absMax) params.set("priceMax", String(max))
      else params.delete("priceMax")
    }
    params.delete("page")
    const qs = params.toString()
    return qs ? `${baseUrl}?${qs}` : baseUrl
  }

  function handleReset() {
    setLocalMin(String(absMin))
    setLocalMax(String(absMax))
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
    <aside className={`filters${isOpen ? ' open' : ''}`} id="filters">
      {onClose && (
        <button
          type="button"
          className="filter-close"
          aria-label="Inchide filtre"
          onClick={onClose}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--fg)', padding: '4px' }}
        >
          &#x2715;
        </button>
      )}
      <div className="filter-card">
        {groups.map((group, i) => {
          if (group.type === 'checkboxes') {
            return (
              <details key={i} open={group.open}>
                <summary>{group.title}{group.badge !== undefined && <> <span className="fcount">{group.badge}</span></>}</summary>
                <div className="filter-body">
                  {group.options.map((option, j) => (
                    <label key={j} className="chk">
                      <input
                        type="checkbox"
                        checked={!!option.checked}
                        onChange={(e) => router.push(buildCheckboxUrl(group.paramKey, option.value, e.target.checked))}
                      />
                      {option.label}
                      {option.count !== undefined && <span className="cnt">{option.count}</span>}
                    </label>
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
                      <input
                        type="number"
                        placeholder="Min"
                        value={localMin}
                        onChange={(e) => setLocalMin(e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={localMax}
                        onChange={(e) => setLocalMax(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </details>
            )
          }
          return null
        })}
        <div className="filter-actions">
          <button
            type="button"
            className="btn secondary sm"
            onClick={handleReset}
          >
            Resetează
          </button>
          <button
            type="button"
            className="btn primary sm"
            onClick={() => router.push(buildApplyUrl())}
          >
            Aplică ({applyCount})
          </button>
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
