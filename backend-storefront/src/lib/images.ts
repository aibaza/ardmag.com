// Extracts the stem (filename without extension) from a Medusa product thumbnail URL.
// Thumbnail format: /static/images/{product-handle}/{stem}.{ext}
// Example: /static/images/glaxs-easy/db3b5a_61c2401455c5457db4424736e42b2910.jpg
//          stem = db3b5a_61c2401455c5457db4424736e42b2910
export function getStemFromThumbnail(thumbnail: string | null | undefined): string | null {
  if (!thumbnail) return null
  const match = thumbnail.match(/\/([^/]+)\.(jpg|jpeg|png|webp|avif)$/i)
  return match ? match[1] : null
}
