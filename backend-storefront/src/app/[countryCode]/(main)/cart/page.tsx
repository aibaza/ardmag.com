import { retrieveCart } from "@lib/data/cart"
import { Metadata } from "next"
import { SiteHeaderShell } from "@modules/layout/site-header"
import { SiteFooter } from "@modules/layout/site-footer"

export const metadata: Metadata = {
  title: "Coș | ardmag.com",
}

type Props = {
  params: Promise<{ countryCode: string }>
}

export default async function CartPage({ params }: Props) {
  const { countryCode } = await params
  const cart = await retrieveCart().catch(() => null)
  const itemCount = cart?.items?.reduce((s, i) => s + i.quantity, 0) ?? 0

  return (
    <>
      <SiteHeaderShell countryCode={countryCode} drawerId="mDrawer" drawerClosedAttr />
      <main className="page-inner" style={{ padding: "48px 24px", maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "var(--f-sans)", fontWeight: 600, marginBottom: 24 }}>Coșul tău</h1>
        {itemCount === 0 ? (
          <p style={{ color: "var(--fg-muted)" }}>Coșul este gol. <a href={`/${countryCode}/categories`}>Continuă cumpărăturile</a></p>
        ) : (
          <p style={{ color: "var(--fg-muted)" }}>{itemCount} {itemCount === 1 ? "produs" : "produse"} în coș — pagina de coș este în curs de implementare.</p>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
