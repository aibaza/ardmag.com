import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const CATEGORY_IMAGES: Record<string, string> = {
  "mastici-tenax":         "/images/categories/mastici.webp",
  "solutii-pentru-piatra": "/images/categories/solutii-pentru-piatra.webp",
  "diverse":               "/images/categories/diverse.webp",
  "slefuire-piatra":       "/images/categories/slefuire-piatra.webp",
  "discuri-de-taiere":     "/images/categories/discuri-de-taiere.webp",
  "abrazivi-si-perii":     "/images/categories/abrazivi-si-perii.webp",
  "mese-de-taiat":         "/images/categories/mese-de-taiat.webp",
  "abrazivi-oala":         "/images/categories/abrazivi-oala.webp",
}

interface CategoryCardProps {
  category: {
    id: string
    name: string
    handle: string
    product_count?: number
  }
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const imageSrc = CATEGORY_IMAGES[category.handle]

  return (
    <LocalizedClientLink
      href={`/categories/${category.handle}`}
      className="relative block aspect-square overflow-hidden rounded-[var(--r-sm)] border border-stone-200"
    >
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={category.name}
          fill
          sizes="(max-width: 520px) 100vw, (max-width: 860px) 50vw, 25vw"
          className="object-contain object-center"
          style={{ background: "var(--stone-100)" }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, var(--stone-700) 0%, var(--stone-900) 100%)",
          }}
        />
      )}

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
