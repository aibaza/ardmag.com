import { ProductCard } from '@modules/products/product-card'

type BadgeType = 'promo' | 'new' | 'stock-low' | 'custom'

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

interface ProductGridProps {
  variant: 'mini' | 'cat'
  products: ProductGridItem[]
  countryCode: string
  viewMode?: 'grid' | 'list'
  // cate carduri din capul grilei se incarca eager (LCP); 0 = toate lazy.
  // Grila principala a paginii (above the fold) trebuie sa dea 4.
  priorityCount?: number
}

export function ProductGrid({ variant, products, countryCode, viewMode = 'grid', priorityCount = 0 }: ProductGridProps) {
  const cls = variant === 'cat'
    ? `cat-grid${viewMode === 'list' ? ' cat-grid--list' : ''}`
    : 'mini-grid'
  return (
    <div className={cls}>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} countryCode={countryCode} imagePriority={index < priorityCount} />
      ))}
    </div>
  )
}
