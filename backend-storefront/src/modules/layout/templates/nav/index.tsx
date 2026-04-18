import { Suspense } from "react"
import UtilBar from "@modules/layout/components/site-header/util-bar"
import MainBar from "@modules/layout/components/site-header/main-bar"
import CatNav from "@modules/layout/components/site-header/cat-nav"
import CartButton from "@modules/layout/components/cart-button"

export default function Nav() {
  return (
    <header
      className="sticky top-0 inset-x-0 z-50"
      style={{ borderBottom: "1px solid var(--rule)" }}
    >
      <UtilBar />
      <MainBar
        cartButton={
          <Suspense fallback={<span style={{ padding: "8px 12px", fontSize: "14px" }}>Cos (0)</span>}>
            <CartButton />
          </Suspense>
        }
      />
      <Suspense fallback={<div style={{ height: "44px" }} />}>
        <CatNav />
      </Suspense>
    </header>
  )
}
