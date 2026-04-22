import type { HttpTypes } from "@medusajs/types"
import { productToBadges } from "./product-to-badges"

type BadgeType = "promo" | "new" | "stock-low" | "custom"

interface PDPThumb {
  src?: string
  alt?: string
  ariaLabel: string
  active?: boolean
  extraCount?: number
}

interface PDPGalleryProps {
  thumbs: PDPThumb[]
  mainImage: { src: string; alt: string }
  badges: Array<{ type: BadgeType; label: string }>
}

const MAX_VISIBLE_THUMBS = 4

function validUrl(url: string | null | undefined): string | null {
  if (!url || !url.startsWith('http')) return null
  return url
}

/**
 * Converts a StoreProduct to PDPGallery props.
 *
 * - Up to 4 thumbs shown. If total > 4, last thumb has extraCount.
 * - mainImage = first image or thumbnail or placeholder.
 * - badges from productToBadges (no dotVariant on PDP).
 */
export function productToPdpGallery(
  product: HttpTypes.StoreProduct
): PDPGalleryProps {
  const images = product.images ?? []
  const allImageUrls: string[] = []

  if (images.length > 0) {
    const sorted = [...images].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
    for (const img of sorted) {
      const u = validUrl(img.url)
      if (u) allImageUrls.push(u)
    }
  }
  if (allImageUrls.length === 0 && validUrl(product.thumbnail)) {
    allImageUrls.push(product.thumbnail!)
  }

  const mainSrc =
    allImageUrls.length > 0
      ? allImageUrls[0]
      : validUrl(product.thumbnail) ?? ''

  const title = product.title ?? ""

  const mainImage = { src: mainSrc, alt: title }

  let thumbs: PDPThumb[]

  if (allImageUrls.length === 0) {
    thumbs = [
      {
        src: '',
        alt: title,
        ariaLabel: "Imagine produs",
        active: true,
      },
    ]
  } else if (allImageUrls.length <= MAX_VISIBLE_THUMBS) {
    thumbs = allImageUrls.map((url, i) => {
      const thumb: PDPThumb = {
        src: url,
        alt: `${title} - imagine ${i + 1}`,
        ariaLabel: `Imaginea ${i + 1}`,
      }
      if (i === 0) thumb.active = true
      return thumb
    })
  } else {
    // Show first MAX_VISIBLE_THUMBS - 1 normally, last has extraCount
    const visible = allImageUrls.slice(0, MAX_VISIBLE_THUMBS - 1)
    const extraCount = allImageUrls.length - (MAX_VISIBLE_THUMBS - 1)

    thumbs = visible.map((url, i) => {
      const thumb: PDPThumb = {
        src: url,
        alt: `${title} - imagine ${i + 1}`,
        ariaLabel: `Imaginea ${i + 1}`,
      }
      if (i === 0) thumb.active = true
      return thumb
    })

    thumbs.push({
      ariaLabel: `Vezi toate imaginile`,
      extraCount,
    })
  }

  // Strip dotVariant for PDP context
  const badges = productToBadges(product).map(({ type, label }) => ({
    type,
    label,
  }))

  return { thumbs, mainImage, badges }
}
