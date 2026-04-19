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
}

interface ProductGridProps {
  variant: 'mini' | 'cat'
  products: ProductGridItem[]
}

export function ProductGrid({ variant, products }: ProductGridProps) {
  return (
    <div className={variant === 'cat' ? 'cat-grid' : 'mini-grid'}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
