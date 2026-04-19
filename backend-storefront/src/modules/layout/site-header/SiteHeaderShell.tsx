import { retrieveCart } from "@lib/data/cart"
import { listCategories } from "@lib/data/categories"
import { HttpTypes } from "@medusajs/types"
import { SiteHeader } from "./SiteHeader"

interface SiteHeaderShellProps {
  countryCode: string
  categoriesHref?: string
  discuriHref?: string
  drawerId?: string
  drawerClosedAttr?: boolean
}

export async function SiteHeaderShell(props: SiteHeaderShellProps) {
  const [cart, categories] = await Promise.all([
    retrieveCart().catch(() => null),
    listCategories().catch(() => [] as HttpTypes.StoreProductCategory[]),
  ])
  const cartItemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  const drawerCategories = categories
    .filter((c) => c.handle !== 'pachete-promotionale')
    .map((c) => ({
      name: c.name ?? '',
      handle: c.handle ?? '',
      count: (c as any).products?.length ?? 0,
    }))

  return (
    <SiteHeader
      {...props}
      cartItemCount={cartItemCount}
      categories={drawerCategories}
      countryCode={props.countryCode}
    />
  )
}
