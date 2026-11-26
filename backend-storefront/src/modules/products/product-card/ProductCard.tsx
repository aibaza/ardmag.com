import Image from 'next/image'
import { Badge, NewProductRibbon, PromoBand } from '@modules/@shared/components/badge'
import { ProductCardSpecTag, type ProductCardSpec } from '@modules/@shared/components/product-card-spec-tag'
import { PromoOfferNote } from '@modules/@shared/components/promo-offer-note'
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
    promoOffer?: { headline: string; detail: string }
    specs?: Array<string | ProductCardSpec>
    defaultVariantId: string | null
    hasMultipleRealVariants: boolean
    defaultVariantSoldOut?: boolean
    contactToOrder?: boolean
    priceUnit?: string
  }
  countryCode: string
  // true pentru cardurile above-the-fold (primul rand din grila): imaginea devine
  // LCP si trebuie descoperita imediat, nu lazy (LCP 5,6s -> resource load delay 3,8s)
  imagePriority?: boolean
}

export function ProductCard({ product, countryCode, imagePriority = false }: ProductCardProps) {
  // Reducerea (procentul calculat in adaptor din varianta afisata) devine banderola
  // pe toata latimea imaginii; celelalte insigne raman in colt, sub banderola.
  // Banderola e copil direct al cardului: in grila acopera latimea imaginii (care e si latimea cardului),
  // iar in randurile compacte de pe telefon trece peste tot randul, nu doar peste poza.
  // Sigla marcii nu mai sta peste poza (V2): marca e scrisa sub poza, iar sigla acoperea produsul.
  const promo = product.badges?.find(b => b.type === "promo")
  return (
    <article className={promo ? "pcard has-promo" : "pcard"}>
      {promo && <PromoBand label={promo.label} />}
      <a href={product.href} className="pcard-img-link pcard-img with-real" aria-label="Vezi produs"><Image className="pimg" src={product.image} alt={product.imageAlt} width={400} height={400} sizes="(max-width: 720px) 50vw, (max-width: 1100px) 33vw, 300px" priority={imagePriority} loading={imagePriority ? 'eager' : 'lazy'} /><div className="top-tags">{product.badges?.filter(b => b.type !== "new" && b.type !== "promo").map((b, i) => <Badge key={i} type={b.type} label={b.label} dotVariant={b.dotVariant} />)}</div>{product.badges?.some(b => b.type === "new") && <NewProductRibbon />}</a>
      <div className="pcard-body">
        <a className="pcard-brand" href={product.brandHref}>{product.brand}</a>
        <h4 className="pcard-title"><a href={product.href}>{product.title}</a></h4>
        {product.promoOffer && <PromoOfferNote offer={product.promoOffer} />}
        <div className="pcard-specs">
          {product.specs?.map((s, i) => typeof s === 'string'
            ? <ProductCardSpecTag key={i} label={s} />
            : <ProductCardSpecTag key={i} label={s.label} values={s.values} />)}
        </div>
      </div>
      <div className="pcard-foot">
        <div className={product.price.was ? "pcard-price is-sale" : "pcard-price"}><span className="now"><FormattedPrice value={product.price.now} />{product.priceUnit && <span className="unit"> / {product.priceUnit}</span>}</span>{product.price.was && <span className="was"><FormattedPrice value={product.price.was} /></span>}</div>
        <ProductCardAddButton
          href={product.href}
          defaultVariantId={product.defaultVariantId}
          hasMultipleRealVariants={product.hasMultipleRealVariants}
          soldOut={product.defaultVariantSoldOut === true}
          contactToOrder={product.contactToOrder === true}
          countryCode={countryCode}
        />
      </div>
    </article>
  )
}
