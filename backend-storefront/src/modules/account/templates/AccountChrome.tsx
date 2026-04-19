import { SiteHeaderShell } from "@modules/layout/site-header/SiteHeaderShell"
import { SiteFooter } from "@modules/layout/site-footer"
import { Breadcrumb } from "@modules/@shared/components/breadcrumb/Breadcrumb"
import { AccountSidebar } from "../components/AccountSidebar"

interface AccountChromeProps {
  children: React.ReactNode
  countryCode: string
}

export function AccountChrome({ children, countryCode }: AccountChromeProps) {
  return (
    <>
      <SiteHeaderShell
        countryCode={countryCode}
        drawerId="acctDrawer"
        drawerClosedAttr
      />
      <main className="page-inner">
        <Breadcrumb
          items={[{ label: "Acasa", href: `/${countryCode}` }]}
          current="Cont"
        />
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 32,
            marginTop: 24,
          }}
        >
          <AccountSidebar countryCode={countryCode} />
          <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
