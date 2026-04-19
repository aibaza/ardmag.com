"use client"

import { useState } from 'react'
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
  const images = thumbs.filter((t) => t.src && t.extraCount === undefined)
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const currentSrc = images[activeIndex]?.src ?? mainImage.src
  const currentAlt = images[activeIndex]?.alt ?? mainImage.alt

  return (
    <>
      <div className="pdp-gallery">

        <div className="pdp-thumbs">
          {images.map((thumb, i) => (
            <button
              key={i}
              className={`pdp-thumb with-real${i === activeIndex ? ' on' : ''}`}
              aria-label={thumb.ariaLabel}
              onClick={() => setActiveIndex(i)}
            >
              <img src={thumb.src} alt={thumb.alt} />
            </button>
          ))}
        </div>

        <div className="pdp-main-img with-real">
          <img className="main" src={currentSrc} alt={currentAlt} />
          <div className="badges">
            {badges.map((b, i) => <Badge key={i} type={b.type} label={b.label} />)}
          </div>
          <button className="zoom" aria-label="Mărește imaginea" onClick={() => setLightboxOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="5"/><path d="M7 4v6M4 7h6M14 14l-3.5-3.5"/></svg>
          </button>
        </div>

      </div>

      {lightboxOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.88)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setLightboxOpen(false)}
        >
          <img
            src={currentSrc}
            alt={currentAlt}
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 4 }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            aria-label="Închide"
            onClick={() => setLightboxOpen(false)}
            style={{
              position: 'absolute', top: 20, right: 20,
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
              width: 40, height: 40, cursor: 'pointer', color: '#fff', fontSize: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >×</button>
        </div>
      )}
    </>
  )
}
