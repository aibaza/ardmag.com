import Image from 'next/image'
import { Badge, NewProductRibbon } from '@modules/@shared/components/badge'
import { ProductCardSpecTag } from '@modules/@shared/components/product-card-spec-tag'
import { FormattedPrice } from '@modules/@shared/components/formatted-price'
import { ProductCardAddButton } from './ProductCardAddButton'

type BadgeType = 'promo' | 'new' | 'stock-low' | 'custom'

interface ProductCardProps {
  product: {
    id: string
    title: string
    sku: string
    brand: string
    brandHref: string
    brandLogo?: string
    image: string
    imageAlt: string
    href: string
    price: { now: string; was?: string }
    badges?: Array<{ type: BadgeType; label: string; dotVariant?: boolean }>
    promoNote?: string
    specs?: string[]
    defaultVariantId: string | null
    hasMultipleRealVariants: boolean
  }
  countryCode: string
  // true pentru cardurile above-the-fold (primul rand din grila): imaginea devine
  // LCP si trebuie descoperita imediat, nu lazy (LCP 5,6s -> resource load delay 3,8s)
  imagePriority?: boolean
}

export function ProductCard({ product, countryCode, imagePriority = false }: ProductCardProps) {
  return (
    <article className="pcard">
      <a href={product.href} className="pcard-img-link pcard-img with-real" aria-label="Vezi produs"><Image className="pimg" src={product.image} alt={product.imageAlt} width={400} height={400} sizes="(max-width: 720px) 50vw, (max-width: 1100px) 33vw, 300px" priority={imagePriority} loading={imagePriority ? 'eager' : 'lazy'} /><div className="top-tags">{product.badges?.filter(b => b.type !== "new").map((b, i) => <Badge key={i} type={b.type} label={b.label} dotVariant={b.dotVariant} />)}</div>{product.badges?.some(b => b.type === "new") && <NewProductRibbon />}{product.brandLogo && <img className="pcard-brand-logo" src={product.brandLogo} alt={product.brand} loading="lazy" />}</a>
      <div className="pcard-body">
        <a className="pcard-brand" href={product.brandHref}>{product.brand}</a>
        <h4 className="pcard-title"><a href={product.href}>{product.title}</a></h4>
        {product.promoNote && <p className="tenax-promo-note">{product.promoNote}</p>}
        <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap', minHeight: '28px' }}>
          {product.specs?.map((s, i) => <ProductCardSpecTag key={i} label={s} />)}
        </div>
      </div>
      <div className="pcard-foot">
        <div className="pcard-price"><span className="now"><FormattedPrice value={product.price.now} /></span>{product.price.was && <span className="was"><FormattedPrice value={product.price.was} /></span>}</div>
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
