import { ReactNode } from 'react'

interface TrustItemProps {
  icon: ReactNode
  title: string
  subtitle: string
}

export function TrustItem({ icon, title, subtitle }: TrustItemProps) {
  return (
    <div className="trust-item">{icon}<div><strong>{title}</strong><span>{subtitle}</span></div></div>
  )
}
