import { Metadata } from "next"
import { NotFoundView } from "@modules/layout/not-found"

export const metadata: Metadata = {
  title: "Pagina nu a fost găsită",
  description: "Adresa accesată nu există pe ARDmag.ro.",
  robots: { index: false, follow: true },
}

/**
 * 404-ul global: prinde tot ce nu trece prin middleware (fisiere lipsa din
 * /assets, /images si celelalte prefixe excluse in src/middleware.ts).
 */
export default function NotFound() {
  return <NotFoundView />
}
