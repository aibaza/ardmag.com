interface QuickCategoryItem {
  href: string
  image: string
  imageAlt: string
  label: string
  count: number
}

interface QuickCategoriesProps {
  items: QuickCategoryItem[]
}

export function QuickCategories({ items }: QuickCategoriesProps) {
  return (
    <div className="quick-cats">
      {items.map((item, i) => (
        <a key={i} className="qc" href={item.href}><div className="real"><img src={item.image} alt={item.imageAlt} /></div><div className="label">{item.label}</div><div className="count">{item.count}</div></a>
      ))}
    </div>
  )
}
