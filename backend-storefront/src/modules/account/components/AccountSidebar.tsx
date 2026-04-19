"use client"

import { usePathname } from "next/navigation"
import { signout } from "@lib/data/customer"

interface AccountSidebarProps {
  countryCode: string
}

const navItems = (countryCode: string) => [
  { label: "Cont", href: `/${countryCode}/account` },
  { label: "Comenzile mele", href: `/${countryCode}/account/orders` },
  { label: "Profil", href: `/${countryCode}/account/profile` },
  { label: "Adrese", href: `/${countryCode}/account/addresses` },
]

export function AccountSidebar({ countryCode }: AccountSidebarProps) {
  const pathname = usePathname()
  const items = navItems(countryCode)

  return (
    <aside style={{ minWidth: 200, marginRight: 32 }}>
      <div className="mm-section-label">Contul meu</div>
      <nav className="mm-nav">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={pathname === item.href ? "on" : ""}
          >
            {item.label} <span className="chev">›</span>
          </a>
        ))}
      </nav>
      <div style={{ marginTop: 16 }}>
        <form action={signout.bind(null, countryCode)}>
          <button type="submit" className="btn ghost sm">
            Deconectare
          </button>
        </form>
      </div>
    </aside>
  )
}
