import { Metadata } from "next"
import { NotFoundView } from "@modules/layout/not-found"

export const metadata: Metadata = {
  title: "Pagina nu a fost găsită",
  description: "Adresa accesată nu există pe ARDmag.ro.",
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return <NotFoundView />
}
