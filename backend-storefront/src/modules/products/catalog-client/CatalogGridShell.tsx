import { ProductCard } from "@modules/products/product-card"

type BadgeType = "promo" | "new" | "stock-low" | "custom"

interface ProductGridItem {
  id: string
  title: string
  sku: string
  brand: string
  brandHref: string
  image: string
  imageAlt: string
  href: string
  price: { now: string; was?: string }
  badges?: Array<{ type: BadgeType; label: string; dotVariant?: boolean }>
  specs?: string[]
  defaultVariantId: string | null
  hasMultipleRealVariants: boolean
}

// Aceeasi forma ca CatalogItem din CatalogClient (doar campul "card" ne intereseaza aici).
interface CatalogGridShellItem {
  card: ProductGridItem
}

interface Props {
  items: CatalogGridShellItem[]
  countryCode: string
  // cate carduri randam static ca fallback (restul apar dupa hidratare via CatalogClient).
  visibleCount?: number
  // cate din cardurile randate primesc imagine eager/priority (LCP).
  priorityCount?: number
}

const DEFAULT_VISIBLE_COUNT = 8
const DEFAULT_PRIORITY_COUNT = 4

// Componenta SERVER (fara "use client"): randeaza primele carduri de produs ca HTML
// static, in acelasi markup de grila ca InfiniteProductGrid (cat-grid + wrapper
// aria-live). Foloseste-o ca fallback al <Suspense> din jurul CatalogClient, ca
// imaginea LCP sa fie deja in HTML-ul prerandat, nu doar dupa hidratare.
export function CatalogGridShell({
  items,
  countryCode,
  visibleCount = DEFAULT_VISIBLE_COUNT,
  priorityCount = DEFAULT_PRIORITY_COUNT,
}: Props) {
  const cards = items.slice(0, visibleCount).map((it) => it.card)

  if (cards.length === 0) {
    return <div style={{ minHeight: 400 }} />
  }

  return (
    <div aria-live="polite">
      <div className="cat-grid">
        {cards.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            countryCode={countryCode}
            imagePriority={index < priorityCount}
          />
        ))}
      </div>
    </div>
  )
}
