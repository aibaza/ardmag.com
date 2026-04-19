export function imgUrl(src: string, variant: 'card' | 'thumb' = 'card'): string {
  if (!src || src.startsWith('/api/img')) return src
  return `/api/img?src=${encodeURIComponent(src)}&v=${variant}`
}
