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
              const cls = `var-opt${option.active ? ' on' : option.unavailable ? ' off' : ''}`
              return (
                <button
                  key={j}
                  type="button"
                  className={cls}
                  disabled={option.unavailable}
                  onClick={option.unavailable ? undefined : () => handleSelect(option.variantId)}
                >
                  {option.label}{option.discount !== undefined && <> <span style={{ color: "var(--brand-500)", fontSize: "10px", marginLeft: "4px" }}>{option.discount}</span></>}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </>
  )
}
