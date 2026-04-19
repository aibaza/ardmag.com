import type { HttpTypes } from "@medusajs/types"

interface CategoryHeroProps {
  title: string
  description: string
}

export function categoryToHero(
  category: HttpTypes.StoreProductCategory
): CategoryHeroProps {
  return {
    title: category.name,
    description: category.description ?? "",
  }
}
