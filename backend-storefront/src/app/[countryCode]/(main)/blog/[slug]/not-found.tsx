import { NotFoundView } from "@modules/layout/not-found"

export default function BlogArticleNotFound() {
  return (
    <NotFoundView
      title="Articolul nu există"
      deck="Articolul căutat nu a fost publicat sau a fost mutat la altă adresă. Ghidurile tehnice publicate sunt toate în blog."
      backHref="/blog"
      backLabel="Înapoi la blog"
    />
  )
}
