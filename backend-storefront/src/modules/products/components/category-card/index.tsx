import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface CategoryCardProps {
  category: {
    id: string
    name: string
    handle: string
    product_count?: number
  }
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <LocalizedClientLink
      href={`/categories/${category.handle}`}
      className="relative block aspect-square overflow-hidden rounded-[var(--r-sm)] border border-stone-200"
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, var(--stone-700) 0%, var(--stone-900) 100%)",
        }}
      />

      {/* Overlay with text */}
      <div
        className="absolute inset-0 flex flex-col justify-end p-4"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.70) 0%, transparent 50%)",
        }}
      >
        {category.product_count !== undefined && (
          <span
            className="font-mono text-[10px] uppercase tracking-[0.08em] mb-1 text-brand-400"
          >
            {category.product_count} produse
          </span>
        )}
        <h3 className="text-white text-[16px] font-semibold leading-[1.25] tracking-[-0.01em] m-0">
          {category.name}
        </h3>
        <span className="font-mono text-[11px] uppercase tracking-[0.05em] mt-2 text-brand-400">
          Vezi toate &rarr;
        </span>
      </div>
    </LocalizedClientLink>
  )
}
