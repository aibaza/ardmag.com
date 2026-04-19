import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Checkout | ardmag.com",
}

type Props = {
  children: React.ReactNode
  params: Promise<{ countryCode: string }>
}

export default async function CheckoutLayout({ children, params }: Props) {
  const { countryCode } = await params
  return (
    <>
      <header style={{ borderBottom: '1px solid var(--rule)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg)' }}>
        <a href={`/${countryCode}/cart`} style={{ fontSize: 13, color: 'var(--fg-muted)', fontFamily: 'var(--f-sans)' }}>
          &larr; Inapoi la cos
        </a>
        <a href={`/${countryCode}`} style={{ fontFamily: 'var(--f-sans)', fontWeight: 700, fontSize: 18, textDecoration: 'none', color: 'var(--fg)' }}>
          <span style={{ color: 'var(--brand-600)' }}>a</span>rdmag
        </a>
        <span style={{ width: 120 }} />
      </header>
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        {children}
      </main>
      <footer style={{ borderTop: '1px solid var(--rule)', padding: '16px 24px', textAlign: 'center', fontSize: 12, color: 'var(--fg-muted)', fontFamily: 'var(--f-sans)' }}>
        ardmag.com · Cluj-Napoca · +40 722 155 441 · <a href="https://anpc.ro" target="_blank" rel="noreferrer">ANPC</a>
      </footer>
    </>
  )
}
