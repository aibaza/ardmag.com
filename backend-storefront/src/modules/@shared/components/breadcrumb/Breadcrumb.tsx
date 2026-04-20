import { Fragment } from 'react'
import { BreadcrumbListJsonLd } from '@lib/util/json-ld'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface MetaItem {
  prefix?: string
  strong: string
  label?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  current: string
  meta?: MetaItem[]
}

export function Breadcrumb({ items, current, meta }: BreadcrumbProps) {
  return (
    <>
    <BreadcrumbListJsonLd items={items} current={current} />
    <nav className="crumbs" aria-label="breadcrumb">
      {items.map((item, i) => (
        <Fragment key={i}>
          <a href={item.href ?? '#'}>{item.label}</a>
          <span className="sep">/</span>
        </Fragment>
      ))}
      <span className="cur">{current}</span>
      {meta && meta.length > 0 && (
        <span className="crumbs-meta">
          {meta.map((item, i) => (
            <span key={i}>
              {item.prefix
                ? <>{item.prefix}<strong>{item.strong}</strong></>
                : <><strong>{item.strong}</strong>{item.label ? ` ${item.label}` : ''}</>
              }
            </span>
          ))}
        </span>
      )}
    </nav>
    </>
  )
}
