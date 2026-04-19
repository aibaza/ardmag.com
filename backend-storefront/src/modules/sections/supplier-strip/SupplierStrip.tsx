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
        <h4>{heading}</h4>
        <a href={allHref} style={{fontFamily:"var(--f-mono)",fontSize:"11px",color:"var(--stone-700)",textDecoration:"none",textTransform:"uppercase",letterSpacing:"0.05em"}}>{allLabel}</a>
      </header>
      <div className="supplier-grid">
        {suppliers.map((s, i) => (
          <a key={i} href={s.href} className="slogo with-real" aria-label="Vezi distribuitor"><span className="real"><img src={s.image} alt={s.imageAlt} /></span><span className="sub">{s.sub}</span></a>
        ))}
      </div>
    </div>
  )
}
