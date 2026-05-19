import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Checkout | ARDmag.ro",
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
        <a href={`/cart`} style={{ fontSize: 13, color: 'var(--fg-muted)', fontFamily: 'var(--f-sans)' }}>
          &larr; Inapoi la cos
        </a>
        <a href={`/${countryCode}`} className="logo" style={{ textDecoration: 'none' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-transparent.png" alt="ARDmag.ro" className="logo-img" width={200} height={30} />
        </a>
        <span style={{ width: 120 }} />
      </header>
      <main style={{ maxWidth: 1024, margin: '0 auto', padding: '32px 24px', boxSizing: 'border-box', width: '100%' }}>
        {children}
      </main>
      <footer style={{ borderTop: '1px solid var(--rule)', padding: '16px 24px', textAlign: 'center', fontSize: 12, color: 'var(--fg-muted)', fontFamily: 'var(--f-sans)' }}>
        ARDmag.ro · Cluj-Napoca · +40 722 155 441 · <a href="https://anpc.ro" target="_blank" rel="noreferrer">ANPC</a>
      </footer>
    </>
  )
}
