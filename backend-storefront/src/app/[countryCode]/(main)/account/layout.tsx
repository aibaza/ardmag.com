import { retrieveCustomer } from "@lib/data/customer"
import { AccountChrome } from "@modules/account/templates/AccountChrome"
import { SiteHeaderShell } from "@modules/layout/site-header/SiteHeaderShell"
import { SiteFooter } from "@modules/layout/site-footer"

type Props = {
  params: Promise<{ countryCode: string }>
  dashboard: React.ReactNode
  login: React.ReactNode
}

export default async function AccountLayout({ params, dashboard, login }: Props) {
  const { countryCode } = await params
  const customer = await retrieveCustomer()

  if (!customer) {
    return (
      <>
        <SiteHeaderShell countryCode={countryCode} drawerId="acctDrawer" drawerClosedAttr />
        <main className="page-inner">
          {login}
        </main>
        <SiteFooter />
      </>
    )
  }

  return (
    <AccountChrome countryCode={countryCode}>
      {dashboard}
    </AccountChrome>
  )
}
