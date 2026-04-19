"use client"

import { useState } from 'react'
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

interface PriceRangeInputsProps {
  absMin: number
  absMax: number
  baseUrl: string
}

function PriceRangeInputs({ absMin, absMax, baseUrl }: PriceRangeInputsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [localMin, setLocalMin] = useState(searchParams.get("priceMin") ?? String(absMin))
  const [localMax, setLocalMax] = useState(searchParams.get("priceMax") ?? String(absMax))

  function buildPriceUrl(minVal: string, maxVal: string): string {
    const params = new URLSearchParams(searchParams.toString())
    const min = parseInt(minVal, 10)
    const max = parseInt(maxVal, 10)
    if (!isNaN(min) && min > absMin) {
      params.set("priceMin", String(min))
    } else {
      params.delete("priceMin")
    }
    if (!isNaN(max) && max < absMax) {
      params.set("priceMax", String(max))
    } else {
      params.delete("priceMax")
    }
    params.delete("page")
    const qs = params.toString()
    return qs ? `${baseUrl}?${qs}` : baseUrl
  }

  return (
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
      <button
        type="button"
        className="btn primary sm"
        style={{ marginTop: '8px', width: '100%' }}
        onClick={() => router.push(buildPriceUrl(localMin, localMax))}
      >
        Aplică preț
      </button>
    </div>
  )
}

interface FilterSidebarProps {
  groups: FilterGroup[]
  applyCount: number
  helpCard: HelpCard
  baseUrl: string
}

export function FilterSidebar({ groups, applyCount, helpCard, baseUrl }: FilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function buildUrl(paramKey: string, value: string, isChecked: boolean): string {
    const params = new URLSearchParams(searchParams.toString())
    const current = (params.get(paramKey) ?? "").split(",").filter(Boolean)
    const next = isChecked
      ? Array.from(new Set([...current, value]))
      : current.filter((v) => v !== value)
    if (next.length === 0) {
      params.delete(paramKey)
    } else {
      params.set(paramKey, next.join(","))
    }
    params.delete("page")
    const qs = params.toString()
    return qs ? `${baseUrl}?${qs}` : baseUrl
  }

  function buildResetUrl(): string {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("brand")
    params.delete("material")
    params.delete("priceMin")
    params.delete("priceMax")
    params.delete("page")
    const qs = params.toString()
    return qs ? `${baseUrl}?${qs}` : baseUrl
  }

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
                    <label key={j} className="chk">
                      <input
                        type="checkbox"
                        checked={!!option.checked}
                        onChange={(e) => router.push(buildUrl(group.paramKey, option.value, e.target.checked))}
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
                  <PriceRangeInputs absMin={group.min} absMax={group.max} baseUrl={baseUrl} />
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
            onClick={() => router.push(buildResetUrl())}
          >
            Resetează
          </button>
          <button type="button" className="btn primary sm">Aplică ({applyCount})</button>
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
