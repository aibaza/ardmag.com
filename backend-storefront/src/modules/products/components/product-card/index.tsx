import { HttpTypes } from "@medusajs/types"
import { getStemFromThumbnail } from "@lib/images"
import { getProductPrice } from "@lib/util/get-product-price"
import ProductImage from "@modules/products/components/product-image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Badge } from "@components/ui/badge"

interface ProductCardProps {
  product: HttpTypes.StoreProduct
}

function isOutOfStock(product: HttpTypes.StoreProduct): boolean {
  if (!product.variants?.length) return false
  return product.variants.every(
    (v: any) => v.manage_inventory && (v.inventory_quantity ?? 0) <= 0
  )
}

export default function ProductCard({ product }: ProductCardProps) {
  const stem = getStemFromThumbnail(product.thumbnail)
  const { cheapestPrice } = getProductPrice({ product })
  const outOfStock = isOutOfStock(product)

  // First 3 option specs: "TIP PIATRA: ANDEZIT · DIAMETRU: 115"
  const specsPreview = product.options
    ?.slice(0, 3)
    .map((opt) => {
      const val = opt.values?.[0]?.value ?? ""
      return `${opt.title.toUpperCase()}: ${val}`
    })
    .join(" · ")

  const isSale =
    cheapestPrice?.price_type === "sale" ||
    (cheapestPrice?.original_price !== undefined &&
      cheapestPrice.original_price !== cheapestPrice.calculated_price)

  return (
    <article
      className="relative flex flex-col bg-white rounded-[var(--r-sm)] border border-stone-200 hover:border-stone-400 hover:shadow-[var(--sh-sm)] transition-[border-color,box-shadow] duration-150"
      style={{ minHeight: 0 }}
    >
      {/* Image area */}
      <div className="aspect-square overflow-hidden bg-stone-100 border-b border-stone-200 rounded-t-[var(--r-sm)]">
        {stem ? (
          <ProductImage
            slug={product.handle!}
            stem={stem}
            variant="card"
            alt={product.title ?? product.handle ?? ""}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background:
                "repeating-linear-gradient(135deg, var(--stone-100) 0px, var(--stone-100) 12px, var(--stone-50) 12px, var(--stone-50) 24px)",
            }}
          >
            <span className="font-mono text-[11px] text-stone-400 px-2 text-center break-all">
              {product.handle}
            </span>
          </div>
        )}
      </div>

      {/* Overlay badges */}
      <div className="absolute top-[10px] left-[10px] right-[10px] flex justify-between pointer-events-none">
        <div className="flex flex-col gap-1">
          {(product.metadata?.ribbon as string | undefined) && (
            <Badge variant="promo">
              {product.metadata!.ribbon as string}
            </Badge>
          )}
          {outOfStock && <Badge variant="stock-out">Stoc epuizat</Badge>}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-[6px] flex-1 px-4 pt-[14px] pb-4">
        {product.type?.value && (
          <span
            className="font-mono text-[10px] uppercase tracking-[0.06em] text-stone-500 font-medium"
          >
            {product.type.value}
          </span>
        )}

        <LocalizedClientLink href={`/products/${product.handle}`}>
          <h3 className="text-[14px] font-semibold leading-[1.35] tracking-[-0.005em] text-stone-900 hover:text-brand-700 no-underline m-0">
            {product.title}
          </h3>
        </LocalizedClientLink>

        {product.variants?.[0]?.sku && (
          <span className="font-mono text-[11px] text-stone-500">
            {product.variants[0].sku}
          </span>
        )}

        {specsPreview && (
          <span className="font-mono text-[11px] text-stone-600">
            {specsPreview}
          </span>
        )}
      </div>

      {/* Foot */}
      <div className="px-4 py-3 mt-auto border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-2 rounded-b-[var(--r-sm)]">
        <div className="flex flex-col">
          {cheapestPrice ? (
            <>
              <span className="font-mono text-[15px] font-medium text-stone-900">
                {cheapestPrice.calculated_price}
              </span>
              {isSale && cheapestPrice.original_price && (
                <span className="font-mono text-[11px] text-stone-500 line-through">
                  {cheapestPrice.original_price}
                </span>
              )}
            </>
          ) : (
            <span className="font-mono text-[11px] text-stone-400">
              Pret la cerere
            </span>
          )}
        </div>

        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="inline-flex items-center h-8 px-3 text-[13px] font-medium rounded-[var(--r-sm)] text-white bg-brand-500 border border-brand-600 hover:bg-brand-600 transition-colors duration-150 whitespace-nowrap"
        >
          {outOfStock ? "Detalii" : "Adauga"}
        </LocalizedClientLink>
      </div>
    </article>
  )
}
