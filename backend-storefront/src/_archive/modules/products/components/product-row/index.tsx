import { HttpTypes } from "@medusajs/types"
import { getStemFromThumbnail } from "@lib/images"
import { getProductPrice } from "@lib/util/get-product-price"
import { isProductOutOfStock, getProductSpecsPreview } from "@lib/util/product"
import ProductImage from "@modules/products/components/product-image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Badge } from "@components/ui/badge"

interface ProductRowProps {
  product: HttpTypes.StoreProduct
}

export default function ProductRow({ product }: ProductRowProps) {
  const stem = getStemFromThumbnail(product.thumbnail)
  const { cheapestPrice } = getProductPrice({ product })
  const outOfStock = isProductOutOfStock(product)

  const specsPreview = getProductSpecsPreview(product, 2)

  const isSale =
    cheapestPrice?.price_type === "sale" ||
    (cheapestPrice?.original_price !== undefined &&
      cheapestPrice.original_price !== cheapestPrice.calculated_price)

  return (
    <div
      className="bg-[var(--surface)] hover:bg-[var(--stone-50)] border border-b-0 border-[var(--rule)] transition-colors duration-150"
      style={{
        display: "grid",
        gridTemplateColumns: "88px 1fr auto",
        gridTemplateRows: "auto auto auto",
        gridTemplateAreas: `"thumb meta price" "thumb title title" "thumb foot foot"`,
        columnGap: "16px",
        rowGap: "6px",
        padding: "14px 16px",
      }}
    >
      {/* Thumb */}
      <div
        style={{ gridArea: "thumb", alignSelf: "center" }}
        className="w-[72px] h-[72px] rounded-[var(--r-sm)] border border-stone-200 overflow-hidden shrink-0"
      >
        {stem ? (
          <ProductImage
            slug={product.handle!}
            stem={stem}
            variant="thumb"
            alt={product.title ?? product.handle ?? ""}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background:
                "repeating-linear-gradient(135deg, var(--stone-100) 0px, var(--stone-100) 12px, var(--stone-50) 12px, var(--stone-50) 24px)",
            }}
          />
        )}
      </div>

      {/* Meta */}
      <div
        style={{ gridArea: "meta" }}
        className="flex items-center gap-2"
      >
        {product.type?.value && (
          <span className="font-mono text-[10px] uppercase text-stone-500">
            {product.type.value}
          </span>
        )}
        {product.variants?.[0]?.sku && (
          <span className="font-mono text-[11px] text-stone-400">
            {product.variants[0].sku}
          </span>
        )}
      </div>

      {/* Price */}
      <div
        style={{ gridArea: "price" }}
        className="flex flex-col items-end"
      >
        {cheapestPrice ? (
          <>
            <span className="font-mono text-[15px] font-medium text-stone-900">
              {cheapestPrice.calculated_price}
            </span>
            {isSale && cheapestPrice.original_price && (
              <span className="font-mono text-[11px] text-stone-400 line-through">
                {cheapestPrice.original_price}
              </span>
            )}
          </>
        ) : (
          <span className="font-mono text-[11px] text-stone-400">
            La cerere
          </span>
        )}
      </div>

      {/* Title */}
      <div style={{ gridArea: "title" }}>
        <LocalizedClientLink href={`/products/${product.handle}`}>
          <h3 className="text-[14px] font-semibold leading-[1.35] tracking-[-0.005em] text-stone-900 hover:text-brand-700 m-0">
            {product.title}
          </h3>
        </LocalizedClientLink>
      </div>

      {/* Foot */}
      <div
        style={{ gridArea: "foot" }}
        className="flex items-center gap-4 flex-wrap"
      >
        {specsPreview?.map((spec, i) => (
          <span key={i} className="font-mono text-[11px] text-stone-600">
            {spec}
          </span>
        ))}
        <Badge variant={outOfStock ? "stock-out" : "stock-in"} dot>
          {outOfStock ? "Stoc epuizat" : "In stoc"}
        </Badge>
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="ml-auto inline-flex items-center h-8 px-3 text-[13px] font-medium rounded-[var(--r-sm)] text-[var(--stone-50)] bg-brand-500 border border-brand-600 hover:bg-brand-600 transition-colors duration-150 whitespace-nowrap"
        >
          Detalii
        </LocalizedClientLink>
      </div>
    </div>
  )
}
