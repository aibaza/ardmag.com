import { Metadata } from "next"
import { NotFoundView } from "@modules/layout/not-found"

export const metadata: Metadata = {
  title: "Coșul nu a putut fi accesat",
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <NotFoundView
      title="Coșul nu a putut fi accesat"
      deck="Sesiunea de coș a expirat sau nu mai există. Produsele adăugate se pot pune din nou în coș din catalog."
      backHref="/produse"
      backLabel="Înapoi la produse"
    />
  )
}
