import type { HttpTypes } from "@medusajs/types"

export interface CategoryHeroProps {
  eyebrow: string
  title: string
  description: string
  meta: Array<{ prefix?: string; strong: string; label?: string }>
}

export function categoryToHero(
  category: HttpTypes.StoreProductCategory,
  products: HttpTypes.StoreProduct[]
): CategoryHeroProps {
  const brandCount = new Set(
    products.flatMap((p) =>
      (p.tags ?? [])
        .filter((t) => t.value.startsWith("brand:"))
        .map((t) => t.value)
    )
  ).size

  const meta: Array<{ prefix?: string; strong: string; label?: string }> = [
    { strong: String(products.length), label: "SKU" },
    ...(brandCount > 0
      ? [{ strong: String(brandCount), label: brandCount === 1 ? "brand" : "branduri" }]
      : []),
    { prefix: "Stoc ", strong: "Cluj-Napoca" },
  ]

  return {
    eyebrow: `Categorie · ${products.length} produse`,
    title: category.name,
    description: category.description ?? "",
    meta,
  }
}
