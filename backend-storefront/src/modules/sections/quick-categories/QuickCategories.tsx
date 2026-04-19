import Image from 'next/image'

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
        <a key={i} className="qc" href={item.href}>
          <div className="real">
            <Image
              src={item.image}
              alt={item.imageAlt}
              width={300}
              height={240}
              sizes="(max-width: 480px) 40vw, (max-width: 900px) 25vw, 180px"
              style={{ objectFit: 'contain', width: '100%', height: '100%' }}
            />
          </div>
          <div className="label">{item.label}</div>
          <div className="count">{item.count}</div>
        </a>
      ))}
    </div>
  )
}
