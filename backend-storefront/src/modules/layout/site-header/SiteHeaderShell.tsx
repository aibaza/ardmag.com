import { listCategories } from "@lib/data/categories"
import { retrieveCart } from "@lib/data/cart"
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
  const categories = await listCategories(undefined, { staticCache: true }).catch(
    () => [] as HttpTypes.StoreProductCategory[]
  )

  const drawerCategories = categories
    .filter((c) => c.handle !== 'pachete-promotionale')
    .map((c) => ({
      name: c.name ?? '',
      handle: c.handle ?? '',
      count: (c as any).products?.length ?? 0,
    }))

  const cart = await retrieveCart().catch(() => null)
  const cartItemCount = cart?.items?.reduce((sum, item) => sum + (item.quantity ?? 0), 0) ?? 0

  return (
    <SiteHeader
      {...props}
      cartItemCount={cartItemCount}
      categories={drawerCategories}
      countryCode={props.countryCode}
    />
  )
}
