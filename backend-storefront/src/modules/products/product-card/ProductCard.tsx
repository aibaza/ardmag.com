import { Badge } from '@modules/@shared/components/badge'
import { ProductCardSpecTag } from '@modules/@shared/components/product-card-spec-tag'
import { ProductCardAddButton } from './ProductCardAddButton'

type BadgeType = 'promo' | 'new' | 'stock-low' | 'custom'

interface ProductCardProps {
  product: {
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
  countryCode: string
}

export function ProductCard({ product, countryCode }: ProductCardProps) {
  return (
    <article className="pcard">
      <a href={product.href} className="pcard-img-link pcard-img with-real" aria-label="Vezi produs"><img className="pimg" src={product.image} alt={product.imageAlt} loading="lazy" /><div className="top-tags">{product.badges?.map((b, i) => <Badge key={i} type={b.type} label={b.label} dotVariant={b.dotVariant} />)}</div></a>
      <div className="pcard-body">
        <a className="pcard-brand" href={product.brandHref}>{product.brand}</a>
        <h4 className="pcard-title"><a href={product.href}>{product.title}</a></h4>
        <div className="pcard-sku">{product.sku}</div>
        {product.specs && (
          <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
            {product.specs.map((s, i) => <ProductCardSpecTag key={i} label={s} />)}
          </div>
        )}
      </div>
      <div className="pcard-foot">
        <div className="pcard-price"><span className="now">{product.price.now}</span>{product.price.was && <span className="was">{product.price.was}</span>}</div>
        <ProductCardAddButton
          href={product.href}
          defaultVariantId={product.defaultVariantId}
          hasMultipleRealVariants={product.hasMultipleRealVariants}
          countryCode={countryCode}
        />
      </div>
    </article>
  )
}
