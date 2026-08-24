import Link from "next/link"
import { listCategories } from "@lib/data/categories"
import { HttpTypes } from "@medusajs/types"
import { formatCategoryTitle } from "@lib/util/category-title"
import { SiteHeaderShell } from "@modules/layout/site-header"
import { SiteFooter } from "@modules/layout/site-footer"

interface NotFoundViewProps {
  countryCode?: string
  /** Titlul mare. Implicit: mesajul generic de pagina inexistenta. */
  title?: string
  /** Explicatia de sub titlu. Implicit: varianta generica. */
  deck?: string
  /** Linkul de "intoarcere" evidentiat, cand contextul are unul mai bun decat prima pagina. */
  backHref?: string
  backLabel?: string
}

/**
 * Ecranul de 404 al magazinului: acelasi antet si subsol ca restul site-ului,
 * plus caile de recuperare pe care le cauta un vizitator ajuns pe o adresa moarta
 * (cautare, categorii, produse, contact).
 *
 * Categoriile vin din acelasi apel cache-uit ca antetul (`staticCache`), cu
 * fallback pe lista goala: un 404 nu are voie sa depinda de disponibilitatea
 * backendului - se degradeaza la varianta fara categorii si atat.
 */
export async function NotFoundView({
  countryCode = "ro",
  title = "Pagina asta nu există",
  deck = "Adresa nu duce nicăieri: linkul e greșit, pagina a fost mutată sau produsul nu mai e în catalog.",
  backHref,
  backLabel,
}: NotFoundViewProps) {
  const categories = await listCategories(undefined, { staticCache: true }).catch(
    () => [] as HttpTypes.StoreProductCategory[]
  )

  const topCategories = categories
    .filter((c) => c.handle && c.handle !== "mese-de-taiat" && !c.parent_category)
    .slice(0, 8)

  return (
    <>
      <SiteHeaderShell countryCode={countryCode} />

      <main className="nf">
        <div className="nf-inner">
          <p className="nf-code">
            <span>Eroare 404</span>
          </p>

          <h1 className="nf-title">{title}</h1>
          <p className="nf-deck">{deck}</p>

          <form className="nf-search" action="/search" method="get" role="search">
            <div className="input-shell md">
              <input
                type="search"
                name="q"
                aria-label="Caută în catalog"
                placeholder="Caută un disc, un mastic, un abraziv sau un cod de produs"
              />
            </div>
            <button type="submit" className="btn primary md">
              Caută
            </button>
          </form>

          <div className="nf-actions">
            {backHref && backLabel ? (
              <Link className="btn secondary md" href={backHref}>
                {backLabel}
              </Link>
            ) : (
              <Link className="btn secondary md" href="/produse">
                Toate produsele
              </Link>
            )}
            <Link className="btn ghost md" href="/promotii">
              Promoții
            </Link>
            <Link className="btn ghost md" href="/blog">
              Ghiduri tehnice
            </Link>
            <Link className="btn ghost md" href="/">
              Prima pagină
            </Link>
          </div>

          {topCategories.length > 0 && (
            <section className="nf-cats">
              <h2 className="nf-cats-label">Categorii</h2>
              <ul className="nf-cat-list">
                {topCategories.map((category) => (
                  <li key={category.id}>
                    <Link href={`/categories/${category.handle}`} className="nf-cat">
                      {formatCategoryTitle(category.name ?? "")}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="nf-help">
            Dacă știi produsul, dar nu-l găsești, sună la{" "}
            <a href="tel:+40722155441">+40 722 155 441</a> sau scrie la{" "}
            <a href="mailto:office@ardmag.ro">office@ardmag.ro</a>. Îți spunem
            dacă îl avem și sub ce denumire.
          </p>
        </div>
      </main>

      <SiteFooter countryCode={countryCode} />
    </>
  )
}
