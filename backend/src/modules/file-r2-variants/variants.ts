import sharp from "sharp"

const RASTER_RE = /\.(jpe?g|png|webp|gif|tiff?)$/i

export type ImageVariant = {
  suffix: "tiny" | "small" | "large"
  buffer: Buffer
  contentType: "image/jpeg"
}

export async function generateVariants(
  content: string, // base64-encoded
  filename: string
): Promise<ImageVariant[]> {
  if (!RASTER_RE.test(filename)) return []

  const src = Buffer.from(content, "base64")

  // Shared base pipeline: trim whitespace border, flatten transparency to white
  const base = sharp(src)
    .trim({ threshold: 15 })
    .flatten({ background: { r: 255, g: 255, b: 255 } })

  const [tiny, small, large] = await Promise.all([
    base.clone().resize(150, 150, { fit: "contain", background: { r: 255, g: 255, b: 255 } })
      .jpeg({ quality: 80, progressive: true, mozjpeg: true })
      .toBuffer(),
    base.clone().resize(400, 400, { fit: "contain", background: { r: 255, g: 255, b: 255 } })
      .jpeg({ quality: 82, progressive: true, mozjpeg: true })
      .toBuffer(),
    base.clone().resize(1200, undefined, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85, progressive: true, mozjpeg: true })
      .toBuffer(),
  ])

  return [
    { suffix: "tiny", buffer: tiny, contentType: "image/jpeg" },
    { suffix: "small", buffer: small, contentType: "image/jpeg" },
    { suffix: "large", buffer: large, contentType: "image/jpeg" },
  ]
}

export function variantKey(key: string, suffix: string): string {
  return key.replace(/\.(jpe?g|png|webp)$/i, `-${suffix}.$1`)
}

export const VARIANT_SUFFIXES = ["tiny", "small", "large"] as const
