import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Pagina nu a fost găsită",
  robots: { index: false, follow: true },
}

/**
 * Varianta de checkout: layout-ul de checkout are deja antetul si subsolul lui
 * minimale, asa ca aici nu folosim NotFoundView (ar dubla chrome-ul si ar scoate
 * vizitatorul din fluxul de comanda).
 */
export default function NotFound() {
  return (
    <div className="nf-inner" style={{ padding: "32px 0 48px" }}>
      <p className="nf-code">
        <span>Eroare 404</span>
      </p>
      <h1 className="nf-title">Pasul acesta nu există</h1>
      <p className="nf-deck">
        Adresa nu corespunde niciunui pas din comandă. Coșul rămâne neatins.
      </p>
      <div className="nf-actions">
        <Link className="btn primary md" href="/cart">
          Înapoi la coș
        </Link>
        <Link className="btn ghost md" href="/produse">
          Toate produsele
        </Link>
      </div>
    </div>
  )
}
