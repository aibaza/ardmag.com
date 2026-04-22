type Variant = "tiny" | "small" | "large" | "original"

export function imageVariant(url: string, variant: Variant): string {
  if (!url || variant === "original") return url
  const match = url.match(/^(.*)\.(jpe?g|png|webp)(\?.*)?$/i)
  if (!match) return url
  const [, base, ext, query = ""] = match
  return `${base}-${variant}.${ext}${query}`
}
