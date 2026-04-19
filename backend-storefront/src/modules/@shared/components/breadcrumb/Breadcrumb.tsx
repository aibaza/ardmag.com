import { Fragment } from 'react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  current: string
}

export function Breadcrumb({ items, current }: BreadcrumbProps) {
  return (
    <nav className="crumbs" aria-label="breadcrumb">
      {items.map((item, i) => (
        <Fragment key={i}>
          <a href={item.href ?? '#'}>{item.label}</a>
          <span className="sep">/</span>
        </Fragment>
      ))}
      <span className="cur">{current}</span>
    </nav>
  )
}
