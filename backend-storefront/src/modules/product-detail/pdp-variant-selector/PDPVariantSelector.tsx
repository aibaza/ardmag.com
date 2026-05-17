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
          <div className="label">{group.title}</div>
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
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" clipRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"/>
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
