"use client"

import { usePathname } from "next/navigation"
import { signout } from "@lib/data/customer"

interface AccountSidebarProps {
  countryCode: string
}

const navItems = (countryCode: string) => [
  { label: "Cont", href: `/account` },
  { label: "Comenzile mele", href: `/account/orders` },
  { label: "Profil", href: `/account/profile` },
  { label: "Adrese", href: `/account/addresses` },
]

export function AccountSidebar({ countryCode }: AccountSidebarProps) {
  const pathname = usePathname()
  const items = navItems(countryCode)

  return (
    <aside className="filters">
      <div className="mm-section-label">Contul meu</div>
      <nav className="mm-nav">
        {items.map((item) => {
          const isActive = pathname === item.href
          return (
            <a
              key={item.href}
              href={item.href}
              className={isActive ? "on" : ""}
              aria-current={isActive ? "page" : undefined}
              style={isActive ? { background: "var(--stone-100)", color: "var(--brand-700)", fontWeight: 600 } : undefined}
            >
              {item.label} <span className="chev">›</span>
            </a>
          )
        })}
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
