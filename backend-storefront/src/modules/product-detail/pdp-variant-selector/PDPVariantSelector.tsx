interface VariantOption {
  label: string
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
  return (
    <>
      {groups.map((group, i) => (
        <div key={i} className="variant-group">
          <div className="label">{group.title} <strong>{group.selectedValue}</strong></div>
          <div className="var-opts">
            {group.options.map((option, j) => {
              const cls = `var-opt${option.active ? ' on' : option.unavailable ? ' off' : ''}`
              return (
                <button key={j} className={cls}>{option.label}{option.discount !== undefined && <> <span style={{ color: "var(--brand-500)", fontSize: "10px", marginLeft: "4px" }}>{option.discount}</span></>}</button>
              )
            })}
          </div>
        </div>
      ))}
    </>
  )
}
