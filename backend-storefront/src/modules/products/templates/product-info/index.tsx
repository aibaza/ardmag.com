import { HttpTypes } from "@medusajs/types"
import { Heading } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SpecTable from "@modules/products/components/spec-table"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const specRows = [
    ...(product.options ?? [])
      .filter((opt) => opt.title !== "Title")
      .map((opt) => ({
        label: opt.title,
        value: (opt.values ?? []).map((v) => v.value).join(", "),
      })),
    ...(product.type?.value
      ? [{ label: "Tip", value: product.type.value }]
      : []),
    ...(product.weight
      ? [{ label: "Greutate", value: `${product.weight} g` }]
      : []),
  ]

  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4 lg:max-w-[500px] mx-auto">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-medium text-ui-fg-muted hover:text-ui-fg-subtle"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
        <Heading
          level="h2"
          className="text-3xl leading-10 text-ui-fg-base"
          data-testid="product-title"
        >
          {product.title}
        </Heading>

        {product.description && (
          <div
            className="text-medium text-ui-fg-subtle prose prose-sm max-w-none"
            data-testid="product-description"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        )}

        {specRows.length > 0 && (
          <div className="mt-6">
            <SpecTable rows={specRows} title="Specificatii tehnice" />
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductInfo
