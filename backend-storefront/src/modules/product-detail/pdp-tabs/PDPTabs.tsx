import { ReactNode } from 'react'

interface PDPTab {
  label: string
  active?: boolean
}

interface PDPTabsProps {
  tabs: PDPTab[]
  children: ReactNode
}

export function PDPTabs({ tabs, children }: PDPTabsProps) {
  return (
    <section className="pdp-content">
      <div className="tabs" role="tablist">
        {tabs.map((tab, i) => (
          <button key={i} className={tab.active ? 'on' : undefined}>{tab.label}</button>
        ))}
      </div>
      <div className="tab-panel">
        {children}
      </div>
    </section>
  )
}
