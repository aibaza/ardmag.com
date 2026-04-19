import { HttpTypes } from "@medusajs/types"
import CategoryCard from "@modules/products/components/category-card"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface CategoryGridProps {
  categories: HttpTypes.StoreProductCategory[]
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const topLevel = categories.filter((c) => !c.parent_category).slice(0, 8)

  return (
    <section style={{ background: "var(--stone-50)", padding: "48px 0" }}>
      <style>{`
        .category-grid { grid-template-columns: repeat(4, 1fr); }
        @media (max-width: 860px) { .category-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 520px) { .category-grid { grid-template-columns: 1fr; } }
      `}</style>
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-baseline justify-between mb-6">
          <h2 style={{ fontSize: "22px", fontWeight: 600, letterSpacing: "-0.015em", margin: 0, color: "var(--fg)" }}>
            Categorii
          </h2>
          <LocalizedClientLink
            href="/store"
            style={{ fontFamily: "var(--f-mono)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--stone-700)", textDecoration: "none" }}
          >
            Toate produsele
          </LocalizedClientLink>
        </div>
        <div
          className="category-grid"
          style={{
            display: "grid",
            gap: "16px",
          }}
        >
          {topLevel.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={{
                id: cat.id,
                name: cat.name,
                handle: cat.handle,
                product_count: cat.products?.length,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
