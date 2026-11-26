interface SectionHeadProps {
  /** randul mic de deasupra titlului; omis pe homepage (V2) */
  eyebrow?: string
  title: string
  seeAllHref: string
  seeAllLabel?: string
}

export function SectionHead({ eyebrow, title, seeAllHref, seeAllLabel = 'Toate' }: SectionHeadProps) {
  return (
    <div className="sec-head">
      <div>
        {eyebrow && <div className="eyebrow-small">{eyebrow}</div>}
        <h2>{title}</h2>
      </div>
      <a className="see-all" href={seeAllHref}>{seeAllLabel}</a>
    </div>
  )
}
