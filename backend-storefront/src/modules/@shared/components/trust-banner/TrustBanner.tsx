import { ReactNode } from 'react'
import { TrustItem } from '@modules/@shared/components/trust-item'

type TrustBannerItem = {
  icon: ReactNode
  title: string
  subtitle: string
}

interface TrustBannerProps {
  variant: 'banner' | 'strip'
  items: TrustBannerItem[]
}

export function TrustBanner({ variant, items }: TrustBannerProps) {
  if (variant === 'banner') {
    return (
      <div className="trust-banner">
        {items.map((item, i) => (
          <div key={i}>{item.icon}<div><strong>{item.title}</strong><span>{item.subtitle}</span></div></div>
        ))}
      </div>
    )
  }
  return (
    <div className="trust-strip">
      {items.map((item, i) => (
        <TrustItem key={i} icon={item.icon} title={item.title} subtitle={item.subtitle} />
      ))}
    </div>
  )
}
