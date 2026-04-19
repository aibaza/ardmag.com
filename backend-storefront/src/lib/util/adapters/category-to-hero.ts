import type { HttpTypes } from "@medusajs/types"

interface CategoryHeroProps {
  eyebrow: string
  title: string
  description: string
  meta: string[]
}

/**
 * Converts a StoreProductCategory + product count into CategoryHero props.
 */
export function categoryToHero(
  category: HttpTypes.StoreProductCategory,
  productCount: number
): CategoryHeroProps {
  return {
    eyebrow: "CATEGORIE",
    title: category.name,
    description: category.description ?? "",
    meta: [`${productCount} produse`],
  }
}
