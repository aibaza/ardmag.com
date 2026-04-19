import { listProducts } from "@lib/data/products"
import { extractOptionGroups } from "@lib/util/filter-options"
import { getRegion } from "@lib/data/regions"
import FilterGroup from "./filter-group"

interface CategoryFiltersProps {
  categoryId: string
  countryCode: string
  activeFilters: Record<string, string[]>
  /** Option titles to show first (e.g. ["DIAMETRU", "TIP PIATRĂ"]) */
  priorityOptions?: string[]
}

export default async function CategoryFilters({
  categoryId,
  countryCode,
  activeFilters,
  priorityOptions = ["DIAMETRU", "TIP PIATRĂ"],
}: CategoryFiltersProps) {
  const region = await getRegion(countryCode)
  if (!region) return null

  const { response } = await listProducts({
    queryParams: { category_id: [categoryId], limit: 100, fields: "options.*,options.values.*" },
    regionId: region.id,
  })

  const groups = extractOptionGroups(response.products)
  if (groups.length === 0) return null

  // sort: priority options first, then alphabetical
  const sorted = [...groups].sort((a, b) => {
    const ai = priorityOptions.findIndex(
      (p) => p.toUpperCase() === a.title.toUpperCase()
    )
    const bi = priorityOptions.findIndex(
      (p) => p.toUpperCase() === b.title.toUpperCase()
    )
    if (ai !== -1 && bi !== -1) return ai - bi
    if (ai !== -1) return -1
    if (bi !== -1) return 1
    return a.title.localeCompare(b.title, "ro")
  })

  const totalActive = Object.values(activeFilters).flat().length

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "16px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--f-mono)",
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--stone-500)",
          }}
        >
          Filtre
          {totalActive > 0 && (
            <span
              style={{
                marginLeft: "6px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                background: "var(--brand-500)",
                color: "var(--stone-50)",
                fontSize: "9px",
                fontWeight: 600,
              }}
            >
              {totalActive}
            </span>
          )}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {sorted.map((group) => (
          <FilterGroup
            key={group.key}
            title={group.title}
            optKey={group.key}
            values={group.values}
            selected={activeFilters[group.key] ?? []}
          />
        ))}
      </div>
    </div>
  )
}
