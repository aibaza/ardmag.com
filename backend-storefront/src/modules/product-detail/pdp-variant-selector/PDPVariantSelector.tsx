"use client"

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

// TODO: VariantOption / VariantGroup are duplicated in adapter, PDPSummary, and here.
// A shared types file (e.g. lib/util/types/variant-selector.ts) would eliminate the duplication.
// Out of scope for this quick task.
interface VariantOption {
  label: string
  variantId: string
  active?: boolean
  unavailable?: boolean
  discount?: string
  contactToOrder?: boolean
}

interface VariantGroup {
  title: string
  selectedValue: string
  options: VariantOption[]
}

interface PDPVariantSelectorProps {
  groups: VariantGroup[]
}

export function PDPVariantSelector({ groups }: PDPVariantSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  function handleSelect(variantId: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("v_id", variantId)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <>
      {groups.map((group, i) => (
        <div key={i} className="variant-group">
          <div className="label">{group.title} <strong>{group.selectedValue}</strong></div>
          <div className="var-opts">
            {group.options.map((option, j) => {
              const cls = `var-opt${option.active ? ' on' : option.unavailable ? ' off' : ''}${option.contactToOrder ? ' contact' : ''}`
              return (
                <button
                  key={j}
                  type="button"
                  className={cls}
                  disabled={option.unavailable}
                  onClick={option.unavailable ? undefined : () => handleSelect(option.variantId)}
                  title={option.contactToOrder ? 'Aceasta dimensiune se comanda telefonic' : undefined}
                >
                  {option.label}{option.discount !== undefined && <> <span style={{ color: "var(--brand-500)", fontSize: "10px", marginLeft: "4px" }}>{option.discount}</span></>}
                  {option.contactToOrder && (
                    <span aria-hidden="true" style={{ marginLeft: 4, display: 'inline-flex', alignItems: 'center' }}>
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3.6 2.5C3 3.7 2.8 4.5 3.5 6.3c1 2.5 2.7 4.2 5.2 5.2 1.8.7 2.6.5 3.8-.1l1.1-.5c.4-.2.5-.7.3-1.1l-1-1.6c-.2-.3-.7-.5-1-.3l-.9.5c-.9-.4-2-1.5-2.4-2.4l.5-.9c.2-.4 0-.8-.3-1l-1.6-1c-.4-.2-.9-.1-1.1.3l-.5 1.1z"/>
                      </svg>
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </>
  )
}
