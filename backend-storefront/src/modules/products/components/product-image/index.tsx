type ProductVariant = "thumb" | "card" | "detail" | "hero"

interface ProductImageProps {
  slug: string
  /** Filename stem -- original filename without extension (e.g. "db3b5a_31c4770e784f40dab2c8aae029b99c86") */
  stem: string
  variant: ProductVariant
  alt: string
  priority?: boolean
  /** Use "png" for the 3 images with real transparency (pad-polimaster-hex, disc-de-slefuire-concav, discuri-de-taiere) */
  fallbackExt?: "jpg" | "png"
  className?: string
}

// Which optimized files to include per variant, in ascending width order
const VARIANT_SRCSET: Record<ProductVariant, Array<{ file: string; width: number }>> = {
  thumb:  [{ file: "thumb",     width: 200  }],
  card:   [{ file: "card",      width: 400  }, { file: "detail",    width: 800  }],
  detail: [{ file: "detail",    width: 800  }, { file: "detail-2x", width: 1600 }],
  hero:   [{ file: "hero",      width: 1200 }, { file: "detail-2x", width: 1600 }],
}

const VARIANT_SIZES: Record<ProductVariant, string> = {
  thumb:  "200px",
  card:   "(max-width: 640px) 50vw, 400px",
  detail: "(max-width: 768px) 100vw, 800px",
  hero:   "(max-width: 1200px) 100vw, 1200px",
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"

function variantUrl(slug: string, stem: string, file: string, fmt: string): string {
  return `${BACKEND_URL}/static/images/${slug}/${stem}/${file}.${fmt}`
}

export default function ProductImage({
  slug,
  stem,
  variant,
  alt,
  priority = false,
  fallbackExt = "jpg",
  className,
}: ProductImageProps) {
  const entries = VARIANT_SRCSET[variant]
  const sizes = VARIANT_SIZES[variant]
  const fallbackSrc = variantUrl(slug, stem, entries[0].file, fallbackExt)

  const buildSrcset = (fmt: string) =>
    entries.map(({ file, width }) => `${variantUrl(slug, stem, file, fmt)} ${width}w`).join(", ")

  return (
    <picture>
      <source type="image/avif" srcSet={buildSrcset("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={buildSrcset("webp")} sizes={sizes} />
      {/* img is the fallback for browsers without AVIF/WebP support */}
      <img
        src={fallbackSrc}
        srcSet={buildSrcset(fallbackExt)}
        sizes={sizes}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        className={className}
      />
    </picture>
  )
}
