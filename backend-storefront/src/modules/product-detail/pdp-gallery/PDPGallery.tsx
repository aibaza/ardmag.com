import { Badge } from '@modules/@shared/components/badge'

type BadgeType = 'promo' | 'new' | 'stock-low' | 'custom'

interface PDPThumb {
  src?: string
  alt?: string
  ariaLabel: string
  active?: boolean
  extraCount?: number
}

interface PDPGalleryProps {
  thumbs: PDPThumb[]
  mainImage: { src: string; alt: string }
  badges: Array<{ type: BadgeType; label: string }>
}

export function PDPGallery({ thumbs, mainImage, badges }: PDPGalleryProps) {
  return (
    <div className="pdp-gallery">

      <div className="pdp-thumbs">
        {thumbs.map((thumb, i) => {
          if (thumb.extraCount !== undefined) {
            return (
              <button key={i} className="pdp-thumb" aria-label={thumb.ariaLabel}>
                <div className="ph" style={{ background: "var(--stone-900)", color: "#fff", letterSpacing: "0.08em" }}>+{thumb.extraCount}</div>
              </button>
            )
          }
          return (
            <button key={i} className={`pdp-thumb with-real${thumb.active ? ' on' : ''}`} aria-label={thumb.ariaLabel}><img src={thumb.src} alt={thumb.alt} /></button>
          )
        })}
      </div>

      <div className="pdp-main-img with-real">
        <img className="main" src={mainImage.src} alt={mainImage.alt} />
        <div className="badges">
          {badges.map((b, i) => <Badge key={i} type={b.type} label={b.label} />)}
        </div>
        <button className="zoom" aria-label="Mărește imaginea">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="5"/><path d="M7 4v6M4 7h6M14 14l-3.5-3.5"/></svg>
        </button>
      </div>

    </div>
  )
}
