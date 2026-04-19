import { retrieveCart } from "@lib/data/cart"
import { SiteHeader } from "./SiteHeader"

interface SiteHeaderShellProps {
  categoriesHref?: string
  discuriHref?: string
  drawerId?: string
  drawerClosedAttr?: boolean
}

export async function SiteHeaderShell(props: SiteHeaderShellProps) {
  const cart = await retrieveCart().catch(() => null)
  const cartItemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  return <SiteHeader {...props} cartItemCount={cartItemCount} />
}
