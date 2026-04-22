import Image from 'next/image'

interface SupplierItem {
  href: string
  image: string
  imageAlt: string
  sub: string
}

interface SupplierStripProps {
  heading: string
  allHref: string
  allLabel: string
  suppliers: SupplierItem[]
}

export function SupplierStrip({ heading, allHref, allLabel, suppliers }: SupplierStripProps) {
  return (
    <div className="supplier-strip">
      <header>
        <h2 className="supplier-strip-heading">{heading}</h2>
        <a href={allHref} style={{fontFamily:"var(--f-mono)",fontSize:"11px",color:"var(--stone-700)",textDecoration:"none",textTransform:"uppercase",letterSpacing:"0.05em"}}>{allLabel}</a>
      </header>
      <div className="supplier-grid">
        {suppliers.map((s, i) => (
          <a key={i} href={s.href} className="slogo with-real" aria-label={`${s.imageAlt} - distribuitor`}><span className="real"><Image src={s.image} alt={s.imageAlt} width={160} height={80} loading="lazy" /></span><span className="sub">{s.sub}</span></a>
        ))}
      </div>
    </div>
  )
}
